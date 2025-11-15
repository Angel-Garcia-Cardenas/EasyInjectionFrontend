import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LessonProgressService } from '../../../../services/lesson-progress.service';
import { ALL_LESSON_IDS, LESSON_COUNTS, LESSON_IDS } from '../../../../constants/lessons.constants';

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  completed: boolean;
  started: boolean;
}

interface Tab {
  label: string;
  value: string;
}

interface AdditionalResource {
  name: string;
  description: string;
  url: string;
}

@Component({
  selector: 'app-syllabus',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './syllabus.html',
  styleUrl: './syllabus.scss'
})
export class SyllabusComponent implements OnInit {
  activeTab = 'all';
  progressPercentage = 0;
  completedLessons = 0;
  totalLessons = 0;
  completedIndividualLessons = 0; // Individual lesson count
  totalIndividualLessons = 0; // Total individual lessons (18)
  loading = false;

  tabs: Tab[] = [
    { value: 'all', label: 'Todo el contenido' },
    { value: 'xss', label: 'Cross-Site Scripting' },
    { value: 'sqli', label: 'Inyección SQL' }
  ];

  securityBasicsLessons: Lesson[] = [
    {
      id: 'intro-seguridad',
      title: 'Introducción a la Seguridad Web',
      description: 'Conceptos básicos y terminología de seguridad',
      content: 'Aprende los conceptos fundamentales de seguridad web, incluyendo los principios de defensa en profundidad, mínimo privilegio y superficie de ataque.',
      completed: false,
      started: false
    },
    {
      id: 'owasp-top-10',
      title: 'OWASP Top 10',
      description: 'Las vulnerabilidades más críticas según OWASP',
      content: 'Conoce las diez vulnerabilidades más críticas según el Open Web Application Security Project (OWASP) y por qué son importantes.',
      completed: false,
      started: false
    }
  ];

  xssLessons: Lesson[] = [
    {
      id: 'fundamentos-xss',
      title: 'Fundamentos de XSS',
      description: '¿Qué es XSS y cómo funciona?',
      content: 'Aprende qué es Cross-Site Scripting, cómo funciona y por qué sigue siendo una de las vulnerabilidades más comunes en aplicaciones web modernas.',
      completed: false,
      started: false
    },
    {
      id: 'tipos-xss',
      title: 'Tipos de XSS',
      description: 'Reflejado, Almacenado y DOM-based XSS',
      content: 'Explora los tres tipos principales de XSS: reflejado, almacenado y basado en DOM, comprendiendo cómo se manifiestan y qué los diferencia.',
      completed: false,
      started: false
    },
    {
      id: 'contextos-salida-xss',
      title: 'Contextos de salida y su importancia',
      description: 'HTML, atributos, JavaScript, URLs y JSON',
      content: 'Descubre cómo el contexto donde se inserta la información determina el tipo de protección necesaria y aprende a reconocer los más comunes.',
      completed: false,
      started: false
    },
    {
      id: 'dom-xss-ejecucion-cliente',
      title: 'XSS basado en DOM',
      description: 'Vulnerabilidades en el lado del cliente',
      content: 'Comprende cómo los scripts que manipulan el DOM pueden generar vulnerabilidades y aprende a manejar los datos del navegador de forma segura.',
      completed: false,
      started: false
    },
    {
      id: 'prevencion-xss',
      title: 'Prevención de XSS',
      description: 'Técnicas y mejores prácticas',
      content: 'Conoce las estrategias más efectivas para prevenir ataques XSS, como el escapado por contexto, la validación de entradas y el uso de APIs seguras.',
      completed: false,
      started: false
    },
    {
      id: 'csp-y-headers',
      title: 'Content Security Policy y cabeceras HTTP',
      description: 'Defensa en profundidad contra XSS',
      content: 'Aprende cómo aplicar Content Security Policy y otras cabeceras de seguridad para reforzar la protección de tu aplicación frente a ataques XSS.',
      completed: false,
      started: false
    },
    {
      id: 'diseno-seguro-y-procesos',
      title: 'Diseño seguro y ciclo de desarrollo',
      description: 'Buenas prácticas en el desarrollo web',
      content: 'Descubre cómo integrar medidas de seguridad contra XSS en cada etapa del desarrollo, desde el diseño hasta las revisiones de código.',
      completed: false,
      started: false
    },
    {
      id: 'casos-avanzados-xss',
      title: 'Casos avanzados de XSS',
      description: 'Aplicaciones modernas y nuevos desafíos',
      content: 'Analiza escenarios complejos como aplicaciones SPA, uso de terceros y editores enriquecidos, y cómo adaptar las defensas a entornos modernos.',
      completed: false,
      started: false
    }
  ];

  sqlInjectionLessons: Lesson[] = [
    {
      id: 'fundamentos-sqli',
      title: 'Fundamentos de Inyección SQL',
      description: '¿Qué es la Inyección SQL y por qué importa?',
      content: 'Aprende qué es la inyección SQL, cómo un dato no confiable puede alterar una consulta y qué impactos puede tener sobre la confidencialidad e integridad de la base de datos.',
      completed: false,
      started: false
    },
    {
      id: 'tipos-sqli',
      title: 'Tipos de Inyección SQL',
      description: 'In-band, inferencial y out-of-band',
      content: 'Conoce las familias principales de Inyección SQL: in-band, inferencial (blind) y out-of-band, y entiende cómo difieren en visibilidad y método de explotación.',
      completed: false,
      started: false
    },
    {
      id: 'fundamentos-sql-y-acceso',
      title: 'Fundamentos de SQL y acceso a datos',
      description: 'Consultas, drivers, y ORMs',
      content: 'Revisa las bases del lenguaje SQL, cómo las aplicaciones construyen consultas y el papel de drivers y ORMs en la seguridad de las consultas.',
      completed: false,
      started: false
    },
    {
      id: 'raices-sqli',
      title: '¿Por qué ocurren las inyecciones SQL?',
      description: 'Patrones de código y diseño vulnerables',
      content: 'Explora las causas comunes: concatenación de cadenas, falta de validación, uso indebido de APIs y su relación con decisiones de diseño inseguras.',
      completed: false,
      started: false
    },
    {
      id: 'prevencion-sqli',
      title: 'Prevención de Inyección SQL',
      description: 'Prepared statements, parametrización y validación',
      content: 'Aprende las defensas efectivas: consultas parametrizadas, uso correcto de ORMs, validación por whitelist y separación de responsabilidades entre código y datos.',
      completed: false,
      started: false
    },
    {
      id: 'arquitectura-operaciones',
      title: 'Arquitectura y operaciones seguras',
      description: 'Principios operativos y detección',
      content: 'Descubre medidas a nivel de arquitectura y operación: controles de acceso a la BD, monitoreo de consultas, WAF como capa adicional y planes de respuesta ante incidentes.',
      completed: false,
      started: false
    },
    {
      id: 'analisis-priorizacion-riesgo',
      title: 'Análisis y priorización de riesgo',
      description: 'Cómo valorar hallazgos y decidir acciones',
      content: 'Aprende a evaluar severidad según datos expuestos, privilegios y exposición pública, y a priorizar correcciones basadas en impacto y probabilidad.',
      completed: false,
      started: false
    },
    {
      id: 'casos-avanzados-sqli',
      title: 'Casos avanzados y consideraciones modernas',
      description: 'Procedimientos almacenados, ORMs complejos y NoSQL',
      content: 'Analiza escenarios complejos como SQL dinámico, procedimientos almacenados, limitaciones de ORMs y riesgos comparativos en bases NoSQL, con estrategias para mitigarlos.',
      completed: false,
      started: false
    }
  ];

  additionalResources: AdditionalResource[] = [
    {
      name: 'OWASP Cheat Sheet Series',
      description: 'Guías concisas sobre diferentes aspectos de la seguridad de aplicaciones web.',
      url: 'https://cheatsheetseries.owasp.org/'
    },
    {
      name: 'PortSwigger Web Security Academy',
      description: 'Laboratorios interactivos gratuitos para practicar habilidades de seguridad web.',
      url: 'https://portswigger.net/web-security'
    }
  ];

  constructor(
    private router: Router,
    private lessonProgressService: LessonProgressService
  ) {}

