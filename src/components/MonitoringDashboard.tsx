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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Monitor,
  ChartLine,
  Activity,
  Warning,
  CheckCircle,
  TrendUp,
  TrendDown,
  Cpu,
  HardDrives,
  WifiHigh,
  Bell,
  Play,
  Stop,
  Download,
  Gear,
  Eye
} from '@phosphor-icons/react';

interface DashboardMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  change: number; // percentage change
  category: 'system' | 'performance' | 'user' | 'business';
  target?: number;
  history: Array<{
    timestamp: string;
    value: number;
  }>;
}

interface SystemAlert {
  id: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  title: string;
  message: string;
  acknowledged: boolean;
  resolved: boolean;
  tags: string[];
}

interface MonitoringWidget {
  id: string;
  type: 'chart' | 'metric' | 'alert' | 'status' | 'log';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  config: {
    metricIds?: string[];
    timeRange?: string;
    alertTypes?: string[];
    maxItems?: number;
  };
  visible: boolean;
}

interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  widgets: MonitoringWidget[];
  isDefault: boolean;
}

interface MonitoringDashboardProps {
  language: 'en' | 'ru';
  projectId?: string;
  onAlertTriggered?: (alert: SystemAlert) => void;
  onMetricThresholdExceeded?: (metric: DashboardMetric) => void;
}

