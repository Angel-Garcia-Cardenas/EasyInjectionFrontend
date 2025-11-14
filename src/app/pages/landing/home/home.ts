import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSearch,
  faBook,
  faShieldAlt,
  faTrophy
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home',
  imports: [FontAwesomeModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  faSearch = faSearch;
  faBook = faBook;
  faShieldAlt = faShieldAlt;
  faTrophy = faTrophy;
  constructor(private router: Router) {}

  goToPage(pageName:string){
    this.router.navigate([`${pageName}`]);
  }
}
