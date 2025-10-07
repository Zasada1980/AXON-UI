import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  ListChecks,
  Target,
  Warning,
  CheckCircle,
  Clock,
  TrendUp,
  Flag,
  Plus,
  PencilSimple,
  Trash,
  Calendar,
  Users,
  Brain,
  Shield,
  Lightning,
  Eye,
  Gear,
  ChartLine,
  ArrowUp,
  ArrowDown,
  Minus,
  PlayCircle,
  PauseCircle,
  StopCircle
} from '@phosphor-icons/react';

// Типы для системы управления ТЗ
interface Requirement {
  id: string;
  title: string;
  description: string;
  category: 'functional' | 'technical' | 'security' | 'performance' | 'ui-ux' | 'integration';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'not-started' | 'in-progress' | 'blocked' | 'completed' | 'cancelled';
  progress: number;
  estimatedHours: number;
  actualHours: number;
  assignee?: string;
  dueDate?: string;
  dependencies: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  notes: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completionDate?: string;
  progress: number;
  requirements: string[];
  status: 'upcoming' | 'active' | 'completed' | 'delayed';
}

interface Risk {
  id: string;
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  status: 'identified' | 'mitigating' | 'resolved' | 'accepted';
  mitigation: string;
  owner: string;
  createdAt: string;
}

interface ProjectMetrics {
  totalRequirements: number;
  completedRequirements: number;
  overallProgress: number;
  estimatedCompletion: string;
  riskLevel: 'low' | 'medium' | 'high';
  teamVelocity: number;
  blockedRequirements: number;
  criticalRequirements: number;
}

interface ProjectRequirementsTrackerProps {
  language: 'en' | 'ru';
  projectId: string;
  onProgressUpdate: (progress: number) => void;
  onRiskDetected: (risk: Risk) => void;
  onMilestoneReached: (milestone: string) => void;
}

const ProjectRequirementsTracker: React.FC<ProjectRequirementsTrackerProps> = ({
  language,
  projectId,
  onProgressUpdate,
  onRiskDetected,
  onMilestoneReached
}) => {
  // Переводы
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      requirementsTracker: { en: 'Requirements Tracker', ru: 'Трекер Требований' },
      projectRequirements: { en: 'Project Requirements Management', ru: 'Управление Требованиями Проекта' },
      overview: { en: 'Overview', ru: 'Обзор' },
      requirements: { en: 'Requirements', ru: 'Требования' },
      milestones: { en: 'Milestones', ru: 'Вехи' },
      risks: { en: 'Risks', ru: 'Риски' },
      analytics: { en: 'Analytics', ru: 'Аналитика' },
      
      // Статусы
      notStarted: { en: 'Not Started', ru: 'Не Начато' },
      inProgress: { en: 'In Progress', ru: 'В Работе' },
      blocked: { en: 'Blocked', ru: 'Заблокировано' },
      completed: { en: 'Completed', ru: 'Выполнено' },
      cancelled: { en: 'Cancelled', ru: 'Отменено' },
      
      // Приоритеты
      critical: { en: 'Critical', ru: 'Критический' },
      high: { en: 'High', ru: 'Высокий' },
      medium: { en: 'Medium', ru: 'Средний' },
      low: { en: 'Low', ru: 'Низкий' },
      
      // Категории
      functional: { en: 'Functional', ru: 'Функциональные' },
      technical: { en: 'Technical', ru: 'Технические' },
      security: { en: 'Security', ru: 'Безопасность' },
      performance: { en: 'Performance', ru: 'Производительность' },
      uiUx: { en: 'UI/UX', ru: 'UI/UX' },
      integration: { en: 'Integration', ru: 'Интеграция' },
      
      // Действия
      addRequirement: { en: 'Add Requirement', ru: 'Добавить Требование' },
      editRequirement: { en: 'Edit Requirement', ru: 'Редактировать' },
      deleteRequirement: { en: 'Delete Requirement', ru: 'Удалить' },
      createMilestone: { en: 'Create Milestone', ru: 'Создать Веху' },
      addRisk: { en: 'Add Risk', ru: 'Добавить Риск' },
      
      // Метрики
      totalProgress: { en: 'Total Progress', ru: 'Общий Прогресс' },
      completedTasks: { en: 'Completed Tasks', ru: 'Выполненные Задачи' },
      activeRisks: { en: 'Active Risks', ru: 'Активные Риски' },
      upcomingMilestones: { en: 'Upcoming Milestones', ru: 'Предстоящие Вехи' },
      teamVelocity: { en: 'Team Velocity', ru: 'Скорость Команды' },
      
      // Формы
      title: { en: 'Title', ru: 'Название' },
      description: { en: 'Description', ru: 'Описание' },
      category: { en: 'Category', ru: 'Категория' },
      priority: { en: 'Priority', ru: 'Приоритет' },
      status: { en: 'Status', ru: 'Статус' },
      progress: { en: 'Progress', ru: 'Прогресс' },
      estimatedHours: { en: 'Estimated Hours', ru: 'Оценка Часов' },
      actualHours: { en: 'Actual Hours', ru: 'Фактические Часы' },
      assignee: { en: 'Assignee', ru: 'Исполнитель' },
      dueDate: { en: 'Due Date', ru: 'Срок' },
      notes: { en: 'Notes', ru: 'Заметки' },
      save: { en: 'Save', ru: 'Сохранить' },
      cancel: { en: 'Cancel', ru: 'Отмена' }
    };
    return translations[key]?.[language] || key;
  };

  // Состояния
  const [requirements, setRequirements] = useKV<Requirement[]>(`requirements-${projectId}`, []);
  const [milestones, setMilestones] = useKV<Milestone[]>(`milestones-${projectId}`, []);
  const [risks, setRisks] = useKV<Risk[]>(`risks-${projectId}`, []);
  const [metrics, setMetrics] = useState<ProjectMetrics>({
    totalRequirements: 0,
    completedRequirements: 0,
    overallProgress: 0,
    estimatedCompletion: '',
    riskLevel: 'low',
    teamVelocity: 0,
    blockedRequirements: 0,
    criticalRequirements: 0
  });

  // Состояния UI
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddRequirement, setShowAddRequirement] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [showAddRisk, setShowAddRisk] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<Requirement | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Форма нового требования
  const [newRequirement, setNewRequirement] = useState<Partial<Requirement>>({
    title: '',
    description: '',
    category: 'functional',
    priority: 'medium',
    status: 'not-started',
    progress: 0,
    estimatedHours: 8,
    actualHours: 0,
    dependencies: [],
    tags: [],
    notes: ''
  });

  // Автоматическое обновление метрик
  useEffect(() => {
    calculateMetrics();
  }, [requirements, milestones, risks]);

  // Расчет метрик проекта
  const calculateMetrics = () => {
    const total = requirements?.length || 0;
    const completed = requirements?.filter(r => r.status === 'completed').length || 0;
    const blocked = requirements?.filter(r => r.status === 'blocked').length || 0;
    const critical = requirements?.filter(r => r.priority === 'critical').length || 0;
    
    const overallProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Расчет уровня риска
    const activeRisks = risks?.filter(r => r.status !== 'resolved') || [];
    const highRisks = activeRisks.filter(r => r.probability === 'high' || r.impact === 'high');
    const riskLevel = highRisks.length > 0 ? 'high' : activeRisks.length > 2 ? 'medium' : 'low';
    
    // Расчет скорости команды (выполненные за последние 7 дней)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const recentlyCompleted = requirements?.filter(r => 
      r.completedAt && new Date(r.completedAt) > lastWeek
    ).length || 0;
    
    const newMetrics: ProjectMetrics = {
      totalRequirements: total,
      completedRequirements: completed,
      overallProgress,
      estimatedCompletion: calculateEstimatedCompletion(),
      riskLevel,
      teamVelocity: recentlyCompleted,
      blockedRequirements: blocked,
      criticalRequirements: critical
    };
    
    setMetrics(newMetrics);
    onProgressUpdate(overallProgress);
    
    // Проверка рисков и вех
    checkForNewRisks();
    checkMilestones();
  };

  // Расчет ожидаемой даты завершения
  const calculateEstimatedCompletion = (): string => {
    if (!requirements || requirements.length === 0) return '';
    
    const remaining = requirements.filter(r => r.status !== 'completed').length;
    const velocity = metrics.teamVelocity || 1;
    const weeksToComplete = Math.ceil(remaining / velocity);
    
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + (weeksToComplete * 7));
    
    return estimatedDate.toLocaleDateString();
  };

  // Проверка новых рисков
  const checkForNewRisks = () => {
    if (!requirements) return;
    
    // Автоматическое обнаружение рисков
    const blockedTasks = requirements.filter(r => r.status === 'blocked');
    const overdueTasks = requirements.filter(r => 
      r.dueDate && new Date(r.dueDate) < new Date() && r.status !== 'completed'
    );
    
    if (blockedTasks.length > 2) {
      const risk: Risk = {
        id: `auto-risk-${Date.now()}`,
        title: 'Multiple Blocked Tasks',
        description: `${blockedTasks.length} tasks are currently blocked`,
        probability: 'high',
        impact: 'medium',
        status: 'identified',
        mitigation: 'Review and resolve blocking issues',
        owner: 'Project Manager',
        createdAt: new Date().toISOString()
      };
      onRiskDetected(risk);
    }
    
    if (overdueTasks.length > 0) {
      const risk: Risk = {
        id: `auto-risk-overdue-${Date.now()}`,
        title: 'Overdue Tasks Detected',
        description: `${overdueTasks.length} tasks are overdue`,
        probability: 'high',
        impact: 'high',
        status: 'identified',
        mitigation: 'Review task priorities and resource allocation',
        owner: 'Project Manager',
        createdAt: new Date().toISOString()
      };
      onRiskDetected(risk);
    }
  };

  // Проверка достижения вех
  const checkMilestones = () => {
    if (!milestones) return;
    
    milestones.forEach(milestone => {
      if (milestone.status === 'active') {
        const milestoneRequirements = requirements?.filter(r => 
          milestone.requirements.includes(r.id)
        ) || [];
        
        const completedInMilestone = milestoneRequirements.filter(r => 
          r.status === 'completed'
        ).length;
        
        const milestoneProgress = milestoneRequirements.length > 0 
          ? (completedInMilestone / milestoneRequirements.length) * 100 
          : 0;
        
        if (milestoneProgress === 100 && milestone.status === 'active') {
          onMilestoneReached(milestone.title);
          
          // Обновить статус вехи
          setMilestones(current => 
            current?.map(m => 
              m.id === milestone.id 
                ? { ...m, status: 'completed', completionDate: new Date().toISOString() }
                : m
            ) || []
          );
        }
      }
    });
  };

  // Создание нового требования
  const createRequirement = () => {
    if (!newRequirement.title) {
      toast.error('Title is required');
      return;
    }
    
    const requirement: Requirement = {
      id: `req-${Date.now()}`,
      title: newRequirement.title,
      description: newRequirement.description || '',
      category: newRequirement.category as Requirement['category'],
      priority: newRequirement.priority as Requirement['priority'],
      status: 'not-started',
      progress: 0,
      estimatedHours: newRequirement.estimatedHours || 8,
      actualHours: 0,
      dependencies: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: newRequirement.notes || ''
    };
    
    setRequirements(current => [...(current || []), requirement]);
    setNewRequirement({
      title: '',
      description: '',
      category: 'functional',
      priority: 'medium',
      status: 'not-started',
      progress: 0,
      estimatedHours: 8,
      actualHours: 0,
      dependencies: [],
      tags: [],
      notes: ''
    });
    setShowAddRequirement(false);
    
    toast.success(`Requirement created: ${requirement.title}`);
  };

  // Обновление требования
  const updateRequirement = (id: string, updates: Partial<Requirement>) => {
    setRequirements(current => 
      current?.map(r => 
        r.id === id 
          ? { ...r, ...updates, updatedAt: new Date().toISOString() }
          : r
      ) || []
    );
  };

  // Получение иконки для категории
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'functional': return <ListChecks size={16} />;
      case 'technical': return <Gear size={16} />;
      case 'security': return <Shield size={16} />;
      case 'performance': return <Lightning size={16} />;
      case 'ui-ux': return <Eye size={16} />;
      case 'integration': return <Target size={16} />;
      default: return <ListChecks size={16} />;
    }
  };

  // Получение цвета для приоритета
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  // Получение цвета для статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'in-progress': return 'text-blue-500';
      case 'blocked': return 'text-red-500';
      case 'cancelled': return 'text-gray-500';
      default: return 'text-muted-foreground';
    }
  };

  // Фильтрация требований
  const filteredRequirements = requirements?.filter(req => {
    const categoryMatch = filterCategory === 'all' || req.category === filterCategory;
    const statusMatch = filterStatus === 'all' || req.status === filterStatus;
    return categoryMatch && statusMatch;
  }) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks size={24} className="text-primary" />
            {t('requirementsTracker')}
          </CardTitle>
          <CardDescription>
            {t('projectRequirements')}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <ChartLine size={16} />
            {t('overview')}
          </TabsTrigger>
          <TabsTrigger value="requirements" className="flex items-center gap-2">
            <ListChecks size={16} />
            {t('requirements')}
          </TabsTrigger>
          <TabsTrigger value="milestones" className="flex items-center gap-2">
            <Flag size={16} />
            {t('milestones')}
          </TabsTrigger>
          <TabsTrigger value="risks" className="flex items-center gap-2">
            <Warning size={16} />
            {t('risks')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendUp size={16} />
            {t('analytics')}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Метрики */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('totalProgress')}</p>
                    <p className="text-2xl font-bold text-primary">
                      {metrics.overallProgress}%
                    </p>
                  </div>
                  <ChartLine size={24} className="text-primary" />
                </div>
                <Progress value={metrics.overallProgress} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('completedTasks')}</p>
                    <p className="text-2xl font-bold text-green-500">
                      {metrics.completedRequirements}/{metrics.totalRequirements}
                    </p>
                  </div>
                  <CheckCircle size={24} className="text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('teamVelocity')}</p>
                    <p className="text-2xl font-bold text-blue-500">
                      {metrics.teamVelocity}
                    </p>
                  </div>
                  <TrendUp size={24} className="text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('activeRisks')}</p>
                    <p className={`text-2xl font-bold ${
                      metrics.riskLevel === 'high' ? 'text-red-500' :
                      metrics.riskLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {risks?.filter(r => r.status !== 'resolved').length || 0}
                    </p>
                  </div>
                  <Warning size={24} className={
                    metrics.riskLevel === 'high' ? 'text-red-500' :
                    metrics.riskLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'
                  } />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Индикаторы состояния */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Статус Требований</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['not-started', 'in-progress', 'blocked', 'completed'].map(status => {
                    const count = requirements?.filter(r => r.status === status).length || 0;
                    const percentage = metrics.totalRequirements > 0 
                      ? (count / metrics.totalRequirements) * 100 
                      : 0;
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                          <span className="text-sm">{t(status.replace('-', ''))}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{count}</span>
                          <div className="w-16">
                            <Progress value={percentage} className="h-2" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Критические Индикаторы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Warning size={16} className="text-red-500" />
                      <span className="text-sm">Заблокированные задачи</span>
                    </div>
                    <Badge variant={metrics.blockedRequirements > 0 ? 'destructive' : 'secondary'}>
                      {metrics.blockedRequirements}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Flag size={16} className="text-orange-500" />
                      <span className="text-sm">Критические требования</span>
                    </div>
                    <Badge variant={metrics.criticalRequirements > 0 ? 'destructive' : 'secondary'}>
                      {metrics.criticalRequirements}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-blue-500" />
                      <span className="text-sm">Ожидаемое завершение</span>
                    </div>
                    <span className="text-sm font-medium">
                      {metrics.estimatedCompletion || 'TBD'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Requirements Tab */}
        <TabsContent value="requirements" className="space-y-6">
          {/* Фильтры и действия */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Фильтр по категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  <SelectItem value="functional">{t('functional')}</SelectItem>
                  <SelectItem value="technical">{t('technical')}</SelectItem>
                  <SelectItem value="security">{t('security')}</SelectItem>
                  <SelectItem value="performance">{t('performance')}</SelectItem>
                  <SelectItem value="ui-ux">{t('uiUx')}</SelectItem>
                  <SelectItem value="integration">{t('integration')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Фильтр по статусу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="not-started">{t('notStarted')}</SelectItem>
                  <SelectItem value="in-progress">{t('inProgress')}</SelectItem>
                  <SelectItem value="blocked">{t('blocked')}</SelectItem>
                  <SelectItem value="completed">{t('completed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={showAddRequirement} onOpenChange={setShowAddRequirement}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-2" />
                  {t('addRequirement')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('addRequirement')}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">{t('title')}</Label>
                    <Input
                      id="title"
                      value={newRequirement.title || ''}
                      onChange={(e) => setNewRequirement({...newRequirement, title: e.target.value})}
                      placeholder="Введите название требования"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">{t('description')}</Label>
                    <Textarea
                      id="description"
                      value={newRequirement.description || ''}
                      onChange={(e) => setNewRequirement({...newRequirement, description: e.target.value})}
                      placeholder="Подробное описание требования"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">{t('category')}</Label>
                      <Select
                        value={newRequirement.category}
                        onValueChange={(value) => setNewRequirement({...newRequirement, category: value as Requirement['category']})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="functional">{t('functional')}</SelectItem>
                          <SelectItem value="technical">{t('technical')}</SelectItem>
                          <SelectItem value="security">{t('security')}</SelectItem>
                          <SelectItem value="performance">{t('performance')}</SelectItem>
                          <SelectItem value="ui-ux">{t('uiUx')}</SelectItem>
                          <SelectItem value="integration">{t('integration')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="priority">{t('priority')}</Label>
                      <Select
                        value={newRequirement.priority}
                        onValueChange={(value) => setNewRequirement({...newRequirement, priority: value as Requirement['priority']})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">{t('critical')}</SelectItem>
                          <SelectItem value="high">{t('high')}</SelectItem>
                          <SelectItem value="medium">{t('medium')}</SelectItem>
                          <SelectItem value="low">{t('low')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="estimatedHours">{t('estimatedHours')}</Label>
                    <Input
                      id="estimatedHours"
                      type="number"
                      value={newRequirement.estimatedHours || 8}
                      onChange={(e) => setNewRequirement({...newRequirement, estimatedHours: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddRequirement(false)}>
                      {t('cancel')}
                    </Button>
                    <Button onClick={createRequirement}>
                      {t('save')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Список требований */}
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {filteredRequirements.map(requirement => (
                <Card key={requirement.id} className="cursor-pointer hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(requirement.category)}
                          <h4 className="font-medium">{requirement.title}</h4>
                          <Badge variant={getPriorityColor(requirement.priority)}>
                            {t(requirement.priority)}
                          </Badge>
                          <Badge variant="outline">
                            {t(requirement.status.replace('-', ''))}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {requirement.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Прогресс: {requirement.progress}%</span>
                          <span>Оценка: {requirement.estimatedHours}ч</span>
                          <span>Факт: {requirement.actualHours}ч</span>
                          {requirement.dueDate && (
                            <span>Срок: {new Date(requirement.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                        
                        <Progress value={requirement.progress} className="mt-2 h-2" />
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingRequirement(requirement)}
                        >
                          <PencilSimple size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRequirements(current => 
                              current?.filter(r => r.id !== requirement.id) || []
                            );
                            toast.success('Requirement deleted');
                          }}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{t('milestones')}</h3>
            <Button onClick={() => setShowAddMilestone(true)}>
              <Plus size={16} className="mr-2" />
              {t('createMilestone')}
            </Button>
          </div>
          
          <div className="space-y-4">
            {milestones?.map(milestone => (
              <Card key={milestone.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{milestone.title}</h4>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Целевая дата: {new Date(milestone.targetDate).toLocaleDateString()}</span>
                        <span>Требований: {milestone.requirements.length}</span>
                      </div>
                    </div>
                    <Badge variant={
                      milestone.status === 'completed' ? 'default' :
                      milestone.status === 'active' ? 'secondary' :
                      milestone.status === 'delayed' ? 'destructive' : 'outline'
                    }>
                      {milestone.status}
                    </Badge>
                  </div>
                  <Progress value={milestone.progress} className="mt-3 h-2" />
                </CardContent>
              </Card>
            )) || []}
          </div>
        </TabsContent>

        {/* Risks Tab */}
        <TabsContent value="risks" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{t('risks')}</h3>
            <Button onClick={() => setShowAddRisk(true)}>
              <Plus size={16} className="mr-2" />
              {t('addRisk')}
            </Button>
          </div>
          
          <div className="space-y-4">
            {risks?.map(risk => (
              <Card key={risk.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{risk.title}</h4>
                      <p className="text-sm text-muted-foreground">{risk.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant={
                          risk.probability === 'high' ? 'destructive' :
                          risk.probability === 'medium' ? 'default' : 'secondary'
                        }>
                          Вероятность: {risk.probability}
                        </Badge>
                        <Badge variant={
                          risk.impact === 'high' ? 'destructive' :
                          risk.impact === 'medium' ? 'default' : 'secondary'
                        }>
                          Влияние: {risk.impact}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant={
                      risk.status === 'resolved' ? 'default' :
                      risk.status === 'mitigating' ? 'secondary' : 'outline'
                    }>
                      {risk.status}
                    </Badge>
                  </div>
                  {risk.mitigation && (
                    <div className="mt-3 p-2 bg-muted/50 rounded-md">
                      <p className="text-sm"><strong>Митигация:</strong> {risk.mitigation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )) || []}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Тренды Выполнения</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Скорость команды (задач/неделя)</span>
                    <span className="font-medium">{metrics.teamVelocity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Средняя продолжительность задачи</span>
                    <span className="font-medium">
                      {requirements && requirements.length > 0 
                        ? Math.round(
                            requirements.reduce((sum, r) => sum + r.actualHours, 0) / 
                            requirements.filter(r => r.actualHours > 0).length || 1
                          ) 
                        : 0}ч
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Точность оценок</span>
                    <span className="font-medium">
                      {requirements && requirements.length > 0 
                        ? Math.round(
                            (requirements.filter(r => r.actualHours <= r.estimatedHours * 1.2).length / 
                            requirements.filter(r => r.actualHours > 0).length || 1) * 100
                          ) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Распределение по Категориям</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['functional', 'technical', 'security', 'performance', 'ui-ux', 'integration'].map(category => {
                    const count = requirements?.filter(r => r.category === category).length || 0;
                    const percentage = metrics.totalRequirements > 0 
                      ? (count / metrics.totalRequirements) * 100 
                      : 0;
                    
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category)}
                          <span className="text-sm">{t(category.replace('-', ''))}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{count}</span>
                          <div className="w-16">
                            <Progress value={percentage} className="h-2" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectRequirementsTracker;