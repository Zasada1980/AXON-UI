import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Activity,
  TrendUp,
  TrendDown,
  Cpu,
  HardDrives,
  WifiHigh,
  Lightning,
  Warning,
  CheckCircle,
  ArrowsClockwise,
  Play,
  Stop,
  Download
} from '@phosphor-icons/react';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold: {
    warning: number;
    critical: number;
  };
  trend: 'up' | 'down' | 'stable';
  history: Array<{
    timestamp: string;
    value: number;
  }>;
  status: 'good' | 'warning' | 'critical';
  category: 'system' | 'network' | 'application' | 'user';
}

interface ResourceUsage {
  cpu: {
    percentage: number;
    cores: number;
    processes: Array<{
      name: string;
      usage: number;
    }>;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
    available: number;
  };
  network: {
    upload: number;
    download: number;
    latency: number;
    packets: {
      sent: number;
      received: number;
      lost: number;
    };
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
    readSpeed: number;
    writeSpeed: number;
  };
}

interface PerformanceAlert {
  id: string;
  timestamp: string;
  type: 'performance' | 'resource' | 'threshold' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  metric: string;
  value: number;
  threshold: number;
  resolved: boolean;
  autoResolve: boolean;
}

interface Bottleneck {
  id: string;
  component: string;
  type: 'cpu' | 'memory' | 'network' | 'storage' | 'database' | 'api';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  impact: string;
  cause: string;
  recommendation: string;
  estimatedFixTime: number;
  detectedAt: string;
}

interface PerformanceMonitorProps {
  language: 'en' | 'ru';
  projectId?: string;
  onPerformanceAlert?: (alert: PerformanceAlert) => void;
  onBottleneckDetected?: (bottleneck: Bottleneck) => void;
}

// Helper function outside component to avoid recreation on every render
function getDefaultResourceUsage(): ResourceUsage {
  return {
    cpu: {
      percentage: 25,
      cores: 4,
      processes: [
        { name: 'AXON-UI', usage: 15 },
        { name: 'Chrome', usage: 10 },
        { name: 'System', usage: 5 }
      ]
    },
    memory: {
      used: 4.2,
      total: 16,
      percentage: 26.25,
      available: 11.8
    },
    network: {
      upload: 125,
      download: 1250,
      latency: 45,
      packets: {
        sent: 12450,
        received: 12380,
        lost: 5
      }
    },
    storage: {
      used: 485,
      total: 1000,
      percentage: 48.5,
      readSpeed: 450,
      writeSpeed: 320
    }
  };
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  language,
  projectId = 'default',
  onPerformanceAlert,
  onBottleneckDetected
}) => {
  // Стабилизация ключей для предотвращения бесконечных циклов
  const monitoringKey = useMemo(() => `performance-monitoring-${projectId}`, [projectId]);
  const metricsKey = useMemo(() => `performance-metrics-${projectId}`, [projectId]);
  const resourceKey = useMemo(() => `resource-usage-${projectId}`, [projectId]);
  const alertsKey = useMemo(() => `performance-alerts-${projectId}`, [projectId]);
  const bottlenecksKey = useMemo(() => `performance-bottlenecks-${projectId}`, [projectId]);
  
  const [isMonitoring, setIsMonitoring] = useKV<boolean>(monitoringKey, false);
  const [metrics, setMetrics] = useKV<PerformanceMetric[]>(metricsKey, []);
  const [resourceUsage, setResourceUsage] = useKV<ResourceUsage>(resourceKey, getDefaultResourceUsage());
  const [alerts, setAlerts] = useKV<PerformanceAlert[]>(alertsKey, []);
  const [bottlenecks, setBottlenecks] = useKV<Bottleneck[]>(bottlenecksKey, []);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [monitoringInterval, setMonitoringInterval] = useState<NodeJS.Timeout | null>(null);

  const t = (key: string) => {
    const translations: { [key: string]: { en: string; ru: string } } = {
      performanceMonitor: { en: 'Performance Monitor', ru: 'Монитор Производительности' },
      systemMetrics: { en: 'System Metrics', ru: 'Системные Метрики' },
      resourceUsage: { en: 'Resource Usage', ru: 'Использование Ресурсов' },
      performanceAlerts: { en: 'Performance Alerts', ru: 'Оповещения о Производительности' },
      bottleneckDetection: { en: 'Bottleneck Detection', ru: 'Обнаружение Узких Мест' },
      startMonitoring: { en: 'Start Monitoring', ru: 'Начать Мониторинг' },
      stopMonitoring: { en: 'Stop Monitoring', ru: 'Остановить Мониторинг' },
      refreshMetrics: { en: 'Refresh Metrics', ru: 'Обновить Метрики' },
      exportReport: { en: 'Export Report', ru: 'Экспорт Отчета' },
      clearAlerts: { en: 'Clear Alerts', ru: 'Очистить Оповещения' },
      
      // Metrics
      responseTime: { en: 'Response Time', ru: 'Время Отклика' },
      throughput: { en: 'Throughput', ru: 'Пропускная Способность' },
      errorRate: { en: 'Error Rate', ru: 'Частота Ошибок' },
      memoryUsage: { en: 'Memory Usage', ru: 'Использование Памяти' },
      cpuUsage: { en: 'CPU Usage', ru: 'Использование ЦП' },
      networkLatency: { en: 'Network Latency', ru: 'Задержка Сети' },
      diskIO: { en: 'Disk I/O', ru: 'Дисковый Ввод/Вывод' },
      
      // Resource categories
      system: { en: 'System', ru: 'Система' },
      network: { en: 'Network', ru: 'Сеть' },
      application: { en: 'Application', ru: 'Приложение' },
      user: { en: 'User Experience', ru: 'Пользовательский Опыт' },
      
      // Status
      good: { en: 'Good', ru: 'Хорошо' },
      warning: { en: 'Warning', ru: 'Предупреждение' },
      critical: { en: 'Critical', ru: 'Критично' },
      stable: { en: 'Stable', ru: 'Стабильно' },
      up: { en: 'Increasing', ru: 'Растет' },
      down: { en: 'Decreasing', ru: 'Снижается' },
      
      // Alerts
      noAlerts: { en: 'No performance alerts', ru: 'Нет оповещений о производительности' },
      resolved: { en: 'Resolved', ru: 'Решено' },
      unresolved: { en: 'Unresolved', ru: 'Нерешено' },
      
      // Bottlenecks
      noBottlenecks: { en: 'No bottlenecks detected', ru: 'Узкие места не обнаружены' },
      minor: { en: 'Minor', ru: 'Незначительное' },
      moderate: { en: 'Moderate', ru: 'Умеренное' },
      major: { en: 'Major', ru: 'Серьезное' },
      
      lastUpdated: { en: 'Last Updated', ru: 'Последнее Обновление' },
      never: { en: 'Never', ru: 'Никогда' }
    };
    
    return translations[key]?.[language] || key;
  };

  // Initialize default metrics
  useEffect(() => {
    if (!metrics || metrics.length === 0) {
      const defaultMetrics: PerformanceMetric[] = [
        {
          id: 'response-time',
          name: language === 'ru' ? 'Время Отклика' : 'Response Time',
          value: 250,
          unit: 'ms',
          threshold: { warning: 500, critical: 1000 },
          trend: 'stable',
          history: [],
          status: 'good',
          category: 'application'
        },
        {
          id: 'throughput',
          name: language === 'ru' ? 'Пропускная Способность' : 'Throughput',
          value: 1250,
          unit: 'req/min',
          threshold: { warning: 800, critical: 500 },
          trend: 'stable',
          history: [],
          status: 'good',
          category: 'application'
        },
        {
          id: 'error-rate',
          name: language === 'ru' ? 'Частота Ошибок' : 'Error Rate',
          value: 0.5,
          unit: '%',
          threshold: { warning: 2, critical: 5 },
          trend: 'stable',
          history: [],
          status: 'good',
          category: 'application'
        },
        {
          id: 'memory-usage',
          name: language === 'ru' ? 'Использование Памяти' : 'Memory Usage',
          value: 26.25,
          unit: '%',
          threshold: { warning: 70, critical: 85 },
          trend: 'stable',
          history: [],
          status: 'good',
          category: 'system'
        },
        {
          id: 'cpu-usage',
          name: language === 'ru' ? 'Использование ЦП' : 'CPU Usage',
          value: 25,
          unit: '%',
          threshold: { warning: 70, critical: 90 },
          trend: 'stable',
          history: [],
          status: 'good',
          category: 'system'
        },
        {
          id: 'network-latency',
          name: language === 'ru' ? 'Задержка Сети' : 'Network Latency',
          value: 45,
          unit: 'ms',
          threshold: { warning: 100, critical: 200 },
          trend: 'stable',
          history: [],
          status: 'good',
          category: 'network'
        }
      ];
      setMetrics(defaultMetrics);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Monitoring logic
  const updateMetrics = useCallback(() => {
    const currentTime = new Date().toISOString();
    
    setMetrics(currentMetrics => {
      return (currentMetrics || []).map(metric => {
        // Simulate realistic metric variations
        let newValue = metric.value;
        const variation = (Math.random() - 0.5) * 0.2;
        
        switch (metric.id) {
          case 'response-time':
            newValue = Math.max(50, metric.value + (Math.random() - 0.5) * 100);
            break;
          case 'throughput':
            newValue = Math.max(500, metric.value + (Math.random() - 0.5) * 200);
            break;
          case 'error-rate':
            newValue = Math.max(0, Math.min(10, metric.value + (Math.random() - 0.8) * 1));
            break;
          case 'memory-usage':
            newValue = Math.max(10, Math.min(95, metric.value + (Math.random() - 0.5) * 5));
            break;
          case 'cpu-usage':
            newValue = Math.max(5, Math.min(95, metric.value + (Math.random() - 0.5) * 10));
            break;
          case 'network-latency':
            newValue = Math.max(20, metric.value + (Math.random() - 0.5) * 30);
            break;
          default:
            newValue = Math.max(0, metric.value * (1 + variation));
        }

        // Determine status
        let status: 'good' | 'warning' | 'critical' = 'good';
        if (newValue >= metric.threshold.critical) {
          status = 'critical';
        } else if (newValue >= metric.threshold.warning) {
          status = 'warning';
        }

        // Determine trend
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (newValue > metric.value * 1.05) {
          trend = 'up';
        } else if (newValue < metric.value * 0.95) {
          trend = 'down';
        }

        // Update history (keep last 50 entries)
        const newHistory = [
          ...metric.history.slice(-49),
          { timestamp: currentTime, value: newValue }
        ];

        return {
          ...metric,
          value: Math.round(newValue * 100) / 100,
          status,
          trend,
          history: newHistory
        };
      });
    });

    // Update resource usage
    setResourceUsage(current => {
      if (!current) return getDefaultResourceUsage();
      
      return {
        cpu: {
          percentage: Math.max(5, Math.min(95, current.cpu.percentage + (Math.random() - 0.5) * 10)),
          cores: current.cpu.cores,
          processes: current.cpu.processes.map(proc => ({
            ...proc,
            usage: Math.max(0, Math.min(50, proc.usage + (Math.random() - 0.5) * 5))
          }))
        },
        memory: {
          ...current.memory,
          percentage: Math.max(10, Math.min(90, current.memory.percentage + (Math.random() - 0.5) * 5)),
          used: Math.max(1, Math.min(15, current.memory.used + (Math.random() - 0.5) * 1))
        },
        network: {
          ...current.network,
          latency: Math.max(20, current.network.latency + (Math.random() - 0.5) * 20),
          upload: Math.max(50, current.network.upload + (Math.random() - 0.5) * 100),
          download: Math.max(500, current.network.download + (Math.random() - 0.5) * 500)
        },
        storage: {
          ...current.storage,
          readSpeed: Math.max(200, current.storage.readSpeed + (Math.random() - 0.5) * 100),
          writeSpeed: Math.max(150, current.storage.writeSpeed + (Math.random() - 0.5) * 80)
        }
      };
    });

    setLastUpdate(currentTime);
  }, [setMetrics, setResourceUsage]);

  // Generate alerts for critical metrics
  const checkForAlerts = useCallback(() => {
    (metrics || []).forEach(metric => {
      if (metric.status === 'critical' && Math.random() > 0.7) {
        const alert: PerformanceAlert = {
          id: Date.now().toString() + metric.id,
          timestamp: new Date().toISOString(),
          type: 'threshold',
          severity: 'high',
          title: `${metric.name} Critical`,
          message: `${metric.name} has exceeded critical threshold: ${metric.value}${metric.unit} > ${metric.threshold.critical}${metric.unit}`,
          metric: metric.id,
          value: metric.value,
          threshold: metric.threshold.critical,
          resolved: false,
          autoResolve: true
        };

        setAlerts(current => [...(current || []), alert]);
        onPerformanceAlert?.(alert);
        toast.error(`Performance Alert: ${metric.name} critical`);
      }
    });
  }, [metrics, onPerformanceAlert, setAlerts]);

  // Detect bottlenecks
  const detectBottlenecks = useCallback(() => {
    if (!resourceUsage) return;
    
    const newBottlenecks: Bottleneck[] = [];

    if (resourceUsage.cpu.percentage > 80) {
      newBottlenecks.push({
        id: `cpu-bottleneck-${Date.now()}`,
        component: 'CPU',
        type: 'cpu',
        severity: resourceUsage.cpu.percentage > 90 ? 'critical' : 'major',
        impact: 'System responsiveness degraded',
        cause: 'High CPU utilization across processes',
        recommendation: 'Optimize CPU-intensive operations, consider scaling',
        estimatedFixTime: 30,
        detectedAt: new Date().toISOString()
      });
    }

    if (resourceUsage.memory.percentage > 75) {
      newBottlenecks.push({
        id: `memory-bottleneck-${Date.now()}`,
        component: 'Memory',
        type: 'memory',
        severity: resourceUsage.memory.percentage > 85 ? 'critical' : 'moderate',
        impact: 'Application performance degraded',
        cause: 'High memory consumption',
        recommendation: 'Optimize memory usage, implement garbage collection',
        estimatedFixTime: 45,
        detectedAt: new Date().toISOString()
      });
    }

    if (resourceUsage.network.latency > 100) {
      newBottlenecks.push({
        id: `network-bottleneck-${Date.now()}`,
        component: 'Network',
        type: 'network',
        severity: resourceUsage.network.latency > 200 ? 'critical' : 'moderate',
        impact: 'API response times increased',
        cause: 'High network latency',
        recommendation: 'Check network connectivity, optimize API calls',
        estimatedFixTime: 20,
        detectedAt: new Date().toISOString()
      });
    }

    if (newBottlenecks.length > 0) {
      // Replace instead of append to prevent infinite growth
      setBottlenecks(newBottlenecks);
      newBottlenecks.forEach(bottleneck => {
        onBottleneckDetected?.(bottleneck);
        toast.warning(`Bottleneck detected: ${bottleneck.component}`);
      });
    } else {
      // Clear bottlenecks if none detected
      setBottlenecks([]);
    }
  }, [resourceUsage, onBottleneckDetected, setBottlenecks]);

  // Start/stop monitoring
  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        updateMetrics();
        checkForAlerts();
        detectBottlenecks();
      }, 3000); // Update every 3 seconds

      setMonitoringInterval(interval);
      
      return () => {
        clearInterval(interval);
      };
    } else {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
        setMonitoringInterval(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMonitoring]); // Removed monitoringInterval from deps to prevent infinite loop

  // Manual refresh
  const handleRefresh = () => {
    updateMetrics();
    toast.success('Metrics refreshed');
  };

  // Toggle monitoring
  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    toast.success(isMonitoring ? 'Monitoring stopped' : 'Monitoring started');
  };

  // Export performance report
  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      projectId,
      metrics,
      resourceUsage,
      alerts,
      bottlenecks,
      summary: {
        totalMetrics: metrics?.length || 0,
        criticalMetrics: (metrics || []).filter(m => m.status === 'critical').length,
        activeAlerts: (alerts || []).filter(a => !a.resolved).length,
        activeBottlenecks: bottlenecks?.length || 0
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${projectId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Performance report exported');
  };

  // Resolve alert
  const resolveAlert = (alertId: string) => {
    setAlerts(current => 
      (current || []).map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
    toast.success('Alert resolved');
  };

  // Clear all alerts
  const clearAllAlerts = () => {
    setAlerts([]);
    toast.success('All alerts cleared');
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendUp size={16} className="text-red-500" />;
      case 'down': return <TrendDown size={16} className="text-green-500" />;
      default: return <div className="w-4 h-4" />;
    }
  };

  const unresolvedAlerts = (alerts || []).filter(a => !a.resolved);
  const criticalMetrics = (metrics || []).filter(m => m.status === 'critical');

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={24} className="text-primary" />
            {t('performanceMonitor')}
          </CardTitle>
          <CardDescription>
            {language === 'ru' 
              ? 'Мониторинг производительности системы в реальном времени с обнаружением узких мест'
              : 'Real-time system performance monitoring with bottleneck detection'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={toggleMonitoring}
                variant={isMonitoring ? 'destructive' : 'default'}
                className="flex items-center gap-2"
              >
                {isMonitoring ? (
                  <>
                    <Stop size={16} />
                    {t('stopMonitoring')}
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    {t('startMonitoring')}
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowsClockwise size={16} />
                {t('refreshMetrics')}
              </Button>
              
              <Button
                onClick={exportReport}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download size={16} />
                {t('exportReport')}
              </Button>

              {unresolvedAlerts.length > 0 && (
                <Button
                  onClick={clearAllAlerts}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Warning size={16} />
                  {t('clearAlerts')}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Status Indicators */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-sm text-muted-foreground">
                  {isMonitoring ? 'Monitoring' : 'Stopped'}
                </span>
              </div>
              
              {lastUpdate && (
                <div className="text-sm text-muted-foreground">
                  {t('lastUpdated')}: {new Date(lastUpdate).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <Separator className="my-4" />
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{(metrics || []).length}</div>
              <div className="text-sm text-muted-foreground">Total Metrics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{criticalMetrics.length}</div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{unresolvedAlerts.length}</div>
              <div className="text-sm text-muted-foreground">Active Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{(bottlenecks || []).length}</div>
              <div className="text-sm text-muted-foreground">Bottlenecks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">{t('systemMetrics')}</TabsTrigger>
          <TabsTrigger value="resources">{t('resourceUsage')}</TabsTrigger>
          <TabsTrigger value="alerts">{t('performanceAlerts')}</TabsTrigger>
          <TabsTrigger value="bottlenecks">{t('bottleneckDetection')}</TabsTrigger>
        </TabsList>

        {/* System Metrics */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(metrics || []).map(metric => (
              <Card key={metric.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{metric.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                      <Badge variant={metric.status === 'critical' ? 'destructive' : metric.status === 'warning' ? 'secondary' : 'default'}>
                        {t(metric.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      <span className={getStatusColor(metric.status)}>
                        {metric.value}{metric.unit}
                      </span>
                    </div>
                    
                    <Progress 
                      value={metric.status === 'critical' ? 100 : metric.status === 'warning' ? 70 : 40} 
                      className="h-2"
                    />
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Warning: {metric.threshold.warning}{metric.unit}</span>
                      <span>Critical: {metric.threshold.critical}{metric.unit}</span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Category: {t(metric.category)} • Trend: {t(metric.trend)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Resource Usage */}
        <TabsContent value="resources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* CPU Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu size={20} />
                  CPU Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{resourceUsage?.cpu.percentage.toFixed(1) || '0'}%</div>
                    <Progress value={resourceUsage?.cpu.percentage || 0} className="mt-2" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Top Processes:</h4>
                    {resourceUsage?.cpu.processes.map((proc, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{proc.name}</span>
                        <span>{proc.usage.toFixed(1)}%</span>
                      </div>
                    )) || null}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Memory Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrives size={20} />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{resourceUsage?.memory.percentage.toFixed(1) || '0'}%</div>
                    <Progress value={resourceUsage?.memory.percentage || 0} className="mt-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Used</div>
                      <div className="font-medium">{resourceUsage?.memory.used.toFixed(1) || '0'} GB</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Available</div>
                      <div className="font-medium">{resourceUsage?.memory.available.toFixed(1) || '0'} GB</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Network */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <WifiHigh size={20} />
                  Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Upload</div>
                      <div className="font-medium">{resourceUsage?.network.upload || 0} KB/s</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Download</div>
                      <div className="font-medium">{resourceUsage?.network.download || 0} KB/s</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Latency</div>
                      <div className="font-medium">{resourceUsage?.network.latency || 0} ms</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Packet Loss</div>
                      <div className="font-medium">{resourceUsage?.network.packets ? ((resourceUsage.network.packets.lost / resourceUsage.network.packets.sent) * 100).toFixed(2) : '0'}%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Storage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrives size={20} />
                  Storage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{resourceUsage?.storage.percentage.toFixed(1) || '0'}%</div>
                    <Progress value={resourceUsage?.storage.percentage || 0} className="mt-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Read Speed</div>
                      <div className="font-medium">{resourceUsage?.storage.readSpeed || 0} MB/s</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Write Speed</div>
                      <div className="font-medium">{resourceUsage?.storage.writeSpeed || 0} MB/s</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Alerts */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warning size={20} />
                {t('performanceAlerts')}
                {unresolvedAlerts.length > 0 && (
                  <Badge variant="destructive">{unresolvedAlerts.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(alerts || []).length === 0 ? (
                <Alert>
                  <CheckCircle size={16} />
                  <AlertDescription>{t('noAlerts')}</AlertDescription>
                </Alert>
              ) : (
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {(alerts || []).slice().reverse().map(alert => (
                      <Card key={alert.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                                {alert.severity}
                              </Badge>
                              <Badge variant="outline">{alert.type}</Badge>
                              {alert.resolved && (
                                <Badge variant="secondary">{t('resolved')}</Badge>
                              )}
                            </div>
                            <h4 className="font-medium text-sm">{alert.title}</h4>
                            <p className="text-xs text-muted-foreground">{alert.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {!alert.resolved && (
                            <Button
                              onClick={() => resolveAlert(alert.id)}
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
        </TabsContent>

        {/* Bottleneck Detection */}
        <TabsContent value="bottlenecks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightning size={20} />
                {t('bottleneckDetection')}
                {(bottlenecks || []).length > 0 && (
                  <Badge variant="destructive">{(bottlenecks || []).length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(bottlenecks || []).length === 0 ? (
                <Alert>
                  <CheckCircle size={16} />
                  <AlertDescription>{t('noBottlenecks')}</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {(bottlenecks || []).map(bottleneck => (
                    <Card key={bottleneck.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{bottleneck.component} Bottleneck</h4>
                          <Badge variant={bottleneck.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {t(bottleneck.severity)}
                          </Badge>
                        </div>
                        
                        <div className="text-sm space-y-1">
                          <div><strong>Impact:</strong> {bottleneck.impact}</div>
                          <div><strong>Cause:</strong> {bottleneck.cause}</div>
                          <div><strong>Recommendation:</strong> {bottleneck.recommendation}</div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Detected: {new Date(bottleneck.detectedAt).toLocaleString()}</span>
                          <span>Est. fix time: {bottleneck.estimatedFixTime}min</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMonitor;