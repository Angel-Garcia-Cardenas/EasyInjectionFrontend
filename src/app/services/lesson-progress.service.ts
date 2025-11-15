import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ALL_LESSON_IDS, LESSON_IDS, isValidLessonId } from '../constants/lessons.constants';

// Interfaces
export interface LessonEntry {
  lessonId: string;
  status: 'not_started' | 'viewed' | 'completed';
  firstViewedAt: Date | null;
  lastViewedAt: Date | null;
  completedAt: Date | null;
  viewCount: number;
}

export interface LessonProgress {
  lessons: LessonEntry[];
  lastActivity: Date;
}

export interface ProgressStats {
  viewedLessons: string[];
  completedLessons: string[];
  notStartedLessons: string[];
  viewedCount: number;
  completedCount: number;
  notStartedCount: number;
  totalLessons: number;
  hasStartedAny: boolean;
  lastActivity: Date | null;
}

export interface LessonProgressResponse {
  success: boolean;
  data: LessonProgress;
  message?: string;
}

export interface ProgressStatsResponse {
  success: boolean;
  data: ProgressStats;
  message?: string;
}

export interface LessonActionResponse {
  success: boolean;
  message: string;
  data: {
    lessonId: string;
    status: string;
    firstViewedAt?: Date;
    lastViewedAt?: Date;
    completedAt?: Date;
    viewCount?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LessonProgressService {
  private apiUrl = `${environment.backendUrl}api/lessons`;
  
  // BehaviorSubjects for reactive updates
  private progressSubject = new BehaviorSubject<ProgressStats | null>(null);
  public progress$ = this.progressSubject.asObservable();
  
  private completedLessonsSubject = new BehaviorSubject<string[]>([]);
  public completedLessons$ = this.completedLessonsSubject.asObservable();
  
  private viewedLessonsSubject = new BehaviorSubject<string[]>([]);
  public viewedLessons$ = this.viewedLessonsSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Load complete progress from backend
   */
  loadProgress(): Observable<LessonProgress> {
    return this.http.get<LessonProgressResponse>(
      `${this.apiUrl}/progress`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data),
      tap(data => {
        // Update subjects for reactive components
        const completed = data.lessons
          .filter(l => l.status === 'completed')
          .map(l => l.lessonId);
        const viewed = data.lessons
          .filter(l => l.status === 'viewed' || l.status === 'completed')
          .map(l => l.lessonId);
        
        this.completedLessonsSubject.next(completed);
        this.viewedLessonsSubject.next(viewed);
      }),
      catchError(error => {
        throw error;
      })
    );
  }

  /**
   * Get progress statistics
   * @param lessonIds - Optional array of lesson IDs to filter by
   */
  getProgressStats(lessonIds?: string[]): Observable<ProgressStats> {
    const params: any = {};
    if (lessonIds && lessonIds.length > 0) {
      params.lessonIds = lessonIds.join(',');
    }
    
    return this.http.get<ProgressStatsResponse>(
      `${this.apiUrl}/progress/stats`,
      { headers: this.getHeaders(), params }
    ).pipe(
      map(response => response.data),
      tap(stats => {
        // Update subjects
        this.progressSubject.next(stats);
        this.completedLessonsSubject.next(stats.completedLessons);
        this.viewedLessonsSubject.next(stats.viewedLessons);
      }),
      catchError(error => {
        throw error;
      })
    );
  }

  /**
   * Get progress for a specific category
   */
  getCategoryProgress(categoryKey: 'SECURITY_BASICS' | 'XSS' | 'SQL_INJECTION'): Observable<ProgressStats> {
    const lessonIds = LESSON_IDS[categoryKey];
    return this.getProgressStats(lessonIds);
  }

  /**
   * Get progress for a specific lesson
   */
  getLessonProgress(lessonId: string): Observable<LessonEntry> {
    return this.http.get<{ success: boolean; data: LessonEntry }>(
      `${this.apiUrl}/progress/${lessonId}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        throw error;
      })
    );
  }

  /**
   * Mark a lesson as viewed
   * Automatically called when user opens a lesson
   */
  markLessonViewed(lessonId: string): Observable<LessonActionResponse> {
    return this.http.post<LessonActionResponse>(
      `${this.apiUrl}/progress/${lessonId}/view`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        if (response.success) {
          // Update viewed lessons
          const currentViewed = this.viewedLessonsSubject.value;
          if (!currentViewed.includes(lessonId)) {
            this.viewedLessonsSubject.next([...currentViewed, lessonId]);
          }
          
          // Update progressSubject with new counts
          const currentProgress = this.progressSubject.value;
          if (currentProgress) {
            const updatedViewed = currentViewed.includes(lessonId)
              ? currentViewed
              : [...currentViewed, lessonId];
            
            this.progressSubject.next({
              ...currentProgress,
              viewedLessons: updatedViewed,
              viewedCount: updatedViewed.length,
              notStartedLessons: currentProgress.notStartedLessons.filter(id => id !== lessonId),
              notStartedCount: Math.max(0, currentProgress.notStartedCount - (currentViewed.includes(lessonId) ? 0 : 1)),
              hasStartedAny: true
            });
          }
        }
      }),
      catchError(error => {
        throw error;
      })
    );
  }

  /**
   * Mark a lesson as completed
   * Called when user explicitly completes a lesson
   */
  markLessonCompleted(lessonId: string): Observable<LessonActionResponse> {
    return this.http.post<LessonActionResponse>(
      `${this.apiUrl}/progress/${lessonId}/complete`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        if (response.success) {
          // Update completed lessons
          const currentCompleted = this.completedLessonsSubject.value;
          if (!currentCompleted.includes(lessonId)) {
            this.completedLessonsSubject.next([...currentCompleted, lessonId]);
          }
          
          // Also add to viewed if not already there
          const currentViewed = this.viewedLessonsSubject.value;
          if (!currentViewed.includes(lessonId)) {
            this.viewedLessonsSubject.next([...currentViewed, lessonId]);
          }
          
          // Update progressSubject with new counts
          const currentProgress = this.progressSubject.value;
          if (currentProgress) {
            const updatedCompleted = currentCompleted.includes(lessonId) 
              ? currentCompleted 
              : [...currentCompleted, lessonId];
            const updatedViewed = currentViewed.includes(lessonId)
              ? currentViewed
              : [...currentViewed, lessonId];
            
            this.progressSubject.next({
              ...currentProgress,
              completedLessons: updatedCompleted,
              viewedLessons: updatedViewed,
              completedCount: updatedCompleted.length,
              viewedCount: updatedViewed.length,
              notStartedLessons: currentProgress.notStartedLessons.filter(id => id !== lessonId),
              notStartedCount: Math.max(0, currentProgress.notStartedCount - (currentCompleted.includes(lessonId) ? 0 : 1)),
              hasStartedAny: true
            });
          }
        }
      }),
      catchError(error => {
        throw error;
      })
    );
  }

  /**
   * Reset all progress (for testing/debugging)
   */
  resetProgress(): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/progress/reset`,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        if (response.success) {
          // Clear subjects
          this.progressSubject.next(null);
          this.completedLessonsSubject.next([]);
          this.viewedLessonsSubject.next([]);
        }
      }),
      catchError(error => {
        throw error;
      })
    );
  }

  /**
   * Check if a lesson is completed (synchronous)
   */
  isLessonCompleted(lessonId: string): boolean {
    return this.completedLessonsSubject.value.includes(lessonId);
  }

  /**
   * Check if a lesson is viewed (synchronous)
   */
  isLessonViewed(lessonId: string): boolean {
    return this.viewedLessonsSubject.value.includes(lessonId);
  }

  /**
   * Get current completed lessons (synchronous)
   */
  getCompletedLessonsSync(): string[] {
    return this.completedLessonsSubject.value;
  }

  /**
   * Get current viewed lessons (synchronous)
   */
  getViewedLessonsSync(): string[] {
    return this.viewedLessonsSubject.value;
  }

  /**
   * Get current progress stats (synchronous)
   */
  getProgressStatsSync(): ProgressStats | null {
    return this.progressSubject.value;
  }

  /**
   * Get lesson status
   */
  getLessonStatus(lessonId: string): 'not_started' | 'viewed' | 'completed' {
    if (this.isLessonCompleted(lessonId)) {
      return 'completed';
    }
    if (this.isLessonViewed(lessonId)) {
      return 'viewed';
    }
    return 'not_started';
  }

  /**
   * Get button text for a lesson based on its status
   */
  getLessonButtonText(lessonId: string): string {
    const status = this.getLessonStatus(lessonId);
    
    switch (status) {
      case 'completed':
        return 'Repasar lección';
      case 'viewed':
        return 'Continuar aprendiendo';
      case 'not_started':
      default:
        return 'Comenzar a aprender';
    }
  }

  /**
   * Format time ago
   */
  formatTimeAgo(date: Date | null): string {
    if (!date) return 'Nunca';
    
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    
    return new Date(date).toLocaleDateString('es-ES');
  }

  /**
   * Migrate localStorage data to backend (one-time migration)
   */
  migrateLocalStorageToBackend(): Observable<{ success: boolean; message: string }> {
    try {
      // Check if already migrated
      const migrated = localStorage.getItem('progressMigrated');
      if (migrated === 'true') {
        return new Observable(observer => {
          observer.next({ success: true, message: 'Already migrated' });
          observer.complete();
        });
      }

      // Get old localStorage data
      const viewedLessons = JSON.parse(localStorage.getItem('viewedLessons') || '[]');
      const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');

      if (viewedLessons.length === 0 && completedLessons.length === 0) {
        // No data to migrate
        localStorage.setItem('progressMigrated', 'true');
        return new Observable(observer => {
          observer.next({ success: true, message: 'No data to migrate' });
          observer.complete();
        });
      }

      // Migrate completed lessons first
      const completedRequests = completedLessons.map((lessonId: string) =>
        this.markLessonCompleted(lessonId)
      );

      // Then migrate viewed lessons (that aren't already completed)
      const viewedOnly = viewedLessons.filter((id: string) => !completedLessons.includes(id));
      const viewedRequests = viewedOnly.map((lessonId: string) =>
        this.markLessonViewed(lessonId)
      );

      // Execute all requests
      const allRequests = [...completedRequests, ...viewedRequests];

      if (allRequests.length === 0) {
        localStorage.setItem('progressMigrated', 'true');
        return new Observable(observer => {
          observer.next({ success: true, message: 'No valid lessons to migrate' });
          observer.complete();
        });
      }

      // Use forkJoin to wait for all requests to complete
      return new Observable(observer => {
        let completed = 0;
        const total = allRequests.length;
        const errors: any[] = [];

        allRequests.forEach(request => {
          request.subscribe({
            next: () => {
              completed++;
              if (completed === total) {
                // All done - mark as migrated and clear old data
                localStorage.setItem('progressMigrated', 'true');
                localStorage.removeItem('viewedLessons');
                localStorage.removeItem('completedLessons');
                observer.next({ 
                  success: true, 
                  message: `Migrated ${total} lessons successfully` 
                });
                observer.complete();
              }
            },
            error: (error: any) => {
              errors.push(error);
              completed++;
              if (completed === total) {
                localStorage.setItem('progressMigrated', 'true');
                localStorage.removeItem('viewedLessons');
                localStorage.removeItem('completedLessons');
                observer.next({ 
                  success: false, 
                  message: `Migration completed with ${errors.length} errors` 
                });
                observer.complete();
              }
            }
          });
        });
      });
    } catch (error) {
      return new Observable(observer => {
        observer.next({ success: false, message: 'Migration failed' });
        observer.complete();
      });
    }
  }
}

