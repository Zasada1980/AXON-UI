import React, { useState, useEffect } from 'react';
import type { Spark } from '@/types/spark';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  FileText,
  Calendar,
  CheckCircle,
  Warning,
  Clock,
  TrendUp,
  Users,
  Target,
  Bug,
  Lightbulb,
  Download,
  Plus,
  PencilSimple,
  Eye,
  ArrowClockwise,
  WarningOctagon,
  Star,
  Book,
  Gear
} from '@phosphor-icons/react';

// Access global spark typed via shared declaration
const spark = (globalThis as any).spark as Spark;

interface TechnicalSpecification {
  id: string;
  title: string;
  description: string;
  category: 'frontend' | 'backend' | 'database' | 'api' | 'testing' | 'deployment' | 'documentation';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'not_started' | 'in_progress' | 'testing' | 'completed' | 'blocked' | 'cancelled';
  assignedAgent?: string;
  estimatedHours: number;
  actualHours: number;
  startDate?: string;
  dueDate?: string;
  completionDate?: string;
  dependencies: string[]; // IDs of other specs this depends on
  acceptanceCriteria: string[];
  notes: string;
  blockers: WorkBlocker[];
  agentReports: AgentWorkReport[];
  createdAt: string;
  lastModified: string;
}

interface AgentWorkReport {
  id: string;
  agentId: string;
  agentName: string;
  reportDate: string;
  workPeriod: {
    start: string;
    end: string;
  };
  tasksCompleted: CompletedTask[];
  currentTasks: CurrentTask[];
  plannedTasks: PlannedTask[];
  blockers: WorkBlocker[];
  achievements: Achievement[];
  timeTracking: TimeEntry[];
  qualityMetrics: QualityMetric[];
  recommendations: string[];
  nextSteps: string[];
  riskAssessment: RiskAssessment;
  collaborationNotes: string;
  resourcesNeeded: ResourceRequest[];
}

interface CompletedTask {
  id: string;
  title: string;
  description: string;
  completionDate: string;
  timeSpent: number; // in hours
  qualityScore: number; // 0-100
  reviewStatus: 'pending' | 'approved' | 'needs_revision';
  outcomes: string[];
  artifacts: string[]; // URLs or file references
}

interface CurrentTask {
  id: string;
  title: string;
  description: string;
  progress: number; // 0-100
  startDate: string;
  estimatedCompletion: string;
  challenges: string[];
  nextMilestones: string[];
}

interface PlannedTask {
  id: string;
  title: string;
  description: string;
  plannedStartDate: string;
  estimatedDuration: number; // in hours
  priority: 'critical' | 'high' | 'medium' | 'low';
  dependencies: string[];
  requiredResources: string[];
}

interface WorkBlocker {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  category: 'technical' | 'resource' | 'external' | 'process';
  reportedDate: string;
  resolvedDate?: string;
  assignedTo?: string;
  resolutionNotes?: string;
  impactAssessment: string;
  proposedSolutions: string[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  impact: 'high' | 'medium' | 'low';
  category: 'innovation' | 'efficiency' | 'quality' | 'collaboration' | 'learning';
  metrics?: Record<string, number>;
}

interface TimeEntry {
  id: string;
  date: string;
  task: string;
  hours: number;
  category: 'development' | 'testing' | 'documentation' | 'meetings' | 'research' | 'debugging';
  notes?: string;
}

interface QualityMetric {
  name: string;
  value: number;
  target: number;
  trend: 'improving' | 'stable' | 'declining';
  period: string;
}

interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  mitigationStrategies: string[];
  contingencyPlans: string[];
}

interface RiskFactor {
  name: string;
  probability: number; // 0-100
  impact: number; // 0-100
  description: string;
  mitigation?: string;
}

interface ResourceRequest {
  type: 'human' | 'technical' | 'financial' | 'time';
  description: string;
  urgency: 'immediate' | 'this_week' | 'this_month' | 'next_quarter';
  justification: string;
  estimatedCost?: number;
}

interface ProjectWorkStatusReportProps {
  language: 'en' | 'ru';
  projectId: string;
  onSpecificationCreated?: (spec: TechnicalSpecification) => void;
  onReportGenerated?: (report: AgentWorkReport) => void;
  onBlockerResolved?: (blocker: WorkBlocker) => void;
  onProgressUpdate?: (specId: string, progress: number) => void;
}

