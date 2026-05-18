import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { Auth } from '../services/auth';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(Auth);
  const router = inject(Router);

  return next(req).pipe(

    catchError((error: HttpErrorResponse) => {

      // 401: Unauthorized
      if (error.status === 401) {

        const refreshToken = localStorage.getItem('refreshToken');
        const token = localStorage.getItem('token');

        if (!refreshToken || !token) {

          router.navigate(['/login']);
          return throwError(() => error);
        }

        // Trying to refresh token
        return authService.refreshToken({
          token: token,
          refreshToken: refreshToken
        }).pipe(

          switchMap((res: any) => {

            // save new token
            localStorage.setItem('token', res.token);
            localStorage.setItem('refreshToken', res.refreshToken);

            // remaking the original request
            const clonedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.token}`
              }
            });

            return next(clonedReq);
          }),

          catchError(() => {

            // if error fails, then logout
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');

            router.navigate(['/login']);

            return throwError(() => error);
          })
        );
      }

      // 403: Forbidden
      if (error.status === 403) {
        alert('You do not have permission to access this resource.');
      }

      // 500: Server error
      if (error.status >= 500) {
        alert('Server error. Please try again later.');
      }

      return throwError(() => error);
    })
  );
};