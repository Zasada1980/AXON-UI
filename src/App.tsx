import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import NavigationMenu from './components/NavigationMenu';
import ProjectOverview from './pages/ProjectOverview';
import KiplingAnalysisPage from './pages/KiplingAnalysisPage';
import IntelligencePage from './pages/IntelligencePage';
import FilesPage from './pages/FilesPage';
import DiagnosticsPage from './pages/DiagnosticsPage';
import IKRDirectivePage from './pages/IKRDirectivePage';
import AuditPage from './pages/AuditPage';
import DebatePage from './pages/DebatePage';
import UnderDevelopmentPage from './pages/UnderDevelopmentPage';
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
  Globe,
  Robot,
  Shield,
  Play,
  Pause,
  Stop,
  ListChecks,
  Bug,
  SecurityCamera,
  Question,
  Key,
  CloudArrowUp,
  ChatCircle,
  PaperPlaneTilt,
  Microphone,
  MicrophoneSlash,
  Headphones,
  Bell,
  MagnifyingGlass,
  Cpu,
  Database,
  List,
  X
} from '@phosphor-icons/react';

// Types
type Language = 'en' | 'ru';

interface KiplingDimension {
  id: string;
  title: string;
  question: string;
  content: string;
  insights: string[];
  priority: 'high' | 'medium' | 'low';
  completeness: number;
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
  auditAgents: any[];
  auditSessions: any[];
  chatSessions: any[];
}

// Language support
const translations: Record<string, { en: string; ru: string }> = {
  appName: { en: 'AXON', ru: 'АКСОН' },
  appDescription: { en: 'Intelligence Analysis Platform', ru: 'Платформа Анализа Данных' },
  complete: { en: 'Complete', ru: 'Выполнено' },
  export: { en: 'Export', ru: 'Экспорт' },
  newAnalysis: { en: 'New Analysis', ru: 'Новый Анализ' },
  navigation: { en: 'Navigation', ru: 'Навигация' },
  close: { en: 'Close', ru: 'Закрыть' },
  
  // Project creation
  createProject: { en: 'Create New Analysis Project', ru: 'Создать Новый Проект Анализа' },
  createProjectDesc: { en: 'Start a new systematic analysis using the IKR directive and Kipling protocol', ru: 'Начните новый систематический анализ, используя директиву IKR и протокол Киплинга' },
  projectTitle: { en: 'Project Title', ru: 'Название Проекта' },
  projectTitlePlaceholder: { en: 'Enter analysis project title', ru: 'Введите название проекта анализа' },
  description: { en: 'Description', ru: 'Описание' },
  descriptionPlaceholder: { en: 'Brief description of what you are analyzing', ru: 'Краткое описание того, что вы анализируете' },
  cancel: { en: 'Cancel', ru: 'Отмена' },
  createProjectBtn: { en: 'Create Project', ru: 'Создать Проект' },
  
  // Welcome screen
  welcome: { en: 'Welcome to AXON', ru: 'Добро пожаловать в АКСОН' },
  welcomeDesc: { en: 'Begin your systematic intelligence analysis using the IKR directive and Kipling protocol framework', ru: 'Начните ваш систематический анализ данных, используя директиву IKR и протокол Киплинга' },
  recentProjects: { en: 'Recent Projects', ru: 'Недавние Проекты' },
  createNewAnalysis: { en: 'Create New Analysis', ru: 'Создать Новый Анализ' },
  
  projectTitleRequired: { en: 'Project title is required', ru: 'Название проекта обязательно' },
  projectCreated: { en: 'Analysis project created successfully', ru: 'Проект анализа успешно создан' },
};

const useTranslation = (language: Language) => {
  return (key: string): string => {
    return translations[key]?.[language] || key;
  };
};

function App() {
  // Language state
  const [language, setLanguage] = useKV<Language>('axon-language', 'en');
  const currentLanguage: Language = language || 'en';
  const t = useTranslation(currentLanguage);
  
  // Persistent storage for analysis projects
  const [projects, setProjects] = useKV<AnalysisProject[]>('axon-projects', []);
  const [currentProject, setCurrentProject] = useKV<string | null>('current-project', null);
  
  // Navigation state
  const [currentPage, setCurrentPage] = useKV<string>('current-page', 'overview');
  const [showNavigationMenu, setShowNavigationMenu] = useState(false);
  
  // UI state
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  
  // System health monitoring
  const [systemHealth, setSystemHealth] = useKV<{
    overall: number;
    components: {
      storage: number;
      ai: number;
      ui: number;
      memory: number;
    };
    lastCheck: string;
    issues: string[];
  }>('system-health', {
    overall: 100,
    components: { storage: 100, ai: 100, ui: 100, memory: 100 },
    lastCheck: new Date().toISOString(),
    issues: []
  });

  // Get current project data
  const projectData = projects?.find(p => p.id === currentProject);

  // System health check
  const runSystemHealthCheck = async () => {
    const startTime = performance.now();
    const issues: string[] = [];
    let overallHealth = 100;

    // Check storage health
    const storageHealth = projects ? Math.min(100, projects.length < 50 ? 100 : 100 - (projects.length - 50) * 2) : 100;
    if (storageHealth < 80) issues.push('High storage usage detected');

    // Check AI connectivity (mock)
    const aiHealth = Math.random() > 0.1 ? 100 : 60;
    if (aiHealth < 80) issues.push('AI service connectivity issues');

    // Check UI responsiveness
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    const uiHealth = responseTime < 100 ? 100 : Math.max(60, 100 - (responseTime - 100) / 10);
    if (uiHealth < 80) issues.push('UI responsiveness degraded');

    // Check memory health (approximation)
    const perfMemory = (performance as any).memory;
    const memoryHealth = perfMemory ? 
      Math.max(60, 100 - (perfMemory.usedJSHeapSize / perfMemory.jsHeapSizeLimit) * 40) : 95;
    if (memoryHealth < 80) issues.push('High memory usage detected');

    overallHealth = Math.round((storageHealth + aiHealth + uiHealth + memoryHealth) / 4);

    setSystemHealth({
      overall: overallHealth,
      components: {
        storage: storageHealth,
        ai: aiHealth,
        ui: uiHealth,
        memory: memoryHealth
      },
      lastCheck: new Date().toISOString(),
      issues
    });

    return overallHealth;
  };

  // Run health checks periodically
  useEffect(() => {
    runSystemHealthCheck();
    const healthCheckInterval = setInterval(runSystemHealthCheck, 60000); // Every minute
    return () => clearInterval(healthCheckInterval);
  }, [projects]);

  // Initialize default Kipling dimensions
  const getDefaultDimensions = (lang: Language): KiplingDimension[] => [
    {
      id: 'who',
      title: lang === 'ru' ? 'Кто' : 'Who',
      question: lang === 'ru' ? 'Кто являются ключевыми заинтересованными сторонами?' : 'Who are the key stakeholders involved?',
      content: '',
      insights: [],
      priority: 'high',
      completeness: 0
    },
    {
      id: 'what',
      title: lang === 'ru' ? 'Что' : 'What',
      question: lang === 'ru' ? 'Что происходит и что нужно решить?' : 'What is happening and what needs to be addressed?',
      content: '',
      insights: [],
      priority: 'high',
      completeness: 0
    },
    {
      id: 'when',
      title: lang === 'ru' ? 'Когда' : 'When',
      question: lang === 'ru' ? 'Когда это произошло и каковы временные рамки?' : 'When did this occur and what are the timelines?',
      content: '',
      insights: [],
      priority: 'medium',
      completeness: 0
    },
    {
      id: 'where',
      title: lang === 'ru' ? 'Где' : 'Where',
      question: lang === 'ru' ? 'Где это происходит?' : 'Where is this taking place?',
      content: '',
      insights: [],
      priority: 'medium',
      completeness: 0
    },
    {
      id: 'why',
      title: lang === 'ru' ? 'Почему' : 'Why',
      question: lang === 'ru' ? 'Почему это происходит?' : 'Why is this happening?',
      content: '',
      insights: [],
      priority: 'high',
      completeness: 0
    },
    {
      id: 'how',
      title: lang === 'ru' ? 'Как' : 'How',
      question: lang === 'ru' ? 'Как это выполняется?' : 'How is this being executed?',
      content: '',
      insights: [],
      priority: 'high',
      completeness: 0
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
      },
      auditAgents: [],
      auditSessions: [],
      chatSessions: []
    };

    setProjects(current => [...(current || []), newProject]);
    setCurrentProject(newProject.id);
    setNewProjectTitle('');
    setNewProjectDescription('');
    setIsCreatingProject(false);
    setCurrentPage('overview');
    toast.success(t('projectCreated'));
  };

  // Calculate overall project completeness
  const calculateCompleteness = (proj: AnalysisProject) => {
    const dimensions = proj.dimensions || [];
    const dimensionCompleteness = dimensions.length > 0 
      ? dimensions.reduce((sum, d) => sum + (d.completeness || 0), 0) / dimensions.length
      : 0;
    const ikrDirective = proj.ikrDirective || { intelligence: '', knowledge: '', reasoning: '' };
    const ikrCompleteness = Object.values(ikrDirective).reduce((sum, value) => 
      sum + ((value || '').length > 50 ? 100 : (value || '').length * 2), 0
    ) / 3;
    return Math.round((dimensionCompleteness + ikrCompleteness) / 2);
  };

  // Page navigation handler
  const handleNavigate = (pageId: string) => {
    setCurrentPage(pageId);
    setShowNavigationMenu(false);
  };

  // Render different pages based on current page
  const renderCurrentPage = () => {
    if (!projectData) return null;

    switch (currentPage) {
      case 'overview':
        return (
          <ProjectOverview
            language={currentLanguage}
            projectId={projectData.id}
            onNavigate={handleNavigate}
          />
        );
        
      case 'intelligence':
        return (
          <IntelligencePage
            language={currentLanguage}
            projectId={projectData.id}
            onNavigate={handleNavigate}
          />
        );
        
      case 'kipling':
        return (
          <KiplingAnalysisPage
            language={currentLanguage}
            projectId={projectData.id}
            onNavigate={handleNavigate}
          />
        );
        
      case 'ikr':
        return (
          <IKRDirectivePage
            language={currentLanguage}
            projectId={projectData.id}
            onNavigate={handleNavigate}
          />
        );
        
      case 'audit':
        return (
          <AuditPage
            language={currentLanguage}
            projectId={projectData.id}
            onNavigate={handleNavigate}
          />
        );
        
      case 'debate':
        return (
          <DebatePage
            language={currentLanguage}
            projectId={projectData.id}
            onNavigate={handleNavigate}
          />
        );
        
      case 'files':
        return (
          <FilesPage
            language={currentLanguage}
            projectId={projectData.id}
            onNavigate={handleNavigate}
          />
        );
        
      case 'diagnostics':
        return (
          <DiagnosticsPage
            language={currentLanguage}
            projectId={projectData.id}
            onNavigate={handleNavigate}
          />
        );
        
      default:
        return (
          <UnderDevelopmentPage
            language={currentLanguage}
            projectId={projectData?.id || ''}
            onNavigate={handleNavigate}
            pageName={currentLanguage === 'ru' ? 'Страница в разработке' : 'Page Under Development'}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navigation Menu Overlay */}
      {showNavigationMenu && (
        <div className="fixed inset-0 z-50 bg-background">
          <NavigationMenu
            language={currentLanguage}
            currentPage={currentPage || 'overview'}
            onNavigate={handleNavigate}
            onBack={() => setShowNavigationMenu(false)}
            systemHealth={systemHealth}
            projectTitle={projectData?.title || 'Untitled Project'}
          />
        </div>
      )}

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
              {/* System Health Indicator */}
              {systemHealth && (
                <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/50">
                  <div 
                    className={`w-2 h-2 rounded-full ${
                      systemHealth.overall >= 90 ? 'bg-green-500' :
                      systemHealth.overall >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    } ${systemHealth.overall < 100 ? 'animate-pulse' : ''}`}
                  />
                  <span className="text-xs text-muted-foreground">
                    System: {systemHealth.overall}%
                  </span>
                </div>
              )}

              {/* Navigation Button */}
              {projectData && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowNavigationMenu(true)}
                >
                  <List size={16} className="mr-2" />
                  {t('navigation')}
                </Button>
              )}

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

              {projectData && (
                <Badge variant="secondary" className="text-xs">
                  {calculateCompleteness(projectData)}% {t('complete')}
                </Badge>
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
        {!projectData ? (
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
          // Project Analysis Interface
          renderCurrentPage()
        )}
      </main>
    </div>
  );
}

export default App;