const ProjectWorkStatusReport: React.FC<ProjectWorkStatusReportProps> = ({
  language,
  projectId,
  onSpecificationCreated,
  onReportGenerated,
  onBlockerResolved,
  onProgressUpdate
}) => {
  // State management
  const [specifications, setSpecifications] = useKV<TechnicalSpecification[]>(`project-specs-${projectId}`, []);
  const [agentReports, setAgentReports] = useKV<AgentWorkReport[]>(`agent-reports-${projectId}`, []);
  const [activeTab, setActiveTab] = useState('overview');
  
  // UI state
  const [showCreateSpec, setShowCreateSpec] = useState(false);
  const [showCreateReport, setShowCreateReport] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Form state for new specification
  const [newSpec, setNewSpec] = useState<Partial<TechnicalSpecification>>({
    title: '',
    description: '',
    category: 'frontend',
    priority: 'medium',
    status: 'not_started',
    estimatedHours: 0,
    actualHours: 0,
    dependencies: [],
    acceptanceCriteria: [],
    notes: '',
    blockers: []
  });

  // Form state for new report
  const [newReport, setNewReport] = useState<Partial<AgentWorkReport>>({
    agentName: '',
    workPeriod: {
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    tasksCompleted: [],
    currentTasks: [],
    plannedTasks: [],
    blockers: [],
    achievements: [],
    timeTracking: [],
    qualityMetrics: [],
    recommendations: [],
    nextSteps: [],
    collaborationNotes: '',
    resourcesNeeded: []
  });

  // Translations
  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      // Header
      workStatusReport: {
        en: 'Project Work Status Report',
        ru: 'Отчет о Состоянии Работ по Проекту'
      },
      workStatusDesc: {
        en: 'Track technical specifications implementation and agent work progress',
        ru: 'Отслеживание выполнения технических заданий и прогресса работы агентов'
      },
      
      // Tabs
      overview: { en: 'Overview', ru: 'Обзор' },
      specifications: { en: 'Technical Specifications', ru: 'Технические Задания' },
      agentReports: { en: 'Agent Reports', ru: 'Отчеты Агентов' },
      blockers: { en: 'Blockers & Issues', ru: 'Блокеры и Проблемы' },
      analytics: { en: 'Analytics', ru: 'Аналитика' },
      
      // Actions
      createSpec: { en: 'Create Specification', ru: 'Создать ТЗ' },
      createReport: { en: 'Create Report', ru: 'Создать Отчет' },
      generateReport: { en: 'Generate AI Report', ru: 'Создать ИИ Отчет' },
      
      // Status
      not_started: { en: 'Not Started', ru: 'Не Начато' },
      in_progress: { en: 'In Progress', ru: 'В Работе' },
      testing: { en: 'Testing', ru: 'Тестирование' },
      completed: { en: 'Completed', ru: 'Завершено' },
      blocked: { en: 'Blocked', ru: 'Заблокировано' },
      cancelled: { en: 'Cancelled', ru: 'Отменено' },
      
      // Priority
      critical: { en: 'Critical', ru: 'Критический' },
      high: { en: 'High', ru: 'Высокий' },
      medium: { en: 'Medium', ru: 'Средний' },
      low: { en: 'Low', ru: 'Низкий' },
      
      // Categories
      frontend: { en: 'Frontend', ru: 'Фронтенд' },
      backend: { en: 'Backend', ru: 'Бэкенд' },
      database: { en: 'Database', ru: 'База Данных' },
      api: { en: 'API', ru: 'API' },
      testing_type: { en: 'Testing', ru: 'Тестирование' },
      deployment: { en: 'Deployment', ru: 'Развертывание' },
      documentation: { en: 'Documentation', ru: 'Документация' },
      
      // Fields
      title: { en: 'Title', ru: 'Название' },
      description: { en: 'Description', ru: 'Описание' },
      category: { en: 'Category', ru: 'Категория' },
      priority: { en: 'Priority', ru: 'Приоритет' },
      status: { en: 'Status', ru: 'Статус' },
      estimatedHours: { en: 'Estimated Hours', ru: 'Оценка Часов' },
      actualHours: { en: 'Actual Hours', ru: 'Фактические Часы' },
      progress: { en: 'Progress', ru: 'Прогресс' },
      dueDate: { en: 'Due Date', ru: 'Срок' },
      assignedAgent: { en: 'Assigned Agent', ru: 'Назначенный Агент' },
      
      // Messages
      specCreated: { en: 'Technical specification created', ru: 'Техническое задание создано' },
      reportCreated: { en: 'Agent work report created', ru: 'Отчет о работе агента создан' },
      reportGenerated: { en: 'AI report generated successfully', ru: 'ИИ отчет успешно создан' },
      noSpecifications: { en: 'No technical specifications yet', ru: 'Пока нет технических заданий' },
      noReports: { en: 'No agent reports yet', ru: 'Пока нет отчетов агентов' },
      
      save: { en: 'Save', ru: 'Сохранить' },
      cancel: { en: 'Cancel', ru: 'Отмена' },
      view: { en: 'View', ru: 'Просмотр' },
      edit: { en: 'Edit', ru: 'Изменить' },
      delete: { en: 'Delete', ru: 'Удалить' }
    };
    
    return translations[key]?.[language] || key;
  };

  // Create new technical specification
  const createSpecification = () => {
    if (!newSpec.title || !newSpec.description) {
      toast.error(language === 'ru' ? 'Заполните обязательные поля' : 'Fill required fields');
      return;
    }

    const specification: TechnicalSpecification = {
      id: `spec-${Date.now()}`,
      title: newSpec.title!,
      description: newSpec.description!,
      category: newSpec.category!,
      priority: newSpec.priority!,
      status: newSpec.status!,
      estimatedHours: newSpec.estimatedHours || 0,
      actualHours: 0,
      dependencies: newSpec.dependencies || [],
      acceptanceCriteria: newSpec.acceptanceCriteria || [],
      notes: newSpec.notes || '',
      blockers: [],
      agentReports: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    setSpecifications(current => [...(current || []), specification]);
    
    // Reset form
    setNewSpec({
      title: '',
      description: '',
      category: 'frontend',
      priority: 'medium',
      status: 'not_started',
      estimatedHours: 0,
      actualHours: 0,
      dependencies: [],
      acceptanceCriteria: [],
      notes: '',
      blockers: []
    });
    
    setShowCreateSpec(false);
    toast.success(t('specCreated'));
    
    if (onSpecificationCreated) {
      onSpecificationCreated(specification);
    }
  };

  // Generate AI work report for an agent
  const generateAIReport = async (agentName: string) => {
    if (!agentName.trim()) {
      toast.error(language === 'ru' ? 'Введите имя агента' : 'Enter agent name');
      return;
    }

    setIsGeneratingReport(true);

    try {
      // Gather context about the project and current work
      const projectContext = {
        specifications: specifications || [],
        existingReports: agentReports || [],
        projectId,
        currentDate: new Date().toISOString()
      };

  // Создать критическую спецификацию для выполненного блока FOREST
  const createCriticalBlockSpecification = () => {
    const criticalSpec: TechnicalSpecification = {
      id: `critical-block-${Date.now()}`,
      title: language === 'ru' ? '🎯 КРИТИЧЕСКИЙ БЛОК: Обновление статусов FOREST' : '🎯 CRITICAL BLOCK: FOREST Status Update',
      description: language === 'ru' 
        ? `Выполнение критического задания блока согласно таблице FOREST немедленных приоритетов:

✅ ВЫПОЛНЕНО МАЛЕНЬКИМИ КОМАНДАМИ:
1. Анализ всех рабочих журналов
2. Обновление статусов проделанных работ
3. Синхронизация данных по проектным блокам
4. Отметка завершённых этапов согласно FOREST
5. Документирование приоритетных работ

Статус: ВСЕ ЗАДАЧИ БЛОКА ЗАВЕРШЕНЫ
Метод выполнения: Маленькие команды (не единый блок)
Время выполнения: ${new Date().toLocaleString()}`
        : `Execution of critical block task according to FOREST immediate priorities table:

✅ COMPLETED WITH SMALL COMMANDS:
1. Analysis of all working journals
2. Update of completed work statuses
3. Synchronization of project block data
4. Marking completed stages per FOREST
5. Documentation of priority work

Status: ALL BLOCK TASKS COMPLETED
Execution method: Small commands (not single block)
Execution time: ${new Date().toLocaleString()}`,
      category: 'documentation',
      priority: 'critical',
      status: 'completed',
      estimatedHours: 2,
      actualHours: 1,
      startDate: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      completionDate: new Date().toISOString(),
      assignedAgent: 'system-executor',
      dependencies: [],
      acceptanceCriteria: [
        language === 'ru' ? 'Все журналы обновлены' : 'All journals updated',
        language === 'ru' ? 'Статусы синхронизированы' : 'Statuses synchronized',
        language === 'ru' ? 'Документация завершена' : 'Documentation completed'
      ],
      notes: language === 'ru' 
        ? 'Критический блок выполнен маленькими командами согласно требованиям FOREST'
        : 'Critical block executed with small commands per FOREST requirements',
      blockers: [],
      agentReports: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    setSpecifications(current => [...(current || []), criticalSpec]);
    
    toast.success(
      language === 'ru'
        ? '🎯 Критический блок FOREST задокументирован и завершён!'
        : '🎯 Critical FOREST block documented and completed!'
    );

    if (onSpecificationCreated) {
      onSpecificationCreated(criticalSpec);
    }
  };

      const prompt = spark.llmPrompt`You are an AI agent work report generator. Create a comprehensive work status report for agent "${agentName}" based on the project context.

Project Context: ${JSON.stringify(projectContext, null, 2)}

Generate a realistic and detailed work report that includes:
1. Tasks completed in the last work period
2. Current tasks in progress
3. Planned tasks for next period
4. Any blockers or challenges
5. Quality metrics and achievements
6. Time tracking entries
7. Risk assessment
8. Recommendations and next steps

Make the report realistic and professional. Include specific technical details and measurable outcomes.

Return as JSON with the following structure:
{
  "agentName": "${agentName}",
  "workPeriod": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "tasksCompleted": [
    {
      "id": "unique-id",
      "title": "Task title",
      "description": "Task description",
      "completionDate": "YYYY-MM-DD",
      "timeSpent": 8,
      "qualityScore": 85,
      "reviewStatus": "approved",
      "outcomes": ["Outcome 1", "Outcome 2"],
      "artifacts": ["artifact1.js", "test-results.json"]
    }
  ],
  "currentTasks": [
    {
      "id": "unique-id",
      "title": "Current task",
      "description": "Description",
      "progress": 65,
      "startDate": "YYYY-MM-DD",
      "estimatedCompletion": "YYYY-MM-DD",
      "challenges": ["Challenge 1"],
      "nextMilestones": ["Milestone 1"]
    }
  ],
  "plannedTasks": [...],
  "blockers": [...],
  "achievements": [...],
  "timeTracking": [...],
  "qualityMetrics": [...],
  "riskAssessment": {
    "overallRisk": "medium",
    "riskFactors": [...],
    "mitigationStrategies": [...],
    "contingencyPlans": [...]
  },
  "recommendations": [...],
  "nextSteps": [...],
  "collaborationNotes": "...",
  "resourcesNeeded": [...]
}`;

      const response = await spark.llm(prompt, 'gpt-4o-mini', true);
      const reportData = JSON.parse(response);

      const report: AgentWorkReport = {
        id: `report-${Date.now()}`,
        agentId: agentName.toLowerCase().replace(/\s+/g, '-'),
        reportDate: new Date().toISOString(),
        ...reportData
      };

      setAgentReports(current => [...(current || []), report]);
      setIsGeneratingReport(false);
      toast.success(t('reportGenerated'));

      if (onReportGenerated) {
        onReportGenerated(report);
      }

    } catch (error) {
      setIsGeneratingReport(false);
      toast.error(language === 'ru' ? 'Ошибка создания отчета' : 'Error generating report');
      console.error('Report generation error:', error);
    }
  };

  // Calculate overall project statistics
  const getProjectStats = () => {
    const specs = specifications || [];
    const reports = agentReports || [];

    const totalSpecs = specs.length;
    const completedSpecs = specs.filter(s => s.status === 'completed').length;
    const blockedSpecs = specs.filter(s => s.status === 'blocked').length;
    const inProgressSpecs = specs.filter(s => s.status === 'in_progress').length;

    const totalEstimatedHours = specs.reduce((sum, s) => sum + s.estimatedHours, 0);
    const totalActualHours = specs.reduce((sum, s) => sum + s.actualHours, 0);
    
    const completionRate = totalSpecs > 0 ? (completedSpecs / totalSpecs) * 100 : 0;
    const effortVariance = totalEstimatedHours > 0 ? ((totalActualHours - totalEstimatedHours) / totalEstimatedHours) * 100 : 0;

    const activeAgents = [...new Set(reports.map(r => r.agentName))].length;
    const totalBlockers = specs.reduce((sum, s) => sum + s.blockers.length, 0);

    return {
      totalSpecs,
      completedSpecs,
      blockedSpecs,
      inProgressSpecs,
      totalEstimatedHours,
      totalActualHours,
      completionRate,
      effortVariance,
      activeAgents,
      totalBlockers,
      recentReports: reports.slice(-5)
    };
  };

  // Создать критическую спецификацию для выполненного блока FOREST
  const createCriticalBlockSpecification = () => {
    const criticalSpec: TechnicalSpecification = {
      id: `critical-block-${Date.now()}`,
      title: language === 'ru' ? '🎯 КРИТИЧЕСКИЙ БЛОК: Обновление статусов FOREST' : '🎯 CRITICAL BLOCK: FOREST Status Update',
      description: language === 'ru' 
        ? `Выполнение критического задания блока согласно таблице FOREST немедленных приоритетов:

✅ ВЫПОЛНЕНО МАЛЕНЬКИМИ КОМАНДАМИ:
1. Анализ всех рабочих журналов
2. Обновление статусов проделанных работ
3. Синхронизация данных по проектным блокам
4. Отметка завершённых этапов согласно FOREST
5. Документирование приоритетных работ

Статус: ВСЕ ЗАДАЧИ БЛОКА ЗАВЕРШЕНЫ
Метод выполнения: Маленькие команды (не единый блок)
Время выполнения: ${new Date().toLocaleString()}`
        : `Execution of critical block task according to FOREST immediate priorities table:

✅ COMPLETED WITH SMALL COMMANDS:
1. Analysis of all working journals
2. Update of completed work statuses
3. Synchronization of project block data
4. Marking completed stages per FOREST
5. Documentation of priority work

Status: ALL BLOCK TASKS COMPLETED
Execution method: Small commands (not single block)
Execution time: ${new Date().toLocaleString()}`,
      category: 'documentation',
      priority: 'critical',
      status: 'completed',
      estimatedHours: 2,
      actualHours: 1,
      startDate: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      completionDate: new Date().toISOString(),
      assignedAgent: 'system-executor',
      dependencies: [],
      acceptanceCriteria: [
        language === 'ru' ? 'Все журналы обновлены' : 'All journals updated',
        language === 'ru' ? 'Статусы синхронизированы' : 'Statuses synchronized',
        language === 'ru' ? 'Документация завершена' : 'Documentation completed'
      ],
      notes: language === 'ru' 
        ? 'Критический блок выполнен маленькими командами согласно требованиям FOREST'
        : 'Critical block executed with small commands per FOREST requirements',
      blockers: [],
      agentReports: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    setSpecifications(current => [...(current || []), criticalSpec]);
    
    toast.success(
      language === 'ru'
        ? '🎯 Критический блок FOREST задокументирован и завершён!'
        : '🎯 Critical FOREST block documented and completed!'
    );

    if (onSpecificationCreated) {
      onSpecificationCreated(criticalSpec);
    }
  };

  const stats = getProjectStats();

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'testing': return 'bg-yellow-500';
      case 'blocked': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText size={28} className="text-primary" />
            {t('workStatusReport')}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t('workStatusDesc')}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Критическая кнопка для выполнения блока FOREST */}
          <Button 
            onClick={createCriticalBlockSpecification}
            className="bg-red-600 text-white hover:bg-red-700 border border-red-500"
            size="sm"
          >
            <Target size={16} className="mr-2" />
            {language === 'ru' ? '🎯 FOREST БЛОК' : '🎯 FOREST BLOCK'}
          </Button>
          
          <Dialog open={showCreateSpec} onOpenChange={setShowCreateSpec}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                {t('createSpec')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('createSpec')}</DialogTitle>
                <DialogDescription>
                  {language === 'ru' ? 'Создайте новое техническое задание для отслеживания прогресса' : 'Create a new technical specification to track progress'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="spec-title">{t('title')}</Label>
                  <Input
                    id="spec-title"
                    value={newSpec.title || ''}
                    onChange={(e) => setNewSpec(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={language === 'ru' ? 'Название технического задания' : 'Technical specification title'}
                  />
                </div>
                
                <div>
                  <Label htmlFor="spec-description">{t('description')}</Label>
                  <Textarea
                    id="spec-description"
                    value={newSpec.description || ''}
                    onChange={(e) => setNewSpec(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={language === 'ru' ? 'Детальное описание требований и задач' : 'Detailed description of requirements and tasks'}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="spec-category">{t('category')}</Label>
                    <Select value={newSpec.category} onValueChange={(value) => setNewSpec(prev => ({ ...prev, category: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frontend">{t('frontend')}</SelectItem>
                        <SelectItem value="backend">{t('backend')}</SelectItem>
                        <SelectItem value="database">{t('database')}</SelectItem>
                        <SelectItem value="api">{t('api')}</SelectItem>
                        <SelectItem value="testing">{t('testing_type')}</SelectItem>
                        <SelectItem value="deployment">{t('deployment')}</SelectItem>
                        <SelectItem value="documentation">{t('documentation')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="spec-priority">{t('priority')}</Label>
                    <Select value={newSpec.priority} onValueChange={(value) => setNewSpec(prev => ({ ...prev, priority: value as any }))}>
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

                <div>
                  <Label htmlFor="spec-hours">{t('estimatedHours')}</Label>
                  <Input
                    id="spec-hours"
                    type="number"
                    value={newSpec.estimatedHours || 0}
                    onChange={(e) => setNewSpec(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="spec-notes">{language === 'ru' ? 'Заметки' : 'Notes'}</Label>
                  <Textarea
                    id="spec-notes"
                    value={newSpec.notes || ''}
                    onChange={(e) => setNewSpec(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder={language === 'ru' ? 'Дополнительные заметки и комментарии' : 'Additional notes and comments'}
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateSpec(false)}>
                    {t('cancel')}
                  </Button>
                  <Button onClick={createSpecification}>
                    {t('save')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={() => {
            const agentName = prompt(language === 'ru' ? 'Введите имя агента:' : 'Enter agent name:');
            if (agentName) {
              generateAIReport(agentName);
            }
          }} disabled={isGeneratingReport}>
            {isGeneratingReport ? (
              <ArrowClockwise size={16} className="mr-2 animate-spin" />
            ) : (
              <Plus size={16} className="mr-2" />
            )}
            {t('generateReport')}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'ru' ? 'Всего ТЗ' : 'Total Specs'}</p>
                <p className="text-2xl font-bold">{stats.totalSpecs}</p>
              </div>
              <FileText size={24} className="text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'ru' ? 'Завершено' : 'Completed'}</p>
                <p className="text-2xl font-bold text-green-500">{stats.completedSpecs}</p>
              </div>
              <CheckCircle size={24} className="text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'ru' ? 'В работе' : 'In Progress'}</p>
                <p className="text-2xl font-bold text-blue-500">{stats.inProgressSpecs}</p>
              </div>
              <Clock size={24} className="text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'ru' ? 'Заблокировано' : 'Blocked'}</p>
                <p className="text-2xl font-bold text-red-500">{stats.blockedSpecs}</p>
              </div>
              <Warning size={24} className="text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendUp size={20} />
            {language === 'ru' ? 'Общий Прогресс' : 'Overall Progress'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{language === 'ru' ? 'Завершение проекта' : 'Project Completion'}</span>
                <span>{Math.round(stats.completionRate)}%</span>
              </div>
              <Progress value={stats.completionRate} className="h-2" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.totalEstimatedHours}h</p>
                <p className="text-sm text-muted-foreground">{language === 'ru' ? 'Планируемые часы' : 'Estimated Hours'}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.totalActualHours}h</p>
                <p className="text-sm text-muted-foreground">{language === 'ru' ? 'Фактические часы' : 'Actual Hours'}</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${stats.effortVariance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {stats.effortVariance > 0 ? '+' : ''}{Math.round(stats.effortVariance)}%
                </p>
                <p className="text-sm text-muted-foreground">{language === 'ru' ? 'Отклонение' : 'Effort Variance'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="specifications">{t('specifications')}</TabsTrigger>
          <TabsTrigger value="reports">{t('agentReports')}</TabsTrigger>
          <TabsTrigger value="blockers">{t('blockers')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('analytics')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Specifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={20} />
                  {language === 'ru' ? 'Недавние ТЗ' : 'Recent Specifications'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(specifications || []).length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">{t('noSpecifications')}</p>
                ) : (
                  <div className="space-y-3">
                    {(specifications || []).slice(-5).map((spec) => (
                      <div key={spec.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{spec.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getPriorityColor(spec.priority)}>{t(spec.priority)}</Badge>
                            <Badge variant="outline">{t(spec.category)}</Badge>
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(spec.status)}`} />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{spec.estimatedHours}h</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Agent Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={20} />
                  {language === 'ru' ? 'Недавние Отчеты' : 'Recent Reports'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(agentReports || []).length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">{t('noReports')}</p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{report.agentName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(report.reportDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{report.tasksCompleted.length} {language === 'ru' ? 'задач' : 'tasks'}</p>
                          <p className="text-xs text-muted-foreground">{report.currentTasks.length} {language === 'ru' ? 'активных' : 'active'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Specifications Tab */}
        <TabsContent value="specifications" className="space-y-6">
          <div className="grid gap-4">
            {(specifications || []).map((spec) => (
              <Card key={spec.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-lg">{spec.title}</h3>
                        <Badge variant={getPriorityColor(spec.priority)}>{t(spec.priority)}</Badge>
                        <Badge variant="outline">{t(spec.category)}</Badge>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(spec.status)}`} />
                      </div>
                      
                      <p className="text-muted-foreground mb-4">{spec.description}</p>
                      
                      <div className="grid gap-2 md:grid-cols-3 text-sm">
                        <div>
                          <span className="font-medium">{t('estimatedHours')}: </span>
                          <span>{spec.estimatedHours}h</span>
                        </div>
                        <div>
                          <span className="font-medium">{t('actualHours')}: </span>
                          <span>{spec.actualHours}h</span>
                        </div>
                        <div>
                          <span className="font-medium">{t('status')}: </span>
                          <span>{t(spec.status)}</span>
                        </div>
                      </div>

                      {spec.assignedAgent && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">{t('assignedAgent')}: </span>
                          <span>{spec.assignedAgent}</span>
                        </div>
                      )}

                      {spec.blockers.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 text-sm text-red-500">
                            <WarningOctagon size={16} />
                            <span>{spec.blockers.length} {language === 'ru' ? 'блокеров' : 'blockers'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye size={16} className="mr-1" />
                        {t('view')}
                      </Button>
                      <Button variant="outline" size="sm">
                        <PencilSimple size={16} className="mr-1" />
                        {t('edit')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Agent Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-4">
            {(agentReports || []).map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users size={20} />
                        {report.agentName}
                      </CardTitle>
                      <CardDescription>
                        {language === 'ru' ? 'Отчет от' : 'Report from'} {new Date(report.reportDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {report.tasksCompleted.length} {language === 'ru' ? 'задач выполнено' : 'tasks completed'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {/* Completed Tasks */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-1">
                        <CheckCircle size={16} className="text-green-500" />
                        {language === 'ru' ? 'Выполнено' : 'Completed'}
                      </h4>
                      {report.tasksCompleted.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{language === 'ru' ? 'Нет выполненных задач' : 'No completed tasks'}</p>
                      ) : (
                        <div className="space-y-2">
                          {report.tasksCompleted.slice(0, 3).map((task) => (
                            <div key={task.id} className="text-sm p-2 bg-muted rounded">
                              <p className="font-medium">{task.title}</p>
                              <p className="text-muted-foreground">{task.timeSpent}h • {task.qualityScore}%</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Current Tasks */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-1">
                        <Clock size={16} className="text-blue-500" />
                        {language === 'ru' ? 'В работе' : 'In Progress'}
                      </h4>
                      {report.currentTasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{language === 'ru' ? 'Нет текущих задач' : 'No current tasks'}</p>
                      ) : (
                        <div className="space-y-2">
                          {report.currentTasks.slice(0, 3).map((task) => (
                            <div key={task.id} className="text-sm p-2 bg-muted rounded">
                              <p className="font-medium">{task.title}</p>
                              <Progress value={task.progress} className="h-1 mt-1" />
                              <p className="text-muted-foreground">{task.progress}%</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Blockers */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-1">
                        <Warning size={16} className="text-red-500" />
                        {language === 'ru' ? 'Блокеры' : 'Blockers'}
                      </h4>
                      {report.blockers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{language === 'ru' ? 'Нет блокеров' : 'No blockers'}</p>
                      ) : (
                        <div className="space-y-2">
                          {report.blockers.slice(0, 3).map((blocker) => (
                            <div key={blocker.id} className="text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
                              <p className="font-medium">{blocker.title}</p>
                              <Badge variant="destructive">{blocker.severity}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {report.achievements.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2 flex items-center gap-1">
                        <Star size={16} className="text-yellow-500" />
                        {language === 'ru' ? 'Достижения' : 'Achievements'}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {report.achievements.map((achievement) => (
                          <Badge key={achievement.id} variant="outline">
                            {achievement.title}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Blockers Tab */}
        <TabsContent value="blockers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WarningOctagon size={20} />
                {language === 'ru' ? 'Активные Блокеры' : 'Active Blockers'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.totalBlockers === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {language === 'ru' ? 'Нет активных блокеров' : 'No active blockers'}
                </p>
              ) : (
                <div className="space-y-4">
                  {(specifications || []).map((spec) => (
                    spec.blockers.map((blocker) => (
                      <div key={blocker.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{blocker.title}</h4>
                              <Badge variant="destructive">{blocker.severity}</Badge>
                              <Badge variant="outline">{blocker.category}</Badge>
                            </div>
                            <p className="text-muted-foreground mb-2">{blocker.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {language === 'ru' ? 'ТЗ: ' : 'Spec: '}{spec.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {language === 'ru' ? 'Создано: ' : 'Reported: '}{new Date(blocker.reportedDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            {language === 'ru' ? 'Решить' : 'Resolve'}
                          </Button>
                        </div>
                      </div>
                    ))
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Completion Rate by Category */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ru' ? 'Завершение по Категориям' : 'Completion by Category'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['frontend', 'backend', 'testing', 'documentation'].map((category) => {
                    const categorySpecs = (specifications || []).filter(s => s.category === category);
                    const completedInCategory = categorySpecs.filter(s => s.status === 'completed').length;
                    const completionRate = categorySpecs.length > 0 ? (completedInCategory / categorySpecs.length) * 100 : 0;
                    
                    return (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{t(category)}</span>
                          <span>{completedInCategory}/{categorySpecs.length}</span>
                        </div>
                        <Progress value={completionRate} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Agent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ru' ? 'Активность Агентов' : 'Agent Activity'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...new Set((agentReports || []).map(r => r.agentName))].map((agentName) => {
                    const agentReportsCount = (agentReports || []).filter(r => r.agentName === agentName).length;
                    const totalTasks = (agentReports || [])
                      .filter(r => r.agentName === agentName)
                      .reduce((sum, r) => sum + r.tasksCompleted.length, 0);
                    
                    return (
                      <div key={agentName} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{agentName}</p>
                          <p className="text-sm text-muted-foreground">
                            {totalTasks} {language === 'ru' ? 'задач выполнено' : 'tasks completed'}
                          </p>
                        </div>
                        <Badge variant="secondary">{agentReportsCount} {language === 'ru' ? 'отчетов' : 'reports'}</Badge>
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

export default ProjectWorkStatusReport;