const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({
  language,
  projectId = 'default',
  onAlertTriggered,
  onMetricThresholdExceeded
}) => {
  // Стабилизация ключей для предотвращения бесконечных циклов
  const metricsKey = useMemo(() => `dashboard-metrics-${projectId}`, [projectId]);
  const alertsKey = useMemo(() => `dashboard-alerts-${projectId}`, [projectId]);
  const layoutsKey = useMemo(() => `dashboard-layouts-${projectId}`, [projectId]);
  const currentLayoutKey = useMemo(() => `current-layout-${projectId}`, [projectId]);
  const monitoringKey = useMemo(() => `dashboard-monitoring-${projectId}`, [projectId]);
  
  const [metrics, setMetrics] = useKV<DashboardMetric[]>(metricsKey, []);
  const [alerts, setAlerts] = useKV<SystemAlert[]>(alertsKey, []);
  const [layouts, setLayouts] = useKV<DashboardLayout[]>(layoutsKey, []);
  const [currentLayout, setCurrentLayout] = useKV<string>(currentLayoutKey, 'default');
  const [isMonitoring, setIsMonitoring] = useKV<boolean>(monitoringKey, false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [timeRange, setTimeRange] = useState<string>('1h');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const t = useCallback((key: string) => {
    const translations: { [key: string]: { en: string; ru: string } } = {
      monitoringDashboard: { en: 'Monitoring Dashboard', ru: 'Панель Мониторинга' },
      systemOverview: { en: 'System Overview', ru: 'Обзор Системы' },
      performanceMetrics: { en: 'Performance Metrics', ru: 'Метрики Производительности' },
      alertCenter: { en: 'Alert Center', ru: 'Центр Оповещений' },
      dashboardSettings: { en: 'Dashboard Settings', ru: 'Настройки Панели' },
      
      // Controls
      startMonitoring: { en: 'Start Monitoring', ru: 'Начать Мониторинг' },
      stopMonitoring: { en: 'Stop Monitoring', ru: 'Остановить Мониторинг' },
      refreshData: { en: 'Refresh Data', ru: 'Обновить Данные' },
      exportDashboard: { en: 'Export Dashboard', ru: 'Экспорт Панели' },
      customizeLayout: { en: 'Customize Layout', ru: 'Настроить Макет' },
      
      // Time ranges
      realTime: { en: 'Real-time', ru: 'Реальное время' },
      last5min: { en: 'Last 5 minutes', ru: 'Последние 5 минут' },
      last1hour: { en: 'Last 1 hour', ru: 'Последний час' },
      last24hours: { en: 'Last 24 hours', ru: 'Последние 24 часа' },
      last7days: { en: 'Last 7 days', ru: 'Последние 7 дней' },
      
      // Metrics
      cpuUsage: { en: 'CPU Usage', ru: 'Использование ЦП' },
      memoryUsage: { en: 'Memory Usage', ru: 'Использование Памяти' },
      diskUsage: { en: 'Disk Usage', ru: 'Использование Диска' },
      networkTraffic: { en: 'Network Traffic', ru: 'Сетевой Трафик' },
      responseTime: { en: 'Response Time', ru: 'Время Отклика' },
      errorRate: { en: 'Error Rate', ru: 'Частота Ошибок' },
      activeUsers: { en: 'Active Users', ru: 'Активные Пользователи' },
      throughput: { en: 'Throughput', ru: 'Пропускная Способность' },
      
      // Status
      good: { en: 'Good', ru: 'Хорошо' },
      warning: { en: 'Warning', ru: 'Предупреждение' },
      critical: { en: 'Critical', ru: 'Критично' },
      stable: { en: 'Stable', ru: 'Стабильно' },
      up: { en: 'Increasing', ru: 'Растет' },
      down: { en: 'Decreasing', ru: 'Снижается' },
      
      // Alerts
      info: { en: 'Info', ru: 'Информация' },
      error: { en: 'Error', ru: 'Ошибка' },
      noAlerts: { en: 'No active alerts', ru: 'Нет активных оповещений' },
      acknowledgeAlert: { en: 'Acknowledge', ru: 'Подтвердить' },
      resolveAlert: { en: 'Resolve', ru: 'Решить' },
      
      // Categories
      system: { en: 'System', ru: 'Система' },
      performance: { en: 'Performance', ru: 'Производительность' },
      user: { en: 'User Experience', ru: 'Пользовательский Опыт' },
      business: { en: 'Business', ru: 'Бизнес' },
      
      // Messages
      monitoringStarted: { en: 'Monitoring started', ru: 'Мониторинг запущен' },
      monitoringStopped: { en: 'Monitoring stopped', ru: 'Мониторинг остановлен' },
      dataRefreshed: { en: 'Data refreshed', ru: 'Данные обновлены' },
      alertAcknowledged: { en: 'Alert acknowledged', ru: 'Оповещение подтверждено' },
      alertResolved: { en: 'Alert resolved', ru: 'Оповещение решено' }
    };
    
    return translations[key]?.[language] || key;
  }, [language]);

  // Initialize default metrics
  useEffect(() => {
    if (metrics.length === 0) {
      const defaultMetrics: DashboardMetric[] = [
        {
          id: 'cpu-usage',
          name: t('cpuUsage'),
          value: 35.2,
          unit: '%',
          status: 'good',
          trend: 'stable',
          change: -2.1,
          category: 'system',
          target: 70,
          history: []
        },
        {
          id: 'memory-usage',
          name: t('memoryUsage'),
          value: 62.8,
          unit: '%',
          status: 'warning',
          trend: 'up',
          change: 8.5,
          category: 'system',
          target: 80,
          history: []
        },
        {
          id: 'disk-usage',
          name: t('diskUsage'),
          value: 78.3,
          unit: '%',
          status: 'warning',
          trend: 'up',
          change: 3.2,
          category: 'system',
          target: 85,
          history: []
        },
        {
          id: 'response-time',
          name: t('responseTime'),
          value: 245,
          unit: 'ms',
          status: 'good',
          trend: 'down',
          change: -12.3,
          category: 'performance',
          target: 500,
          history: []
        },
        {
          id: 'error-rate',
          name: t('errorRate'),
          value: 0.8,
          unit: '%',
          status: 'good',
          trend: 'stable',
          change: 0.1,
          category: 'performance',
          target: 2,
          history: []
        },
        {
          id: 'throughput',
          name: t('throughput'),
          value: 1250,
          unit: 'req/min',
          status: 'good',
          trend: 'up',
          change: 15.7,
          category: 'performance',
          target: 1000,
          history: []
        },
        {
          id: 'active-users',
          name: t('activeUsers'),
          value: 847,
          unit: 'users',
          status: 'good',
          trend: 'up',
          change: 22.4,
          category: 'user',
          history: []
        },
        {
          id: 'network-traffic',
          name: t('networkTraffic'),
          value: 85.6,
          unit: 'MB/s',
          status: 'good',
          trend: 'stable',
          change: -1.2,
          category: 'system',
          target: 100,
          history: []
        }
      ];
      setMetrics(defaultMetrics);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Initialize default layout
  useEffect(() => {
    if (layouts.length === 0) {
      const defaultLayout: DashboardLayout = {
        id: 'default',
        name: 'Default Dashboard',
        description: 'Standard monitoring layout',
        widgets: [
          {
            id: 'system-overview',
            type: 'metric',
            title: 'System Overview',
            size: 'large',
            position: { x: 0, y: 0 },
            config: {
              metricIds: ['cpu-usage', 'memory-usage', 'disk-usage', 'network-traffic'],
              timeRange: '1h'
            },
            visible: true
          },
          {
            id: 'performance-chart',
            type: 'chart',
            title: 'Performance Metrics',
            size: 'large',
            position: { x: 1, y: 0 },
            config: {
              metricIds: ['response-time', 'throughput', 'error-rate'],
              timeRange: '1h'
            },
            visible: true
          },
          {
            id: 'alerts-widget',
            type: 'alert',
            title: 'Active Alerts',
            size: 'medium',
            position: { x: 0, y: 1 },
            config: {
              alertTypes: ['warning', 'error', 'critical'],
              maxItems: 10
            },
            visible: true
          },
          {
            id: 'user-metrics',
            type: 'metric',
            title: 'User Metrics',
            size: 'medium',
            position: { x: 1, y: 1 },
            config: {
              metricIds: ['active-users'],
              timeRange: '24h'
            },
            visible: true
          }
        ],
        isDefault: true
      };
      setLayouts([defaultLayout]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Initialize sample alerts
  useEffect(() => {
    if (alerts.length === 0) {
      const sampleAlerts: SystemAlert[] = [
        {
          id: 'alert-1',
          timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          severity: 'warning',
          source: 'System Monitor',
          title: 'High Memory Usage',
          message: 'Memory usage has exceeded 60% threshold',
          acknowledged: false,
          resolved: false,
          tags: ['memory', 'performance']
        },
        {
          id: 'alert-2',
          timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
          severity: 'info',
          source: 'User Analytics',
          title: 'Traffic Spike Detected',
          message: 'User traffic increased by 20% in the last hour',
          acknowledged: true,
          resolved: false,
          tags: ['traffic', 'analytics']
        }
      ];
      setAlerts(sampleAlerts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Simulate real-time data updates
  const updateMetricsData = useCallback(() => {
    setMetrics(current => {
      return (current || []).map(metric => {
        // Simulate realistic metric variations
        let newValue = metric.value;
        const variation = (Math.random() - 0.5) * 0.1;
        
        switch (metric.id) {
          case 'cpu-usage':
            newValue = Math.max(10, Math.min(95, metric.value + (Math.random() - 0.5) * 10));
            break;
          case 'memory-usage':
            newValue = Math.max(20, Math.min(90, metric.value + (Math.random() - 0.5) * 5));
            break;
          case 'disk-usage':
            newValue = Math.max(50, Math.min(95, metric.value + (Math.random() - 0.5) * 2));
            break;
          case 'response-time':
            newValue = Math.max(100, metric.value + (Math.random() - 0.5) * 50);
            break;
          case 'error-rate':
            newValue = Math.max(0, Math.min(5, metric.value + (Math.random() - 0.8) * 0.5));
            break;
          case 'throughput':
            newValue = Math.max(500, metric.value + (Math.random() - 0.5) * 200);
            break;
          case 'active-users':
            newValue = Math.max(100, metric.value + (Math.random() - 0.5) * 100);
            break;
          default:
            newValue = Math.max(0, metric.value * (1 + variation));
        }

        // Determine status based on target
        let status: 'good' | 'warning' | 'critical' = 'good';
        if (metric.target) {
          if (newValue >= metric.target * 0.9) {
            status = 'critical';
          } else if (newValue >= metric.target * 0.7) {
            status = 'warning';
          }
        }

        // Determine trend
        let trend: 'up' | 'down' | 'stable' = 'stable';
        const change = ((newValue - metric.value) / metric.value) * 100;
        if (Math.abs(change) > 2) {
          trend = change > 0 ? 'up' : 'down';
        }

        // Update history
        const newHistory = [
          ...metric.history.slice(-19), // Keep last 19 entries
          {
            timestamp: new Date().toISOString(),
            value: newValue
          }
        ];

        // Check for threshold violations
        if (status === 'critical' && metric.status !== 'critical') {
          onMetricThresholdExceeded?.({ ...metric, value: newValue, status });
          
          // Generate alert
          const alert: SystemAlert = {
            id: `alert-${Date.now()}`,
            timestamp: new Date().toISOString(),
            severity: 'warning',
            source: 'Metrics Monitor',
            title: `${metric.name} Threshold Exceeded`,
            message: `${metric.name} has reached ${newValue.toFixed(1)}${metric.unit}, exceeding the ${metric.target}${metric.unit} threshold`,
            acknowledged: false,
            resolved: false,
            tags: [metric.category, metric.id]
          };
          
          setAlerts(currentAlerts => [...(currentAlerts || []), alert]);
          onAlertTriggered?.(alert);
        }

        return {
          ...metric,
          value: Math.round(newValue * 100) / 100,
          status,
          trend,
          change: Math.round(change * 100) / 100,
          history: newHistory
        };
      });
    });
  }, [setMetrics, onMetricThresholdExceeded, onAlertTriggered, setAlerts]);

  // Start/stop monitoring
  useEffect(() => {
    if (isMonitoring && autoRefresh) {
      const interval = setInterval(() => {
        updateMetricsData();
      }, 5000); // Update every 5 seconds
      
      setRefreshInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMonitoring, autoRefresh]); // Removed refreshInterval and updateMetricsData from deps

  // Toggle monitoring
  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    toast.success(isMonitoring ? t('monitoringStopped') : t('monitoringStarted'));
  };

  // Manual refresh
  const handleRefresh = () => {
    updateMetricsData();
    toast.success(t('dataRefreshed'));
  };

  // Acknowledge alert
  const acknowledgeAlert = (alertId: string) => {
    setAlerts(current =>
      (current || []).map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
    toast.success(t('alertAcknowledged'));
  };

  // Resolve alert
  const resolveAlert = (alertId: string) => {
    setAlerts(current =>
      (current || []).map(alert =>
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
    toast.success(t('alertResolved'));
  };

  // Export dashboard data
  const exportDashboard = () => {
    const dashboardData = {
      timestamp: new Date().toISOString(),
      projectId,
      metrics,
      alerts,
      layouts,
      currentLayout
    };

    const blob = new Blob([JSON.stringify(dashboardData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${projectId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Dashboard exported');
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
  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') {
      return <TrendUp size={16} className={change > 0 ? 'text-red-500' : 'text-green-500'} />;
    } else if (trend === 'down') {
      return <TrendDown size={16} className={change < 0 ? 'text-green-500' : 'text-red-500'} />;
    }
    return <div className="w-4 h-4" />;
  };

  // Get alert severity color
  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'outline';
      default: return 'outline';
    }
  };

  const activeAlerts = (alerts || []).filter(a => !a.resolved);
  const criticalMetrics = (metrics || []).filter(m => m.status === 'critical');
  const warningMetrics = (metrics || []).filter(m => m.status === 'warning');

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor size={24} className="text-primary" />
            {t('monitoringDashboard')}
          </CardTitle>
          <CardDescription>
            {language === 'ru' 
              ? 'Комплексная панель мониторинга системы в реальном времени с настраиваемыми виджетами и оповещениями'
              : 'Comprehensive real-time system monitoring dashboard with customizable widgets and alerts'
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
                <Activity size={16} />
                {t('refreshData')}
              </Button>
              
              <Button
                onClick={exportDashboard}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download size={16} />
                {t('exportDashboard')}
              </Button>

              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5m">{t('last5min')}</SelectItem>
                  <SelectItem value="1h">{t('last1hour')}</SelectItem>
                  <SelectItem value="24h">{t('last24hours')}</SelectItem>
                  <SelectItem value="7d">{t('last7days')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              {/* Status Indicators */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-sm text-muted-foreground">
                  {isMonitoring ? 'Live' : 'Paused'}
                </span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Quick Status */}
          <Separator className="my-4" />
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{(metrics || []).filter(m => m.status === 'good').length}</div>
              <div className="text-sm text-muted-foreground">Healthy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{warningMetrics.length}</div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{criticalMetrics.length}</div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{activeAlerts.length}</div>
              <div className="text-sm text-muted-foreground">Active Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t('systemOverview')}</TabsTrigger>
          <TabsTrigger value="metrics">{t('performanceMetrics')}</TabsTrigger>
          <TabsTrigger value="alerts">{t('alertCenter')}</TabsTrigger>
          <TabsTrigger value="settings">{t('dashboardSettings')}</TabsTrigger>
        </TabsList>

        {/* System Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(metrics || []).filter(m => m.category === 'system').map(metric => (
              <Card key={metric.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {metric.id.includes('cpu') && <Cpu size={16} />}
                      {metric.id.includes('memory') && <HardDrives size={16} />}
                      {metric.id.includes('disk') && <HardDrives size={16} />}
                      {metric.id.includes('network') && <WifiHigh size={16} />}
                      <CardTitle className="text-sm">{metric.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend, metric.change)}
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
                      value={metric.target ? (metric.value / metric.target) * 100 : metric.value} 
                      className="h-2"
                    />
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Change: {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%</span>
                      {metric.target && <span>Target: {metric.target}{metric.unit}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell size={20} />
                Recent Alerts
                {activeAlerts.length > 0 && (
                  <Badge variant="destructive">{activeAlerts.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeAlerts.length === 0 ? (
                <Alert>
                  <CheckCircle size={16} />
                  <AlertDescription>{t('noAlerts')}</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {activeAlerts.slice(0, 5).map(alert => (
                    <Card key={alert.id} className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getAlertSeverityColor(alert.severity)}>
                              {t(alert.severity)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{alert.source}</span>
                            {alert.acknowledged && (
                              <Badge variant="outline">Acknowledged</Badge>
                            )}
                          </div>
                          <h4 className="font-medium text-sm">{alert.title}</h4>
                          <p className="text-xs text-muted-foreground">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {!alert.acknowledged && (
                            <Button
                              onClick={() => acknowledgeAlert(alert.id)}
                              size="sm"
                              variant="outline"
                            >
                              <Eye size={12} />
                            </Button>
                          )}
                          <Button
                            onClick={() => resolveAlert(alert.id)}
                            size="sm"
                            variant="outline"
                          >
                            <CheckCircle size={12} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Metrics */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(metrics || []).filter(m => m.category === 'performance').map(metric => (
              <Card key={metric.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{metric.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend, metric.change)}
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
                    
                    <div className="text-sm text-muted-foreground">
                      Change: {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                    </div>
                    
                    {metric.target && (
                      <div className="text-sm text-muted-foreground">
                        Target: {metric.target}{metric.unit}
                      </div>
                    )}

                    {/* Simple chart visualization */}
                    <div className="h-16 flex items-end gap-1">
                      {metric.history.slice(-10).map((point, index) => (
                        <div
                          key={index}
                          className="bg-primary/30 flex-1 rounded-t"
                          style={{ 
                            height: `${(point.value / (metric.target || Math.max(...metric.history.map(h => h.value)))) * 100}%` 
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* User Experience Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartLine size={20} />
                User Experience Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {(metrics || []).filter(m => m.category === 'user').map(metric => (
                  <div key={metric.id} className="p-4 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{metric.name}</h4>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(metric.trend, metric.change)}
                        <span className={`font-bold ${getStatusColor(metric.status)}`}>
                          {metric.value}{metric.unit}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Change: {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alert Center */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warning size={20} />
                {t('alertCenter')}
                {activeAlerts.length > 0 && (
                  <Badge variant="destructive">{activeAlerts.length}</Badge>
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
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {(alerts || []).slice().reverse().map(alert => (
                      <Card key={alert.id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={getAlertSeverityColor(alert.severity)}>
                                  {t(alert.severity)}
                                </Badge>
                                <span className="text-sm text-muted-foreground">{alert.source}</span>
                                {alert.acknowledged && (
                                  <Badge variant="outline">Acknowledged</Badge>
                                )}
                                {alert.resolved && (
                                  <Badge variant="secondary">Resolved</Badge>
                                )}
                              </div>
                              
                              <h4 className="font-medium">{alert.title}</h4>
                              <p className="text-sm text-muted-foreground">{alert.message}</p>
                              
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(alert.timestamp).toLocaleString()}
                                </span>
                                {alert.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            {!alert.resolved && (
                              <div className="flex gap-2">
                                {!alert.acknowledged && (
                                  <Button
                                    onClick={() => acknowledgeAlert(alert.id)}
                                    size="sm"
                                    variant="outline"
                                  >
                                    <Eye size={12} className="mr-1" />
                                    {t('acknowledgeAlert')}
                                  </Button>
                                )}
                                <Button
                                  onClick={() => resolveAlert(alert.id)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <CheckCircle size={12} className="mr-1" />
                                  {t('resolveAlert')}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Settings */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gear size={20} />
                {t('dashboardSettings')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto Refresh</h4>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ru' ? 'Автоматически обновлять данные' : 'Automatically refresh data'}
                    </p>
                  </div>
                  <Button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    variant={autoRefresh ? 'default' : 'outline'}
                    size="sm"
                  >
                    {autoRefresh ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Refresh Interval</h4>
                  <Select 
                    value="5s" 
                    onValueChange={() => {}}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1s">1 second</SelectItem>
                      <SelectItem value="5s">5 seconds</SelectItem>
                      <SelectItem value="10s">10 seconds</SelectItem>
                      <SelectItem value="30s">30 seconds</SelectItem>
                      <SelectItem value="1m">1 minute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Alert Notifications</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Critical alerts</span>
                      <Badge variant="destructive">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Warning alerts</span>
                      <Badge variant="secondary">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Info alerts</span>
                      <Badge variant="outline">Disabled</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Dashboard Layout</h4>
                  <Select value={currentLayout} onValueChange={setCurrentLayout}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(layouts || []).map(layout => (
                        <SelectItem key={layout.id} value={layout.id}>
                          {layout.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringDashboard;