import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSearch,
  faBookOpen,
  faShieldAlt,
  faTrophy,
  faBullseye
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home',
  imports: [FontAwesomeModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  faBullseye = faBullseye;
  faBook = faBookOpen;
  faShieldAlt = faShieldAlt;
  faTrophy = faTrophy;
  constructor(private router: Router) {}

  goToPage(pageName:string){
    this.router.navigate([`${pageName}`]);
  }
}
