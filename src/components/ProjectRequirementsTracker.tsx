import React, { useState, useEffect } from 'react';
import type { Spark } from '@/types/spark';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  ListChecks,
  Plus,
  FileText,
  CheckCircle,
  Warning,
  Clock,
  Target,
  Users,
  Gear,
  Download,
  Upload,
  ArrowClockwise,
  WarningOctagon,
  Star,
  TrendUp,
  Shield,
  Database
} from '@phosphor-icons/react';

// Access global spark typed via shared declaration
const spark = (globalThis as any).spark as Spark;

interface Requirement {
  id: string;
  title: string;
  description: string;
  category: 'functional' | 'non-functional' | 'business' | 'technical' | 'security';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'draft' | 'approved' | 'in-progress' | 'testing' | 'completed' | 'blocked';
  assignee?: string;
  estimatedHours: number;
  actualHours: number;
  progress: number;
  dependencies: string[];
  acceptanceCriteria: string[];
  testCases: TestCase[];
  blockers: Blocker[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  completedAt?: string;
  notes: string;
}

interface TestCase {
  id: string;
  title: string;
  description: string;
  steps: string[];
  expectedResult: string;
  actualResult?: string;
  status: 'pending' | 'passed' | 'failed' | 'skipped';
  executedAt?: string;
  executedBy?: string;
}

interface Blocker {
  id: string;
  title: string;
  description: string;
  type: 'technical' | 'resource' | 'dependency' | 'external' | 'approval';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'resolved' | 'escalated';
  assignee?: string;
  reportedAt: string;
  resolvedAt?: string;
  resolution?: string;
}

interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'delayed';
  requirementIds: string[];
  completionPercentage: number;
}

