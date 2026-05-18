import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesar pentru [(ngModel)]
import { AuthService } from '../../services/auth.services'; // Ajustează calea dacă e nevoie
import { LoginRequest } from '../../models/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginData: LoginRequest = { username: '', password: '' };

  constructor(private authService: AuthService) {}

  onLogin() {
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        alert('Login cu succes!');
        console.log('Token primit:', response.token);
        // Aici poți redirecționa către pagina de facturi
      },
      error: (err) => {
        alert('Eroare la login! Verifică consola.');
        console.error(err);
      }
    });
  }
}