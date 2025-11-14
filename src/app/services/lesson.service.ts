import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LessonProgressResponse {
  success: boolean;
  data: {
    completedLessons: string[];
    completedCount: number;
    lastCompletedAt: Date | null;
    startedLessons: string[];
    startedCount: number;
    hasStartedAny: boolean;
  };
}

export interface LessonCompleteResponse {
  success: boolean;
  data: {
    lessonId: string;
    completed: boolean;
    completedAt: Date;
  };
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private apiUrl = environment.backendUrl + 'api/lessons';
  private completedLessonsSubject = new BehaviorSubject<string[]>([]);
  public completedLessons$ = this.completedLessonsSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Get all completed lessons for the current user
   */
  getProgress(): Observable<LessonProgressResponse> {
    return this.http.get<LessonProgressResponse>(
      `${this.apiUrl}/progress`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.completedLessonsSubject.next(response.data.completedLessons);
        }
      })
    );
  }

  /**
   * Mark a lesson as started (when user visits it)
   */
  markLessonStarted(lessonId: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/progress/${lessonId}/start`,
      {},
      { headers: this.getHeaders() }
    );
  }

  /**
   * Mark a lesson as completed
   */
  markLessonComplete(lessonId: string): Observable<LessonCompleteResponse> {
    return this.http.post<LessonCompleteResponse>(
      `${this.apiUrl}/progress/${lessonId}/complete`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        if (response.success) {
          // Update the local subject with the new completed lesson
          const currentLessons = this.completedLessonsSubject.value;
          if (!currentLessons.includes(lessonId)) {
            this.completedLessonsSubject.next([...currentLessons, lessonId]);
          }
        }
      })
    );
  }

  /**
   * Get the current list of completed lessons (synchronous)
   */
  getCompletedLessonsSync(): string[] {
    return this.completedLessonsSubject.value;
  }

  /**
   * Check if a specific lesson is completed
   */
  isLessonCompleted(lessonId: string): boolean {
    return this.completedLessonsSubject.value.includes(lessonId);
  }
}
