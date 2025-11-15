import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBullseye,
  faThList,
  faBookOpenReader,
  faTrophy
} from '@fortawesome/free-solid-svg-icons';
import { ActivityService, Activity, UserStatistics } from '../../../services/activity.service';
import { ScoreboardService } from '../../../services/scoreboard.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  recentActivity: Activity[] = [];
  stats: UserStatistics & { totalPoints?: number; rankingPosition?: number | string } = {
    scansPerformed: 0,
    vulnerabilitiesDetected: 0,
    bestScore: 0,
    bestScanAlias: 'N/A',
    totalPoints: 0,
    rankingPosition: 'N/A'
  };
  loading = false;
  error: string | null = null;
  
  // Icons
  faBullseye = faBullseye;
  faThList = faThList;
  faBook = faBookOpenReader;
  faTrophy = faTrophy;

  constructor(
    private router: Router,
    private activityService: ActivityService,
    private scoreboardService: ScoreboardService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.loadActivities();
    this.loadStatistics();
  }

  loadActivities() {
    this.activityService.getActivities().subscribe({
      next: (activities) => {
        this.recentActivity = activities.slice(0, 5);
      },
      error: (error) => {
      }
    });
  }

  loadStatistics() {
    this.activityService.getUserStatistics().subscribe({
      next: (stats) => {
        this.stats = { ...stats, totalPoints: 0, rankingPosition: 'N/A' };
        // Also load scoreboard stats for total points and ranking
        this.loadScoreboardStats();
      },
      error: (error) => {
        this.error = 'Error al cargar estadísticas';
        this.loading = false;
      }
    });
  }

  loadScoreboardStats() {
    this.scoreboardService.getUserStats().subscribe({
      next: (response) => {
        if (response.success && response.stats) {
          this.stats.totalPoints = response.stats.totalPoints || 0;
          // Get ranking position from global scoreboard
          this.loadRankingPosition();
        }
      },
      error: (error) => {
        this.loading = false;
      }
    });
  }

  loadRankingPosition() {
    this.scoreboardService.getScoreboard().subscribe({
      next: (scoreboard) => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            const userId = user._id;
            if (userId && Array.isArray(scoreboard)) {
              const position = scoreboard.findIndex(entry => entry.userId === userId) + 1;
              this.stats.rankingPosition = position > 0 ? position : 'N/A';
            } else {
              this.stats.rankingPosition = 'N/A';
            }
          } catch (error) {
            this.stats.rankingPosition = 'N/A';
          }
        } else {
          this.stats.rankingPosition = 'N/A';
        }
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
      }
    });
  }

  getActivityIcon(type: string): IconDefinition {
    const iconMap: { [key: string]: IconDefinition } = {
      'scan_completed': faThList,
      'resource_available': faBookOpenReader,
      'achievement_unlocked': faTrophy
    };
    return iconMap[type] || faBookOpenReader;
  }

  getActivityIconClass(type: string): string {
    if (type === 'scan_completed') return 'item__icon--blue';
    if (type === 'resource_available') return 'item__icon--pink';
    if (type === 'achievement_unlocked') return 'item__icon--gold';
    return 'item__icon--pink';
  }

  formatActivityTime(date: Date): string {
    return this.activityService.formatActivityTime(date);
  }

  goToNewScan() {
    this.router.navigate(['/dashboard/new-scan']);
  }

  goToScans() {
    this.router.navigate(['/dashboard/scans']);
  }

  goToTheory() {
    this.router.navigate(['/dashboard/theory']);
  }

  goToScoreboard() {
    this.router.navigate(['/dashboard/scoreboard']);
  }
}
