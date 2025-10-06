import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  ListChecks,
  Clock,
  CheckCircle,
  Warning,
  Play,
  Pause,
  Stop,
  ArrowDown,
  ArrowRight,
  Target,
  Brain,
  Lightbulb,
  Plus,
  PencilSimple,
  Trash,
  Timer,
  Calendar,
  User
} from '@phosphor-icons/react';

declare global {
  interface Window {
    spark: {
      llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string;
      llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>;
    };
  }
}

const spark = (globalThis as any).spark;

// Типы для системы разбиения задач
interface MicroTask {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  actualMinutes?: number;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];
  category: 'analysis' | 'design' | 'implementation' | 'testing' | 'documentation' | 'review';
  complexity: 'trivial' | 'simple' | 'moderate' | 'complex';
  assignedTo?: string;
  startTime?: string;
  endTime?: string;
  notes: string[];
  checkpoints: Checkpoint[];
  blockers: Blocker[];
  createdAt: string;
  updatedAt: string;
}

interface Checkpoint {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  timestamp?: string;
}

interface Blocker {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolvedAt?: string;
  resolution?: string;
}

interface TaskBreakdown {
  id: string;
  originalTask: string;
  originalDescription: string;
  totalEstimatedHours: number;
  microTasks: MicroTask[];
  createdAt: string;
  status: 'draft' | 'approved' | 'in-progress' | 'completed';
  methodology: 'ai-assisted' | 'manual' | 'template-based';
}

interface TaskBreakdownSession {
  id: string;
  name: string;
  description: string;
  breakdowns: TaskBreakdown[];
  createdAt: string;
  lastActive: string;
  completionRate: number;
}

interface MicroTaskExecutorProps {
  language: 'en' | 'ru';
  projectId: string;
  onTaskCompleted?: (task: MicroTask) => void;
  onSessionCompleted?: (session: TaskBreakdownSession) => void;
  onBreakdownCreated?: (breakdown: TaskBreakdown) => void;
}

// Переводы
const translations = {
  microTaskExecutor: { en: 'Micro-Task Executor', ru: 'Исполнитель Микро-Задач' },
  taskBreakdown: { en: 'Task Breakdown', ru: 'Разбиение Задач' },
  createBreakdown: { en: 'Create Breakdown', ru: 'Создать Разбиение' },
  originalTask: { en: 'Original Task', ru: 'Исходная Задача' },
  microTasks: { en: 'Micro Tasks', ru: 'Микро-Задачи' },
  
  // Статусы
  pending: { en: 'Pending', ru: 'Ожидает' },
  inProgress: { en: 'In Progress', ru: 'В Работе' },
  completed: { en: 'Completed', ru: 'Завершено' },
  blocked: { en: 'Blocked', ru: 'Заблокировано' },
  
  // Приоритеты
  low: { en: 'Low', ru: 'Низкий' },
  medium: { en: 'Medium', ru: 'Средний' },
  high: { en: 'High', ru: 'Высокий' },
  critical: { en: 'Critical', ru: 'Критический' },
  
  // Категории
  analysis: { en: 'Analysis', ru: 'Анализ' },
  design: { en: 'Design', ru: 'Дизайн' },
  implementation: { en: 'Implementation', ru: 'Реализация' },
  testing: { en: 'Testing', ru: 'Тестирование' },
  documentation: { en: 'Documentation', ru: 'Документация' },
  review: { en: 'Review', ru: 'Проверка' },
  
  // Сложность
  trivial: { en: 'Trivial', ru: 'Тривиальная' },
  simple: { en: 'Simple', ru: 'Простая' },
  moderate: { en: 'Moderate', ru: 'Средняя' },
  complex: { en: 'Complex', ru: 'Сложная' },
  
  // Действия
  startTask: { en: 'Start Task', ru: 'Начать Задачу' },
  pauseTask: { en: 'Pause Task', ru: 'Приостановить' },
  completeTask: { en: 'Complete Task', ru: 'Завершить' },
  addNote: { en: 'Add Note', ru: 'Добавить Заметку' },
  addCheckpoint: { en: 'Add Checkpoint', ru: 'Добавить Контрольную Точку' },
  reportBlocker: { en: 'Report Blocker', ru: 'Сообщить о Блокере' },
  
  // Поля
  title: { en: 'Title', ru: 'Название' },
  description: { en: 'Description', ru: 'Описание' },
  estimatedMinutes: { en: 'Estimated Minutes', ru: 'Оценка (минуты)' },
  actualMinutes: { en: 'Actual Minutes', ru: 'Фактически (минуты)' },
  assignedTo: { en: 'Assigned To', ru: 'Назначено' },
  dependencies: { en: 'Dependencies', ru: 'Зависимости' },
  notes: { en: 'Notes', ru: 'Заметки' },
  checkpoints: { en: 'Checkpoints', ru: 'Контрольные Точки' },
  blockers: { en: 'Blockers', ru: 'Блокеры' },
  
  // AI Assistant
  aiBreakdown: { en: 'AI-Assisted Breakdown', ru: 'ИИ-Разбиение' },
  generateBreakdown: { en: 'Generate Breakdown', ru: 'Создать Разбиение' },
  aiAnalyzing: { en: 'AI is analyzing the task...', ru: 'ИИ анализирует задачу...' },
  
  // Временные метки
  estimatedTime: { en: 'Estimated Time', ru: 'Оценочное Время' },
  timeSpent: { en: 'Time Spent', ru: 'Затрачено Времени' },
  timeRemaining: { en: 'Time Remaining', ru: 'Осталось Времени' },
  
  // Сообщения
  taskStarted: { en: 'Task started', ru: 'Задача начата' },
  taskPaused: { en: 'Task paused', ru: 'Задача приостановлена' },
  taskCompleted: { en: 'Task completed successfully', ru: 'Задача успешно завершена' },
  breakdownGenerated: { en: 'Task breakdown generated', ru: 'Разбиение задачи создано' },
  checkpointAdded: { en: 'Checkpoint added', ru: 'Контрольная точка добавлена' },
  blockerReported: { en: 'Blocker reported', ru: 'Блокер зарегистрирован' }
};

