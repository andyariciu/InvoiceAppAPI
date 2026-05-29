import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  //does token exist and have all the required parts
  if (!token || token.split('.').length !== 4) {
    return cleanUpAndRedirect(router);
  }

  try {
    const base64Url = token.split('.')[1];
    
    // replace characters to avoid errors
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // safe decoding
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);

    // check if it has expired (1000 is for difference between browser and server)
    const isExpired = Date.now() >= payload.exp * 1000;

    if (isExpired) {
      return cleanUpAndRedirect(router);
    }

    return true;

  } catch (e) {
    console.error('Auth Guard: Invalid token', e);
    return cleanUpAndRedirect(router);
  }
};

// Funcție helper pentru a evita repetarea codului de curățare (DRY Principle)
const cleanUpAndRedirect = (router: Router): boolean => {
  localStorage.removeItem('token');
  router.navigate(['/login']);
  return false;
};