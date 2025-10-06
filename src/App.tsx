import React, { useState, useEffect } from 'react';
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
  CloudArrowUp,
  ChatCircle,
  PaperPlaneTilt,
  Microphone,
  MicrophoneSlash,
  Headphones
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
  chat: { en: 'AI Chat', ru: 'ИИ Чат' },
  
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
  
  // Agent Debate Module
  agentDebate: { en: 'Agent Debate', ru: 'Дебаты Агентов' },
  agentDebateDesc: { en: 'Configure and manage multi-agent debate systems', ru: 'Настройка и управление системами дебатов между агентами' },
  debateRounds: { en: 'Debate Rounds', ru: 'Раунды Дебатов' },
  agentCount: { en: 'Agent Count', ru: 'Количество Агентов' },
  debateTask: { en: 'Debate Task', ru: 'Задача Дебатов' },
  startDebate: { en: 'Start Debate', ru: 'Начать Дебаты' },
  stopDebate: { en: 'Stop Debate', ru: 'Остановить Дебаты' },
  debateStatus: { en: 'Debate Status', ru: 'Статус Дебатов' },
  debateResults: { en: 'Debate Results', ru: 'Результаты Дебатов' },
  currentRound: { en: 'Current Round', ru: 'Текущий Раунд' },
  agentResponses: { en: 'Agent Responses', ru: 'Ответы Агентов' },
  synthesis: { en: 'Synthesis', ru: 'Синтез' },
  debateTemplate: { en: 'Debate Template', ru: 'Шаблон Дебатов' },
  argumentQuality: { en: 'Argument Quality', ru: 'Качество Аргументов' },
  consensusLevel: { en: 'Consensus Level', ru: 'Уровень Консенсуса' },
  
  // Executor Module
  executor: { en: 'Task Executor', ru: 'Исполнитель Задач' },
  executorDesc: { en: 'Execute tasks and manage AI agent workflows', ru: 'Выполнение задач и управление рабочими процессами ИИ агентов' },
  taskQueue: { en: 'Task Queue', ru: 'Очередь Задач' },
  activeTask: { en: 'Active Task', ru: 'Активная Задача' },
  executeTask: { en: 'Execute Task', ru: 'Выполнить Задачу' },
  taskStatus: { en: 'Task Status', ru: 'Статус Задачи' },
  taskHistory: { en: 'Task History', ru: 'История Задач' },
  createTask: { en: 'Create Task', ru: 'Создать Задачу' },
  taskType: { en: 'Task Type', ru: 'Тип Задачи' },
  taskPriority: { en: 'Task Priority', ru: 'Приоритет Задачи' },
  assignedAgent: { en: 'Assigned Agent', ru: 'Назначенный Агент' },
  taskResult: { en: 'Task Result', ru: 'Результат Задачи' },
  executionTime: { en: 'Execution Time', ru: 'Время Выполнения' },
  pending: { en: 'Pending', ru: 'Ожидает' },
  executing: { en: 'Executing', ru: 'Выполняется' },
  
  // Task types
  analysisTask: { en: 'Analysis Task', ru: 'Задача Анализа' },
  researchTask: { en: 'Research Task', ru: 'Задача Исследования' },
  debateTaskType: { en: 'Debate Task', ru: 'Задача Дебатов' },
  reportTask: { en: 'Report Task', ru: 'Задача Отчета' },
  
  // Agent Templates
  debateAgent1: { en: 'Debate Agent 1', ru: 'Агент Дебатов 1' },
  debateAgent2: { en: 'Debate Agent 2', ru: 'Агент Дебатов 2' },
  moderatorAgent: { en: 'Moderator Agent', ru: 'Агент Модератор' },
  synthesizerAgent: { en: 'Synthesizer Agent', ru: 'Агент Синтеза' },
  
  // Additional statuses and labels
  consensus: { en: 'Consensus', ru: 'Консенсус' },
  disagreement: { en: 'Disagreement', ru: 'Разногласие' },
  needsReview: { en: 'Needs Review', ru: 'Требует Проверки' },
  round: { en: 'Round', ru: 'Раунд' },
  argument: { en: 'Argument', ru: 'Аргумент' },
  counterArgument: { en: 'Counter-Argument', ru: 'Контраргумент' },
  evidence: { en: 'Evidence', ru: 'Доказательство' },
  conclusion: { en: 'Conclusion', ru: 'Заключение' },
  
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
  
  // Settings tab
  settings: { en: 'Settings', ru: 'Настройки' },
  moduleColorSettings: { en: 'Module Color Settings', ru: 'Настройки Цветов Модулей' },
  colorRangeConfig: { en: 'Configure color ranges for workspace modules', ru: 'Настройка цветовых диапазонов для модулей рабочей области' },
  colorRange: { en: 'Color Range', ru: 'Цветовой Диапазон' },
  primaryColor: { en: 'Primary Color', ru: 'Основной Цвет' },
  secondaryColor: { en: 'Secondary Color', ru: 'Вторичный Цвет' },
  accentColor: { en: 'Accent Color', ru: 'Акцентный Цвет' },
  backgroundColor: { en: 'Background Color', ru: 'Цвет Фона' },
  overviewModule: { en: 'Overview Module', ru: 'Модуль Обзора' },
  kiplingModule: { en: 'Kipling Module', ru: 'Модуль Киплинга' },
  ikrModule: { en: 'IKR Module', ru: 'Модуль IKR' },
  auditModule: { en: 'Audit Module', ru: 'Модуль Аудита' },
  resetToDefault: { en: 'Reset to Default', ru: 'Сбросить к Умолчанию' },
  applyColors: { en: 'Apply Colors', ru: 'Применить Цвета' },
  colorApplied: { en: 'Color settings applied', ru: 'Настройки цвета применены' },
  colorsReset: { en: 'Colors reset to default', ru: 'Цвета сброшены к умолчанию' },
  
  // Chat Module
  chatModule: { en: 'AI Chat Assistant', ru: 'Помощник ИИ Чат' },
  chatDesc: { en: 'Interact with AI to analyze your project data', ru: 'Взаимодействуйте с ИИ для анализа данных проекта' },
  chatPlaceholder: { en: 'Ask about your analysis...', ru: 'Спросите о вашем анализе...' },
  sendMessage: { en: 'Send Message', ru: 'Отправить Сообщение' },
  clearChat: { en: 'Clear Chat', ru: 'Очистить Чат' },
  chatHistory: { en: 'Chat History', ru: 'История Чата' },
  contextualHelp: { en: 'Contextual Help', ru: 'Контекстная Помощь' },
  analysisContext: { en: 'Analysis Context', ru: 'Контекст Анализа' },
  moduleIntegration: { en: 'Module Integration', ru: 'Интеграция Модулей' },
  voiceInput: { en: 'Voice Input', ru: 'Голосовой Ввод' },
  stopRecording: { en: 'Stop Recording', ru: 'Остановить Запись' },
  startRecording: { en: 'Start Recording', ru: 'Начать Запись' },
  processingVoice: { en: 'Processing voice...', ru: 'Обработка голоса...' },
  voiceNotSupported: { en: 'Voice input not supported', ru: 'Голосовой ввод не поддерживается' },
  chatWelcome: { en: 'Hello! I can help you analyze your project. Ask me about your Kipling dimensions, IKR directive, or audit results.', ru: 'Привет! Я могу помочь вам проанализировать ваш проект. Спросите меня о ваших измерениях Киплинга, директиве IKR или результатах аудита.' },
  
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

