import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  CheckCircle,
  Clock,
  Warning,
  Target,
  FileText,
  Play,
  Pause,
  Stop,
  ChartLine,
  TrendUp,
  Shield,
  Lightning,
  Bug,
  FileCode,
  Gear,
  GitBranch,
  Timer,
  ListChecks
} from '@phosphor-icons/react';

interface TaskBlock {
  id: string;
  name: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'planning' | 'in-progress' | 'completed' | 'blocked';
  progress: number;
  timeframe: string;
  icon: string;
  color: string;
  tasks: MicroTask[];
}

interface MicroTask {
  id: string;
  blockId: string;
  name: string;
  description: string;
  estimatedHours: number;
  actualHours?: number;
  status: 'todo' | 'in-progress' | 'completed' | 'blocked';
  assignee?: string;
  dueDate?: string;
  dependencies?: string[];
  blockers?: string[];
  notes?: string;
  completedAt?: string;
}

interface TaskIntegrationTrackerProps {
  language: 'en' | 'ru';
  projectId: string;
  onTaskCompleted?: (task: MicroTask) => void;
  onBlockCompleted?: (block: TaskBlock) => void;
  onBlockerDetected?: (blocker: string, taskId: string) => void;
}

const TaskIntegrationTracker: React.FC<TaskIntegrationTrackerProps> = ({
  language,
  projectId,
  onTaskCompleted,
  onBlockCompleted,
  onBlockerDetected
}) => {
  // Persistent state
  const [taskBlocks, setTaskBlocks] = useKV<TaskBlock[]>(`task-blocks-${projectId}`, []);
  const [activeTimers, setActiveTimers] = useKV<{[taskId: string]: number}>(`active-timers-${projectId}`, {});
  const [dailyLog, setDailyLog] = useKV<{date: string; completedTasks: string[]; totalHours: number}[]>(`daily-log-${projectId}`, []);
  
  // UI state
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [isAddingBlocker, setIsAddingBlocker] = useState(false);
  const [blockerText, setBlockerText] = useState('');
  const [currentTimer, setCurrentTimer] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Safe access to arrays
  const safeTaskBlocks = taskBlocks || [];
  const safeActiveTimers = activeTimers || {};
  const safeDailyLog = dailyLog || [];

  // Translations
  const t = (key: string): string => {
    const translations: {[key: string]: {en: string; ru: string}} = {
      taskIntegrationTracker: { en: 'Task Integration Tracker', ru: 'Трекер Интеграционных Задач' },
      taskBlocks: { en: 'Task Blocks', ru: 'Блоки Задач' },
      microTasks: { en: 'Micro Tasks', ru: 'Микро-задачи' },
      progress: { en: 'Progress', ru: 'Прогресс' },
      timeTracking: { en: 'Time Tracking', ru: 'Учет Времени' },
      blockers: { en: 'Blockers', ru: 'Блокеры' },
      analytics: { en: 'Analytics', ru: 'Аналитика' },
      startTask: { en: 'Start Task', ru: 'Начать Задачу' },
      pauseTask: { en: 'Pause Task', ru: 'Пауза' },
      completeTask: { en: 'Complete Task', ru: 'Завершить Задачу' },
      addBlocker: { en: 'Add Blocker', ru: 'Добавить Блокер' },
      estimatedTime: { en: 'Estimated Time', ru: 'Планируемое Время' },
      actualTime: { en: 'Actual Time', ru: 'Фактическое Время' },
      dueDate: { en: 'Due Date', ru: 'Срок Выполнения' },
      dependencies: { en: 'Dependencies', ru: 'Зависимости' },
      notes: { en: 'Notes', ru: 'Заметки' },
      critical: { en: 'Critical', ru: 'Критический' },
      high: { en: 'High', ru: 'Высокий' },
      medium: { en: 'Medium', ru: 'Средний' },
      low: { en: 'Low', ru: 'Низкий' },
      todo: { en: 'To Do', ru: 'К Выполнению' },
      inProgress: { en: 'In Progress', ru: 'В Работе' },
      completed: { en: 'Completed', ru: 'Завершено' },
      blocked: { en: 'Blocked', ru: 'Заблокировано' },
      planning: { en: 'Planning', ru: 'Планирование' },
      totalTasks: { en: 'Total Tasks', ru: 'Всего Задач' },
      completedTasks: { en: 'Completed Tasks', ru: 'Завершенных Задач' },
      averageTime: { en: 'Average Time', ru: 'Среднее Время' },
      efficiency: { en: 'Efficiency', ru: 'Эффективность' },
      tasks: { en: 'tasks', ru: 'задач' },
      estimated: { en: 'estimated', ru: 'план' },
      actual: { en: 'actual', ru: 'факт' }
    };
    return translations[key]?.[language] || key;
  };

  // Initialize default task blocks
  useEffect(() => {
    if (safeTaskBlocks.length === 0) {
      const defaultBlocks: TaskBlock[] = [
        {
          id: 'security',
          name: language === 'ru' ? 'Безопасность и Аутентификация' : 'Security & Authentication',
          description: language === 'ru' ? 'Критические задачи по безопасности' : 'Critical security tasks',
          priority: 'critical',
          status: 'in-progress',
          progress: 60,
          timeframe: '3-5 days',
          icon: 'shield',
          color: 'oklch(62% 0.17 15)',
          tasks: [
            {
              id: 'sec-1.1.1',
              blockId: 'security',
              name: language === 'ru' ? 'Создать утилиту AES-256 шифрования' : 'Create AES-256 encryption utility',
              description: language === 'ru' ? 'Файл: src/utils/encryption.ts' : 'File: src/utils/encryption.ts',
              estimatedHours: 2,
              status: 'todo',
              dueDate: '2024-12-20'
            },
            {
              id: 'sec-1.1.2',
              blockId: 'security',
              name: language === 'ru' ? 'Обновить систему хранения API ключей' : 'Update API keys storage system',
              description: language === 'ru' ? 'Добавить шифрование при сохранении' : 'Add encryption on save',
              estimatedHours: 1,
              status: 'todo',
              dependencies: ['sec-1.1.1']
            },
            {
              id: 'sec-1.1.3',
              blockId: 'security',
              name: language === 'ru' ? 'Защитить пароли пользователей' : 'Secure user passwords',
              description: language === 'ru' ? 'bcrypt или аналог для браузера' : 'bcrypt or browser equivalent',
              estimatedHours: 1,
              status: 'completed',
              completedAt: '2024-12-19',
              actualHours: 1.5
            }
          ]
        },
        {
          id: 'api-integration',
          name: language === 'ru' ? 'API и Внешние Интеграции' : 'API & External Integrations',
          description: language === 'ru' ? 'Расширение API возможностей' : 'Expanding API capabilities',
          priority: 'high',
          status: 'planning',
          progress: 25,
          timeframe: '4-6 days',
          icon: 'cloud',
          color: 'oklch(55% 0.2 200)',
          tasks: [
            {
              id: 'api-2.1.1',
              blockId: 'api-integration',
              name: language === 'ru' ? 'Создать компонент WebhookManager' : 'Create WebhookManager component',
              description: language === 'ru' ? 'Регистрация webhook endpoints' : 'Register webhook endpoints',
              estimatedHours: 3,
              status: 'todo'
            }
          ]
        }
      ];
      
      setTaskBlocks(defaultBlocks);
    }
  }, [safeTaskBlocks.length, language, setTaskBlocks]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentTimer) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentTimer]);

  // Get icon component
  const getIcon = (iconName: string, size = 20) => {
    const icons: {[key: string]: React.ReactNode} = {
      shield: <Shield size={size} />,
      cloud: <Gear size={size} />,
      zap: <Lightning size={size} />,
      bug: <Bug size={size} />,
      book: <FileText size={size} />,
      git: <GitBranch size={size} />
    };
    return icons[iconName] || <FileCode size={size} />;
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'destructive',
      high: 'default',
      medium: 'secondary',
      low: 'outline'
    };
    return colors[priority as keyof typeof colors] || 'outline';
  };

  // Start task timer
  const startTask = (taskId: string) => {
    setCurrentTimer(taskId);
    setTimerSeconds(safeActiveTimers[taskId] || 0);
    
    setTaskBlocks((current = []) => 
      current.map(block => ({
        ...block,
        tasks: block.tasks.map(task => 
          task.id === taskId 
            ? { ...task, status: 'in-progress' as const }
            : task
        )
      }))
    );
    
    toast.success(language === 'ru' ? 'Задача начата' : 'Task started');
  };

  // Pause task
  const pauseTask = () => {
    if (currentTimer) {
      setActiveTimers((current = {}) => ({
        ...current,
        [currentTimer]: timerSeconds
      }));
      setCurrentTimer(null);
      toast.info(language === 'ru' ? 'Задача приостановлена' : 'Task paused');
    }
  };

  // Complete task
  const completeTask = (taskId: string) => {
    const totalHours = Math.round(timerSeconds / 3600 * 100) / 100;
    
    setTaskBlocks((current = []) => 
      current.map(block => {
        const updatedTasks = block.tasks.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                status: 'completed' as const,
                actualHours: totalHours,
                completedAt: new Date().toISOString()
              }
            : task
        );
        
        const completedCount = updatedTasks.filter(t => t.status === 'completed').length;
        const totalCount = updatedTasks.length;
        const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        
        return {
          ...block,
          tasks: updatedTasks,
          progress: newProgress,
          status: newProgress === 100 ? 'completed' as const : block.status
        };
      })
    );
    
    // Reset timer
    setCurrentTimer(null);
    setTimerSeconds(0);
    setActiveTimers((current = {}) => {
      const updated = { ...current };
      delete updated[taskId];
      return updated;
    });
    
    // Update daily log
    const today = new Date().toISOString().split('T')[0];
    setDailyLog((current = []) => {
      const todayLog = current.find(log => log.date === today);
      if (todayLog) {
        return current.map(log => 
          log.date === today 
            ? {
                ...log,
                completedTasks: [...log.completedTasks, taskId],
                totalHours: log.totalHours + totalHours
              }
            : log
        );
      } else {
        return [...current, {
          date: today,
          completedTasks: [taskId],
          totalHours: totalHours
        }];
      }
    });
    
    if (onTaskCompleted) {
      const task = safeTaskBlocks
        .flatMap(block => block.tasks)
        .find(task => task.id === taskId);
      if (task) {
        onTaskCompleted({
          ...task,
          status: 'completed',
          actualHours: totalHours,
          completedAt: new Date().toISOString()
        });
      }
    }
    
    toast.success(language === 'ru' ? 'Задача завершена!' : 'Task completed!');
  };

  // Add blocker
  const addBlocker = () => {
    if (!selectedTask || !blockerText.trim()) return;
    
    setTaskBlocks((current = []) => 
      current.map(block => ({
        ...block,
        tasks: block.tasks.map(task => 
          task.id === selectedTask 
            ? { 
                ...task, 
                status: 'blocked' as const,
                blockers: [...(task.blockers || []), blockerText.trim()]
              }
            : task
        )
      }))
    );
    
    if (onBlockerDetected) {
      onBlockerDetected(blockerText.trim(), selectedTask);
    }
    
    setBlockerText('');
    setIsAddingBlocker(false);
    toast.warning(language === 'ru' ? 'Блокер добавлен' : 'Blocker added');
  };

  // Format timer display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate analytics
  const calculateAnalytics = () => {
    const allTasks = safeTaskBlocks.flatMap(block => block.tasks);
    const completedTasks = allTasks.filter(task => task.status === 'completed');
    const totalEstimated = allTasks.reduce((sum, task) => sum + task.estimatedHours, 0);
    const totalActual = completedTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);
    const efficiency = totalActual > 0 ? Math.round((totalEstimated / totalActual) * 100) : 100;
    
    return {
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      averageTime: completedTasks.length > 0 ? totalActual / completedTasks.length : 0,
      efficiency
    };
  };

  const analytics = calculateAnalytics();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks size={24} className="text-primary" />
            {t('taskIntegrationTracker')}
          </CardTitle>
          <CardDescription>
            {language === 'ru' 
              ? 'Отслеживание выполнения интеграционных задач по блокам'
              : 'Track execution of integration tasks by blocks'
            }
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="blocks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="blocks" className="flex items-center gap-2">
            <Target size={16} />
            {t('taskBlocks')}
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckCircle size={16} />
            {t('microTasks')}
          </TabsTrigger>
          <TabsTrigger value="timer" className="flex items-center gap-2">
            <Timer size={16} />
            {t('timeTracking')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <ChartLine size={16} />
            {t('analytics')}
          </TabsTrigger>
        </TabsList>

        {/* Task Blocks Tab */}
        <TabsContent value="blocks" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {safeTaskBlocks.map(block => (
              <Card 
                key={block.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedBlock === block.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedBlock(selectedBlock === block.id ? null : block.id)}
                style={{ borderColor: block.color }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getIcon(block.icon)}
                      <CardTitle className="text-lg">{block.name}</CardTitle>
                    </div>
                    <Badge variant={getPriorityColor(block.priority) as any}>
                      {t(block.priority)}
                    </Badge>
                  </div>
                  <CardDescription>{block.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>{t('progress')}</span>
                      <span>{block.progress}%</span>
                    </div>
                    <Progress value={block.progress} className="h-2" />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{block.timeframe}</span>
                      <Badge variant="outline">{t(block.status)}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {block.tasks.filter(t => t.status === 'completed').length} / {block.tasks.length} {t('tasks')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Block Details */}
          {selectedBlock && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {safeTaskBlocks.find(b => b.id === selectedBlock)?.name} - {t('microTasks')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {safeTaskBlocks
                      .find(b => b.id === selectedBlock)
                      ?.tasks.map(task => (
                        <div 
                          key={task.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{task.name}</h4>
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{task.estimatedHours}h {t('estimated')}</span>
                              {task.actualHours && (
                                <span>{task.actualHours}h {t('actual')}</span>
                              )}
                              {task.dueDate && (
                                <span>Due: {task.dueDate}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              task.status === 'completed' ? 'default' :
                              task.status === 'in-progress' ? 'secondary' :
                              task.status === 'blocked' ? 'destructive' : 'outline'
                            }>
                              {t(task.status === 'in-progress' ? 'inProgress' : task.status)}
                            </Badge>
                            {task.status === 'todo' && (
                              <Button 
                                size="sm" 
                                onClick={() => startTask(task.id)}
                              >
                                <Play size={14} className="mr-1" />
                                {t('startTask')}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Micro Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="grid gap-4">
            {safeTaskBlocks.map(block => (
              <Card key={block.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getIcon(block.icon)}
                    {block.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {block.tasks.map(task => (
                      <div 
                        key={task.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            task.status === 'completed' ? 'bg-green-500' :
                            task.status === 'in-progress' ? 'bg-blue-500' :
                            task.status === 'blocked' ? 'bg-red-500' : 'bg-gray-400'
                          }`} />
                          <span className="font-medium">{task.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {task.estimatedHours}h
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.blockers && task.blockers.length > 0 && (
                            <Warning size={16} className="text-red-500" />
                          )}
                          <Badge variant="outline">
                            {t(task.status === 'in-progress' ? 'inProgress' : task.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Time Tracking Tab */}
        <TabsContent value="timer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer size={24} className="text-primary" />
                {t('timeTracking')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentTimer ? (
                <div className="text-center space-y-4">
                  <div className="text-4xl font-mono font-bold text-primary">
                    {formatTime(timerSeconds)}
                  </div>
                  <div className="text-lg text-muted-foreground">
                    {safeTaskBlocks
                      .flatMap(b => b.tasks)
                      .find(t => t.id === currentTimer)?.name}
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <Button onClick={pauseTask} variant="outline">
                      <Pause size={16} className="mr-2" />
                      {t('pauseTask')}
                    </Button>
                    <Button onClick={() => completeTask(currentTimer)}>
                      <CheckCircle size={16} className="mr-2" />
                      {t('completeTask')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  {language === 'ru' 
                    ? 'Нет активных задач. Выберите задачу для начала работы.'
                    : 'No active tasks. Select a task to start working.'
                  }
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Timers */}
          {Object.keys(safeActiveTimers).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'ru' ? 'Приостановленные задачи' : 'Paused Tasks'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(safeActiveTimers).map(([taskId, seconds]) => {
                    const task = safeTaskBlocks
                      .flatMap(b => b.tasks)
                      .find(t => t.id === taskId);
                    return (
                      <div key={taskId} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{task?.name}</span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            {formatTime(seconds)}
                          </span>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => startTask(taskId)}
                        >
                          <Play size={14} className="mr-1" />
                          {language === 'ru' ? 'Продолжить' : 'Resume'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('totalTasks')}</p>
                    <p className="text-2xl font-bold">{analytics.totalTasks}</p>
                  </div>
                  <ListChecks size={24} className="text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('completedTasks')}</p>
                    <p className="text-2xl font-bold text-green-500">{analytics.completedTasks}</p>
                  </div>
                  <CheckCircle size={24} className="text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('averageTime')}</p>
                    <p className="text-2xl font-bold">{analytics.averageTime.toFixed(1)}h</p>
                  </div>
                  <Clock size={24} className="text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('efficiency')}</p>
                    <p className="text-2xl font-bold text-yellow-500">{analytics.efficiency}%</p>
                  </div>
                  <TrendUp size={24} className="text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress by Block */}
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ru' ? 'Прогресс по блокам' : 'Progress by Blocks'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safeTaskBlocks.map(block => (
                  <div key={block.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{block.name}</span>
                      <span className="text-sm text-muted-foreground">{block.progress}%</span>
                    </div>
                    <Progress value={block.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Blocker Dialog */}
      <Dialog open={isAddingBlocker} onOpenChange={setIsAddingBlocker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addBlocker')}</DialogTitle>
            <DialogDescription>
              {language === 'ru' 
                ? 'Опишите что блокирует выполнение задачи'
                : 'Describe what is blocking the task execution'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="blocker-text">{t('blockers')}</Label>
              <Textarea
                id="blocker-text"
                value={blockerText}
                onChange={(e) => setBlockerText(e.target.value)}
                placeholder={language === 'ru' 
                  ? 'Введите описание блокера...'
                  : 'Enter blocker description...'
                }
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingBlocker(false)}>
                {language === 'ru' ? 'Отмена' : 'Cancel'}
              </Button>
              <Button onClick={addBlocker}>
                {t('addBlocker')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskIntegrationTracker;