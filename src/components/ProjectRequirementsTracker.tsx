import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  CheckCircle,
  Circle,
  Warning,
  Clock,
  Target,
  TrendUp,
  TrendDown,
  Calendar,
  Users,
  FileText,
  Bug,
  Lightbulb,
  Shield,
  Gear,
  Plus,
  PencilSimple,
  Trash,
  Play,
  Pause,
  ArrowCounterClockwise,
  ChartBar,
  ChartPie,
  Activity,
  Medal,
  WarningCircle,
  CheckSquare,
  Eye,
  Lightning,
  Star
} from '@phosphor-icons/react';

// Declare global spark object
declare global {
  interface Window {
    spark: {
      llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string;
      llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>;
    };
  }
}

const spark = (globalThis as any).spark;

// Типы данных для ТЗ
interface RequirementItem {
  id: string;
  title: string;
  description: string;
  category: 'core' | 'feature' | 'integration' | 'testing' | 'optimization' | 'documentation';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'testing' | 'review';
  progress: number;
  estimatedHours: number;
  actualHours: number;
  assignee?: string;
  dependencies: string[];
  risks: RiskItem[];
  startDate?: string;
  dueDate?: string;
  completedDate?: string;
  notes: string[];
  tags: string[];
}

interface RiskItem {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-100%
  impact: string;
  mitigation: string;
  status: 'identified' | 'mitigating' | 'resolved' | 'accepted';
}

interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  startDate?: string;
  endDate?: string;
}

interface ProjectMetrics {
  totalRequirements: number;
  completedRequirements: number;
  overallProgress: number;
  criticalRisks: number;
  blockedTasks: number;
  averageVelocity: number;
  estimatedCompletion: string;
  burndownData: { date: string; remaining: number; ideal: number }[];
}

// Языковая поддержка
type Language = 'en' | 'ru';

interface Translations {
  [key: string]: {
    en: string;
    ru: string;
  };
}

const translations: Translations = {
  requirementsTracker: { en: 'Requirements Tracker', ru: 'Трекер Технических Требований' },
  projectRequirements: { en: 'Project Requirements', ru: 'Техническое Задание Проекта' },
  overallProgress: { en: 'Overall Progress', ru: 'Общий Прогресс' },
  completedTasks: { en: 'Completed Tasks', ru: 'Выполненные Задачи' },
  activeRisks: { en: 'Active Risks', ru: 'Активные Риски' },
  blockedTasks: { en: 'Blocked Tasks', ru: 'Заблокированные Задачи' },
  averageVelocity: { en: 'Average Velocity', ru: 'Средняя Скорость' },
  estimatedCompletion: { en: 'Estimated Completion', ru: 'Расчетное Завершение' },
  
  // Статусы
  notStarted: { en: 'Not Started', ru: 'Не Начато' },
  inProgress: { en: 'In Progress', ru: 'В Работе' },
  completed: { en: 'Completed', ru: 'Завершено' },
  blocked: { en: 'Blocked', ru: 'Заблокировано' },
  testing: { en: 'Testing', ru: 'Тестирование' },
  review: { en: 'Review', ru: 'Проверка' },
  
  // Приоритеты
  critical: { en: 'Critical', ru: 'Критический' },
  high: { en: 'High', ru: 'Высокий' },
  medium: { en: 'Medium', ru: 'Средний' },
  low: { en: 'Low', ru: 'Низкий' },
  
  // Категории
  core: { en: 'Core', ru: 'Ядро' },
  feature: { en: 'Feature', ru: 'Функция' },
  integration: { en: 'Integration', ru: 'Интеграция' },
  optimization: { en: 'Optimization', ru: 'Оптимизация' },
  documentation: { en: 'Documentation', ru: 'Документация' },
  
  // Риски
  riskSeverity: { en: 'Risk Severity', ru: 'Уровень Риска' },
  identified: { en: 'Identified', ru: 'Выявлен' },
  mitigating: { en: 'Mitigating', ru: 'Устраняется' },
  resolved: { en: 'Resolved', ru: 'Решен' },
  accepted: { en: 'Accepted', ru: 'Принят' },
  
  // Действия
  addRequirement: { en: 'Add Requirement', ru: 'Добавить Требование' },
  editRequirement: { en: 'Edit Requirement', ru: 'Редактировать Требование' },
  deleteRequirement: { en: 'Delete Requirement', ru: 'Удалить Требование' },
  updateStatus: { en: 'Update Status', ru: 'Обновить Статус' },
  viewDetails: { en: 'View Details', ru: 'Подробности' },
  generateReport: { en: 'Generate Report', ru: 'Создать Отчет' },
  
  // Вкладки
  dashboard: { en: 'Dashboard', ru: 'Панель' },
  requirements: { en: 'Requirements', ru: 'Требования' },
  phases: { en: 'Phases', ru: 'Этапы' },
  risks: { en: 'Risks', ru: 'Риски' },
  analytics: { en: 'Analytics', ru: 'Аналитика' },
  
  // Формы
  title: { en: 'Title', ru: 'Название' },
  description: { en: 'Description', ru: 'Описание' },
  category: { en: 'Category', ru: 'Категория' },
  priority: { en: 'Priority', ru: 'Приоритет' },
  status: { en: 'Status', ru: 'Статус' },
  progress: { en: 'Progress', ru: 'Прогресс' },
  estimatedHours: { en: 'Estimated Hours', ru: 'Планируемые Часы' },
  actualHours: { en: 'Actual Hours', ru: 'Фактические Часы' },
  assignee: { en: 'Assignee', ru: 'Исполнитель' },
  dueDate: { en: 'Due Date', ru: 'Срок' },
  notes: { en: 'Notes', ru: 'Заметки' },
  tags: { en: 'Tags', ru: 'Теги' },
  
  // Сообщения
  requirementAdded: { en: 'Requirement added successfully', ru: 'Требование успешно добавлено' },
  requirementUpdated: { en: 'Requirement updated successfully', ru: 'Требование успешно обновлено' },
  requirementDeleted: { en: 'Requirement deleted successfully', ru: 'Требование успешно удалено' },
  statusUpdated: { en: 'Status updated successfully', ru: 'Статус успешно обновлен' },
  reportGenerated: { en: 'Report generated successfully', ru: 'Отчет успешно создан' },
};

