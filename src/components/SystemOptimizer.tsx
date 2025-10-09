import React, { useState, useEffect, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Cpu,
  HardDrives,
  Lightning,
  Gear,
  CheckCircle,
  Warning,
  Play,
  Stop,
  MagicWand,
  TrendUp,
  Shield,
  Clock
} from '@phosphor-icons/react';

interface OptimizationTask {
  id: string;
  name: string;
  description: string;
  category: 'memory' | 'cpu' | 'storage' | 'network' | 'database' | 'cache';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpact: number; // percentage improvement
  estimatedTime: number; // minutes
  automated: boolean;
  dependencies: string[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  result?: {
    success: boolean;
    message: string;
    beforeValue: number;
    afterValue: number;
    improvement: number;
  };
  scheduledAt?: string;
  completedAt?: string;
}

interface OptimizationProfile {
  id: string;
  name: string;
  description: string;
  tasks: string[]; // task IDs
  aggressive: boolean;
  autoSchedule: boolean;
}

interface SystemSettings {
  autoOptimization: boolean;
  optimizationSchedule: 'hourly' | 'daily' | 'weekly' | 'manual';
  memoryThreshold: number;
  cpuThreshold: number;
  storageThreshold: number;
  enableGarbageCollection: boolean;
  enableCacheCleanup: boolean;
  enableDatabaseOptimization: boolean;
  allowSystemRestart: boolean;
}

interface OptimizationHistory {
  id: string;
  timestamp: string;
  profileUsed: string;
  tasksExecuted: number;
  tasksSuccessful: number;
  totalImprovementPercentage: number;
  duration: number; // minutes
  triggeredBy: 'manual' | 'scheduled' | 'threshold' | 'automatic';
}

interface SystemOptimizerProps {
  language: 'en' | 'ru';
  projectId?: string;
  onOptimizationComplete?: (history: OptimizationHistory) => void;
  onTaskComplete?: (task: OptimizationTask) => void;
}

const SystemOptimizer: React.FC<SystemOptimizerProps> = ({
  language,
  projectId = 'default',
  onOptimizationComplete,
  onTaskComplete
}) => {
  const [tasks, setTasks] = useKV<OptimizationTask[]>(`optimization-tasks-${projectId}`, []);
  const [profiles, setProfiles] = useKV<OptimizationProfile[]>(`optimization-profiles-${projectId}`, []);
  const [settings, setSettings] = useKV<SystemSettings>(`system-settings-${projectId}`, getDefaultSettings());
  const [history, setHistory] = useKV<OptimizationHistory[]>(`optimization-history-${projectId}`, []);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string>('balanced');

  const t = useCallback((key: string) => {
    const translations: { [key: string]: { en: string; ru: string } } = {
      systemOptimizer: { en: 'System Optimizer', ru: 'Оптимизатор Системы' },
      optimizationTasks: { en: 'Optimization Tasks', ru: 'Задачи Оптимизации' },
      optimizationProfiles: { en: 'Optimization Profiles', ru: 'Профили Оптимизации' },
      systemSettings: { en: 'System Settings', ru: 'Настройки Системы' },
      optimizationHistory: { en: 'Optimization History', ru: 'История Оптимизации' },
      
      // Actions
      startOptimization: { en: 'Start Optimization', ru: 'Начать Оптимизацию' },
      stopOptimization: { en: 'Stop Optimization', ru: 'Остановить Оптимизацию' },
      scheduleOptimization: { en: 'Schedule Optimization', ru: 'Запланировать Оптимизацию' },
      runQuickScan: { en: 'Quick Scan', ru: 'Быстрое Сканирование' },
      optimizeNow: { en: 'Optimize Now', ru: 'Оптимизировать Сейчас' },
      
      // Categories
      memory: { en: 'Memory', ru: 'Память' },
      cpu: { en: 'CPU', ru: 'ЦП' },
      storage: { en: 'Storage', ru: 'Хранилище' },
      network: { en: 'Network', ru: 'Сеть' },
      database: { en: 'Database', ru: 'База Данных' },
      cache: { en: 'Cache', ru: 'Кэш' },
      
      // Status
      pending: { en: 'Pending', ru: 'Ожидает' },
      running: { en: 'Running', ru: 'Выполняется' },
      completed: { en: 'Completed', ru: 'Завершено' },
      failed: { en: 'Failed', ru: 'Ошибка' },
      skipped: { en: 'Skipped', ru: 'Пропущено' },
      
      // Priority
      low: { en: 'Low', ru: 'Низкий' },
      medium: { en: 'Medium', ru: 'Средний' },
      high: { en: 'High', ru: 'Высокий' },
      critical: { en: 'Critical', ru: 'Критический' },
      
      // Profiles
      balanced: { en: 'Balanced', ru: 'Сбалансированный' },
      performance: { en: 'Performance', ru: 'Производительность' },
      conservation: { en: 'Conservation', ru: 'Экономия' },
      aggressive: { en: 'Aggressive', ru: 'Агрессивный' },
      
      // Settings
      autoOptimization: { en: 'Auto Optimization', ru: 'Автооптимизация' },
      optimizationSchedule: { en: 'Schedule', ru: 'Расписание' },
      enableGarbageCollection: { en: 'Garbage Collection', ru: 'Сборка Мусора' },
      enableCacheCleanup: { en: 'Cache Cleanup', ru: 'Очистка Кэша' },
      enableDatabaseOptimization: { en: 'Database Optimization', ru: 'Оптимизация БД' },
      allowSystemRestart: { en: 'Allow System Restart', ru: 'Разрешить Перезагрузку' },
      
      // Schedule options
      hourly: { en: 'Hourly', ru: 'Каждый час' },
      daily: { en: 'Daily', ru: 'Ежедневно' },
      weekly: { en: 'Weekly', ru: 'Еженедельно' },
      manual: { en: 'Manual', ru: 'Вручную' },
      
      // Trigger types
      scheduled: { en: 'Scheduled', ru: 'По расписанию' },
      threshold: { en: 'Threshold', ru: 'По пороговому значению' },
      automatic: { en: 'Automatic', ru: 'Автоматически' },
      
      // Messages
      noOptimizations: { en: 'No optimizations performed yet', ru: 'Оптимизации пока не выполнялись' },
      optimizationComplete: { en: 'Optimization completed successfully', ru: 'Оптимизация успешно завершена' },
      optimizationFailed: { en: 'Optimization failed', ru: 'Оптимизация не удалась' },
      noTasksAvailable: { en: 'No optimization tasks available', ru: 'Нет доступных задач оптимизации' }
    };
    
    return translations[key]?.[language] || key;
  }, [language]);

  function getDefaultSettings(): SystemSettings {
    return {
      autoOptimization: false,
      optimizationSchedule: 'daily',
      memoryThreshold: 80,
      cpuThreshold: 75,
      storageThreshold: 85,
      enableGarbageCollection: true,
      enableCacheCleanup: true,
      enableDatabaseOptimization: false,
      allowSystemRestart: false
    };
  }

  // Initialize default tasks and profiles
  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      const defaultTasks: OptimizationTask[] = [
        {
          id: 'memory-cleanup',
          name: language === 'ru' ? 'Очистка памяти' : 'Memory Cleanup',
          description: language === 'ru' ? 'Освобождение неиспользуемой памяти' : 'Free unused memory allocations',
          category: 'memory',
          priority: 'high',
          estimatedImpact: 15,
          estimatedTime: 2,
          automated: true,
          dependencies: [],
          status: 'pending'
        },
        {
          id: 'cache-optimization',
          name: language === 'ru' ? 'Оптимизация кэша' : 'Cache Optimization',
          description: language === 'ru' ? 'Очистка и оптимизация кэшей' : 'Clear and optimize cache systems',
          category: 'cache',
          priority: 'medium',
          estimatedImpact: 10,
          estimatedTime: 3,
          automated: true,
          dependencies: [],
          status: 'pending'
        },
        {
          id: 'cpu-optimization',
          name: language === 'ru' ? 'Оптимизация ЦП' : 'CPU Optimization',
          description: language === 'ru' ? 'Оптимизация процессорных процессов' : 'Optimize CPU-intensive processes',
          category: 'cpu',
          priority: 'high',
          estimatedImpact: 20,
          estimatedTime: 5,
          automated: true,
          dependencies: ['memory-cleanup'],
          status: 'pending'
        },
        {
          id: 'storage-cleanup',
          name: language === 'ru' ? 'Очистка хранилища' : 'Storage Cleanup',
          description: language === 'ru' ? 'Удаление временных файлов' : 'Remove temporary files and logs',
          category: 'storage',
          priority: 'medium',
          estimatedImpact: 8,
          estimatedTime: 4,
          automated: true,
          dependencies: [],
          status: 'pending'
        },
        {
          id: 'database-optimization',
          name: language === 'ru' ? 'Оптимизация БД' : 'Database Optimization',
          description: language === 'ru' ? 'Оптимизация базы данных' : 'Optimize database queries and indexes',
          category: 'database',
          priority: 'low',
          estimatedImpact: 12,
          estimatedTime: 10,
          automated: false,
          dependencies: [],
          status: 'pending'
        },
        {
          id: 'network-optimization',
          name: language === 'ru' ? 'Оптимизация сети' : 'Network Optimization',
          description: language === 'ru' ? 'Оптимизация сетевых соединений' : 'Optimize network connections and bandwidth',
          category: 'network',
          priority: 'medium',
          estimatedImpact: 18,
          estimatedTime: 3,
          automated: true,
          dependencies: [],
          status: 'pending'
        }
      ];
      setTasks(defaultTasks);
    }

