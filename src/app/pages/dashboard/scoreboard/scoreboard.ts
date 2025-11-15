import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTrophy,
  faStar,
  faBullseye,
  faBug,
  faChartBar,
  faMedal,
  faChartLine,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import {
  ScoreboardService,
  ScoreboardEntry,
  UserStats,
} from '../../../services/scoreboard.service';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './scoreboard.html',
  styleUrl: './scoreboard.scss',
})
export class ScoreboardComponent implements OnInit {
  faTrophy = faTrophy;
  faStar = faStar;
  faBullseye = faBullseye;
  faBug = faBug;
  faChartBar = faChartBar;
  faMedal = faMedal;
  faChartLine = faChartLine;
  faExclamationTriangle = faExclamationTriangle;
  scoreboard: ScoreboardEntry[] = [];
  userStats: UserStats | null = null;
  currentUserRank: number | null = null;
  timeframe: 'all' | 'week' | 'month' = 'all';
  loading = true;
  error = '';

  constructor(private scoreboardService: ScoreboardService) {}

  ngOnInit(): void {
    this.loadScoreboard();
    this.loadUserStats();
  }

  loadScoreboard(): void {
    this.loading = true;
    this.scoreboardService.getScoreboard(this.timeframe).subscribe({
      next: (response) => {
        this.scoreboard = response.scoreboard;
        this.currentUserRank = response.currentUserRank;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar el scoreboard';
        this.loading = false;
      },
    });
  }

  loadUserStats(): void {
    this.scoreboardService.getUserStats().subscribe({
      next: (response) => {
        this.userStats = response.stats;
      },
      error: (error) => {
      },
    });
  }

  changeTimeframe(timeframe: 'all' | 'week' | 'month'): void {
    this.timeframe = timeframe;
    this.loadScoreboard();
  }

  getAvatarPath(avatarId: string): string {
    return `assets/avatars/${avatarId}.png`;
  }

  getMedalClass(rank: number): string {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-600';
    return '';
  }

  getMedalIcon(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  }

  formatScore(score: number): string {
    return score.toLocaleString('es-ES');
  }

  isCurrentUser(userId: string): boolean {
    return false; // Will be implemented when we have current user ID
  }
}
