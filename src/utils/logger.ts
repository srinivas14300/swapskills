import toast from 'react-hot-toast';

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

export class Logger {
  private static instance: Logger;
  private logHistory: string[] = [];

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, context?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}`;
    
    this.logHistory.push(logEntry);

    // Console logging
    switch (level) {
      case LogLevel.ERROR:
        console.error(logEntry, context);
        break;
      case LogLevel.WARN:
        console.warn(logEntry, context);
        break;
      case LogLevel.DEBUG:
        console.debug(logEntry, context);
        break;
      default:
        console.log(logEntry, context);
    }

    // Optional toast for critical errors
    if (level === LogLevel.ERROR) {
      toast.error(message, {
        duration: 4000,
        position: 'top-right'
      });
    }
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

  public debug(message: string, context?: any) {
    this.log(LogLevel.DEBUG, message, context);
  }

  public getLogHistory(limit: number = 50): string[] {
    return this.logHistory.slice(-limit);
  }

  public clearLogHistory() {
    this.logHistory = [];
  }
}

// Singleton export
export const logger = Logger.getInstance();
