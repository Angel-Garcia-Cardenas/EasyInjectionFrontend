// login.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;
  submitError: string | null = null;
  showPassword = false;
  failedAttempts = 0;
  showForgotPasswordButton = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        localStorage.setItem('authToken', token);
        this.router.navigate(['/dashboard']);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  loginWithGoogle(): void {
    window.location.href = `${environment.backendUrl}api/auth/google`;
  }

  onSubmit() {
    this.submitError = null;

    if (this.loginForm.valid) {
      this.isSubmitting = true;

      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;

      this.authService.login(email, password)
        .subscribe({
          next: (res: any) => {
            this.isSubmitting = false;

            // Guardar token y/o usuario en localStorage
            if (res.token) {
              localStorage.setItem('authToken', res.token);
            }
            if (res.user) {
              localStorage.setItem('user', JSON.stringify(res.user));
            }

            // Redirigir al dashboard (o la página principal)
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            this.submitError = err.error?.error || 'Credenciales incorrectas o servidor no disponible.';
            this.isSubmitting = false;
            
            // Show forgot password button after first failed attempt
            this.failedAttempts++;
            if (this.failedAttempts >= 1) {
              this.showForgotPasswordButton = true;
            }
          }
        });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
}
