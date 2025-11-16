import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorStatus {
  twoFactorEnabled: boolean;
  hasBackupCodes: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TwoFactorService {
  private apiUrl = environment.backendUrl + 'api/2fa';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Setup 2FA - generates QR code and backup codes
  setup(): Observable<TwoFactorSetup> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<TwoFactorSetup>(`${this.apiUrl}/setup`, {}, { headers });
  }

  // Verify 2FA code during setup
  verify(token: string): Observable<{ message: string; backupCodes: string[] }> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<{ message: string; backupCodes: string[] }>(
      `${this.apiUrl}/verify`,
      { token },
      { headers }
    );
  }

  // Disable 2FA
  disable(password: string): Observable<{ message: string }> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/disable`,
      { password },
      { headers }
    );
  }

  // Get 2FA status
  getStatus(): Observable<TwoFactorStatus> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<TwoFactorStatus>(`${this.apiUrl}/status`, { headers });
  }

  // Verify 2FA token during login (no auth required)
  verifyLogin(email: string, token: string): Observable<{ verified: boolean; token: string; message?: string }> {
    return this.http.post<{ verified: boolean; token: string; message?: string }>(
      `${this.apiUrl}/verify-login`,
      { email, token }
    );
  }
}

