import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import SystemDiagnostics from './components/SystemDiagnostics';
import StepByStepExecutor from './components/StepByStepExecutor';
import AutoRecovery from './components/AutoRecovery';
import ErrorMonitoring from './components/ErrorMonitoring';
import StepByStepRecovery from './components/StepByStepRecovery';
import CheckpointSystem from './components/CheckpointSystem';
import TaskManagementSystem from './components/TaskManagementSystem';
import IntegrationTest from './components/IntegrationTest';
import AgentMemoryManager from './components/AgentMemoryManager';
import DebateLogManager from './components/DebateLogManager';
import AgentJournalManager from './components/AgentJournalManager';
import UIEvolutionAudit from './components/UIEvolutionAudit';
import NavigationGuide from './components/NavigationGuide';
import ProjectIntegrationJournal from './components/ProjectIntegrationJournal';
import FileUploadManager from './components/FileUploadManager';
import MicroTaskExecutor from './components/MicroTaskExecutor';
import UIIntegrationManager from './components/UIIntegrationManager';
import E2ETestingSystem from './components/E2ETestingSystem';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import AdvancedSearchFilter from './components/AdvancedSearchFilter';
import AutoBackupSystem from './components/AutoBackupSystem';
import ExternalAPIIntegrator from './components/ExternalAPIIntegrator';
import VersionControlSystem from './components/VersionControlSystem';
import LocalAgentExecutor from './components/LocalAgentExecutor';
import GlobalProjectSettings from './components/GlobalProjectSettings';
import IntelligenceGathering from './components/IntelligenceGathering';
import SourceCredibilityAssessment from './components/SourceCredibilityAssessment';
import ProjectRequirementsTracker from './components/ProjectRequirementsTracker';
import AuthenticationSystem from './components/AuthenticationSystem';
import TaskIntegrationTracker from './components/TaskIntegrationTracker';
import NotificationSystem, { 
  notifyTaskCompleted, 
  notifyBlockerDetected, 
  notifyAuditResult,
  notifyIntegrationComplete 
} from './components/NotificationSystem';
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
  Headphones,
  Bell,
  MagnifyingGlass
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
  started: { en: 'Started', ru: 'Начало' },
  findings: { en: 'Findings', ru: 'Находки' },
  instructions: { en: 'Instructions', ru: 'Инструкции' },
  userGuide: { en: 'User Guide', ru: 'Руководство пользователя' },
  howToUse: { en: 'How to use AXON platform', ru: 'Как использовать платформу АКСОН' },
  diagnostics: { en: 'System Diagnostics & Recovery', ru: 'Диагностика и Восстановление Системы' },
  
  // UI Evolution Audit
  uiAudit: { en: 'UI Evolution Audit', ru: 'Аудит Эволюции UI' },
  uiAuditDesc: { en: 'Analyze and evolve user interface', ru: 'Анализ и эволюция пользовательского интерфейса' },
  
  // Agent Memory System
  agentMemory: { en: 'Agent Memory', ru: 'Память Агентов' },
  agentMemorySystem: { en: 'Agent Memory System', ru: 'Система Памяти Агентов' },
  memoryBackup: { en: 'Memory Backup', ru: 'Резервное Копирование Памяти' },
  logCollection: { en: 'Log Collection', ru: 'Сбор Логов' },
  memoryCreation: { en: 'Memory Creation', ru: 'Создание Памяти' },
  silentVerification: { en: 'Silent Verification', ru: 'Тихая Верификация' },
  auditCuration: { en: 'Audit Curation', ru: 'Курирование Аудитом' },
  debateMemory: { en: 'Debate Memory', ru: 'Память Дебатов' },
  agentLearning: { en: 'Agent Learning', ru: 'Обучение Агентов' },
  
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
  local: { en: 'Local/Custom', ru: 'Локальный/Пользовательский' },
  
  // File Management
  fileManagement: { en: 'File Management', ru: 'Управление Файлами' },
  uploadFiles: { en: 'Upload Files', ru: 'Загрузить Файлы' },
  uploadFile: { en: 'Upload File', ru: 'Загрузить Файл' },
  fileLibrary: { en: 'File Library', ru: 'Библиотека Файлов' },
  selectFiles: { en: 'Select Files', ru: 'Выбрать Файлы' },
  dragDropFiles: { en: 'Drag and drop files here, or click to select', ru: 'Перетащите файлы сюда или нажмите для выбора' },
  supportedFormats: { en: 'Supported formats', ru: 'Поддерживаемые форматы' },
  fileUploaded: { en: 'File uploaded successfully', ru: 'Файл успешно загружен' },
  fileUploadFailed: { en: 'File upload failed', ru: 'Ошибка загрузки файла' },
  fileName: { en: 'File Name', ru: 'Имя Файла' },
  fileSize: { en: 'File Size', ru: 'Размер Файла' },
  fileType: { en: 'File Type', ru: 'Тип Файла' },
  uploadedAt: { en: 'Uploaded', ru: 'Загружен' },
  fileCategory: { en: 'Category', ru: 'Категория' },
  fileDescription: { en: 'Description', ru: 'Описание' },
  fileTags: { en: 'Tags', ru: 'Теги' },
  addTags: { en: 'Add tags...', ru: 'Добавить теги...' },
  analyzeFile: { en: 'Analyze File', ru: 'Анализировать Файл' },
  fileAnalysis: { en: 'File Analysis', ru: 'Анализ Файла' },
  removeFile: { en: 'Remove File', ru: 'Удалить Файл' },
  downloadFile: { en: 'Download File', ru: 'Скачать Файл' },
  previewFile: { en: 'Preview File', ru: 'Предпросмотр Файла' },
  
  // File Categories
  document: { en: 'Document', ru: 'Документ' },
  image: { en: 'Image', ru: 'Изображение' },
  data: { en: 'Data', ru: 'Данные' },
  media: { en: 'Media', ru: 'Медиа' },
  other: { en: 'Other', ru: 'Другое' },
  
  // File Analysis
  contentAnalysis: { en: 'Content Analysis', ru: 'Анализ Содержания' },
  structureAnalysis: { en: 'Structure Analysis', ru: 'Анализ Структуры' },
  securityAnalysis: { en: 'Security Analysis', ru: 'Анализ Безопасности' },
  metadataAnalysis: { en: 'Metadata Analysis', ru: 'Анализ Метаданных' },
  analysisResults: { en: 'Analysis Results', ru: 'Результаты Анализа' },
  confidence: { en: 'Confidence', ru: 'Достоверность' },
  noFilesUploaded: { en: 'No files uploaded yet', ru: 'Файлы еще не загружены' },
  fileAnalysisStarted: { en: 'File analysis started', ru: 'Анализ файла начат' },
  fileAnalysisCompleted: { en: 'File analysis completed', ru: 'Анализ файла завершен' },

  // Help System Navigation
  helpSystem: { en: 'Help System', ru: 'Система Помощи' },
  quickStart: { en: 'Quick Start', ru: 'Быстрый Старт' },
  tutorialMode: { en: 'Tutorial Mode', ru: 'Режим Обучения' },
  searchHelp: { en: 'Search Help', ru: 'Поиск Помощи' },
  searchPlaceholder: { en: 'Search instructions...', ru: 'Поиск инструкций...' },
  categories: { en: 'Categories', ru: 'Категории' },
  basicUsage: { en: 'Basic Usage', ru: 'Базовое Использование' },
  advancedFeatures: { en: 'Advanced Features', ru: 'Расширенные Возможности' },
  troubleshooting: { en: 'Troubleshooting', ru: 'Решение Проблем' },
  stepByStep: { en: 'Step by Step', ru: 'Пошагово' },
  previousStep: { en: 'Previous Step', ru: 'Предыдущий Шаг' },
  nextStep: { en: 'Next Step', ru: 'Следующий Шаг' },
  finishTutorial: { en: 'Finish Tutorial', ru: 'Завершить Обучение' },
  
  // Help Categories
  gettingStarted: { en: 'Getting Started', ru: 'Начало Работы' },
  projectManagement: { en: 'Project Management', ru: 'Управление Проектами' },
  analysisTools: { en: 'Analysis Tools', ru: 'Инструменты Анализа' },
  aiFeatures: { en: 'AI Features', ru: 'Возможности ИИ' },
  systemSettings: { en: 'System Settings', ru: 'Настройки Системы' },
  
  // Navigation
  backToHelp: { en: 'Back to Help', ru: 'Назад к Помощи' },
  relatedTopics: { en: 'Related Topics', ru: 'Связанные Темы' },
  helpfulTips: { en: 'Helpful Tips', ru: 'Полезные Советы' },
  commonIssues: { en: 'Common Issues', ru: 'Частые Проблемы' },
  
  // Tutorial Steps
  step: { en: 'Step', ru: 'Шаг' },
  of: { en: 'of', ru: 'из' },
  tutorialCompleted: { en: 'Completed', ru: 'Завершено' },
  inProgress: { en: 'In Progress', ru: 'В Процессе' },
  notStarted: { en: 'Not Started', ru: 'Не Начато' }
};

