import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ScoreboardService,
  ScoreboardEntry,
  UserStats,
} from '../../../services/scoreboard.service';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scoreboard.html',
  styleUrl: './scoreboard.scss',
})
export class ScoreboardComponent implements OnInit {
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
        console.error('Error loading scoreboard:', error);
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
        console.error('Error loading user stats:', error);
      },
    });
  }

  changeTimeframe(timeframe: 'all' | 'week' | 'month'): void {
    this.timeframe = timeframe;
    this.loadScoreboard();
  }

  getAvatarPath(avatarId: string): string {
    return `${avatarId}.png`;
  }
}
