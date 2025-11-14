import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-register-success',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './register-success.html',
  styleUrls: ['./register-success.scss']
})
export class RegisterSuccessComponent implements OnInit {
  faCheckCircle = faCheckCircle;
  userData: any = null;
  email: string = '';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Get user data from localStorage
    const tempUserData = localStorage.getItem('tempUserData');
    if (tempUserData) {
      this.userData = JSON.parse(tempUserData);
      this.email = this.userData.email;
    } else {
      // If no user data, redirect to register
      this.router.navigate(['/register']);
    }
  }

  resendEmail() {
    this.http.post(`${environment.backendUrl}api/verify-email/resend`, { email: this.email })
      .subscribe({
        next: (res: any) => {
          alert('Email de verificación reenviado exitosamente. Revisa tu bandeja de entrada.');
        },
        error: (err) => {
          alert('Error al reenviar el email: ' + (err.error?.error || 'Error desconocido'));
        }
      });
  }

  goToLogin() {
    // Clear temporary data and go to login
    localStorage.removeItem('tempUserData');
    this.router.navigate(['/login']);
  }
}
