import { Component, inject, signal } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    loginForm: FormGroup;
    errorMessage = signal<string | null>(null);
    showPassword = signal(false);

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
            this.errorMessage.set(error);
            console.error(error);
        }
    }

    togglePasswordVisibility() {
        this.showPassword.set(!this.showPassword());
    }
}