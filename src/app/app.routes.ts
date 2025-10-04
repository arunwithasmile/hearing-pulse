import { Routes } from '@angular/router';
import { Home } from './home/home';
import { AddCallComponent } from './add-call/add-call';
import { LoginComponent } from './login/login.component';
import { authGuard } from './auth.guard';
import { Khata } from './khata/khata';
import { Clients } from './clients/clients';
import { ClientEdit } from './client-edit/client-edit';
import { AddKhataComponent } from './add-khata/add-khata';
import { KhataEdit } from './khata-edit/khata-edit';

export const routes: Routes = [
    { path: '', component: Home, canActivate: [authGuard] },
    { path: 'add-call', component: AddCallComponent, canActivate: [authGuard] },
    { path: 'khata', component: Khata, canActivate: [authGuard] },
    { path: 'khata/:id', component: KhataEdit, canActivate: [authGuard] },
    { path: 'add-khata', component: AddKhataComponent, canActivate: [authGuard] },
    { path: 'clients', component: Clients, canActivate: [authGuard] },
    { path: 'client/:id', component: ClientEdit, canActivate: [authGuard] },
    { path: 'login', component: LoginComponent },
    // Redirect any other path to home
    { path: '**', redirectTo: '' }
];
