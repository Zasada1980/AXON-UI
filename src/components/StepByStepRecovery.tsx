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
  Wrench,
  CheckCircle,
  Clock,
  PlayCircle,
  PauseCircle,
  SkipForward,
  ArrowRight,
  Warning,
  Gear,
  FloppyDisk
} from '@phosphor-icons/react';

interface RecoveryStep {
  id: string;
  title: string;
  description: string;
  category: 'system' | 'performance' | 'security' | 'data' | 'network';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  duration: number; // в секундах
  dependencies?: string[]; // IDs других шагов
  automated: boolean;
  result?: string;
  error?: string;
}

interface RecoverySession {
  id: string;
  name: string;
  description: string;
  steps: RecoveryStep[];
  startTime?: string;
  endTime?: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'failed';
  currentStepIndex: number;
  progress: number;
}

interface StepByStepRecoveryProps {
  language: 'en' | 'ru';
  onStepCompleted?: (step: RecoveryStep) => void;
  onSessionCompleted?: (session: RecoverySession) => void;
}

const StepByStepRecovery: React.FC<StepByStepRecoveryProps> = ({
  language,
  onStepCompleted,
  onSessionCompleted
}) => {
  const [sessions, setSessions] = useKV<RecoverySession[]>('recovery-sessions', []);
  const [currentSession, setCurrentSession] = useState<RecoverySession | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const t = (key: string) => {
    const translations: { [key: string]: { en: string; ru: string } } = {
      stepByStepRecovery: { en: 'Step-by-Step Recovery', ru: 'Пошаговое Восстановление' },
      recoveryDesc: { en: 'Automated system recovery with checkpoint support', ru: 'Автоматизированное восстановление системы с поддержкой контрольных точек' },
      newSession: { en: 'New Recovery Session', ru: 'Новая Сессия Восстановления' },
      sessions: { en: 'Recovery Sessions', ru: 'Сессии Восстановления' },
      currentStep: { en: 'Current Step', ru: 'Текущий Шаг' },
      nextStep: { en: 'Next Step', ru: 'Следующий Шаг' },
      skipStep: { en: 'Skip Step', ru: 'Пропустить Шаг' },
      pauseExecution: { en: 'Pause Execution', ru: 'Приостановить Выполнение' },
      resumeExecution: { en: 'Resume Execution', ru: 'Возобновить Выполнение' },
      startExecution: { en: 'Start Execution', ru: 'Начать Выполнение' },
      systemRecovery: { en: 'System Recovery', ru: 'Восстановление Системы' },
      performanceOptimization: { en: 'Performance Optimization', ru: 'Оптимизация Производительности' },
      securityCheck: { en: 'Security Check', ru: 'Проверка Безопасности' },
      dataIntegrity: { en: 'Data Integrity', ru: 'Целостность Данных' },
      networkDiagnostics: { en: 'Network Diagnostics', ru: 'Диагностика Сети' },
      pending: { en: 'Pending', ru: 'Ожидание' },
      running: { en: 'Running', ru: 'Выполняется' },
      completed: { en: 'Completed', ru: 'Завершено' },
      failed: { en: 'Failed', ru: 'Не удалось' },
      skipped: { en: 'Skipped', ru: 'Пропущено' },
      low: { en: 'Low', ru: 'Низкий' },
      medium: { en: 'Medium', ru: 'Средний' },
      high: { en: 'High', ru: 'Высокий' },
      critical: { en: 'Critical', ru: 'Критический' },
      automated: { en: 'Automated', ru: 'Автоматический' },
      manual: { en: 'Manual', ru: 'Ручной' },
      save: { en: 'Save Session', ru: 'Сохранить Сессию' },
      load: { en: 'Load Session', ru: 'Загрузить Сессию' }
    };
    return translations[key]?.[language] || key;
  };

  // Создание предустановленных сессий восстановления
  useEffect(() => {
    if (!sessions || sessions.length === 0) {
      const defaultSessions: RecoverySession[] = [
        createSystemRecoverySession(),
        createPerformanceOptimizationSession(),
        createSecurityCheckSession()
      ];
      setSessions(defaultSessions);
    }
  }, []);

  const createSystemRecoverySession = (): RecoverySession => ({
    id: 'system-recovery',
    name: t('systemRecovery'),
    description: language === 'ru' 
      ? 'Комплексное восстановление системы после сбоя'
      : 'Comprehensive system recovery after failure',
    status: 'draft',
    currentStepIndex: 0,
    progress: 0,
    steps: [
      {
        id: 'check-system-status',
        title: language === 'ru' ? 'Проверка состояния системы' : 'Check System Status',
        description: language === 'ru' 
          ? 'Диагностика текущего состояния всех компонентов системы'
          : 'Diagnose current state of all system components',
        category: 'system',
        priority: 'critical',
        status: 'pending',
        duration: 30,
        automated: true
      },
      {
        id: 'clear-cache',
        title: language === 'ru' ? 'Очистка кэша' : 'Clear Cache',
        description: language === 'ru'
          ? 'Очистка всех временных файлов и кэша приложения'
          : 'Clear all temporary files and application cache',
        category: 'performance',
        priority: 'high',
        status: 'pending',
        duration: 15,
        automated: true,
        dependencies: ['check-system-status']
      },
      {
        id: 'restart-services',
        title: language === 'ru' ? 'Перезапуск сервисов' : 'Restart Services',
        description: language === 'ru'
          ? 'Перезапуск критически важных системных сервисов'
          : 'Restart critical system services',
        category: 'system',
        priority: 'high',
        status: 'pending',
        duration: 45,
        automated: true,
        dependencies: ['clear-cache']
      },
      {
        id: 'validate-recovery',
        title: language === 'ru' ? 'Проверка восстановления' : 'Validate Recovery',
        description: language === 'ru'
          ? 'Проверка успешности процесса восстановления'
          : 'Verify successful completion of recovery process',
        category: 'system',
        priority: 'critical',
        status: 'pending',
        duration: 20,
        automated: true,
        dependencies: ['restart-services']
      }
    ]
  });

  const createPerformanceOptimizationSession = (): RecoverySession => ({
    id: 'performance-optimization',
    name: t('performanceOptimization'),
    description: language === 'ru'
      ? 'Оптимизация производительности системы'
      : 'System performance optimization',
    status: 'draft',
    currentStepIndex: 0,
    progress: 0,
    steps: [
      {
        id: 'memory-cleanup',
        title: language === 'ru' ? 'Очистка памяти' : 'Memory Cleanup',
        description: language === 'ru'
          ? 'Освобождение неиспользуемой памяти'
          : 'Free up unused memory',
        category: 'performance',
        priority: 'medium',
        status: 'pending',
        duration: 25,
        automated: true
      },
      {
        id: 'optimize-database',
        title: language === 'ru' ? 'Оптимизация базы данных' : 'Optimize Database',
        description: language === 'ru'
          ? 'Индексация и оптимизация запросов к базе данных'
          : 'Index and optimize database queries',
        category: 'data',
        priority: 'medium',
        status: 'pending',
        duration: 60,
        automated: true,
        dependencies: ['memory-cleanup']
      },
      {
        id: 'compress-assets',
        title: language === 'ru' ? 'Сжатие ресурсов' : 'Compress Assets',
        description: language === 'ru'
          ? 'Сжатие статических файлов для ускорения загрузки'
          : 'Compress static files for faster loading',
        category: 'performance',
        priority: 'low',
        status: 'pending',
        duration: 40,
        automated: true,
        dependencies: ['optimize-database']
      }
    ]
  });

  const createSecurityCheckSession = (): RecoverySession => ({
    id: 'security-check',
    name: t('securityCheck'),
    description: language === 'ru'
      ? 'Комплексная проверка безопасности системы'
      : 'Comprehensive system security check',
    status: 'draft',
    currentStepIndex: 0,
    progress: 0,
    steps: [
      {
        id: 'scan-vulnerabilities',
        title: language === 'ru' ? 'Сканирование уязвимостей' : 'Scan Vulnerabilities',
        description: language === 'ru'
          ? 'Поиск известных уязвимостей в системе'
          : 'Search for known system vulnerabilities',
        category: 'security',
        priority: 'critical',
        status: 'pending',
        duration: 90,
        automated: true
      },
      {
        id: 'update-security-policies',
        title: language === 'ru' ? 'Обновление политик безопасности' : 'Update Security Policies',
        description: language === 'ru'
          ? 'Применение актуальных политик безопасности'
          : 'Apply current security policies',
        category: 'security',
        priority: 'high',
        status: 'pending',
        duration: 30,
        automated: true,
        dependencies: ['scan-vulnerabilities']
      },
      {
        id: 'backup-critical-data',
        title: language === 'ru' ? 'Резервное копирование' : 'Backup Critical Data',
        description: language === 'ru'
          ? 'Создание резервной копии критически важных данных'
          : 'Create backup of critical data',
        category: 'data',
        priority: 'high',
        status: 'pending',
        duration: 120,
        automated: true,
        dependencies: ['update-security-policies']
      }
    ]
  });

  const executeStep = async (step: RecoveryStep): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Имитация выполнения шага
      const interval = setInterval(() => {
        // Случайная вероятность неудачи для демонстрации
        if (Math.random() > 0.9) {
          clearInterval(interval);
          reject(new Error(`Step ${step.title} failed randomly for demonstration`));
          return;
        }
      }, 1000);

      setTimeout(() => {
        clearInterval(interval);
        resolve();
      }, step.duration * 100); // Ускоряем для демонстрации
    });
  };

  const executeSession = async (session: RecoverySession) => {
    if (!session || isExecuting) return;

    setIsExecuting(true);
    const updatedSession = {
      ...session,
      status: 'running' as const,
      startTime: new Date().toISOString()
    };

    setCurrentSession(updatedSession);
    
    try {
      for (let i = session.currentStepIndex; i < session.steps.length; i++) {
        const step = session.steps[i];
        
        // Проверка зависимостей
        if (step.dependencies) {
          const missingDeps = step.dependencies.filter(depId => {
            const depStep = session.steps.find(s => s.id === depId);
            return !depStep || depStep.status !== 'completed';
          });
          
          if (missingDeps.length > 0) {
            throw new Error(`Missing dependencies: ${missingDeps.join(', ')}`);
          }
        }

        // Обновление статуса текущего шага
        const runningSession = {
          ...updatedSession,
          currentStepIndex: i,
          steps: updatedSession.steps.map(s => 
            s.id === step.id ? { ...s, status: 'running' as const } : s
          ),
          progress: Math.round((i / session.steps.length) * 100)
        };
        
        setCurrentSession(runningSession);
        toast.info(`Executing: ${step.title}`);

        try {
          await executeStep(step);
          
          // Успешное завершение шага
          const completedSession = {
            ...runningSession,
            steps: runningSession.steps.map(s => 
              s.id === step.id ? { 
                ...s, 
                status: 'completed' as const,
                result: `Successfully completed ${step.title}`
              } : s
            )
          };
          
          setCurrentSession(completedSession);
          onStepCompleted?.(step);
          toast.success(`Completed: ${step.title}`);
          
        } catch (error) {
          // Ошибка выполнения шага
          const failedSession = {
            ...runningSession,
            steps: runningSession.steps.map(s => 
              s.id === step.id ? { 
                ...s, 
                status: 'failed' as const,
                error: error instanceof Error ? error.message : 'Unknown error'
              } : s
            )
          };
          
          setCurrentSession(failedSession);
          toast.error(`Failed: ${step.title} - ${error instanceof Error ? error.message : 'Unknown error'}`);
          throw error;
        }
      }

      // Завершение всей сессии
      const completedSession = {
        ...updatedSession,
        status: 'completed' as const,
        endTime: new Date().toISOString(),
        progress: 100,
        currentStepIndex: session.steps.length
      };
      
      setCurrentSession(completedSession);
      onSessionCompleted?.(completedSession);
      toast.success(`Session completed: ${session.name}`);
      
    } catch (error) {
      const failedSession = {
        ...updatedSession,
        status: 'failed' as const,
        endTime: new Date().toISOString()
      };
      
      setCurrentSession(failedSession);
      toast.error(`Session failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setIsExecuting(false);
  };

  const skipCurrentStep = () => {
    if (!currentSession || !isExecuting) return;

    const currentStep = currentSession.steps[currentSession.currentStepIndex];
    if (!currentStep) return;

    const updatedSession = {
      ...currentSession,
      steps: currentSession.steps.map(s => 
        s.id === currentStep.id ? { ...s, status: 'skipped' as const } : s
      ),
      currentStepIndex: currentSession.currentStepIndex + 1
    };

    setCurrentSession(updatedSession);
    toast.info(`Skipped: ${currentStep.title}`);
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
      case 'skipped': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench size={24} className="text-primary" />
            {t('stepByStepRecovery')}
          </CardTitle>
          <CardDescription>
            {t('recoveryDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Session Selection */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {(sessions || []).map(session => (
              <Card 
                key={session.id} 
                className={`cursor-pointer transition-all ${
                  currentSession?.id === session.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setCurrentSession(session)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{session.name}</h4>
                    <Badge variant={getStatusColor(session.status)}>
                      {t(session.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {session.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>{session.currentStepIndex} / {session.steps.length} steps</span>
                      <span>{session.progress}%</span>
                    </div>
                    <Progress value={session.progress} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Control Buttons */}
          {currentSession && (
            <div className="flex items-center gap-3">
              <Button
                onClick={() => executeSession(currentSession)}
                disabled={isExecuting || currentSession.status === 'completed'}
                size="sm"
              >
                <PlayCircle size={16} className="mr-2" />
                {currentSession.status === 'paused' ? t('resumeExecution') : t('startExecution')}
              </Button>
              
              {isExecuting && (
                <>
                  <Button
                    onClick={() => setIsExecuting(false)}
                    variant="outline"
                    size="sm"
                  >
                    <PauseCircle size={16} className="mr-2" />
                    {t('pauseExecution')}
                  </Button>
                  
                  <Button
                    onClick={skipCurrentStep}
                    variant="outline"
                    size="sm"
                  >
                    <SkipForward size={16} className="mr-2" />
                    {t('skipStep')}
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Session Details */}
      {currentSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gear size={24} className="text-primary" />
              {currentSession.name}
            </CardTitle>
            <CardDescription>
              Progress: {currentSession.progress}% | 
              Step {currentSession.currentStepIndex + 1} of {currentSession.steps.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {currentSession.steps.map((step, index) => (
                  <Card 
                    key={step.id}
                    className={`${
                      index === currentSession.currentStepIndex && isExecuting
                        ? 'ring-2 ring-primary'
                        : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getPriorityColor(step.priority as any)}>
                              {t(step.priority)}
                            </Badge>
                            <Badge variant="outline">
                              {t(step.category)}
                            </Badge>
                            <Badge variant={getStatusColor(step.status)}>
                              {t(step.status)}
                            </Badge>
                            {step.automated && (
                              <Badge variant="secondary">
                                {t('automated')}
                              </Badge>
                            )}
                          </div>
                          
                          <h4 className="font-medium mb-1">{step.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {step.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {step.duration}s
                            </span>
                            {step.dependencies && step.dependencies.length > 0 && (
                              <span>
                                Dependencies: {step.dependencies.length}
                              </span>
                            )}
                          </div>
                          
                          {step.result && (
                            <Alert className="mt-2">
                              <CheckCircle size={16} />
                              <AlertDescription>{step.result}</AlertDescription>
                            </Alert>
                          )}
                          
                          {step.error && (
                            <Alert variant="destructive" className="mt-2">
                              <Warning size={16} />
                              <AlertDescription>{step.error}</AlertDescription>
                            </Alert>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            {index + 1}
                          </div>
                          {index === currentSession.currentStepIndex && isExecuting && (
                            <div className="text-xs text-muted-foreground">
                              {t('currentStep')}
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
      )}
    </div>
  );
};

export default StepByStepRecovery;