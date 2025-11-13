import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SidebarService } from '../../services/sidebar.service';
// import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header implements OnInit, OnDestroy {
  searchQuery = '';
  hasNotifications = false;
  notificationCount = 0;
  isSidebarCollapsed = false;
  private notificationSubscription?: Subscription;
  private sidebarSubscription?: Subscription;

  constructor(private sidebarService: SidebarService) {}

  ngOnInit() {
    this.sidebarSubscription = this.sidebarService.isCollapsed$.subscribe(collapsed => {
      this.isSidebarCollapsed = collapsed;
    });
      // this.notificationSubscription = this.notificationService.getNotifications().subscribe(notifications => {
      // this.notificationCount = this.notificationService.getUnreadCount();
      // this.hasNotifications = this.notificationService.hasUnreadNotifications();
    // };
  }

  ngOnDestroy() {
    if (this.sidebarSubscription) {
      this.sidebarSubscription.unsubscribe();
    }
    // if (this.notificationSubscription) {
      // this.notificationSubscription.unsubscribe();
    // }
  }

  onSearch() {
    // if (this.searchQuery.trim()) {
      // console.log('Searching for:', this.searchQuery);
      // Implement search functionality
    // }
  }

  onNotificationClick() {
    console.log('Notifications clicked');
    // Implement notification panel toggle
    // For now, mark all as read
    // this.notificationService.markAllAsRead();
  }
}