interface TechnicalSpecification {
  id: string;
  title: string;
  description: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'deprecated';
  requirements: string[];
  architecture: {
    components: string[];
    dependencies: string[];
    dataFlow: string;
  };
  implementation: {
    technologies: string[];
    patterns: string[];
    considerations: string[];
  };
  testing: {
    strategy: string;
    coverage: number;
    automationLevel: number;
  };
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

interface ProjectRequirementsTrackerProps {
  language: 'en' | 'ru';
  projectId: string;
  onSpecificationCreated?: (spec: TechnicalSpecification) => void;
  onRequirementUpdated?: (requirement: Requirement) => void;
  onMilestoneCompleted?: (milestone: ProjectMilestone) => void;
  onBlockerResolved?: (blocker: Blocker) => void;
  onProgressUpdate?: (requirementId: string, progress: number) => void;
}

const ProjectRequirementsTracker: React.FC<ProjectRequirementsTrackerProps> = ({
  language,
  projectId,
  onSpecificationCreated,
  onRequirementUpdated,
  onMilestoneCompleted,
  onBlockerResolved,
  onProgressUpdate
}) => {
  const [requirements, setRequirements] = useKV<Requirement[]>(`requirements-${projectId}`, []);
  const [specifications, setSpecifications] = useKV<TechnicalSpecification[]>(`specs-${projectId}`, []);
  const [milestones, setMilestones] = useKV<ProjectMilestone[]>(`milestones-${projectId}`, []);
  const [blockers, setBlockers] = useKV<Blocker[]>(`blockers-${projectId}`, []);

  const [activeTab, setActiveTab] = useState<'requirements' | 'specifications' | 'milestones' | 'blockers' | 'analytics'>('requirements');
  const [selectedRequirement, setSelectedRequirement] = useState<string | null>(null);
  const [isCreatingRequirement, setIsCreatingRequirement] = useState(false);
  const [isCreatingSpec, setIsCreatingSpec] = useState(false);
  const [newRequirement, setNewRequirement] = useState<Partial<Requirement>>({
    title: '',
    description: '',
    category: 'functional',
    priority: 'medium',
    status: 'draft',
    estimatedHours: 0,
    actualHours: 0,
    progress: 0,
    dependencies: [],
    acceptanceCriteria: [],
    testCases: [],
    blockers: [],
    tags: [],
    notes: ''
  });

  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      requirements: {
        en: 'Requirements',
        ru: 'Требования'
      },
      specifications: {
        en: 'Technical Specifications',
        ru: 'Технические Спецификации'
      },
      milestones: {
        en: 'Project Milestones',
        ru: 'Вехи Проекта'
      },
      blockers: {
        en: 'Blockers & Issues',
        ru: 'Блокеры и Проблемы'
      },
      analytics: {
        en: 'Requirements Analytics',
        ru: 'Аналитика Требований'
      },
      createRequirement: {
        en: 'Create Requirement',
        ru: 'Создать Требование'
      },
      title: {
        en: 'Title',
        ru: 'Название'
      },
      description: {
        en: 'Description',
        ru: 'Описание'
      },
      category: {
        en: 'Category',
        ru: 'Категория'
      },
      priority: {
        en: 'Priority',
        ru: 'Приоритет'
      },
      status: {
        en: 'Status',
        ru: 'Статус'
      },
      progress: {
        en: 'Progress',
        ru: 'Прогресс'
      },
      functional: {
        en: 'Functional',
        ru: 'Функциональное'
      },
      'non-functional': {
        en: 'Non-Functional',
        ru: 'Нефункциональное'
      },
      business: {
        en: 'Business',
        ru: 'Бизнес'
      },
      technical: {
        en: 'Technical',
        ru: 'Техническое'
      },
      security: {
        en: 'Security',
        ru: 'Безопасность'
      },
      critical: {
        en: 'Critical',
        ru: 'Критический'
      },
      high: {
        en: 'High',
        ru: 'Высокий'
      },
      medium: {
        en: 'Medium',
        ru: 'Средний'
      },
      low: {
        en: 'Low',
        ru: 'Низкий'
      },
      draft: {
        en: 'Draft',
        ru: 'Черновик'
      },
      approved: {
        en: 'Approved',
        ru: 'Утвержден'
      },
      'in-progress': {
        en: 'In Progress',
        ru: 'В Работе'
      },
      testing: {
        en: 'Testing',
        ru: 'Тестирование'
      },
      completed: {
        en: 'Completed',
        ru: 'Завершен'
      },
      blocked: {
        en: 'Blocked',
        ru: 'Заблокирован'
      },
      generateReport: {
        en: 'Generate Report',
        ru: 'Создать Отчет'
      },
      exportData: {
        en: 'Export Data',
        ru: 'Экспорт Данных'
      },
      importData: {
        en: 'Import Data',
        ru: 'Импорт Данных'
      },
      totalRequirements: {
        en: 'Total Requirements',
        ru: 'Всего Требований'
      },
      completedRequirements: {
        en: 'Completed',
        ru: 'Завершено'
      },
      activeBlockers: {
        en: 'Active Blockers',
        ru: 'Активные Блокеры'
      },
      overallProgress: {
        en: 'Overall Progress',
        ru: 'Общий Прогресс'
      }
    };

