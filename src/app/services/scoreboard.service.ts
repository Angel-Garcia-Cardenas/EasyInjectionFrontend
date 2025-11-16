import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

// Updated: Scoreboard now shows individual scan scores, not user comparisons
export interface ScoreboardEntry {
  rank: number;
  scanId: string;
  scanAlias: string;
  scanUrl: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  vulnerabilitiesFound: number;
  grade: string;
  completedAt: Date;
}

export interface UserStats {
  totalPoints: number;
  totalScans: number;
  totalVulnerabilities: number;
  avgScore: number;
  bestScore: number;
  bestScanAlias: string;
  level: number;
}

@Injectable({
  providedIn: 'root',
})
export class ScoreboardService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  getScoreboard(
    timeframe: 'all' | 'week' | 'month' = 'all',
    limit: number = 100
  ): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(
      `${environment.backendUrl}api/scoreboard?timeframe=${timeframe}&limit=${limit}`,
      { headers }
    );
  }

  getUserStats(): Observable<{ success: boolean; stats: UserStats }> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<{ success: boolean; stats: UserStats }>(
      `${environment.backendUrl}api/scoreboard/me`,
      { headers }
    );
  }
}
