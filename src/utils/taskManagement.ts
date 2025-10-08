// Task management utilities
export interface MicroTask {
  id: string;
  title: string;
  description: string;
  component: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  startTime?: string;
  endTime?: string;
  duration?: number;
  dependencies?: string[];
  commands: TaskCommand[];
  currentCommand?: number;
  result?: string;
  error?: string;
  retryCount?: number;
  maxRetries?: number;
}

export interface TaskCommand {
  id: string;
  name: string;
  description: string;
  estimatedTime: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  error?: string;
}

export interface TaskQueue {
  id: string;
  name: string;
  description: string;
  tasks: MicroTask[];
  status: 'idle' | 'running' | 'paused' | 'completed';
  concurrency: number;
  currentlyRunning: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface TaskExecutionSettings {
  maxConcurrentTasks: number;
  defaultTimeout: number;
  retryAttempts: number;
  enableAutoRetry: boolean;
  pauseOnError: boolean;
  notifyOnCompletion: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export const defaultTaskSettings: TaskExecutionSettings = {
  maxConcurrentTasks: 3,
  defaultTimeout: 300000, // 5 minutes
  retryAttempts: 2,
  enableAutoRetry: true,
  pauseOnError: false,
  notifyOnCompletion: true,
  logLevel: 'info'
};

export const createMicroTask = (
  title: string,
  description: string,
  commands: Omit<TaskCommand, 'id' | 'status'>[],
  options: Partial<Pick<MicroTask, 'priority' | 'component' | 'dependencies' | 'maxRetries'>> = {}
): MicroTask => {
  return {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    description,
    component: options.component || 'General',
    priority: options.priority || 'medium',
    status: 'pending',
    progress: 0,
    dependencies: options.dependencies || [],
    commands: commands.map((cmd, index) => ({
      ...cmd,
      id: `cmd-${Date.now()}-${index}`,
      status: 'pending'
    })),
    retryCount: 0,
    maxRetries: options.maxRetries || 2
  };
};

export const createTaskQueue = (
  name: string,
  description: string,
  tasks: MicroTask[],
  options: Partial<Pick<TaskQueue, 'concurrency' | 'priority'>> = {}
): TaskQueue => {
  return {
    id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    tasks,
    status: 'idle',
    concurrency: options.concurrency || 2,
    currentlyRunning: 0,
    priority: options.priority || 'medium',
    createdAt: new Date().toISOString()
  };
};

export const calculateTaskProgress = (task: MicroTask): number => {
  if (task.commands.length === 0) return 0;
  
  const completedCommands = task.commands.filter(cmd => cmd.status === 'completed').length;
  return Math.round((completedCommands / task.commands.length) * 100);
};

export const calculateQueueProgress = (queue: TaskQueue): number => {
  if (queue.tasks.length === 0) return 0;
  
  const totalProgress = queue.tasks.reduce((sum, task) => sum + calculateTaskProgress(task), 0);
  return Math.round(totalProgress / queue.tasks.length);
};

export const getTaskDuration = (task: MicroTask): number => {
  if (!task.startTime) return 0;
  const endTime = task.endTime ? new Date(task.endTime) : new Date();
  const startTime = new Date(task.startTime);
  return Math.round((endTime.getTime() - startTime.getTime()) / 1000);
};

export const getEstimatedTimeRemaining = (task: MicroTask): number => {
  if (task.status !== 'running' || !task.startTime) return 0;
  
  const elapsed = getTaskDuration(task);
  const progress = calculateTaskProgress(task);
  
  if (progress === 0) return 0;
  
  const estimatedTotal = (elapsed / progress) * 100;
  return Math.max(0, Math.round(estimatedTotal - elapsed));
};

export const canExecuteTask = (task: MicroTask, allTasks: MicroTask[]): boolean => {
  if (task.status !== 'pending') return false;
  
  // Check dependencies
  if (task.dependencies && task.dependencies.length > 0) {
    return task.dependencies.every(depId => {
      const dependency = allTasks.find(t => t.id === depId);
      return dependency && dependency.status === 'completed';
    });
  }
  
  return true;
};

export const getTaskPriorityWeight = (priority: MicroTask['priority']): number => {
  switch (priority) {
    case 'urgent': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 2;
  }
};

export const sortTasksByPriority = (tasks: MicroTask[]): MicroTask[] => {
  return [...tasks].sort((a, b) => {
    const weightA = getTaskPriorityWeight(a.priority);
    const weightB = getTaskPriorityWeight(b.priority);
    return weightB - weightA;
  });
};

export const getNextExecutableTasks = (
  tasks: MicroTask[],
  maxTasks: number,
  currentlyRunning: MicroTask[] = []
): MicroTask[] => {
  const availableSlots = maxTasks - currentlyRunning.length;
  if (availableSlots <= 0) return [];
  
  const executableTasks = tasks
    .filter(task => canExecuteTask(task, tasks))
    .filter(task => !currentlyRunning.some(running => running.id === task.id));
  
  return sortTasksByPriority(executableTasks).slice(0, availableSlots);
};

export const shouldRetryTask = (task: MicroTask): boolean => {
  return task.status === 'failed' && 
         task.retryCount !== undefined && 
         task.maxRetries !== undefined && 
         task.retryCount < task.maxRetries;
};

export const createSystemDiagnosticTasks = (language: 'en' | 'ru' = 'en'): MicroTask[] => {
  const isRussian = language === 'ru';
  
  return [
    createMicroTask(
      isRussian ? 'Проверка памяти системы' : 'System Memory Check',
      isRussian ? 'Анализ использования памяти и очистка кэша' : 'Analyze memory usage and clear cache',
      [
        { 
          name: isRussian ? 'Сканирование памяти' : 'Memory Scan', 
          description: isRussian ? 'Проверка использования памяти' : 'Check memory usage',
          estimatedTime: 5 
        },
        { 
          name: isRussian ? 'Очистка кэша' : 'Cache Cleanup', 
          description: isRussian ? 'Очистка временных файлов' : 'Clear temporary files',
          estimatedTime: 10 
        },
        { 
          name: isRussian ? 'Оптимизация' : 'Optimization', 
          description: isRussian ? 'Оптимизация использования памяти' : 'Optimize memory allocation',
          estimatedTime: 8 
        }
      ],
      { priority: 'high', component: 'Memory Management' }
    ),
    
    createMicroTask(
      isRussian ? 'Проверка производительности' : 'Performance Check',
      isRussian ? 'Анализ производительности системы' : 'Analyze system performance',
      [
        { 
          name: isRussian ? 'Анализ процессов' : 'Process Analysis', 
          description: isRussian ? 'Проверка запущенных процессов' : 'Check running processes',
          estimatedTime: 7 
        },
        { 
          name: isRussian ? 'Оптимизация' : 'Optimization', 
          description: isRussian ? 'Оптимизация производительности' : 'Optimize performance',
          estimatedTime: 12 
        }
      ],
      { priority: 'medium', component: 'Performance Monitor' }
    ),
    
    createMicroTask(
      isRussian ? 'Проверка безопасности' : 'Security Check',
      isRussian ? 'Проверка системы безопасности' : 'Security system verification',
      [
        { 
          name: isRussian ? 'Сканирование уязвимостей' : 'Vulnerability Scan', 
          description: isRussian ? 'Поиск уязвимостей безопасности' : 'Scan for security vulnerabilities',
          estimatedTime: 15 
        },
        { 
          name: isRussian ? 'Обновление настроек' : 'Settings Update', 
          description: isRussian ? 'Обновление настроек безопасности' : 'Update security settings',
          estimatedTime: 5 
        }
      ],
      { priority: 'urgent', component: 'Security Module' }
    )
  ];
};