  ngOnInit(): void {
    // Set loading state
    this.loading = true;
    
    // First, migrate any old localStorage data to backend (one-time)
    this.lessonProgressService.migrateLocalStorageToBackend().subscribe({
      next: () => {
        // After migration, load progress
        this.loadCompletedLessons();
      },
      error: () => {
        // Even if migration fails, try to load progress
        this.loadCompletedLessons();
      }
    });
    
    // Also subscribe to progress changes for real-time updates
    this.lessonProgressService.progress$.subscribe({
      next: (stats) => {
        if (stats) {
          this.updateLessonsWithProgress(stats.completedLessons, stats.viewedLessons);
        }
      }
    });
  }

  private loadCompletedLessons(): void {
    // Load progress statistics from backend
    this.lessonProgressService.getProgressStats(ALL_LESSON_IDS).subscribe({
      next: (stats) => {
        this.updateLessonsWithProgress(stats.completedLessons, stats.viewedLessons);
        this.loading = false;
      },
      error: () => {
        // In case of error, show lessons without progress
        this.calculateProgress();
        this.loading = false;
      }
    });
  }

  private updateLessonsWithProgress(completedLessons: string[], viewedLessons: string[]): void {
    // Mark lessons as completed or started
    this.securityBasicsLessons = this.securityBasicsLessons.map(lesson => ({
      ...lesson,
      completed: completedLessons.includes(lesson.id),
      started: viewedLessons.includes(lesson.id) || completedLessons.includes(lesson.id)
    }));

    this.xssLessons = this.xssLessons.map(lesson => ({
      ...lesson,
      completed: completedLessons.includes(lesson.id),
      started: viewedLessons.includes(lesson.id) || completedLessons.includes(lesson.id)
    }));

    this.sqlInjectionLessons = this.sqlInjectionLessons.map(lesson => ({
      ...lesson,
      completed: completedLessons.includes(lesson.id),
      started: viewedLessons.includes(lesson.id) || completedLessons.includes(lesson.id)
    }));

    // Calculate progress
    this.calculateProgress();
  }

  private calculateProgress(): void {
    const allLessons = [
      ...this.securityBasicsLessons,
      ...this.xssLessons,
      ...this.sqlInjectionLessons
    ];

    // Count individual completed lessons
    this.totalIndividualLessons = LESSON_COUNTS.TOTAL; // 18 total
    this.completedIndividualLessons = allLessons.filter(lesson => lesson.completed).length;

    // Count how many categories are fully completed (all lessons in category are done)
    // This represents "complete lesson sets" rather than individual lessons
    let completedCategories = 0;
    const totalCategories = 3; // Security Basics, XSS, SQL Injection

    // Check Security Basics category
    const securityBasicsCompleted = LESSON_IDS.SECURITY_BASICS.every(lessonId =>
      allLessons.find(lesson => lesson.id === lessonId)?.completed === true
    );
    if (securityBasicsCompleted) {
      completedCategories++;
    }

    // Check XSS category
    const xssCompleted = LESSON_IDS.XSS.every(lessonId =>
      allLessons.find(lesson => lesson.id === lessonId)?.completed === true
    );
    if (xssCompleted) {
      completedCategories++;
    }

    // Check SQL Injection category
    const sqliCompleted = LESSON_IDS.SQL_INJECTION.every(lessonId =>
      allLessons.find(lesson => lesson.id === lessonId)?.completed === true
    );
    if (sqliCompleted) {
      completedCategories++;
    }

    // Count represents fully completed categories (lesson sets)
    this.totalLessons = totalCategories; // 3 categories total
    this.completedLessons = completedCategories; // Number of fully completed categories
    // Calculate percentage based on individual lessons completed
    this.progressPercentage = this.totalIndividualLessons > 0 ? Math.round((this.completedIndividualLessons / this.totalIndividualLessons) * 100) : 0;
  }

  
  onSearchChange(): void {
    // Lógica de búsqueda
    }

  getLessonButtonText(lesson: Lesson): string {
    if (lesson.completed) {
      return 'Repasar lección';
    } else if (lesson.started) {
      return 'Continuar aprendiendo';
    } else {
      return 'Comenzar a aprender';
    }
  }

  navigateToLesson(lessonId: string): void {
    // Simplemente navegar a la lección - el progreso se marcará al completarla
    this.router.navigate(['/dashboard/theory/lesson', lessonId]);
  }

  navigateBack(): void {
    this.router.navigate(['/dashboard/theory']);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  openExternalLink(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
