import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.getCurrentUserValue();
    if (user && allowedRoles.includes(user.role)) {
      return true;
    }

    router.navigate(['/dashboard']);
    return false;
  };
};
