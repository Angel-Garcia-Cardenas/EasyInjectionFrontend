import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faLink,
  faFileAlt,
  faCalendar,
  faClock,
  faExclamationTriangle,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import { ScanService } from '../../../services/scan.service';

export interface ScanReport {
  scan: {
    _id: string;
    alias: string;
    url: string;
    fecha_inicio: string;
    fecha_fin?: string;
    estado: string;
    flags: {
      xss: boolean;
      sqli: boolean;
    };
  };
  vulnerabilidades: Vulnerability[];
  resumen_vulnerabilidades: {
    total: number;
    por_severidad: {
      critica: number;
      alta: number;
      media: number;
      baja: number;
    };
  };
  cuestionario: QuizResult[];
  puntuacion: {
    puntos_cuestionario: number;
    total_puntos_cuestionario: number;
    vulnerabilidades_encontradas: number;
    puntuacion_final: number;
    calificacion: string;
  };
}

export interface Vulnerability {
  _id: string;
  tipo_id: {
    _id: string;
    nombre: string;
    descripcion: string;
  };
  nivel_severidad_id: {
    _id: string;
    nombre: string;
    nivel: number;
    color: string;
  };
  parametro_afectado?: string;
  url_afectada?: string;
  descripcion?: string;
  sugerencia?: string;
  referencia?: string;
}

export interface QuizResult {
  pregunta: {
    _id: string;
    texto_pregunta: string;
    dificultad: string;
    puntos: number;
  };
  respuestas: any[];
  respuesta_seleccionada: any;
  respuesta_correcta: any;
  es_correcta: boolean;
  puntos_obtenidos: number;
}

@Component({
  selector: 'app-scan-report',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './scan-report.html',
  styleUrls: ['./scan-report.scss']
})
export class ScanReportComponent implements OnInit {
  faLink = faLink;
  faFileAlt = faFileAlt;
  faCalendar = faCalendar;
  faClock = faClock;
  faExclamationTriangle = faExclamationTriangle;
  faSearch = faSearch;
  scanId: string = '';
  report: ScanReport | null = null;
  loading: boolean = true;
  error: string | null = null;
  activeTab: 'resumen' | 'vulnerabilidades' | 'cuestionario' = 'resumen';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private scanService: ScanService
  ) {}

  ngOnInit(): void {
    this.scanId = this.route.snapshot.paramMap.get('id') || '';
    if (this.scanId) {
      this.loadReport();
    }
  }

  loadReport(): void {
    this.loading = true;
    this.error = null;

    this.scanService.getScanReport(this.scanId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.report = response.report;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el reporte del escaneo';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/scans']);
  }

  setActiveTab(tab: 'resumen' | 'vulnerabilidades' | 'cuestionario'): void {
    this.activeTab = tab;
  }

  getSeverityClass(severity: string): string {
    const sev = severity?.toLowerCase();
    if (sev === 'crítica' || sev === 'critica') return 'severity-critical';
    if (sev === 'alta') return 'severity-high';
    if (sev === 'media') return 'severity-medium';
    if (sev === 'baja') return 'severity-low';
    return '';
  }

  getScoreClass(score: number): string {
    if (score >= 90) return 'score-excellent';
    if (score >= 75) return 'score-good';
    if (score >= 60) return 'score-regular';
    if (score >= 40) return 'score-poor';
    return 'score-critical';
  }

  get correctAnswersCount(): number {
    return this.report?.cuestionario?.filter(q => q.es_correcta).length || 0;
    }

  get incorrectAnswersCount(): number {
    return this.report?.cuestionario?.filter(q => !q.es_correcta).length || 0;
  }

  exportReport(): void {
    // TODO: Implement export functionality
    alert('Exportar informe');
  }

  visitSite(): void {
    if (this.report?.scan.url) {
      window.open(this.report.scan.url, '_blank');
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDuration(): string {
    if (!this.report?.scan.fecha_inicio || !this.report?.scan.fecha_fin) {
      return 'N/A';
    }

    const start = new Date(this.report.scan.fecha_inicio);
    const end = new Date(this.report.scan.fecha_fin);
    const diff = end.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${minutes}m ${seconds}s`;
  }

  viewVulnerabilityDetails(vulnerability: Vulnerability): void {
    this.router.navigate(['/dashboard/scans', this.scanId, 'vulnerability', vulnerability._id]);
  }
}
