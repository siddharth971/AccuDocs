import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[] | undefined;

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const currentUser = authService.currentUser();
  if (!currentUser) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (requiredRoles.includes(currentUser.role)) {
    return true;
  }

  // User doesn't have required role, redirect to dashboard
  router.navigate(['/dashboard']);
  return false;
};
