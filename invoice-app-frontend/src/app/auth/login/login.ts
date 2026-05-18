import { Component, inject, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

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
  errorMessage: string = '';
  private cdr = inject(ChangeDetectorRef);

  loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  onSubmit() {

    this.errorMessage = '';
    if (this.loginForm.invalid)
    {
      this.loginForm.markAllAsTouched();
      return;
    }
    
    this.authService
      .login(this.loginForm.value)
      .subscribe({
         next: response => {
          console.log('LOGIN SUCCESS', response);
        },
        error: (err) => {
          // Aici interceptăm eroarea 401
          if (err.status === 401) {
            this.errorMessage = 'Unauthorised access. Please check your credentials.';
          } else {
            this.errorMessage = 'Unauthorised access. Please contact the administrator.';
          }
          this.cdr.detectChanges(); 
          
          console.error(err);
        }
      });
  }
}