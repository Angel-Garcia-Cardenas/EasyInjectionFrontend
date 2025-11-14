import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LessonService } from '../../../services/lesson.service';

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
  hasCompletedLessons = false;
  buttonText = 'Comenzar a aprender';

  // Datos de lecciones (sincronizados con syllabus)
  private securityBasicsLessons = 2; // Fundamentos de Seguridad
  private xssLessons = 8; // Cross-Site Scripting
  private sqlInjectionLessons = 8; // Inyección SQL

  featuredCategories: FeaturedCategory[] = [
    {
      id: 'security-basics',
      title: 'Fundamentos de Seguridad',
      description: 'Conceptos básicos de seguridad web que todo desarrollador debe conocer.',
      icon: '/security.svg',
      colorClass: 'bg-coral',
      count: this.securityBasicsLessons
    },
    {
      id: 'xss',
      title: 'Cross-Site Scripting (XSS)',
      description: 'Aprende sobre los diferentes tipos de vulnerabilidades XSS y cómo prevenirlas.',
      icon: '/code.svg',
      colorClass: 'bg-azul',
      count: this.xssLessons
    },
    {
      id: 'sql-injection',
      title: 'Inyección SQL',
      description: 'Comprende cómo funcionan los ataques de inyección SQL y las mejores prácticas de protección.',
      icon: '/bd.svg',
      colorClass: 'bg-rosa',
      count: this.sqlInjectionLessons
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
    private lessonService: LessonService
  ) {}

  ngOnInit(): void {
    this.updateCategoryCounts();
  }

  private updateCategoryCounts(): void {
    // Obtener lecciones completadas desde el backend
    this.lessonService.getProgress().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const completedLessons = response.data.completedLessons;

          // Actualizar el texto del botón basado en si hay lecciones iniciadas
          this.hasCompletedLessons = response.data.hasStartedAny;
          this.buttonText = this.hasCompletedLessons ? 'Continuar aprendiendo' : 'Comenzar a aprender';

          // Contar lecciones completadas por categoría
          const completedSecurityBasics = completedLessons.filter((id: string) =>
            ['intro-seguridad', 'owasp-top-10'].includes(id)
          ).length;

          const completedXss = completedLessons.filter((id: string) =>
            ['fundamentos-xss', 'tipos-xss', 'contextos-salida-xss', 'dom-xss-ejecucion-cliente',
             'prevencion-xss', 'csp-y-headers', 'diseno-seguro-y-procesos', 'casos-avanzados-xss'].includes(id)
          ).length;

          const completedSql = completedLessons.filter((id: string) =>
            ['fundamentos-sqli', 'tipos-sqli', 'fundamentos-sql-y-acceso', 'raices-sqli',
             'prevencion-sqli', 'arquitectura-operaciones', 'analisis-priorizacion-riesgo', 'casos-avanzados-sqli'].includes(id)
          ).length;

          // Actualizar las descripciones para mostrar progreso
          this.featuredCategories = this.featuredCategories.map(category => {
            const total = category.count;
            let completed = 0;

            if (category.id === 'security-basics') completed = completedSecurityBasics;
            else if (category.id === 'xss') completed = completedXss;
            else if (category.id === 'sql-injection') completed = completedSql;

            // Preserve the original description without "(X/Y completadas)" suffix
            const baseDescription = category.description.replace(/\s*\(\d+\/\d+\s+completadas\)$/, '');

            return {
              ...category,
              description: `${baseDescription} (${completed}/${total} completadas)`
            };
          });
        }
      },
      error: (error) => {
        console.error('Error loading lesson progress:', error);
        // En caso de error, mantener las categorías sin progreso
        this.buttonText = 'Comenzar a aprender';
      }
    });
  }

  onSearchChange(): void {
    // Lógica de búsqueda
    console.log('Searching for:', this.searchTerm);
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