    if (!profiles || profiles.length === 0) {
      const defaultProfiles: OptimizationProfile[] = [
        {
          id: 'balanced',
          name: t('balanced'),
          description: language === 'ru' ? 'Сбалансированная оптимизация' : 'Balanced performance optimization',
          tasks: ['memory-cleanup', 'cache-optimization', 'storage-cleanup'],
          aggressive: false,
          autoSchedule: true
        },
        {
          id: 'performance',
          name: t('performance'),
          description: language === 'ru' ? 'Максимальная производительность' : 'Maximum performance optimization',
          tasks: ['memory-cleanup', 'cpu-optimization', 'cache-optimization', 'network-optimization'],
          aggressive: true,
          autoSchedule: false
        },
        {
          id: 'conservation',
          name: t('conservation'),
          description: language === 'ru' ? 'Экономия ресурсов' : 'Resource conservation mode',
          tasks: ['storage-cleanup', 'cache-optimization'],
          aggressive: false,
          autoSchedule: true
        }
      ];
      setProfiles(defaultProfiles);
    }
  }, [language, tasks, profiles, setTasks, setProfiles, t]);

  // Execute optimization task
  const executeTask = useCallback(async (taskId: string): Promise<boolean> => {
    setCurrentTask(taskId);
    
    // Update task status to running
    setTasks(current => 
      (current || []).map(task => 
        task.id === taskId ? { ...task, status: 'running' as const } : task
      )
    );

    // Simulate task execution
    const task = (tasks || []).find(t => t.id === taskId);
    if (!task) return false;

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, task.estimatedTime * 100));

      // Simulate success/failure (90% success rate)
      const success = Math.random() > 0.1;
      
      if (success) {
        const beforeValue = 50 + Math.random() * 40;
        const improvement = task.estimatedImpact * (0.8 + Math.random() * 0.4);
        const afterValue = beforeValue - improvement;

        const result = {
          success: true,
          message: language === 'ru' ? 'Оптимизация успешно завершена' : 'Optimization completed successfully',
          beforeValue,
          afterValue,
          improvement
        };

        setTasks(current => 
          (current || []).map(t => 
            t.id === taskId ? { 
              ...t, 
              status: 'completed' as const, 
              result,
              completedAt: new Date().toISOString()
            } : t
          )
        );

        onTaskComplete?.({ ...task, result, status: 'completed' });
        toast.success(`${task.name}: ${improvement.toFixed(1)}% improvement`);
        return true;
      } else {
        const result = {
          success: false,
          message: language === 'ru' ? 'Ошибка выполнения оптимизации' : 'Optimization failed to execute',
          beforeValue: 0,
          afterValue: 0,
          improvement: 0
        };

        setTasks(current => 
          (current || []).map(t => 
            t.id === taskId ? { 
              ...t, 
              status: 'failed' as const, 
              result,
              completedAt: new Date().toISOString()
            } : t
          )
        );

        toast.error(`${task.name}: optimization failed`);
        return false;
      }
    } catch {
      setTasks(current => 
        (current || []).map(t => 
          t.id === taskId ? { 
            ...t, 
            status: 'failed' as const,
            completedAt: new Date().toISOString()
          } : t
        )
      );
      toast.error(`${task.name}: execution error`);
      return false;
    } finally {
      setCurrentTask(null);
    }
  }, [tasks, setTasks, onTaskComplete, language]);

  // Execute optimization profile
  const executeProfile = useCallback(async (profileId: string) => {
    const profile = (profiles || []).find(p => p.id === profileId);
    if (!profile) {
      toast.error('Profile not found');
      return;
    }

    setIsOptimizing(true);
    const startTime = Date.now();
    let tasksExecuted = 0;
    let tasksSuccessful = 0;
    let totalImprovement = 0;

    try {
      // Reset all tasks in profile to pending
      setTasks(current => 
        (current || []).map(task => 
          profile.tasks.includes(task.id) ? { ...task, status: 'pending' as const } : task
        )
      );

      // Execute tasks in dependency order
      const tasksToExecute = (tasks || []).filter(t => profile.tasks.includes(t.id));
      const executedTasks = new Set<string>();

      while (executedTasks.size < tasksToExecute.length) {
        let progress = false;

        for (const task of tasksToExecute) {
          if (executedTasks.has(task.id)) continue;

          // Check if all dependencies are completed
          const dependenciesCompleted = task.dependencies.every(dep => 
            executedTasks.has(dep) || !profile.tasks.includes(dep)
          );

          if (dependenciesCompleted) {
            tasksExecuted++;
            const success = await executeTask(task.id);
            if (success) {
              tasksSuccessful++;
              const taskResult = (tasks || []).find(t => t.id === task.id)?.result;
              if (taskResult?.success) {
                totalImprovement += taskResult.improvement;
              }
            }
            executedTasks.add(task.id);
            progress = true;
          }
        }

        if (!progress) {
          // Circular dependency or other issue
          break;
        }
      }

      const duration = (Date.now() - startTime) / 1000 / 60; // minutes

      const historyEntry: OptimizationHistory = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        profileUsed: profile.name,
        tasksExecuted,
        tasksSuccessful,
        totalImprovementPercentage: totalImprovement / tasksExecuted || 0,
        duration,
        triggeredBy: 'manual'
      };

      setHistory(current => [...(current || []), historyEntry]);
      onOptimizationComplete?.(historyEntry);

      if (tasksSuccessful === tasksExecuted) {
        toast.success(t('optimizationComplete'));
      } else {
        toast.warning(`Optimization completed with ${tasksExecuted - tasksSuccessful} failures`);
      }

    } catch {
      toast.error(t('optimizationFailed'));
    } finally {
      setIsOptimizing(false);
    }
  }, [profiles, tasks, setTasks, setHistory, executeTask, onOptimizationComplete, t]);

  // Quick scan for optimization opportunities
  const runQuickScan = useCallback(() => {
    const opportunities: string[] = [];
    
    // Simulate scanning
    if (Math.random() > 0.7) opportunities.push('High memory usage detected');
    if (Math.random() > 0.8) opportunities.push('Cache can be optimized');
    if (Math.random() > 0.6) opportunities.push('Storage cleanup recommended');
    if (Math.random() > 0.9) opportunities.push('CPU optimization available');

    if (opportunities.length === 0) {
      toast.success('System is well optimized');
    } else {
      toast.info(`Found ${opportunities.length} optimization opportunities`);
    }
  }, []);

  // Update settings
  const updateSettings = (key: keyof SystemSettings, value: any) => {
    setSettings(current => ({ 
      ...getDefaultSettings(), 
      ...current, 
      [key]: value 
    }));
    toast.success('Settings updated');
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'running': return 'text-blue-500';
      case 'failed': return 'text-red-500';
      case 'pending': return 'text-yellow-500';
      case 'skipped': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  // Get priority color
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const activeTasks = (tasks || []).filter(t => ['pending', 'running'].includes(t.status));
  const completedTasks = (tasks || []).filter(t => t.status === 'completed');
  const failedTasks = (tasks || []).filter(t => t.status === 'failed');

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MagicWand size={24} className="text-primary" />
            {t('systemOptimizer')}
          </CardTitle>
          <CardDescription>
            {language === 'ru' 
              ? 'Автоматическая оптимизация производительности системы и управление ресурсами'
              : 'Automated system performance optimization and resource management'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => executeProfile(selectedProfile)}
                disabled={isOptimizing || activeTasks.length === 0}
                className="flex items-center gap-2"
              >
                {isOptimizing ? (
                  <>
                    <Stop size={16} />
                    {t('stopOptimization')}
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    {t('optimizeNow')}
                  </>
                )}
              </Button>
              
              <Button
                onClick={runQuickScan}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Lightning size={16} />
                {t('runQuickScan')}
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Profile:</span>
                <select 
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                  disabled={isOptimizing}
                >
                  {(profiles || []).map(profile => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Status Indicators */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOptimizing ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-sm text-muted-foreground">
                  {isOptimizing ? 'Optimizing' : 'Ready'}
                </span>
              </div>
              
              {currentTask && (
                <div className="text-sm text-muted-foreground">
                  Running: {(tasks || []).find(t => t.id === currentTask)?.name}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <Separator className="my-4" />
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{completedTasks.length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{activeTasks.length}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{failedTasks.length}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{(history || []).length}</div>
              <div className="text-sm text-muted-foreground">Total Runs</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">{t('optimizationTasks')}</TabsTrigger>
          <TabsTrigger value="profiles">{t('optimizationProfiles')}</TabsTrigger>
          <TabsTrigger value="settings">{t('systemSettings')}</TabsTrigger>
          <TabsTrigger value="history">{t('optimizationHistory')}</TabsTrigger>
        </TabsList>

        {/* Optimization Tasks */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="grid gap-4">
            {(tasks || []).length === 0 ? (
              <Alert>
                <Warning size={16} />
                <AlertDescription>{t('noTasksAvailable')}</AlertDescription>
              </Alert>
            ) : (
              (tasks || []).map(task => (
                <Card key={task.id} className={task.status === 'running' ? 'border-blue-500' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {task.category === 'memory' && <HardDrives size={16} />}
                          {task.category === 'cpu' && <Cpu size={16} />}
                          {task.category === 'storage' && <HardDrives size={16} />}
                          {task.category === 'cache' && <Lightning size={16} />}
                          {task.category === 'database' && <Shield size={16} />}
                          {task.category === 'network' && <TrendUp size={16} />}
                        </div>
                        <div>
                          <CardTitle className="text-base">{task.name}</CardTitle>
                          <CardDescription>{task.description}</CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityVariant(task.priority)}>
                          {t(task.priority)}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(task.status)}>
                          {t(task.status)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Impact</div>
                          <div className="font-medium">{task.estimatedImpact}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Time</div>
                          <div className="font-medium">{task.estimatedTime}min</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Category</div>
                          <div className="font-medium">{t(task.category)}</div>
                        </div>
                      </div>

                      {task.result && (
                        <div className="p-3 bg-muted/50 rounded">
                          <div className="text-sm">
                            <div className="flex items-center gap-2 mb-1">
                              {task.result.success ? (
                                <CheckCircle size={14} className="text-green-500" />
                              ) : (
                                <Warning size={14} className="text-red-500" />
                              )}
                              <span className="font-medium">{task.result.message}</span>
                            </div>
                            {task.result.success && (
                              <div className="text-muted-foreground">
                                Improvement: {task.result.improvement.toFixed(1)}%
                                ({task.result.beforeValue.toFixed(1)} → {task.result.afterValue.toFixed(1)})
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {task.dependencies.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Dependencies: {task.dependencies.join(', ')}
                        </div>
                      )}

                      {task.status === 'running' && (
                        <Progress value={66} className="h-1" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Optimization Profiles */}
        <TabsContent value="profiles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(profiles || []).map(profile => (
              <Card key={profile.id} className={selectedProfile === profile.id ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{profile.name}</CardTitle>
                    <Badge variant={profile.aggressive ? 'destructive' : 'secondary'}>
                      {profile.aggressive ? 'Aggressive' : 'Safe'}
                    </Badge>
                  </div>
                  <CardDescription>{profile.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <div className="text-muted-foreground mb-1">Tasks ({profile.tasks.length}):</div>
                      <div className="space-y-1">
                        {profile.tasks.map(taskId => {
                          const task = (tasks || []).find(t => t.id === taskId);
                          return task ? (
                            <div key={taskId} className="flex items-center justify-between">
                              <span>{task.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {task.estimatedImpact}%
                              </Badge>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span className="text-sm text-muted-foreground">
                          ~{profile.tasks.reduce((sum, taskId) => {
                            const task = (tasks || []).find(t => t.id === taskId);
                            return sum + (task?.estimatedTime || 0);
                          }, 0)}min
                        </span>
                      </div>
                      
                      <Button
                        size="sm"
                        variant={selectedProfile === profile.id ? 'default' : 'outline'}
                        onClick={() => setSelectedProfile(profile.id)}
                      >
                        {selectedProfile === profile.id ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gear size={20} />
                {t('systemSettings')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Auto Optimization */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t('autoOptimization')}</div>
                    <div className="text-sm text-muted-foreground">
                      {language === 'ru' ? 'Автоматически запускать оптимизацию' : 'Automatically run optimization'}
                    </div>
                  </div>
                  <Switch
                    checked={settings?.autoOptimization || false}
                    onCheckedChange={(checked) => updateSettings('autoOptimization', checked)}
                  />
                </div>

                {/* Schedule */}
                <div>
                  <div className="font-medium mb-2">{t('optimizationSchedule')}</div>
                  <select 
                    value={settings?.optimizationSchedule || 'daily'}
                    onChange={(e) => updateSettings('optimizationSchedule', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="hourly">{t('hourly')}</option>
                    <option value="daily">{t('daily')}</option>
                    <option value="weekly">{t('weekly')}</option>
                    <option value="manual">{t('manual')}</option>
                  </select>
                </div>

                {/* Thresholds */}
                <div className="space-y-4">
                  <h4 className="font-medium">
                    {language === 'ru' ? 'Пороговые значения' : 'Thresholds'}
                  </h4>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memory Threshold</span>
                      <span>{settings?.memoryThreshold || 80}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="95"
                      value={settings?.memoryThreshold || 80}
                      onChange={(e) => updateSettings('memoryThreshold', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU Threshold</span>
                      <span>{settings?.cpuThreshold || 75}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="95"
                      value={settings?.cpuThreshold || 75}
                      onChange={(e) => updateSettings('cpuThreshold', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Storage Threshold</span>
                      <span>{settings?.storageThreshold || 85}%</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="95"
                      value={settings?.storageThreshold || 85}
                      onChange={(e) => updateSettings('storageThreshold', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Optimization Options */}
                <div className="space-y-3">
                  <h4 className="font-medium">
                    {language === 'ru' ? 'Параметры оптимизации' : 'Optimization Options'}
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('enableGarbageCollection')}</span>
                      <Switch
                        checked={settings?.enableGarbageCollection || false}
                        onCheckedChange={(checked) => updateSettings('enableGarbageCollection', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('enableCacheCleanup')}</span>
                      <Switch
                        checked={settings?.enableCacheCleanup || false}
                        onCheckedChange={(checked) => updateSettings('enableCacheCleanup', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('enableDatabaseOptimization')}</span>
                      <Switch
                        checked={settings?.enableDatabaseOptimization || false}
                        onCheckedChange={(checked) => updateSettings('enableDatabaseOptimization', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('allowSystemRestart')}</span>
                      <Switch
                        checked={settings?.allowSystemRestart || false}
                        onCheckedChange={(checked) => updateSettings('allowSystemRestart', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimization History */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} />
                {t('optimizationHistory')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(history || []).length === 0 ? (
                <Alert>
                  <CheckCircle size={16} />
                  <AlertDescription>{t('noOptimizations')}</AlertDescription>
                </Alert>
              ) : (
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {(history || []).slice().reverse().map(entry => (
                      <Card key={entry.id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{entry.profileUsed}</h4>
                            <Badge variant="outline">
                              {t(entry.triggeredBy)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Tasks</div>
                              <div className="font-medium">{entry.tasksSuccessful}/{entry.tasksExecuted}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Improvement</div>
                              <div className="font-medium">{entry.totalImprovementPercentage.toFixed(1)}%</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Duration</div>
                              <div className="font-medium">{entry.duration.toFixed(1)}min</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Date</div>
                              <div className="font-medium">{new Date(entry.timestamp).toLocaleDateString()}</div>
                            </div>
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
      </Tabs>
    </div>
  );
};

export default SystemOptimizer;