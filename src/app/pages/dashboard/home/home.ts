import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ActivityService, Activity, UserStatistics } from '../../../services/activity.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  recentActivity: Activity[] = [];
  stats: UserStatistics = {
    scansPerformed: 0,
    vulnerabilitiesDetected: 0,
    bestScore: 0,
    bestScanAlias: 'N/A'
  };
  loading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private activityService: ActivityService
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
        console.error('Error loading activities:', error);
      }
    });
  }

  loadStatistics() {
    this.activityService.getUserStatistics().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.error = 'Error al cargar estadísticas';
        this.loading = false;
      }
    });
  }

  getActivityIcon(type: string): string {
    return this.activityService.getActivityIcon(type);
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
