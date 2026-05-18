import { Component, inject, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private cdr = inject(ChangeDetectorRef);
  errorMessage: string = '';

  registerForm = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit() {

    this.errorMessage = '';
    if (this.registerForm.invalid)
      return;

    this.authService
      .register(this.registerForm.value)
      .subscribe({
        next: response => {
          console.log('SUCCESS', response);
          this.errorMessage = 'User has been created!';
          this.cdr.detectChanges(); 
        },
        error: error => {
          console.error('ERROR', error);
          this.errorMessage = 'Error. User has not been created.';
          this.cdr.detectChanges(); 
        }
      });
  }
}