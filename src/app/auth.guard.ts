import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
    const auth: Auth = inject(Auth);
    const router: Router = inject(Router);

    return authState(auth).pipe(
        take(1), // Take the first emission to prevent ongoing subscription
        map(user => {
            return user ? true : router.createUrlTree(['/login']);
        })
    );
};