    return translations[key]?.[language] || key;
  };

  // Calculate overall project statistics
  const calculateProjectStats = () => {
    const total = (requirements || []).length;
    const completed = (requirements || []).filter(r => r.status === 'completed').length;
    const inProgress = (requirements || []).filter(r => r.status === 'in-progress').length;
    const blocked = (requirements || []).filter(r => r.status === 'blocked').length;
    const activeBlockers = (blockers || []).filter(b => b.status === 'open' || b.status === 'in-progress').length;
    
    const overallProgress = total > 0 ? 
      (requirements || []).reduce((sum, r) => sum + r.progress, 0) / total : 0;

    return {
      total,
      completed,
      inProgress,
      blocked,
      activeBlockers,
      overallProgress: Math.round(overallProgress)
    };
  };

  const stats = calculateProjectStats();

  // Create new requirement
  const createRequirement = async () => {
    if (!newRequirement.title?.trim()) {
      toast.error(language === 'ru' ? 'Название обязательно' : 'Title is required');
      return;
    }

    const requirement: Requirement = {
      id: `req-${Date.now()}`,
      title: newRequirement.title!,
      description: newRequirement.description || '',
      category: newRequirement.category || 'functional',
      priority: newRequirement.priority || 'medium',
      status: 'draft',
      estimatedHours: newRequirement.estimatedHours || 0,
      actualHours: 0,
      progress: 0,
      dependencies: [],
      acceptanceCriteria: [],
      testCases: [],
      blockers: [],
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
      status: 'draft',
      estimatedHours: 0,
      actualHours: 0,
      progress: 0,
      dependencies: [],
      acceptanceCriteria: [],
      testCases: [],
      blockers: [],
      tags: [],
      notes: ''
    });
    setIsCreatingRequirement(false);

    toast.success(language === 'ru' ? 'Требование создано' : 'Requirement created');
    onRequirementUpdated?.(requirement);
  };

  // Update requirement progress
  const updateRequirementProgress = (requirementId: string, progress: number) => {
    setRequirements(current =>
      (current || []).map(req =>
        req.id === requirementId
          ? {
              ...req,
              progress,
              status: progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : req.status,
              updatedAt: new Date().toISOString(),
              completedAt: progress === 100 ? new Date().toISOString() : undefined
            }
          : req
      )
    );

    onProgressUpdate?.(requirementId, progress);
    
    if (progress === 100) {
      toast.success(language === 'ru' ? 'Требование завершено!' : 'Requirement completed!');
    }
  };

  // Generate AI-powered requirements analysis
  const generateRequirementsAnalysis = async () => {
    try {
      const requirementsData = {
        total: stats.total,
        completed: stats.completed,
        inProgress: stats.inProgress,
        blocked: stats.blocked,
        activeBlockers: stats.activeBlockers,
        overallProgress: stats.overallProgress,
        requirements: (requirements || []).map(r => ({
          title: r.title,
          category: r.category,
          priority: r.priority,
          status: r.status,
          progress: r.progress,
          estimatedHours: r.estimatedHours,
          actualHours: r.actualHours
        }))
      };

      const prompt = spark.llmPrompt`Analyze this project requirements data and generate insights:

${JSON.stringify(requirementsData, null, 2)}

Provide analysis in ${language === 'ru' ? 'Russian' : 'English'} covering:
1. Overall project health assessment
2. Risk areas and potential bottlenecks
3. Resource allocation recommendations
4. Timeline predictions
5. Quality indicators
6. Actionable next steps

Return as JSON with properties: health, risks, recommendations, timeline, quality, nextSteps`;

      const response = await spark.llm(prompt, 'gpt-4o-mini', true);
      const analysis = JSON.parse(response);

      toast.success(language === 'ru' ? 'Анализ завершен' : 'Analysis completed');
      
      // Display analysis results in a dialog or new section
      console.log('Requirements Analysis:', analysis);
      
    } catch (error) {
      toast.error(language === 'ru' ? 'Ошибка анализа' : 'Analysis failed');
      console.error('Analysis error:', error);
    }
  };

  // Export requirements data
  const exportRequirementsData = () => {
    const exportData = {
      projectId,
      exportDate: new Date().toISOString(),
      requirements: requirements || [],
      specifications: specifications || [],
      milestones: milestones || [],
      blockers: blockers || [],
      statistics: stats
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `requirements-${projectId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(language === 'ru' ? 'Данные экспортированы' : 'Data exported');
  };

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks size={24} className="text-primary" />
            {language === 'ru' ? 'Трекер Требований Проекта' : 'Project Requirements Tracker'}
          </CardTitle>
          <CardDescription>
            {language === 'ru' 
              ? 'Управление требованиями, спецификациями и прогрессом проекта'
              : 'Manage project requirements, specifications, and progress tracking'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">{t('totalRequirements')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">{t('completedRequirements')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{stats.inProgress}</div>
              <div className="text-sm text-muted-foreground">{t('in-progress')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{stats.activeBlockers}</div>
              <div className="text-sm text-muted-foreground">{t('activeBlockers')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{stats.overallProgress}%</div>
              <div className="text-sm text-muted-foreground">{t('overallProgress')}</div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Progress value={stats.overallProgress} className="w-48" />
              <span className="text-sm text-muted-foreground">
                {stats.overallProgress}% {language === 'ru' ? 'завершено' : 'complete'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={generateRequirementsAnalysis} variant="outline" size="sm">
                <TrendUp size={16} className="mr-2" />
                {t('generateReport')}
              </Button>
              <Button onClick={exportRequirementsData} variant="outline" size="sm">
                <Download size={16} className="mr-2" />
                {t('exportData')}
              </Button>
              <Dialog open={isCreatingRequirement} onOpenChange={setIsCreatingRequirement}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus size={16} className="mr-2" />
                    {t('createRequirement')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t('createRequirement')}</DialogTitle>
                    <DialogDescription>
                      {language === 'ru' 
                        ? 'Создайте новое требование для проекта'
                        : 'Create a new requirement for the project'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="req-title">{t('title')}</Label>
                      <Input
                        id="req-title"
                        value={newRequirement.title || ''}
                        onChange={(e) => setNewRequirement(prev => ({...prev, title: e.target.value}))}
                        placeholder={language === 'ru' ? 'Название требования' : 'Requirement title'}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="req-description">{t('description')}</Label>
                      <Textarea
                        id="req-description"
                        value={newRequirement.description || ''}
                        onChange={(e) => setNewRequirement(prev => ({...prev, description: e.target.value}))}
                        placeholder={language === 'ru' ? 'Подробное описание требования' : 'Detailed requirement description'}
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="req-category">{t('category')}</Label>
                        <Select
                          value={newRequirement.category}
                          onValueChange={(value: any) => setNewRequirement(prev => ({...prev, category: value}))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="functional">{t('functional')}</SelectItem>
                            <SelectItem value="non-functional">{t('non-functional')}</SelectItem>
                            <SelectItem value="business">{t('business')}</SelectItem>
                            <SelectItem value="technical">{t('technical')}</SelectItem>
                            <SelectItem value="security">{t('security')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="req-priority">{t('priority')}</Label>
                        <Select
                          value={newRequirement.priority}
                          onValueChange={(value: any) => setNewRequirement(prev => ({...prev, priority: value}))}
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
                    
                    <div>
                      <Label htmlFor="req-hours">
                        {language === 'ru' ? 'Оценка часов' : 'Estimated Hours'}
                      </Label>
                      <Input
                        id="req-hours"
                        type="number"
                        value={newRequirement.estimatedHours || 0}
                        onChange={(e) => setNewRequirement(prev => ({...prev, estimatedHours: parseInt(e.target.value) || 0}))}
                        min="0"
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreatingRequirement(false)}
                      >
                        {language === 'ru' ? 'Отмена' : 'Cancel'}
                      </Button>
                      <Button onClick={createRequirement}>
                        {language === 'ru' ? 'Создать' : 'Create'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            {t('requirements')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(requirements || []).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {language === 'ru' 
                ? 'Нет требований. Создайте первое требование для начала работы.'
                : 'No requirements yet. Create your first requirement to get started.'
              }
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {(requirements || []).map(requirement => (
                  <Card key={requirement.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{requirement.title}</h4>
                            <Badge variant={
                              requirement.priority === 'critical' ? 'destructive' :
                              requirement.priority === 'high' ? 'default' :
                              'secondary'
                            }>
                              {t(requirement.priority)}
                            </Badge>
                            <Badge variant="outline">
                              {t(requirement.category)}
                            </Badge>
                            <Badge variant={
                              requirement.status === 'completed' ? 'default' :
                              requirement.status === 'blocked' ? 'destructive' :
                              'secondary'
                            }>
                              {t(requirement.status)}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {requirement.description}
                          </p>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Progress value={requirement.progress} className="w-24" />
                              <span className="text-sm text-muted-foreground">
                                {requirement.progress}%
                              </span>
                            </div>
                            
                            <div className="text-xs text-muted-foreground">
                              {language === 'ru' ? 'Часы:' : 'Hours:'} 
                              {requirement.actualHours} / {requirement.estimatedHours}
                            </div>
                            
                            {requirement.blockers.length > 0 && (
                              <div className="flex items-center gap-1 text-destructive">
                                <WarningOctagon size={14} />
                                <span className="text-xs">
                                  {requirement.blockers.length} {language === 'ru' ? 'блокеров' : 'blockers'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Input
                            type="range"
                            min="0"
                            max="100"
                            value={requirement.progress}
                            onChange={(e) => updateRequirementProgress(requirement.id, parseInt(e.target.value))}
                            className="w-20"
                          />
                          {requirement.status === 'completed' && (
                            <CheckCircle size={20} className="text-green-500" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectRequirementsTracker;