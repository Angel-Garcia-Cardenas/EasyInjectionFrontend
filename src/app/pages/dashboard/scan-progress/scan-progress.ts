import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTimesCircle,
  faSyncAlt,
  faPause,
  faCheckCircle,
  faPlay,
  faStop,
  faFileAlt,
  faClipboardList,
  faChartBar,
  faSearch,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { 
  WebsocketService, 
  Phase, 
  LogEntry, 
  Endpoint, 
  Vulnerability, 
  Question, 
  QuestionResult, 
  ScanStats 
} from '../../../services/websocket.service';
import { ScanService } from '../../../services/scan.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-scan-progress',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './scan-progress.html',
  styleUrls: ['./scan-progress.scss']
})
export class ScanProgressComponent implements OnInit, OnDestroy, AfterViewInit {
  faTimesCircle = faTimesCircle;
  faSyncAlt = faSyncAlt;
  faPause = faPause;
  faCheckCircle = faCheckCircle;
  faPlay = faPlay;
  faStop = faStop;
  faFileAlt = faFileAlt;
  faClipboardList = faClipboardList;
  faChartBar = faChartBar;
  faSearch = faSearch;
  faExclamationTriangle = faExclamationTriangle;
  @ViewChild('logsContainer', { static: false }) logsContainer!: ElementRef<HTMLDivElement>;
  
  scanId: string = '';
  scanUrl: string = '';
  scanAlias: string = '';
  scanFlags: any = {};
  
  // Scan state
  isScanning = false;
  isPaused = false;
  scanComplete = false;
  scanError = false;
  errorMessage = '';
  overallProgress = 0;
  isConnecting = true;

  // Scan phases
  scanPhases: Phase[] = [];
  currentPhase: string = '';

  // Initialize default phases structure
  private initializeDefaultPhases(): void {
    this.scanPhases = [
      { id: 'init', name: 'Inicialización', status: 'pending' },
      { id: 'discovery', name: 'Descubrimiento de endpoints y parámetros', status: 'pending' },
      { 
        id: 'sqli', 
        name: 'Pruebas SQL Injection', 
        status: 'pending', 
        subphases: [
          { id: 'detection', name: 'Detección de vulnerabilidad', status: 'pending' },
          { id: 'fingerprint', name: 'Fingerprinting', status: 'pending' },
          { id: 'technique', name: 'Selección de técnica', status: 'pending' },
          { id: 'exploit', name: 'Explotación (POC)', status: 'pending' }
        ]
      },
      { 
        id: 'xss', 
        name: 'Pruebas XSS', 
        status: 'pending', 
        subphases: [
          { id: 'context', name: 'Análisis de contexto', status: 'pending' },
          { id: 'payload', name: 'Generación de payloads', status: 'pending' },
          { id: 'fuzzing', name: 'Motor de fuzzing', status: 'pending' }
        ]
      },
      { id: 'report', name: 'Generación de reporte', status: 'pending' }
    ];
    
    // Filter phases based on scan flags
    if (!this.scanFlags.sqli) {
      this.scanPhases = this.scanPhases.filter(p => p.id !== 'sqli');
    }
    if (!this.scanFlags.xss) {
      this.scanPhases = this.scanPhases.filter(p => p.id !== 'xss');
    }
  }

  // Discovered endpoints
  discoveredEndpoints: Endpoint[] = [];

  // Scan logs
  scanLogs: LogEntry[] = [];
  maxLogsDisplay = 100;
  private shouldAutoScroll = false; // Track if user is at bottom (starts false to prevent auto-scroll on load)
  private scrollHandler: (() => void) | null = null; // Store scroll handler for cleanup

  // Detected vulnerabilities
  detectedVulnerabilities: Vulnerability[] = [];

  // Evaluation questions
  currentQuestion: Question | null = null;
  questionHistory: QuestionResult[] = [];
  showQuestion = false;
  selectedOption: number | null = null;
  hasAnswered = false;
  currentQuestionCorrect = false;

  // Completion modal
  showCompletionModal = true;

