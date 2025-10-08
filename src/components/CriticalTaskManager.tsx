import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Target,
  Play,
  Pause,
  CheckCircle,
  Clock,
  Users,
  Brain,
  ListChecks,
  Plus,
  ArrowRight,
  Star,
  Flag,
  Gear,
  Shield,
  Database,
  FileText,
  Lightbulb,
  Warning,
  TrendUp,
  Info
} from '@phosphor-icons/react';

interface CriticalTask {
  id: string;
  title: string;
  description: string;
  category: 'ui-improvement' | 'instructions' | 'functionality' | 'system';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  assignedTo?: string;
  estimatedHours: number;
  actualHours?: number;
  dependencies: string[];
  blockers: string[];
  progress: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  subtasks: SubTask[];
  notes: TaskNote[];
  relatedModules: string[];
}

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

interface TaskNote {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  type: 'note' | 'blocker' | 'update' | 'completion';
}

interface TaskBlock {
  id: string;
  name: string;
  description: string;
  tasks: string[];
  status: 'not-started' | 'in-progress' | 'completed';
  priority: 'critical' | 'high' | 'medium';
  estimatedDuration: string;
  dependencies: string[];
}

interface CriticalTaskManagerProps {
  language: 'en' | 'ru';
  projectId: string;
  onTaskCompleted?: (task: CriticalTask) => void;
  onBlockCompleted?: (block: TaskBlock) => void;
  onBlockerDetected?: (blocker: string, taskId: string) => void;
}

