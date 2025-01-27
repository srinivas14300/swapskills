import { v4 as uuidv4 } from 'uuid';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { analytics } from '../firebase';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: any;
  userId?: string;
}

export class AdvancedLogger {
  private static instance: AdvancedLogger;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize: number = 100;
  private userId?: string;

  private constructor() {
    this.setupUnhandledErrorListeners();
  }

  public static getInstance(): AdvancedLogger {
    if (!AdvancedLogger.instance) {
      AdvancedLogger.instance = new AdvancedLogger();
    }
    return AdvancedLogger.instance;
  }

  private setupUnhandledErrorListeners() {
    // Browser global error handler
    window.addEventListener('error', (event) => {
      this.critical('Unhandled Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.critical('Unhandled Promise Rejection', {
        reason: event.reason
      });
    });
  }

  public setUserId(userId: string) {
    this.userId = userId;
  }

  private createLogEntry(
    level: LogLevel, 
    message: string, 
    context?: any
  ): LogEntry {
    const entry: LogEntry = {
      id: uuidv4(),
      timestamp: Date.now(),
      level,
      message,
      context,
      userId: this.userId
    };

    // Manage log buffer
    if (this.logBuffer.length >= this.maxBufferSize) {
      this.logBuffer.shift();
    }
    this.logBuffer.push(entry);

    return entry;
  }

  private log(
    level: LogLevel, 
    message: string, 
    context?: any
  ) {
    const entry = this.createLogEntry(level, message, context);

    // Console logging
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(message, context);
        break;
      case LogLevel.INFO:
        console.info(message, context);
        break;
      case LogLevel.WARN:
        console.warn(message, context);
        break;
      case LogLevel.ERROR:
        console.error(message, context);
        break;
      case LogLevel.CRITICAL:
        console.error(`🚨 CRITICAL: ${message}`, context);
        break;
    }

    // Firebase Analytics logging
    this.logToAnalytics(entry);
  }

  private logToAnalytics(entry: LogEntry) {
    try {
      // Log only errors and critical events to analytics
      if (entry.level === LogLevel.ERROR || entry.level === LogLevel.CRITICAL) {
        logEvent(analytics, 'error_log', {
          error_message: entry.message,
          error_context: JSON.stringify(entry.context),
          user_id: entry.userId
        });
      }
    } catch (analyticsError) {
      console.error('Analytics logging failed', analyticsError);
    }
  }

  public debug(message: string, context?: any) {
    this.log(LogLevel.DEBUG, message, context);
  }

  public info(message: string, context?: any) {
    this.log(LogLevel.INFO, message, context);
  }

  public warn(message: string, context?: any) {
    this.log(LogLevel.WARN, message, context);
  }

  public error(message: string, context?: any) {
    this.log(LogLevel.ERROR, message, context);
  }

  public critical(message: string, context?: any) {
    this.log(LogLevel.CRITICAL, message, context);
  }

  public getLogHistory(limit: number = 50): LogEntry[] {
    return this.logBuffer.slice(-limit);
  }

  public clearLogHistory() {
    this.logBuffer = [];
  }

  // Advanced error tracking method
  public trackError(
    error: Error, 
    additionalContext?: any
  ) {
    this.critical('Tracked Error', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...additionalContext
    });
  }
}

// Singleton export
export const advancedLogger = AdvancedLogger.getInstance();
