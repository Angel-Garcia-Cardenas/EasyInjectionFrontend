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

  getMedalIcon(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  }

  formatScore(score: number): string {
    return score.toLocaleString('es-ES');
  }

  getGradeClass(grade: string): string {
    switch(grade) {
      case 'Excelente': return 'grade-excellent';
      case 'Bueno': return 'grade-good';
      case 'Regular': return 'grade-regular';
      case 'Deficiente': return 'grade-poor';
      case 'Crítico': return 'grade-critical';
      default: return '';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}
