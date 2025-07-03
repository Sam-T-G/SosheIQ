import React, { useEffect } from 'react';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isEnabled: boolean = process.env.NODE_ENV === 'development';

  startTimer(name: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata
    });
  }

  endTimer(name: string): number | null {
    if (!this.isEnabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance timer "${name}" was not started`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    // Log slow operations
    if (metric.duration > 100) {
      console.warn(`Slow operation detected: ${name} took ${metric.duration.toFixed(2)}ms`, metric.metadata);
    }

    return metric.duration;
  }

  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  generateReport(): string {
    const metrics = this.getAllMetrics();
    if (metrics.length === 0) return 'No performance metrics recorded';

    const report = metrics
      .filter(m => m.duration !== undefined)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .map(m => `${m.name}: ${m.duration?.toFixed(2)}ms`)
      .join('\n');

    return `Performance Report:\n${report}`;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for measuring component render performance
export function usePerformanceTimer(name: string, dependencies: any[] = []): void {
  if (process.env.NODE_ENV !== 'development') return;

  useEffect(() => {
    performanceMonitor.startTimer(name);
    
    return () => {
      performanceMonitor.endTimer(name);
    };
  }, dependencies);
}

// Simple performance tracking decorator
export function trackPerformance<T extends (...args: any[]) => any>(
  fn: T,
  name?: string
): T {
  const functionName = name || fn.name || 'anonymous';
  
  return ((...args: any[]) => {
    performanceMonitor.startTimer(functionName);
    try {
      const result = fn(...args);
      performanceMonitor.endTimer(functionName);
      return result;
    } catch (error) {
      performanceMonitor.endTimer(functionName);
      throw error;
    }
  }) as T;
}

// Utility for measuring async operations
export async function measureAsyncOperation<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  performanceMonitor.startTimer(name);
  
  try {
    const result = await operation();
    performanceMonitor.endTimer(name);
    return result;
  } catch (error) {
    performanceMonitor.endTimer(name);
    throw error;
  }
}

// Utility for measuring synchronous operations
export function measureSyncOperation<T>(
  name: string,
  operation: () => T
): T {
  performanceMonitor.startTimer(name);
  
  try {
    const result = operation();
    performanceMonitor.endTimer(name);
    return result;
  } catch (error) {
    performanceMonitor.endTimer(name);
    throw error;
  }
}

// Memory usage monitoring
export function getMemoryUsage(): {
  used: number;
  total: number;
  percentage: number;
} | null {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
    };
  }
  return null;
}

// Network performance monitoring
export function measureNetworkRequest(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const startTime = performance.now();
  
  return fetch(url, options).finally(() => {
    const duration = performance.now() - startTime;
    if (duration > 1000) {
      console.warn(`Slow network request: ${url} took ${duration.toFixed(2)}ms`);
    }
  });
} 