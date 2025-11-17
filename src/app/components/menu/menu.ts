import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChartBar, faHome } from '@fortawesome/free-regular-svg-icons';
import {
  faBookOpenReader,
  faBullseye,
  faThList,
  faTrophy,
  faUser,
  faSignOutAlt,
  faChartColumn,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../../services/user.service';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, FontAwesomeModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss'
})
export class Menu implements OnInit, OnDestroy {
  isCollapsed = false;
  isMobileOpen = false;
  faHome = faHome;
  faBook = faBookOpenReader;
  faBullseye = faBullseye;
  faTh = faThList;
  faTrophy = faTrophy;
  faUser = faUser;
  faSignOutAlt = faSignOutAlt;

  constructor(
    private router: Router,
    private userService: UserService,
    private sidebarService: SidebarService
  ) {
    this.sidebarService.isCollapsed$.subscribe(collapsed => {
      this.isCollapsed = collapsed;
    });
  }

  ngOnInit() {
    // Close mobile menu if window is resized to desktop size
    this.checkScreenSize();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    if (window.innerWidth > 768 && this.isMobileOpen) {
      this.isMobileOpen = false;
    }
  }

  toggleSidebar() {
    // On mobile, toggle mobile menu
    if (window.innerWidth <= 768) {
      this.isMobileOpen = !this.isMobileOpen;
      // Also update the sidebar service for consistency
      if (this.isMobileOpen) {
        this.sidebarService.setSidebarState(false);
      }
    } else {
      // On desktop, use normal collapse
    this.sidebarService.toggleSidebar();
    }
  }

  closeMobileMenu() {
    this.isMobileOpen = false;
  }

  logout() {
    this.userService.logout().subscribe({
      next: (response) => {
        this.userService.clearAuth();
        this.router.navigate(['login']);
      },
      error: (error) => {
        this.userService.clearAuth();
        this.router.navigate(['login']);
      }
    });
  }
}
