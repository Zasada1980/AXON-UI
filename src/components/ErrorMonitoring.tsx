import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  Bug,
  Warning,
  CheckCircle,
  XCircle,
  Clock,
  Lightning,
  Activity,
  TrendUp,
  ArrowsClockwise
} from '@phosphor-icons/react';

interface ErrorLog {
  id: string;
  timestamp: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  resolved: boolean;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  threshold: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface ErrorMonitoringProps {
  language: 'en' | 'ru';
  onErrorDetected?: (error: ErrorLog) => void;
}

const ErrorMonitoring: React.FC<ErrorMonitoringProps> = ({ 
  language, 
  onErrorDetected 
}) => {
  const [errors, setErrors] = useKV<ErrorLog[]>('system-errors', []);
  const [metrics, setMetrics] = useKV<PerformanceMetric[]>('performance-metrics', []);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  const t = (key: string) => {
    const translations: { [key: string]: { en: string; ru: string } } = {
      errorMonitoring: { en: 'Error Monitoring', ru: 'Мониторинг Ошибок' },
      systemHealth: { en: 'System Health', ru: 'Состояние Системы' },
      errorLogs: { en: 'Error Logs', ru: 'Журнал Ошибок' },
      performance: { en: 'Performance Metrics', ru: 'Метрики Производительности' },
      startMonitoring: { en: 'Start Monitoring', ru: 'Начать Мониторинг' },
      stopMonitoring: { en: 'Stop Monitoring', ru: 'Остановить Мониторинг' },
      clearErrors: { en: 'Clear Errors', ru: 'Очистить Ошибки' },
      noErrors: { en: 'No errors detected', ru: 'Ошибки не обнаружены' },
      resolved: { en: 'Resolved', ru: 'Решено' },
      unresolved: { en: 'Unresolved', ru: 'Нерешено' },
      critical: { en: 'Critical', ru: 'Критическая' },
      high: { en: 'High', ru: 'Высокая' },
      medium: { en: 'Medium', ru: 'Средняя' },
      low: { en: 'Low', ru: 'Низкая' },
      lastCheck: { en: 'Last Check', ru: 'Последняя Проверка' },
      never: { en: 'Never', ru: 'Никогда' },
      runCheck: { en: 'Run Health Check', ru: 'Проверить Состояние' }
    };
    return translations[key]?.[language] || key;
  };

  // Initialize default metrics
  useEffect(() => {
    if (!metrics || metrics.length === 0) {
      const defaultMetrics: PerformanceMetric[] = [
        {
          id: 'memory-usage',
          name: language === 'ru' ? 'Использование памяти' : 'Memory Usage',
          value: 0,
          threshold: 80,
          unit: '%',
          status: 'good' as const,
          trend: 'stable' as const
        },
        {
          id: 'response-time',
          name: language === 'ru' ? 'Время отклика' : 'Response Time',
          value: 0,
          threshold: 1000,
          unit: 'ms',
          status: 'good' as const,
          trend: 'stable' as const
        },
        {
          id: 'error-rate',
          name: language === 'ru' ? 'Частота ошибок' : 'Error Rate',
          value: 0,
          threshold: 5,
          unit: '%',
          status: 'good' as const,
          trend: 'stable' as const
        }
      ];
      setMetrics(defaultMetrics);
    }
  }, []);

  // Simulate error monitoring
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isMonitoring) {
      interval = setInterval(() => {
        checkSystemHealth();
      }, 5000); // Check every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring]);

  const checkSystemHealth = () => {
    // Simulate system health check
    const currentMetrics = metrics || [];
    const newMetrics = currentMetrics.map(metric => {
      const variation = (Math.random() - 0.5) * 20;
      let newValue = Math.max(0, metric.value + variation);
      
      // Simulate different behaviors for different metrics
      if (metric.id === 'memory-usage') {
        newValue = Math.min(100, newValue + Math.random() * 5);
      } else if (metric.id === 'response-time') {
        newValue = Math.max(50, newValue + (Math.random() - 0.5) * 100);
      } else if (metric.id === 'error-rate') {
        newValue = Math.max(0, Math.min(15, newValue + (Math.random() - 0.7) * 2));
      }

      const status: 'good' | 'warning' | 'critical' = newValue > metric.threshold ? 'critical' : 
                    newValue > metric.threshold * 0.8 ? 'warning' : 'good';

      const trend: 'up' | 'down' | 'stable' = newValue > metric.value ? 'up' : newValue < metric.value ? 'down' : 'stable';

      return {
        ...metric,
        value: Math.round(newValue * 100) / 100,
        status,
        trend
      };
    });

    setMetrics(newMetrics);
    setLastCheck(new Date().toISOString());

    // Check for potential errors
    const criticalMetrics = newMetrics.filter(m => m.status === 'critical');
    if (criticalMetrics.length > 0 && Math.random() > 0.7) {
      const metric = criticalMetrics[0];
      const newError: ErrorLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: 'error',
        message: `${metric.name} exceeded threshold: ${metric.value}${metric.unit} > ${metric.threshold}${metric.unit}`,
        resolved: false,
        category: 'performance',
        severity: 'high'
      };

      setErrors(current => [...(current || []), newError]);
      onErrorDetected?.(newError);
      toast.error(`Performance issue detected: ${metric.name}`);
    }
  };

