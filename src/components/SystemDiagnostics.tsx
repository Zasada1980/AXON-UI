import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bug, 
  CheckCircle, 
  Warning, 
  WarningCircle,
  Play,
  Pause,
  ArrowClockwise,
  Activity,
  Cpu,
  Database,
  Globe,
  Shield,
  Clock
} from '@phosphor-icons/react';

interface SystemIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  component: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  status: 'detected' | 'analyzing' | 'fixing' | 'resolved';
  fixSteps?: string[];
  currentStep?: number;
}

interface SystemMetrics {
  memory: number;
  performance: number;
  storage: number;
  network: number;
  security: number;
  uptime: number;
}

interface MicroTask {
  id: string;
  title: string;
  description: string;
  component: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: string;
  endTime?: string;
  duration?: number;
  dependencies?: string[];
  commands: string[];
  currentCommand?: number;
  result?: string;
}

interface SystemDiagnosticsProps {
  language?: 'en' | 'ru';
  onIssueDetected?: (issue: SystemIssue) => void;
  onTaskCompleted?: (task: MicroTask) => void;
}

const SystemDiagnostics: React.FC<SystemDiagnosticsProps> = ({
  language = 'en',
  onIssueDetected,
  onTaskCompleted
}) => {
  const [issues, setIssues] = useState<SystemIssue[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    memory: 85,
    performance: 92,
    storage: 78,
    network: 94,
    security: 88,
    uptime: 99.7
  });
  const [microTasks, setMicroTasks] = useState<MicroTask[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [autoFix, setAutoFix] = useState(true);

  const t = (key: string) => {
    const translations: Record<string, { en: string; ru: string }> = {
      systemDiagnostics: { en: 'System Diagnostics', ru: 'Диагностика Системы' },
      runDiagnostics: { en: 'Run Diagnostics', ru: 'Запустить Диагностику' },
      autoFix: { en: 'Auto-Fix Issues', ru: 'Авто-исправление' },
      systemHealth: { en: 'System Health', ru: 'Состояние Системы' },
      issues: { en: 'Issues', ru: 'Проблемы' },
      microTasks: { en: 'Micro Tasks', ru: 'Микро-задачи' },
      memory: { en: 'Memory', ru: 'Память' },
      performance: { en: 'Performance', ru: 'Производительность' },
      storage: { en: 'Storage', ru: 'Хранилище' },
      network: { en: 'Network', ru: 'Сеть' },
      security: { en: 'Security', ru: 'Безопасность' },
      uptime: { en: 'Uptime', ru: 'Время работы' },
      critical: { en: 'Critical', ru: 'Критический' },
      high: { en: 'High', ru: 'Высокий' },
      medium: { en: 'Medium', ru: 'Средний' },
      low: { en: 'Low', ru: 'Низкий' },
      detected: { en: 'Detected', ru: 'Обнаружено' },
      analyzing: { en: 'Analyzing', ru: 'Анализируется' },
      fixing: { en: 'Fixing', ru: 'Исправляется' },
      resolved: { en: 'Resolved', ru: 'Решено' },
      pending: { en: 'Pending', ru: 'Ожидает' },
      running: { en: 'Running', ru: 'Выполняется' },
      completed: { en: 'Completed', ru: 'Завершено' },
      failed: { en: 'Failed', ru: 'Неудача' },
      urgent: { en: 'Urgent', ru: 'Срочно' },
      startTask: { en: 'Start Task', ru: 'Запустить Задачу' },
      pauseTask: { en: 'Pause Task', ru: 'Приостановить' },
      retryTask: { en: 'Retry Task', ru: 'Повторить' },
      viewDetails: { en: 'View Details', ru: 'Подробности' },
      noIssues: { en: 'No issues detected', ru: 'Проблем не обнаружено' },
      scanInProgress: { en: 'Scanning system...', ru: 'Сканирование системы...' },
      fixingIssue: { en: 'Fixing issue...', ru: 'Исправление проблемы...' },
      systemHealthy: { en: 'System is healthy', ru: 'Система работает нормально' }
    };
    return translations[key]?.[language] || key;
  };

  // Симуляция обнаружения проблем системы
  const detectSystemIssues = (): SystemIssue[] => {
    const possibleIssues: Omit<SystemIssue, 'id' | 'timestamp'>[] = [
      {
        type: 'warning',
        component: 'Memory Management',
        description: language === 'ru' 
          ? 'Использование памяти превышает 80%' 
          : 'Memory usage exceeds 80%',
        severity: 'medium',
        status: 'detected',
        fixSteps: [
          language === 'ru' ? 'Очистить кэш' : 'Clear cache',
          language === 'ru' ? 'Оптимизировать компоненты' : 'Optimize components',
          language === 'ru' ? 'Освободить неиспользуемые ресурсы' : 'Release unused resources'
        ]
      },
      {
        type: 'error',
        component: 'AI Audit Module',
        description: language === 'ru' 
          ? 'Агент аудита не отвечает' 
          : 'Audit agent not responding',
        severity: 'high',
        status: 'detected',
        fixSteps: [
          language === 'ru' ? 'Перезапустить агента' : 'Restart agent',
          language === 'ru' ? 'Проверить API ключи' : 'Check API keys',
          language === 'ru' ? 'Восстановить соединение' : 'Restore connection'
        ]
      },
      {
        type: 'warning',
        component: 'Data Storage',
        description: language === 'ru' 
          ? 'Фрагментация данных проекта' 
          : 'Project data fragmentation',
        severity: 'medium',
        status: 'detected',
        fixSteps: [
          language === 'ru' ? 'Дефрагментировать данные' : 'Defragment data',
          language === 'ru' ? 'Оптимизировать хранилище' : 'Optimize storage',
          language === 'ru' ? 'Создать резервную копию' : 'Create backup'
        ]
      },
      {
        type: 'info',
        component: 'Chat Module',
        description: language === 'ru' 
          ? 'Медленный ответ от ИИ помощника' 
          : 'Slow AI assistant response',
        severity: 'low',
        status: 'detected',
        fixSteps: [
          language === 'ru' ? 'Оптимизировать запросы' : 'Optimize queries',
          language === 'ru' ? 'Переключить модель' : 'Switch model',
          language === 'ru' ? 'Обновить конфигурацию' : 'Update configuration'
        ]
      }
    ];

    // Возвращаем случайные проблемы для симуляции
    const numIssues = Math.floor(Math.random() * 3) + 1;
    return possibleIssues
      .sort(() => Math.random() - 0.5)
      .slice(0, numIssues)
      .map((issue, index) => ({
        ...issue,
        id: `issue-${Date.now()}-${index}`,
        timestamp: new Date().toISOString()
      }));
  };

  // Создание микро-задач для исправления проблем
  const createMicroTasksFromIssues = (detectedIssues: SystemIssue[]): MicroTask[] => {
    return detectedIssues.map((issue, index) => ({
      id: `task-${Date.now()}-${index}`,
      title: language === 'ru' 
        ? `Исправить: ${issue.component}` 
        : `Fix: ${issue.component}`,
      description: issue.description,
      component: issue.component,
      priority: issue.severity === 'critical' ? 'urgent' : 
                issue.severity === 'high' ? 'high' :
                issue.severity === 'medium' ? 'medium' : 'low',
      status: 'pending',
      progress: 0,
      commands: issue.fixSteps || [],
      dependencies: []
    }));
  };

  // Запуск диагностики
  const runDiagnostics = async () => {
    setIsScanning(true);
    setIssues([]);
    setMicroTasks([]);

    // Симуляция процесса сканирования
    await new Promise(resolve => setTimeout(resolve, 2000));

    const detectedIssues = detectSystemIssues();
    setIssues(detectedIssues);

    if (detectedIssues.length > 0) {
      const tasks = createMicroTasksFromIssues(detectedIssues);
      setMicroTasks(tasks);

      // Уведомление о найденных проблемах
      detectedIssues.forEach(issue => {
        onIssueDetected?.(issue);
      });

      // Автоматическое исправление если включено
      if (autoFix) {
        tasks.forEach((task, index) => {
          setTimeout(() => {
            executeTask(task.id);
          }, index * 1000);
        });
      }
    }

    setIsScanning(false);
  };

  // Выполнение микро-задачи
  const executeTask = async (taskId: string) => {
    setMicroTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'running', startTime: new Date().toISOString() }
        : task
    ));

    const task = microTasks.find(t => t.id === taskId);
    if (!task) return;

    // Выполнение команд поэтапно
    for (let i = 0; i < task.commands.length; i++) {
      setMicroTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, currentCommand: i, progress: ((i + 1) / task.commands.length) * 100 }
          : t
      ));

      // Симуляция выполнения команды
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    }

    // Завершение задачи
    setMicroTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: 'completed', 
            progress: 100,
            endTime: new Date().toISOString(),
            result: language === 'ru' ? 'Успешно исправлено' : 'Successfully fixed'
          }
        : task
    ));

    // Обновление статуса проблемы
    setIssues(prev => prev.map(issue => 
      issue.component === task.component
        ? { ...issue, status: 'resolved' }
        : issue
    ));

    onTaskCompleted?.(task);
  };

  // Автоматическое обновление метрик
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        memory: Math.max(50, prev.memory + (Math.random() - 0.5) * 5),
        performance: Math.max(70, prev.performance + (Math.random() - 0.5) * 3),
        storage: Math.max(60, prev.storage + (Math.random() - 0.5) * 2),
        network: Math.max(80, prev.network + (Math.random() - 0.5) * 4),
        security: Math.max(85, prev.security + (Math.random() - 0.5) * 2),
        uptime: Math.min(100, prev.uptime + Math.random() * 0.1)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'memory': return <Cpu size={16} />;
      case 'performance': return <Activity size={16} />;
      case 'storage': return <Database size={16} />;
      case 'network': return <Globe size={16} />;
      case 'security': return <Shield size={16} />;
      case 'uptime': return <Clock size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <WarningCircle size={16} className="text-destructive" />;
      case 'warning': return <Warning size={16} className="text-yellow-500" />;
      case 'info': return <CheckCircle size={16} className="text-blue-500" />;
      default: return <Bug size={16} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и управление */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('systemDiagnostics')}</h2>
          <p className="text-muted-foreground">
            {language === 'ru' 
              ? 'Анализ системных сбоев и автоматическое исправление' 
              : 'System failure analysis and automatic remediation'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoFix(!autoFix)}
            className={autoFix ? 'bg-green-500/20' : ''}
          >
            {autoFix ? <CheckCircle size={16} className="mr-2" /> : <Pause size={16} className="mr-2" />}
            {t('autoFix')}
          </Button>
          <Button onClick={runDiagnostics} disabled={isScanning}>
            {isScanning ? <ArrowClockwise size={16} className="mr-2 animate-spin" /> : <Play size={16} className="mr-2" />}
            {t('runDiagnostics')}
          </Button>
        </div>
      </div>

      {/* Системные метрики */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={20} />
            {t('systemHealth')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {Object.entries(metrics).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center gap-2">
                  {getMetricIcon(key)}
                  <span className="text-sm font-medium">{t(key)}</span>
                </div>
                <Progress value={value} className="h-2" />
                <div className="text-xs text-muted-foreground text-right">
                  {key === 'uptime' ? `${value.toFixed(1)}%` : `${Math.round(value)}%`}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Обнаруженные проблемы */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug size={20} />
              {t('issues')} ({issues.length})
            </CardTitle>
            <CardDescription>
              {isScanning ? t('scanInProgress') : 
               issues.length === 0 ? t('noIssues') : 
               language === 'ru' ? 'Обнаруженные проблемы системы' : 'Detected system issues'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isScanning ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <ArrowClockwise size={20} className="animate-spin" />
                  <span>{t('scanInProgress')}</span>
                </div>
              </div>
            ) : issues.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <CheckCircle size={48} className="mx-auto text-green-500 mb-2" />
                  <p className="text-muted-foreground">{t('systemHealthy')}</p>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {issues.map((issue) => (
                    <div key={issue.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getIssueIcon(issue.type)}
                          <span className="font-medium text-sm">{issue.component}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(issue.severity)} className="text-xs">
                            {t(issue.severity)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {t(issue.status)}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{issue.description}</p>
                      <div className="text-xs text-muted-foreground">
                        {new Date(issue.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Микро-задачи */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle size={20} />
              {t('microTasks')} ({microTasks.length})
            </CardTitle>
            <CardDescription>
              {language === 'ru' 
                ? 'Поэтапное выполнение исправлений' 
                : 'Step-by-step remediation tasks'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {microTasks.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">
                  {language === 'ru' ? 'Задачи не созданы' : 'No tasks created'}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {microTasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{task.title}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                            {t(task.priority)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {t(task.status)}
                          </Badge>
                        </div>
                      </div>
                      
                      {task.status === 'running' && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>
                              {language === 'ru' ? 'Выполняется:' : 'Executing:'} 
                              {task.currentCommand !== undefined && task.commands[task.currentCommand]}
                            </span>
                            <span>{Math.round(task.progress)}%</span>
                          </div>
                          <Progress value={task.progress} className="h-1" />
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                      
                      {task.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => executeTask(task.id)}
                          className="text-xs h-7"
                        >
                          <Play size={12} className="mr-1" />
                          {t('startTask')}
                        </Button>
                      )}
                      
                      {task.status === 'completed' && task.result && (
                        <div className="text-xs text-green-600 mt-2">
                          ✓ {task.result}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemDiagnostics;