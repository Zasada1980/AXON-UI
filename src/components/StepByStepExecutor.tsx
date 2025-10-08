import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  Stop,
  CheckCircle, 
  Warning,
  Clock,
  Gear,
  Plus,
  ListChecks,
  ArrowClockwise,
  Cpu,
  Activity
} from '@phosphor-icons/react';

interface MicroCommand {
  id: string;
  name: string;
  description: string;
  estimatedTime: number; // в секундах
  dependencies?: string[];
  params?: Record<string, any>;
}

interface ExecutionStep {
  id: string;
  command: MicroCommand;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'skipped';
  startTime?: string;
  endTime?: string;
  duration?: number;
  result?: string;
  error?: string;
  progress: number;
}

interface StepByStepTask {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: 'system' | 'analysis' | 'optimization' | 'maintenance';
  steps: ExecutionStep[];
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'paused';
  startTime?: string;
  endTime?: string;
  totalProgress: number;
  currentStep?: number;
  autoRetry: boolean;
  retryCount: number;
  maxRetries: number;
}

interface StepByStepExecutorProps {
  language?: 'en' | 'ru';
  onTaskCompleted?: (task: StepByStepTask) => void;
  onStepCompleted?: (step: ExecutionStep) => void;
}

const StepByStepExecutor: React.FC<StepByStepExecutorProps> = ({
  language = 'en',
  onTaskCompleted,
  onStepCompleted
}) => {
  const [tasks, setTasks] = useState<StepByStepTask[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [executionSpeed, setExecutionSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [showLogs, setShowLogs] = useState(true);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);

  const t = (key: string) => {
    const translations: Record<string, { en: string; ru: string }> = {
      stepByStepExecutor: { en: 'Step-by-Step Executor', ru: 'Поэтапный Исполнитель' },
      microTaskExecution: { en: 'Micro-task execution with small commands', ru: 'Выполнение микрозадач малыми командами' },
      createMicroTask: { en: 'Create Micro Task', ru: 'Создать Микрозадачу' },
      executionQueue: { en: 'Execution Queue', ru: 'Очередь Выполнения' },
      currentExecution: { en: 'Current Execution', ru: 'Текущее Выполнение' },
      executionLogs: { en: 'Execution Logs', ru: 'Логи Выполнения' },
      taskTitle: { en: 'Task Title', ru: 'Название Задачи' },
      taskDescription: { en: 'Task Description', ru: 'Описание Задачи' },
      priority: { en: 'Priority', ru: 'Приоритет' },
      category: { en: 'Category', ru: 'Категория' },
      executionSpeed: { en: 'Execution Speed', ru: 'Скорость Выполнения' },
      autoRetry: { en: 'Auto Retry', ru: 'Авто-повтор' },
      maxRetries: { en: 'Max Retries', ru: 'Макс. Повторов' },
      urgent: { en: 'Urgent', ru: 'Срочно' },
      high: { en: 'High', ru: 'Высокий' },
      medium: { en: 'Medium', ru: 'Средний' },
      low: { en: 'Low', ru: 'Низкий' },
      system: { en: 'System', ru: 'Система' },
      analysis: { en: 'Analysis', ru: 'Анализ' },
      optimization: { en: 'Optimization', ru: 'Оптимизация' },
      maintenance: { en: 'Maintenance', ru: 'Обслуживание' },
      pending: { en: 'Pending', ru: 'Ожидает' },
      executing: { en: 'Executing', ru: 'Выполняется' },
      completed: { en: 'Completed', ru: 'Завершено' },
      failed: { en: 'Failed', ru: 'Неудача' },
      paused: { en: 'Paused', ru: 'Приостановлено' },
      slow: { en: 'Slow', ru: 'Медленно' },
      normal: { en: 'Normal', ru: 'Нормально' },
      fast: { en: 'Fast', ru: 'Быстро' },
      startExecution: { en: 'Start Execution', ru: 'Начать Выполнение' },
      pauseExecution: { en: 'Pause Execution', ru: 'Приостановить' },
      stopExecution: { en: 'Stop Execution', ru: 'Остановить' },
      clearLogs: { en: 'Clear Logs', ru: 'Очистить Логи' },
      noTasks: { en: 'No tasks in queue', ru: 'Нет задач в очереди' },
      step: { en: 'Step', ru: 'Шаг' },
      estimatedTime: { en: 'Est. Time', ru: 'Оцен. Время' },
      actualTime: { en: 'Actual Time', ru: 'Фактич. Время' },
      retryAttempt: { en: 'Retry Attempt', ru: 'Попытка Повтора' }
    };
    return translations[key]?.[language] || key;
  };

  // Предопределенные микрокоманды
  const getMicroCommands = (): MicroCommand[] => [
    {
      id: 'init-system',
      name: language === 'ru' ? 'Инициализация системы' : 'Initialize system',
      description: language === 'ru' ? 'Проверка системных компонентов' : 'Check system components',
      estimatedTime: 2
    },
    {
      id: 'clear-cache',
      name: language === 'ru' ? 'Очистка кэша' : 'Clear cache',
      description: language === 'ru' ? 'Освобождение кэшированных данных' : 'Free cached data',
      estimatedTime: 3
    },
    {
      id: 'optimize-memory',
      name: language === 'ru' ? 'Оптимизация памяти' : 'Optimize memory',
      description: language === 'ru' ? 'Освобождение неиспользуемой памяти' : 'Free unused memory',
      estimatedTime: 5,
      dependencies: ['clear-cache']
    },
    {
      id: 'backup-data',
      name: language === 'ru' ? 'Резервное копирование' : 'Backup data',
      description: language === 'ru' ? 'Создание резервной копии данных' : 'Create data backup',
      estimatedTime: 8
    },
    {
      id: 'verify-integrity',
      name: language === 'ru' ? 'Проверка целостности' : 'Verify integrity',
      description: language === 'ru' ? 'Проверка целостности данных' : 'Check data integrity',
      estimatedTime: 4,
      dependencies: ['backup-data']
    },
    {
      id: 'update-indexes',
      name: language === 'ru' ? 'Обновление индексов' : 'Update indexes',
      description: language === 'ru' ? 'Перестроение поисковых индексов' : 'Rebuild search indexes',
      estimatedTime: 6
    },
    {
      id: 'analyze-performance',
      name: language === 'ru' ? 'Анализ производительности' : 'Analyze performance',
      description: language === 'ru' ? 'Сбор метрик производительности' : 'Collect performance metrics',
      estimatedTime: 3
    },
    {
      id: 'generate-report',
      name: language === 'ru' ? 'Генерация отчета' : 'Generate report',
      description: language === 'ru' ? 'Создание итогового отчета' : 'Create final report',
      estimatedTime: 4,
      dependencies: ['analyze-performance']
    }
  ];

  // Создание стандартных задач
  const createStandardTasks = (): StepByStepTask[] => {
    const commands = getMicroCommands();
    
    return [
      {
        id: 'system-maintenance',
        title: language === 'ru' ? 'Обслуживание системы' : 'System Maintenance',
        description: language === 'ru' ? 'Плановое техническое обслуживание' : 'Scheduled system maintenance',
        priority: 'high',
        category: 'maintenance',
        status: 'pending',
        totalProgress: 0,
        autoRetry: true,
        retryCount: 0,
        maxRetries: 2,
        steps: [
          { id: 'step-1', command: commands[0], status: 'pending', progress: 0 },
          { id: 'step-2', command: commands[1], status: 'pending', progress: 0 },
          { id: 'step-3', command: commands[2], status: 'pending', progress: 0 },
          { id: 'step-4', command: commands[5], status: 'pending', progress: 0 }
        ]
      },
      {
        id: 'data-optimization',
        title: language === 'ru' ? 'Оптимизация данных' : 'Data Optimization',
        description: language === 'ru' ? 'Оптимизация хранения и индексации данных' : 'Optimize data storage and indexing',
        priority: 'medium',
        category: 'optimization',
        status: 'pending',
        totalProgress: 0,
        autoRetry: true,
        retryCount: 0,
        maxRetries: 3,
        steps: [
          { id: 'step-5', command: commands[3], status: 'pending', progress: 0 },
          { id: 'step-6', command: commands[4], status: 'pending', progress: 0 },
          { id: 'step-7', command: commands[5], status: 'pending', progress: 0 }
        ]
      },
      {
        id: 'performance-analysis',
        title: language === 'ru' ? 'Анализ производительности' : 'Performance Analysis',
        description: language === 'ru' ? 'Комплексный анализ производительности системы' : 'Comprehensive system performance analysis',
        priority: 'low',
        category: 'analysis',
        status: 'pending',
        totalProgress: 0,
        autoRetry: false,
        retryCount: 0,
        maxRetries: 1,
        steps: [
          { id: 'step-8', command: commands[6], status: 'pending', progress: 0 },
          { id: 'step-9', command: commands[7], status: 'pending', progress: 0 }
        ]
      }
    ];
  };

  // Инициализация задач
  useEffect(() => {
    setTasks(createStandardTasks());
  }, [language]);

  // Получение скорости выполнения в миллисекундах
  const getExecutionSpeed = () => {
    switch (executionSpeed) {
      case 'slow': return 2000;
      case 'normal': return 1000;
      case 'fast': return 500;
      default: return 1000;
    }
  };

  // Добавление лога
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setExecutionLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Выполнение одного шага
  const executeStep = async (taskId: string, stepIndex: number): Promise<boolean> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.steps[stepIndex]) return false;

    const step = task.steps[stepIndex];
    
    // Обновление статуса шага
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? {
            ...t,
            steps: t.steps.map((s, i) => 
              i === stepIndex 
                ? { ...s, status: 'executing', startTime: new Date().toISOString(), progress: 0 }
                : s
            )
          }
        : t
    ));

    addLog(`${t('step')} ${stepIndex + 1}: ${step.command.name} - ${language === 'ru' ? 'начато' : 'started'}`);

    try {
      // Симуляция выполнения с прогрессом
      const duration = step.command.estimatedTime * 1000;
      const speedMultiplier = getExecutionSpeed() / 1000;
      const actualDuration = duration * speedMultiplier;
      const progressSteps = 10;
      const stepDuration = actualDuration / progressSteps;

      for (let i = 0; i < progressSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, stepDuration));
        
        const progress = ((i + 1) / progressSteps) * 100;
        setTasks(prev => prev.map(t => 
          t.id === taskId 
            ? {
                ...t,
                steps: t.steps.map((s, idx) => 
                  idx === stepIndex 
                    ? { ...s, progress }
                    : s
                )
              }
            : t
        ));
      }

      // Завершение шага
      const endTime = new Date().toISOString();
      const startTime = new Date(step.startTime!);
      const actualTime = Date.now() - startTime.getTime();

      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? {
              ...t,
              steps: t.steps.map((s, i) => 
                i === stepIndex 
                  ? { 
                      ...s, 
                      status: 'completed', 
                      endTime,
                      duration: actualTime,
                      progress: 100,
                      result: language === 'ru' ? 'Успешно выполнено' : 'Successfully completed'
                    }
                  : s
              )
            }
          : t
      ));

      addLog(`${t('step')} ${stepIndex + 1}: ${step.command.name} - ${language === 'ru' ? 'завершено' : 'completed'} (${(actualTime / 1000).toFixed(1)}s)`);
      
      onStepCompleted?.(step);
      return true;

    } catch (error) {
      // Обработка ошибки
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? {
              ...t,
              steps: t.steps.map((s, i) => 
                i === stepIndex 
                  ? { 
                      ...s, 
                      status: 'failed', 
                      endTime: new Date().toISOString(),
                      error: error instanceof Error ? error.message : 'Unknown error'
                    }
                  : s
              )
            }
          : t
      ));

      addLog(`${t('step')} ${stepIndex + 1}: ${step.command.name} - ${language === 'ru' ? 'ошибка' : 'failed'}`);
      return false;
    }
  };

  // Выполнение задачи
  const executeTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setIsExecuting(true);
    setCurrentTaskId(taskId);

    // Обновление статуса задачи
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, status: 'executing', startTime: new Date().toISOString(), currentStep: 0 }
        : t
    ));

    addLog(`${language === 'ru' ? 'Задача начата' : 'Task started'}: ${task.title}`);

    let allStepsCompleted = true;
    
    for (let i = 0; i < task.steps.length; i++) {
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, currentStep: i }
          : t
      ));

      const success = await executeStep(taskId, i);
      
      if (!success) {
        allStepsCompleted = false;
        if (task.autoRetry && task.retryCount < task.maxRetries) {
          addLog(`${t('retryAttempt')} ${task.retryCount + 1}/${task.maxRetries}`);
          setTasks(prev => prev.map(t => 
            t.id === taskId 
              ? { ...t, retryCount: t.retryCount + 1 }
              : t
          ));
          i--; // Повторить текущий шаг
          continue;
        } else {
          break;
        }
      }

      // Обновление общего прогресса
      const progress = ((i + 1) / task.steps.length) * 100;
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, totalProgress: progress }
          : t
      ));
    }

    // Завершение задачи
    const finalStatus = allStepsCompleted ? 'completed' : 'failed';
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { 
            ...t, 
            status: finalStatus, 
            endTime: new Date().toISOString(),
            totalProgress: allStepsCompleted ? 100 : t.totalProgress
          }
        : t
    ));

    addLog(`${language === 'ru' ? 'Задача' : 'Task'} ${task.title} - ${language === 'ru' ? (allStepsCompleted ? 'завершена' : 'провалена') : (allStepsCompleted ? 'completed' : 'failed')}`);

    if (allStepsCompleted) {
      onTaskCompleted?.(task);
    }

    setIsExecuting(false);
    setCurrentTaskId(null);
  };

  // Приостановка выполнения
  const pauseExecution = () => {
    if (currentTaskId) {
      setTasks(prev => prev.map(t => 
        t.id === currentTaskId 
          ? { ...t, status: 'paused' }
          : t
      ));
      setIsExecuting(false);
      addLog(language === 'ru' ? 'Выполнение приостановлено' : 'Execution paused');
    }
  };

  // Остановка выполнения
  const stopExecution = () => {
    if (currentTaskId) {
      setTasks(prev => prev.map(t => 
        t.id === currentTaskId 
          ? { ...t, status: 'failed', endTime: new Date().toISOString() }
          : t
      ));
      setIsExecuting(false);
      setCurrentTaskId(null);
      addLog(language === 'ru' ? 'Выполнение остановлено' : 'Execution stopped');
    }
  };

  // Очистка логов
  const clearLogs = () => {
    setExecutionLogs([]);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'executing': return 'text-blue-500';
      case 'failed': return 'text-red-500';
      case 'paused': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и управление */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('stepByStepExecutor')}</h2>
          <p className="text-muted-foreground">{t('microTaskExecution')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={executionSpeed} onValueChange={(value: 'slow' | 'normal' | 'fast') => setExecutionSpeed(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="slow">{t('slow')}</SelectItem>
              <SelectItem value="normal">{t('normal')}</SelectItem>
              <SelectItem value="fast">{t('fast')}</SelectItem>
            </SelectContent>
          </Select>
          
          {!isExecuting ? (
            <Button 
              onClick={() => {
                const pendingTask = tasks.find(t => t.status === 'pending');
                if (pendingTask) executeTask(pendingTask.id);
              }}
              disabled={!tasks.some(t => t.status === 'pending')}
            >
              <Play size={16} className="mr-2" />
              {t('startExecution')}
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button onClick={pauseExecution} variant="outline">
                <Pause size={16} className="mr-2" />
                {t('pauseExecution')}
              </Button>
              <Button onClick={stopExecution} variant="destructive">
                <Stop size={16} className="mr-2" />
                {t('stopExecution')}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Очередь выполнения */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks size={20} />
                {t('executionQueue')} ({tasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t('noTasks')}</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div key={task.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{task.title}</h4>
                            {task.status === 'executing' && (
                              <ArrowClockwise size={16} className="animate-spin text-blue-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                              {t(task.priority)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {t(task.status)}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>

                        {/* Общий прогресс */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>{language === 'ru' ? 'Общий прогресс' : 'Overall Progress'}</span>
                            <span>{Math.round(task.totalProgress)}%</span>
                          </div>
                          <Progress value={task.totalProgress} className="h-2" />
                        </div>

                        {/* Шаги */}
                        <div className="space-y-2">
                          {task.steps.map((step, index) => (
                            <div key={step.id} className="flex items-center gap-3 text-sm">
                              <div className="w-6 h-6 rounded-full border flex items-center justify-center text-xs">
                                {step.status === 'completed' ? (
                                  <CheckCircle size={16} className="text-green-500" />
                                ) : step.status === 'executing' ? (
                                  <ArrowClockwise size={12} className="animate-spin text-blue-500" />
                                ) : step.status === 'failed' ? (
                                  <Warning size={16} className="text-red-500" />
                                ) : (
                                  <span className="text-muted-foreground">{index + 1}</span>
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className={getStatusColor(step.status)}>{step.command.name}</span>
                                  {step.status === 'executing' && (
                                    <span className="text-xs text-muted-foreground">
                                      {Math.round(step.progress)}%
                                    </span>
                                  )}
                                </div>
                                {step.status === 'executing' && (
                                  <Progress value={step.progress} className="h-1 mt-1" />
                                )}
                                {step.duration && (
                                  <div className="text-xs text-muted-foreground">
                                    {t('actualTime')}: {(step.duration / 1000).toFixed(1)}s
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Действия */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          <div className="text-xs text-muted-foreground">
                            {task.retryCount > 0 && (
                              <span>{t('retryAttempt')}: {task.retryCount}/{task.maxRetries}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {task.status === 'pending' && (
                              <Button 
                                size="sm" 
                                onClick={() => executeTask(task.id)}
                                disabled={isExecuting}
                              >
                                <Play size={14} className="mr-1" />
                                {language === 'ru' ? 'Запустить' : 'Start'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Панель управления и логи */}
        <div className="space-y-6">
          {/* Текущее выполнение */}
          {currentTaskId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity size={16} />
                  {t('currentExecution')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const currentTask = tasks.find(t => t.id === currentTaskId);
                  if (!currentTask) return null;
                  
                  return (
                    <div className="space-y-3">
                      <div className="text-sm font-medium">{currentTask.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {language === 'ru' ? 'Шаг' : 'Step'} {(currentTask.currentStep || 0) + 1} / {currentTask.steps.length}
                      </div>
                      <Progress value={currentTask.totalProgress} className="h-2" />
                      <div className="text-xs text-muted-foreground text-right">
                        {Math.round(currentTask.totalProgress)}%
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Логи выполнения */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock size={16} />
                  {t('executionLogs')}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={clearLogs}>
                  {t('clearLogs')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {executionLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-sm">
                      {language === 'ru' ? 'Логи пусты' : 'No logs yet'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {executionLogs.slice().reverse().map((log, index) => (
                      <div key={index} className="text-xs font-mono text-muted-foreground p-1 rounded bg-muted/20">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Настройки */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Gear size={16} />
                {language === 'ru' ? 'Настройки' : 'Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>{t('executionSpeed')}</Label>
                  <Select value={executionSpeed} onValueChange={(value: 'slow' | 'normal' | 'fast') => setExecutionSpeed(value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">{t('slow')} (2x)</SelectItem>
                      <SelectItem value="normal">{t('normal')} (1x)</SelectItem>
                      <SelectItem value="fast">{t('fast')} (0.5x)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    {language === 'ru' ? 'Статистика' : 'Statistics'}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>{language === 'ru' ? 'Всего:' : 'Total:'}</span>
                      <span>{tasks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'ru' ? 'Завершено:' : 'Completed:'}</span>
                      <span>{tasks.filter(t => t.status === 'completed').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'ru' ? 'Ожидает:' : 'Pending:'}</span>
                      <span>{tasks.filter(t => t.status === 'pending').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'ru' ? 'Неудачи:' : 'Failed:'}</span>
                      <span>{tasks.filter(t => t.status === 'failed').length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StepByStepExecutor;