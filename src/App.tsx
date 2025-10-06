import React, { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Brain,
  Users,
  FileText,
  Calendar,
  MapPin,
  Lightbulb,
  Gear,
  FloppyDisk,
  Eye,
  Download,
  Plus,
  ChartLine,
  Graph,
  Target,
  ArrowRight,
  CheckCircle,
  Warning,
  Star,
  Globe
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

// Access spark from global window object
const spark = (globalThis as any).spark;

// Language support
type Language = 'en' | 'ru';

interface Translations {
  [key: string]: {
    en: string;
    ru: string;
  };
}

const translations: Translations = {
  // Header
  appName: { en: 'AXON', ru: 'АКСОН' },
  appDescription: { en: 'Intelligence Analysis Platform', ru: 'Платформа Анализа Данных' },
  complete: { en: 'Complete', ru: 'Выполнено' },
  export: { en: 'Export', ru: 'Экспорт' },
  newAnalysis: { en: 'New Analysis', ru: 'Новый Анализ' },
  
  // Project creation
  createProject: { en: 'Create New Analysis Project', ru: 'Создать Новый Проект Анализа' },
  createProjectDesc: { en: 'Start a new systematic analysis using the IKR directive and Kipling protocol', ru: 'Начните новый систематический анализ, используя директиву IKR и протокол Киплинга' },
  projectTitle: { en: 'Project Title', ru: 'Название Проекта' },
  projectTitlePlaceholder: { en: 'Enter analysis project title', ru: 'Введите название проекта анализа' },
  description: { en: 'Description', ru: 'Описание' },
  descriptionPlaceholder: { en: 'Brief description of what you\'re analyzing', ru: 'Краткое описание того, что вы анализируете' },
  cancel: { en: 'Cancel', ru: 'Отмена' },
  createProjectBtn: { en: 'Create Project', ru: 'Создать Проект' },
  
  // Welcome screen
  welcome: { en: 'Welcome to AXON', ru: 'Добро пожаловать в АКСОН' },
  welcomeDesc: { en: 'Begin your systematic intelligence analysis using the IKR directive and Kipling protocol framework', ru: 'Начните ваш систематический анализ данных, используя директиву IKR и протокол Киплинга' },
  recentProjects: { en: 'Recent Projects', ru: 'Недавние Проекты' },
  createNewAnalysis: { en: 'Create New Analysis', ru: 'Создать Новый Анализ' },
  
  // Tabs
  overview: { en: 'Analysis Overview', ru: 'Обзор Анализа' },
  kipling: { en: 'Kipling Protocol', ru: 'Протокол Киплинга' },
  ikr: { en: 'IKR Directive', ru: 'Директива IKR' },
  
  // Kipling dimensions
  who: { en: 'Who', ru: 'Кто' },
  whoQuestion: { en: 'Who are the key stakeholders, actors, and decision-makers involved?', ru: 'Кто являются ключевыми заинтересованными сторонами, участниками и лицами, принимающими решения?' },
  what: { en: 'What', ru: 'Что' },
  whatQuestion: { en: 'What is happening, what are the core issues, and what needs to be addressed?', ru: 'Что происходит, какие основные проблемы и что нужно решить?' },
  when: { en: 'When', ru: 'Когда' },
  whenQuestion: { en: 'When did this occur, when must decisions be made, and what are the timelines?', ru: 'Когда это произошло, когда должны быть приняты решения, и каковы временные рамки?' },
  where: { en: 'Where', ru: 'Где' },
  whereQuestion: { en: 'Where is this taking place, what are the geographical or contextual locations?', ru: 'Где это происходит, каковы географические или контекстуальные места?' },
  why: { en: 'Why', ru: 'Почему' },
  whyQuestion: { en: 'Why is this happening, what are the underlying causes and motivations?', ru: 'Почему это происходит, каковы основные причины и мотивы?' },
  how: { en: 'How', ru: 'Как' },
  howQuestion: { en: 'How is this being executed, what are the methods and mechanisms?', ru: 'Как это выполняется, каковы методы и механизмы?' },
  
  // Priority levels
  high: { en: 'high', ru: 'высокий' },
  medium: { en: 'medium', ru: 'средний' },
  low: { en: 'low', ru: 'низкий' },
  
  // General UI
  noContent: { en: 'No analysis content yet', ru: 'Пока нет содержания анализа' },
  keyInsights: { en: 'Key Insights:', ru: 'Ключевые Выводы:' },
  analysisContent: { en: 'Analysis Content', ru: 'Содержание Анализа' },
  generateInsights: { en: 'Generate Insights', ru: 'Создать Выводы' },
  generatedInsights: { en: 'Generated Insights', ru: 'Созданные Выводы' },
  
  // IKR sections
  intelligence: { en: 'Intelligence Collection & Assessment', ru: 'Сбор и Оценка Разведданных' },
  intelligenceDesc: { en: 'Document the intelligence gathering process and raw information collected', ru: 'Документируйте процесс сбора разведданных и собранную исходную информацию' },
  intelligencePlaceholder: { en: 'Describe intelligence sources, collection methods, and raw data gathered. Include credibility assessments and information gaps.', ru: 'Опишите источники разведданных, методы сбора и собранные исходные данные. Включите оценки достоверности и информационные пробелы.' },
  knowledge: { en: 'Knowledge Synthesis & Integration', ru: 'Синтез и Интеграция Знаний' },
  knowledgeDesc: { en: 'Synthesize information into coherent knowledge patterns and relationships', ru: 'Синтезируйте информацию в связные паттерны знаний и взаимосвязи' },
  knowledgePlaceholder: { en: 'Synthesize patterns, connections, and relationships from the intelligence. Identify what we now know that we didn\'t know before.', ru: 'Синтезируйте паттерны, связи и отношения из разведданных. Определите, что мы теперь знаем, чего не знали раньше.' },
  reasoning: { en: 'Reasoning & Strategic Assessment', ru: 'Рассуждения и Стратегическая Оценка' },
  reasoningDesc: { en: 'Apply analytical reasoning to derive strategic insights and recommendations', ru: 'Применяйте аналитические рассуждения для получения стратегических выводов и рекомендаций' },
  reasoningPlaceholder: { en: 'Apply logical reasoning to the knowledge base. What are the implications, predictions, and recommended actions?', ru: 'Примените логические рассуждения к базе знаний. Каковы последствия, прогнозы и рекомендуемые действия?' },
  
  // Actions
  backToProjects: { en: 'Back to Projects', ru: 'Назад к Проектам' },
  exportReport: { en: 'Export Report', ru: 'Экспортировать Отчет' },
  saveProgress: { en: 'Save Progress', ru: 'Сохранить Прогресс' },
  language: { en: 'Language', ru: 'Язык' },
  
  // Toast messages
  projectTitleRequired: { en: 'Project title is required', ru: 'Название проекта обязательно' },
  projectCreated: { en: 'Analysis project created successfully', ru: 'Проект анализа успешно создан' },
  addContentFirst: { en: 'Add content first before generating insights', ru: 'Сначала добавьте содержание перед созданием выводов' },
  insightsGenerated: { en: 'Insights generated successfully', ru: 'Выводы успешно созданы' },
  failedToGenerate: { en: 'Failed to generate insights', ru: 'Не удалось создать выводы' },
  reportExported: { en: 'Analysis report exported', ru: 'Отчет анализа экспортирован' },
  analysisSaved: { en: 'Analysis saved automatically', ru: 'Анализ сохранен автоматически' }
};

const useTranslation = (language: Language) => {
  return (key: string): string => {
    return translations[key]?.[language] || key;
  };
};

// Type definitions for analysis structure
interface KiplingDimension {
  id: string;
  title: string;
  question: string;
  content: string;
  insights: string[];
  priority: 'high' | 'medium' | 'low';
  completeness: number;
  icon: React.ReactNode;
}

interface AnalysisProject {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  lastModified: string;
  completeness: number;
  dimensions: KiplingDimension[];
  ikrDirective: {
    intelligence: string;
    knowledge: string;
    reasoning: string;
  };
}

function App() {
  // Language state
  const [language, setLanguage] = useKV<Language>('axon-language', 'en');
  const currentLanguage = language || 'en';
  const t = useTranslation(currentLanguage);
  
  // Persistent storage for analysis projects
  const [projects, setProjects] = useKV<AnalysisProject[]>('axon-projects', []);
  const [currentProject, setCurrentProject] = useKV<string | null>('current-project', null);
  
  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  // Get current project data
  const project = projects?.find(p => p.id === currentProject);

  // Initialize default Kipling dimensions with translations
  const getDefaultDimensions = (lang: Language): KiplingDimension[] => [
    {
      id: 'who',
      title: t('who'),
      question: t('whoQuestion'),
      content: '',
      insights: [],
      priority: 'high',
      completeness: 0,
      icon: <Users size={20} />
    },
    {
      id: 'what',
      title: t('what'),
      question: t('whatQuestion'),
      content: '',
      insights: [],
      priority: 'high',
      completeness: 0,
      icon: <FileText size={20} />
    },
    {
      id: 'when',
      title: t('when'),
      question: t('whenQuestion'),
      content: '',
      insights: [],
      priority: 'medium',
      completeness: 0,
      icon: <Calendar size={20} />
    },
    {
      id: 'where',
      title: t('where'),
      question: t('whereQuestion'),
      content: '',
      insights: [],
      priority: 'medium',
      completeness: 0,
      icon: <MapPin size={20} />
    },
    {
      id: 'why',
      title: t('why'),
      question: t('whyQuestion'),
      content: '',
      insights: [],
      priority: 'high',
      completeness: 0,
      icon: <Lightbulb size={20} />
    },
    {
      id: 'how',
      title: t('how'),
      question: t('howQuestion'),
      content: '',
      insights: [],
      priority: 'high',
      completeness: 0,
      icon: <Gear size={20} />
    }
  ];

  // Create new analysis project
  const createProject = () => {
    if (!newProjectTitle.trim()) {
      toast.error(t('projectTitleRequired'));
      return;
    }

    const newProject: AnalysisProject = {
      id: Date.now().toString(),
      title: newProjectTitle,
      description: newProjectDescription,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      completeness: 0,
      dimensions: getDefaultDimensions(currentLanguage),
      ikrDirective: {
        intelligence: '',
        knowledge: '',
        reasoning: ''
      }
    };

    setProjects(current => [...(current || []), newProject]);
    setCurrentProject(newProject.id);
    setNewProjectTitle('');
    setNewProjectDescription('');
    setIsCreatingProject(false);
    toast.success(t('projectCreated'));
  };

  // Update dimension content
  const updateDimension = (dimensionId: string, field: keyof KiplingDimension, value: any) => {
    if (!project) return;

    setProjects(current => 
      (current || []).map(p => 
        p.id === project.id 
          ? {
              ...p,
              lastModified: new Date().toISOString(),
              dimensions: p.dimensions.map(d => 
                d.id === dimensionId 
                  ? { 
                      ...d, 
                      [field]: value,
                      completeness: field === 'content' ? Math.min(100, (value as string).length / 10) : d.completeness
                    }
                  : d
              )
            }
          : p
      )
    );
  };

  // Update IKR directive
  const updateIKR = (field: keyof AnalysisProject['ikrDirective'], value: string) => {
    if (!project) return;

    setProjects(current => 
      (current || []).map(p => 
        p.id === project.id 
          ? {
              ...p,
              lastModified: new Date().toISOString(),
              ikrDirective: { ...p.ikrDirective, [field]: value }
            }
          : p
      )
    );
  };

  // Calculate overall project completeness
  const calculateCompleteness = (proj: AnalysisProject) => {
    const dimensionCompleteness = proj.dimensions.reduce((sum, d) => sum + d.completeness, 0) / proj.dimensions.length;
    const ikrCompleteness = Object.values(proj.ikrDirective).reduce((sum, value) => 
      sum + (value.length > 50 ? 100 : value.length * 2), 0
    ) / 3;
    return Math.round((dimensionCompleteness + ikrCompleteness) / 2);
  };

  // Generate insights using LLM
  const generateInsights = async (dimensionId: string) => {
    if (!project) return;
    
    const dimension = project.dimensions.find(d => d.id === dimensionId);
    if (!dimension || !dimension.content) {
      toast.error(t('addContentFirst'));
      return;
    }

    try {
      const prompt = spark.llmPrompt`Based on this ${dimension.title} analysis: "${dimension.content}", generate 3-5 key insights or action items. Focus on actionable intelligence that follows the IKR directive. Return as a JSON object with a single property called "insights" containing an array of insight strings.`;
      
      const response = await spark.llm(prompt, 'gpt-4o-mini', true);
      const result = JSON.parse(response);
      
      updateDimension(dimensionId, 'insights', result.insights || []);
      toast.success(t('insightsGenerated'));
    } catch (error) {
      toast.error(t('failedToGenerate'));
      console.error('Error generating insights:', error);
    }
  };

  // Export analysis report
  const exportReport = async () => {
    if (!project) return;

    const reportData = {
      project: project.title,
      completeness: calculateCompleteness(project),
      timestamp: new Date().toISOString(),
      ikrDirective: project.ikrDirective,
      kiplingAnalysis: project.dimensions.map(d => ({
        dimension: d.title,
        question: d.question,
        analysis: d.content,
        insights: d.insights,
        priority: d.priority
      }))
    };

    // Create downloadable JSON file
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `axon-analysis-${project.title.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(t('reportExported'));
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain size={32} className="text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t('appName')}</h1>
                <p className="text-sm text-muted-foreground">{t('appDescription')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <Select value={currentLanguage} onValueChange={(value: Language) => setLanguage(value)}>
                <SelectTrigger className="w-24">
                  <div className="flex items-center gap-2">
                    <Globe size={16} />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">EN</SelectItem>
                  <SelectItem value="ru">RU</SelectItem>
                </SelectContent>
              </Select>

              {project && (
                <>
                  <Badge variant="secondary" className="text-xs">
                    {calculateCompleteness(project)}% {t('complete')}
                  </Badge>
                  <Button onClick={exportReport} variant="outline" size="sm">
                    <Download size={16} className="mr-2" />
                    {t('export')}
                  </Button>
                </>
              )}
              
              <Dialog open={isCreatingProject} onOpenChange={setIsCreatingProject}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus size={16} className="mr-2" />
                    {t('newAnalysis')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('createProject')}</DialogTitle>
                    <DialogDescription>
                      {t('createProjectDesc')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">{t('projectTitle')}</Label>
                      <Input
                        id="title"
                        value={newProjectTitle}
                        onChange={(e) => setNewProjectTitle(e.target.value)}
                        placeholder={t('projectTitlePlaceholder')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">{t('description')}</Label>
                      <Textarea
                        id="description"
                        value={newProjectDescription}
                        onChange={(e) => setNewProjectDescription(e.target.value)}
                        placeholder={t('descriptionPlaceholder')}
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreatingProject(false)}>
                        {t('cancel')}
                      </Button>
                      <Button onClick={createProject}>{t('createProjectBtn')}</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        {!project ? (
          // Project Selection Screen
          <div className="text-center py-12">
            <ChartLine size={64} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">{t('welcome')}</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t('welcomeDesc')}
            </p>
            
            {(projects || []).length > 0 && (
              <div className="max-w-2xl mx-auto mb-8">
                <h3 className="text-lg font-medium mb-4">{t('recentProjects')}</h3>
                <div className="grid gap-3">
                  {(projects || []).map(proj => (
                    <Card key={proj.id} className="cursor-pointer hover:shadow-md transition-shadow" 
                          onClick={() => setCurrentProject(proj.id)}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="text-left">
                          <h4 className="font-medium">{proj.title}</h4>
                          <p className="text-sm text-muted-foreground">{proj.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={calculateCompleteness(proj)} className="w-20" />
                          <ArrowRight size={20} className="text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            <Button onClick={() => setIsCreatingProject(true)} size="lg">
              <Plus size={20} className="mr-2" />
              {t('createNewAnalysis')}
            </Button>
          </div>
        ) : (
          // Analysis Interface
          <div className="space-y-6">
            {/* Project Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">{project.title}</h2>
                <p className="text-muted-foreground">{project.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <Progress value={calculateCompleteness(project)} className="w-32" />
                <Badge variant={calculateCompleteness(project) > 80 ? 'default' : 'secondary'}>
                  {calculateCompleteness(project)}% {t('complete')}
                </Badge>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
                <TabsTrigger value="kipling">{t('kipling')}</TabsTrigger>
                <TabsTrigger value="ikr">{t('ikr')}</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {project.dimensions.map(dimension => (
                    <Card key={dimension.id} className="kipling-dimension">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {dimension.icon}
                            <CardTitle className="text-lg">{dimension.title}</CardTitle>
                          </div>
                          <Badge variant={dimension.priority === 'high' ? 'default' : 'secondary'}>
                            {t(dimension.priority)}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {dimension.question}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Progress value={dimension.completeness} className="h-1" />
                          <p className="text-sm text-muted-foreground">
                            {dimension.content ? 
                              `${dimension.content.substring(0, 100)}${dimension.content.length > 100 ? '...' : ''}` :
                              t('noContent')
                            }
                          </p>
                          {dimension.insights.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-accent">{t('keyInsights')}</p>
                              <ul className="text-xs space-y-1">
                                {dimension.insights.slice(0, 2).map((insight, i) => (
                                  <li key={i} className="flex items-start gap-1">
                                    <Star size={12} className="text-accent mt-0.5 flex-shrink-0" />
                                    <span>{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Kipling Protocol Tab */}
              <TabsContent value="kipling" className="space-y-6">
                <div className="grid gap-6">
                  {project.dimensions.map(dimension => (
                    <Card key={dimension.id}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          {dimension.icon}
                          <div>
                            <CardTitle className="text-xl">{dimension.title}</CardTitle>
                            <CardDescription>{dimension.question}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor={`content-${dimension.id}`}>{t('analysisContent')}</Label>
                          <Textarea
                            id={`content-${dimension.id}`}
                            value={dimension.content}
                            onChange={(e) => updateDimension(dimension.id, 'content', e.target.value)}
                            placeholder={`${t('analysisContent')}: ${dimension.question}`}
                            rows={6}
                            className="mt-2"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Progress value={dimension.completeness} className="w-32" />
                            <span className="text-sm text-muted-foreground">
                              {Math.round(dimension.completeness)}% {t('complete').toLowerCase()}
                            </span>
                          </div>
                          <Button 
                            onClick={() => generateInsights(dimension.id)}
                            variant="outline" 
                            size="sm"
                            disabled={!dimension.content}
                          >
                            <Brain size={16} className="mr-2" />
                            {t('generateInsights')}
                          </Button>
                        </div>

                        {dimension.insights.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Star size={16} className="text-accent" />
                                {t('generatedInsights')}
                              </h4>
                              <ul className="space-y-2">
                                {dimension.insights.map((insight, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* IKR Directive Tab */}
              <TabsContent value="ikr" className="space-y-6">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target size={24} className="text-primary" />
                        {t('intelligence')}
                      </CardTitle>
                      <CardDescription>
                        {t('intelligenceDesc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={project.ikrDirective.intelligence}
                        onChange={(e) => updateIKR('intelligence', e.target.value)}
                        placeholder={t('intelligencePlaceholder')}
                        rows={6}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Graph size={24} className="text-primary" />
                        {t('knowledge')}
                      </CardTitle>
                      <CardDescription>
                        {t('knowledgeDesc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={project.ikrDirective.knowledge}
                        onChange={(e) => updateIKR('knowledge', e.target.value)}
                        placeholder={t('knowledgePlaceholder')}
                        rows={6}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb size={24} className="text-primary" />
                        {t('reasoning')}
                      </CardTitle>
                      <CardDescription>
                        {t('reasoningDesc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={project.ikrDirective.reasoning}
                        onChange={(e) => updateIKR('reasoning', e.target.value)}
                        placeholder={t('reasoningPlaceholder')}
                        rows={6}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button variant="outline" onClick={() => setCurrentProject(null)}>
                <ArrowRight size={16} className="mr-2 rotate-180" />
                {t('backToProjects')}
              </Button>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={exportReport}>
                  <Download size={16} className="mr-2" />
                  {t('exportReport')}
                </Button>
                <Button onClick={() => toast.success(t('analysisSaved'))}>
                  <FloppyDisk size={16} className="mr-2" />
                  {t('saveProgress')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;