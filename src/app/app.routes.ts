import { Routes } from '@angular/router';
import { Home } from './home/home';
import { AddCallComponent } from './add-call/add-call';

export const routes: Routes = [
    { path: 'home', component: Home },
    { path: '', component: Home },
    { path: 'add-call', component: AddCallComponent }
];
