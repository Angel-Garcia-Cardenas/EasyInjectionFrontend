import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-terms-conditions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terms-conditions.html',
  styleUrl: './terms-conditions.scss'
})
export class TermsConditionsComponent {
  constructor(private router: Router) {}

  navigateHome() {
    this.router.navigate(['/']);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

