import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faUser,
  faLock,
  faQuestionCircle,
  faMapMarkerAlt,
  faTimes,
  faMobileAlt,
  faTabletAlt,
  faLaptop,
  faExclamationTriangle,
  faShieldAlt,
  faCheckCircle,
  faDownload,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import {
  faChrome,
  faFirefox,
  faSafari,
  faEdge,
  faInternetExplorer
} from '@fortawesome/free-brands-svg-icons';
import { UserService, User } from '../../../services/user.service';
import { SessionService, Session } from '../../../services/session.service';
import { TwoFactorService } from '../../../services/two-factor.service';
import { ScanService } from '../../../services/scan.service';
import { forkJoin } from 'rxjs';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FontAwesomeModule],
  templateUrl: './account.html',
  styleUrl: './account.scss'
})
export class Account implements OnInit {
  faUser = faUser;
  faLock = faLock;
  faQuestionCircle = faQuestionCircle;
  faMapMarkerAlt = faMapMarkerAlt;
  faTimes = faTimes;
  faExclamationTriangle = faExclamationTriangle;
  faShieldAlt = faShieldAlt;
  faCheckCircle = faCheckCircle;
  faDownload = faDownload;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  
  getDeviceIcon(device: string): IconDefinition {
    const deviceLower = device.toLowerCase();
    if (deviceLower.includes('mobile') || deviceLower.includes('android') || deviceLower.includes('iphone')) {
      return faMobileAlt;
    }
    if (deviceLower.includes('tablet') || deviceLower.includes('ipad')) {
      return faTabletAlt;
    }
    return faLaptop;
  }

  getBrowserIcon(browser: string): IconDefinition {
    const browserLower = browser.toLowerCase();
    if (browserLower.includes('chrome')) return faChrome;
    if (browserLower.includes('firefox')) return faFirefox;
    if (browserLower.includes('safari')) return faSafari;
    if (browserLower.includes('edge')) return faEdge;
    if (browserLower.includes('explorer') || browserLower.includes('ie')) return faInternetExplorer;
    return faChrome;
  }
  user: User = {
    _id: '',
    username: '',
    email: '',
    fecha_registro: '',
    ultimo_login: '',
    estado_cuenta: '',
    email_verificado: false,
    perfil: {
      avatarId: 'avatar1'
    }
  };

  sessions: Session[] = [];
  currentSessionToken: string = '';

  availableAvatars = [
    { id: 'avatar1', path: 'avatar1.png', name: 'Avatar 1' },
    { id: 'avatar2', path: 'avatar2.png', name: 'Avatar 2' },
    { id: 'avatar3', path: 'avatar3.png', name: 'Avatar 3' },
    { id: 'avatar4', path: 'avatar4.png', name: 'Avatar 4' },
    { id: 'avatar5', path: 'avatar5.png', name: 'Avatar 5' },
    { id: 'avatar6', path: 'avatar6.png', name: 'Avatar 6' }
  ];

  activeTab: 'info' | 'security' | 'notifications' | 'help' = 'info';

  editing = false;
  saving = false;

  showPasswordModal = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  showEditProfileModal = false;
  activeEditTab: 'username' | 'avatar' = 'username';
  selectedAvatar = 'avatar1';

  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  showNotification = false;

  editProfileMessage = '';
  editProfileMessageType: 'success' | 'error' = 'success';
  showEditProfileMessage = false;
  
  changePasswordMessage = '';
  changePasswordMessageType: 'success' | 'error' = 'success';
  showChangePasswordMessage = false;

  showDeleteAccountModal = false;
  showDeletePassword = false;
  deleteAccountMessage = '';
  deleteAccountMessageType: 'success' | 'error' = 'success';
  showDeleteAccountMessage = false;
  deletingAccount = false;

  twoFactorEnabled = false;
  qrCodeDataUrl = '';
  twoFactorSecret = '';
  backupCodes: string[] = [];
  showSetup2FAModal = false;
  showVerify2FAModal = false;
  showDisable2FAModal = false;
  showBackupCodesModal = false;
  settingUp2FA = false;
  verifying2FA = false;
  disabling2FA = false;
  twoFAMessage = '';
  twoFAMessageType: 'success' | 'error' = 'success';
  showTwoFAMessage = false;
  hasBackupCodes = false;

