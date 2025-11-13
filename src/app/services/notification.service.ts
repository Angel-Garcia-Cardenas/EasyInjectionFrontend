import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Notification {
  _id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leido: boolean;
  fecha: Date;
  deleting?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  getNotifications(): Observable<Notification[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<Notification[]>(
      `${environment.backendUrl}api/notifications`,
      { headers }
    );
  }

  getUnreadCount(): Observable<number> {
    const headers = this.authService.getAuthHeaders();
    return this.http
      .get<{ count: number }>(
        `${environment.backendUrl}api/notifications/unread-count`,
        { headers }
      )
      .pipe(
        tap((response) => this.unreadCountSubject.next(response.count)),
        map((response) => response.count)
      );
  }

  markAsRead(id: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http
      .put(
        `${environment.backendUrl}api/notifications/${id}/read`,
        {},
        { headers }
      )
      .pipe(
        tap(() => {
          const currentCount = this.unreadCountSubject.value;
          this.unreadCountSubject.next(Math.max(0, currentCount - 1));
        })
      );
  }

  markAllAsRead(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http
      .post(
        `${environment.backendUrl}api/notifications/mark-all-read`,
        {},
        { headers }
      )
      .pipe(tap(() => this.unreadCountSubject.next(0)));
  }

  deleteNotification(id: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete(
      `${environment.backendUrl}api/notifications/${id}`,
      { headers }
    );
  }
}