  const resolveError = (errorId: string) => {
    setErrors(current => 
      (current || []).map(error => 
        error.id === errorId ? { ...error, resolved: true } : error
      )
    );
    toast.success(t('resolved'));
  };

  const clearAllErrors = () => {
    setErrors([]);
    toast.success('Errors cleared');
  };

  const getHealthScore = () => {
    if (!metrics || !Array.isArray(metrics) || metrics.length === 0) return 100;
    
    const scores = metrics.map(metric => {
      if (metric.status === 'good') return 100;
      if (metric.status === 'warning') return 70;
      return 30;
    });
    
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle size={16} className="text-green-500" />;
      case 'warning': return <Warning size={16} className="text-yellow-500" />;
      case 'critical': return <XCircle size={16} className="text-red-500" />;
      default: return <Activity size={16} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const healthScore = getHealthScore();
  const unresolvedErrors = (errors || []).filter(e => !e.resolved);

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={24} className="text-primary" />
            {t('systemHealth')}
          </CardTitle>
          <CardDescription>
            {language === 'ru' 
              ? 'Общий мониторинг состояния системы и производительности'
              : 'Overall system health and performance monitoring'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Health Score */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {language === 'ru' ? 'Оценка Здоровья' : 'Health Score'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {healthScore}% {language === 'ru' ? 'здоровья системы' : 'system health'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {healthScore >= 80 ? (
                    <span className="text-green-500">{healthScore}%</span>
                  ) : healthScore >= 60 ? (
                    <span className="text-yellow-500">{healthScore}%</span>
                  ) : (
                    <span className="text-red-500">{healthScore}%</span>
                  )}
                </div>
              </div>
            </div>

            <Progress value={healthScore} className="h-2" />

            {/* Control Buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsMonitoring(!isMonitoring)}
                variant={isMonitoring ? 'destructive' : 'default'}
                size="sm"
              >
                {isMonitoring ? (
                  <>
                    <XCircle size={16} className="mr-2" />
                    {t('stopMonitoring')}
                  </>
                ) : (
                  <>
                    <Activity size={16} className="mr-2" />
                    {t('startMonitoring')}
                  </>
                )}
              </Button>

              <Button
                onClick={checkSystemHealth}
                variant="outline"
                size="sm"
              >
                <ArrowsClockwise size={16} className="mr-2" />
                {t('runCheck')}
              </Button>

              {unresolvedErrors.length > 0 && (
                <Button
                  onClick={clearAllErrors}
                  variant="outline"
                  size="sm"
                >
                  <Bug size={16} className="mr-2" />
                  {t('clearErrors')}
                </Button>
              )}
            </div>

            {/* Last Check */}
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock size={14} />
              {t('lastCheck')}: {lastCheck ? new Date(lastCheck).toLocaleString() : t('never')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendUp size={24} className="text-primary" />
            {t('performance')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {(metrics || []).map(metric => (
              <Card key={metric.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{metric.name}</h4>
                  {getStatusIcon(metric.status)}
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {metric.value}{metric.unit}
                  </div>
                  <Progress 
                    value={(metric.value / metric.threshold) * 100} 
                    className="h-1"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Threshold: {metric.threshold}{metric.unit}</span>
                    <Badge variant={getSeverityColor(metric.status as any)}>
                      {metric.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug size={24} className="text-primary" />
            {t('errorLogs')}
            {unresolvedErrors.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unresolvedErrors.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(errors || []).length === 0 ? (
            <Alert>
              <CheckCircle size={16} />
              <AlertDescription>{t('noErrors')}</AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {(errors || []).slice().reverse().map(error => (
                  <Card key={error.id} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getSeverityColor(error.severity)}>
                            {t(error.severity)}
                          </Badge>
                          <Badge variant="outline">
                            {error.category}
                          </Badge>
                          {error.resolved && (
                            <Badge variant="secondary">
                              {t('resolved')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium">{error.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(error.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!error.resolved && (
                        <Button
                          onClick={() => resolveError(error.id)}
                          size="sm"
                          variant="outline"
                        >
                          <CheckCircle size={14} className="mr-1" />
                          {t('resolved')}
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorMonitoring;