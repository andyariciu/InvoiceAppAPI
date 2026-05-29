import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);

  errorMessage: string | null = null;
  isLoading = false;

  loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit() {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.authService.login(this.loginForm.getRawValue())
      .subscribe({
        next: response => {

          console.log('LOGIN SUCCESS', response);

          localStorage.setItem('token', response.token);;

          this.isLoading = false;
          this.router.navigate(['/invoices']);
        },

        error: err => {

          this.isLoading = false;

          if (err.status === 401) {
            this.errorMessage = 'Invalid username or password';
          } else {
            this.errorMessage = 'Server error. Please try again later.';
          }

          console.error(err);
        }
      });
  }
}