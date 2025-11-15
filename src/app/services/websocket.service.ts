import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error' | 'debug';
  message: string;
  phase: string;
}

export interface Phase {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed';
  subphases?: Subphase[];
}

export interface Subphase {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed';
}

export interface Endpoint {
  url: string;
  method: string;
  parameters: string[];
}

export interface Parameter {
  endpoint: string;
  name: string;
  type: string;
  testable: boolean;
}

export interface Vulnerability {
  type: string;
  severity: string;
  endpoint: string;
  parameter: string;
  description: string;
}

export interface Question {
  phase: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

export interface QuestionResult {
  phase: string;
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer: number;
  correct: boolean;
  pointsEarned: number;
}

export interface ScanStats {
  totalRequests: number;
  vulnerabilitiesFound: number;
  endpointsDiscovered: number;
  parametersFound: number;
}

export interface ScanStatus {
  scanId: string;
  currentPhase: string;
  isPaused: boolean;
  phases: Phase[];
  discoveredEndpoints: Endpoint[];
  vulnerabilities: Vulnerability[];
  stats: ScanStats;
  logs: LogEntry[];
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: Socket | null = null;
  private connected$ = new BehaviorSubject<boolean>(false);
  
  // Event subjects
  private phaseStarted$ = new Subject<{ phase: string; name: string }>();
  private phaseCompleted$ = new Subject<{ phase: string; name: string }>();
  private subphaseStarted$ = new Subject<{ phase: string; subphase: string; name: string }>();
  private subphaseCompleted$ = new Subject<{ phase: string; subphase: string; name: string }>();
  private logAdded$ = new Subject<LogEntry>();
  private endpointDiscovered$ = new Subject<Endpoint>();
  private parameterDiscovered$ = new Subject<Parameter>();
  private vulnerabilityFound$ = new Subject<Vulnerability>();
  private questionAsked$ = new Subject<Question>();
  private questionResult$ = new Subject<QuestionResult>();
  private scanCompleted$ = new Subject<any>();
  private scanError$ = new Subject<{ message: string }>();
  private scanStatus$ = new Subject<ScanStatus>();
  private scanPaused$ = new Subject<any>();
  private scanResumed$ = new Subject<any>();
  private scanStopped$ = new Subject<any>();

  constructor() {}

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    // Use backendUrl directly (it should not include /api)
    const backendUrl = environment.backendUrl;
    
    this.socket = io(backendUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      this.connected$.next(true);
    });

    this.socket.on('disconnect', () => {
      this.connected$.next(false);
    });

    this.socket.on('error', (error: any) => {
    });

    // Set up event listeners
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('phase:started', (data) => this.phaseStarted$.next(data));
    this.socket.on('phase:completed', (data) => this.phaseCompleted$.next(data));
    this.socket.on('subphase:started', (data) => this.subphaseStarted$.next(data));
    this.socket.on('subphase:completed', (data) => this.subphaseCompleted$.next(data));
    this.socket.on('log:added', (data) => this.logAdded$.next(data));
    this.socket.on('endpoint:discovered', (data) => this.endpointDiscovered$.next(data));
    this.socket.on('parameter:discovered', (data) => this.parameterDiscovered$.next(data));
    this.socket.on('vulnerability:found', (data) => this.vulnerabilityFound$.next(data));
    this.socket.on('question:asked', (data) => this.questionAsked$.next(data));
    this.socket.on('question:result', (data) => this.questionResult$.next(data));
    this.socket.on('scan:completed', (data) => this.scanCompleted$.next(data));
    this.socket.on('scan:error', (data) => this.scanError$.next(data));
    this.socket.on('scan:status', (data) => this.scanStatus$.next(data));
    this.socket.on('scan:paused', (data) => this.scanPaused$.next(data));
    this.socket.on('scan:resumed', (data) => this.scanResumed$.next(data));
    this.socket.on('scan:stopped', (data) => this.scanStopped$.next(data));
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected$.next(false);
    }
  }

  joinScan(scanId: string): void {
    if (!this.socket) {
      return;
    }
    this.socket.emit('scan:join', { scanId });
  }

  leaveScan(scanId: string): void {
    if (!this.socket) return;
    this.socket.emit('scan:leave', { scanId });
  }

  startScan(scanId: string, config: any): void {
    if (!this.socket) {
      return;
    }
    this.socket.emit('scan:start', { scanId, config });
  }

  answerQuestion(scanId: string, selectedAnswer: number): void {
    if (!this.socket) {
      return;
    }
    this.socket.emit('question:answer', { scanId, selectedAnswer });
  }

  pauseScan(scanId: string): void {
    if (!this.socket) {
      return;
    }
    this.socket.emit('scan:pause', { scanId });
  }

  resumeScan(scanId: string): void {
    if (!this.socket) {
      return;
    }
    this.socket.emit('scan:resume', { scanId });
  }

  stopScan(scanId: string): void {
    if (!this.socket) {
      return;
    }
    this.socket.emit('scan:stop', { scanId });
  }

  // Observable getters
  get isConnected$(): Observable<boolean> {
    return this.connected$.asObservable();
  }

  get onPhaseStarted$(): Observable<{ phase: string; name: string }> {
    return this.phaseStarted$.asObservable();
  }

  get onPhaseCompleted$(): Observable<{ phase: string; name: string }> {
    return this.phaseCompleted$.asObservable();
  }

  get onSubphaseStarted$(): Observable<{ phase: string; subphase: string; name: string }> {
    return this.subphaseStarted$.asObservable();
  }

  get onSubphaseCompleted$(): Observable<{ phase: string; subphase: string; name: string }> {
    return this.subphaseCompleted$.asObservable();
  }

  get onLogAdded$(): Observable<LogEntry> {
    return this.logAdded$.asObservable();
  }

  get onEndpointDiscovered$(): Observable<Endpoint> {
    return this.endpointDiscovered$.asObservable();
  }

  get onParameterDiscovered$(): Observable<Parameter> {
    return this.parameterDiscovered$.asObservable();
  }

  get onVulnerabilityFound$(): Observable<Vulnerability> {
    return this.vulnerabilityFound$.asObservable();
  }

  get onQuestionAsked$(): Observable<Question> {
    return this.questionAsked$.asObservable();
  }

  get onQuestionResult$(): Observable<QuestionResult> {
    return this.questionResult$.asObservable();
  }

  get onScanCompleted$(): Observable<any> {
    return this.scanCompleted$.asObservable();
  }

  get onScanError$(): Observable<{ message: string }> {
    return this.scanError$.asObservable();
  }

  get onScanStatus$(): Observable<ScanStatus> {
    return this.scanStatus$.asObservable();
  }

  get onScanPaused$(): Observable<any> {
    return this.scanPaused$.asObservable();
  }

  get onScanResumed$(): Observable<any> {
    return this.scanResumed$.asObservable();
  }

  get onScanStopped$(): Observable<any> {
    return this.scanStopped$.asObservable();
  }
}
