import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, Typography, Grid, LinearProgress } from '@mui/material';
import { advancedLogger, LogLevel, LogEntry } from '../utils/advancedLogger';
import { authMonitoring } from '../utils/authMonitoring';
import { PerformanceMonitor } from '../utils/performanceMonitor';

const MonitoringDashboard: React.FC = () => {
  const [logHistory, setLogHistory] = useState<LogEntry[]>([]);
  const [authStats, setAuthStats] = useState<any>(null);
  const [performanceReport, setPerformanceReport] = useState<any>(null);

  useEffect(() => {
    // Fetch log history
    const logs = advancedLogger.getLogHistory(20);
    setLogHistory(logs);

    // Fetch authentication stats
    const stats = authMonitoring.getAuthStats();
    setAuthStats(stats);

    // Fetch performance report
    const performanceData = PerformanceMonitor.generatePerformanceReport();
    setPerformanceReport(performanceData);
  }, []);

  const renderLogLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.CRITICAL: return 'error';
      case LogLevel.ERROR: return 'error';
      case LogLevel.WARN: return 'warning';
      case LogLevel.INFO: return 'info';
      case LogLevel.DEBUG: return 'primary';
      default: return 'default';
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Authentication Stats Card */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Authentication Statistics" />
          <CardContent>
            {authStats && (
              <>
                <Typography>Total Attempts: {authStats.totalAttempts}</Typography>
                <Typography>Successful Logins: {authStats.successfulLogins}</Typography>
                <Typography>Failed Logins: {authStats.failedLogins}</Typography>
                <Typography>Success Rate: {authStats.successRate.toFixed(2)}%</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={authStats.successRate} 
                  color={authStats.successRate > 75 ? 'primary' : 'secondary'}
                />
              </>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Performance Monitoring Card */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Performance Metrics" />
          <CardContent>
            {performanceReport && Object.entries(performanceReport).map(([key, metrics]) => (
              <div key={key}>
                <Typography>
                  {key}: {(metrics as any).averageTime.toFixed(2)}ms 
                  (Calls: {(metrics as any).totalCalls})
                </Typography>
              </div>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Log History Card */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Recent Log History" />
          <CardContent>
            {logHistory.map((log) => (
              <Typography 
                key={log.id} 
                color={renderLogLevelColor(log.level)}
                variant="body2"
              >
                [{log.level}] {log.message}
              </Typography>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default MonitoringDashboard;
