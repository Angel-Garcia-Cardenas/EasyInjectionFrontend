import { Component } from '@angular/core';
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
export class Menu {
  isCollapsed = false;
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

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
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