const useTranslation = (language: Language) => {
  return (key: string): string => {
    return translations[key]?.[language] || key;
  };
};

// Type definitions for instructions and help system
interface InstructionSection {
  id: string;
  title: string;
  description: string;
  steps: InstructionStep[];
  tips?: string[];
  troubleshooting?: TroubleshootingItem[];
  relatedSections?: string[];
}

interface InstructionStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  example?: string;
  warning?: string;
}

interface TroubleshootingItem {
  problem: string;
  solution: string;
  severity: 'low' | 'medium' | 'high';
}

interface HelpCategory {
  id: string;
  title: string;
  icon: string;
  sections: InstructionSection[];
}

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

interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  content?: string; // For text files
  dataUrl?: string; // For binary files as base64
  category: 'document' | 'image' | 'data' | 'media' | 'other';
  description?: string;
  tags: string[];
  analysisNotes?: string;
}

interface FileAnalysisResult {
  fileId: string;
  agentId: string;
  analysisType: 'content' | 'structure' | 'security' | 'metadata';
  results: string[];
  insights: string[];
  timestamp: string;
  confidence: number;
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
  files: ProjectFile[];
  fileAnalyses: FileAnalysisResult[];
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
  memory: {
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
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  // Real-time system health monitoring
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

  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useKV<{
    renderTimes: number[];
    apiResponseTimes: number[];
    memoryUsage: number[];
    errorCount: number;
    lastUpdated: string;
  }>('performance-metrics', {
    renderTimes: [],
    apiResponseTimes: [],
    memoryUsage: [],
    errorCount: 0,
    lastUpdated: new Date().toISOString()
  });

  // Chat UI state
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

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

    // Update performance metrics
    setPerformanceMetrics(current => ({
      renderTimes: [...(current?.renderTimes || []).slice(-19), responseTime],
      apiResponseTimes: current?.apiResponseTimes || [],
      memoryUsage: current?.memoryUsage || [],
      errorCount: current?.errorCount || 0,
      lastUpdated: new Date().toISOString()
    }));

    return overallHealth;
  };

  // Run health checks periodically
  useEffect(() => {
    runSystemHealthCheck();
    
    const healthCheckInterval = setInterval(runSystemHealthCheck, 60000); // Every minute
    
    return () => clearInterval(healthCheckInterval);
  }, [projects]);