interface ProjectRequirementsTrackerProps {
  language: Language;
  projectId: string;
  onProgressUpdate?: (progress: number) => void;
  onRiskDetected?: (risk: RiskItem) => void;
  onMilestoneReached?: (milestone: string) => void;
}

const ProjectRequirementsTracker: React.FC<ProjectRequirementsTrackerProps> = ({
  language,
  projectId,
  onProgressUpdate,
  onRiskDetected,
  onMilestoneReached
}) => {
  const t = (key: string): string => translations[key]?.[language] || key;

  // Состояние компонента
  const [requirements, setRequirements] = useKV<RequirementItem[]>(`requirements-${projectId}`, []);
  const [phases, setPhases] = useKV<ProjectPhase[]>(`phases-${projectId}`, []);
  const [metrics, setMetrics] = useState<ProjectMetrics>({
    totalRequirements: 0,
    completedRequirements: 0,
    overallProgress: 0,
    criticalRisks: 0,
    blockedTasks: 0,
    averageVelocity: 0,
    estimatedCompletion: '',
    burndownData: []
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedRequirement, setSelectedRequirement] = useState<RequirementItem | null>(null);
  const [isAddingRequirement, setIsAddingRequirement] = useState(false);
  const [isEditingRequirement, setIsEditingRequirement] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Форма для добавления/редактирования требований
  const [formData, setFormData] = useState<Partial<RequirementItem>>({
    title: '',
    description: '',
    category: 'feature',
    priority: 'medium',
    status: 'not_started',
    progress: 0,
    estimatedHours: 0,
    actualHours: 0,
    assignee: '',
    dependencies: [],
    risks: [],
    notes: [],
    tags: []
  });

  // Инициализация базовых требований проекта
  useEffect(() => {
    if (requirements?.length === 0) {
      initializeDefaultRequirements();
    }
  }, []);

  // Обновление метрик при изменении требований
  useEffect(() => {
    updateMetrics();
  }, [requirements]);

  // Автоматическое обновление прогресса
  useEffect(() => {
    const interval = setInterval(() => {
      updateAutomaticProgress();
    }, 30000); // Каждые 30 секунд

    return () => clearInterval(interval);
  }, [requirements]);

  const initializeDefaultRequirements = () => {
    const defaultRequirements: RequirementItem[] = [
      {
        id: 'req-1',
        title: language === 'ru' ? 'Архитектура системы AXON' : 'AXON System Architecture',
        description: language === 'ru' 
          ? 'Проектирование и реализация базовой архитектуры платформы анализа данных'
          : 'Design and implementation of the basic data analysis platform architecture',
        category: 'core',
        priority: 'critical',
        status: 'completed',
        progress: 100,
        estimatedHours: 80,
        actualHours: 75,
        assignee: 'Architecture Team',
        dependencies: [],
        risks: [],
        startDate: '2024-01-01',
        dueDate: '2024-01-15',
        completedDate: '2024-01-14',
        notes: [],
        tags: ['architecture', 'core', 'foundation']
      },
      {
        id: 'req-2',
        title: language === 'ru' ? 'Протокол Киплинга' : 'Kipling Protocol Implementation',
        description: language === 'ru'
          ? 'Реализация системы анализа по 6 измерениям (Кто, Что, Когда, Где, Почему, Как)'
          : 'Implementation of 6-dimension analysis system (Who, What, When, Where, Why, How)',
        category: 'feature',
        priority: 'high',
        status: 'completed',
        progress: 100,
        estimatedHours: 60,
        actualHours: 58,
        assignee: 'Analysis Team',
        dependencies: ['req-1'],
        risks: [],
        startDate: '2024-01-15',
        dueDate: '2024-01-30',
        completedDate: '2024-01-28',
        notes: [],
        tags: ['kipling', 'analysis', 'dimensions']
      },
      {
        id: 'req-3',
        title: language === 'ru' ? 'Директива IKR' : 'IKR Directive System',
        description: language === 'ru'
          ? 'Реализация системы Intelligence-Knowledge-Reasoning для стратегического анализа'
          : 'Implementation of Intelligence-Knowledge-Reasoning system for strategic analysis',
        category: 'feature',
        priority: 'high',
        status: 'completed',
        progress: 100,
        estimatedHours: 50,
        actualHours: 52,
        assignee: 'Analysis Team',
        dependencies: ['req-1'],
        risks: [],
        startDate: '2024-01-20',
        dueDate: '2024-02-05',
        completedDate: '2024-02-03',
        notes: [],
        tags: ['ikr', 'intelligence', 'reasoning']
      },
      {
        id: 'req-4',
        title: language === 'ru' ? 'ИИ Агенты Аудита' : 'AI Audit Agents',
        description: language === 'ru'
          ? 'Система ИИ агентов для автоматического аудита безопасности, предвзятости и производительности'
          : 'AI agent system for automated security, bias, and performance auditing',
        category: 'feature',
        priority: 'high',
        status: 'in_progress',
        progress: 85,
        estimatedHours: 70,
        actualHours: 65,
        assignee: 'AI Team',
        dependencies: ['req-1'],
        risks: [
          {
            id: 'risk-1',
            description: 'API rate limits affecting audit performance',
            severity: 'medium',
            probability: 40,
            impact: 'Slower audit execution',
            mitigation: 'Implement request throttling and caching',
            status: 'mitigating'
          }
        ],
        startDate: '2024-01-25',
        dueDate: '2024-02-15',
        notes: [],
        tags: ['ai', 'audit', 'security', 'performance']
      },
      {
        id: 'req-5',
        title: language === 'ru' ? 'Система Дебатов Агентов' : 'Agent Debate System',
        description: language === 'ru'
          ? 'Многоагентная система для проведения дебатов и консенсусного анализа'
          : 'Multi-agent system for conducting debates and consensus analysis',
        category: 'feature',
        priority: 'medium',
        status: 'in_progress',
        progress: 60,
        estimatedHours: 45,
        actualHours: 30,
        assignee: 'AI Team',
        dependencies: ['req-4'],
        risks: [],
        startDate: '2024-02-01',
        dueDate: '2024-02-20',
        notes: [],
        tags: ['debate', 'consensus', 'multi-agent']
      },
      {
        id: 'req-6',
        title: language === 'ru' ? 'Система Выполнения Задач' : 'Task Execution System',
        description: language === 'ru'
          ? 'Пошаговая система выполнения задач с мониторингом и восстановлением'
          : 'Step-by-step task execution system with monitoring and recovery',
        category: 'core',
        priority: 'high',
        status: 'in_progress',
        progress: 75,
        estimatedHours: 55,
        actualHours: 45,
        assignee: 'Execution Team',
        dependencies: ['req-1'],
        risks: [],
        startDate: '2024-02-05',
        dueDate: '2024-02-25',
        notes: [],
        tags: ['execution', 'monitoring', 'recovery']
      },
      {
        id: 'req-7',
        title: language === 'ru' ? 'ИИ Чат Помощник' : 'AI Chat Assistant',
        description: language === 'ru'
          ? 'Интеллектуальный чат помощник для взаимодействия с данными анализа'
          : 'Intelligent chat assistant for interacting with analysis data',
        category: 'feature',
        priority: 'medium',
        status: 'in_progress',
        progress: 70,
        estimatedHours: 40,
        actualHours: 35,
        assignee: 'AI Team',
        dependencies: ['req-2', 'req-3'],
        risks: [],
        startDate: '2024-02-10',
        dueDate: '2024-03-01',
        notes: [],
        tags: ['chat', 'ai', 'assistant', 'interaction']
      },
      {
        id: 'req-8',
        title: language === 'ru' ? 'Система Диагностики' : 'Diagnostics System',
        description: language === 'ru'
          ? 'Комплексная система диагностики, мониторинга ошибок и автоматического восстановления'
          : 'Comprehensive diagnostics, error monitoring, and automatic recovery system',
        category: 'core',
        priority: 'high',
        status: 'in_progress',
        progress: 80,
        estimatedHours: 65,
        actualHours: 55,
        assignee: 'Infrastructure Team',
        dependencies: ['req-1'],
        risks: [
          {
            id: 'risk-2',
            description: 'Complex system interactions affecting diagnostics accuracy',
            severity: 'medium',
            probability: 30,
            impact: 'False positive/negative diagnostic results',
            mitigation: 'Implement comprehensive testing and validation',
            status: 'identified'
          }
        ],
        startDate: '2024-02-08',
        dueDate: '2024-03-05',
        notes: [],
        tags: ['diagnostics', 'monitoring', 'recovery', 'health']
      },
      {
        id: 'req-9',
        title: language === 'ru' ? 'Система Управления Файлами' : 'File Management System',
        description: language === 'ru'
          ? 'Загрузка, анализ и управление файлами различных форматов'
          : 'Upload, analysis, and management of various file formats',
        category: 'feature',
        priority: 'medium',
        status: 'not_started',
        progress: 0,
        estimatedHours: 35,
        actualHours: 0,
        assignee: 'Backend Team',
        dependencies: ['req-1'],
        risks: [],
        startDate: '2024-02-20',
        dueDate: '2024-03-10',
        notes: [],
        tags: ['files', 'upload', 'analysis', 'management']
      },
      {
        id: 'req-10',
        title: language === 'ru' ? 'Система Уведомлений' : 'Notification System',
        description: language === 'ru'
          ? 'Централизованная система уведомлений о событиях, задачах и рисках'
          : 'Centralized notification system for events, tasks, and risks',
        category: 'feature',
        priority: 'low',
        status: 'not_started',
        progress: 0,
        estimatedHours: 25,
        actualHours: 0,
        assignee: 'Frontend Team',
        dependencies: ['req-1'],
        risks: [],
        startDate: '2024-03-01',
        dueDate: '2024-03-15',
        notes: [],
        tags: ['notifications', 'events', 'alerts']
      }
    ];

    setRequirements(defaultRequirements);
  };

  const updateMetrics = () => {
    if (!requirements) return;

    const total = requirements.length;
    const completed = requirements.filter(req => req.status === 'completed').length;
    const overallProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
    const criticalRisks = requirements.reduce((count, req) => 
      count + req.risks.filter(risk => risk.severity === 'critical' && risk.status !== 'resolved').length, 0
    );
    const blocked = requirements.filter(req => req.status === 'blocked').length;

    // Расчет средней скорости (завершенные задачи за неделю)
    const completedThisWeek = requirements.filter(req => {
      if (!req.completedDate) return false;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(req.completedDate) >= weekAgo;
    }).length;

    // Расчет ожидаемой даты завершения
    const remaining = total - completed;
    const velocity = completedThisWeek || 1; // Минимум 1, чтобы избежать деления на ноль
    const weeksToComplete = Math.ceil(remaining / velocity);
    const estimatedCompletion = new Date();
    estimatedCompletion.setDate(estimatedCompletion.getDate() + (weeksToComplete * 7));

    // Генерация данных burndown chart
    const burndownData = generateBurndownData();

    const newMetrics: ProjectMetrics = {
      totalRequirements: total,
      completedRequirements: completed,
      overallProgress,
      criticalRisks,
      blockedTasks: blocked,
      averageVelocity: completedThisWeek,
      estimatedCompletion: estimatedCompletion.toLocaleDateString(),
      burndownData
    };

    setMetrics(newMetrics);

    // Уведомления о прогрессе
    if (onProgressUpdate) {
      onProgressUpdate(overallProgress);
    }

    // Проверка достижения этапов
    checkMilestones(overallProgress);
  };

  const generateBurndownData = (): { date: string; remaining: number; ideal: number }[] => {
    const data: { date: string; remaining: number; ideal: number }[] = [];
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-03-31');
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalRequirements = requirements?.length || 0;

    for (let i = 0; i <= totalDays; i += 7) { // Еженедельные точки
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const ideal = totalRequirements - (totalRequirements * i / totalDays);
      const actual = calculateActualRemaining(currentDate);
      
      data.push({
        date: currentDate.toISOString().split('T')[0],
        remaining: Math.max(0, actual),
        ideal: Math.max(0, Math.round(ideal))
      });
    }

    return data;
  };

  const calculateActualRemaining = (date: Date) => {
    if (!requirements) return 0;
    
    return requirements.filter(req => {
      if (req.status === 'completed' && req.completedDate) {
        return new Date(req.completedDate) > date;
      }
      return req.status !== 'completed';
    }).length;
  };

  const checkMilestones = (progress: number) => {
    const milestones = [25, 50, 75, 90, 100];
    const currentMilestone = milestones.find(milestone => 
      progress >= milestone && progress < milestone + 5
    );

    if (currentMilestone && onMilestoneReached) {
      onMilestoneReached(`${currentMilestone}% completion milestone reached`);
    }
  };

  const updateAutomaticProgress = async () => {
    if (!requirements) return;

    // Автоматическое обновление прогресса на основе времени и активности
    const updatedRequirements = requirements.map(req => {
      if (req.status === 'in_progress') {
        // Симуляция прогресса для задач в работе
        const timeProgress = calculateTimeProgress(req);
        const newProgress = Math.min(95, Math.max(req.progress, timeProgress));
        
        return { ...req, progress: newProgress };
      }
      return req;
    });

    setRequirements(updatedRequirements);
  };

  const calculateTimeProgress = (requirement: RequirementItem) => {
    if (!requirement.startDate || !requirement.dueDate) return requirement.progress;

    const start = new Date(requirement.startDate).getTime();
    const end = new Date(requirement.dueDate).getTime();
    const now = new Date().getTime();

    if (now < start) return 0;
    if (now > end) return 90; // Максимум 90% для просроченных задач

    const elapsed = now - start;
    const total = end - start;
    const timeProgress = (elapsed / total) * 100;

    return Math.round(timeProgress);
  };

  const handleAddRequirement = () => {
    if (!formData.title || !formData.description) {
      toast.error(language === 'ru' ? 'Заполните обязательные поля' : 'Fill in required fields');
      return;
    }

    const newRequirement: RequirementItem = {
      id: `req-${Date.now()}`,
      title: formData.title!,
      description: formData.description!,
      category: formData.category as RequirementItem['category'] || 'feature',
      priority: formData.priority as RequirementItem['priority'] || 'medium',
      status: formData.status as RequirementItem['status'] || 'not_started',
      progress: formData.progress || 0,
      estimatedHours: formData.estimatedHours || 0,
      actualHours: formData.actualHours || 0,
      assignee: formData.assignee || '',
      dependencies: formData.dependencies || [],
      risks: formData.risks || [],
      startDate: formData.startDate,
      dueDate: formData.dueDate,
      notes: formData.notes || [],
      tags: formData.tags || []
    };

    setRequirements(current => [...(current || []), newRequirement]);
    setFormData({});
    setIsAddingRequirement(false);
    toast.success(t('requirementAdded'));
  };

  const handleUpdateStatus = (id: string, status: RequirementItem['status'], progress?: number) => {
    setRequirements(current => 
      (current || []).map(req => {
        if (req.id === id) {
          const updatedReq = { 
            ...req, 
            status,
            progress: progress !== undefined ? progress : (status === 'completed' ? 100 : req.progress)
          };
          
          if (status === 'completed') {
            updatedReq.completedDate = new Date().toISOString();
          }
          
          return updatedReq;
        }
        return req;
      })
    );
    toast.success(t('statusUpdated'));
  };

  const getStatusIcon = (status: RequirementItem['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-500" size={16} />;
      case 'in_progress': return <Activity className="text-blue-500" size={16} />;
      case 'blocked': return <WarningCircle className="text-red-500" size={16} />;
      case 'testing': return <Bug className="text-yellow-500" size={16} />;
      case 'review': return <Eye className="text-purple-500" size={16} />;
      default: return <Circle className="text-gray-500" size={16} />;
    }
  };

  const getPriorityColor = (priority: RequirementItem['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: RequirementItem['category']) => {
    switch (category) {
      case 'core': return <Gear size={16} />;
      case 'feature': return <Lightbulb size={16} />;
      case 'integration': return <Lightning size={16} />;
      case 'testing': return <Bug size={16} />;
      case 'optimization': return <TrendUp size={16} />;
      case 'documentation': return <FileText size={16} />;
      default: return <Circle size={16} />;
    }
  };

  const getRiskSeverityColor = (severity: RiskItem['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredRequirements = (requirements || []).filter(req => {
    const categoryMatch = filterCategory === 'all' || req.category === filterCategory;
    const statusMatch = filterStatus === 'all' || req.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t('requirementsTracker')}</h2>
          <p className="text-muted-foreground">{t('projectRequirements')}</p>
        </div>
        <Button onClick={() => setIsAddingRequirement(true)}>
          <Plus size={16} className="mr-2" />
          {t('addRequirement')}
        </Button>
      </div>

      {/* Основная навигация */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <ChartBar size={16} />
            {t('dashboard')}
          </TabsTrigger>
          <TabsTrigger value="requirements" className="flex items-center gap-2">
            <CheckSquare size={16} />
            {t('requirements')}
          </TabsTrigger>
          <TabsTrigger value="phases" className="flex items-center gap-2">
            <Target size={16} />
            {t('phases')}
          </TabsTrigger>
          <TabsTrigger value="risks" className="flex items-center gap-2">
            <Warning size={16} />
            {t('risks')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <ChartPie size={16} />
            {t('analytics')}
          </TabsTrigger>
        </TabsList>

        {/* Панель управления */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Метрики проекта */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('overallProgress')}</p>
                    <p className="text-2xl font-bold text-primary">{metrics.overallProgress}%</p>
                  </div>
                  <TrendUp size={24} className="text-primary" />
                </div>
                <Progress value={metrics.overallProgress} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
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
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('activeRisks')}</p>
                    <p className="text-2xl font-bold text-red-500">{metrics.criticalRisks}</p>
                  </div>
                  <Warning size={24} className="text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('estimatedCompletion')}</p>
                    <p className="text-sm font-medium text-foreground">{metrics.estimatedCompletion}</p>
                  </div>
                  <Calendar size={24} className="text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Текущий статус по категориям */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target size={20} />
                  {language === 'ru' ? 'Прогресс по Категориям' : 'Progress by Category'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['core', 'feature', 'integration', 'testing', 'optimization', 'documentation'].map(category => {
                    const categoryReqs = requirements?.filter(req => req.category === category) || [];
                    const completedInCategory = categoryReqs.filter(req => req.status === 'completed').length;
                    const progress = categoryReqs.length > 0 ? (completedInCategory / categoryReqs.length) * 100 : 0;
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(category as RequirementItem['category'])}
                            <span className="text-sm font-medium">{t(category)}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {completedInCategory}/{categoryReqs.length}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity size={20} />
                  {language === 'ru' ? 'Активные Задачи' : 'Active Tasks'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {requirements?.filter(req => req.status === 'in_progress').map(req => (
                      <div key={req.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{req.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {t(req.priority)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {req.assignee}
                            </span>
                          </div>
                          <Progress value={req.progress} className="mt-2 h-1" />
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm font-medium">{req.progress}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Список требований */}
        <TabsContent value="requirements" className="space-y-6">
          {/* Фильтры */}
          <div className="flex items-center gap-4">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ru' ? 'Все категории' : 'All categories'}</SelectItem>
                <SelectItem value="core">{t('core')}</SelectItem>
                <SelectItem value="feature">{t('feature')}</SelectItem>
                <SelectItem value="integration">{t('integration')}</SelectItem>
                <SelectItem value="testing">{t('testing')}</SelectItem>
                <SelectItem value="optimization">{t('optimization')}</SelectItem>
                <SelectItem value="documentation">{t('documentation')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ru' ? 'Все статусы' : 'All statuses'}</SelectItem>
                <SelectItem value="not_started">{t('notStarted')}</SelectItem>
                <SelectItem value="in_progress">{t('inProgress')}</SelectItem>
                <SelectItem value="completed">{t('completed')}</SelectItem>
                <SelectItem value="blocked">{t('blocked')}</SelectItem>
                <SelectItem value="testing">{t('testing')}</SelectItem>
                <SelectItem value="review">{t('review')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Список требований */}
          <div className="grid gap-4">
            {filteredRequirements.map(requirement => (
              <Card key={requirement.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(requirement.status)}
                        <h3 className="font-semibold">{requirement.title}</h3>
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(requirement.priority)} text-white`}>
                          {t(requirement.priority)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryIcon(requirement.category)}
                          <span className="ml-1">{t(requirement.category)}</span>
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{requirement.description}</p>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Progress value={requirement.progress} className="w-24 h-2" />
                          <span className="text-xs text-muted-foreground">{requirement.progress}%</span>
                        </div>
                        
                        {requirement.assignee && (
                          <div className="flex items-center gap-1">
                            <Users size={14} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{requirement.assignee}</span>
                          </div>
                        )}
                        
                        {requirement.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar size={14} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {new Date(requirement.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                        {requirement.risks.length > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <Warning size={14} className="text-yellow-500" />
                          <span className="text-xs text-yellow-600">
                            {requirement.risks.length} {language === 'ru' ? 'рисков' : 'risks'}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {requirement.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        value={requirement.status}
                        onValueChange={(value) => handleUpdateStatus(requirement.id, value as RequirementItem['status'])}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_started">{t('notStarted')}</SelectItem>
                          <SelectItem value="in_progress">{t('inProgress')}</SelectItem>
                          <SelectItem value="testing">{t('testing')}</SelectItem>
                          <SelectItem value="review">{t('review')}</SelectItem>
                          <SelectItem value="completed">{t('completed')}</SelectItem>
                          <SelectItem value="blocked">{t('blocked')}</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequirement(requirement);
                          setFormData(requirement);
                          setIsEditingRequirement(true);
                        }}
                      >
                        <PencilSimple size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Этапы проекта */}
        <TabsContent value="phases" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ru' ? 'Этапы Проекта' : 'Project Phases'}</CardTitle>
              <CardDescription>
                {language === 'ru' 
                  ? 'Отслеживание прогресса по основным этапам разработки'
                  : 'Track progress across major development phases'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    name: language === 'ru' ? 'Архитектура и Основы' : 'Architecture & Foundation',
                    requirements: ['req-1'],
                    description: language === 'ru' ? 'Базовая архитектура платформы' : 'Basic platform architecture'
                  },
                  {
                    name: language === 'ru' ? 'Основные Функции' : 'Core Features',
                    requirements: ['req-2', 'req-3'],
                    description: language === 'ru' ? 'Протокол Киплинга и директива IKR' : 'Kipling Protocol and IKR Directive'
                  },
                  {
                    name: language === 'ru' ? 'ИИ Возможности' : 'AI Capabilities',
                    requirements: ['req-4', 'req-5', 'req-7'],
                    description: language === 'ru' ? 'Агенты аудита, дебаты и чат' : 'Audit agents, debates, and chat'
                  },
                  {
                    name: language === 'ru' ? 'Инфраструктура' : 'Infrastructure',
                    requirements: ['req-6', 'req-8'],
                    description: language === 'ru' ? 'Выполнение задач и диагностика' : 'Task execution and diagnostics'
                  },
                  {
                    name: language === 'ru' ? 'Дополнительные Функции' : 'Additional Features',
                    requirements: ['req-9', 'req-10'],
                    description: language === 'ru' ? 'Управление файлами и уведомления' : 'File management and notifications'
                  }
                ].map((phase, index) => {
                  const phaseRequirements = requirements?.filter(req => phase.requirements.includes(req.id)) || [];
                  const completed = phaseRequirements.filter(req => req.status === 'completed').length;
                  const progress = phaseRequirements.length > 0 ? (completed / phaseRequirements.length) * 100 : 0;
                  const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started';

                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            {status === 'completed' ? (
                              <CheckCircle className="text-green-500" size={20} />
                            ) : status === 'in_progress' ? (
                              <Activity className="text-blue-500" size={20} />
                            ) : (
                              <Circle className="text-gray-500" size={20} />
                            )}
                            {phase.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{phase.description}</p>
                        </div>
                        <Badge variant={status === 'completed' ? 'default' : 'secondary'}>
                          {Math.round(progress)}%
                        </Badge>
                      </div>
                      
                      <Progress value={progress} className="mb-3" />
                      
                      <div className="text-sm text-muted-foreground">
                        {completed}/{phaseRequirements.length} {language === 'ru' ? 'требований выполнено' : 'requirements completed'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Риски */}
        <TabsContent value="risks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warning size={20} />
                {language === 'ru' ? 'Управление Рисками' : 'Risk Management'}
              </CardTitle>
              <CardDescription>
                {language === 'ru' 
                  ? 'Отслеживание и смягчение проектных рисков'
                  : 'Track and mitigate project risks'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requirements?.filter(req => req.risks.length > 0).map(requirement => (
                  <div key={requirement.id}>
                    <h4 className="font-medium mb-2">{requirement.title}</h4>
                    <div className="space-y-2 ml-4">
                      {requirement.risks.map(risk => (
                        <div key={risk.id} className="border rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-medium">{risk.description}</p>
                              <p className="text-sm text-muted-foreground mt-1">{risk.impact}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getRiskSeverityColor(risk.severity)}>
                                {t(risk.severity)}
                              </Badge>
                              <Badge variant="outline">
                                {risk.probability}%
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="text-sm">
                            <p><strong>{language === 'ru' ? 'Смягчение:' : 'Mitigation:'}</strong> {risk.mitigation}</p>
                            <p className="mt-1">
                              <strong>{language === 'ru' ? 'Статус:' : 'Status:'}</strong> 
                              <Badge variant="outline" className="ml-2">{t(risk.status)}</Badge>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Аналитика */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ru' ? 'Burndown Chart' : 'Burndown Chart'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  {language === 'ru' 
                    ? 'График сгорания задач (визуализация будет добавлена)'
                    : 'Burndown chart visualization (to be implemented)'
                  }
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{language === 'ru' ? 'Скорость Команды' : 'Team Velocity'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{metrics.averageVelocity}</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ru' ? 'задач в неделю' : 'tasks per week'}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold">{metrics.totalRequirements - metrics.completedRequirements}</p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'ru' ? 'Осталось' : 'Remaining'}
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{metrics.blockedTasks}</p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'ru' ? 'Заблокировано' : 'Blocked'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Диалог добавления требования */}
      <Dialog open={isAddingRequirement} onOpenChange={setIsAddingRequirement}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('addRequirement')}</DialogTitle>
            <DialogDescription>
              {language === 'ru' 
                ? 'Добавьте новое техническое требование к проекту'
                : 'Add a new technical requirement to the project'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">{t('title')} *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={language === 'ru' ? 'Название требования' : 'Requirement title'}
              />
            </div>
            
            <div>
              <Label htmlFor="description">{t('description')} *</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={language === 'ru' ? 'Подробное описание требования' : 'Detailed requirement description'}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">{t('category')}</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as RequirementItem['category'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="core">{t('core')}</SelectItem>
                    <SelectItem value="feature">{t('feature')}</SelectItem>
                    <SelectItem value="integration">{t('integration')}</SelectItem>
                    <SelectItem value="testing">{t('testing')}</SelectItem>
                    <SelectItem value="optimization">{t('optimization')}</SelectItem>
                    <SelectItem value="documentation">{t('documentation')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="priority">{t('priority')}</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as RequirementItem['priority'] }))}>
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimatedHours">{t('estimatedHours')}</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  value={formData.estimatedHours || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                />
              </div>
              
              <div>
                <Label htmlFor="assignee">{t('assignee')}</Label>
                <Input
                  id="assignee"
                  value={formData.assignee || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
                  placeholder={language === 'ru' ? 'Ответственный' : 'Responsible person'}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="dueDate">{t('dueDate')}</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddingRequirement(false)}>
              {language === 'ru' ? 'Отмена' : 'Cancel'}
            </Button>
            <Button onClick={handleAddRequirement}>
              {t('addRequirement')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectRequirementsTracker;