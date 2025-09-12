import { Component, inject, signal } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ReactiveFormsModule],
    template: `
    <div class="login-container">
      <h1>Pulse</h1>
      <div class="logo">&#9901;</div>
      <form [formGroup]="loginForm" (ngSubmit)="login()">
        <div class="form-field">
          <input formControlName="email" type="email" placeholder="Email" autocomplete="email">
        </div>
        <div class="form-field">
          <input formControlName="password" type="password" placeholder="Password" autocomplete="current-password">
        </div>
        @if(errorMessage()){
          <p class="error-message">{{ errorMessage() }}</p>
        }
        <button type="submit" [disabled]="loginForm.invalid">Sign In</button>
      </form>
    </div>
  `,
    styles: `
    .login-container { text-align: center; padding-top: 30vh; }
    h1 { margin-bottom: 0.5rem; }
    p { margin-bottom: 2rem; color: var(--clr-text-muted); }
    .form-field { margin-bottom: 1rem; }
    input { background-color: white }
    .error-message { color: var(--clr-error); margin-top: -1rem; margin-bottom: 1rem; }
    .logo {font-size: 6rem;
    line-height: 0.5;
    margin-bottom: 2rem;}
  `
})
export class LoginComponent {
    loginForm: FormGroup;
    errorMessage = signal<string | null>(null);

    private auth: Auth = inject(Auth);
    private router: Router = inject(Router);
    private fb: FormBuilder = inject(FormBuilder);

    constructor() {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    async login() {
        if (this.loginForm.invalid) return;
        this.errorMessage.set(null);
        const { email, password } = this.loginForm.value;
        try {
            await signInWithEmailAndPassword(this.auth, email, password);
            this.router.navigate(['/']);
        } catch (error: any) {
            this.errorMessage.set('Invalid email or password. Please try again.');
            console.error(error);
        }
    }
}