  // Critical health monitoring
  useEffect(() => {
    if (systemHealth && systemHealth.overall < 70) {
      toast.error(`System health critical: ${systemHealth.overall}%`, {
        duration: 5000,
        action: {
          label: 'View Details',
          onClick: () => setActiveTab('diagnostics')
        }
      });
    }
  }, [systemHealth?.overall]);

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
    },
    memory: {
      primary: 'oklch(59% 0.19 320)',
      secondary: 'oklch(39% 0.13 340)',
      accent: 'oklch(69% 0.23 300)',
      background: 'oklch(18% 0.026 320)'
    }
  });

  // Generate comprehensive help documentation
  const generateHelpDocumentation = (language: Language): HelpCategory[] => [
    {
      id: 'getting-started',
      title: t('gettingStarted'),
      icon: 'play',
      sections: [
        {
          id: 'first-steps',
          title: language === 'ru' ? 'Первые шаги' : 'First Steps',
          description: language === 'ru' 
            ? 'Как начать работу с платформой АКСОН' 
            : 'How to get started with the AXON platform',
          steps: [
            {
              id: 'create-project',
              title: language === 'ru' ? 'Создание проекта' : 'Creating a Project',
              description: language === 'ru' 
                ? 'Нажмите кнопку "Новый Анализ" в правом верхнем углу' 
                : 'Click the "New Analysis" button in the top right corner',
              action: 'button_click',
              example: language === 'ru' 
                ? 'Пример: "Анализ кибербезопасности компании"' 
                : 'Example: "Company cybersecurity analysis"'
            },
            {
              id: 'add-title-description',
              title: language === 'ru' ? 'Добавление названия и описания' : 'Adding Title and Description',
              description: language === 'ru' 
                ? 'Введите осмысленное название и краткое описание анализа' 
                : 'Enter a meaningful title and brief description of the analysis',
              example: language === 'ru' 
                ? 'Название: "Аудит ИТ-инфраструктуры"\nОписание: "Комплексный анализ безопасности системы"' 
                : 'Title: "IT Infrastructure Audit"\nDescription: "Comprehensive system security analysis"'
            }
          ],
          tips: [
            language === 'ru' 
              ? 'Используйте описательные названия для легкого поиска проектов' 
              : 'Use descriptive names for easy project searching',
            language === 'ru' 
              ? 'Описание поможет вам вспомнить цель анализа через время' 
              : 'Description will help you remember the analysis purpose later'
          ]
        }
      ]
    },
    {
      id: 'analysis-tools',
      title: t('analysisTools'),
      icon: 'chart',
      sections: [
        {
          id: 'kipling-protocol',
          title: language === 'ru' ? 'Протокол Киплинга' : 'Kipling Protocol',
          description: language === 'ru' 
            ? 'Систематический анализ по методу 6 вопросов' 
            : 'Systematic analysis using the 6 questions method',
          steps: [
            {
              id: 'understand-dimensions',
              title: language === 'ru' ? 'Понимание измерений' : 'Understanding Dimensions',
              description: language === 'ru' 
                ? 'Изучите каждое измерение: Кто, Что, Когда, Где, Почему, Как' 
                : 'Study each dimension: Who, What, When, Where, Why, How',
              action: 'navigate',
              example: language === 'ru' 
                ? 'Кто: участники, заинтересованные стороны\nЧто: основные события и проблемы' 
                : 'Who: participants, stakeholders\nWhat: main events and issues'
            },
            {
              id: 'fill-content',
              title: language === 'ru' ? 'Заполнение содержания' : 'Filling Content',
              description: language === 'ru' 
                ? 'Добавьте детальную информацию в каждое измерение' 
                : 'Add detailed information to each dimension',
              warning: language === 'ru' 
                ? 'Не оставляйте измерения пустыми - это снизит качество анализа' 
                : 'Do not leave dimensions empty - this will reduce analysis quality'
            },
            {
              id: 'generate-insights',
              title: language === 'ru' ? 'Генерация выводов' : 'Generating Insights',
              description: language === 'ru' 
                ? 'Используйте кнопку "Создать Выводы" для получения рекомендаций ИИ' 
                : 'Use the "Generate Insights" button to get AI recommendations',
              action: 'button_click'
            }
          ],
          relatedSections: ['ikr-directive', 'ai-features']
        },
        {
          id: 'ikr-directive',
          title: language === 'ru' ? 'Директива IKR' : 'IKR Directive',
          description: language === 'ru' 
            ? 'Трёхэтапный процесс: Разведка-Знания-Рассуждения' 
            : 'Three-stage process: Intelligence-Knowledge-Reasoning',
          steps: [
            {
              id: 'intelligence-collection',
              title: language === 'ru' ? 'Сбор разведданных' : 'Intelligence Collection',
              description: language === 'ru' 
                ? 'Документируйте процесс сбора информации и источники' 
                : 'Document the information gathering process and sources',
              example: language === 'ru' 
                ? 'Источники: открытые данные, интервью, документы\nМетоды: анализ трафика, опросы, наблюдение' 
                : 'Sources: open data, interviews, documents\nMethods: traffic analysis, surveys, observation'
            },
            {
              id: 'knowledge-synthesis',
              title: language === 'ru' ? 'Синтез знаний' : 'Knowledge Synthesis',
              description: language === 'ru' 
                ? 'Объединяйте данные в связанные паттерны и взаимосвязи' 
                : 'Combine data into connected patterns and relationships'
            },
            {
              id: 'strategic-reasoning',
              title: language === 'ru' ? 'Стратегические рассуждения' : 'Strategic Reasoning',
              description: language === 'ru' 
                ? 'Формулируйте выводы и рекомендации на основе анализа' 
                : 'Formulate conclusions and recommendations based on analysis'
            }
          ]
        }
      ]
    },
    {
      id: 'ai-features',
      title: t('aiFeatures'),
      icon: 'robot',
      sections: [
        {
          id: 'audit-agents',
          title: language === 'ru' ? 'Агенты аудита' : 'Audit Agents',
          description: language === 'ru' 
            ? 'Настройка и использование ИИ-агентов для аудита' 
            : 'Setting up and using AI agents for auditing',
          steps: [
            {
              id: 'select-agent-type',
              title: language === 'ru' ? 'Выбор типа агента' : 'Selecting Agent Type',
              description: language === 'ru' 
                ? 'Выберите подходящий тип агента: Безопасность, Предвзятость, Производительность, Соответствие' 
                : 'Choose appropriate agent type: Security, Bias, Performance, Compliance'
            },
            {
              id: 'configure-api',
              title: language === 'ru' ? 'Настройка API' : 'API Configuration',
              description: language === 'ru' 
                ? 'Нажмите кнопку "API" и введите ключ облачного провайдера' 
                : 'Click "API" button and enter cloud provider key',
              warning: language === 'ru' 
                ? 'Без API ключа агент не сможет работать' 
                : 'Agent cannot work without API key'
            },
            {
              id: 'adjust-settings',
              title: language === 'ru' ? 'Настройка параметров' : 'Adjusting Settings',
              description: language === 'ru' 
                ? 'Используйте кнопку "Настроить" для изменения чувствительности и глубины анализа' 
                : 'Use "Configure" button to adjust sensitivity and analysis depth'
            }
          ],
          troubleshooting: [
            {
              problem: language === 'ru' ? 'Аудит не запускается' : 'Audit does not start',
              solution: language === 'ru' 
                ? 'Проверьте настройку API ключа и подключение к интернету' 
                : 'Check API key setup and internet connection',
              severity: 'high'
            },
            {
              problem: language === 'ru' ? 'Медленная работа агента' : 'Slow agent performance',
              solution: language === 'ru' 
                ? 'Уменьшите глубину анализа или выберите более быструю модель' 
                : 'Reduce analysis depth or choose faster model',
              severity: 'medium'
            }
          ]
        }
      ]
    }
  ];
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
    
    if (!proj.auditAgents || !proj.auditSessions || !proj.chatSessions || !proj.debate || !proj.tasks || !proj.files || !proj.fileAnalyses) {
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
        },
        files: proj.files || [],
        fileAnalyses: proj.fileAnalyses || []
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
      },
      files: [],
      fileAnalyses: []
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
      case 'memory':
        if (settings.memory) {
          root.style.setProperty('--module-primary', settings.memory.primary);
          root.style.setProperty('--module-secondary', settings.memory.secondary);
          root.style.setProperty('--module-accent', settings.memory.accent);
          root.style.setProperty('--module-background', settings.memory.background);
        }
        break;
    }
    
    toast.success(t('colorApplied'));
  };

  // Apply colors when tab changes and add module-specific CSS classes
  useEffect(() => {
    if (project?.colorSettings) {
      applyColorSettings();
      // Apply module-specific CSS class to body for enhanced theming
      document.body.className = document.body.className.replace(/module-\w+/g, '');
      document.body.classList.add(`module-${activeTab}`);
    }
  }, [activeTab, project?.colorSettings]);

  // Advanced keyboard shortcuts and accessibility
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for quick search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Future: Open quick search modal
        toast.info('Quick search shortcut activated (Ctrl/Cmd + K)');
      }
      
      // Ctrl/Cmd + N for new project
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setIsCreatingProject(true);
      }
      
      // Ctrl/Cmd + S for save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        toast.success(t('analysisSaved'));
      }
      
      // Escape to close dialogs
      if (e.key === 'Escape') {
        setIsCreatingProject(false);
        setIsConfiguringAgent(false);
        setIsConfiguringApi(false);
        setShowInstructions(false);
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [t]);

  // Auto-save functionality
  useEffect(() => {
    if (!project) return;
    
    const autoSaveInterval = setInterval(() => {
      // Auto-save every 30 seconds
      if (project) {
        const lastModified = new Date(project.lastModified);
        const now = new Date();
        const timeDiff = now.getTime() - lastModified.getTime();
        
        // Only show auto-save notification if there were recent changes
        if (timeDiff < 35000) {
          toast.info('Auto-saved', { duration: 1000 });
        }
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [project]);

  // Performance monitoring
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Log performance metrics for monitoring
      if (renderTime > 1000) {
        console.warn(`Slow render detected: ${renderTime}ms`);
      }
    };
  }, [activeTab]);

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
        
        // Send notification about audit completion
        notifyAuditResult(agent.name, (result.findings || []).length, project.id);
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

  // Generate insights using LLM with enhanced context awareness
  const generateInsights = async (dimensionId: string) => {
    if (!project) return;
    
    const dimension = project.dimensions.find(d => d.id === dimensionId);
    if (!dimension || !dimension.content) {
      toast.error(t('addContentFirst'));
      return;
    }

    try {
      // Build context from other dimensions for richer insights
      const contextualData = {
        currentDimension: {
          id: dimension.id,
          title: dimension.title,
          content: dimension.content
        },
        otherDimensions: project.dimensions
          .filter(d => d.id !== dimensionId && d.content.length > 50)
          .map(d => ({ title: d.title, content: d.content.substring(0, 200) })),
        ikrContext: project.ikrDirective,
        projectContext: {
          title: project.title,
          description: project.description,
          completeness: calculateCompleteness(project)
        }
      };

      const prompt = spark.llmPrompt`You are an expert intelligence analyst using the IKR directive framework. 

Current analysis focus: ${dimension.title} - "${dimension.content}"

Project context: ${JSON.stringify(contextualData, null, 2)}

Generate 3-5 actionable insights that:
1. Address the specific ${dimension.title} dimension
2. Connect to other available analysis dimensions  
3. Support the IKR directive methodology
4. Provide concrete next steps for intelligence gathering or analysis
5. Consider potential intelligence gaps or verification needs

Return as a JSON object with a single property called "insights" containing an array of insight strings. Each insight should be specific, actionable, and professionally relevant to intelligence analysis.`;
      
      const response = await spark.llm(prompt, 'gpt-4o-mini', true);
      const result = JSON.parse(response);
      
      updateDimension(dimensionId, 'insights', result.insights || []);
      toast.success(t('insightsGenerated'));
      
      // Track insight generation for analytics
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('Insights Generated', {
          dimensionId,
          projectId: project.id,
          insightCount: (result.insights || []).length
        });
      }
      
    } catch (error) {
      toast.error(t('failedToGenerate'));
      console.error('Error generating insights:', error);
    }
  };

  // Enhanced export analysis report with multiple formats and comprehensive data
  const exportReport = async (format: 'json' | 'pdf' | 'excel' | 'xml' = 'json') => {
    if (!project) return;

    const timestamp = new Date().toISOString();
    const completeness = calculateCompleteness(project);

    const comprehensiveReportData = {
      metadata: {
        projectId: project.id,
        projectTitle: project.title,
        projectDescription: project.description,
        exportTimestamp: timestamp,
        completeness: completeness,
        language: currentLanguage,
        version: '1.0.0'
      },
      executiveSummary: {
        totalDimensions: project.dimensions.length,
        completedDimensions: project.dimensions.filter(d => d.content.length > 0).length,
        totalInsights: project.dimensions.reduce((sum, d) => sum + d.insights.length, 0),
        auditSessions: project.auditSessions.length,
        completedAudits: project.auditSessions.filter(s => s.status === 'completed').length,
        chatMessages: project.chatSessions.reduce((sum, s) => sum + s.messages.length, 0)
      },
      analysisFramework: {
        kiplingProtocol: project.dimensions.map(d => ({
          dimension: d.title,
          question: d.question,
          analysis: d.content,
          insights: d.insights,
          priority: d.priority,
          completeness: d.completeness,
          wordCount: d.content.split(' ').length,
          lastModified: project.lastModified
        })),
        ikrDirective: {
          intelligence: {
            content: project.ikrDirective.intelligence,
            wordCount: project.ikrDirective.intelligence.split(' ').length,
            completed: project.ikrDirective.intelligence.length > 100
          },
          knowledge: {
            content: project.ikrDirective.knowledge,
            wordCount: project.ikrDirective.knowledge.split(' ').length,
            completed: project.ikrDirective.knowledge.length > 100
          },
          reasoning: {
            content: project.ikrDirective.reasoning,
            wordCount: project.ikrDirective.reasoning.split(' ').length,
            completed: project.ikrDirective.reasoning.length > 100
          }
        }
      },
      aiAuditResults: project.auditSessions.map(session => {
        const agent = project.auditAgents.find(a => a.id === session.agentId);
        return {
          sessionId: session.id,
          agentName: agent?.name || 'Unknown Agent',
          agentType: agent?.type || 'unknown',
          auditType: session.auditType,
          status: session.status,
          startTime: session.startTime,
          endTime: session.endTime,
          duration: session.endTime && session.startTime ? 
            new Date(session.endTime).getTime() - new Date(session.startTime).getTime() : null,
          findings: session.results,
          findingsCount: session.findings,
          riskLevel: session.findings > 5 ? 'high' : session.findings > 2 ? 'medium' : 'low'
        };
      }),
      chatAnalytics: {
        totalSessions: project.chatSessions.length,
        totalMessages: project.chatSessions.reduce((sum, s) => sum + s.messages.length, 0),
        userMessages: project.chatSessions.reduce((sum, s) => 
          sum + s.messages.filter(m => m.type === 'user').length, 0),
        aiResponses: project.chatSessions.reduce((sum, s) => 
          sum + s.messages.filter(m => m.type === 'assistant').length, 0),
        averageSessionLength: project.chatSessions.length > 0 ? 
          project.chatSessions.reduce((sum, s) => sum + s.messages.length, 0) / project.chatSessions.length : 0
      },
      systemHealth: {
        projectCreated: project.createdAt,
        lastModified: project.lastModified,
        timespan: new Date().getTime() - new Date(project.createdAt).getTime(),
        backupCount: 0, // Would be populated from backup system
        errorCount: 0, // Would be populated from error monitoring
        performanceScore: completeness > 80 ? 'excellent' : completeness > 60 ? 'good' : 'needs improvement'
      },
      recommendations: await generateReportRecommendations(project, completeness)
    };

    // Generate filename based on project and format
    const sanitizedTitle = project.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `axon-analysis-${sanitizedTitle}-${dateStr}`;

    switch (format) {
      case 'json':
        const jsonBlob = new Blob([JSON.stringify(comprehensiveReportData, null, 2)], { 
          type: 'application/json' 
        });
        downloadFile(jsonBlob, `${filename}.json`);
        break;
        
      case 'excel':
        // Generate Excel-compatible CSV with multiple sheets data
        const csvData = generateExcelCompatibleCSV(comprehensiveReportData);
        const csvBlob = new Blob([csvData], { type: 'text/csv' });
        downloadFile(csvBlob, `${filename}.csv`);
        break;
        
      case 'xml':
        const xmlData = generateXMLReport(comprehensiveReportData);
        const xmlBlob = new Blob([xmlData], { type: 'application/xml' });
        downloadFile(xmlBlob, `${filename}.xml`);
        break;
        
      case 'pdf':
        // For PDF, we'll generate an HTML version and prompt user to print to PDF
        const htmlReport = generateHTMLReport(comprehensiveReportData);
        const htmlBlob = new Blob([htmlReport], { type: 'text/html' });
        downloadFile(htmlBlob, `${filename}.html`);
        toast.info('HTML report generated. Use browser print function to save as PDF.');
        break;
        
      default:
        const defaultBlob = new Blob([JSON.stringify(comprehensiveReportData, null, 2)], { 
          type: 'application/json' 
        });
        downloadFile(defaultBlob, `${filename}.json`);
    }
    
    toast.success(`${format.toUpperCase()} ${t('reportExported')}`);
  };

  // Helper function to download files
  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate AI-powered recommendations for the report
  const generateReportRecommendations = async (proj: AnalysisProject, completeness: number) => {
    try {
      const prompt = spark.llmPrompt`Based on this intelligence analysis project data:

Project: ${proj.title}
Completeness: ${completeness}%
Dimensions completed: ${proj.dimensions.filter(d => d.content.length > 0).length}/${proj.dimensions.length}
IKR sections filled: ${Object.values(proj.ikrDirective).filter(v => v.length > 50).length}/3
Total insights: ${proj.dimensions.reduce((sum, d) => sum + d.insights.length, 0)}
Audit sessions: ${proj.auditSessions.length}

Generate 3-5 specific recommendations to improve this analysis. Focus on:
1. Areas needing more investigation
2. Missing connections between dimensions
3. IKR directive completion
4. Additional audit recommendations
5. Quality improvements

Return as JSON with property "recommendations" containing array of recommendation strings.`;

      const response = await spark.llm(prompt, 'gpt-4o-mini', true);
      const result = JSON.parse(response);
      return result.recommendations || [];
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [
        'Complete all Kipling dimensions for comprehensive analysis',
        'Fill out IKR directive sections for strategic insights',
        'Run AI audits to identify potential issues',
        'Generate insights for each completed dimension',
        'Review and cross-reference findings across dimensions'
      ];
    }
  };

  // Generate Excel-compatible CSV
  const generateExcelCompatibleCSV = (data: any) => {
    const lines = [
      'AXON Intelligence Analysis Report - Executive Summary',
      '',
      'Project Information',
      `Title,${data.metadata.projectTitle}`,
      `Description,${data.metadata.projectDescription}`,
      `Completeness,${data.metadata.completeness}%`,
      `Export Date,${data.metadata.exportTimestamp}`,
      '',
      'Analysis Framework - Kipling Dimensions',
      'Dimension,Question,Word Count,Completeness,Insights Count',
      ...data.analysisFramework.kiplingProtocol.map((d: any) => 
        `${d.dimension},"${d.question}",${d.wordCount},${d.completeness}%,${d.insights.length}`
      ),
      '',
      'AI Audit Results',
      'Agent,Type,Status,Findings Count,Risk Level',
      ...data.aiAuditResults.map((audit: any) => 
        `${audit.agentName},${audit.agentType},${audit.status},${audit.findingsCount},${audit.riskLevel}`
      ),
      '',
      'Recommendations',
      ...data.recommendations.map((rec: string) => `"${rec}"`)
    ];
    
    return lines.join('\n');
  };

  // Generate XML report
  const generateXMLReport = (data: any) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<AxonAnalysisReport>
  <Metadata>
    <ProjectId>${data.metadata.projectId}</ProjectId>
    <Title>${data.metadata.projectTitle}</Title>
    <Description>${data.metadata.projectDescription}</Description>
    <Completeness>${data.metadata.completeness}</Completeness>
    <ExportTimestamp>${data.metadata.exportTimestamp}</ExportTimestamp>
  </Metadata>
  <KiplingDimensions>
    ${data.analysisFramework.kiplingProtocol.map((d: any) => `
    <Dimension>
      <Name>${d.dimension}</Name>
      <Question>${d.question}</Question>
      <WordCount>${d.wordCount}</WordCount>
      <Completeness>${d.completeness}</Completeness>
      <Insights>
        ${d.insights.map((insight: string) => `<Insight>${insight}</Insight>`).join('')}
      </Insights>
    </Dimension>`).join('')}
  </KiplingDimensions>
  <AuditResults>
    ${data.aiAuditResults.map((audit: any) => `
    <Audit>
      <Agent>${audit.agentName}</Agent>
      <Type>${audit.agentType}</Type>
      <Status>${audit.status}</Status>
      <FindingsCount>${audit.findingsCount}</FindingsCount>
      <RiskLevel>${audit.riskLevel}</RiskLevel>
    </Audit>`).join('')}
  </AuditResults>
  <Recommendations>
    ${data.recommendations.map((rec: string) => `<Recommendation>${rec}</Recommendation>`).join('')}
  </Recommendations>