const MicroTaskExecutor: React.FC<MicroTaskExecutorProps> = ({
  language,
  projectId,
  onTaskCompleted,
  onSessionCompleted,
  onBreakdownCreated
}) => {
  const t = (key: string) => translations[key as keyof typeof translations]?.[language] || key;

  // Состояние компонента
  const [sessions, setSessions] = useKV<TaskBreakdownSession[]>(`micro-task-sessions-${projectId}`, []);
  const [currentSession, setCurrentSession] = useKV<string | null>(`current-micro-session-${projectId}`, null);
  
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [taskTimer, setTaskTimer] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingBreakdown, setIsCreatingBreakdown] = useState(false);
  
  // Форма для создания разбиения
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskHours, setNewTaskHours] = useState<number>(4);

  // Таймер для активной задачи
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeTask) {
      interval = setInterval(() => {
        setTaskTimer(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTask]);

  // Получение текущей сессии
  const getCurrentSession = (): TaskBreakdownSession | null => {
    if (!currentSession) return null;
    return (sessions || []).find(s => s.id === currentSession) || null;
  };

  // Генерация разбиения задачи с помощью ИИ
  const generateTaskBreakdown = async () => {
    if (!newTaskTitle.trim()) {
      toast.error('Task title is required');
      return;
    }

    setIsGenerating(true);
    
    try {
      const prompt = spark.llmPrompt`You are an expert project manager specializing in breaking down complex tasks into micro-tasks.

Task to break down:
Title: ${newTaskTitle}
Description: ${newTaskDescription}
Estimated total time: ${newTaskHours} hours

Requirements for micro-tasks:
1. Each micro-task should be 15-45 minutes maximum
2. Tasks should be specific and actionable
3. Include clear acceptance criteria
4. Identify dependencies between tasks
5. Categorize by type (analysis, design, implementation, testing, documentation, review)
6. Assign complexity level (trivial, simple, moderate, complex)
7. Set appropriate priority

Create a breakdown with 8-15 micro-tasks. Return as JSON with this structure:
{
  "microTasks": [
    {
      "title": "Task title",
      "description": "Detailed description with acceptance criteria",
      "estimatedMinutes": 30,
      "priority": "high",
      "category": "implementation", 
      "complexity": "moderate",
      "dependencies": ["task-1-id"],
      "checkpoints": [
        {
          "title": "Checkpoint name",
          "description": "What to verify"
        }
      ]
    }
  ]
}

Focus on creating logical, sequential micro-tasks that build upon each other.`;

      const response = await spark.llm(prompt, 'gpt-4o', true);
      const aiResult = JSON.parse(response);
      
      // Создание разбиения задачи
      const breakdown: TaskBreakdown = {
        id: `breakdown-${Date.now()}`,
        originalTask: newTaskTitle,
        originalDescription: newTaskDescription,
        totalEstimatedHours: newTaskHours,
        microTasks: aiResult.microTasks.map((task: any, index: number) => ({
          id: `microtask-${Date.now()}-${index}`,
          title: task.title,
          description: task.description,
          estimatedMinutes: task.estimatedMinutes || 30,
          status: 'pending',
          priority: task.priority || 'medium',
          dependencies: task.dependencies || [],
          category: task.category || 'implementation',
          complexity: task.complexity || 'moderate',
          notes: [],
          checkpoints: (task.checkpoints || []).map((cp: any, cpIndex: number) => ({
            id: `checkpoint-${Date.now()}-${index}-${cpIndex}`,
            title: cp.title,
            description: cp.description,
            completed: false
          })),
          blockers: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })),
        createdAt: new Date().toISOString(),
        status: 'approved',
        methodology: 'ai-assisted'
      };

      // Добавление к текущей сессии или создание новой
      let session = getCurrentSession();
      if (!session) {
        session = {
          id: `session-${Date.now()}`,
          name: `Task Session: ${newTaskTitle}`,
          description: `Breakdown session for: ${newTaskDescription}`,
          breakdowns: [],
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          completionRate: 0
        };
        
        setSessions(current => [...(current || []), session!]);
        setCurrentSession(session.id);
      }

      // Добавление разбиения к сессии
      setSessions(current => 
        (current || []).map(s => 
          s.id === session!.id 
            ? { ...s, breakdowns: [...s.breakdowns, breakdown], lastActive: new Date().toISOString() }
            : s
        )
      );

      if (onBreakdownCreated) {
        onBreakdownCreated(breakdown);
      }

      setIsCreatingBreakdown(false);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskHours(4);
      
      toast.success(t('breakdownGenerated'));
    } catch (error) {
      console.error('Error generating breakdown:', error);
      toast.error('Failed to generate task breakdown');
    } finally {
      setIsGenerating(false);
    }
  };

  // Управление задачами
  const startTask = (taskId: string) => {
    setActiveTask(taskId);
    setTaskTimer(0);
    updateTaskStatus(taskId, 'in-progress', { startTime: new Date().toISOString() });
    toast.success(t('taskStarted'));
  };

  const pauseTask = (taskId: string) => {
    setActiveTask(null);
    updateTaskStatus(taskId, 'pending');
    toast.success(t('taskPaused'));
  };

  const completeTask = (taskId: string) => {
    setActiveTask(null);
    const actualMinutes = Math.ceil(taskTimer / 60);
    updateTaskStatus(taskId, 'completed', { 
      endTime: new Date().toISOString(),
      actualMinutes 
    });
    
    const session = getCurrentSession();
    const task = session?.breakdowns
      .flatMap(b => b.microTasks)
      .find(t => t.id === taskId);
    
    if (task && onTaskCompleted) {
      onTaskCompleted({ ...task, actualMinutes, status: 'completed' });
    }
    
    toast.success(t('taskCompleted'));
  };

  const updateTaskStatus = (taskId: string, status: MicroTask['status'], updates: Partial<MicroTask> = {}) => {
    setSessions(current => 
      (current || []).map(session => ({
        ...session,
        breakdowns: session.breakdowns.map(breakdown => ({
          ...breakdown,
          microTasks: breakdown.microTasks.map(task => 
            task.id === taskId 
              ? { ...task, status, ...updates, updatedAt: new Date().toISOString() }
              : task
          )
        }))
      }))
    );
  };

  const addCheckpoint = (taskId: string, title: string, description: string) => {
    const checkpoint: Checkpoint = {
      id: `checkpoint-${Date.now()}`,
      title,
      description,
      completed: false,
      timestamp: new Date().toISOString()
    };

    setSessions(current => 
      (current || []).map(session => ({
        ...session,
        breakdowns: session.breakdowns.map(breakdown => ({
          ...breakdown,
          microTasks: breakdown.microTasks.map(task => 
            task.id === taskId 
              ? { 
                  ...task, 
                  checkpoints: [...task.checkpoints, checkpoint],
                  updatedAt: new Date().toISOString()
                }
              : task
          )
        }))
      }))
    );

    toast.success(t('checkpointAdded'));
  };

  const toggleCheckpoint = (taskId: string, checkpointId: string) => {
    setSessions(current => 
      (current || []).map(session => ({
        ...session,
        breakdowns: session.breakdowns.map(breakdown => ({
          ...breakdown,
          microTasks: breakdown.microTasks.map(task => 
            task.id === taskId 
              ? {
                  ...task,
                  checkpoints: task.checkpoints.map(cp =>
                    cp.id === checkpointId
                      ? { ...cp, completed: !cp.completed, timestamp: new Date().toISOString() }
                      : cp
                  ),
                  updatedAt: new Date().toISOString()
                }
              : task
          )
        }))
      }))
    );
  };

  const reportBlocker = (taskId: string, title: string, description: string, severity: Blocker['severity']) => {
    const blocker: Blocker = {
      id: `blocker-${Date.now()}`,
      title,
      description,
      severity
    };

    setSessions(current => 
      (current || []).map(session => ({
        ...session,
        breakdowns: session.breakdowns.map(breakdown => ({
          ...breakdown,
          microTasks: breakdown.microTasks.map(task => 
            task.id === taskId 
              ? { 
                  ...task, 
                  blockers: [...task.blockers, blocker],
                  status: 'blocked',
                  updatedAt: new Date().toISOString()
                }
              : task
          )
        }))
      }))
    );

    setActiveTask(null);
    toast.success(t('blockerReported'));
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: MicroTask['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'blocked': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: MicroTask['priority']) => {
    switch (priority) {
      case 'critical': return 'border-red-500';
      case 'high': return 'border-orange-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-green-500';
      default: return 'border-gray-500';
    }
  };

  const session = getCurrentSession();
  const allTasks = session?.breakdowns.flatMap(b => b.microTasks) || [];
  const completedTasks = allTasks.filter(t => t.status === 'completed').length;
  const totalTasks = allTasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks size={24} className="text-primary" />
            {t('microTaskExecutor')}
          </CardTitle>
          <CardDescription>
            {language === 'ru' 
              ? 'Автоматическое разбиение больших задач на микро-задачи с AI-ассистентом'
              : 'Automatic breakdown of large tasks into micro-tasks with AI assistant'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {session && (
                <div>
                  <h3 className="font-medium">{session.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {completedTasks}/{totalTasks} tasks completed • {Math.round(completionRate)}%
                  </p>
                </div>
              )}
            </div>
            
            <Dialog open={isCreatingBreakdown} onOpenChange={setIsCreatingBreakdown}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-2" />
                  {t('createBreakdown')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Brain size={20} />
                    {t('aiBreakdown')}
                  </DialogTitle>
                  <DialogDescription>
                    {language === 'ru' 
                      ? 'Опишите задачу, и ИИ автоматически разобьет её на микро-задачи'
                      : 'Describe your task and AI will automatically break it into micro-tasks'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="task-title">{t('title')}</Label>
                    <Input
                      id="task-title"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder={language === 'ru' ? 'Название большой задачи' : 'Large task title'}
                    />
                  </div>

                  <div>
                    <Label htmlFor="task-description">{t('description')}</Label>
                    <Textarea
                      id="task-description"
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      placeholder={language === 'ru' 
                        ? 'Подробное описание задачи, требований и ожидаемого результата'
                        : 'Detailed task description, requirements and expected outcome'
                      }
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="task-hours">{t('estimatedTime')} (hours)</Label>
                    <Input
                      id="task-hours"
                      type="number"
                      value={newTaskHours}
                      onChange={(e) => setNewTaskHours(parseInt(e.target.value) || 4)}
                      min="1"
                      max="40"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreatingBreakdown(false)}>
                      {language === 'ru' ? 'Отмена' : 'Cancel'}
                    </Button>
                    <Button onClick={generateTaskBreakdown} disabled={isGenerating}>
                      {isGenerating ? (
                        <>
                          <Brain size={16} className="mr-2 animate-spin" />
                          {t('aiAnalyzing')}
                        </>
                      ) : (
                        <>
                          <Lightbulb size={16} className="mr-2" />
                          {t('generateBreakdown')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {session && (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Session Progress</span>
                  <span className="text-sm text-muted-foreground">{Math.round(completionRate)}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>

              <div className="space-y-4">
                {session.breakdowns.map(breakdown => (
                  <Card key={breakdown.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target size={20} />
                        {breakdown.originalTask}
                      </CardTitle>
                      <CardDescription>{breakdown.originalDescription}</CardDescription>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Est: {breakdown.totalEstimatedHours}h</span>
                        <span>{breakdown.microTasks.length} micro-tasks</span>
                        <Badge variant={breakdown.status === 'completed' ? 'default' : 'secondary'}>
                          {breakdown.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-64">
                        <div className="space-y-3">
                          {breakdown.microTasks.map(task => (
                            <Card key={task.id} className={`border-l-4 ${getPriorityColor(task.priority)}`}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                                      <span className="font-medium">{task.title}</span>
                                      <Badge variant="outline" className="text-xs">{t(task.category)}</Badge>
                                      <Badge variant="secondary" className="text-xs">{t(task.complexity)}</Badge>
                                    </div>
                                    
                                    <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                                    
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                                      <div className="flex items-center gap-1">
                                        <Timer size={12} />
                                        {task.estimatedMinutes}min est.
                                      </div>
                                      {task.actualMinutes && (
                                        <div className="flex items-center gap-1">
                                          <Clock size={12} />
                                          {task.actualMinutes}min actual
                                        </div>
                                      )}
                                      {activeTask === task.id && (
                                        <div className="flex items-center gap-1 text-blue-500 font-medium">
                                          <Clock size={12} />
                                          {formatTime(taskTimer)}
                                        </div>
                                      )}
                                    </div>

                                    {task.checkpoints.length > 0 && (
                                      <div className="mb-3">
                                        <h5 className="font-medium text-xs mb-1">{t('checkpoints')}:</h5>
                                        <div className="space-y-1">
                                          {task.checkpoints.map(checkpoint => (
                                            <div key={checkpoint.id} className="flex items-center gap-2 text-xs">
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-4 w-4 p-0"
                                                onClick={() => toggleCheckpoint(task.id, checkpoint.id)}
                                              >
                                                <CheckCircle 
                                                  size={12} 
                                                  className={checkpoint.completed ? 'text-green-500' : 'text-muted-foreground'} 
                                                />
                                              </Button>
                                              <span className={checkpoint.completed ? 'line-through text-muted-foreground' : ''}>
                                                {checkpoint.title}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {task.blockers.length > 0 && (
                                      <div className="mb-3">
                                        <h5 className="font-medium text-xs mb-1 text-red-500">{t('blockers')}:</h5>
                                        <div className="space-y-1">
                                          {task.blockers.map(blocker => (
                                            <div key={blocker.id} className="flex items-center gap-2 text-xs">
                                              <Warning size={12} className="text-red-500" />
                                              <span>{blocker.title}</span>
                                              <Badge variant="destructive" className="text-xs">{blocker.severity}</Badge>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex flex-col gap-1 ml-4">
                                    {task.status === 'pending' && (
                                      <Button
                                        size="sm"
                                        onClick={() => startTask(task.id)}
                                        disabled={!!activeTask && activeTask !== task.id}
                                      >
                                        <Play size={14} className="mr-1" />
                                        {t('startTask')}
                                      </Button>
                                    )}
                                    
                                    {task.status === 'in-progress' && activeTask === task.id && (
                                      <>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => pauseTask(task.id)}
                                        >
                                          <Pause size={14} className="mr-1" />
                                          {t('pauseTask')}
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => completeTask(task.id)}
                                        >
                                          <CheckCircle size={14} className="mr-1" />
                                          {t('completeTask')}
                                        </Button>
                                      </>
                                    )}
                                    
                                    {task.status === 'completed' && (
                                      <Badge variant="default" className="text-xs">
                                        {t('completed')}
                                      </Badge>
                                    )}
                                    
                                    {task.status === 'blocked' && (
                                      <Badge variant="destructive" className="text-xs">
                                        {t('blocked')}
                                      </Badge>
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
                ))}
              </div>
            </>
          )}

          {!session && (
            <div className="text-center py-12">
              <ListChecks size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {language === 'ru' ? 'Начните новую сессию' : 'Start a New Session'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {language === 'ru' 
                  ? 'Создайте разбиение задачи, чтобы начать работу с микро-задачами'
                  : 'Create a task breakdown to start working with micro-tasks'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MicroTaskExecutor;