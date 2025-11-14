import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCheckCircle,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-verify-success',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './verify-success.html',
  styleUrls: ['./verify-success.scss']
})
export class VerifySuccessComponent implements OnInit {
  faCheckCircle = faCheckCircle;
  faExclamationCircle = faExclamationCircle;
  verificationStatus: 'verifying' | 'success' | 'error' = 'verifying';
  message: string = '';
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Get token from URL query parameters
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.verifyEmail(token);
      } else {
        this.verificationStatus = 'error';
        this.error = 'Token de verificación no encontrado';
      }
    });
  }

  verifyEmail(token: string) {
    this.http.get(`${environment.backendUrl}api/verify-email/${token}`)
      .subscribe({
        next: (res: any) => {
          this.verificationStatus = 'success';
          this.message = res.message || 'Email verificado exitosamente';
          
          // Clear temporary user data
          localStorage.removeItem('tempUserData');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (err) => {
          this.verificationStatus = 'error';
          this.error = err.error?.error || 'Error al verificar el email';
        }
      });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