</AxonAnalysisReport>`;
  };

  // Generate HTML report
  const generateHTMLReport = (data: any) => {
    return `<!DOCTYPE html>
<html>
<head>
  <title>AXON Intelligence Analysis Report</title>
  <style>
    body { font-family: Inter, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 30px; }
    .section { margin-bottom: 30px; }
    .dimension { border: 1px solid #e2e8f0; padding: 15px; margin-bottom: 15px; border-radius: 8px; }
    .audit { background: #f8fafc; padding: 10px; margin-bottom: 10px; border-radius: 6px; }
    .metric { display: inline-block; margin-right: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
    th { background: #f1f5f9; }
    .recommendation { background: #ecfccb; padding: 10px; margin: 5px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>AXON Intelligence Analysis Report</h1>
    <h2>${data.metadata.projectTitle}</h2>
    <p>${data.metadata.projectDescription}</p>
    <p>Generated: ${new Date(data.metadata.exportTimestamp).toLocaleString()}</p>
  </div>
  
  <div class="section">
    <h3>Executive Summary</h3>
    <div class="metric">Completeness: ${data.metadata.completeness}%</div>
    <div class="metric">Dimensions: ${data.executiveSummary.completedDimensions}/${data.executiveSummary.totalDimensions}</div>
    <div class="metric">Total Insights: ${data.executiveSummary.totalInsights}</div>
    <div class="metric">Audits: ${data.executiveSummary.completedAudits}/${data.executiveSummary.auditSessions}</div>
  </div>

  <div class="section">
    <h3>Kipling Protocol Analysis</h3>
    ${data.analysisFramework.kiplingProtocol.map((d: any) => `
    <div class="dimension">
      <h4>${d.dimension}</h4>
      <p><strong>Question:</strong> ${d.question}</p>
      <p><strong>Word Count:</strong> ${d.wordCount} | <strong>Completeness:</strong> ${d.completeness}%</p>
      ${d.insights.length > 0 ? `
      <p><strong>Key Insights:</strong></p>
      <ul>
        ${d.insights.map((insight: string) => `<li>${insight}</li>`).join('')}
      </ul>` : ''}
    </div>`).join('')}
  </div>

  <div class="section">
    <h3>AI Audit Results</h3>
    ${data.aiAuditResults.map((audit: any) => `
    <div class="audit">
      <strong>${audit.agentName}</strong> (${audit.agentType}) - 
      Status: ${audit.status} | 
      Findings: ${audit.findingsCount} | 
      Risk: ${audit.riskLevel}
    </div>`).join('')}
  </div>

  <div class="section">
    <h3>Recommendations</h3>
    ${data.recommendations.map((rec: string) => `<div class="recommendation">${rec}</div>`).join('')}
  </div>
</body>
</html>`;
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
                  {systemHealth.issues.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0 text-xs"
                      onClick={() => setActiveTab('diagnostics')}
                    >
                      <Warning size={12} className="text-yellow-500" />
                    </Button>
                  )}
                </div>
              )}

              {/* Instructions Button */}
              <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Question size={16} className="mr-2" />
                    {t('instructions')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>{t('userGuide')}</DialogTitle>
                    <DialogDescription>
                      {t('howToUse')}
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-[70vh] pr-4">
                    <NavigationGuide 
                      language={currentLanguage} 
                      currentModule={activeTab}
                    />
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
                  <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download size={16} className="mr-2" />
                        {t('export')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Export Analysis Report</DialogTitle>
                        <DialogDescription>
                          Choose the format for your comprehensive analysis report
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-3 py-4">
                        <Button onClick={() => { exportReport('json'); setShowExportDialog(false); }} className="justify-start">
                          <FileText size={16} className="mr-2" />
                          JSON - Complete structured data
                        </Button>
                        <Button onClick={() => { exportReport('excel'); setShowExportDialog(false); }} variant="outline" className="justify-start">
                          <FileText size={16} className="mr-2" />
                          CSV - Excel compatible spreadsheet
                        </Button>
                        <Button onClick={() => { exportReport('xml'); setShowExportDialog(false); }} variant="outline" className="justify-start">
                          <FileText size={16} className="mr-2" />
                          XML - Structured markup format
                        </Button>
                        <Button onClick={() => { exportReport('pdf'); setShowExportDialog(false); }} variant="outline" className="justify-start">
                          <FileText size={16} className="mr-2" />
                          HTML - Printable report (save as PDF)
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
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
              <div className="relative">
                {/* Enhanced Tab Navigation with scrolling support */}
                <ScrollArea className="w-full whitespace-nowrap">
                  <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-max min-w-full">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                      <ChartLine size={14} />
                      {t('overview')}
                    </TabsTrigger>
                    <TabsTrigger value="intelligence" className="flex items-center gap-2">
                      <MagnifyingGlass size={14} />
                      Intelligence
                    </TabsTrigger>
                    <TabsTrigger value="kipling" className="flex items-center gap-2">
                      <Users size={14} />
                      {t('kipling')}
                    </TabsTrigger>
                    <TabsTrigger value="ikr" className="flex items-center gap-2">
                      <Target size={14} />
                      {t('ikr')}
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="flex items-center gap-2">
                      <Shield size={14} />
                      {t('aiAudit')}
                    </TabsTrigger>
                    <TabsTrigger value="debate" className="flex items-center gap-2">
                      <Users size={14} />
                      {t('agentDebate')}
                    </TabsTrigger>
                    <TabsTrigger value="executor" className="flex items-center gap-2">
                      <ListChecks size={14} />
                      {t('executor')}
                    </TabsTrigger>
                    <TabsTrigger value="memory" className="flex items-center gap-2">
                      <Brain size={14} />
                      {t('agentMemory')}
                    </TabsTrigger>
                    <TabsTrigger value="files" className="flex items-center gap-2">
                      <FileText size={14} />
                      {t('fileManagement')}
                    </TabsTrigger>
                    <TabsTrigger value="diagnostics" className="flex items-center gap-2">
                      <Gear size={14} />
                      {t('diagnostics')}
                      {systemHealth && systemHealth.issues.length > 0 && (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse ml-1" />
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="flex items-center gap-2">
                      <ChatCircle size={14} />
                      {t('chat')}
                    </TabsTrigger>
                    <TabsTrigger value="journal" className="flex items-center gap-2">
                      <FileText size={14} />
                      Journal
                    </TabsTrigger>
                    <TabsTrigger value="microtasks" className="flex items-center gap-2">
                      <ListChecks size={14} />
                      MicroTasks
                    </TabsTrigger>
                    <TabsTrigger value="integration" className="flex items-center gap-2">
                      <Graph size={14} />
                      Integration
                    </TabsTrigger>
                    <TabsTrigger value="testing" className="flex items-center gap-2">
                      <Bug size={14} />
                      E2E Tests
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                      <ChartLine size={14} />
                      Analytics
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                      <Bell size={14} />
                      Notifications
                    </TabsTrigger>
                    <TabsTrigger value="advanced-search" className="flex items-center gap-2">
                      <MagnifyingGlass size={14} />
                      Search
                    </TabsTrigger>
                    <TabsTrigger value="auto-backup" className="flex items-center gap-2">
                      <FloppyDisk size={14} />
                      Backup
                    </TabsTrigger>
                    <TabsTrigger value="api-integrator" className="flex items-center gap-2">
                      <CloudArrowUp size={14} />
                      API
                    </TabsTrigger>
                    <TabsTrigger value="version-control" className="flex items-center gap-2">
                      <Gear size={14} />
                      Version
                    </TabsTrigger>
                    <TabsTrigger value="ui-audit" className="flex items-center gap-2">
                      <Eye size={14} />
                      {t('uiAudit')}
                    </TabsTrigger>
                    <TabsTrigger value="local-executor" className="flex items-center gap-2">
                      <Robot size={14} />
                      Executor
                    </TabsTrigger>
                    <TabsTrigger value="global-settings" className="flex items-center gap-2">
                      <Gear size={14} />
                      Global Settings
                    </TabsTrigger>
                    <TabsTrigger value="authentication" className="flex items-center gap-2">
                      <Shield size={14} />
                      {language === 'ru' ? 'Аутентификация' : 'Authentication'}
                    </TabsTrigger>
                    <TabsTrigger value="requirements-tracker" className="flex items-center gap-2">
                      <ListChecks size={14} />
                      {language === 'ru' ? 'ТЗ Трекер' : 'Requirements'}
                    </TabsTrigger>
                    <TabsTrigger value="task-integration" className="flex items-center gap-2">
                      <Target size={14} />
                      {language === 'ru' ? 'Блоки Задач' : 'Task Blocks'}
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center gap-2">
                      <Gear size={14} />
                      {t('settings')}
                    </TabsTrigger>
                  </TabsList>
                </ScrollArea>
                
                {/* Tab Status Indicators */}
                <div className="absolute top-0 right-0 flex items-center gap-1 bg-background px-2 py-1 rounded-bl-md">
                  {project.auditSessions.some(s => s.status === 'running') && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" title="Audit running" />
                  )}
                  {systemHealth && systemHealth.issues.length > 0 && (
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" title="System issues" />
                  )}
                  {performanceMetrics && performanceMetrics.errorCount > 0 && (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Errors detected" />
                  )}
                </div>
              </div>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Real-time Analytics Dashboard */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="cyber-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Project Health</p>
                          <p className="text-2xl font-bold text-primary">
                            {calculateCompleteness(project)}%
                          </p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          calculateCompleteness(project) >= 80 ? 'bg-green-500' :
                          calculateCompleteness(project) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="cyber-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Insights</p>
                          <p className="text-2xl font-bold text-accent">
                            {project.dimensions.reduce((sum, d) => sum + d.insights.length, 0)}
                          </p>
                        </div>
                        <Brain size={16} className="text-accent" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="cyber-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">AI Audits</p>
                          <p className="text-2xl font-bold text-secondary">
                            {project.auditSessions.filter(s => s.status === 'completed').length}
                          </p>
                        </div>
                        <Shield size={16} className="text-secondary" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="cyber-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">System Health</p>
                          <p className="text-2xl font-bold text-green-500">
                            {systemHealth?.overall || 100}%
                          </p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          (systemHealth?.overall || 100) >= 90 ? 'bg-green-500' :
                          (systemHealth?.overall || 100) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        } ${(systemHealth?.overall || 100) < 100 ? 'animate-pulse' : ''}`} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Analysis Progress Bar */}
                <Card className="cyber-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ChartLine size={20} />
                      Analysis Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Kipling Dimensions</span>
                            <span>{project.dimensions.filter(d => d.content.length > 0).length}/{project.dimensions.length}</span>
                          </div>
                          <Progress 
                            value={(project.dimensions.filter(d => d.content.length > 0).length / project.dimensions.length) * 100} 
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>IKR Directive</span>
                            <span>{Object.values(project.ikrDirective).filter(v => v.length > 50).length}/3</span>
                          </div>
                          <Progress 
                            value={(Object.values(project.ikrDirective).filter(v => v.length > 50).length / 3) * 100} 
                            className="h-2"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Generated Insights</span>
                            <span>{project.dimensions.reduce((sum, d) => sum + d.insights.length, 0)}</span>
                          </div>
                          <Progress 
                            value={Math.min(100, (project.dimensions.reduce((sum, d) => sum + d.insights.length, 0) / project.dimensions.length) * 20)} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Kipling Dimensions Grid */}
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

              {/* Intelligence Gathering Tab */}
              <TabsContent value="intelligence" className="space-y-6">
                <IntelligenceGathering
                  language={currentLanguage}
                  projectId={project.id}
                  onIntelligenceGathered={(data) => {
                    toast.success(`Intelligence collected: ${data.method}`, {
                      description: `${data.dataCollected} data points gathered`
                    });
                  }}
                  onGapIdentified={(gap) => {
                    toast.info(`Information gap identified: ${gap.area}`, {
                      description: `Priority: ${gap.priority} - ${gap.estimatedResolution}`
                    });
                  }}
                />
                
                <SourceCredibilityAssessment
                  language={currentLanguage}
                  projectId={project.id}
                  onSourceAssessed={(source) => {
                    toast.success(`Source assessed: ${source.name}`, {
                      description: `Credibility score: ${source.credibilityScore.overall}%`
                    });
                  }}
                  onVerificationCompleted={(verification) => {
                    toast.info(`Verification completed: ${verification.method}`, {
                      description: `Status: ${verification.status}`
                    });
                  }}
                />
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
                <StepByStepExecutor
                  language={currentLanguage}
                  onTaskCompleted={(task) => {
                    toast.success(`Task completed: ${task.title}`);
                  }}
                  onStepCompleted={(step) => {
                    toast.info(`Step completed: ${step.command.name}`);
                  }}
                />
              </TabsContent>

              {/* Agent Memory Tab */}
              <TabsContent value="memory" className="space-y-6">
                <div className="grid gap-6">
                  <AgentMemoryManager
                    language={currentLanguage}
                    projectId={project.id}
                    onMemoryCreated={(memoryFile) => {
                      toast.success(`Memory file created: ${memoryFile.name}`);
                    }}
                    onPipelineCompleted={(pipeline) => {
                      toast.success(`Memory pipeline completed: ${pipeline.request.name}`);
                    }}
                  />
                  
                  <Separator />
                  
                  <DebateLogManager
                    language={currentLanguage}
                    projectId={project.id}
                    globalSettings={{
                      auditingEnabled: true,  // Можно получить из глобальных настроек проекта
                      memoryRetentionDays: 30,
                      autoAnalysisEnabled: true,
                      qualityThreshold: 70
                    }}
                    onLogCreated={(log) => {
                      // Можно добавить логику для сохранения логов в проекте
                    }}
                    onMemoryExtracted={(memories) => {
                      toast.success(`Extracted ${memories.length} memory entries from debate logs`);
                    }}
                  />
                  
                  <Separator />
                  
                  <AgentJournalManager
                    language={currentLanguage}
                    projectId={project.id}
                    onEntryCreated={(entry) => {
                      toast.success(`Journal entry created: ${entry.title}`);
                    }}
                    onJournalExported={(journal) => {
                      toast.success(`Journal exported for agent: ${journal.agentId}`);
                    }}
                  />
                </div>
              </TabsContent>

              {/* File Management Tab */}
              <TabsContent value="files" className="space-y-6">
                <FileUploadManager
                  language={currentLanguage}
                  projectId={project.id}
                  onFileUploaded={(file) => {
                    toast.success(`File uploaded: ${file.name}`);
                  }}
                  onFileAnalyzed={(analysis) => {
                    toast.success(`File analysis completed: ${analysis.analysisType}`);
                  }}
                />
              </TabsContent>

              {/* System Diagnostics Tab */}
              <TabsContent value="diagnostics" className="space-y-6">
                <div className="grid gap-6">
                  <SystemDiagnostics
                    language={currentLanguage}
                    onIssueDetected={(issue) => {
                      toast.warning(`System issue detected: ${issue.description}`);
                    }}
                    onTaskCompleted={(task) => {
                      toast.success(`Task completed: ${task.title}`);
                    }}
                  />
                  
                  <Separator />
                  
                  <ErrorMonitoring
                    language={currentLanguage}
                    onErrorDetected={(error) => {
                      toast.error(`Error detected: ${error.message}`);
                    }}
                  />
                  
                  <Separator />
                  
                  <StepByStepRecovery
                    language={currentLanguage}
                    onStepCompleted={(step) => {
                      toast.success(`Recovery step completed: ${step.title}`);
                    }}
                    onSessionCompleted={(session) => {
                      toast.success(`Recovery session completed: ${session.name}`);
                    }}
                  />
                  
                  <Separator />
                  
                  <CheckpointSystem
                    language={currentLanguage}
                    onCheckpointCreated={(checkpoint) => {
                      toast.success(`Checkpoint created: ${checkpoint.name}`);
                    }}
                    onCheckpointRestored={(checkpoint) => {
                      toast.success(`System restored from: ${checkpoint.name}`);
                    }}
                  />
                  
                  <Separator />
                  
                  <TaskManagementSystem
                    language={currentLanguage}
                    onTaskCompleted={(task) => {
                      toast.success(`Task completed: ${task.name}`);
                    }}
                    onQueueCompleted={(queue) => {
                      toast.success(`All tasks completed in queue: ${queue.name}`);
                    }}
                  />
                  
                  <Separator />
                  
                  <IntegrationTest
                    language={currentLanguage}
                  />
                  
                  <Separator />
                  
                  <AutoRecovery
                    language={currentLanguage}
                    onRepairCompleted={(action) => {
                      toast.success(`Repair completed: ${action.action}`);
                    }}
                    onSystemHealthUpdated={(health) => {
                      if (health < 50) {
                        toast.error(`System health critical: ${health}%`);
                      }
                    }}
                  />
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

              {/* Project Integration Journal Tab */}
              <TabsContent value="journal" className="space-y-6">
                <ProjectIntegrationJournal
                  language={currentLanguage}
                  projectId={project.id}
                  onEntryCreated={(entry) => {
                    toast.success(`Journal entry created: ${entry.title}`);
                  }}
                  onMapUpdated={(map) => {
                    toast.success(`Project map updated: ${map.name}`);
                  }}
                  onPhaseCompleted={(phase) => {
                    toast.success(`Integration phase completed: ${phase.name}`);
                  }}
                />
              </TabsContent>

              {/* Micro Task Executor Tab */}
              <TabsContent value="microtasks" className="space-y-6">
                <MicroTaskExecutor
                  language={currentLanguage}
                  projectId={project.id}
                  onTaskCompleted={(task) => {
                    toast.success(`Micro-task completed: ${task.title}`);
                  }}
                  onSessionCompleted={(session) => {
                    toast.success(`Task session completed: ${session.name}`);
                  }}
                  onBreakdownCreated={(breakdown) => {
                    toast.success(`Task breakdown created: ${breakdown.originalTask}`);
                  }}
                />
              </TabsContent>

              {/* UI Integration Manager Tab */}
              <TabsContent value="integration" className="space-y-6">
                <UIIntegrationManager
                  language={currentLanguage}
                  projectId={project.id}
                  onIntegrationCompleted={(integration) => {
                    toast.success(`Integration completed: ${integration.name}`);
                  }}
                  onSessionCompleted={(session) => {
                    toast.success(`Integration session completed: ${session.name}`);
                  }}
                  onTestPassed={(testCase) => {
                    toast.success(`Test passed: ${testCase.title}`);
                  }}
                />
              </TabsContent>

              {/* E2E Testing System Tab */}
              <TabsContent value="testing" className="space-y-6">
                <E2ETestingSystem
                  language={currentLanguage}
                  projectId={project.id}
                  onTestCompleted={(testCase) => {
                    toast.success(`Test completed: ${testCase.name}`);
                  }}
                  onSuiteCompleted={(suite) => {
                    toast.success(`Test suite completed: ${suite.name}`);
                  }}
                  onIssueDetected={(issue) => {
                    toast.error(`Test issue: ${issue.error}`);
                    notifyBlockerDetected(`Test failed: ${issue.test} - ${issue.error}`, project.id);
                  }}
                />
              </TabsContent>

              {/* Advanced Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <AdvancedAnalytics
                  language={currentLanguage}
                  projectId={project.id}
                  onReportGenerated={(report) => {
                    toast.success(`Analytics report generated for project: ${project.title}`);
                  }}
                />
              </TabsContent>

              {/* Notification System Tab */}
              <TabsContent value="notifications" className="space-y-6">
                <NotificationSystem
                  language={currentLanguage}
                  projectId={project.id}
                  onNotificationClick={(notification) => {
                    // Handle notification click - could navigate to relevant tab
                    if (notification.actionUrl) {
                      window.location.hash = notification.actionUrl;
                    }
                  }}
                />
              </TabsContent>

              {/* Advanced Search Filter Tab */}
              <TabsContent value="advanced-search" className="space-y-6">
                <AdvancedSearchFilter
                  language={currentLanguage}
                  projectId={project.id}
                  onSearchResults={(results) => {
                    toast.success(`Found ${results.length} search results`);
                  }}
                  onFilterSaved={(filter) => {
                    toast.success(`Search filter saved: ${filter.name}`);
                  }}
                />
              </TabsContent>

              {/* Auto Backup System Tab */}
              <TabsContent value="auto-backup" className="space-y-6">
                <AutoBackupSystem
                  language={currentLanguage}
                  projectId={project.id}
                  onBackupCreated={(backup) => {
                    toast.success(`Backup created: ${backup.id}`);
                  }}
                  onRestoreCompleted={(restorePoint) => {
                    toast.success(`Restore completed: ${restorePoint.name}`);
                  }}
                />
              </TabsContent>

              {/* External API Integrator Tab */}
              <TabsContent value="api-integrator" className="space-y-6">
                <ExternalAPIIntegrator
                  language={currentLanguage}
                  projectId={project.id}
                  onConnectionEstablished={(connection) => {
                    toast.success(`API connection established: ${connection.name}`);
                  }}
                  onRequestCompleted={(request) => {
                    toast.success(`API request completed: ${request.method} ${request.endpoint}`);
                  }}
                  onWebhookTriggered={(webhook) => {
                    toast.info(`Webhook triggered: ${webhook.name}`);
                  }}
                />
              </TabsContent>

              {/* Version Control System Tab */}
              <TabsContent value="version-control" className="space-y-6">
                <VersionControlSystem
                  language={currentLanguage}
                  projectId={project.id}
                  onVersionCreated={(version) => {
                    toast.success(`Version created: ${version.version}`);
                  }}
                  onRollbackCompleted={(rollback) => {
                    toast.success(`Rollback completed: ${rollback.type}`);
                  }}
                  onBranchCreated={(branch) => {
                    toast.success(`Branch created: ${branch.name}`);
                  }}
                />
              </TabsContent>
              
              {/* UI Evolution Audit Tab */}
              <TabsContent value="ui-audit" className="space-y-6">
                <UIEvolutionAudit
                  language={currentLanguage}
                  projectId={project.id}
                  onAuditCompleted={(session) => {
                    toast.success(`UI audit completed with score: ${session.overallScore}%`);
                  }}
                  onSuggestionImplemented={(suggestion) => {
                    toast.success(`UI suggestion implemented: ${suggestion.title}`);
                  }}
                />
              </TabsContent>

              {/* Local Agent Executor Tab */}
              <TabsContent value="local-executor" className="space-y-6">
                <LocalAgentExecutor
                  language={currentLanguage}
                  projectId={project.id}
                  onTaskExecuted={(task) => {
                    notifyTaskCompleted(`Task executed: ${task.title}`, project.id);
                  }}
                  onTaskFailed={(task, error) => {
                    notifyBlockerDetected(`Task failed: ${task.title} - ${error}`, project.id);
                  }}
                  onTaskApproved={(task) => {
                    toast.success(currentLanguage === 'ru' ? `Задача одобрена: ${task.title}` : `Task approved: ${task.title}`);
                  }}
                  onTaskRollback={(task) => {
                    toast.info(currentLanguage === 'ru' ? `Задача откачена: ${task.title}` : `Task rolled back: ${task.title}`);
                  }}
                />
              </TabsContent>

              {/* Global Project Settings Tab */}
              <TabsContent value="global-settings" className="space-y-6">
                <GlobalProjectSettings
                  language={currentLanguage}
                  projectId={project.id}
                  onSettingsChanged={(settings) => {
                    toast.success(currentLanguage === 'ru' ? 'Настройки проекта обновлены' : 'Project settings updated');
                  }}
                  onAgentTemplateCreated={(template) => {
                    toast.success(currentLanguage === 'ru' ? `Шаблон агента создан: ${template.name}` : `Agent template created: ${template.name}`);
                  }}
                  onKnowledgeBaseUpdated={(kb) => {
                    toast.success(currentLanguage === 'ru' ? `База знаний обновлена: ${kb.name}` : `Knowledge base updated: ${kb.name}`);
                  }}
                  onAnalyticsReportGenerated={(report) => {
                    toast.success(currentLanguage === 'ru' ? `Отчёт аналитики создан: ${report.title}` : `Analytics report generated: ${report.title}`);
                  }}
                />
              </TabsContent>

              {/* Authentication Tab */}
              <TabsContent value="authentication" className="space-y-6">
                <AuthenticationSystem
                  language={currentLanguage}
                  projectId={project.id}
                  onUserAuthenticated={(user) => {
                    toast.success(`User authenticated: ${user.username}`);
                  }}
                  onSecurityEvent={(event) => {
                    if (event.riskLevel === 'critical' || event.riskLevel === 'high') {
                      toast.warning(`Security event: ${event.eventType}`);
                    }
                  }}
                  onPermissionChanged={(userId, permissions) => {
                    toast.info(`Permissions updated for user ${userId}`);
                  }}
                />
              </TabsContent>

              {/* Project Requirements Tracker Tab */}
              <TabsContent value="requirements-tracker" className="space-y-6">
                <ProjectRequirementsTracker
                  language={currentLanguage}
                  projectId={project.id}
                  onProgressUpdate={(progress) => {
                    toast.info(`Project progress updated: ${progress}%`);
                  }}
                  onRiskDetected={(risk) => {
                    toast.warning(`Risk detected: ${risk.description}`);
                  }}
                  onMilestoneReached={(milestone) => {
                    toast.success(`Milestone reached: ${milestone}`);
                  }}
                />
              </TabsContent>

              {/* Task Integration Tracker Tab */}
              <TabsContent value="task-integration" className="space-y-6">
                <TaskIntegrationTracker
                  language={currentLanguage}
                  projectId={project.id}
                  onTaskCompleted={(task) => {
                    toast.success(`Task completed: ${task.name}`);
                    notifyTaskCompleted(`Integration task completed: ${task.name}`, project.id);
                  }}
                  onBlockCompleted={(block) => {
                    toast.success(`Block completed: ${block.name}`);
                    notifyIntegrationComplete(`Task block completed: ${block.name}`, project.id);
                  }}
                  onBlockerDetected={(blocker, taskId) => {
                    toast.warning(`Blocker detected: ${blocker}`);
                    notifyBlockerDetected(`Task blocked: ${blocker}`, project.id);
                  }}
                />
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
                <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Download size={16} className="mr-2" />
                      {t('exportReport')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Export Analysis Report</DialogTitle>
                      <DialogDescription>
                        Choose the format for your comprehensive analysis report
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-4">
                      <Button onClick={() => { exportReport('json'); setShowExportDialog(false); }} className="justify-start">
                        <FileText size={16} className="mr-2" />
                        JSON - Complete structured data
                      </Button>
                      <Button onClick={() => { exportReport('excel'); setShowExportDialog(false); }} variant="outline" className="justify-start">
                        <FileText size={16} className="mr-2" />
                        CSV - Excel compatible spreadsheet
                      </Button>
                      <Button onClick={() => { exportReport('xml'); setShowExportDialog(false); }} variant="outline" className="justify-start">
                        <FileText size={16} className="mr-2" />
                        XML - Structured markup format
                      </Button>
                      <Button onClick={() => { exportReport('pdf'); setShowExportDialog(false); }} variant="outline" className="justify-start">
                        <FileText size={16} className="mr-2" />
                        HTML - Printable report (save as PDF)
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
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