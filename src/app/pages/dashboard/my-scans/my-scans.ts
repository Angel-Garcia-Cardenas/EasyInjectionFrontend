import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faExclamationTriangle,
  faChartBar,
  faEye,
  faLink,
  faTrash,
  faSearch,
  faTimes,
  faTh,
  faList,
  faEllipsisVertical,
  faChevronDown,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { ScanService, Scan, ScanDetails, Vulnerability } from '../../../services/scan.service';

// Interfaces are now imported from the service

@Component({
  selector: 'app-my-scans',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './my-scans.html',
  styleUrl: './my-scans.scss'
})
export class MyScansComponent implements OnInit, OnDestroy {
  faExclamationTriangle = faExclamationTriangle;
  faChartBar = faChartBar;
  faEye = faEye;
  faLink = faLink;
  faTrash = faTrash;
  faSearch = faSearch;
  faTimes = faTimes;
  faTh = faTh;
  faList = faList;
  faEllipsisVertical = faEllipsisVertical;
  faChevronDown = faChevronDown;
  faCheck = faCheck;
  scans: Scan[] = [];
  filteredScans: Scan[] = [];
  loading = true;
  error = '';

  // Search and filters
  searchTerm = '';
  statusFilter = '';
  typeFilter = '';
  viewMode: 'list' | 'grid' = 'list';

  // Scan details modal
  showDetailsModal = false;
  selectedScan: ScanDetails | null = null;
  loadingDetails = false;

  // Actions menu
  showActionsMenu: string | null = null;

  // Filter modals
  showStatusModal = false;
  showTypeModal = false;

