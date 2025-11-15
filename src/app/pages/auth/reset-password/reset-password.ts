import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess: string | null = null;
  showNewPassword = false;
  showConfirmPassword = false;
  resetToken: string = '';
  tokenInvalid = false;

  passwordStrength: 'weak' | 'medium' | 'strong' = 'weak';
  passwordRequirements = {
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.resetToken = params['token'];
      if (!this.resetToken) {
        this.tokenInvalid = true;
        this.submitError = 'Token de recuperación inválido o expirado.';
      }
    });

    this.resetPasswordForm.get('newPassword')?.valueChanges.subscribe(password => {
      this.checkPasswordStrength(password);
    });
  }

  passwordsMatchValidator(group: AbstractControl) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  checkPasswordStrength(password: string) {
    this.passwordRequirements.minLength = password.length >= 8;
    this.passwordRequirements.hasUpperCase = /[A-Z]/.test(password);
    this.passwordRequirements.hasLowerCase = /[a-z]/.test(password);
    this.passwordRequirements.hasNumber = /\d/.test(password);
    this.passwordRequirements.hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const requirementsMet = Object.values(this.passwordRequirements).filter(Boolean).length;
    if (requirementsMet <= 2) {
      this.passwordStrength = 'weak';
    } else if (requirementsMet <= 4) {
      this.passwordStrength = 'medium';
    } else {
      this.passwordStrength = 'strong';
    }
  }

  togglePasswordVisibility(field: 'new' | 'confirm') {
    if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSubmit() {
    this.submitError = null;
    this.submitSuccess = null;

    if (this.resetPasswordForm.valid && this.resetToken) {
      this.isSubmitting = true;
      const newPassword = this.resetPasswordForm.get('newPassword')?.value;

      this.authService.resetPassword(this.resetToken, newPassword).subscribe({
        next: (res: any) => {
          this.isSubmitting = false;
          this.submitSuccess = 'Tu contraseña ha sido restablecida exitosamente.';
          
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          this.submitError = err.error?.error || 'Error al restablecer la contraseña. El token puede haber expirado.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.resetPasswordForm.markAllAsTouched();
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}

