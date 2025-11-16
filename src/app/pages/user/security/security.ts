import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLock, faShieldAlt, faCheckCircle, faDownload, faExclamationTriangle, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { TwoFactorService, TwoFactorSetup } from '../../../services/two-factor.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './security.html',
  styleUrl: './security.scss'
})
export class SecurityComponent implements OnInit {
  // FontAwesome icons
  faLock = faLock;
  faShieldAlt = faShieldAlt;
  faCheckCircle = faCheckCircle;
  faDownload = faDownload;
  faExclamationTriangle = faExclamationTriangle;
  faQrcode = faQrcode;

  // 2FA state
  twoFactorEnabled = false;
  setupInProgress = false;
  qrCodeImage: string | null = null;
  backupCodes: string[] = [];
  showBackupCodes = false;

  // Forms
  changePasswordForm: FormGroup;
  verifyCodeForm: FormGroup;
  disableForm: FormGroup;

  // UI state
  changingPassword = false;
  verifying2FA = false;
  disabling2FA = false;
  
  // Notifications
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  showNotification = false;

  // Modal states
  showChangePasswordModal = false;
  showSetup2FAModal = false;
  showDisable2FAModal = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private twoFactorService: TwoFactorService,
    private userService: UserService
  ) {
    // Change password form
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      ]],
      confirmNewPassword: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });

    // Verify 2FA code form
    this.verifyCodeForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    // Disable 2FA form
    this.disableForm = this.fb.group({
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.load2FAStatus();
  }

  load2FAStatus(): void {
    this.twoFactorService.getStatus().subscribe({
      next: (status) => {
        this.twoFactorEnabled = status.twoFactorEnabled;
      },
      error: (error) => {
        console.error('Error loading 2FA status:', error);
      }
    });
  }

  passwordsMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmNewPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  // =========================
  // Change Password
  // =========================
  openChangePasswordModal() {
    this.showChangePasswordModal = true;
    this.changePasswordForm.reset();
  }

  closeChangePasswordModal() {
    this.showChangePasswordModal = false;
    this.changePasswordForm.reset();
  }

  changePassword() {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    this.changingPassword = true;
    const { currentPassword, newPassword } = this.changePasswordForm.value;

    this.userService.changePassword({ currentPassword, newPassword }).subscribe({
      next: (response) => {
        this.showNotificationMessage('Contraseña cambiada exitosamente');
        setTimeout(() => {
          this.closeChangePasswordModal();
        }, 2000);
      },
      error: (error) => {
        this.showNotificationMessage(
          error.error?.error || 'Error al cambiar la contraseña',
          'error'
        );
      },
      complete: () => {
        this.changingPassword = false;
      }
    });
  }

  // =========================
  // 2FA Setup
  // =========================
  start2FASetup() {
    this.setupInProgress = true;
    this.qrCodeImage = null;
    this.backupCodes = [];
    this.showBackupCodes = false;
    
    this.twoFactorService.setup().subscribe({
      next: (response: TwoFactorSetup) => {
        this.qrCodeImage = response.qrCode;
        this.backupCodes = response.backupCodes || [];
        this.showSetup2FAModal = true;
      },
      error: (error) => {
        this.showNotificationMessage(
          error.error?.error || 'Error al configurar 2FA',
          'error'
        );
        this.setupInProgress = false;
      }
    });
  }

  verify2FASetup() {
    if (this.verifyCodeForm.invalid) {
      this.verifyCodeForm.markAllAsTouched();
      return;
    }

    this.verifying2FA = true;
    const code = this.verifyCodeForm.value.code;

    this.twoFactorService.verify(code).subscribe({
      next: (response) => {
        this.twoFactorEnabled = true;
        this.backupCodes = response.backupCodes || [];
        this.showBackupCodes = true;
        this.showNotificationMessage('¡2FA habilitado exitosamente!');
        
        setTimeout(() => {
          this.closeSetup2FAModal();
        }, 5000);
      },
      error: (error) => {
        this.showNotificationMessage(
          error.error?.error || 'Código inválido',
          'error'
        );
      },
      complete: () => {
        this.verifying2FA = false;
      }
    });
  }

  closeSetup2FAModal() {
    this.showSetup2FAModal = false;
    this.setupInProgress = false;
    this.qrCodeImage = null;
    this.showBackupCodes = false;
    this.verifyCodeForm.reset();
  }

  // =========================
  // 2FA Disable
  // =========================
  openDisable2FAModal() {
    this.showDisable2FAModal = true;
    this.disableForm.reset();
  }

  closeDisable2FAModal() {
    this.showDisable2FAModal = false;
    this.disableForm.reset();
  }

  disable2FA() {
    if (this.disableForm.invalid) {
      this.disableForm.markAllAsTouched();
      return;
    }

    this.disabling2FA = true;
    const password = this.disableForm.value.password;

    this.twoFactorService.disable(password).subscribe({
      next: (response) => {
        this.twoFactorEnabled = false;
        this.showNotificationMessage('2FA deshabilitado exitosamente');
        setTimeout(() => {
          this.closeDisable2FAModal();
        }, 2000);
      },
      error: (error) => {
        this.showNotificationMessage(
          error.error?.error || 'Error al deshabilitar 2FA',
          'error'
        );
      },
      complete: () => {
        this.disabling2FA = false;
      }
    });
  }

  // =========================
  // UI Helpers
  // =========================
  showNotificationMessage(message: string, type: 'success' | 'error' = 'success') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    
    setTimeout(() => {
      this.showNotification = false;
    }, 5000);
  }

  hideNotification() {
    this.showNotification = false;
  }

  downloadBackupCodes() {
    const text = this.backupCodes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'easyinjection-backup-codes.txt';
    link.click();
    window.URL.revokeObjectURL(url);
  }
}

