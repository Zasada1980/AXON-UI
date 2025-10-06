import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  ListChecks,
  PlayCircle,
  PauseCircle,
  Stop,
  CheckCircle,
  XCircle,
  Clock,
  Warning,
  Activity,
  ArrowRight,
  Gear,
  ChartLine
} from '@phosphor-icons/react';

interface TaskBlock {
  id: string;
  name: string;
  description: string;
  category: 'analysis' | 'recovery' | 'maintenance' | 'security' | 'optimization';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'queued' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  dependencies?: string[];
  estimatedTime: number; // в секундах
  actualTime?: number;
  startTime?: string;
  endTime?: string;
  error?: string;
  result?: string;
  checkpoint?: {
    created: boolean;
    id?: string;
    name?: string;
  };
}

interface TaskQueue {
  id: string;
  name: string;
  description: string;
  blocks: TaskBlock[];
  status: 'draft' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  currentBlockIndex: number;
  autoCheckpoint: boolean;
  continueOnError: boolean;
}

interface Statistics {
  totalExecuted: number;
  totalFailed: number;
  totalTime: number;
  averageTime: number;
  successRate: number;
}

interface TaskManagementSystemProps {
  language: 'en' | 'ru';
  onTaskCompleted?: (task: TaskBlock) => void;
  onQueueCompleted?: (queue: TaskQueue) => void;
}

