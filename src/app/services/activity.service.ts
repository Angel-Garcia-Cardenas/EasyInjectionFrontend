import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Activity {
  _id: string;
  user_id: string;
  type: 'scan_completed' | 'resource_available';
  title: string;
  description: string;
  relatedId?: string;
  date: Date;
  read: boolean;
}

export interface UserStatistics {
  scansPerformed: number;
  vulnerabilitiesDetected: number;
  bestScore: number;
  bestScanAlias: string;
}

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  getActivities(): Observable<Activity[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<Activity[]>(
      `${environment.backendUrl}api/activity`,
      { headers }
    );
  }

  markAsRead(activityId: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put(
      `${environment.backendUrl}api/activity/${activityId}/read`,
      {},
      { headers }
    );
  }

  getUserStatistics(): Observable<UserStatistics> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<UserStatistics>(
      `${environment.backendUrl}api/user/statistics`,
      { headers }
    );
  }

  getActivityIcon(type: string): string {
    switch(type) {
      case 'scan_completed': return 'check_circle';
      case 'resource_available': return 'library_books';
      default: return 'info';
    }
  }

  formatActivityTime(date: Date): string {
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
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    return activity.toLocaleDateString('es-ES');
  }
}

