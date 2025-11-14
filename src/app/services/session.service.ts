import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Session {
  _id: string;
  token: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActivity: Date;
}

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  getSessions(): Observable<Session[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<Session[]>(
      `${environment.backendUrl}api/sessions`,
      { headers }
    );
  }

  closeSession(sessionId: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete(
      `${environment.backendUrl}api/sessions/${sessionId}`,
      { headers }
    );
  }

  closeAllSessions(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post(
      `${environment.backendUrl}api/sessions/close-all`,
      {},
      { headers }
    );
  }

  getDeviceIcon(device: string): string {
    const deviceLower = device.toLowerCase();
    if (deviceLower.includes('mobile') || deviceLower.includes('android') || deviceLower.includes('iphone')) {
      return 'mobile-alt';
    }
    if (deviceLower.includes('tablet') || deviceLower.includes('ipad')) {
      return 'tablet-alt';
    }
    return 'laptop';
  }

  getBrowserIcon(browser: string): string {
    const browserLower = browser.toLowerCase();
    if (browserLower.includes('chrome')) return 'chrome';
    if (browserLower.includes('firefox')) return 'firefox';
    if (browserLower.includes('safari')) return 'safari';
    if (browserLower.includes('edge')) return 'edge';
    return 'globe';
  }

  formatLastActivity(date: Date): string {
    const now = new Date();
    const activity = new Date(date);
    const diffMs = now.getTime() - activity.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    return activity.toLocaleDateString('es-ES');
  }
}