const TaskManagementSystem: React.FC<TaskManagementSystemProps> = ({
  language,
  onTaskCompleted,
  onQueueCompleted
}) => {
  const [queues, setQueues] = useKV<TaskQueue[]>('task-queues', []);
  const [currentQueue, setCurrentQueue] = useState<TaskQueue | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [statistics, setStatistics] = useKV<Statistics>('task-statistics', {
    totalExecuted: 0,
    totalFailed: 0,
    totalTime: 0,
    averageTime: 0,
    successRate: 0
  });

  const t = (key: string) => {
    const translations: { [key: string]: { en: string; ru: string } } = {
      taskManagement: { en: 'Task Management System', ru: 'Система Управления Задачами' },
      taskDesc: { en: 'Break down complex operations into manageable blocks with checkpoint support', ru: 'Разбиение сложных операций на управляемые блоки с поддержкой контрольных точек' },
      queues: { en: 'Task Queues', ru: 'Очереди Задач' },
      currentQueue: { en: 'Current Queue', ru: 'Текущая Очередь' },
      statistics: { en: 'Statistics', ru: 'Статистика' },
      createQueue: { en: 'Create Queue', ru: 'Создать Очередь' },
      startExecution: { en: 'Start Execution', ru: 'Начать Выполнение' },
      pauseExecution: { en: 'Pause Execution', ru: 'Приостановить' },
      stopExecution: { en: 'Stop Execution', ru: 'Остановить' },
      resumeExecution: { en: 'Resume Execution', ru: 'Продолжить' },
      systemAnalysis: { en: 'System Analysis', ru: 'Анализ Системы' },
      systemRecovery: { en: 'System Recovery', ru: 'Восстановление Системы' },
      maintenance: { en: 'Maintenance', ru: 'Обслуживание' },
      security: { en: 'Security', ru: 'Безопасность' },
      optimization: { en: 'Optimization', ru: 'Оптимизация' },
      totalExecuted: { en: 'Total Executed', ru: 'Всего Выполнено' },
      totalFailed: { en: 'Total Failed', ru: 'Всего Неудач' },
      totalTime: { en: 'Total Time', ru: 'Общее Время' },
      averageTime: { en: 'Average Time', ru: 'Среднее Время' },
      successRate: { en: 'Success Rate', ru: 'Успешность' },
      estimated: { en: 'Estimated', ru: 'Расчетное' },
      actual: { en: 'Actual', ru: 'Фактическое' },
      checkpointCreated: { en: 'Checkpoint Created', ru: 'Контрольная Точка Создана' },
      dependencies: { en: 'Dependencies', ru: 'Зависимости' },
      noQueues: { en: 'No task queues available', ru: 'Нет доступных очередей задач' }
    };
    return translations[key]?.[language] || key;
  };

  // Инициализация предустановленных очередей задач
  useEffect(() => {
    if (!queues || queues.length === 0) {
      const defaultQueues: TaskQueue[] = [
        createSystemAnalysisQueue(),
        createSystemRecoveryQueue(),
        createMaintenanceQueue()
      ];
      setQueues(defaultQueues);
    }
  }, []);

  const createSystemAnalysisQueue = (): TaskQueue => ({
    id: 'system-analysis-queue',
    name: t('systemAnalysis'),
    description: language === 'ru' 
      ? 'Комплексный анализ системы с проверкой всех компонентов'
      : 'Comprehensive system analysis with component verification',
    status: 'draft',
    progress: 0,
    currentBlockIndex: 0,
    autoCheckpoint: true,
    continueOnError: false,
    blocks: [
      {
        id: 'check-system-health',
        name: language === 'ru' ? 'Проверка здоровья системы' : 'Check System Health',
        description: language === 'ru' 
          ? 'Базовая диагностика всех системных компонентов'
          : 'Basic diagnostics of all system components',
        category: 'analysis',
        priority: 'high',
        status: 'queued',
        progress: 0,
        estimatedTime: 30
      },
      {
        id: 'analyze-performance',
        name: language === 'ru' ? 'Анализ производительности' : 'Analyze Performance',
        description: language === 'ru'
          ? 'Детальный анализ метрик производительности'
          : 'Detailed performance metrics analysis',
        category: 'analysis',
        priority: 'medium',
        status: 'queued',
        progress: 0,
        estimatedTime: 45,
        dependencies: ['check-system-health']
      },
      {
        id: 'security-scan',
        name: language === 'ru' ? 'Сканирование безопасности' : 'Security Scan',
        description: language === 'ru'
          ? 'Проверка уязвимостей и угроз безопасности'
          : 'Vulnerability and security threat scanning',
        category: 'security',
        priority: 'high',
        status: 'queued',
        progress: 0,
        estimatedTime: 60,
        dependencies: ['check-system-health']
      },
      {
        id: 'generate-report',
        name: language === 'ru' ? 'Генерация отчета' : 'Generate Report',
        description: language === 'ru'
          ? 'Создание сводного отчета по результатам анализа'
          : 'Create comprehensive analysis report',
        category: 'analysis',
        priority: 'medium',
        status: 'queued',
        progress: 0,
        estimatedTime: 20,
        dependencies: ['analyze-performance', 'security-scan']
      }
    ]
  });

  const createSystemRecoveryQueue = (): TaskQueue => ({
    id: 'system-recovery-queue',
    name: t('systemRecovery'),
    description: language === 'ru'
      ? 'Пошаговое восстановление системы после сбоя'
      : 'Step-by-step system recovery after failure',
    status: 'draft',
    progress: 0,
    currentBlockIndex: 0,
    autoCheckpoint: true,
    continueOnError: true,
    blocks: [
      {
        id: 'create-recovery-checkpoint',
        name: language === 'ru' ? 'Создание контрольной точки восстановления' : 'Create Recovery Checkpoint',
        description: language === 'ru'
          ? 'Сохранение текущего состояния перед восстановлением'
          : 'Save current state before recovery',
        category: 'recovery',
        priority: 'critical',
        status: 'queued',
        progress: 0,
        estimatedTime: 15
      },
      {
        id: 'stop-services',
        name: language === 'ru' ? 'Остановка сервисов' : 'Stop Services',
        description: language === 'ru'
          ? 'Безопасная остановка всех системных сервисов'
          : 'Safe shutdown of all system services',
        category: 'recovery',
        priority: 'high',
        status: 'queued',
        progress: 0,
        estimatedTime: 30,
        dependencies: ['create-recovery-checkpoint']
      },
      {
        id: 'clear-temp-files',
        name: language === 'ru' ? 'Очистка временных файлов' : 'Clear Temporary Files',
        description: language === 'ru'
          ? 'Удаление временных и поврежденных файлов'
          : 'Remove temporary and corrupted files',
        category: 'maintenance',
        priority: 'medium',
        status: 'queued',
        progress: 0,
        estimatedTime: 25,
        dependencies: ['stop-services']
      },
      {
        id: 'restart-services',
        name: language === 'ru' ? 'Перезапуск сервисов' : 'Restart Services',
        description: language === 'ru'
          ? 'Запуск всех критических системных сервисов'
          : 'Start all critical system services',
        category: 'recovery',
        priority: 'critical',
        status: 'queued',
        progress: 0,
        estimatedTime: 40,
        dependencies: ['clear-temp-files']
      },
      {
        id: 'verify-recovery',
        name: language === 'ru' ? 'Проверка восстановления' : 'Verify Recovery',
        description: language === 'ru'
          ? 'Проверка успешности процесса восстановления'
          : 'Verify successful recovery process',
        category: 'recovery',
        priority: 'high',
        status: 'queued',
        progress: 0,
        estimatedTime: 35,
        dependencies: ['restart-services']
      }
    ]
  });

  const createMaintenanceQueue = (): TaskQueue => ({
    id: 'maintenance-queue',
    name: t('maintenance'),
    description: language === 'ru'
      ? 'Плановое обслуживание и оптимизация системы'
      : 'Scheduled maintenance and system optimization',
    status: 'draft',
    progress: 0,
    currentBlockIndex: 0,
    autoCheckpoint: false,
    continueOnError: true,
    blocks: [
      {
        id: 'backup-data',
        name: language === 'ru' ? 'Резервное копирование' : 'Backup Data',
        description: language === 'ru'
          ? 'Создание резервной копии критических данных'
          : 'Create backup of critical data',
        category: 'maintenance',
        priority: 'high',
        status: 'queued',
        progress: 0,
        estimatedTime: 90
      },
      {
        id: 'clean-logs',
        name: language === 'ru' ? 'Очистка логов' : 'Clean Logs',
        description: language === 'ru'
          ? 'Архивирование и удаление старых логов'
          : 'Archive and remove old log files',
        category: 'maintenance',
        priority: 'low',
        status: 'queued',
        progress: 0,
        estimatedTime: 20,
        dependencies: ['backup-data']
      },
      {
        id: 'optimize-database',
        name: language === 'ru' ? 'Оптимизация базы данных' : 'Optimize Database',
        description: language === 'ru'
          ? 'Индексирование и дефрагментация базы данных'
          : 'Database indexing and defragmentation',
        category: 'optimization',
        priority: 'medium',
        status: 'queued',
        progress: 0,
        estimatedTime: 120,
        dependencies: ['backup-data']
      },
      {
        id: 'update-system',
        name: language === 'ru' ? 'Обновление системы' : 'Update System',
        description: language === 'ru'
          ? 'Установка обновлений безопасности и исправлений'
          : 'Install security updates and patches',
        category: 'maintenance',
        priority: 'medium',
        status: 'queued',
        progress: 0,
        estimatedTime: 180,
        dependencies: ['clean-logs', 'optimize-database']
      }
    ]
  });

  const executeTaskBlock = async (block: TaskBlock): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Имитация выполнения задачи
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        
        if (progress >= 100) {
          clearInterval(interval);
          // Случайная вероятность неудачи для демонстрации
          if (Math.random() > 0.85) {
            reject(new Error(`Task ${block.name} failed for demonstration`));
          } else {
            resolve();
          }
        }
      }, 500);

      // Таймаут для завершения задачи
      setTimeout(() => {
        clearInterval(interval);
        if (Math.random() > 0.9) {
          reject(new Error(`Task ${block.name} timed out`));
        } else {
          resolve();
        }
      }, block.estimatedTime * 100); // Ускоряем для демонстрации
    });
  };

  const createCheckpointForTask = async (task: TaskBlock, queue: TaskQueue): Promise<string | null> => {
    // Имитация создания контрольной точки
    const checkpointName = `${queue.name} - ${task.name} Checkpoint`;
    
    try {
      // Здесь была бы реальная логика создания контрольной точки
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return `checkpoint-${Date.now()}`;
    } catch (error) {
      console.error('Failed to create checkpoint:', error);
      return null;
    }
  };

  const executeQueue = async (queue: TaskQueue) => {
    if (!queue || isExecuting) return;

    setIsExecuting(true);
    const startTime = new Date();
    
    const updatedQueue = {
      ...queue,
      status: 'running' as const,
      currentBlockIndex: 0
    };

    setCurrentQueue(updatedQueue);

    try {
      for (let i = 0; i < queue.blocks.length; i++) {
        const block = queue.blocks[i];
        
        // Проверка зависимостей
        if (block.dependencies) {
          const missingDeps = block.dependencies.filter(depId => {
            const depBlock = queue.blocks.find(b => b.id === depId);
            return !depBlock || depBlock.status !== 'completed';
          });
          
          if (missingDeps.length > 0) {
            const error = `Missing dependencies: ${missingDeps.join(', ')}`;
            if (!queue.continueOnError) {
              throw new Error(error);
            } else {
              toast.warning(error);
              continue;
            }
          }
        }

        // Создание контрольной точки перед выполнением (если включено)
        let checkpointId: string | null = null;
        if (queue.autoCheckpoint) {
          checkpointId = await createCheckpointForTask(block, queue);
          if (checkpointId) {
            toast.info(`Checkpoint created for ${block.name}`);
          }
        }

        // Обновление статуса текущего блока
        const runningQueue = {
          ...updatedQueue,
          currentBlockIndex: i,
          blocks: updatedQueue.blocks.map(b => 
            b.id === block.id ? { 
              ...b, 
              status: 'running' as const,
              startTime: new Date().toISOString(),
              checkpoint: checkpointId ? {
                created: true,
                id: checkpointId,
                name: `${queue.name} - ${block.name} Checkpoint`
              } : undefined
            } : b
          ),
          progress: Math.round((i / queue.blocks.length) * 100)
        };
        
        setCurrentQueue(runningQueue);
        toast.info(`Executing: ${block.name}`);

        try {
          const blockStartTime = new Date();
          await executeTaskBlock(block);
          const actualTime = Math.round((new Date().getTime() - blockStartTime.getTime()) / 1000);
          
          // Успешное завершение блока
          const completedQueue = {
            ...runningQueue,
            blocks: runningQueue.blocks.map(b => 
              b.id === block.id ? { 
                ...b, 
                status: 'completed' as const,
                progress: 100,
                endTime: new Date().toISOString(),
                actualTime,
                result: `Successfully completed ${block.name}`
              } : b
            )
          };
          
          setCurrentQueue(completedQueue);
          onTaskCompleted?.(block);
          toast.success(`Completed: ${block.name}`);
          
          // Обновление статистики
          setStatistics(current => {
            const stats = current || { totalExecuted: 0, totalFailed: 0, totalTime: 0, averageTime: 0, successRate: 0 };
            const newTotalExecuted = stats.totalExecuted + 1;
            const newTotalTime = stats.totalTime + actualTime;
            return {
              totalExecuted: newTotalExecuted,
              totalFailed: stats.totalFailed,
              totalTime: newTotalTime,
              averageTime: Math.round(newTotalTime / newTotalExecuted),
              successRate: Math.round((newTotalExecuted / (newTotalExecuted + stats.totalFailed)) * 100)
            };
          });
          
        } catch (error) {
          // Ошибка выполнения блока
          const failedQueue = {
            ...runningQueue,
            blocks: runningQueue.blocks.map(b => 
              b.id === block.id ? { 
                ...b, 
                status: 'failed' as const,
                endTime: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
              } : b
            )
          };
          
          setCurrentQueue(failedQueue);
          toast.error(`Failed: ${block.name} - ${error instanceof Error ? error.message : 'Unknown error'}`);
          
          // Обновление статистики
          setStatistics(current => {
            const stats = current || { totalExecuted: 0, totalFailed: 0, totalTime: 0, averageTime: 0, successRate: 0 };
            const newTotalFailed = stats.totalFailed + 1;
            const totalTasks = stats.totalExecuted + newTotalFailed;
            return {
              totalExecuted: stats.totalExecuted,
              totalFailed: newTotalFailed,
              totalTime: stats.totalTime,
              averageTime: stats.averageTime,
              successRate: totalTasks > 0 ? Math.round((stats.totalExecuted / totalTasks) * 100) : 0
            };
          });
          
          if (!queue.continueOnError) {
            throw error;
          }
        }
      }

      // Завершение всей очереди
      const completedQueue = {
        ...updatedQueue,
        status: 'completed' as const,
        progress: 100,
        currentBlockIndex: queue.blocks.length
      };
      
      setCurrentQueue(completedQueue);
      onQueueCompleted?.(completedQueue);
      toast.success(`Queue completed: ${queue.name}`);
      
    } catch (error) {
      const failedQueue = {
        ...updatedQueue,
        status: 'failed' as const
      };
      
      setCurrentQueue(failedQueue);
      toast.error(`Queue failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setIsExecuting(false);
  };

  const pauseExecution = () => {
    if (currentQueue && isExecuting) {
      const pausedQueue = {
        ...currentQueue,
        status: 'paused' as const
      };
      setCurrentQueue(pausedQueue);
      setIsExecuting(false);
      toast.info('Execution paused');
    }
  };

  const stopExecution = () => {
    if (currentQueue) {
      const stoppedQueue = {
        ...currentQueue,
        status: 'failed' as const
      };
      setCurrentQueue(stoppedQueue);
      setIsExecuting(false);
      toast.info('Execution stopped');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'secondary';
      case 'running': return 'default';
      case 'failed': return 'destructive';
      case 'paused': return 'outline';
      default: return 'outline';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'analysis': return 'default';
      case 'recovery': return 'destructive';
      case 'maintenance': return 'secondary';
      case 'security': return 'outline';
      case 'optimization': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks size={24} className="text-primary" />
            {t('taskManagement')}
          </CardTitle>
          <CardDescription>
            {t('taskDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="queues" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="queues">{t('queues')}</TabsTrigger>
              <TabsTrigger value="current">{t('currentQueue')}</TabsTrigger>
              <TabsTrigger value="stats">{t('statistics')}</TabsTrigger>
            </TabsList>

            {/* Task Queues Tab */}
            <TabsContent value="queues" className="space-y-4">
              {(queues || []).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ListChecks size={48} className="mx-auto mb-4 opacity-50" />
                  <p>{t('noQueues')}</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {(queues || []).map(queue => (
                    <Card 
                      key={queue.id}
                      className={`cursor-pointer transition-all ${
                        currentQueue?.id === queue.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setCurrentQueue(queue)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{queue.name}</h4>
                          <Badge variant={getStatusColor(queue.status)}>
                            {t(queue.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {queue.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>{queue.currentBlockIndex} / {queue.blocks.length} blocks</span>
                            <span>{queue.progress}%</span>
                          </div>
                          <Progress value={queue.progress} className="h-1" />
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {queue.autoCheckpoint && (
                              <Badge variant="outline" className="text-xs">Auto Checkpoint</Badge>
                            )}
                            {queue.continueOnError && (
                              <Badge variant="outline" className="text-xs">Continue on Error</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Current Queue Tab */}
            <TabsContent value="current" className="space-y-4">
              {!currentQueue ? (
                <Alert>
                  <Warning size={16} />
                  <AlertDescription>
                    {language === 'ru' 
                      ? 'Выберите очередь задач для просмотра деталей'
                      : 'Select a task queue to view details'
                    }
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {/* Queue Controls */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{currentQueue.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(currentQueue.status)}>
                            {t(currentQueue.status)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {currentQueue.progress}%
                          </span>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        {currentQueue.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 mb-4">
                        <Button
                          onClick={() => executeQueue(currentQueue)}
                          disabled={isExecuting || currentQueue.status === 'completed'}
                        >
                          <PlayCircle size={16} className="mr-2" />
                          {currentQueue.status === 'paused' ? t('resumeExecution') : t('startExecution')}
                        </Button>
                        
                        {isExecuting && (
                          <>
                            <Button onClick={pauseExecution} variant="outline">
                              <PauseCircle size={16} className="mr-2" />
                              {t('pauseExecution')}
                            </Button>
                            <Button onClick={stopExecution} variant="destructive">
                              <Stop size={16} className="mr-2" />
                              {t('stopExecution')}
                            </Button>
                          </>
                        )}
                      </div>
                      
                      <Progress value={currentQueue.progress} className="mb-2" />
                      <div className="text-sm text-muted-foreground">
                        Block {currentQueue.currentBlockIndex + 1} of {currentQueue.blocks.length} | 
                        Progress: {currentQueue.progress}%
                      </div>
                    </CardContent>
                  </Card>

                  {/* Task Blocks */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Task Blocks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-96">
                        <div className="space-y-3">
                          {currentQueue.blocks.map((block, index) => (
                            <Card 
                              key={block.id}
                              className={`${
                                index === currentQueue.currentBlockIndex && isExecuting
                                  ? 'ring-2 ring-primary'
                                  : ''
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant={getCategoryColor(block.category)}>
                                        {t(block.category)}
                                      </Badge>
                                      <Badge variant={getPriorityColor(block.priority as any)}>
                                        {t(block.priority)}
                                      </Badge>
                                      <Badge variant={getStatusColor(block.status)}>
                                        {t(block.status)}
                                      </Badge>
                                      {block.checkpoint?.created && (
                                        <Badge variant="secondary">
                                          {t('checkpointCreated')}
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <h4 className="font-medium mb-1">{block.name}</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {block.description}
                                    </p>
                                    
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {t('estimated')}: {block.estimatedTime}s
                                      </span>
                                      {block.actualTime && (
                                        <span>
                                          {t('actual')}: {block.actualTime}s
                                        </span>
                                      )}
                                      {block.dependencies && block.dependencies.length > 0 && (
                                        <span>
                                          {t('dependencies')}: {block.dependencies.length}
                                        </span>
                                      )}
                                    </div>
                                    
                                    {block.status === 'running' && (
                                      <Progress value={block.progress} className="mt-2 h-1" />
                                    )}
                                    
                                    {block.result && (
                                      <Alert className="mt-2">
                                        <CheckCircle size={16} />
                                        <AlertDescription>{block.result}</AlertDescription>
                                      </Alert>
                                    )}
                                    
                                    {block.error && (
                                      <Alert variant="destructive" className="mt-2">
                                        <XCircle size={16} />
                                        <AlertDescription>{block.error}</AlertDescription>
                                      </Alert>
                                    )}
                                  </div>
                                  
                                  <div className="text-right">
                                    <div className="text-lg font-semibold">
                                      {index + 1}
                                    </div>
                                    {index === currentQueue.currentBlockIndex && isExecuting && (
                                      <div className="text-xs text-muted-foreground">
                                        Current
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="stats" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={20} className="text-green-500" />
                      <h4 className="font-medium">{t('totalExecuted')}</h4>
                    </div>
                    <div className="text-2xl font-bold">{statistics?.totalExecuted || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle size={20} className="text-red-500" />
                      <h4 className="font-medium">{t('totalFailed')}</h4>
                    </div>
                    <div className="text-2xl font-bold">{statistics?.totalFailed || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={20} className="text-blue-500" />
                      <h4 className="font-medium">{t('averageTime')}</h4>
                    </div>
                    <div className="text-2xl font-bold">{statistics?.averageTime || 0}s</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ChartLine size={20} className="text-green-500" />
                      <h4 className="font-medium">{t('successRate')}</h4>
                    </div>
                    <div className="text-2xl font-bold">{statistics?.successRate || 0}%</div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Success Rate</span>
                        <span className="text-sm text-muted-foreground">{statistics?.successRate || 0}%</span>
                      </div>
                      <Progress value={statistics?.successRate || 0} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Total Time</span>
                        <span className="text-sm text-muted-foreground">{Math.round((statistics?.totalTime || 0) / 60)}m {(statistics?.totalTime || 0) % 60}s</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Average: {statistics?.averageTime || 0}s per task
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskManagementSystem;