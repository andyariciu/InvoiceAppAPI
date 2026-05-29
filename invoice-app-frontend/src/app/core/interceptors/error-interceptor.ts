import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { Auth } from '../services/auth'; // Ajustează calea către serviciul tău de Auth

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const token = localStorage.getItem('token');

  // adding token in the header if it exists
  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // sending the request and tracking errors
  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {

      // ERROR 401: Unauthorised token expired
      if (error.status === 401) {
        
        // no token, redirect to login
        if (!token) {
          router.navigate(['/login']);
          return throwError(() => error);
        }

        // Silent refresh
        return authService.refreshToken().pipe(
          switchMap((res: any) => {
            console.log('Token has been refreshed');

            // Save new token in json
            localStorage.setItem('token', res.token);

            // redo the user's request with new token
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.token}`
              }
            });

            // do the request again
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // forced logout if refresh fails
            console.warn('Session unauthorised.');
            localStorage.removeItem('token');
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }

      // ERROR 403: Forbidden
      if (error.status === 403) {
        alert('Your access is forbidden.');
      }

      // ERROR 500+: Server errors
      if (error.status >= 500) {
        alert('Server error. Try again later.');
      }

      return throwError(() => error);
    })
  );
};