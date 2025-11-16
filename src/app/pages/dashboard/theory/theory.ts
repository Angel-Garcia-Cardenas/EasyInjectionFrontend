import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LessonProgressService } from '../../../services/lesson-progress.service';
import { LESSON_IDS, LESSON_COUNTS } from '../../../constants/lessons.constants';

interface FeaturedCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  colorClass: string;
  count: number;
}

@Component({
  selector: 'app-theory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './theory.html',
  styleUrl: './theory.scss'
})
export class TheoryComponent implements OnInit {
  searchTerm = '';
  hasStartedAnyContent = false;
  hasNewContent = false;
  buttonText = 'Comenzar a aprender';
  bannerTitle = 'Domina la seguridad web';
  bannerDescription = 'Explora nuestra colección completa de recursos sobre vulnerabilidades XSS e inyección SQL. Desde conceptos básicos hasta técnicas avanzadas de prevención.';
  loading = false;

  featuredCategories: FeaturedCategory[] = [
    {
      id: 'security-basics',
      title: 'Fundamentos de Seguridad',
      description: 'Conceptos básicos de seguridad web que todo desarrollador debe conocer.',
      icon: '/security.svg',
      colorClass: 'bg-coral',
      count: LESSON_COUNTS.SECURITY_BASICS
    },
    {
      id: 'xss',
      title: 'Cross-Site Scripting (XSS)',
      description: 'Aprende sobre los diferentes tipos de vulnerabilidades XSS y cómo prevenirlas.',
      icon: '/code.svg',
      colorClass: 'bg-azul',
      count: LESSON_COUNTS.XSS
    },
    {
      id: 'sql-injection',
      title: 'Inyección SQL',
      description: 'Comprende cómo funcionan los ataques de inyección SQL y las mejores prácticas de protección.',
      icon: '/bd.svg',
      colorClass: 'bg-rosa',
      count: LESSON_COUNTS.SQL_INJECTION
    }
  ];

  stepByStepGuides = [
    'Identificación de vulnerabilidades XSS',
    'Prevención de inyección SQL en PHP',
    'Validación de datos en formularios web'
  ];

  downloadableResources = [
    'Cheatsheet de seguridad web (PDF)',
    'Lista de verificación OWASP Top 10 (PDF)',
    'Ejemplos de código seguro (ZIP)'
  ];

  constructor(
    private router: Router,
    private lessonProgressService: LessonProgressService
  ) {}

  ngOnInit(): void {
    // Set loading state
    this.loading = true;
    
    // Load progress immediately on initialization
    this.updateCategoryCounts();
    
    // Also subscribe to progress changes for real-time updates
    this.lessonProgressService.progress$.subscribe({
      next: (stats) => {
        if (stats) {
          this.updateUIWithProgress(stats);
        }
      }
    });
  }

  private updateCategoryCounts(): void {
    this.lessonProgressService.getProgressStats().subscribe({
      next: (stats) => {
        this.updateUIWithProgress(stats);
        this.loading = false;
      },
      error: () => {
        this.buttonText = 'Comenzar a aprender';
        this.loading = false;
      }
    });
  }

  private updateUIWithProgress(stats: any): void {
    this.hasStartedAnyContent = stats.hasStartedAny;
    
    const totalLessons = LESSON_COUNTS.SECURITY_BASICS + LESSON_COUNTS.XSS + LESSON_COUNTS.SQL_INJECTION;
    this.hasNewContent = this.hasStartedAnyContent || stats.completedCount < totalLessons;
    
    if (this.hasStartedAnyContent) {
      this.buttonText = 'Continuar aprendiendo';
      this.bannerTitle = 'Continúa tu aprendizaje';
      this.bannerDescription = 'Continúa explorando nuestra colección de recursos teóricos sobre vulnerabilidades XSS e Inyección SQL.';
    } else {
      this.buttonText = 'Comenzar a aprender';
      this.bannerTitle = 'Domina la seguridad web';
      this.bannerDescription = 'Explora nuestra colección completa de recursos sobre vulnerabilidades XSS e inyección SQL. Desde conceptos básicos hasta técnicas avanzadas de prevención.';
    }

    this.featuredCategories = this.featuredCategories.map(category => {
      const total = category.count;
      let completed = 0;

      if (category.id === 'security-basics') {
        completed = stats.completedLessons.filter((id: string) => 
          LESSON_IDS.SECURITY_BASICS.includes(id)
        ).length;
      } else if (category.id === 'xss') {
        completed = stats.completedLessons.filter((id: string) => 
          LESSON_IDS.XSS.includes(id)
        ).length;
      } else if (category.id === 'sql-injection') {
        completed = stats.completedLessons.filter((id: string) => 
          LESSON_IDS.SQL_INJECTION.includes(id)
        ).length;
      }

      const baseDescription = category.description.replace(/\s*\(\d+\/\d+\s+completadas\)$/, '');

      return {
        ...category,
        description: `${baseDescription} (${completed}/${total} completadas)`
      };
    });
  }

  onSearchChange(): void {
    // Lógica de búsqueda
  }

  navigateToSyllabus(): void {
    this.router.navigate(['/dashboard/theory/syllabus']);
  }

  navigateToCategories(): void {
    this.router.navigate(['/dashboard/theory/categories']);
  }

  navigateToCategory(categoryId: string): void {
    this.router.navigate(['/dashboard/theory/syllabus'], { fragment: categoryId });
  }

  navigateToGuides(): void {
    this.router.navigate(['/dashboard/theory/guides']);
  }

  navigateToResources(): void {
    this.router.navigate(['/dashboard/theory/resources']);
  }
}
