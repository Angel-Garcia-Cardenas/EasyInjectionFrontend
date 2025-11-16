import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faShieldAlt, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { TwoFactorService } from '../../../services/two-factor.service';

@Component({
  selector: 'app-verify-2fa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './verify-2fa.html',
  styleUrl: './verify-2fa.scss'
})
export class Verify2FAComponent implements OnInit {
  // FontAwesome icons
  faShieldAlt = faShieldAlt;
  faLightbulb = faLightbulb;

  verifyForm: FormGroup;
  email: string = '';
  verifying = false;
  errorMessage = '';
  useBackupCode = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private twoFactorService: TwoFactorService
  ) {
    this.verifyForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$|^[A-F0-9]{8}$/)]]
    });
  }

  ngOnInit(): void {
    // Get email from query params
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      if (!this.email) {
        this.router.navigate(['/login']);
      }
    });
  }

  toggleBackupCode(): void {
    this.useBackupCode = !this.useBackupCode;
    this.errorMessage = '';
    this.verifyForm.reset();
    
    // Update validation pattern based on mode
    if (this.useBackupCode) {
      this.verifyForm.get('code')?.setValidators([
        Validators.required,
        Validators.pattern(/^[A-F0-9]{8}$/)
      ]);
    } else {
      this.verifyForm.get('code')?.setValidators([
        Validators.required,
        Validators.pattern(/^\d{6}$/)
      ]);
    }
    this.verifyForm.get('code')?.updateValueAndValidity();
  }

  verify(): void {
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    this.verifying = true;
    this.errorMessage = '';
    const code = this.verifyForm.value.code;

    this.twoFactorService.verifyLogin(this.email, code).subscribe({
      next: (response) => {
        if (response.verified && response.token) {
          // Store token
          localStorage.setItem('authToken', response.token);
          
          // Redirect to dashboard
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Código inválido. Intenta nuevamente.';
        this.verifying = false;
      },
      complete: () => {
        this.verifying = false;
      }
    });
  }

  cancelLogin(): void {
    this.router.navigate(['/login']);
  }
}

