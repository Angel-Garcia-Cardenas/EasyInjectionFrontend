import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Subscription, interval } from 'rxjs';
import { SidebarService } from '../../services/sidebar.service';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatBadgeModule, FontAwesomeModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header implements OnInit, OnDestroy {
  faSearch = faSearch;
  searchQuery = '';
  isSidebarCollapsed = false;
  
  notifications: Notification[] = [];
  unreadCount = 0;
  showNotificationPanel = false;
  
  private sidebarSubscription?: Subscription;
  private unreadCountSubscription?: Subscription;
  private refreshInterval?: Subscription;

  constructor(
    private sidebarService: SidebarService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.sidebarSubscription = this.sidebarService.isCollapsed$.subscribe(collapsed => {
      this.isSidebarCollapsed = collapsed;
    });
    
    this.loadNotifications();
    this.loadUnreadCount();
    
    this.refreshInterval = interval(30000).subscribe(() => {
      this.loadUnreadCount();
    });
  }

  ngOnDestroy() {
    if (this.sidebarSubscription) {
      this.sidebarSubscription.unsubscribe();
    }
    if (this.unreadCountSubscription) {
      this.unreadCountSubscription.unsubscribe();
    }
    if (this.refreshInterval) {
      this.refreshInterval.unsubscribe();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const notificationContainer = target.closest('.notification-container');
    
    if (!notificationContainer && this.showNotificationPanel) {
      this.showNotificationPanel = false;
    }
  }

  loadNotifications() {
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
      },
      error: (error) => {
      }
    });
  }

  loadUnreadCount() {
    this.unreadCountSubscription = this.notificationService.getUnreadCount().subscribe({
      next: (count) => {
        this.unreadCount = count;
      },
      error: (error) => {
      }
    });
  }

  toggleNotificationPanel() {
    this.showNotificationPanel = !this.showNotificationPanel;
    if (this.showNotificationPanel) {
      this.loadNotifications();
    }
  }

  markAsRead(notification: Notification) {
    if (!notification.leido) {
      this.notificationService.markAsRead(notification._id).subscribe({
        next: () => {
          notification.leido = true;
          this.loadUnreadCount();
        }
      });
    }
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.leido = true);
        this.unreadCount = 0;
      }
    });
  }

  deleteNotification(id: string, event: Event) {
    event.stopPropagation();
    
    const notification = this.notifications.find(n => n._id === id);
    if (notification) {
      notification.deleting = true;
    }
    
    setTimeout(() => {
      this.notificationService.deleteNotification(id).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n._id !== id);
          this.loadUnreadCount();
        }
      });
    }, 300);
  }

  getNotificationIcon(tipo: string): string {
    switch(tipo) {
      case 'scan_completed': return 'check_circle';
      case 'vulnerability_detected': return 'warning';
      case 'resource_available': return 'library_books';
      default: return 'notifications';
    }
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      // Navigate to scans page with search query parameter
      this.router.navigate(['/dashboard/scans'], {
        queryParams: { search: this.searchQuery.trim() }
      });
    } else {
      // If search is empty, just navigate to scans page
      this.router.navigate(['/dashboard/scans']);
    }
  }
}