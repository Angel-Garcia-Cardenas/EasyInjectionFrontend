import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faGlobe, faShieldAlt, faCode, faSyringe } from '@fortawesome/free-solid-svg-icons';
import { ScanService, CreateScanRequest } from '../../../services/scan.service';

export interface ScanType {
  id: string;
  name: string;
  description: string;
  icon: string | IconDefinition;
  color: string;
}

export interface DBMS {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-new-scan',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FontAwesomeModule],
  templateUrl: './new-scan.html',
  styleUrl: './new-scan.scss'
})
export class NewScanComponent implements OnInit {
  faGlobe = faGlobe;
  faShieldAlt = faShieldAlt;
  faCode = faCode;
  faSyringe = faSyringe;
  scanForm: FormGroup;
  isSubmitting = false;
  submitError: string | null = null;

  // Available scan types
  scanTypes: ScanType[] = [
    {
      id: 'xss',
      name: 'XSS (Cross-Site Scripting)',
      description: 'Detecta vulnerabilidades de inyección de scripts maliciosos',
      icon: faCode,
      color: '#4ecdc4'
    },
    {
      id: 'sql',
      name: 'SQL Injection',
      description: 'Identifica puntos de inyección SQL en formularios y parámetros',
      icon: faSyringe,
      color: '#ff6b6b'
    },
    {
      id: 'both',
      name: 'Análisis Completo',
      description: 'Ejecuta ambos tipos de escaneo para un análisis exhaustivo',
      icon: faShieldAlt,
      color: '#45b7d1'
    }
  ];

  getScanTypeIcon(scanType: ScanType): IconDefinition {
    if (typeof scanType.icon === 'string') {
      return faShieldAlt;
    }
    return scanType.icon;
  }

  // Available DBMS (supported by sqlmap)
  dbmsList: DBMS[] = [
    { id: 'auto', name: 'Auto-detectar', description: 'SQLmap detectará automáticamente' },
    { id: 'MySQL', name: 'MySQL', description: 'MySQL 5.x, 8.x' },
    { id: 'PostgreSQL', name: 'PostgreSQL', description: 'PostgreSQL 9.x, 10.x+' },
    { id: 'Microsoft SQL Server', name: 'Microsoft SQL Server', description: 'MSSQL 2005+' },
    { id: 'Oracle', name: 'Oracle', description: 'Oracle 10g, 11g, 12c+' },
    { id: 'SQLite', name: 'SQLite', description: 'SQLite 3.x' },
    { id: 'Microsoft Access', name: 'Microsoft Access', description: 'MS Access 2000+' },
    { id: 'Firebird', name: 'Firebird', description: 'Firebird 2.x+' },
    { id: 'Sybase', name: 'Sybase', description: 'Sybase ASE' },
    { id: 'IBM DB2', name: 'IBM DB2', description: 'DB2 9.x+' },
    { id: 'MariaDB', name: 'MariaDB', description: 'MariaDB 5.x, 10.x' }
  ];

  selectedScanType: string = 'both';
  selectedDbms: string = 'auto';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private scanService: ScanService
  ) {
    this.scanForm = this.fb.group({
      alias: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      scanType: ['both', Validators.required],
      dbms: ['auto'],
      customHeaders: ['']
    });
  }

  ngOnInit(): void {
    // Set default scan type and DBMS
    this.scanForm.patchValue({ scanType: 'both', dbms: 'auto' });
  }

  selectScanType(scanTypeId: string) {
    this.selectedScanType = scanTypeId;
    this.scanForm.patchValue({ scanType: scanTypeId });
  }

  selectDbms(dbmsId: string) {
    this.selectedDbms = dbmsId;
    this.scanForm.patchValue({ dbms: dbmsId });
  }

  getUrlErrorMessage(): string {
    const urlControl = this.scanForm.get('url');
    if (!urlControl?.errors || !urlControl.touched) {
      return '';
    }

    if (urlControl.errors['required']) {
      return 'La URL es obligatoria';
    }
    if (urlControl.errors['pattern']) {
      return 'Ingresa una URL válida (debe comenzar con http:// o https://)';
    }
    return '';
  }

  onSubmit() {
    this.submitError = null;

    if (this.scanForm.valid) {
      this.isSubmitting = true;

      const formData = this.scanForm.value;
      
      // Prepare scan data for API
      const scanData: CreateScanRequest = {
        alias: formData.alias,
        url: formData.url,
        flags: {
          xss: formData.scanType === 'xss' || formData.scanType === 'both',
          sqli: formData.scanType === 'sql' || formData.scanType === 'both'
        }
      };

      // Call API to create scan
      this.scanService.createScan(scanData).subscribe({
        next: (response) => {
          if (response.success && response.scan) {
            // Store additional config (DBMS and headers) in localStorage for this scan
            const scanConfig = {
              dbms: formData.dbms !== 'auto' ? formData.dbms : undefined,
              customHeaders: formData.customHeaders || undefined
            };
            localStorage.setItem(`scan_config_${response.scan._id}`, JSON.stringify(scanConfig));

            // Navigate to scan progress page with scan ID
            this.router.navigate(['/dashboard/scan-progress', response.scan._id]);
          } else {
            this.submitError = 'Error al crear el escaneo. Intenta nuevamente.';
            this.isSubmitting = false;
          }
        },
        error: (error) => {
          this.submitError = error.error?.message || 'Error al crear el escaneo. Verifica tu conexión.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.scanForm.markAllAsTouched();
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