interface DebateAgent {
  id: string;
  name: string;
  role: 'debater' | 'moderator' | 'synthesizer';
  template: string;
  model: string;
  systemPrompt: string;
}

interface DebateRound {
  id: string;
  roundNumber: number;
  responses: {
    agentId: string;
    response: string;
    timestamp: string;
    quality: number;
  }[];
  synthesis?: string;
}

interface DebateSession {
  id: string;
  title: string;
  task: string;
  agents: DebateAgent[];
  rounds: DebateRound[];
  maxRounds: number;
  currentRound: number;
  status: 'setup' | 'running' | 'completed' | 'stopped';
  startTime?: string;
  endTime?: string;
  finalSynthesis?: string;
  consensusLevel: number;
}

interface TaskExecution {
  id: string;
  title: string;
  description: string;
  type: 'analysis' | 'research' | 'debate' | 'report';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedAgent?: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  result?: string;
  executionTime?: number;
  dependencies?: string[];
}

interface ExecutorSettings {
  maxConcurrentTasks: number;
  defaultTimeout: number;
  retryAttempts: number;
  enableAutoRetry: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
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
  colorSettings?: ModuleColorSettings;
  chatSessions: ChatSession[];
  currentChatSession?: string;
  debate: DebateSession[];
  tasks: TaskExecution[];
  executorSettings?: ExecutorSettings;
}

interface ModuleColorSettings {
  overview: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  kipling: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  ikr: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  audit: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  chat: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  debate: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  executor: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  context?: {
    module: string;
    data?: any;
  };
}

interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: string;
  lastActive: string;
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
  const [tempColorSettings, setTempColorSettings] = useState<ModuleColorSettings | null>(null);
  
  // Chat UI state
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

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

  // Get default color settings
  const getDefaultColorSettings = (): ModuleColorSettings => ({
    overview: {
      primary: 'oklch(55% 0.2 200)',
      secondary: 'oklch(35% 0.1 220)',
      accent: 'oklch(65% 0.25 180)',
      background: 'oklch(16% 0.03 220)'
    },
    kipling: {
      primary: 'oklch(60% 0.18 240)',
      secondary: 'oklch(40% 0.12 260)',
      accent: 'oklch(70% 0.22 220)',
      background: 'oklch(18% 0.025 240)'
    },
    ikr: {
      primary: 'oklch(58% 0.19 160)',
      secondary: 'oklch(38% 0.11 180)',
      accent: 'oklch(68% 0.23 140)',
      background: 'oklch(17% 0.028 160)'
    },
    audit: {
      primary: 'oklch(62% 0.17 15)',
      secondary: 'oklch(42% 0.13 35)',
      accent: 'oklch(72% 0.21 350)',
      background: 'oklch(19% 0.022 15)'
    },
    chat: {
      primary: 'oklch(65% 0.2 280)',
      secondary: 'oklch(45% 0.12 300)',
      accent: 'oklch(75% 0.25 260)',
      background: 'oklch(20% 0.03 280)'
    },
    debate: {
      primary: 'oklch(63% 0.19 120)',
      secondary: 'oklch(43% 0.13 140)',
      accent: 'oklch(73% 0.23 100)',
      background: 'oklch(18% 0.025 120)'
    },
    executor: {
      primary: 'oklch(61% 0.18 60)',
      secondary: 'oklch(41% 0.12 80)',
      accent: 'oklch(71% 0.22 40)',
      background: 'oklch(17% 0.027 60)'
    }
  });
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
    
    if (!proj.auditAgents || !proj.auditSessions || !proj.chatSessions || !proj.debate || !proj.tasks) {
      // Update project with all missing functionality
      const updatedProject = {
        ...proj,
        auditAgents: proj.auditAgents || getDefaultAuditAgents(),
        auditSessions: proj.auditSessions || [],
        colorSettings: proj.colorSettings || getDefaultColorSettings(),
        chatSessions: proj.chatSessions || [],
        currentChatSession: proj.currentChatSession || undefined,
        debate: proj.debate || [],
        tasks: proj.tasks || [],
        executorSettings: proj.executorSettings || {
          maxConcurrentTasks: 3,
          defaultTimeout: 300000,
          retryAttempts: 2,
          enableAutoRetry: true,
          logLevel: 'info'
        }
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
      auditSessions: [],
      colorSettings: getDefaultColorSettings(),
      chatSessions: [],
      currentChatSession: undefined,
      debate: [],
      tasks: [],
      executorSettings: {
        maxConcurrentTasks: 3,
        defaultTimeout: 300000,
        retryAttempts: 2,
        enableAutoRetry: true,
        logLevel: 'info'
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

  // Update color settings
  const updateColorSettings = (moduleId: keyof ModuleColorSettings, colorType: string, color: string) => {
    if (!project) return;

    const currentSettings = project.colorSettings || getDefaultColorSettings();
    const newSettings = {
      ...currentSettings,
      [moduleId]: {
        ...currentSettings[moduleId],
        [colorType]: color
      }
    };

    setProjects(current => 
      (current || []).map(p => 
        p.id === project.id 
          ? {
              ...p,
              lastModified: new Date().toISOString(),
              colorSettings: newSettings
            }
          : p
      )
    );
  };

  // Reset colors to default
  const resetColorsToDefault = () => {
    if (!project) return;

    setProjects(current => 
      (current || []).map(p => 
        p.id === project.id 
          ? {
              ...p,
              lastModified: new Date().toISOString(),
              colorSettings: getDefaultColorSettings()
            }
          : p
      )
    );
    
    setTempColorSettings(null);
    toast.success(t('colorsReset'));
  };

  // Apply color settings to CSS
  const applyColorSettings = () => {
    if (!project?.colorSettings) return;

    const settings = project.colorSettings;
    const root = document.documentElement;

    // Apply colors based on active tab
    switch (activeTab) {
      case 'overview':
        if (settings.overview) {
          root.style.setProperty('--module-primary', settings.overview.primary);
          root.style.setProperty('--module-secondary', settings.overview.secondary);
          root.style.setProperty('--module-accent', settings.overview.accent);
          root.style.setProperty('--module-background', settings.overview.background);
        }
        break;
      case 'kipling':
        if (settings.kipling) {
          root.style.setProperty('--module-primary', settings.kipling.primary);
          root.style.setProperty('--module-secondary', settings.kipling.secondary);
          root.style.setProperty('--module-accent', settings.kipling.accent);
          root.style.setProperty('--module-background', settings.kipling.background);
        }
        break;
      case 'ikr':
        if (settings.ikr) {
          root.style.setProperty('--module-primary', settings.ikr.primary);
          root.style.setProperty('--module-secondary', settings.ikr.secondary);
          root.style.setProperty('--module-accent', settings.ikr.accent);
          root.style.setProperty('--module-background', settings.ikr.background);
        }
        break;
      case 'audit':
        if (settings.audit) {
          root.style.setProperty('--module-primary', settings.audit.primary);
          root.style.setProperty('--module-secondary', settings.audit.secondary);
          root.style.setProperty('--module-accent', settings.audit.accent);
          root.style.setProperty('--module-background', settings.audit.background);
        }
        break;
      case 'chat':
        if (settings.chat) {
          root.style.setProperty('--module-primary', settings.chat.primary);
          root.style.setProperty('--module-secondary', settings.chat.secondary);
          root.style.setProperty('--module-accent', settings.chat.accent);
          root.style.setProperty('--module-background', settings.chat.background);
        }
        break;
      case 'debate':
        if (settings.debate) {
          root.style.setProperty('--module-primary', settings.debate.primary);
          root.style.setProperty('--module-secondary', settings.debate.secondary);
          root.style.setProperty('--module-accent', settings.debate.accent);
          root.style.setProperty('--module-background', settings.debate.background);
        }
        break;
      case 'executor':
        if (settings.executor) {
          root.style.setProperty('--module-primary', settings.executor.primary);
          root.style.setProperty('--module-secondary', settings.executor.secondary);
          root.style.setProperty('--module-accent', settings.executor.accent);
          root.style.setProperty('--module-background', settings.executor.background);
        }
        break;
    }
    
    toast.success(t('colorApplied'));
  };

  // Apply colors when tab changes
  useEffect(() => {
    if (project?.colorSettings) {
      applyColorSettings();
    }
  }, [activeTab, project?.colorSettings]);

  // Chat functions
  const createChatSession = (): ChatSession => {
    const sessionId = `chat-${Date.now()}`;
    return {
      id: sessionId,
      messages: [{
        id: `msg-${Date.now()}`,
        type: 'system',
        content: t('chatWelcome'),
        timestamp: new Date().toISOString()
      }],
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
  };

  const getCurrentChatSession = (): ChatSession => {
    if (!project) return createChatSession();
    
    const currentSessionId = project.currentChatSession;
    let currentSession = project.chatSessions.find(s => s.id === currentSessionId);
    
    if (!currentSession) {
      currentSession = createChatSession();
      setProjects(current => 
        (current || []).map(p => 
          p.id === project.id 
            ? {
                ...p,
                chatSessions: [...p.chatSessions, currentSession!],
                currentChatSession: currentSession!.id,
                lastModified: new Date().toISOString()
              }
            : p
        )
      );
    }
    
    return currentSession;
  };

  const addChatMessage = async (content: string, type: 'user' | 'assistant' = 'user', context?: any) => {
    if (!project) return;

    const currentSession = getCurrentChatSession();
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type,
      content,
      timestamp: new Date().toISOString(),
      context
    };

    // Update the chat session with new message
    setProjects(current => 
      (current || []).map(p => 
        p.id === project.id 
          ? {
              ...p,
              chatSessions: p.chatSessions.map(session =>
                session.id === currentSession.id
                  ? {
                      ...session,
                      messages: [...session.messages, newMessage],
                      lastActive: new Date().toISOString()
                    }
                  : session
              ),
              lastModified: new Date().toISOString()
            }
          : p
      )
    );

    // If it's a user message, generate AI response
    if (type === 'user') {
      setIsChatLoading(true);
      try {
        await generateChatResponse(content, currentSession);
      } catch (error) {
        console.error('Error generating chat response:', error);
        toast.error('Failed to generate response');
      } finally {
        setIsChatLoading(false);
      }
    }
  };

  const generateChatResponse = async (userMessage: string, session: ChatSession) => {
    if (!project) return;

    // Build context from current project data
    const projectContext = {
      title: project.title,
      description: project.description,
      completeness: calculateCompleteness(project),
      dimensions: project.dimensions.map(d => ({
        dimension: d.title,
        content: d.content,
        insights: d.insights,
        priority: d.priority,
        completeness: d.completeness
      })),
      ikrDirective: project.ikrDirective,
      auditResults: project.auditSessions.filter(s => s.status === 'completed').map(s => ({
        type: s.auditType,
        findings: s.results,
        timestamp: s.endTime
      })),
      activeModule: activeTab
    };

    const chatHistory = session.messages.slice(-5).map(m => `${m.type}: ${m.content}`).join('\n');

    const prompt = spark.llmPrompt`You are an AI assistant specialized in intelligence analysis using the AXON platform. The platform uses the IKR directive (Intelligence-Knowledge-Reasoning) and Kipling protocol (Who, What, When, Where, Why, How).

Current project context: ${JSON.stringify(projectContext, null, 2)}

Recent chat history:
${chatHistory}

User message: ${userMessage}

Please provide a helpful, contextual response that:
1. References specific data from the user's project when relevant
2. Suggests actionable insights or next steps
3. Helps the user understand their analysis better
4. If asked about specific modules, provide detailed information from that module
5. Keep responses concise but informative

Respond naturally and helpfully.`;

    try {
      const response = await spark.llm(prompt, 'gpt-4o-mini');
      
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        type: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        context: { module: activeTab, data: projectContext }
      };

      // Add AI response to chat
      setProjects(current => 
        (current || []).map(p => 
          p.id === project.id 
            ? {
                ...p,
                chatSessions: p.chatSessions.map(chatSession =>
                  chatSession.id === session.id
                    ? {
                        ...chatSession,
                        messages: [...chatSession.messages, aiMessage],
                        lastActive: new Date().toISOString()
                      }
                    : chatSession
                ),
                lastModified: new Date().toISOString()
              }
            : p
        )
      );
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast.error('Failed to generate AI response');
    }
  };

  const clearChat = () => {
    if (!project) return;

    const newSession = createChatSession();
    setProjects(current => 
      (current || []).map(p => 
        p.id === project.id 
          ? {
              ...p,
              chatSessions: [...p.chatSessions, newSession],
              currentChatSession: newSession.id,
              lastModified: new Date().toISOString()
            }
          : p
      )
    );
    
    toast.success('Chat cleared');
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    
    const message = chatInput.trim();
    setChatInput('');
    await addChatMessage(message, 'user');
  };

  // Voice recording functions
  const startVoiceRecording = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error(t('voiceNotSupported'));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // Here you would typically convert audio to text using a speech recognition service
          // For now, we'll simulate voice input
          toast.info(t('processingVoice'));
          setTimeout(() => {
            setChatInput('Voice input simulated - ask about my analysis');
          }, 1000);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (recorder.state === 'recording') {
          stopVoiceRecording();
        }
      }, 30000);
      
    } catch (error) {
      toast.error('Failed to access microphone');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setMediaRecorder(null);
    }
    setIsRecording(false);
  };
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
              <TabsList className="grid w-full grid-cols-8">
                <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
                <TabsTrigger value="kipling">{t('kipling')}</TabsTrigger>
                <TabsTrigger value="ikr">{t('ikr')}</TabsTrigger>
                <TabsTrigger value="audit">{t('aiAudit')}</TabsTrigger>
                <TabsTrigger value="debate">{t('agentDebate')}</TabsTrigger>
                <TabsTrigger value="executor">{t('executor')}</TabsTrigger>
                <TabsTrigger value="chat">{t('chat')}</TabsTrigger>
                <TabsTrigger value="settings">{t('settings')}</TabsTrigger>
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

              {/* Agent Debate Tab */}
              <TabsContent value="debate" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users size={24} className="text-primary" />
                      {t('agentDebate')}
                    </CardTitle>
                    <CardDescription>
                      {t('agentDebateDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Debate Configuration */}
                      <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">{t('debateRounds')}</h4>
                            <Select defaultValue="3">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="3">3 {t('round').toLowerCase()}s</SelectItem>
                                <SelectItem value="5">5 {t('round').toLowerCase()}s</SelectItem>
                                <SelectItem value="7">7 {t('round').toLowerCase()}s</SelectItem>
                              </SelectContent>
                            </Select>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">{t('agentCount')}</h4>
                            <Select defaultValue="2">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="2">2 {t('debateAgent1').toLowerCase()}s</SelectItem>
                                <SelectItem value="3">3 {t('debateAgent1').toLowerCase()}s</SelectItem>
                                <SelectItem value="4">4 {t('debateAgent1').toLowerCase()}s</SelectItem>
                              </SelectContent>
                            </Select>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-2">{t('consensusLevel')}</h4>
                            <div className="flex items-center gap-2">
                              <Progress value={75} className="flex-1" />
                              <span className="text-sm text-muted-foreground">75%</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Debate Task Input */}
                      <div>
                        <Label htmlFor="debate-task">{t('debateTask')}</Label>
                        <Textarea
                          id="debate-task"
                          placeholder="Enter the topic or question for agents to debate..."
                          rows={3}
                          className="mt-2"
                        />
                      </div>

                      {/* Agent Templates */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Robot size={20} />
                              {t('debateAgent1')}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div>
                                <Label>Role: Advocate</Label>
                                <Badge variant="secondary" className="ml-2">Pro-position</Badge>
                              </div>
                              <div>
                                <Label>Model</Label>
                                <Select defaultValue="gpt-4o-mini">
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                                    <SelectItem value="claude-3">Claude-3</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Robot size={20} />
                              {t('debateAgent2')}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div>
                                <Label>Role: Critic</Label>
                                <Badge variant="outline" className="ml-2">Counter-position</Badge>
                              </div>
                              <div>
                                <Label>Model</Label>
                                <Select defaultValue="claude-3">
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                                    <SelectItem value="claude-3">Claude-3</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Control Buttons */}
                      <div className="flex items-center gap-3">
                        <Button>
                          <Play size={16} className="mr-2" />
                          {t('startDebate')}
                        </Button>
                        <Button variant="outline">
                          <Pause size={16} className="mr-2" />
                          {t('stopDebate')}
                        </Button>
                        <Badge variant="secondary" className="ml-auto">
                          {t('debateStatus')}: {t('idle')}
                        </Badge>
                      </div>

                      {/* Debate Results */}
                      <Separator />
                      
                      <div>
                        <h4 className="font-medium mb-4 flex items-center gap-2">
                          <ListChecks size={20} />
                          {t('debateResults')}
                        </h4>
                        
                        <div className="space-y-4">
                          <Card className="bg-muted/50">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Badge>{t('round')} 1</Badge>
                                  <span className="text-sm text-muted-foreground">2 min ago</span>
                                </div>
                                <Badge variant="secondary">{t('completed')}</Badge>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="border-l-2 border-primary pl-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Robot size={14} />
                                    <span className="text-sm font-medium">Agent Pro</span>
                                    <Badge variant="outline" className="text-xs">Quality: 85%</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Initial argument presenting evidence supporting the position...
                                  </p>
                                </div>
                                
                                <div className="border-l-2 border-secondary pl-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Robot size={14} />
                                    <span className="text-sm font-medium">Agent Counter</span>
                                    <Badge variant="outline" className="text-xs">Quality: 78%</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Counter-argument challenging the initial position with alternative evidence...
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Task Executor Tab */}
              <TabsContent value="executor" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Task Queue */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ListChecks size={24} className="text-primary" />
                          {t('taskQueue')}
                        </CardTitle>
                        <CardDescription>
                          {t('executorDesc')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Active Task */}
                          <div className="border rounded-lg p-4 bg-muted/20">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="font-medium">{t('activeTask')}</span>
                              </div>
                              <Badge variant="default">{t('executing')}</Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <h5 className="font-medium">Analysis Task: Market Research</h5>
                              <p className="text-sm text-muted-foreground">
                                Analyzing market trends for Q4 projections using multiple data sources
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Agent: Research-Agent-01</span>
                                <span>Started: 5 min ago</span>
                                <span>Priority: High</span>
                              </div>
                              <Progress value={65} className="h-1" />
                            </div>
                          </div>

                          {/* Pending Tasks */}
                          <div className="space-y-3">
                            <h4 className="font-medium">{t('pending')} ({3})</h4>
                            
                            {[1, 2, 3].map(i => (
                              <Card key={i} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium">Task {i + 1}: Data Synthesis</h5>
                                    <div className="flex items-center gap-2">
                                      <Badge variant={i === 1 ? "default" : "outline"}>
                                        {i === 1 ? t('high') : i === 2 ? t('medium') : t('low')}
                                      </Badge>
                                      <Button size="sm" variant="outline">
                                        <Play size={14} className="mr-1" />
                                        {t('executeTask')}
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Synthesize findings from Kipling analysis into actionable insights
                                  </p>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span>Type: {t('analysisTask')}</span>
                                    <span>Agent: Unassigned</span>
                                    <span>Created: {i} hours ago</span>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Task Controls & Settings */}
                  <div className="space-y-6">
                    {/* Create Task */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{t('createTask')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="task-title">Title</Label>
                            <Input id="task-title" placeholder="Task title..." />
                          </div>
                          
                          <div>
                            <Label htmlFor="task-type">{t('taskType')}</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="analysis">{t('analysisTask')}</SelectItem>
                                <SelectItem value="research">{t('researchTask')}</SelectItem>
                                <SelectItem value="debate">{t('debateTaskType')}</SelectItem>
                                <SelectItem value="report">{t('reportTask')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="task-priority">{t('taskPriority')}</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="high">{t('high')}</SelectItem>
                                <SelectItem value="medium">{t('medium')}</SelectItem>
                                <SelectItem value="low">{t('low')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="task-agent">{t('assignedAgent')}</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Auto-assign" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="auto">Auto-assign</SelectItem>
                                <SelectItem value="research-01">Research Agent 01</SelectItem>
                                <SelectItem value="analysis-01">Analysis Agent 01</SelectItem>
                                <SelectItem value="synthesis-01">Synthesis Agent 01</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <Button className="w-full">
                            <Plus size={16} className="mr-2" />
                            {t('createTask')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Executor Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Gear size={20} />
                          Executor Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label>Max Concurrent Tasks: 3</Label>
                            <Input type="range" min="1" max="10" defaultValue="3" className="mt-2" />
                          </div>
                          
                          <div>
                            <Label>Default Timeout: 5 min</Label>
                            <Select defaultValue="300">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="300">5 minutes</SelectItem>
                                <SelectItem value="600">10 minutes</SelectItem>
                                <SelectItem value="1800">30 minutes</SelectItem>
                                <SelectItem value="3600">1 hour</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label>Auto-retry failed tasks</Label>
                            <Button variant="outline" size="sm">
                              <CheckCircle size={14} className="mr-1" />
                              Enabled
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Task Statistics */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{t('taskHistory')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Completed Today</span>
                            <Badge variant="secondary">7</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">In Queue</span>
                            <Badge variant="outline">3</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Failed</span>
                            <Badge variant="destructive">1</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Avg. Time</span>
                            <span className="text-sm text-muted-foreground">8.3 min</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="chat" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ChatCircle size={24} className="text-primary" />
                      {t('chatModule')}
                    </CardTitle>
                    <CardDescription>
                      {t('chatDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Chat Messages */}
                      <ScrollArea className="h-96 w-full border rounded-lg p-4 bg-muted/20">
                        <div className="space-y-4">
                          {getCurrentChatSession().messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.type === 'user' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  message.type === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : message.type === 'system'
                                    ? 'bg-muted text-muted-foreground border'
                                    : 'bg-card border border-border'
                                }`}
                              >
                                <div className="text-sm">{message.content}</div>
                                <div className="text-xs opacity-60 mt-1">
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                  {message.context && (
                                    <span className="ml-2">
                                      • {message.context.module}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {isChatLoading && (
                            <div className="flex justify-start">
                              <div className="bg-card border border-border rounded-lg p-3 max-w-[80%]">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                  <span className="text-sm text-muted-foreground ml-2">
                                    {currentLanguage === 'ru' ? 'ИИ печатает...' : 'AI is typing...'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>

                      {/* Chat Input */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                          <Input
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder={t('chatPlaceholder')}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            disabled={isChatLoading}
                            className="pr-12"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute right-1 top-1 h-8 w-8 p-0"
                            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                            disabled={isChatLoading}
                          >
                            {isRecording ? (
                              <MicrophoneSlash size={16} className="text-destructive" />
                            ) : (
                              <Microphone size={16} />
                            )}
                          </Button>
                        </div>
                        <Button
                          onClick={handleSendMessage}
                          disabled={!chatInput.trim() || isChatLoading}
                          size="sm"
                        >
                          <PaperPlaneTilt size={16} className="mr-2" />
                          {t('sendMessage')}
                        </Button>
                        <Button
                          onClick={clearChat}
                          variant="outline"
                          size="sm"
                        >
                          {t('clearChat')}
                        </Button>
                      </div>

                      {/* Contextual Actions */}
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const context = `Current project: ${project?.title}. Completion: ${calculateCompleteness(project!)}%`;
                            setChatInput(`Analyze my project progress: ${context}`);
                          }}
                        >
                          <ChartLine size={16} className="mr-2" />
                          {currentLanguage === 'ru' ? 'Анализ прогресса' : 'Analyze Progress'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const incomplete = project?.dimensions.filter(d => d.completeness < 50) || [];
                            setChatInput(`Help me complete these dimensions: ${incomplete.map(d => d.title).join(', ')}`);
                          }}
                        >
                          <Target size={16} className="mr-2" />
                          {currentLanguage === 'ru' ? 'Помощь с измерениями' : 'Help with Dimensions'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setChatInput('Generate insights from my IKR directive analysis');
                          }}
                        >
                          <Lightbulb size={16} className="mr-2" />
                          {currentLanguage === 'ru' ? 'Идеи IKR' : 'IKR Insights'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const auditResults = project?.auditSessions.filter(s => s.status === 'completed') || [];
                            setChatInput(`Summarize my audit findings: ${auditResults.length} completed audits`);
                          }}
                        >
                          <Shield size={16} className="mr-2" />
                          {currentLanguage === 'ru' ? 'Сводка аудита' : 'Audit Summary'}
                        </Button>
                      </div>

                      {/* Context Information */}
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Brain size={16} />
                            {t('analysisContext')}
                          </h4>
                          <div className="grid gap-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span>{currentLanguage === 'ru' ? 'Активный модуль:' : 'Active Module:'}</span>
                              <Badge variant="secondary">{activeTab}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>{currentLanguage === 'ru' ? 'Завершенность проекта:' : 'Project Completion:'}</span>
                              <Badge variant={calculateCompleteness(project!) > 50 ? 'default' : 'outline'}>
                                {calculateCompleteness(project!)}%
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>{currentLanguage === 'ru' ? 'Измерения Киплинга:' : 'Kipling Dimensions:'}</span>
                              <span className="text-muted-foreground">
                                {project?.dimensions.filter(d => d.content.length > 0).length || 0} / {project?.dimensions.length || 0}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>{currentLanguage === 'ru' ? 'Аудиты ИИ:' : 'AI Audits:'}</span>
                              <span className="text-muted-foreground">
                                {project?.auditSessions.filter(s => s.status === 'completed').length || 0} {currentLanguage === 'ru' ? 'завершено' : 'completed'}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gear size={24} className="text-primary" />
                      {t('moduleColorSettings')}
                    </CardTitle>
                    <CardDescription>
                      {t('colorRangeConfig')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Overview Module Colors */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-lg flex items-center gap-2">
                        <ChartLine size={20} />
                        {t('overviewModule')}
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                          <Label htmlFor="overview-primary">{t('primaryColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="overview-primary"
                              type="color"
                              value={project.colorSettings?.overview?.primary?.includes('oklch') 
                                ? '#0ea5e9' 
                                : project.colorSettings?.overview?.primary || '#0ea5e9'
                              }
                              onChange={(e) => updateColorSettings('overview', 'primary', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.overview?.primary || 'oklch(55% 0.2 200)'}
                              onChange={(e) => updateColorSettings('overview', 'primary', e.target.value)}
                              placeholder="oklch(55% 0.2 200)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="overview-secondary">{t('secondaryColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="overview-secondary"
                              type="color"
                              value={project.colorSettings?.overview?.secondary?.includes('oklch')
                                ? '#334155'
                                : project.colorSettings?.overview?.secondary || '#334155'
                              }
                              onChange={(e) => updateColorSettings('overview', 'secondary', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.overview?.secondary || 'oklch(35% 0.1 220)'}
                              onChange={(e) => updateColorSettings('overview', 'secondary', e.target.value)}
                              placeholder="oklch(35% 0.1 220)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="overview-accent">{t('accentColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="overview-accent"
                              type="color"
                              value={project.colorSettings?.overview?.accent?.includes('oklch')
                                ? '#06b6d4'
                                : project.colorSettings?.overview?.accent || '#06b6d4'
                              }
                              onChange={(e) => updateColorSettings('overview', 'accent', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.overview?.accent || 'oklch(65% 0.25 180)'}
                              onChange={(e) => updateColorSettings('overview', 'accent', e.target.value)}
                              placeholder="oklch(65% 0.25 180)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="overview-background">{t('backgroundColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="overview-background"
                              type="color"
                              value={project.colorSettings?.overview?.background?.includes('oklch')
                                ? '#1e293b'
                                : project.colorSettings?.overview?.background || '#1e293b'
                              }
                              onChange={(e) => updateColorSettings('overview', 'background', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.overview?.background || 'oklch(16% 0.03 220)'}
                              onChange={(e) => updateColorSettings('overview', 'background', e.target.value)}
                              placeholder="oklch(16% 0.03 220)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Kipling Module Colors */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-lg flex items-center gap-2">
                        <Users size={20} />
                        {t('kiplingModule')}
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                          <Label htmlFor="kipling-primary">{t('primaryColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="kipling-primary"
                              type="color"
                              value={project.colorSettings?.kipling?.primary?.includes('oklch')
                                ? '#8b5cf6'
                                : project.colorSettings?.kipling?.primary || '#8b5cf6'
                              }
                              onChange={(e) => updateColorSettings('kipling', 'primary', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.kipling?.primary || 'oklch(60% 0.18 240)'}
                              onChange={(e) => updateColorSettings('kipling', 'primary', e.target.value)}
                              placeholder="oklch(60% 0.18 240)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="kipling-secondary">{t('secondaryColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="kipling-secondary"
                              type="color"
                              value={project.colorSettings?.kipling?.secondary?.includes('oklch')
                                ? '#6366f1'
                                : project.colorSettings?.kipling?.secondary || '#6366f1'
                              }
                              onChange={(e) => updateColorSettings('kipling', 'secondary', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.kipling?.secondary || 'oklch(40% 0.12 260)'}
                              onChange={(e) => updateColorSettings('kipling', 'secondary', e.target.value)}
                              placeholder="oklch(40% 0.12 260)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="kipling-accent">{t('accentColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="kipling-accent"
                              type="color"
                              value={project.colorSettings?.kipling?.accent?.includes('oklch')
                                ? '#a855f7'
                                : project.colorSettings?.kipling?.accent || '#a855f7'
                              }
                              onChange={(e) => updateColorSettings('kipling', 'accent', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.kipling?.accent || 'oklch(70% 0.22 220)'}
                              onChange={(e) => updateColorSettings('kipling', 'accent', e.target.value)}
                              placeholder="oklch(70% 0.22 220)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="kipling-background">{t('backgroundColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="kipling-background"
                              type="color"
                              value={project.colorSettings?.kipling?.background?.includes('oklch')
                                ? '#312e81'
                                : project.colorSettings?.kipling?.background || '#312e81'
                              }
                              onChange={(e) => updateColorSettings('kipling', 'background', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.kipling?.background || 'oklch(18% 0.025 240)'}
                              onChange={(e) => updateColorSettings('kipling', 'background', e.target.value)}
                              placeholder="oklch(18% 0.025 240)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* IKR Module Colors */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-lg flex items-center gap-2">
                        <Target size={20} />
                        {t('ikrModule')}
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                          <Label htmlFor="ikr-primary">{t('primaryColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="ikr-primary"
                              type="color"
                              value={project.colorSettings?.ikr?.primary?.includes('oklch')
                                ? '#10b981'
                                : project.colorSettings?.ikr?.primary || '#10b981'
                              }
                              onChange={(e) => updateColorSettings('ikr', 'primary', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.ikr?.primary || 'oklch(58% 0.19 160)'}
                              onChange={(e) => updateColorSettings('ikr', 'primary', e.target.value)}
                              placeholder="oklch(58% 0.19 160)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ikr-secondary">{t('secondaryColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="ikr-secondary"
                              type="color"
                              value={project.colorSettings?.ikr?.secondary?.includes('oklch')
                                ? '#059669'
                                : project.colorSettings?.ikr?.secondary || '#059669'
                              }
                              onChange={(e) => updateColorSettings('ikr', 'secondary', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.ikr?.secondary || 'oklch(38% 0.11 180)'}
                              onChange={(e) => updateColorSettings('ikr', 'secondary', e.target.value)}
                              placeholder="oklch(38% 0.11 180)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ikr-accent">{t('accentColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="ikr-accent"
                              type="color"
                              value={project.colorSettings?.ikr?.accent?.includes('oklch')
                                ? '#34d399'
                                : project.colorSettings?.ikr?.accent || '#34d399'
                              }
                              onChange={(e) => updateColorSettings('ikr', 'accent', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.ikr?.accent || 'oklch(68% 0.23 140)'}
                              onChange={(e) => updateColorSettings('ikr', 'accent', e.target.value)}
                              placeholder="oklch(68% 0.23 140)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ikr-background">{t('backgroundColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="ikr-background"
                              type="color"
                              value={project.colorSettings?.ikr?.background?.includes('oklch')
                                ? '#064e3b'
                                : project.colorSettings?.ikr?.background || '#064e3b'
                              }
                              onChange={(e) => updateColorSettings('ikr', 'background', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.ikr?.background || 'oklch(17% 0.028 160)'}
                              onChange={(e) => updateColorSettings('ikr', 'background', e.target.value)}
                              placeholder="oklch(17% 0.028 160)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Chat Module Colors */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-lg flex items-center gap-2">
                        <ChatCircle size={20} />
                        {t('chatModule')}
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                          <Label htmlFor="chat-primary">{t('primaryColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="chat-primary"
                              type="color"
                              value={project.colorSettings?.chat?.primary?.includes('oklch')
                                ? '#a855f7'
                                : project.colorSettings?.chat?.primary || '#a855f7'
                              }
                              onChange={(e) => updateColorSettings('chat', 'primary', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.chat?.primary || 'oklch(65% 0.2 280)'}
                              onChange={(e) => updateColorSettings('chat', 'primary', e.target.value)}
                              placeholder="oklch(65% 0.2 280)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="chat-secondary">{t('secondaryColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="chat-secondary"
                              type="color"
                              value={project.colorSettings?.chat?.secondary?.includes('oklch')
                                ? '#7c3aed'
                                : project.colorSettings?.chat?.secondary || '#7c3aed'
                              }
                              onChange={(e) => updateColorSettings('chat', 'secondary', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.chat?.secondary || 'oklch(45% 0.12 300)'}
                              onChange={(e) => updateColorSettings('chat', 'secondary', e.target.value)}
                              placeholder="oklch(45% 0.12 300)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="chat-accent">{t('accentColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="chat-accent"
                              type="color"
                              value={project.colorSettings?.chat?.accent?.includes('oklch')
                                ? '#c084fc'
                                : project.colorSettings?.chat?.accent || '#c084fc'
                              }
                              onChange={(e) => updateColorSettings('chat', 'accent', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.chat?.accent || 'oklch(75% 0.25 260)'}
                              onChange={(e) => updateColorSettings('chat', 'accent', e.target.value)}
                              placeholder="oklch(75% 0.25 260)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="chat-background">{t('backgroundColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="chat-background"
                              type="color"
                              value={project.colorSettings?.chat?.background?.includes('oklch')
                                ? '#581c87'
                                : project.colorSettings?.chat?.background || '#581c87'
                              }
                              onChange={(e) => updateColorSettings('chat', 'background', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.chat?.background || 'oklch(20% 0.03 280)'}
                              onChange={(e) => updateColorSettings('chat', 'background', e.target.value)}
                              placeholder="oklch(20% 0.03 280)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Debate Module Colors */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-lg flex items-center gap-2">
                        <Users size={20} />
                        {t('agentDebate')}
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                          <Label htmlFor="debate-primary">{t('primaryColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="debate-primary"
                              type="color"
                              value={project.colorSettings?.debate?.primary?.includes('oklch')
                                ? '#10b981'
                                : project.colorSettings?.debate?.primary || '#10b981'
                              }
                              onChange={(e) => updateColorSettings('debate', 'primary', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.debate?.primary || 'oklch(63% 0.19 120)'}
                              onChange={(e) => updateColorSettings('debate', 'primary', e.target.value)}
                              placeholder="oklch(63% 0.19 120)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="debate-secondary">{t('secondaryColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="debate-secondary"
                              type="color"
                              value={project.colorSettings?.debate?.secondary?.includes('oklch')
                                ? '#059669'
                                : project.colorSettings?.debate?.secondary || '#059669'
                              }
                              onChange={(e) => updateColorSettings('debate', 'secondary', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.debate?.secondary || 'oklch(43% 0.13 140)'}
                              onChange={(e) => updateColorSettings('debate', 'secondary', e.target.value)}
                              placeholder="oklch(43% 0.13 140)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="debate-accent">{t('accentColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="debate-accent"
                              type="color"
                              value={project.colorSettings?.debate?.accent?.includes('oklch')
                                ? '#34d399'
                                : project.colorSettings?.debate?.accent || '#34d399'
                              }
                              onChange={(e) => updateColorSettings('debate', 'accent', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.debate?.accent || 'oklch(73% 0.23 100)'}
                              onChange={(e) => updateColorSettings('debate', 'accent', e.target.value)}
                              placeholder="oklch(73% 0.23 100)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="debate-background">{t('backgroundColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="debate-background"
                              type="color"
                              value={project.colorSettings?.debate?.background?.includes('oklch')
                                ? '#064e3b'
                                : project.colorSettings?.debate?.background || '#064e3b'
                              }
                              onChange={(e) => updateColorSettings('debate', 'background', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.debate?.background || 'oklch(18% 0.025 120)'}
                              onChange={(e) => updateColorSettings('debate', 'background', e.target.value)}
                              placeholder="oklch(18% 0.025 120)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Executor Module Colors */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-lg flex items-center gap-2">
                        <ListChecks size={20} />
                        {t('executor')}
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                          <Label htmlFor="executor-primary">{t('primaryColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="executor-primary"
                              type="color"
                              value={project.colorSettings?.executor?.primary?.includes('oklch')
                                ? '#f59e0b'
                                : project.colorSettings?.executor?.primary || '#f59e0b'
                              }
                              onChange={(e) => updateColorSettings('executor', 'primary', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.executor?.primary || 'oklch(61% 0.18 60)'}
                              onChange={(e) => updateColorSettings('executor', 'primary', e.target.value)}
                              placeholder="oklch(61% 0.18 60)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="executor-secondary">{t('secondaryColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="executor-secondary"
                              type="color"
                              value={project.colorSettings?.executor?.secondary?.includes('oklch')
                                ? '#d97706'
                                : project.colorSettings?.executor?.secondary || '#d97706'
                              }
                              onChange={(e) => updateColorSettings('executor', 'secondary', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.executor?.secondary || 'oklch(41% 0.12 80)'}
                              onChange={(e) => updateColorSettings('executor', 'secondary', e.target.value)}
                              placeholder="oklch(41% 0.12 80)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="executor-accent">{t('accentColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="executor-accent"
                              type="color"
                              value={project.colorSettings?.executor?.accent?.includes('oklch')
                                ? '#fbbf24'
                                : project.colorSettings?.executor?.accent || '#fbbf24'
                              }
                              onChange={(e) => updateColorSettings('executor', 'accent', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.executor?.accent || 'oklch(71% 0.22 40)'}
                              onChange={(e) => updateColorSettings('executor', 'accent', e.target.value)}
                              placeholder="oklch(71% 0.22 40)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="executor-background">{t('backgroundColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="executor-background"
                              type="color"
                              value={project.colorSettings?.executor?.background?.includes('oklch')
                                ? '#92400e'
                                : project.colorSettings?.executor?.background || '#92400e'
                              }
                              onChange={(e) => updateColorSettings('executor', 'background', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.executor?.background || 'oklch(17% 0.027 60)'}
                              onChange={(e) => updateColorSettings('executor', 'background', e.target.value)}
                              placeholder="oklch(17% 0.027 60)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />
                    <div className="space-y-4">
                      <h4 className="font-medium text-lg flex items-center gap-2">
                        <ChatCircle size={20} />
                        {t('chatModule')}
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                          <Label htmlFor="chat-primary">{t('primaryColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="chat-primary"
                              type="color"
                              value={project.colorSettings?.chat?.primary?.includes('oklch')
                                ? '#a855f7'
                                : project.colorSettings?.chat?.primary || '#a855f7'
                              }
                              onChange={(e) => updateColorSettings('chat', 'primary', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.chat?.primary || 'oklch(65% 0.2 280)'}
                              onChange={(e) => updateColorSettings('chat', 'primary', e.target.value)}
                              placeholder="oklch(65% 0.2 280)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="chat-secondary">{t('secondaryColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="chat-secondary"
                              type="color"
                              value={project.colorSettings?.chat?.secondary?.includes('oklch')
                                ? '#7c3aed'
                                : project.colorSettings?.chat?.secondary || '#7c3aed'
                              }
                              onChange={(e) => updateColorSettings('chat', 'secondary', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.chat?.secondary || 'oklch(45% 0.12 300)'}
                              onChange={(e) => updateColorSettings('chat', 'secondary', e.target.value)}
                              placeholder="oklch(45% 0.12 300)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="chat-accent">{t('accentColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="chat-accent"
                              type="color"
                              value={project.colorSettings?.chat?.accent?.includes('oklch')
                                ? '#c084fc'
                                : project.colorSettings?.chat?.accent || '#c084fc'
                              }
                              onChange={(e) => updateColorSettings('chat', 'accent', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.chat?.accent || 'oklch(75% 0.25 260)'}
                              onChange={(e) => updateColorSettings('chat', 'accent', e.target.value)}
                              placeholder="oklch(75% 0.25 260)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="chat-background">{t('backgroundColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="chat-background"
                              type="color"
                              value={project.colorSettings?.chat?.background?.includes('oklch')
                                ? '#581c87'
                                : project.colorSettings?.chat?.background || '#581c87'
                              }
                              onChange={(e) => updateColorSettings('chat', 'background', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.chat?.background || 'oklch(20% 0.03 280)'}
                              onChange={(e) => updateColorSettings('chat', 'background', e.target.value)}
                              placeholder="oklch(20% 0.03 280)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Audit Module Colors */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-lg flex items-center gap-2">
                        <Robot size={20} />
                        {t('auditModule')}
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                          <Label htmlFor="audit-primary">{t('primaryColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="audit-primary"
                              type="color"
                              value={project.colorSettings?.audit?.primary?.includes('oklch')
                                ? '#f97316'
                                : project.colorSettings?.audit?.primary || '#f97316'
                              }
                              onChange={(e) => updateColorSettings('audit', 'primary', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.audit?.primary || 'oklch(62% 0.17 15)'}
                              onChange={(e) => updateColorSettings('audit', 'primary', e.target.value)}
                              placeholder="oklch(62% 0.17 15)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="audit-secondary">{t('secondaryColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="audit-secondary"
                              type="color"
                              value={project.colorSettings?.audit?.secondary?.includes('oklch')
                                ? '#ea580c'
                                : project.colorSettings?.audit?.secondary || '#ea580c'
                              }
                              onChange={(e) => updateColorSettings('audit', 'secondary', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.audit?.secondary || 'oklch(42% 0.13 35)'}
                              onChange={(e) => updateColorSettings('audit', 'secondary', e.target.value)}
                              placeholder="oklch(42% 0.13 35)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="audit-accent">{t('accentColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="audit-accent"
                              type="color"
                              value={project.colorSettings?.audit?.accent?.includes('oklch')
                                ? '#fb7185'
                                : project.colorSettings?.audit?.accent || '#fb7185'
                              }
                              onChange={(e) => updateColorSettings('audit', 'accent', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.audit?.accent || 'oklch(72% 0.21 350)'}
                              onChange={(e) => updateColorSettings('audit', 'accent', e.target.value)}
                              placeholder="oklch(72% 0.21 350)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="audit-background">{t('backgroundColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="audit-background"
                              type="color"
                              value={project.colorSettings?.audit?.background?.includes('oklch')
                                ? '#7c2d12'
                                : project.colorSettings?.audit?.background || '#7c2d12'
                              }
                              onChange={(e) => updateColorSettings('audit', 'background', e.target.value)}
                              className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                              value={project.colorSettings?.audit?.background || 'oklch(19% 0.022 15)'}
                              onChange={(e) => updateColorSettings('audit', 'background', e.target.value)}
                              placeholder="oklch(19% 0.022 15)"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4">
                      <Button variant="outline" onClick={resetColorsToDefault}>
                        <ArrowRight size={16} className="mr-2 rotate-180" />
                        {t('resetToDefault')}
                      </Button>
                      <Button onClick={applyColorSettings}>
                        <CheckCircle size={16} className="mr-2" />
                        {t('applyColors')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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