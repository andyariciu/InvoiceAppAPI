import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  // sending the request and listening to any errors coming from backend
  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      if (error.status === 401) {
        console.warn('Invalid session.');
        
        // Curățăm token-ul local
        localStorage.removeItem('token');
        
        // Îl trimitem cu forța la Login
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};