  // Statistics
  scanStats: ScanStats = {
    totalRequests: 0,
    vulnerabilitiesFound: 0,
    endpointsDiscovered: 0,
    parametersFound: 0
  };

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private websocketService: WebsocketService,
    private scanService: ScanService
  ) {}

  ngOnInit(): void {
    // Get scan ID from route
    this.scanId = this.route.snapshot.params['id'];
    
    if (!this.scanId) {
      this.errorMessage = 'No se especificó ID de escaneo';
      this.scanError = true;
      return;
    }

    // Load scan details
    this.loadScanDetails();
    
    // Connect to WebSocket
    this.connectWebSocket();
    
    // Set up WebSocket event listeners
    this.setupWebSocketListeners();
  }

  ngAfterViewInit(): void {
    // Scroll to top on initial load
    this.scrollToTop();
    
    // Set up scroll listener after view is initialized
    // Use setTimeout to ensure the view is fully rendered
    setTimeout(() => {
      if (this.logsContainer && this.logsContainer.nativeElement) {
        // Store handler reference for cleanup
        this.scrollHandler = () => this.onLogsScroll();
        this.logsContainer.nativeElement.addEventListener('scroll', this.scrollHandler);
        
        // Check initial position - if container is small or already at bottom, enable auto-scroll
        const container = this.logsContainer.nativeElement;
        if (container.scrollHeight <= container.clientHeight) {
          // Container doesn't need scrolling (all content visible)
          this.shouldAutoScroll = true;
        } else {
          // Container has scrollable content, start at top
          this.shouldAutoScroll = false;
        }
      }
    }, 200);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all observables
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Remove scroll event listener
    if (this.logsContainer && this.logsContainer.nativeElement && this.scrollHandler) {
      this.logsContainer.nativeElement.removeEventListener('scroll', this.scrollHandler);
    }
    
    // Leave scan room
    if (this.scanId) {
      this.websocketService.leaveScan(this.scanId);
    }
  }

  loadScanDetails(): void {
    this.scanService.getScanReport(this.scanId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.scanUrl = response.report.scan.url;
          this.scanAlias = response.report.scan.alias;
          this.scanFlags = response.report.scan.flags;
          
          // Initialize default phases after loading scan flags
          this.initializeDefaultPhases();
        }
      },
      error: (error) => {
        // Initialize with default flags if error
        this.scanFlags = { sqli: true, xss: true };
        this.initializeDefaultPhases();
      }
    });
  }

  connectWebSocket(): void {
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.errorMessage = 'No se encontró token de autenticación';
      this.scanError = true;
      return;
    }
  
    this.websocketService.connect(token);
  
    const connectionSub = this.websocketService.isConnected$.subscribe(connected => {
      if (connected) {
        this.isConnecting = false;
        this.websocketService.joinScan(this.scanId);
  
        // Esperar hasta que se carguen los detalles
        const waitForDetails = setInterval(() => {
          if (this.scanUrl && Object.keys(this.scanFlags).length > 0) {
            clearInterval(waitForDetails);
            this.startScan();
          }
        }, 500);
      }
    });
  
    this.subscriptions.push(connectionSub);
  }  

  setupWebSocketListeners(): void {
    // Phase events
    const phaseStartedSub = this.websocketService.onPhaseStarted$.subscribe(data => {
      this.currentPhase = data.phase;
      const phase = this.scanPhases.find(p => p.id === data.phase);
      if (phase) {
        phase.status = 'running';
      }
      this.isScanning = true;
    });

    const phaseCompletedSub = this.websocketService.onPhaseCompleted$.subscribe(data => {
      const phase = this.scanPhases.find(p => p.id === data.phase);
      if (phase) {
        phase.status = 'completed';
      }
      this.updateOverallProgress();
    });

    // Subphase events
    const subphaseStartedSub = this.websocketService.onSubphaseStarted$.subscribe(data => {
      const phase = this.scanPhases.find(p => p.id === data.phase);
      if (phase && phase.subphases) {
        const subphase = phase.subphases.find(s => s.id === data.subphase);
        if (subphase) {
          subphase.status = 'running';
        }
      }
    });

    const subphaseCompletedSub = this.websocketService.onSubphaseCompleted$.subscribe(data => {
      const phase = this.scanPhases.find(p => p.id === data.phase);
      if (phase && phase.subphases) {
        const subphase = phase.subphases.find(s => s.id === data.subphase);
        if (subphase) {
          subphase.status = 'completed';
        }
      }
      this.updateOverallProgress();
    });

    // Log events
    const logSub = this.websocketService.onLogAdded$.subscribe(log => {
      this.scanLogs.push(log);
      if (this.scanLogs.length > this.maxLogsDisplay) {
        this.scanLogs.shift();
      }
      // Only auto-scroll if user is at the bottom
      if (this.shouldAutoScroll) {
        this.scrollLogsToBottom();
      }
    });

    // Discovery events
    const endpointSub = this.websocketService.onEndpointDiscovered$.subscribe(endpoint => {
      this.discoveredEndpoints.push(endpoint);
      this.scanStats.endpointsDiscovered++;
    });

    const parameterSub = this.websocketService.onParameterDiscovered$.subscribe(parameter => {
      this.scanStats.parametersFound++;
    });

    // Vulnerability events
    const vulnSub = this.websocketService.onVulnerabilityFound$.subscribe(vuln => {
      this.detectedVulnerabilities.push(vuln);
      this.scanStats.vulnerabilitiesFound++;
    });

    // Question events
    const questionSub = this.websocketService.onQuestionAsked$.subscribe(question => {
      this.currentQuestion = question;
      this.showQuestion = true;
      this.isPaused = true;
      this.selectedOption = null;
      this.hasAnswered = false;
      this.currentQuestionCorrect = false;
    });

    const questionResultSub = this.websocketService.onQuestionResult$.subscribe(result => {
      this.questionHistory.push(result);
      this.hasAnswered = true;
      this.currentQuestionCorrect = result.correct;
      
      // Only hide question and resume if answer is correct
      // If incorrect, keep showing the question so user can try again
      if (result.correct) {
        this.showQuestion = false;
        this.isPaused = false;
        this.currentQuestion = null;
        this.hasAnswered = false;
        this.currentQuestionCorrect = false;
        this.selectedOption = null;
      } else {
        // Keep question visible, allow user to select a new answer
        // Reset selectedOption so user can choose again
        // But keep hasAnswered = true to show "Intentar de nuevo" button
      }
    });

    // Scan completion
    const completedSub = this.websocketService.onScanCompleted$.subscribe(data => {
      this.scanComplete = true;
      this.isScanning = false;
      this.scanStats = data.stats;
      this.updateOverallProgress();
      this.showCompletionModal = true; // Show modal when scan completes
    });

    // Error events
    const errorSub = this.websocketService.onScanError$.subscribe(error => {
      this.scanError = true;
      this.isScanning = false;
      this.errorMessage = error.message;
    });

    // Scan control events
    const pausedSub = this.websocketService.onScanPaused$?.subscribe(() => {
      this.isPaused = true;
    });

    const resumedSub = this.websocketService.onScanResumed$?.subscribe(() => {
      this.isPaused = false;
    });

    const stoppedSub = this.websocketService.onScanStopped$?.subscribe(() => {
      this.isScanning = false;
      this.isPaused = false;
      this.scanError = true;
      this.errorMessage = 'Escaneo detenido por el usuario';
    });

    // Status updates
    const statusSub = this.websocketService.onScanStatus$.subscribe(status => {
      if (status.phases && status.phases.length > 0) {
        // Update phases from backend status
        this.scanPhases = status.phases;
        this.updateOverallProgress();
      } else if (this.scanPhases.length === 0) {
        // If no phases received and none initialized, initialize defaults
        this.initializeDefaultPhases();
      }
      if (status.currentPhase) {
        this.currentPhase = status.currentPhase;
      }
      if (status.isPaused !== undefined) {
        this.isPaused = status.isPaused;
      }
      if (status.discoveredEndpoints) {
        this.discoveredEndpoints = status.discoveredEndpoints;
      }
      if (status.vulnerabilities) {
        this.detectedVulnerabilities = status.vulnerabilities;
      }
      if (status.stats) {
        this.scanStats = status.stats;
      }
      if (status.logs) {
        this.scanLogs = status.logs;
        // Don't auto-scroll when loading initial status - let user see from top
        this.shouldAutoScroll = false;
      }
    });

    // Store all subscriptions
    this.subscriptions.push(
      phaseStartedSub,
      phaseCompletedSub,
      subphaseStartedSub,
      subphaseCompletedSub,
      logSub,
      endpointSub,
      parameterSub,
      vulnSub,
      questionSub,
      questionResultSub,
      completedSub,
      errorSub,
      statusSub
    );

    // Add pause/resume/stop subscriptions if they exist
    if (pausedSub) this.subscriptions.push(pausedSub);
    if (resumedSub) this.subscriptions.push(resumedSub);
    if (stoppedSub) this.subscriptions.push(stoppedSub);
  }

  startScan(): void {
    // Retrieve additional config from localStorage (set by new-scan component)
    const scanConfigKey = `scan_config_${this.scanId}`;
    const storedConfig = localStorage.getItem(scanConfigKey);
    let additionalConfig: any = {};
    
    if (storedConfig) {
      try {
        additionalConfig = JSON.parse(storedConfig);
        // Clean up after reading
        localStorage.removeItem(scanConfigKey);
      } catch (e) {
      }
    }

    const config = {
      url: this.scanUrl?.trim(),
      flags: this.scanFlags && Object.keys(this.scanFlags).length > 0
        ? this.scanFlags
        : { sqli: true, xss: true },
      dbms: additionalConfig.dbms,
      customHeaders: additionalConfig.customHeaders
    };    

    this.websocketService.startScan(this.scanId, config);
    this.isScanning = true;
  }

  onOptionChange(selectedIndex: number): void {
    // When user changes option after incorrect answer, allow them to retry with new selection
    if (this.hasAnswered && !this.currentQuestionCorrect) {
      // Reset answered state when user changes selection to allow retry
      this.hasAnswered = false;
    }
  }

  answerQuestion(selectedAnswer: number): void {
    if (!this.currentQuestion) return;

    this.selectedOption = selectedAnswer;
    
    // Always send the answer to backend
    // Backend will handle retries - it keeps the question active until correct
    this.websocketService.answerQuestion(this.scanId, selectedAnswer);
    
    // If this is a retry after incorrect answer, reset hasAnswered state
    // so the button shows "Responder" again while waiting for backend response
    if (this.hasAnswered && !this.currentQuestionCorrect) {
      this.hasAnswered = false;
    }
  }

  closeCompletionModal(): void {
    this.showCompletionModal = false;
  }

  pauseScan(): void {
    if (this.isPaused) {
      // Resume if paused
      this.websocketService.resumeScan(this.scanId);
    } else {
      // Pause if running
      this.websocketService.pauseScan(this.scanId);
    }
  }

  stopScan(): void {
    if (confirm('¿Está seguro de que desea detener el escaneo? El progreso actual se perderá.')) {
      this.websocketService.stopScan(this.scanId);
      // Navigate away after a short delay
      setTimeout(() => {
        this.goToScans();
      }, 1000);
    }
  }

  updateOverallProgress(): void {
    if (this.scanPhases.length === 0) return;

    let totalWeight = 0;
    let completedWeight = 0;

    this.scanPhases.forEach(phase => {
      if (phase.subphases && phase.subphases.length > 0) {
        const subphaseWeight = 1 / phase.subphases.length;
        phase.subphases.forEach(subphase => {
          totalWeight += subphaseWeight;
          if (subphase.status === 'completed') {
            completedWeight += subphaseWeight;
          }
        });
      } else {
        totalWeight += 1;
        if (phase.status === 'completed') {
          completedWeight += 1;
        }
      }
    });

    this.overallProgress = totalWeight > 0 
      ? Math.round((completedWeight / totalWeight) * 100) 
      : 0;
  }

  scrollLogsToBottom(): void {
    if (!this.shouldAutoScroll) return;
    
    setTimeout(() => {
      if (this.logsContainer && this.logsContainer.nativeElement) {
        const container = this.logsContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  onLogsScroll(): void {
    if (!this.logsContainer || !this.logsContainer.nativeElement) return;
    
    const container = this.logsContainer.nativeElement;
    const threshold = 50; // pixels from bottom to consider "at bottom"
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    
    this.shouldAutoScroll = isAtBottom;
  }

  scrollToTop(): void {
    // Scroll the main page to top
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Also ensure logs container is at top when initialized
    setTimeout(() => {
      if (this.logsContainer && this.logsContainer.nativeElement) {
        this.logsContainer.nativeElement.scrollTop = 0;
      }
    }, 100);
  }

  // Utility methods
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

  getLogLevelClass(level: string): string {
    return `log-${level}`;
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getPhaseStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return '✓';
      case 'running': return '⟳';
      case 'pending': return '○';
      default: return '?';
    }
  }

  goToReport(): void {
    this.router.navigate(['/dashboard/scans', this.scanId, 'report']);
  }

  goToScans(): void {
    this.router.navigate(['/dashboard/scans']);
  }

  calculateQuizScore(): number {
    if (this.questionHistory.length === 0) return 0;
    const correctAnswers = this.questionHistory.filter(q => q.correct).length;
    return Math.round((correctAnswers / this.questionHistory.length) * 100);
  }

  getTotalPoints(): number {
    return this.questionHistory.reduce((sum, q) => sum + q.pointsEarned, 0);
  }

  getMaxPoints(): number {
    // Since we don't have the original points in history, estimate based on correct answers
    // In a real scenario, you'd want to store this separately
    return this.questionHistory.length * 20; // Assuming average 20 points per question
  }

  getCorrectAnswersCount(): number {
    return this.questionHistory.filter(q => q.correct).length;
  }

  getPhaseName(phaseId: string): string {
    const phaseNames: { [key: string]: string } = {
      'init': 'Inicialización',
      'discovery': 'Descubrimiento',
      'sqli': 'SQLi',
      'sqli-detection': 'SQLi - Detección',
      'sqli-fingerprint': 'SQLi - Fingerprint',
      'sqli-technique': 'SQLi - Técnica',
      'sqli-exploit': 'SQLi - Explotación',
      'xss': 'XSS',
      'xss-context': 'XSS - Contexto',
      'xss-payload': 'XSS - Payloads',
      'xss-fuzzing': 'XSS - Fuzzing',
      'report': 'Reporte'
    };
    return phaseNames[phaseId] || phaseId;
  }
}
