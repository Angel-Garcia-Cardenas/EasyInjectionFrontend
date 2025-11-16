import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess: string | null = null;
  showPassword = false;
  showConfirmPassword = false;

  passwordStrength = {
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    score: 0
  };

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordStrengthValidator.bind(this)]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });

    this.registerForm.get('password')?.valueChanges.subscribe(password => {
      this.checkPasswordStrength(password);
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

  loginWithGoogle(): void {
    window.location.href = `${environment.backendUrl}api/auth/google`;
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    
    if (!password) {
      return { required: true };
    }

    const errors: ValidationErrors = {};
    
    if (password.length < 8) {
      errors['minLength'] = true;
    }
    
    if (!/[A-Z]/.test(password)) {
      errors['uppercase'] = true;
    }
    
    if (!/[a-z]/.test(password)) {
      errors['lowercase'] = true;
    }
    
    if (!/\d/.test(password)) {
      errors['number'] = true;
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors['specialChar'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  checkPasswordStrength(password: string): void {
    this.passwordStrength.hasMinLength = password.length >= 8;
    this.passwordStrength.hasUpperCase = /[A-Z]/.test(password);
    this.passwordStrength.hasLowerCase = /[a-z]/.test(password);
    this.passwordStrength.hasNumber = /\d/.test(password);
    this.passwordStrength.hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    this.passwordStrength.score = [
      this.passwordStrength.hasMinLength,
      this.passwordStrength.hasUpperCase,
      this.passwordStrength.hasLowerCase,
      this.passwordStrength.hasNumber,
      this.passwordStrength.hasSpecialChar
    ].filter(Boolean).length;
  }

  getPasswordStrengthLabel(): string {
    if (this.passwordStrength.score === 0) return '';
    if (this.passwordStrength.score <= 2) return 'Débil';
    if (this.passwordStrength.score <= 4) return 'Media';
    return 'Fuerte';
  }

  getPasswordStrengthClass(): string {
    if (this.passwordStrength.score === 0) return '';
    if (this.passwordStrength.score <= 2) return 'weak';
    if (this.passwordStrength.score <= 4) return 'medium';
    return 'strong';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    this.submitError = null;
    this.submitSuccess = null;
    
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      
      const registerData = {
        username: this.registerForm.get('username')?.value,
        email: this.registerForm.get('email')?.value,
        password: this.registerForm.get('password')?.value,
        acceptedTerms: this.registerForm.get('terms')?.value
      };

      this.http.post(`${environment.backendUrl}api/register`, registerData)
        .subscribe({
          next: (res: any) => {
            this.submitSuccess = res.message || 'Usuario registrado exitosamente';
            this.isSubmitting = false;
            
            if (res.user) {
              localStorage.setItem('tempUserData', JSON.stringify(res.user));
            }
            
            setTimeout(() => {
              this.router.navigate(['/register-success']);
            }, 2000);
          },
          error: (err) => {
            this.submitError = err.error?.error || 'No se pudo completar el registro. Intenta más tarde.';
            this.isSubmitting = false;
          }
        });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  goToPage(pageName:string){
    this.router.navigate([`${pageName}`]);
  }
}