  // Filter options
  statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_progreso', label: 'En progreso' },
    { value: 'finalizado', label: 'Completado' },
    { value: 'error', label: 'Error' }
  ];

  typeOptions = [
    { value: '', label: 'Todos los tipos' },
    { value: 'xss', label: 'XSS' },
    { value: 'sqli', label: 'SQLi' },
    { value: 'both', label: 'XSS y SQLi' }
  ];

  getStatusFilterLabel(): string {
    const option = this.statusOptions.find(opt => opt.value === this.statusFilter);
    return option ? option.label : 'Estado';
  }

  getTypeFilterLabel(): string {
    const option = this.typeOptions.find(opt => opt.value === this.typeFilter);
    return option ? option.label : 'Tipo';
  }

  openStatusModal(): void {
    this.showStatusModal = true;
  }

  closeStatusModal(): void {
    this.showStatusModal = false;
  }

  openTypeModal(): void {
    this.showTypeModal = true;
  }

  closeTypeModal(): void {
    this.showTypeModal = false;
  }

  selectStatusFilter(value: string): void {
    this.statusFilter = value;
    this.applyFilters();
    this.closeStatusModal();
  }

  selectTypeFilter(value: string): void {
    this.typeFilter = value;
    this.applyFilters();
    this.closeTypeModal();
  }

  constructor(
    private scanService: ScanService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check for search query parameter from route (synchronously first)
    const searchParam = this.route.snapshot.queryParams['search'];
    if (searchParam) {
      this.searchTerm = searchParam;
    }
    
    // Also subscribe to query params changes in case user navigates with different search
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchTerm = params['search'];
        // Re-apply filters if scans are already loaded
        if (this.scans.length > 0) {
          this.applyFilters();
        }
      } else if (this.searchTerm && !params['search']) {
        // Clear search if query param is removed
        this.searchTerm = '';
        this.applyFilters();
      }
    });
    
    this.loadScans();
  }

  private addMockData(): void {
    // Add mock data for development when API fails
      const mockScans: Scan[] = [
        {
          _id: '1',
          alias: 'Escaneo sitio web corporativo',
          url: 'https://empresa-ejemplo.com',
          fecha_inicio: '2025-05-15T14:30:00Z',
          fecha_fin: '2025-05-15T15:45:00Z',
          estado: 'finalizado',
          flags: { xss: true, sqli: true },
          vulnerabilidades: { count: 4, types: ['XSS', 'SQLi'] }
        },
        {
          _id: '2',
          alias: 'Portal de administración',
          url: 'https://admin.ejemplo.com',
          fecha_inicio: '2025-05-10T09:15:00Z',
          fecha_fin: '2025-05-10T10:30:00Z',
          estado: 'finalizado',
          flags: { xss: false, sqli: true },
          vulnerabilidades: { count: 2, types: ['SQLi'] }
        },
        {
          _id: '3',
          alias: 'API de pagos',
          url: 'https://api.pagos.ejemplo.com',
          fecha_inicio: '2025-05-05T16:45:00Z',
          fecha_fin: '2025-05-05T17:20:00Z',
          estado: 'finalizado',
          flags: { xss: false, sqli: false },
          vulnerabilidades: { count: 0, types: [] }
        },
        {
          _id: '4',
          alias: 'Blog corporativo',
          url: 'https://blog.ejemplo.com',
          fecha_inicio: '2025-05-01T11:20:00Z',
          fecha_fin: '2025-05-01T12:10:00Z',
          estado: 'finalizado',
          flags: { xss: true, sqli: false },
          vulnerabilidades: { count: 5, types: ['XSS'] }
        },
        {
          _id: '5',
          alias: 'Tienda en línea',
          url: 'https://tienda.ejemplo.com',
          fecha_inicio: '2025-04-28T13:10:00Z',
          estado: 'error',
          flags: { xss: true, sqli: true },
          vulnerabilidades: { count: 0, types: [] }
        },
        {
          _id: '6',
          alias: 'Intranet',
          url: 'https://intranet.ejemplo.com',
          fecha_inicio: '2025-04-25T10:05:00Z',
          estado: 'en_progreso',
          flags: { xss: true, sqli: true },
          vulnerabilidades: { count: 0, types: [] }
        }
      ];

    this.scans = mockScans;
    this.filteredScans = [...this.scans];
    this.loading = false;
    this.error = ''; // Clear error when showing mock data
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadScans(): void {
    this.loading = true;
    this.error = '';

    this.scanService.getScans().subscribe({
      next: (response) => {
        this.scans = response.scans;
        this.filteredScans = [...this.scans];
        // Apply filters if search term exists
        if (this.searchTerm) {
          this.applyFilters();
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los escaneos';
        this.loading = false;
        // Add mock data for development when API fails
        this.addMockData();
        // Apply filters if search term exists
        if (this.searchTerm) {
          this.applyFilters();
        }
      }
    });
  }

  searchScans(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredScans = this.scans.filter(scan => {
      const matchesSearch = !this.searchTerm || 
        scan.alias.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        scan.url.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.statusFilter || scan.estado === this.statusFilter;

      const matchesType = !this.typeFilter || 
        (this.typeFilter === 'xss' && scan.flags.xss) ||
        (this.typeFilter === 'sqli' && scan.flags.sqli) ||
        (this.typeFilter === 'both' && scan.flags.xss && scan.flags.sqli);

      return matchesSearch && matchesStatus && matchesType;
    });
  }

  setViewMode(mode: 'list' | 'grid'): void {
    this.viewMode = mode;
  }

  getStatusClass(estado: string): string {
    switch (estado) {
      case 'finalizado': return 'status-completed';
      case 'en_progreso': return 'status-progress';
      case 'error': return 'status-error';
      case 'pendiente': return 'status-pending';
      default: return 'status-unknown';
    }
  }

  getStatusLabel(estado: string): string {
    switch (estado) {
      case 'finalizado': return 'Completado';
      case 'en_progreso': return 'En progreso';
      case 'error': return 'Error';
      case 'pendiente': return 'Pendiente';
      default: return 'Desconocido';
    }
  }

  getStatusIcon(estado: string): string {
    switch (estado) {
      case 'finalizado': return '✓';
      case 'en_progreso': return '⟳';
      case 'error': return '✗';
      case 'pendiente': return '⏳';
      default: return '?';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getVulnerabilityTypes(types: string[]): string {
    return types.join(', ');
  }

  toggleActionsMenu(scanId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showActionsMenu = this.showActionsMenu === scanId ? null : scanId;
  }

  closeActionsMenu(): void {
    this.showActionsMenu = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.actions-container')) {
      this.closeActionsMenu();
    }
    // Modals are closed by clicking the overlay, handled in template
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.showStatusModal) {
      this.closeStatusModal();
    }
    if (this.showTypeModal) {
      this.closeTypeModal();
    }
    if (this.showDetailsModal) {
      this.closeDetailsModal();
    }
  }

  viewDetails(scan: Scan): void {
    this.loadingDetails = true;
    this.showDetailsModal = true;

    this.scanService.getScanDetails(scan._id).subscribe({
      next: (response) => {
        this.selectedScan = response.scan;
        this.loadingDetails = false;
      },
      error: (error) => {
        this.loadingDetails = false;
        this.closeDetailsModal();
      }
    });
  }

  viewReport(scan: Scan): void {
    this.router.navigate(['/dashboard/scans', scan._id, 'report']);
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedScan = null;
    this.loadingDetails = false;
  }

  visitSite(url: string): void {
    window.open(url, '_blank');
  }

  deleteScan(scan: Scan): void {
    if (confirm(`¿Estás seguro de que quieres eliminar el escaneo "${scan.alias}"?`)) {
      this.scanService.deleteScan(scan._id).subscribe({
        next: () => {
          this.loadScans();
          this.closeActionsMenu();
        },
        error: (error) => {
          alert('Error al eliminar el escaneo');
        }
      });
    }
  }

  goToNewScan(): void {
    this.router.navigate(['/dashboard/new-scan']);
  }

  getSeverityClass(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'critical': return 'severity-critical';
      case 'high': return 'severity-high';
      case 'medium': return 'severity-medium';
      case 'low': return 'severity-low';
      default: return 'severity-unknown';
    }
  }

  getSeverityLabel(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'critical': return 'Crítico';
      case 'high': return 'Alto';
      case 'medium': return 'Medio';
      case 'low': return 'Bajo';
      default: return 'Desconocido';
    }
  }
}
