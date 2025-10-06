import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Robot,
  Play,
  Stop,
  CheckCircle,
  Warning,
  XCircle,
  Clock,
  Terminal,
  FileText,
  ArrowRight,
  ArrowClockwise,
  Shield,
  Target,
  Lightbulb
} from '@phosphor-icons/react';

// Type definitions for Local Agent Executor
interface TaskExecution {
  id: string;
  title: string;
  description: string;
  script: string;
  status: 'pending' | 'executing' | 'success' | 'failed' | 'rollback' | 'learning';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedAgent?: string;
  submittedBy: string;
  submittedAt: string;
  startedAt?: string;
  completedAt?: string;
  executionTime?: number;
  output?: string;
  error?: string;
  exitCode?: number;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  retryCount: number;
  maxRetries: number;
  dependencies?: string[];
  tags: string[];
}

interface ExecutionTemplate {
  id: string;
  name: string;
  description: string;
  script: string;
  category: 'deployment' | 'testing' | 'analysis' | 'maintenance' | 'custom';
  isVerified: boolean;
  successCount: number;
  errorCount: number;
  lastUsed?: string;
  tags: string[];
}

interface ExecutorSettings {
  safetyMode: boolean;
  requireApproval: boolean;
  maxConcurrentTasks: number;
  defaultTimeout: number;
  sandboxEnabled: boolean;
  autoRetry: boolean;
  logLevel: 'minimal' | 'standard' | 'verbose' | 'debug';
}

interface LocalAgentExecutorProps {
  language: 'en' | 'ru';
  projectId: string;
  onTaskExecuted?: (task: TaskExecution) => void;
  onTaskFailed?: (task: TaskExecution, error: string) => void;
  onTaskApproved?: (task: TaskExecution) => void;
  onTaskRollback?: (task: TaskExecution) => void;
}

const LocalAgentExecutor: React.FC<LocalAgentExecutorProps> = ({
  language,
  projectId,
  onTaskExecuted,
  onTaskFailed,
  onTaskApproved,
  onTaskRollback
}) => {
  // State management
  const [tasks, setTasks] = useKV<TaskExecution[]>(`executor-tasks-${projectId}`, []);
  const [templates, setTemplates] = useKV<ExecutionTemplate[]>(`executor-templates-${projectId}`, []);
  const [settings, setSettings] = useKV<ExecutorSettings>(`executor-settings-${projectId}`, {
    safetyMode: true,
    requireApproval: true,
    maxConcurrentTasks: 3,
    defaultTimeout: 300000,
    sandboxEnabled: true,
    autoRetry: true,
    logLevel: 'standard'
  });
  
  const [executionLogs, setExecutionLogs] = useKV<Array<{
    id: string;
    taskId: string;
    timestamp: string;
    level: 'info' | 'warning' | 'error';
    message: string;
    details?: any;
  }>>(`executor-logs-${projectId}`, []);

  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Get translation function
  const t = (key: string) => {
    const translations: Record<string, { en: string; ru: string }> = {
      localAgent: { en: 'Local Agent Executor', ru: 'Локальный Агент Исполнитель' },
      taskQueue: { en: 'Task Queue', ru: 'Очередь Задач' },
      executionHistory: { en: 'Execution History', ru: 'История Выполнения' },
      templates: { en: 'Script Templates', ru: 'Шаблоны Скриптов' },
      settings: { en: 'Executor Settings', ru: 'Настройки Исполнителя' },
      
      // Task statuses
      pending: { en: 'Pending', ru: 'Ожидает' },
      executing: { en: 'Executing', ru: 'Выполняется' },
      success: { en: 'Success', ru: 'Успех' },
      failed: { en: 'Failed', ru: 'Ошибка' },
      rollback: { en: 'Rollback', ru: 'Откат' },
      learning: { en: 'Learning', ru: 'Обучение' },
      
      // Actions
      execute: { en: 'Execute', ru: 'Выполнить' },
      approve: { en: 'Approve', ru: 'Одобрить' },
      reject: { en: 'Reject', ru: 'Отклонить' },
      retry: { en: 'Retry', ru: 'Повторить' },
      rollbackTask: { en: 'Rollback', ru: 'Откатить' },
      viewLogs: { en: 'View Logs', ru: 'Просмотр Логов' },
      
      // Settings
      safetyMode: { en: 'Safety Mode', ru: 'Режим Безопасности' },
      requireApproval: { en: 'Require Approval', ru: 'Требовать Одобрение' },
      sandboxEnabled: { en: 'Sandbox Enabled', ru: 'Песочница Включена' },
      autoRetry: { en: 'Auto Retry', ru: 'Автоповтор' },
      
      // Messages
      noTasks: { en: 'No tasks in queue', ru: 'Нет задач в очереди' },
      taskApproved: { en: 'Task approved for execution', ru: 'Задача одобрена для выполнения' },
      taskExecuted: { en: 'Task executed successfully', ru: 'Задача успешно выполнена' },
      taskFailed: { en: 'Task execution failed', ru: 'Выполнение задачи не удалось' },
      taskRolledBack: { en: 'Task rolled back', ru: 'Задача откачена' }
    };
    
    return translations[key]?.[language] || key;
  };

  // Execute task
  const executeTask = async (taskId: string) => {
    const task = (tasks || []).find(t => t.id === taskId);
    if (!task || !settings) return;

    // Check if approval is required
    if (settings.requireApproval && !task.isApproved) {
      toast.error(language === 'ru' ? 'Задача требует одобрения' : 'Task requires approval');
      return;
    }

    setIsExecuting(true);
    
    // Update task status to executing
    setTasks(current => 
      (current || []).map(t => 
        t.id === taskId 
          ? { ...t, status: 'executing', startedAt: new Date().toISOString() }
          : t
      )
    );

    // Add execution log
    const logEntry = {
      id: `log-${Date.now()}`,
      taskId,
      timestamp: new Date().toISOString(),
      level: 'info' as const,
      message: `Starting execution of task: ${task.title}`,
      details: { script: task.script, agent: task.assignedAgent }
    };
    
    setExecutionLogs(current => [...(current || []), logEntry]);

    try {
      // Simulate script execution
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      // Simulate execution result
      const isSuccess = Math.random() > 0.2; // 80% success rate
      const mockOutput = isSuccess 
        ? `Script executed successfully\nOutput: Task "${task.title}" completed\nExit code: 0`
        : `Script execution failed\nError: Simulated failure\nExit code: 1`;
        
      const executionTime = Date.now() - new Date(task.startedAt || Date.now()).getTime();

      // Update task with result
      setTasks(current => 
        (current || []).map(t => 
          t.id === taskId 
            ? { 
                ...t, 
                status: isSuccess ? 'success' : 'failed',
                completedAt: new Date().toISOString(),
                output: mockOutput,
                exitCode: isSuccess ? 0 : 1,
                executionTime,
                error: isSuccess ? undefined : 'Simulated execution failure'
              }
            : t
        )
      );

      // Add completion log
      const completionLog = {
        id: `log-${Date.now()}`,
        taskId,
        timestamp: new Date().toISOString(),
        level: isSuccess ? 'info' as const : 'error' as const,
        message: isSuccess 
          ? `Task completed successfully in ${executionTime}ms`
          : `Task failed with error: Simulated failure`,
        details: { exitCode: isSuccess ? 0 : 1, executionTime }
      };
      
      setExecutionLogs(current => [...(current || []), completionLog]);

      if (isSuccess) {
        onTaskExecuted?.(task);
        toast.success(t('taskExecuted'));
      } else {
        onTaskFailed?.(task, 'Simulated execution failure');
        toast.error(t('taskFailed'));
        
        // Auto-retry if enabled
        if (settings.autoRetry && task.retryCount < task.maxRetries) {
          setTimeout(() => {
            setTasks(current => 
              (current || []).map(t => 
                t.id === taskId 
                  ? { ...t, status: 'pending', retryCount: t.retryCount + 1 }
                  : t
              )
            );
            toast.info(language === 'ru' ? 'Автоповтор запланирован' : 'Auto-retry scheduled');
          }, 5000);
        }
      }

    } catch (error) {
      // Handle execution error
      setTasks(current => 
        (current || []).map(t => 
          t.id === taskId 
            ? { 
                ...t, 
                status: 'failed',
                completedAt: new Date().toISOString(),
                error: String(error)
              }
            : t
        )
      );
      
      onTaskFailed?.(task, String(error));
      toast.error(t('taskFailed'));
    } finally {
      setIsExecuting(false);
    }
  };

  // Approve task
  const approveTask = (taskId: string) => {
    setTasks(current => 
      (current || []).map(t => 
        t.id === taskId 
          ? { 
              ...t, 
              isApproved: true, 
              approvedBy: 'User',
              approvedAt: new Date().toISOString()
            }
          : t
      )
    );
    
    const task = (tasks || []).find(t => t.id === taskId);
    if (task) {
      onTaskApproved?.(task);
    }
    
    toast.success(t('taskApproved'));
  };

  // Rollback task
  const rollbackTask = (taskId: string) => {
    setTasks(current => 
      (current || []).map(t => 
        t.id === taskId 
          ? { ...t, status: 'rollback' }
          : t
      )
    );
    
    const task = (tasks || []).find(t => t.id === taskId);
    if (task) {
      onTaskRollback?.(task);
    }
    
    toast.success(t('taskRolledBack'));
  };

  // Get status icon
  const getStatusIcon = (status: TaskExecution['status']) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'executing':
        return <ArrowClockwise size={16} className="text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'failed':
        return <XCircle size={16} className="text-red-500" />;
      case 'rollback':
        return <ArrowRight size={16} className="text-orange-500 rotate-180" />;
      case 'learning':
        return <Lightbulb size={16} className="text-purple-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: TaskExecution['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Current executing tasks
  const executingTasks = (tasks || []).filter(t => t.status === 'executing');
  const pendingTasks = (tasks || []).filter(t => t.status === 'pending');
  const completedTasks = (tasks || []).filter(t => ['success', 'failed'].includes(t.status));

  if (!settings) {
    return <div>Loading executor settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Robot size={24} className="text-primary" />
            {t('localAgent')}
          </CardTitle>
          <CardDescription>
            {language === 'ru' 
              ? 'Исполнитель утверждённых задач с возможностью отката и обучения' 
              : 'Executor for approved tasks with rollback and learning capabilities'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Execution Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Executing</p>
                <p className="text-2xl font-bold text-blue-500">{executingTasks.length}</p>
              </div>
              <ArrowClockwise size={24} className="text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-500">{pendingTasks.length}</p>
              </div>
              <Clock size={24} className="text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-500">{completedTasks.length}</p>
              </div>
              <CheckCircle size={24} className="text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Safety Mode</p>
                <p className="text-sm font-medium">
                  {settings.safetyMode ? t('pending') : 'Disabled'}
                </p>
              </div>
              <Shield size={24} className={settings.safetyMode ? 'text-green-500' : 'text-gray-500'} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal size={20} />
            {t('taskQueue')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(tasks || []).length > 0 ? (
              (tasks || []).slice(-10).reverse().map(task => (
                <div key={task.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(task.status)}
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getPriorityColor(task.priority) as any}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline">{t(task.status)}</Badge>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground mb-3 space-y-1">
                    <div>Submitted by: {task.submittedBy} • {new Date(task.submittedAt).toLocaleString()}</div>
                    {task.assignedAgent && (
                      <div>Assigned to: {task.assignedAgent}</div>
                    )}
                    {task.executionTime && (
                      <div>Execution time: {task.executionTime}ms</div>
                    )}
                  </div>

                  {task.status === 'pending' && settings.requireApproval && !task.isApproved && (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-yellow-50 rounded border">
                      <Warning size={16} className="text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        {language === 'ru' ? 'Требует одобрения' : 'Requires approval'}
                      </span>
                    </div>
                  )}

                  {task.output && (
                    <div className="mt-3">
                      <div className="text-xs font-medium mb-1">Output:</div>
                      <div className="bg-black text-green-400 p-2 rounded text-xs font-mono whitespace-pre-wrap">
                        {task.output}
                      </div>
                    </div>
                  )}

                  {task.error && (
                    <div className="mt-3">
                      <div className="text-xs font-medium mb-1 text-red-600">Error:</div>
                      <div className="bg-red-50 text-red-800 p-2 rounded text-xs border border-red-200">
                        {task.error}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      {task.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {task.status === 'pending' && !task.isApproved && settings.requireApproval && (
                        <Button 
                          size="sm" 
                          onClick={() => approveTask(task.id)}
                          variant="outline"
                        >
                          <CheckCircle size={14} className="mr-1" />
                          {t('approve')}
                        </Button>
                      )}
                      
                      {task.status === 'pending' && task.isApproved && (
                        <Button 
                          size="sm" 
                          onClick={() => executeTask(task.id)}
                          disabled={isExecuting}
                        >
                          <Play size={14} className="mr-1" />
                          {t('execute')}
                        </Button>
                      )}
                      
                      {task.status === 'failed' && task.retryCount < task.maxRetries && (
                        <Button 
                          size="sm" 
                          onClick={() => executeTask(task.id)}
                          variant="outline"
                        >
                          <ArrowClockwise size={14} className="mr-1" />
                          {t('retry')}
                        </Button>
                      )}
                      
                      {task.status === 'success' && (
                        <Button 
                          size="sm" 
                          onClick={() => rollbackTask(task.id)}
                          variant="outline"
                        >
                          <ArrowRight size={14} className="mr-1 rotate-180" />
                          {t('rollbackTask')}
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedTask(task.id)}
                        variant="outline"
                      >
                        <FileText size={14} className="mr-1" />
                        {t('viewLogs')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Terminal size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('noTasks')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Execution Logs */}
      {selectedTask && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Execution Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 w-full">
              <div className="space-y-2">
                {(executionLogs || [])
                  .filter(log => log.taskId === selectedTask)
                  .map(log => (
                    <div key={log.id} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground text-xs shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <Badge 
                        variant={log.level === 'error' ? 'destructive' : log.level === 'warning' ? 'secondary' : 'outline'} 
                        className="text-xs shrink-0"
                      >
                        {log.level}
                      </Badge>
                      <span className="flex-1">{log.message}</span>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LocalAgentExecutor;