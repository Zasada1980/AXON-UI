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
  CloudArrowUp
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
  aiAudit: { en: 'AI Audit', ru: 'Аудит ИИ' },
  
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
  
  // AI Audit section
  auditAgents: { en: 'Audit Agents', ru: 'Агенты Аудита' },
  auditAgentsDesc: { en: 'Configure and manage AI audit agents for systematic analysis', ru: 'Настройте и управляйте агентами аудита ИИ для систематического анализа' },
  selectAgent: { en: 'Select Agent', ru: 'Выбрать Агента' },
  agentSettings: { en: 'Agent Settings', ru: 'Настройки Агента' },
  auditType: { en: 'Audit Type', ru: 'Тип Аудита' },
  startAudit: { en: 'Start Audit', ru: 'Начать Аудит' },
  stopAudit: { en: 'Stop Audit', ru: 'Остановить Аудит' },
  auditResults: { en: 'Audit Results', ru: 'Результаты Аудита' },
  auditStatus: { en: 'Audit Status', ru: 'Статус Аудита' },
  
  // Agent types
  securityAgent: { en: 'Security Agent', ru: 'Агент Безопасности' },
  securityAgentDesc: { en: 'Analyzes security vulnerabilities and threats', ru: 'Анализирует уязвимости безопасности и угрозы' },
  biasAgent: { en: 'Bias Detection Agent', ru: 'Агент Обнаружения Предвзятости' },
  biasAgentDesc: { en: 'Detects algorithmic bias and fairness issues', ru: 'Обнаруживает алгоритмическую предвзятость и проблемы справедливости' },
  performanceAgent: { en: 'Performance Agent', ru: 'Агент Производительности' },
  performanceAgentDesc: { en: 'Monitors AI model performance and accuracy', ru: 'Отслеживает производительность и точность модели ИИ' },
  complianceAgent: { en: 'Compliance Agent', ru: 'Агент Соответствия' },
  complianceAgentDesc: { en: 'Ensures regulatory and ethical compliance', ru: 'Обеспечивает соответствие нормативным и этическим требованиям' },
  
  // Audit types
  fullAudit: { en: 'Full System Audit', ru: 'Полный Аудит Системы' },
  quickScan: { en: 'Quick Security Scan', ru: 'Быстрое Сканирование Безопасности' },
  biasAudit: { en: 'Bias Assessment', ru: 'Оценка Предвзятости' },
  performanceAudit: { en: 'Performance Review', ru: 'Обзор Производительности' },
  
  // Audit status
  idle: { en: 'Idle', ru: 'Ожидание' },
  running: { en: 'Running', ru: 'Выполняется' },
  completed: { en: 'Completed', ru: 'Завершено' },
  failed: { en: 'Failed', ru: 'Не удался' },
  
  // Agent settings
  sensitivity: { en: 'Sensitivity Level', ru: 'Уровень Чувствительности' },
  depth: { en: 'Analysis Depth', ru: 'Глубина Анализа' },
  scope: { en: 'Audit Scope', ru: 'Область Аудита' },
  threshold: { en: 'Alert Threshold', ru: 'Порог Оповещения' },
  
  // Actions
  backToProjects: { en: 'Back to Projects', ru: 'Назад к Проектам' },
  exportReport: { en: 'Export Report', ru: 'Экспортировать Отчет' },
  saveProgress: { en: 'Save Progress', ru: 'Сохранить Прогресс' },
  language: { en: 'Language', ru: 'Язык' },
  configure: { en: 'Configure', ru: 'Настроить' },
  
  // Toast messages
  projectTitleRequired: { en: 'Project title is required', ru: 'Название проекта обязательно' },
  projectCreated: { en: 'Analysis project created successfully', ru: 'Проект анализа успешно создан' },
  addContentFirst: { en: 'Add content first before generating insights', ru: 'Сначала добавьте содержание перед созданием выводов' },
  insightsGenerated: { en: 'Insights generated successfully', ru: 'Выводы успешно созданы' },
  failedToGenerate: { en: 'Failed to generate insights', ru: 'Не удалось создать выводы' },
  reportExported: { en: 'Analysis report exported', ru: 'Отчет анализа экспортирован' },
  analysisSaved: { en: 'Analysis saved automatically', ru: 'Анализ сохранен автоматически' },
  auditStarted: { en: 'AI audit started', ru: 'Аудит ИИ начат' },
  auditStopped: { en: 'AI audit stopped', ru: 'Аудит ИИ остановлен' },
  agentConfigured: { en: 'Agent configured successfully', ru: 'Агент успешно настроен' },
  
  // Additional translations
  started: { en: 'Started', ru: 'Начато' },
  findings: { en: 'Findings', ru: 'Находки' },
  instructions: { en: 'Instructions', ru: 'Инструкции' },
  userGuide: { en: 'User Guide', ru: 'Руководство пользователя' },
  howToUse: { en: 'How to use AXON platform', ru: 'Как использовать платформу АКСОН' },
  
  // API Configuration
  apiConfiguration: { en: 'API Configuration', ru: 'Настройка API' },
  cloudProvider: { en: 'Cloud Provider', ru: 'Облачный Провайдер' },
  apiKey: { en: 'API Key', ru: 'API Ключ' },
  apiKeyPlaceholder: { en: 'Enter your API key', ru: 'Введите ваш API ключ' },
  endpoint: { en: 'Custom Endpoint', ru: 'Пользовательская Конечная Точка' },
  endpointPlaceholder: { en: 'Optional custom endpoint URL', ru: 'Опциональный URL конечной точки' },
  model: { en: 'Model', ru: 'Модель' },
  modelPlaceholder: { en: 'Optional model name', ru: 'Опциональное название модели' },
  saveApiConfig: { en: 'Save API Configuration', ru: 'Сохранить Настройки API' },
  apiConfigSaved: { en: 'API configuration saved', ru: 'Настройки API сохранены' },
  testConnection: { en: 'Test Connection', ru: 'Проверить Соединение' },
  connectionSuccessful: { en: 'Connection successful', ru: 'Соединение успешно' },
  connectionFailed: { en: 'Connection failed', ru: 'Соединение не удалось' },
  
  // Providers
  openai: { en: 'OpenAI', ru: 'OpenAI' },
  anthropic: { en: 'Anthropic', ru: 'Anthropic' },
  google: { en: 'Google AI', ru: 'Google AI' },
  azure: { en: 'Azure OpenAI', ru: 'Azure OpenAI' },
  local: { en: 'Local/Custom', ru: 'Локальный/Пользовательский' }
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
}

interface AuditAgent {
  id: string;
  name: string;
  description: string;
  type: 'security' | 'bias' | 'performance' | 'compliance';
  status: 'idle' | 'running' | 'completed' | 'failed';
  settings: {
    sensitivity: number;
    depth: number;
    scope: string;
    threshold: number;
  };
  apiConfig: {
    provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'local';
    apiKey: string;
    endpoint?: string;
    model?: string;
  };
  results: string[];
}

interface AuditSession {
  id: string;
  agentId: string;
  auditType: string;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed';
  results: string[];
  findings: number;
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
  auditAgents: AuditAgent[];
  auditSessions: AuditSession[];
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
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isConfiguringAgent, setIsConfiguringAgent] = useState(false);
  const [isConfiguringApi, setIsConfiguringApi] = useState(false);
  const [currentAuditSession, setCurrentAuditSession] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  // Get current project data
  const projectData = projects?.find(p => p.id === currentProject);

  // Get icon for dimension
  const getDimensionIcon = (dimensionId: string) => {
    switch (dimensionId) {
      case 'who': return <Users size={20} />;
      case 'what': return <FileText size={20} />;
      case 'when': return <Calendar size={20} />;
      case 'where': return <MapPin size={20} />;
      case 'why': return <Lightbulb size={20} />;
      case 'how': return <Gear size={20} />;
      default: return <FileText size={20} />;
    }
  };

  // Get icon for audit agent
  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
      case 'security': return <Shield size={20} />;
      case 'bias': return <Bug size={20} />;
      case 'performance': return <ChartLine size={20} />;
      case 'compliance': return <ListChecks size={20} />;
      default: return <Robot size={20} />;
    }
  };

  // Get default audit agents
  const getDefaultAuditAgents = (): AuditAgent[] => [
    {
      id: 'security-agent',
      name: t('securityAgent'),
      description: t('securityAgentDesc'),
      type: 'security',
      status: 'idle',
      settings: {
        sensitivity: 75,
        depth: 50,
        scope: 'system',
        threshold: 80
      },
      apiConfig: {
        provider: 'openai',
        apiKey: '',
        endpoint: '',
        model: 'gpt-4o-mini'
      },
      results: []
    },
    {
      id: 'bias-agent',
      name: t('biasAgent'),
      description: t('biasAgentDesc'),
      type: 'bias',
      status: 'idle',
      settings: {
        sensitivity: 85,
        depth: 70,
        scope: 'algorithm',
        threshold: 70
      },
      apiConfig: {
        provider: 'anthropic',
        apiKey: '',
        endpoint: '',
        model: 'claude-3-haiku'
      },
      results: []
    },
    {
      id: 'performance-agent',
      name: t('performanceAgent'),
      description: t('performanceAgentDesc'),
      type: 'performance',
      status: 'idle',
      settings: {
        sensitivity: 60,
        depth: 80,
        scope: 'model',
        threshold: 90
      },
      apiConfig: {
        provider: 'google',
        apiKey: '',
        endpoint: '',
        model: 'gemini-pro'
      },
      results: []
    },
    {
      id: 'compliance-agent',
      name: t('complianceAgent'),
      description: t('complianceAgentDesc'),
      type: 'compliance',
      status: 'idle',
      settings: {
        sensitivity: 90,
        depth: 90,
        scope: 'full',
        threshold: 95
      },
      apiConfig: {
        provider: 'azure',
        apiKey: '',
        endpoint: '',
        model: 'gpt-4'
      },
      results: []
    }
  ];

  // Ensure project has audit functionality (backward compatibility)
  const ensureAuditFunctionality = (proj: AnalysisProject | undefined): AnalysisProject | undefined => {
    if (!proj) return proj;
    
    if (!proj.auditAgents || !proj.auditSessions) {
      // Update project with audit functionality
      const updatedProject = {
        ...proj,
        auditAgents: proj.auditAgents || getDefaultAuditAgents(),
        auditSessions: proj.auditSessions || []
      };
      
      // Update the projects array
      setProjects(current => 
        (current || []).map(p => 
          p.id === proj.id ? updatedProject : p
        )
      );
      
      return updatedProject;
    }
    
    // Ensure existing agents have API config (backward compatibility)
    if (proj.auditAgents.some(agent => !agent.apiConfig)) {
      const updatedProject = {
        ...proj,
        auditAgents: proj.auditAgents.map((agent, index) => {
          if (!agent.apiConfig) {
            const defaultAgents = getDefaultAuditAgents();
            return {
              ...agent,
              apiConfig: defaultAgents[index]?.apiConfig || {
                provider: 'openai',
                apiKey: '',
                endpoint: '',
                model: 'gpt-4o-mini'
              }
            };
          }
          return agent;
        })
      };
      
      setProjects(current => 
        (current || []).map(p => 
          p.id === proj.id ? updatedProject : p
        )
      );
      
      return updatedProject;
    }
    
    return proj;
  };

  const project = ensureAuditFunctionality(projectData);

  // Initialize default Kipling dimensions with translations
  const getDefaultDimensions = (lang: Language): KiplingDimension[] => [
    {
      id: 'who',
      title: t('who'),
      question: t('whoQuestion'),
      content: '',
      insights: [],
      priority: 'high',
      completeness: 0
    },
    {
      id: 'what',
      title: t('what'),
      question: t('whatQuestion'),
      content: '',
      insights: [],
      priority: 'high',
      completeness: 0
    },
    {
      id: 'when',
      title: t('when'),
      question: t('whenQuestion'),
      content: '',
      insights: [],
      priority: 'medium',
      completeness: 0
    },
    {
      id: 'where',
      title: t('where'),
      question: t('whereQuestion'),
      content: '',
      insights: [],
      priority: 'medium',
      completeness: 0
    },
    {
      id: 'why',
      title: t('why'),
      question: t('whyQuestion'),
      content: '',
      insights: [],
      priority: 'high',
      completeness: 0
    },
    {
      id: 'how',
      title: t('how'),
      question: t('howQuestion'),
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
      auditAgents: getDefaultAuditAgents(),
      auditSessions: []
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

  // Update audit agent settings
  const updateAgentSettings = (agentId: string, settings: Partial<AuditAgent['settings']>) => {
    if (!project) return;

    setProjects(current => 
      (current || []).map(p => 
        p.id === project.id 
          ? {
              ...p,
              lastModified: new Date().toISOString(),
              auditAgents: p.auditAgents.map(agent => 
                agent.id === agentId 
                  ? { ...agent, settings: { ...agent.settings, ...settings } }
                  : agent
              )
            }
          : p
      )
    );
    toast.success(t('agentConfigured'));
  };

  // Update API configuration for agent
  const updateApiConfig = (agentId: string, apiConfig: Partial<AuditAgent['apiConfig']>) => {
    if (!project) return;

    setProjects(current => 
      (current || []).map(p => 
        p.id === project.id 
          ? {
              ...p,
              lastModified: new Date().toISOString(),
              auditAgents: p.auditAgents.map(agent => 
                agent.id === agentId 
                  ? { ...agent, apiConfig: { ...agent.apiConfig, ...apiConfig } }
                  : agent
              )
            }
          : p
      )
    );
    toast.success(t('apiConfigSaved'));
  };

  // Test API connection
  const testApiConnection = async (agentId: string) => {
    if (!project) return;
    
    const agent = project.auditAgents.find(a => a.id === agentId);
    if (!agent || !agent.apiConfig.apiKey) {
      toast.error(t('connectionFailed'));
      return;
    }

    try {
      // Simulate API test with the configured provider
      const testPrompt = spark.llmPrompt`Test connection for ${agent.apiConfig.provider} with model ${agent.apiConfig.model || 'default'}`;
      await spark.llm(testPrompt, 'gpt-4o-mini');
      toast.success(t('connectionSuccessful'));
    } catch (error) {
      toast.error(t('connectionFailed'));
    }
  };

  // Start audit session
  const startAuditSession = async (agentId: string, auditType: string) => {
    if (!project) return;

    const agent = project.auditAgents.find(a => a.id === agentId);
    if (!agent?.apiConfig.apiKey) {
      toast.error('API key required for this agent');
      return;
    }

    const sessionId = `session-${Date.now()}`;
    const newSession: AuditSession = {
      id: sessionId,
      agentId,
      auditType,
      startTime: new Date().toISOString(),
      status: 'running',
      results: [],
      findings: 0
    };

    // Update project with new session
    setProjects(current => 
      (current || []).map(p => 
        p.id === project.id 
          ? {
              ...p,
              auditSessions: [...p.auditSessions, newSession],
              auditAgents: p.auditAgents.map(a => 
                a.id === agentId 
                  ? { ...a, status: 'running' }
                  : a
              )
            }
          : p
      )
    );

    setCurrentAuditSession(sessionId);
    toast.success(t('auditStarted'));

    // Simulate audit process
    setTimeout(async () => {
      try {
        const prompt = spark.llmPrompt`Perform a ${auditType} audit simulation for ${agent.name} using ${agent.apiConfig.provider} provider. Generate 3-5 realistic audit findings based on the audit type. Return as JSON with a single property "findings" containing an array of finding strings.`;
        
        const response = await spark.llm(prompt, 'gpt-4o-mini', true);
        const result = JSON.parse(response);
        
        // Update session with results
        setProjects(current => 
          (current || []).map(p => 
            p.id === project.id 
              ? {
                  ...p,
                  auditSessions: p.auditSessions.map(session =>
                    session.id === sessionId
                      ? {
                          ...session,
                          status: 'completed',
                          endTime: new Date().toISOString(),
                          results: result.findings || [],
                          findings: (result.findings || []).length
                        }
                      : session
                  ),
                  auditAgents: p.auditAgents.map(a => 
                    a.id === agentId 
                      ? { ...a, status: 'completed', results: result.findings || [] }
                      : a
                  )
                }
              : p
          )
        );
      } catch (error) {
        // Update session as failed
        setProjects(current => 
          (current || []).map(p => 
            p.id === project.id 
              ? {
                  ...p,
                  auditSessions: p.auditSessions.map(session =>
                    session.id === sessionId
                      ? { ...session, status: 'failed', endTime: new Date().toISOString() }
                      : session
                  ),
                  auditAgents: p.auditAgents.map(a => 
                    a.id === agentId 
                      ? { ...a, status: 'failed' }
                      : a
                  )
                }
              : p
          )
        );
      }
    }, 3000);
  };

  // Stop audit session
  const stopAuditSession = (sessionId: string) => {
    if (!project) return;

    setProjects(current => 
      (current || []).map(p => 
        p.id === project.id 
          ? {
              ...p,
              auditSessions: p.auditSessions.map(session =>
                session.id === sessionId && session.status === 'running'
                  ? { ...session, status: 'failed', endTime: new Date().toISOString() }
                  : session
              ),
              auditAgents: p.auditAgents.map(agent => {
                const session = p.auditSessions.find(s => s.id === sessionId);
                return session && agent.id === session.agentId
                  ? { ...agent, status: 'idle' }
                  : agent;
              })
            }
          : p
      )
    );

    setCurrentAuditSession(null);
    toast.success(t('auditStopped'));
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
              {/* Instructions Button */}
              <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Question size={16} className="mr-2" />
                    {t('instructions')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>{t('userGuide')}</DialogTitle>
                    <DialogDescription>
                      {t('howToUse')}
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] pr-4">
                    <div className="prose prose-sm max-w-none text-foreground">
                      {currentLanguage === 'ru' ? (
                        <div className="space-y-4 text-sm">
                          <h2 className="text-lg font-semibold">Обзор системы</h2>
                          <p>АКСОН - это интеллектуальная платформа для систематического анализа данных, использующая директиву IKR (Intelligence-Knowledge-Reasoning) и протокол Киплинга. Система также включает модуль аудита ИИ для проверки и анализа систем искусственного интеллекта.</p>
                          
                          <h3 className="text-md font-semibold mt-6">Аудит ИИ - Модуль проверки систем искусственного интеллекта</h3>
                          
                          <h4 className="font-medium">Выбор агентов аудита</h4>
                          <p>В системе доступны 4 типа агентов аудита:</p>
                          <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Агент Безопасности</strong> - Анализ уязвимостей и угроз безопасности</li>
                            <li><strong>Агент Обнаружения Предвзятости</strong> - Выявление алгоритмической предвзятости</li>
                            <li><strong>Агент Производительности</strong> - Мониторинг производительности и точности модели</li>
                            <li><strong>Агент Соответствия</strong> - Проверка соответствия нормативным требованиям</li>
                          </ul>
                          
                          <h4 className="font-medium">Настройка агентов аудита</h4>
                          <ol className="list-decimal pl-6 space-y-1">
                            <li><strong>Выбор агента</strong>: Кликните на карточку агента в разделе "Аудит ИИ"</li>
                            <li><strong>Настройка API</strong>: Нажмите кнопку "API" для настройки подключения к облачному провайдеру</li>
                            <li><strong>Конфигурация</strong>: Нажмите кнопку "Настроить" для открытия панели настроек</li>
                            <li><strong>Параметры API</strong>:
                              <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Облачный провайдер (OpenAI, Anthropic, Google AI, Azure, Локальный)</li>
                                <li>API ключ для выбранного провайдера</li>
                                <li>Пользовательская конечная точка (опционально)</li>
                                <li>Название модели (опционально)</li>
                              </ul>
                            </li>
                            <li><strong>Параметры настройки</strong>:
                              <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Уровень чувствительности (0-100%)</li>
                                <li>Глубина анализа (0-100%)</li>
                                <li>Область аудита (System/Algorithm/Model/Full)</li>
                                <li>Порог оповещения (0-100%)</li>
                              </ul>
                            </li>
                          </ol>
                          
                          <h4 className="font-medium">Типы аудита ИИ</h4>
                          <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Полный Аудит Системы</strong> - Комплексная проверка всех компонентов</li>
                            <li><strong>Быстрое Сканирование Безопасности</strong> - Экспресс-проверка основных уязвимостей</li>
                            <li><strong>Оценка Предвзятости</strong> - Специализированная проверка на предвзятость</li>
                            <li><strong>Обзор Производительности</strong> - Анализ эффективности работы модели</li>
                          </ul>
                          
                          <h4 className="font-medium">Запуск аудита</h4>
                          <ol className="list-decimal pl-6 space-y-1">
                            <li>Выберите агента: Кликните на нужного агента аудита</li>
                            <li>Выберите тип аудита: Нажмите на одну из кнопок типов аудита</li>
                            <li>Мониторинг: Следите за статусом выполнения</li>
                            <li>Остановка: При необходимости используйте кнопку "Остановить Аудит"</li>
                          </ol>
                          
                          <h4 className="font-medium">Результаты аудита</h4>
                          <p>После завершения аудита вы получите:</p>
                          <ul className="list-disc pl-6 space-y-1">
                            <li>Статус выполнения</li>
                            <li>Количество находок</li>
                            <li>Детальные результаты</li>
                            <li>Временные метки</li>
                          </ul>
                        </div>
                      ) : (
                        <div className="space-y-4 text-sm">
                          <h2 className="text-lg font-semibold">System Overview</h2>
                          <p>AXON is an intelligent platform for systematic data analysis using the IKR (Intelligence-Knowledge-Reasoning) directive and Kipling protocol. The system also includes an AI audit module for checking and analyzing artificial intelligence systems.</p>
                          
                          <h3 className="text-md font-semibold mt-6">AI Audit - AI Systems Verification Module</h3>
                          
                          <h4 className="font-medium">Selecting Audit Agents</h4>
                          <p>The system provides 4 types of audit agents:</p>
                          <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Security Agent</strong> - Analyzes security vulnerabilities and threats</li>
                            <li><strong>Bias Detection Agent</strong> - Detects algorithmic bias and fairness issues</li>
                            <li><strong>Performance Agent</strong> - Monitors AI model performance and accuracy</li>
                            <li><strong>Compliance Agent</strong> - Ensures regulatory and ethical compliance</li>
                          </ul>
                          
                          <h4 className="font-medium">Configuring Audit Agents</h4>
                          <ol className="list-decimal pl-6 space-y-1">
                            <li><strong>Select Agent</strong>: Click on the agent card in the "AI Audit" section</li>
                            <li><strong>API Setup</strong>: Click the "API" button to configure cloud provider connection</li>
                            <li><strong>Configuration</strong>: Click the "Configure" button to open settings panel</li>
                            <li><strong>API Parameters</strong>:
                              <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Cloud Provider (OpenAI, Anthropic, Google AI, Azure, Local/Custom)</li>
                                <li>API key for the selected provider</li>
                                <li>Custom endpoint URL (optional)</li>
                                <li>Model name (optional)</li>
                              </ul>
                            </li>
                            <li><strong>Configuration Parameters</strong>:
                              <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>Sensitivity Level (0-100%)</li>
                                <li>Analysis Depth (0-100%)</li>
                                <li>Audit Scope (System/Algorithm/Model/Full)</li>
                                <li>Alert Threshold (0-100%)</li>
                              </ul>
                            </li>
                          </ol>
                          
                          <h4 className="font-medium">AI Audit Types</h4>
                          <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Full System Audit</strong> - Comprehensive check of all components</li>
                            <li><strong>Quick Security Scan</strong> - Express check of main vulnerabilities</li>
                            <li><strong>Bias Assessment</strong> - Specialized bias detection</li>
                            <li><strong>Performance Review</strong> - Analysis of model efficiency</li>
                          </ul>
                          
                          <h4 className="font-medium">Running an Audit</h4>
                          <ol className="list-decimal pl-6 space-y-1">
                            <li>Select Agent: Click on the desired audit agent</li>
                            <li>Choose Audit Type: Click on one of the audit type buttons</li>
                            <li>Monitor: Track execution status</li>
                            <li>Stop: Use "Stop Audit" button if needed</li>
                          </ol>
                          
                          <h4 className="font-medium">Audit Results</h4>
                          <p>After audit completion you will receive:</p>
                          <ul className="list-disc pl-6 space-y-1">
                            <li>Execution status</li>
                            <li>Number of findings</li>
                            <li>Detailed results</li>
                            <li>Timestamps</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>

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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
                <TabsTrigger value="kipling">{t('kipling')}</TabsTrigger>
                <TabsTrigger value="ikr">{t('ikr')}</TabsTrigger>
                <TabsTrigger value="audit">{t('aiAudit')}</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {project.dimensions.map(dimension => (
                    <Card key={dimension.id} className="kipling-dimension cyber-border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getDimensionIcon(dimension.id)}
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
                          {getDimensionIcon(dimension.id)}
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

              {/* AI Audit Tab */}
              <TabsContent value="audit" className="space-y-6">
                <div className="grid gap-6">
                  {/* Audit Agents Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Robot size={24} className="text-primary" />
                        {t('auditAgents')}
                      </CardTitle>
                      <CardDescription>
                        {t('auditAgentsDesc')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        {project.auditAgents.map(agent => (
                          <Card key={agent.id} className={`cursor-pointer transition-all cyber-border ${selectedAgent === agent.id ? 'ring-2 ring-primary glow-cyan' : ''}`}
                                onClick={() => setSelectedAgent(agent.id)}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  {getAgentIcon(agent.type)}
                                  <h4 className="font-medium">{agent.name}</h4>
                                </div>
                                <Badge variant={
                                  agent.status === 'running' ? 'default' :
                                  agent.status === 'completed' ? 'secondary' :
                                  agent.status === 'failed' ? 'destructive' : 'outline'
                                }>
                                  {t(agent.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{agent.description}</p>
                              <div className="mb-3">
                                <div className="flex items-center gap-2 text-xs">
                                  <Badge variant={agent.apiConfig.apiKey ? 'secondary' : 'outline'} className="text-xs">
                                    {agent.apiConfig.provider.toUpperCase()}
                                  </Badge>
                                  {agent.apiConfig.apiKey ? (
                                    <div className="flex items-center gap-1 text-accent">
                                      <CheckCircle size={12} />
                                      <span>API {t('configure').toLowerCase()}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 text-destructive">
                                      <Warning size={12} />
                                      <span>API {t('configure').toLowerCase()}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-muted-foreground">
                                  {agent.results.length} {t('auditResults').toLowerCase()}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="outline" 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedAgent(agent.id);
                                            setIsConfiguringApi(true);
                                          }}>
                                    <Key size={14} className="mr-1" />
                                    API
                                  </Button>
                                  <Button size="sm" variant="outline" 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedAgent(agent.id);
                                            setIsConfiguringAgent(true);
                                          }}>
                                    <Gear size={14} className="mr-1" />
                                    {t('configure')}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Audit Control Section */}
                  {selectedAgent && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <SecurityCamera size={24} className="text-primary" />
                          {t('auditType')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid gap-3 md:grid-cols-2">
                            {!project.auditAgents.find(a => a.id === selectedAgent)?.apiConfig.apiKey && (
                              <div className="col-span-2 p-3 bg-muted border border-destructive rounded-lg mb-4 audit-terminal">
                                <div className="flex items-center gap-2 text-destructive">
                                  <Warning size={16} />
                                  <span className="text-sm font-medium">
                                    {currentLanguage === 'ru' ? 'Требуется настройка API ключа' : 'API key configuration required'}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {currentLanguage === 'ru' 
                                    ? 'Нажмите кнопку "API" для настройки подключения к облачному провайдеру.'
                                    : 'Click the "API" button to configure cloud provider connection.'
                                  }
                                </p>
                              </div>
                            )}
                            <Button 
                              onClick={() => startAuditSession(selectedAgent, t('fullAudit'))}
                              disabled={
                                project.auditAgents.find(a => a.id === selectedAgent)?.status === 'running' ||
                                !project.auditAgents.find(a => a.id === selectedAgent)?.apiConfig.apiKey
                              }
                              className="h-16"
                            >
                              <div className="text-center">
                                <Play size={20} className="mx-auto mb-1" />
                                <div className="text-sm">{t('fullAudit')}</div>
                              </div>
                            </Button>
                            <Button 
                              onClick={() => startAuditSession(selectedAgent, t('quickScan'))}
                              disabled={
                                project.auditAgents.find(a => a.id === selectedAgent)?.status === 'running' ||
                                !project.auditAgents.find(a => a.id === selectedAgent)?.apiConfig.apiKey
                              }
                              variant="outline"
                              className="h-16"
                            >
                              <div className="text-center">
                                <Play size={20} className="mx-auto mb-1" />
                                <div className="text-sm">{t('quickScan')}</div>
                              </div>
                            </Button>
                            <Button 
                              onClick={() => startAuditSession(selectedAgent, t('biasAudit'))}
                              disabled={
                                project.auditAgents.find(a => a.id === selectedAgent)?.status === 'running' ||
                                !project.auditAgents.find(a => a.id === selectedAgent)?.apiConfig.apiKey
                              }
                              variant="outline"
                              className="h-16"
                            >
                              <div className="text-center">
                                <Bug size={20} className="mx-auto mb-1" />
                                <div className="text-sm">{t('biasAudit')}</div>
                              </div>
                            </Button>
                            <Button 
                              onClick={() => startAuditSession(selectedAgent, t('performanceAudit'))}
                              disabled={
                                project.auditAgents.find(a => a.id === selectedAgent)?.status === 'running' ||
                                !project.auditAgents.find(a => a.id === selectedAgent)?.apiConfig.apiKey
                              }
                              variant="outline"
                              className="h-16"
                            >
                              <div className="text-center">
                                <ChartLine size={20} className="mx-auto mb-1" />
                                <div className="text-sm">{t('performanceAudit')}</div>
                              </div>
                            </Button>
                          </div>

                          {currentAuditSession && (
                            <div className="flex items-center justify-between p-4 bg-muted rounded-lg audit-terminal cyber-border">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium">{t('auditStatus')}: {t('running')}</span>
                              </div>
                              <Button 
                                onClick={() => stopAuditSession(currentAuditSession)}
                                size="sm"
                                variant="destructive"
                              >
                                <Stop size={16} className="mr-2" />
                                {t('stopAudit')}
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Audit Results Section */}
                  {project.auditSessions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ListChecks size={24} className="text-primary" />
                          {t('auditResults')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {project.auditSessions.slice().reverse().map(session => {
                            const agent = project.auditAgents.find(a => a.id === session.agentId);
                            return (
                              <div key={session.id} className="border rounded-lg p-4 audit-terminal cyber-border">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    {agent && getAgentIcon(agent.type)}
                                    <span className="font-medium">{agent?.name}</span>
                                    <Badge variant="outline">{session.auditType}</Badge>
                                  </div>
                                  <Badge variant={
                                    session.status === 'running' ? 'default' :
                                    session.status === 'completed' ? 'secondary' :
                                    'destructive'
                                  }>
                                    {t(session.status)}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground mb-3">
                                  {t('started')}: {new Date(session.startTime).toLocaleString()}
                                  {session.endTime && (
                                    <> • {t('completed')}: {new Date(session.endTime).toLocaleString()}</>
                                  )}
                                </div>
                                {session.results.length > 0 && (
                                  <div className="space-y-2">
                                    <h5 className="font-medium text-sm">{t('findings')} ({session.findings}):</h5>
                                    <ul className="space-y-1">
                                      {session.results.map((result, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                          <Warning size={14} className="text-accent mt-0.5 flex-shrink-0" />
                                          <span>{result}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Agent Configuration Dialog */}
            <Dialog open={isConfiguringAgent} onOpenChange={setIsConfiguringAgent}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('agentSettings')}</DialogTitle>
                  <DialogDescription>
                    {selectedAgent && project.auditAgents.find(a => a.id === selectedAgent)?.description}
                  </DialogDescription>
                </DialogHeader>
                {selectedAgent && project.auditAgents.find(a => a.id === selectedAgent) && (
                  <div className="space-y-4">
                    <div>
                      <Label>{t('sensitivity')}: {project.auditAgents.find(a => a.id === selectedAgent)!.settings.sensitivity}%</Label>
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        value={project.auditAgents.find(a => a.id === selectedAgent)!.settings.sensitivity}
                        onChange={(e) => updateAgentSettings(selectedAgent, { sensitivity: parseInt(e.target.value) })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>{t('depth')}: {project.auditAgents.find(a => a.id === selectedAgent)!.settings.depth}%</Label>
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        value={project.auditAgents.find(a => a.id === selectedAgent)!.settings.depth}
                        onChange={(e) => updateAgentSettings(selectedAgent, { depth: parseInt(e.target.value) })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>{t('threshold')}: {project.auditAgents.find(a => a.id === selectedAgent)!.settings.threshold}%</Label>
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        value={project.auditAgents.find(a => a.id === selectedAgent)!.settings.threshold}
                        onChange={(e) => updateAgentSettings(selectedAgent, { threshold: parseInt(e.target.value) })}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="scope">{t('scope')}</Label>
                      <Select 
                        value={project.auditAgents.find(a => a.id === selectedAgent)!.settings.scope} 
                        onValueChange={(value) => updateAgentSettings(selectedAgent, { scope: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="system">System</SelectItem>
                          <SelectItem value="algorithm">Algorithm</SelectItem>
                          <SelectItem value="model">Model</SelectItem>
                          <SelectItem value="full">Full</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* API Configuration Dialog */}
            <Dialog open={isConfiguringApi} onOpenChange={setIsConfiguringApi}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Key size={20} />
                    {t('apiConfiguration')}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedAgent && project.auditAgents.find(a => a.id === selectedAgent)?.name}
                  </DialogDescription>
                </DialogHeader>
                {selectedAgent && project.auditAgents.find(a => a.id === selectedAgent) && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="provider">{t('cloudProvider')}</Label>
                      <Select 
                        value={project.auditAgents.find(a => a.id === selectedAgent)!.apiConfig.provider} 
                        onValueChange={(value: 'openai' | 'anthropic' | 'google' | 'azure' | 'local') => 
                          updateApiConfig(selectedAgent, { provider: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">
                            <div className="flex items-center gap-2">
                              <CloudArrowUp size={16} />
                              {t('openai')}
                            </div>
                          </SelectItem>
                          <SelectItem value="anthropic">
                            <div className="flex items-center gap-2">
                              <CloudArrowUp size={16} />
                              {t('anthropic')}
                            </div>
                          </SelectItem>
                          <SelectItem value="google">
                            <div className="flex items-center gap-2">
                              <CloudArrowUp size={16} />
                              {t('google')}
                            </div>
                          </SelectItem>
                          <SelectItem value="azure">
                            <div className="flex items-center gap-2">
                              <CloudArrowUp size={16} />
                              {t('azure')}
                            </div>
                          </SelectItem>
                          <SelectItem value="local">
                            <div className="flex items-center gap-2">
                              <Gear size={16} />
                              {t('local')}
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="apiKey">{t('apiKey')}</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        value={project.auditAgents.find(a => a.id === selectedAgent)!.apiConfig.apiKey}
                        onChange={(e) => updateApiConfig(selectedAgent, { apiKey: e.target.value })}
                        placeholder={t('apiKeyPlaceholder')}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="endpoint">{t('endpoint')}</Label>
                      <Input
                        id="endpoint"
                        value={project.auditAgents.find(a => a.id === selectedAgent)!.apiConfig.endpoint || ''}
                        onChange={(e) => updateApiConfig(selectedAgent, { endpoint: e.target.value })}
                        placeholder={t('endpointPlaceholder')}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="model">{t('model')}</Label>
                      <Input
                        id="model"
                        value={project.auditAgents.find(a => a.id === selectedAgent)!.apiConfig.model || ''}
                        onChange={(e) => updateApiConfig(selectedAgent, { model: e.target.value })}
                        placeholder={t('modelPlaceholder')}
                        className="mt-2"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 pt-4">
                      <Button 
                        onClick={() => testApiConnection(selectedAgent)}
                        variant="outline"
                        size="sm"
                        disabled={!project.auditAgents.find(a => a.id === selectedAgent)!.apiConfig.apiKey}
                      >
                        <Shield size={16} className="mr-2" />
                        {t('testConnection')}
                      </Button>
                      <Button 
                        onClick={() => setIsConfiguringApi(false)}
                        size="sm"
                      >
                        {t('saveApiConfig')}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

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