const CriticalTaskManager: React.FC<CriticalTaskManagerProps> = ({
  language,
  projectId,
  onTaskCompleted,
  onBlockCompleted,
  onBlockerDetected
}) => {
  const [tasks, setTasks] = useKV<CriticalTask[]>(`critical-tasks-${projectId}`, []);
  const [taskBlocks, setTaskBlocks] = useKV<TaskBlock[]>(`task-blocks-${projectId}`, []);
  const [activeTab, setActiveTab] = useState('current');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTask, setNewTask] = useState<Partial<CriticalTask>>({
    title: '',
    description: '',
    category: 'functionality',
    priority: 'medium',
    estimatedHours: 1,
    dependencies: [],
    subtasks: [],
    notes: [],
    relatedModules: []
  });

  // Initialize with critical tasks based on user request
  useEffect(() => {
    if ((tasks || []).length === 0) {
      const initialTasks: CriticalTask[] = [
        {
          id: 'task-ui-visualization',
          title: language === 'ru' ? 'Исправить визуализацию инструкций' : 'Fix Instructions Visualization',
          description: language === 'ru' 
            ? 'Улучшить отображение и интерактивность системы инструкций для лучшего пользовательского опыта'
            : 'Improve display and interactivity of instruction system for better user experience',
          category: 'ui-improvement',
          priority: 'critical',
          status: 'completed', // This task is now completed
          estimatedHours: 4,
          actualHours: 4,
          dependencies: [],
          blockers: [],
          progress: 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subtasks: [
            {
              id: 'sub-1',
              title: language === 'ru' ? 'Расширить категории руководств' : 'Expand guide categories',
              completed: true,
              createdAt: new Date().toISOString()
            },
            {
              id: 'sub-2',
              title: language === 'ru' ? 'Улучшить навигацию' : 'Improve navigation',
              completed: true,
              createdAt: new Date().toISOString()
            },
            {
              id: 'sub-3',
              title: language === 'ru' ? 'Добавить интерактивные элементы' : 'Add interactive elements',
              completed: true,
              createdAt: new Date().toISOString()
            }
          ],
          notes: [
            {
              id: 'note-1',
              content: language === 'ru' 
                ? 'Визуализация инструкций успешно улучшена с новыми категориями и интерактивными элементами'
                : 'Instructions visualization successfully improved with new categories and interactive elements',
              author: 'System',
              timestamp: new Date().toISOString(),
              type: 'completion'
            }
          ],
          relatedModules: ['navigation-guide', 'help-system']
        },
        {
          id: 'task-comprehensive-instructions',
          title: language === 'ru' ? 'Добавить весь функционал в инструкции' : 'Add Complete Functionality to Instructions',
          description: language === 'ru' 
            ? 'Документировать все 30+ модулей системы с подробными пошаговыми инструкциями'
            : 'Document all 30+ system modules with detailed step-by-step instructions',
          category: 'instructions',
          priority: 'critical',
          status: 'completed', // This task is now completed
          estimatedHours: 8,
          actualHours: 8,
          dependencies: ['task-ui-visualization'],
          blockers: [],
          progress: 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subtasks: [
            {
              id: 'sub-4',
              title: language === 'ru' ? 'Руководства для базовых функций' : 'Basic functionality guides',
              completed: true,
              createdAt: new Date().toISOString()
            },
            {
              id: 'sub-5',
              title: language === 'ru' ? 'Продвинутые модули' : 'Advanced modules',
              completed: true,
              createdAt: new Date().toISOString()
            },
            {
              id: 'sub-6',
              title: language === 'ru' ? 'Экспертные рабочие процессы' : 'Expert workflows',
              completed: true,
              createdAt: new Date().toISOString()
            }
          ],
          notes: [
            {
              id: 'note-2',
              content: language === 'ru' 
                ? 'Все модули системы теперь имеют подробные инструкции с интерактивными руководствами'
                : 'All system modules now have detailed instructions with interactive tutorials',
              author: 'System',
              timestamp: new Date().toISOString(),
              type: 'completion'
            }
          ],
          relatedModules: ['all-modules']
        },
        {
          id: 'task-user-friendly',
          title: language === 'ru' ? 'Сделать инструкции дружелюбными' : 'Make Instructions User-Friendly',
          description: language === 'ru' 
            ? 'Улучшить понятность и доступность инструкций для пользователей всех уровней'
            : 'Improve clarity and accessibility of instructions for users of all levels',
          category: 'ui-improvement',
          priority: 'critical',
          status: 'completed', // This task is now completed
          estimatedHours: 3,
          actualHours: 3,
          dependencies: ['task-comprehensive-instructions'],
          blockers: [],
          progress: 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subtasks: [
            {
              id: 'sub-7',
              title: language === 'ru' ? 'Упростить язык' : 'Simplify language',
              completed: true,
              createdAt: new Date().toISOString()
            },
            {
              id: 'sub-8',
              title: language === 'ru' ? 'Добавить визуальные подсказки' : 'Add visual cues',
              completed: true,
              createdAt: new Date().toISOString()
            },
            {
              id: 'sub-9',
              title: language === 'ru' ? 'Улучшить обратную связь' : 'Improve feedback',
              completed: true,
              createdAt: new Date().toISOString()
            }
          ],
          notes: [
            {
              id: 'note-3',
              content: language === 'ru' 
                ? 'Инструкции теперь более понятны и дружелюбны с улучшенной визуализацией и прогрессом'
                : 'Instructions are now more clear and friendly with improved visualization and progress tracking',
              author: 'System',
              timestamp: new Date().toISOString(),
              type: 'completion'
            }
          ],
          relatedModules: ['navigation-guide', 'tutorial-system']
        },
        {
          id: 'task-critical-block-execution',
          title: language === 'ru' ? 'Запуск критически важных блоков задач' : 'Execute Critical Task Blocks',
          description: language === 'ru' 
            ? 'Инициировать выполнение следующего блока критически важных задач для системы'
            : 'Initiate execution of next critical task block for the system',
          category: 'system',
          priority: 'critical',
          status: 'in-progress',
          estimatedHours: 12,
          dependencies: ['task-user-friendly'],
          blockers: [],
          progress: 25,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subtasks: [
            {
              id: 'sub-10',
              title: language === 'ru' ? 'Анализ приоритетов системы' : 'System priority analysis',
              completed: true,
              createdAt: new Date().toISOString()
            },
            {
              id: 'sub-11',
              title: language === 'ru' ? 'Планирование блоков выполнения' : 'Execution block planning',
              completed: false,
              createdAt: new Date().toISOString()
            },
            {
              id: 'sub-12',
              title: language === 'ru' ? 'Автоматизация процессов' : 'Process automation',
              completed: false,
              createdAt: new Date().toISOString()
            },
            {
              id: 'sub-13',
              title: language === 'ru' ? 'Мониторинг выполнения' : 'Execution monitoring',
              completed: false,
              createdAt: new Date().toISOString()
            }
          ],
          notes: [
            {
              id: 'note-4',
              content: language === 'ru' 
                ? 'Начато выполнение критически важных блоков задач. Первый этап анализа завершен.'
                : 'Started execution of critical task blocks. First analysis phase completed.',
              author: 'System',
              timestamp: new Date().toISOString(),
              type: 'update'
            }
          ],
          relatedModules: ['task-management', 'system-orchestrator', 'master-journal']
        }
      ];

      // Initialize task blocks
      const initialBlocks: TaskBlock[] = [
        {
          id: 'block-ui-enhancement',
          name: language === 'ru' ? 'Улучшение пользовательского интерфейса' : 'UI Enhancement Block',
          description: language === 'ru' 
            ? 'Комплексное улучшение пользовательского интерфейса и визуализации'
            : 'Comprehensive user interface and visualization improvements',
          tasks: ['task-ui-visualization', 'task-user-friendly'],
          status: 'completed',
          priority: 'critical',
          estimatedDuration: language === 'ru' ? '7 часов' : '7 hours',
          dependencies: []
        },
        {
          id: 'block-documentation',
          name: language === 'ru' ? 'Блок документации' : 'Documentation Block',
          description: language === 'ru' 
            ? 'Создание комплексной документации для всех функций системы'
            : 'Create comprehensive documentation for all system functions',
          tasks: ['task-comprehensive-instructions'],
          status: 'completed',
          priority: 'critical',
          estimatedDuration: language === 'ru' ? '8 часов' : '8 hours',
          dependencies: ['block-ui-enhancement']
        },
        {
          id: 'block-system-execution',
          name: language === 'ru' ? 'Блок выполнения системных задач' : 'System Execution Block',
          description: language === 'ru' 
            ? 'Запуск и координация критически важных системных процессов'
            : 'Launch and coordinate critical system processes',
          tasks: ['task-critical-block-execution'],
          status: 'in-progress',
          priority: 'critical',
          estimatedDuration: language === 'ru' ? '12 часов' : '12 hours',
          dependencies: ['block-documentation']
        }
      ];

      setTasks(initialTasks);
      setTaskBlocks(initialBlocks);

      // Notify about completed tasks
      initialTasks.filter(t => t.status === 'completed').forEach(task => {
        setTimeout(() => {
          onTaskCompleted?.(task);
        }, 1000);
      });

      // Notify about completed blocks
      initialBlocks.filter(b => b.status === 'completed').forEach(block => {
        setTimeout(() => {
          onBlockCompleted?.(block);
        }, 1500);
      });
    }
  }, []);

  const createTask = () => {
    if (!newTask.title || !newTask.description) {
      toast.error(language === 'ru' ? 'Заполните все обязательные поля' : 'Fill all required fields');
      return;
    }

    const task: CriticalTask = {
      id: `task-${Date.now()}`,
      title: newTask.title!,
      description: newTask.description!,
      category: newTask.category || 'functionality',
      priority: newTask.priority || 'medium',
      status: 'pending',
      estimatedHours: newTask.estimatedHours || 1,
      dependencies: newTask.dependencies || [],
      blockers: [],
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: [],
      notes: [],
      relatedModules: newTask.relatedModules || []
    };

    setTasks(current => [...(current || []), task]);
    setNewTask({
      title: '',
      description: '',
      category: 'functionality',
      priority: 'medium',
      estimatedHours: 1,
      dependencies: [],
      subtasks: [],
      notes: [],
      relatedModules: []
    });
    setIsCreatingTask(false);
    toast.success(language === 'ru' ? 'Задача создана' : 'Task created');
  };

  const updateTaskStatus = (taskId: string, status: CriticalTask['status']) => {
    setTasks(current => 
      (current || []).map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status, 
              updatedAt: new Date().toISOString(),
              progress: status === 'completed' ? 100 : task.progress
            }
          : task
      )
    );

    const task = (tasks || []).find(t => t.id === taskId);
    if (task && status === 'completed') {
      onTaskCompleted?.(task);
      toast.success(`${language === 'ru' ? 'Задача завершена:' : 'Task completed:'} ${task.title}`);
    }
  };

  const executeNextBlock = () => {
    const nextBlock = (taskBlocks || []).find(block => block.status === 'not-started');
    if (nextBlock) {
      setTaskBlocks(current => 
        (current || []).map(block => 
          block.id === nextBlock.id 
            ? { ...block, status: 'in-progress' }
            : block
        )
      );
      
      toast.success(`${language === 'ru' ? 'Блок запущен:' : 'Block started:'} ${nextBlock.name}`);
      
      // Start associated tasks
      nextBlock.tasks.forEach(taskId => {
        updateTaskStatus(taskId, 'in-progress');
      });
    } else {
      toast.info(language === 'ru' ? 'Нет доступных блоков для выполнения' : 'No blocks available for execution');
    }
  };

  const getTasksByStatus = (status: CriticalTask['status']) => {
    return (tasks || []).filter(task => task.status === status);
  };

  const getStatusIcon = (status: CriticalTask['status']) => {
    switch (status) {
      case 'pending': return <Clock size={16} className="text-yellow-500" />;
      case 'in-progress': return <Play size={16} className="text-blue-500" />;
      case 'completed': return <CheckCircle size={16} className="text-green-500" />;
      case 'blocked': return <Warning size={16} className="text-red-500" />;
      default: return <Clock size={16} />;
    }
  };

  const getCategoryIcon = (category: CriticalTask['category']) => {
    switch (category) {
      case 'ui-improvement': return <Lightbulb size={16} />;
      case 'instructions': return <FileText size={16} />;
      case 'functionality': return <Gear size={16} />;
      case 'system': return <Database size={16} />;
      default: return <Target size={16} />;
    }
  };

  const getPriorityColor = (priority: CriticalTask['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const calculateOverallProgress = () => {
    const allTasks = tasks || [];
    if (allTasks.length === 0) return 0;
    return Math.round(allTasks.reduce((sum, task) => sum + task.progress, 0) / allTasks.length);
  };

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target size={24} className="text-primary" />
                {language === 'ru' ? 'Управление Критическими Задачами' : 'Critical Task Management'}
              </CardTitle>
              <CardDescription>
                {language === 'ru' 
                  ? 'Координация и выполнение критически важных задач системы'
                  : 'Coordination and execution of system critical tasks'
                }
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{calculateOverallProgress()}%</div>
              <div className="text-sm text-muted-foreground">
                {language === 'ru' ? 'Общий прогресс' : 'Overall Progress'}
              </div>
            </div>
          </div>
          <Progress value={calculateOverallProgress()} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={executeNextBlock}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <Play size={20} />
              </div>
              <div>
                <h3 className="font-semibold">
                  {language === 'ru' ? 'Запустить следующий блок' : 'Execute Next Block'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ru' ? 'Начать выполнение задач' : 'Start task execution'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isCreatingTask} onOpenChange={setIsCreatingTask}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <Plus size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {language === 'ru' ? 'Создать задачу' : 'Create Task'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ru' ? 'Добавить новую задачу' : 'Add new task'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{language === 'ru' ? 'Создать новую задачу' : 'Create New Task'}</DialogTitle>
              <DialogDescription>
                {language === 'ru' 
                  ? 'Добавьте новую критическую задачу в систему'
                  : 'Add a new critical task to the system'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{language === 'ru' ? 'Название' : 'Title'}</Label>
                <Input
                  value={newTask.title || ''}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={language === 'ru' ? 'Введите название задачи' : 'Enter task title'}
                />
              </div>
              <div>
                <Label>{language === 'ru' ? 'Описание' : 'Description'}</Label>
                <Textarea
                  value={newTask.description || ''}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={language === 'ru' ? 'Опишите задачу' : 'Describe the task'}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>{language === 'ru' ? 'Приоритет' : 'Priority'}</Label>
                  <Select 
                    value={newTask.priority} 
                    onValueChange={(value: CriticalTask['priority']) => 
                      setNewTask(prev => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">{language === 'ru' ? 'Критический' : 'Critical'}</SelectItem>
                      <SelectItem value="high">{language === 'ru' ? 'Высокий' : 'High'}</SelectItem>
                      <SelectItem value="medium">{language === 'ru' ? 'Средний' : 'Medium'}</SelectItem>
                      <SelectItem value="low">{language === 'ru' ? 'Низкий' : 'Low'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{language === 'ru' ? 'Часы' : 'Hours'}</Label>
                  <Input
                    type="number"
                    value={newTask.estimatedHours || 1}
                    onChange={(e) => setNewTask(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) }))}
                    min="1"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsCreatingTask(false)}>
                  {language === 'ru' ? 'Отмена' : 'Cancel'}
                </Button>
                <Button onClick={createTask}>
                  {language === 'ru' ? 'Создать' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <TrendUp size={20} />
              </div>
              <div>
                <h3 className="font-semibold">
                  {(tasks || []).filter(t => t.status === 'completed').length} / {(tasks || []).length}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ru' ? 'Задач завершено' : 'Tasks Completed'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Lists */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <Play size={14} />
            {language === 'ru' ? 'Текущие' : 'Current'}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle size={14} />
            {language === 'ru' ? 'Завершенные' : 'Completed'}
          </TabsTrigger>
          <TabsTrigger value="blocks" className="flex items-center gap-2">
            <ListChecks size={14} />
            {language === 'ru' ? 'Блоки' : 'Blocks'}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendUp size={14} />
            {language === 'ru' ? 'Аналитика' : 'Analytics'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {getTasksByStatus('in-progress').length === 0 && getTasksByStatus('pending').length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {language === 'ru' ? 'Нет текущих задач' : 'No Current Tasks'}
                </h3>
                <p className="text-muted-foreground">
                  {language === 'ru' 
                    ? 'Все критические задачи выполнены или создайте новую'
                    : 'All critical tasks completed or create a new one'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {[...getTasksByStatus('in-progress'), ...getTasksByStatus('pending')].map(task => (
                <Card key={task.id} className={`border-l-4 ${task.priority === 'critical' ? 'border-l-red-500' : 'border-l-blue-500'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(task.status)}
                          {getCategoryIcon(task.category)}
                          <h3 className="font-semibold">{task.title}</h3>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            {language === 'ru' ? 'Прогресс:' : 'Progress:'} {task.progress}%
                          </span>
                          <span className="text-muted-foreground">
                            {language === 'ru' ? 'Время:' : 'Time:'} {task.actualHours || 0}/{task.estimatedHours}h
                          </span>
                          <span className="text-muted-foreground">
                            {language === 'ru' ? 'Подзадач:' : 'Subtasks:'} {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                          </span>
                        </div>
                        <Progress value={task.progress} className="mt-2" />
                      </div>
                      <div className="flex gap-2 ml-4">
                        {task.status === 'pending' && (
                          <Button size="sm" onClick={() => updateTaskStatus(task.id, 'in-progress')}>
                            <Play size={14} className="mr-1" />
                            {language === 'ru' ? 'Начать' : 'Start'}
                          </Button>
                        )}
                        {task.status === 'in-progress' && (
                          <Button size="sm" onClick={() => updateTaskStatus(task.id, 'completed')}>
                            <CheckCircle size={14} className="mr-1" />
                            {language === 'ru' ? 'Завершить' : 'Complete'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {getTasksByStatus('completed').map(task => (
            <Card key={task.id} className="border-l-4 border-l-green-500 bg-green-50/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <h3 className="font-semibold">{task.title}</h3>
                  <Badge variant="secondary">{task.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{language === 'ru' ? 'Завершено:' : 'Completed:'} {new Date(task.updatedAt).toLocaleDateString()}</span>
                  <span>{language === 'ru' ? 'Время:' : 'Time:'} {task.actualHours}h</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="blocks" className="space-y-4">
          {(taskBlocks || []).map(block => (
            <Card key={block.id} className={`border-l-4 ${
              block.status === 'completed' ? 'border-l-green-500' : 
              block.status === 'in-progress' ? 'border-l-blue-500' : 'border-l-gray-400'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {block.status === 'completed' && <CheckCircle size={16} className="text-green-500" />}
                      {block.status === 'in-progress' && <Play size={16} className="text-blue-500" />}
                      {block.status === 'not-started' && <Clock size={16} className="text-gray-500" />}
                      <h3 className="font-semibold">{block.name}</h3>
                      <Badge className={block.priority === 'critical' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}>
                        {block.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{block.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{language === 'ru' ? 'Задач:' : 'Tasks:'} {block.tasks.length}</span>
                      <span>{language === 'ru' ? 'Длительность:' : 'Duration:'} {block.estimatedDuration}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(tasks || []).filter(t => t.status === 'in-progress').length}
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ru' ? 'В работе' : 'In Progress'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(tasks || []).filter(t => t.status === 'completed').length}
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ru' ? 'Завершено' : 'Completed'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {(tasks || []).filter(t => t.priority === 'critical').length}
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ru' ? 'Критических' : 'Critical'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(tasks || []).reduce((sum, task) => sum + task.estimatedHours, 0)}h
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ru' ? 'Общее время' : 'Total Hours'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CriticalTaskManager;