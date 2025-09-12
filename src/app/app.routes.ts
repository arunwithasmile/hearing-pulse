import { Routes } from '@angular/router';
import { Home } from './home/home';
import { AddCallComponent } from './add-call/add-call';
import { LoginComponent } from './login/login.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
    { path: '', component: Home, canActivate: [authGuard] },
    { path: 'add-call', component: AddCallComponent, canActivate: [authGuard] },
    { path: 'login', component: LoginComponent },
    // Redirect any other path to home
    { path: '**', redirectTo: '' }
];