  editForm: FormGroup;
  changePasswordForm: FormGroup;
  deleteAccountForm: FormGroup;
  verify2FATokenForm: FormGroup;
  disable2FAForm: FormGroup;
  changingPassword = false;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private userService: UserService,
    private sessionService: SessionService,
    private twoFactorService: TwoFactorService,
    private scanService: ScanService,
    private cd: ChangeDetectorRef
  ) {
    this.editForm = this.fb.group({
      username: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9_]+$/)
      ]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      ]],
      confirmNewPassword: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });

    this.deleteAccountForm = this.fb.group({
      password: ['', Validators.required],
      confirmDelete: [false, Validators.requiredTrue]
    });

    this.verify2FATokenForm = this.fb.group({
      token: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    this.disable2FAForm = this.fb.group({
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentSessionToken = localStorage.getItem('token') || '';
    this.loadUserData();
    this.loadSessions();
    this.load2FAStatus();
  }

  loadUserData(): void {
    this.userService.getProfile().subscribe({
      next: (response) => {
        this.user = response.user;
        this.selectedAvatar = this.user.perfil?.avatarId || 'avatar1';
        this.editForm.patchValue({ 
          username: this.user.username, 
          email: this.user.email 
        });
      },
      error: (error) => {
        this.loadMockData();
      }
    });
  }

  loadSessions(): void {
    this.sessionService.getSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
      },
      error: (error) => {
        this.showNotificationMessage('Error al cargar las sesiones', 'error');
      }
    });
  }

  isCurrentSession(session: Session): boolean {
    return session.token === this.currentSessionToken;
  }


  formatLastActivity(date: Date): string {
    return this.sessionService.formatLastActivity(date);
  }

  loadMockData(): void {
    this.user = {
      _id: '1',
      username: 'usuario_ejemplo',
      email: 'usuario@ejemplo.com',
      fecha_registro: '2025-01-15',
      ultimo_login: '2025-05-20 14:30',
      estado_cuenta: 'activo',
      email_verificado: true,
      perfil: {
        avatarId: 'avatar1'
      }
      };
      this.selectedAvatar = this.user.perfil?.avatarId || 'avatar1';
      this.editForm.patchValue({ username: this.user.username, email: this.user.email });
  }

  selectTab(tab: 'info' | 'security' | 'notifications' | 'help') {
    this.activeTab = tab;
  }

  scrollToSection(sectionId: string): void {
    if (sectionId === 'perfil') {
      this.activeTab = 'info';
    }
    
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  navigateToSecurity(): void {
    this.activeTab = 'security';
    
    setTimeout(() => {
      const element = document.getElementById('seguridad');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  downloadHelp(): void {
    this.showNotification = true;
    this.notificationMessage = 'Generando PDF con todos los reportes...';
    this.notificationType = 'success';

    this.scanService.getScans().subscribe({
      next: (scansResponse) => {
        if (!scansResponse.success || scansResponse.scans.length === 0) {
          this.showNotification = true;
          this.notificationMessage = 'No hay escaneos disponibles para generar el reporte';
          this.notificationType = 'error';
          return;
        }

        const reportRequests = scansResponse.scans.map(scan => 
          this.scanService.getScanReport(scan._id)
        );

        forkJoin(reportRequests).subscribe({
          next: (reports) => {
            this.generatePDFReport(reports, scansResponse.scans);
            this.showNotification = true;
            this.notificationMessage = 'PDF generado exitosamente';
            this.notificationType = 'success';
          },
          error: (err) => {
            console.error('Error fetching reports:', err);
            this.showNotification = true;
            this.notificationMessage = 'Error al obtener los reportes: ' + (err.error?.error || 'Error desconocido');
            this.notificationType = 'error';
          }
        });
      },
      error: (err) => {
        console.error('Error fetching scans:', err);
        this.showNotification = true;
        this.notificationMessage = 'Error al obtener los escaneos: ' + (err.error?.error || 'Error desconocido');
        this.notificationType = 'error';
      }
    });
  }

  private generatePDFReport(reports: any[], scans: any[]): void {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    const checkNewPage = (requiredHeight: number) => {
      if (yPosition + requiredHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    const addText = (text: string, fontSize: number, isBold: boolean = false, color: number[] = [0, 0, 0]) => {
      pdf.setFontSize(fontSize);
      pdf.setTextColor(color[0], color[1], color[2]);
      if (isBold) {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      
      const lines = pdf.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        checkNewPage(fontSize * 0.5);
        pdf.text(line, margin, yPosition);
        yPosition += fontSize * 0.5;
      });
    };

    addText('Reporte Completo de Escaneos - EasyInjection', 20, true, [233, 30, 99]);
    yPosition += 10;

    addText(`Usuario: ${this.user.username}`, 12);
    addText(`Email: ${this.user.email}`, 12);
    addText(`Fecha de generación: ${new Date().toLocaleString('es-ES')}`, 10, false, [128, 128, 128]);
    yPosition += 10;

    reports.forEach((reportResponse, index) => {
      if (!reportResponse.success || !reportResponse.report) return;

      const report = reportResponse.report;
      const scan = scans[index];

      checkNewPage(50);

      addText(`--- Escaneo ${index + 1}: ${scan.alias || 'Sin alias'} ---`, 16, true, [101, 178, 198]);
      yPosition += 5;

      addText(`URL: ${scan.url}`, 11);
      addText(`Fecha inicio: ${new Date(scan.fecha_inicio).toLocaleString('es-ES')}`, 10);
      if (scan.fecha_fin) {
        addText(`Fecha fin: ${new Date(scan.fecha_fin).toLocaleString('es-ES')}`, 10);
      }
      addText(`Estado: ${scan.estado}`, 10);
      addText(`Tipo: ${scan.flags.xss ? 'XSS ' : ''}${scan.flags.sqli ? 'SQLi' : ''}`, 10);
      yPosition += 5;

      if (report.puntuacion) {
        addText(`Puntuación Final: ${report.puntuacion.puntuacion_final}/100 (${report.puntuacion.calificacion})`, 12, true);
        yPosition += 5;
      }

      if (report.resumen_vulnerabilidades) {
        addText('Resumen de Vulnerabilidades:', 12, true);
        addText(`Total: ${report.resumen_vulnerabilidades.total}`, 10);
        addText(`Crítica: ${report.resumen_vulnerabilidades.por_severidad.critica}`, 10, false, [220, 38, 38]);
        addText(`Alta: ${report.resumen_vulnerabilidades.por_severidad.alta}`, 10, false, [245, 158, 11]);
        addText(`Media: ${report.resumen_vulnerabilidades.por_severidad.media}`, 10, false, [59, 130, 246]);
        addText(`Baja: ${report.resumen_vulnerabilidades.por_severidad.baja}`, 10, false, [16, 185, 129]);
        yPosition += 5;
      }

      if (report.vulnerabilidades && report.vulnerabilidades.length > 0) {
        addText('Vulnerabilidades Detalladas:', 12, true);
        report.vulnerabilidades.forEach((vuln: any, vulnIndex: number) => {
          checkNewPage(40);
          addText(`${vulnIndex + 1}. ${vuln.tipo_id?.nombre || 'Vulnerabilidad'} - ${vuln.nivel_severidad_id?.nombre || 'N/A'}`, 11, true);
          if (vuln.parametro_afectado) {
            addText(`   Endpoint: ${vuln.parametro_afectado}`, 9);
          }
          if (vuln.url_afectada) {
            addText(`   Parámetro: ${vuln.url_afectada}`, 9);
          }
          if (vuln.descripcion) {
            addText(`   Descripción: ${vuln.descripcion}`, 9);
          }
          if (vuln.sugerencia) {
            addText(`   Sugerencia: ${vuln.sugerencia}`, 9);
          }
          yPosition += 3;
        });
        yPosition += 5;
      }

      if (report.cuestionario && report.cuestionario.length > 0) {
        addText('Resultados del Cuestionario:', 12, true);
        const correctAnswers = report.cuestionario.filter((q: any) => q.es_correcta).length;
        addText(`Preguntas: ${report.cuestionario.length} | Correctas: ${correctAnswers} | Incorrectas: ${report.cuestionario.length - correctAnswers}`, 10);
        addText(`Puntuación: ${report.puntuacion?.puntos_cuestionario || 0}/${report.puntuacion?.total_puntos_cuestionario || 0}`, 10);
        yPosition += 5;
      }

      if (index < reports.length - 1) {
        checkNewPage(20);
        yPosition += 10;
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
      }
    });

    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generado por EasyInjection - ${new Date().toLocaleString('es-ES')}`, margin, pageHeight - 10);

    const fileName = `reporte-completo-escaneos-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  }

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
  
  showEditProfileNotification(message: string, type: 'success' | 'error' = 'success') {
    this.editProfileMessage = message;
    this.editProfileMessageType = type;
    this.showEditProfileMessage = true;
    
    setTimeout(() => {
      this.showEditProfileMessage = false;
    }, 5000);
  }

  hideEditProfileNotification() {
    this.showEditProfileMessage = false;
  }

  showChangePasswordNotification(message: string, type: 'success' | 'error' = 'success') {
    this.changePasswordMessage = message;
    this.changePasswordMessageType = type;
    this.showChangePasswordMessage = true;
    
    setTimeout(() => {
      this.showChangePasswordMessage = false;
    }, 5000);
  }

  hideChangePasswordNotification() {
    this.showChangePasswordMessage = false;
  }

  showDeleteAccountNotification(message: string, type: 'success' | 'error' = 'success') {
    this.deleteAccountMessage = message;
    this.deleteAccountMessageType = type;
    this.showDeleteAccountMessage = true;
    
    setTimeout(() => {
      this.showDeleteAccountMessage = false;
    }, 5000);
  }

  hideDeleteAccountNotification() {
    this.showDeleteAccountMessage = false;
  }

  getUsernameErrorMessage(): string {
    const usernameControl = this.editForm.get('username');
    if (!usernameControl?.errors || !usernameControl.touched) {
      return '';
    }

    if (usernameControl.errors['required']) {
      return 'El nombre de usuario es obligatorio';
    }
    if (usernameControl.errors['minlength']) {
      return 'El nombre de usuario debe tener al menos 3 caracteres';
    }
    if (usernameControl.errors['maxlength']) {
      return 'El nombre de usuario no puede tener más de 20 caracteres';
    }
    if (usernameControl.errors['pattern']) {
      return 'El nombre de usuario solo puede contener letras, números y guiones bajos';
    }
    return '';
  }

  enterEditMode() {
    this.editing = true;
    this.editForm.patchValue({
      username: this.user.username,
      email: this.user.email
    });
  }

  cancelEdit() {
    this.editing = false;
    this.editForm.reset({ username: this.user.username, email: this.user.email });
  }

  saveProfile() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    const payload = {
      username: this.editForm.value.username,
      email: this.editForm.value.email,
      avatarId: this.selectedAvatar,
    };

    this.userService.updateProfile(payload).subscribe({
      next: (response) => {
        this.user = response.user;
        this.editing = false;

        this.showEditProfileNotification('Perfil actualizado exitosamente');

        setTimeout(() => {
          this.closeEditProfileModal();
        }, 2000);
      },

      error: (error) => {

        this.saving = false;
        this.showEditProfileNotification(
          'Error al actualizar el perfil: ' + (error.error?.error || 'Error desconocido'),
          'error'
        );
      },

      complete: () => {
        this.saving = false;
      },
    });
  }

  openChangePasswordModal() {
    this.showPasswordModal = true;
    this.showChangePasswordMessage = false;
    this.changePasswordForm.reset();
  }

  closeChangePasswordModal() {
    this.showPasswordModal = false;
    this.changePasswordForm.reset();
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  openEditProfileModal() {
    this.showEditProfileModal = true;
    this.activeEditTab = 'username';
    this.selectedAvatar = this.user.perfil?.avatarId || 'avatar1';
    this.showEditProfileMessage = false;
    this.editForm.patchValue({
      username: this.user.username,
      email: this.user.email
    });
  }

  closeEditProfileModal() {
    this.showEditProfileModal = false;
    this.editForm.reset();
    this.selectedAvatar = 'avatar1';
  }

  setActiveEditTab(tab: 'username' | 'avatar') {
    this.activeEditTab = tab;
  }

  selectAvatar(avatarId: string) {
    this.selectedAvatar = avatarId;
  }

  getAvatarName(avatarId: string): string {
    const avatar = this.availableAvatars.find(a => a.id === avatarId);
    return avatar ? avatar.name : 'Avatar 1';
  }

  getAvatarPath(avatarId: string): string {
    const avatar = this.availableAvatars.find(a => a.id === avatarId);
    return avatar ? avatar.path : 'avatar1.png';
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm') {
    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  passwordsMatchValidator(group: AbstractControl) {
    const a = group.get('newPassword')?.value;
    const b = group.get('confirmNewPassword')?.value;
    return a === b ? null : { passwordMismatch: true };
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
        const message = response.message || 'Contraseña cambiada correctamente';
        const was2FADisabled = message.includes('2FA ha sido deshabilitado');
        
        if (was2FADisabled) {
          this.twoFactorEnabled = false;
          this.backupCodes = [];
          this.hasBackupCodes = false;
          this.cd.detectChanges();
          this.load2FAStatus();
        }
        
        this.changePasswordForm.reset();
        this.showChangePasswordNotification(message);
        
        setTimeout(() => {
          this.closeChangePasswordModal();
        }, 2000);
      },
      error: (error) => {
        this.changingPassword = false;
        this.showChangePasswordNotification('Error al cambiar la contraseña: ' + (error.error?.error || 'Error desconocido'), 'error');
      },
      complete: () => {
        this.changingPassword = false;
      }
    });
  }

  closeSession(sessionId: string) {
    const sessionToClose = this.sessions.find(s => s._id === sessionId);
    const isCurrentSession = sessionToClose ? this.isCurrentSession(sessionToClose) : false;

    const confirmMessage = isCurrentSession 
      ? '¿Estás seguro de que deseas cerrar tu sesión actual? Serás desconectado.' 
      : '¿Estás seguro de que deseas cerrar esta sesión?';

    if (confirm(confirmMessage)) {
      this.sessionService.closeSession(sessionId).subscribe({
        next: (response) => {
          if (isCurrentSession) {
            this.userService.clearAuth();
            this.router.navigate(['/login']);
          } else {
            this.sessions = this.sessions.filter(s => s._id !== sessionId);
            this.showNotificationMessage('Sesión cerrada exitosamente');
          }
        },
        error: (error) => {
          if (isCurrentSession) {
            this.userService.clearAuth();
            this.router.navigate(['/login']);
          } else {
            this.showNotificationMessage('Error al cerrar la sesión: ' + (error.error?.error || 'Error desconocido'), 'error');
          }
        }
      });
    }
  }

  closeAllSessions() {
    if (confirm('¿Estás seguro de que deseas cerrar todas las sesiones? Esto cerrará tu sesión en todos los dispositivos excepto este.')) {
      this.sessionService.closeAllSessions().subscribe({
        next: (response) => {
          this.sessions = this.sessions.filter(s => this.isCurrentSession(s));
          this.showNotificationMessage('Todas las sesiones cerradas exitosamente');
        },
        error: (error) => {
          this.showNotificationMessage('Error al cerrar las sesiones: ' + (error.error?.error || 'Error desconocido'), 'error');
        }
      });
    }
  }

  closeAllSessionsAndLogout() {
    if (confirm('¿Estás seguro de que deseas cerrar todas las sesiones? Esto cerrará tu sesión en todos los dispositivos incluyendo este.')) {
      this.sessionService.closeAllSessions().subscribe({
        next: (response) => {
          this.userService.clearAuth();
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.userService.clearAuth();
          this.router.navigate(['/login']);
        }
      });
    }
  }

  logout() {
    this.userService.logout().subscribe({
      next: (response) => {
        this.userService.clearAuth();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.userService.clearAuth();
        this.router.navigate(['/login']);
      }
    });
  }

  openDeleteAccountModal() {
    this.showDeleteAccountModal = true;
    this.showDeleteAccountMessage = false;
    this.deleteAccountForm.reset();
  }

  closeDeleteAccountModal() {
    this.showDeleteAccountModal = false;
    this.deleteAccountForm.reset();
    this.showDeletePassword = false;
  }

  confirmDeleteAccount() {
    if (this.deleteAccountForm.invalid) {
      this.deleteAccountForm.markAllAsTouched();
      return;
    }

    this.deletingAccount = true;
    const { password } = this.deleteAccountForm.value;

    this.userService.deleteAccount({ password }).subscribe({
      next: (response) => {
        this.showDeleteAccountNotification('Cuenta eliminada exitosamente');
        
        setTimeout(() => {
          this.userService.clearAuth();
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.deletingAccount = false;
        this.showDeleteAccountNotification(
          'Error al eliminar la cuenta: ' + (error.error?.error || 'Contraseña incorrecta'),
          'error'
        );
      },
      complete: () => {
        this.deletingAccount = false;
      }
    });
  }

  load2FAStatus(): void {
    this.twoFactorService.getStatus().subscribe({
      next: (status) => {
        this.twoFactorEnabled = status.twoFactorEnabled;
        this.hasBackupCodes = status.hasBackupCodes;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error loading 2FA status:', err);
      }
    });
  }

  toggle2FA(): void {
    if (this.twoFactorEnabled) {
      this.openDisable2FAModal();
    } else {
      this.openSetup2FAModal();
    }
  }

  openSetup2FAModal(): void {
    this.showSetup2FAModal = true;
    this.settingUp2FA = true;
    this.twoFactorService.setup().pipe(finalize(() => this.settingUp2FA = false)).subscribe({
      next: (res) => {
        this.twoFactorSecret = res.secret;
        this.qrCodeDataUrl = res.qrCode;
        this.backupCodes = res.backupCodes || [];
        this.showVerify2FAModal = true;
        this.showSetup2FAModal = false;
      },
      error: (err) => {
        this.showTwoFANotification('Error al generar QR para 2FA: ' + (err.error?.error || 'Error desconocido'), 'error');
        this.closeSetup2FAModal();
      }
    });
  }

  closeSetup2FAModal(): void {
    this.showSetup2FAModal = false;
    this.twoFactorSecret = '';
    this.qrCodeDataUrl = '';
    this.verify2FATokenForm.reset();
    this.showVerify2FAModal = false;
  }

  verify2FA(): void {
    if (this.verify2FATokenForm.invalid) {
      this.verify2FATokenForm.markAllAsTouched();
      return;
    }
    this.verifying2FA = true;
    const token = this.verify2FATokenForm.get('token')?.value;

    this.twoFactorService.verify(token).pipe(finalize(() => this.verifying2FA = false)).subscribe({
      next: (res) => {
        this.twoFactorEnabled = true;
        this.backupCodes = res.backupCodes || [];
        this.hasBackupCodes = true;
        this.closeSetup2FAModal();
        
        this.cd.detectChanges();
        
        this.openBackupCodesModal();
        
        this.showTwoFANotification(res.message, 'success');
        
        // Reload status to ensure sync
        this.load2FAStatus();
      },
      error: (err) => {
        this.showTwoFANotification('Error al verificar 2FA: ' + (err.error?.error || 'Código inválido'), 'error');
      }
    });
  }

  openDisable2FAModal(): void {
    this.showDisable2FAModal = true;
    this.disable2FAForm.reset();
  }

  closeDisable2FAModal(): void {
    this.showDisable2FAModal = false;
    this.disable2FAForm.reset();
  }

  disable2FA(): void {
    if (this.disable2FAForm.invalid) {
      this.disable2FAForm.markAllAsTouched();
      return;
    }
    this.disabling2FA = true;
    const password = this.disable2FAForm.get('password')?.value;

    this.twoFactorService.disable(password).pipe(finalize(() => this.disabling2FA = false)).subscribe({
      next: (res) => {
        this.twoFactorEnabled = false;
        this.backupCodes = [];
        this.hasBackupCodes = false;
        this.closeDisable2FAModal();
        
        this.cd.detectChanges();
        
        this.showTwoFANotification(res.message, 'success');
        
        this.load2FAStatus();
      },
      error: (err) => {
        this.showTwoFANotification('Error al deshabilitar 2FA: ' + (err.error?.error || 'Contraseña incorrecta'), 'error');
      }
    });
  }

  openBackupCodesModal(): void {
    this.showBackupCodesModal = true;
  }

  closeBackupCodesModal(): void {
    this.showBackupCodesModal = false;
  }

  downloadBackupCodes(): void {
    const codesText = this.backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'easyinjection_backup_codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  showTwoFANotification(message: string, type: 'success' | 'error' = 'success') {
    this.twoFAMessage = message;
    this.twoFAMessageType = type;
    this.showTwoFAMessage = true;
    setTimeout(() => this.showTwoFAMessage = false, 5000);
  }

  hideTwoFANotification() {
    this.showTwoFAMessage = false;
  }
}

