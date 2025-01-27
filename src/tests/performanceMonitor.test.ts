import { PerformanceMonitor } from '../utils/performanceMonitor';
import { logger } from '../utils/logger';

jest.mock('../utils/logger');

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset performance metrics
    (PerformanceMonitor as any).performanceMetrics = {};
    (PerformanceMonitor as any).startTimes = {};
  });

  describe('Basic Performance Tracking', () => {
    it('should measure operation duration', () => {
      PerformanceMonitor.start('testOperation');
      
      // Simulate some work
      const mockWork = () => {
        let total = 0;
        for (let i = 0; i < 1000; i++) {
          total += i;
        }
        return total;
      };
      mockWork();

      const duration = PerformanceMonitor.end('testOperation');
      
      expect(duration).toBeGreaterThan(0);
    });

    it('should track multiple performance metrics', () => {
      PerformanceMonitor.start('operation1');
      PerformanceMonitor.end('operation1');
      
      PerformanceMonitor.start('operation2');
      PerformanceMonitor.end('operation2');

      const report = PerformanceMonitor.generatePerformanceReport();
      
      expect(report['operation1']).toBeDefined();
      expect(report['operation2']).toBeDefined();
    });
  });

  describe('Performance Decorator', () => {
    class TestClass {
      @PerformanceMonitor.track()
      slowMethod() {
        // Simulate a slow operation
        const start = Date.now();
        while (Date.now() - start < 50) {}
      }
    }

    it('should track method performance', () => {
      const testInstance = new TestClass();
      
      PerformanceMonitor.start('slowMethod');
      testInstance.slowMethod();
      const duration = PerformanceMonitor.end('slowMethod');

      expect(duration).toBeGreaterThan(50);
    });
  });

  describe('Performance Logging', () => {
    it('should log slow operations', () => {
      PerformanceMonitor.start('slowOperation');
      
      // Simulate a slow operation
      const start = Date.now();
      while (Date.now() - start < 1500) {}

      PerformanceMonitor.end('slowOperation');

      // Check if warning was logged for slow operation
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Slow operation'),
        expect.objectContaining({ duration: expect.any(String) })
      );
    });

    it('should calculate average performance', () => {
      PerformanceMonitor.start('averageTest');
      PerformanceMonitor.end('averageTest');
      
      PerformanceMonitor.start('averageTest');
      PerformanceMonitor.end('averageTest');

      const averageTime = PerformanceMonitor.getAveragePerformance('averageTest');
      
      expect(averageTime).toBeGreaterThan(0);
    });
  });
});
