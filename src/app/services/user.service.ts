import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  _id: string;
  username: string;
  email: string;
  fecha_registro: string;
  ultimo_login: string;
  estado_cuenta: string;
  email_verificado: boolean;
  perfil?: {
    avatarId?: string;
  };
}

export interface SessionItem {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  username: string;
  email: string;
  avatarId?: string;
}

export interface DeleteAccountRequest {
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.backendUrl + 'api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Get user profile
  getProfile(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/user/profile`, {
      headers: this.getHeaders()
    });
  }

  // Update user profile
  updateProfile(profileData: UpdateProfileRequest): Observable<{ message: string; user: User }> {
    return this.http.put<{ message: string; user: User }>(`${this.apiUrl}/user/profile`, profileData, {
      headers: this.getHeaders()
    });
  }

  // Change password
  changePassword(passwordData: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/user/password`, passwordData, {
      headers: this.getHeaders()
    });
  }

  // Logout
  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/user/logout`, {}, {
      headers: this.getHeaders()
    });
  }

  // Get active sessions
  getSessions(): Observable<{ sessions: SessionItem[] }> {
    return this.http.get<{ sessions: SessionItem[] }>(`${this.apiUrl}/user/sessions`, {
      headers: this.getHeaders()
    });
  }

  // Close specific session
  closeSession(sessionId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/user/sessions/${sessionId}`, {
      headers: this.getHeaders()
    });
  }

  // Close all sessions
  closeAllSessions(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/user/sessions`, {
      headers: this.getHeaders()
    });
  }

  // Delete account
  deleteAccount(data: DeleteAccountRequest): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/user/account`, {
      headers: this.getHeaders(),
      body: data
    });
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  // Clear authentication data
  clearAuth(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Clear any HTTP-only cookies by making a logout request
    this.http.post(`${this.apiUrl}/user/logout`, {}, { 
      headers: this.getHeaders(),
      withCredentials: true 
    }).subscribe();
  }
}
