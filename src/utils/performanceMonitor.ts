import { logger } from './logger';

export class PerformanceMonitor {
  private static startTimes: { [key: string]: number } = {};
  private static performanceMetrics: { [key: string]: number[] } = {};

  static start(key: string): void {
    this.startTimes[key] = performance.now();
  }

  static end(key: string): number {
    const startTime = this.startTimes[key];
    if (!startTime) {
      console.warn(`No start time found for ${key}`);
      return -1;
    }

    const duration = performance.now() - startTime;
    
    // Track performance metrics
    if (!this.performanceMetrics[key]) {
      this.performanceMetrics[key] = [];
    }
    this.performanceMetrics[key].push(duration);

    // Log performance if it exceeds threshold
    if (duration > 1000) {  // Log if over 1 second
      logger.warn(`Slow operation: ${key}`, { 
        duration: `${duration.toFixed(2)}ms` 
      });
    }

    return duration;
  }

  static getAveragePerformance(key: string): number {
    const metrics = this.performanceMetrics[key] || [];
    if (metrics.length === 0) return 0;
    
    const average = metrics.reduce((a, b) => a + b, 0) / metrics.length;
    return Number(average.toFixed(2));
  }

  static generatePerformanceReport(): { [key: string]: { 
    averageTime: number, 
    totalCalls: number 
  } } {
    const report: { [key: string]: { 
      averageTime: number, 
      totalCalls: number 
    } } = {};

    Object.keys(this.performanceMetrics).forEach(key => {
      const metrics = this.performanceMetrics[key];
      report[key] = {
        averageTime: this.getAveragePerformance(key),
        totalCalls: metrics.length
      };
    });

    return report;
  }

  // Decorator for easy performance tracking
  static track() {
    return function (
      target: any, 
      propertyKey: string, 
      descriptor: PropertyDescriptor
    ) {
      const originalMethod = descriptor.value;

      descriptor.value = function (...args: any[]) {
        PerformanceMonitor.start(propertyKey);
        const result = originalMethod.apply(this, args);
        PerformanceMonitor.end(propertyKey);
        return result;
      };

      return descriptor;
    };
  }
}

// Example usage in authentication context
export function trackAuthPerformance() {
  return PerformanceMonitor.track();
}
