import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Book,
  MagnifyingGlass as Search,
  Play,
  CaretRight as ChevronRight,
  CaretLeft as ChevronLeft,
  CheckCircle,
  Info,
  Lightbulb,
  Target,
  Users,
  Shield,
  Robot,
  Brain,
  Gear,
  Star,
  ArrowRight,
  Circle,
  FileText,
  Question as HelpCircle,
  PlayCircle,
  Eye,
  BookBookmark,
  CaretDown,
  CaretUp,
  NavigationArrow,
  Path,
  MapPin,
  Clock,
  Bookmark,
  List,
  CheckSquare,
  PresentationChart,
  Gauge
} from '@phosphor-icons/react';

interface NavigationGuideProps {
  language: 'en' | 'ru';
  currentModule?: string;
}

interface GuideStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  target?: string;
  completed?: boolean;
}

interface GuideSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  steps: GuideStep[];
  category: string;
  prerequisites?: string[];
}

interface TutorialProgress {
  sectionId: string;
  stepId: string;
  completed: boolean;
  timestamp: string;
}

const NavigationGuide: React.FC<NavigationGuideProps> = ({
  language,
  currentModule = 'overview'
}) => {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tutorialMode, setTutorialMode] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const [progress, setProgress] = useState<TutorialProgress[]>([]);
  const [showStepGuide, setShowStepGuide] = useState(false);
  const [highlightTarget, setHighlightTarget] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [bookmarkedSections, setBookmarkedSections] = useState<Set<string>>(new Set());
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  // Comprehensive guide sections covering ALL platform functionality
  const guideSections: GuideSection[] = [
    {
      id: 'platform-overview',
      title: language === 'ru' ? 'Обзор платформы AXON' : 'AXON Platform Overview',
      description: language === 'ru' 
        ? 'Познакомьтесь с основными возможностями и интерфейсом платформы AXON'
        : 'Get familiar with core capabilities and interface of AXON platform',
      icon: <Star size={20} />,
      difficulty: 'beginner',
      estimatedTime: language === 'ru' ? '3 минуты' : '3 minutes',
      category: 'getting-started',
      steps: [
        {
          id: 'overview-1',
          title: language === 'ru' ? 'Изучите заголовок системы' : 'Explore System Header',
          description: language === 'ru' 
            ? 'В верхней части находится название AXON, индикатор здоровья системы и переключатель языка'
            : 'At the top you\'ll find AXON name, system health indicator and language switcher',
          action: 'view',
          target: 'system-header'
        },
        {
          id: 'overview-2',
          title: language === 'ru' ? 'Понимание навигации' : 'Understanding Navigation',
          description: language === 'ru' 
            ? 'Вкладки в верхней части позволяют переключаться между 30+ модулями системы'
            : 'Tabs at the top allow switching between 30+ system modules',
          action: 'view',
          target: 'tab-navigation'
        },
        {
          id: 'overview-3',
          title: language === 'ru' ? 'Индикаторы статуса' : 'Status Indicators',
          description: language === 'ru' 
            ? 'Цветные точки показывают активность: зелёный = норма, жёлтый = предупреждение, красный = проблема'
            : 'Colored dots show activity: green = normal, yellow = warning, red = problem',
          action: 'view',
          target: 'status-indicators'
        }
      ]
    },
    {
      id: 'project-creation',
      title: language === 'ru' ? 'Создание проекта' : 'Project Creation',
      description: language === 'ru' 
        ? 'Изучите основы создания и настройки нового проекта анализа'
        : 'Learn the basics of creating and setting up a new analysis project',
      icon: <Play size={20} />,
      difficulty: 'beginner',
      estimatedTime: language === 'ru' ? '5 минут' : '5 minutes',
      category: 'getting-started',
      steps: [
        {
          id: 'step-1',
          title: language === 'ru' ? 'Нажмите "Новый Анализ"' : 'Click "New Analysis"',
          description: language === 'ru' 
            ? 'Найдите кнопку "Новый Анализ" в правом верхнем углу и нажмите на неё'
            : 'Find the "New Analysis" button in the top right corner and click it',
          action: 'click',
          target: 'new-analysis-button'
        },
        {
          id: 'step-2',
          title: language === 'ru' ? 'Введите название проекта' : 'Enter Project Title',
          description: language === 'ru' 
            ? 'Дайте вашему проекту описательное название, которое отражает суть анализа'
            : 'Give your project a descriptive title that reflects the nature of your analysis',
          action: 'input',
          target: 'project-title-input'
        },
        {
          id: 'step-3',
          title: language === 'ru' ? 'Добавьте описание' : 'Add Description',
          description: language === 'ru' 
            ? 'Кратко опишите цели и контекст вашего анализа'
            : 'Briefly describe the goals and context of your analysis',
          action: 'textarea',
          target: 'project-description'
        },
        {
          id: 'step-4',
          title: language === 'ru' ? 'Создайте проект' : 'Create Project',
          description: language === 'ru' 
            ? 'Нажмите кнопку "Создать Проект" для завершения создания'
            : 'Click the "Create Project" button to complete creation',
          action: 'click',
          target: 'create-project-button'
        }
      ]
    },
    {
      id: 'kipling-analysis',
      title: language === 'ru' ? 'Протокол Киплинга' : 'Kipling Protocol',
      description: language === 'ru' 
        ? 'Освойте систематический анализ по методу 6 вопросов Киплинга'
        : 'Master systematic analysis using Kipling\'s 6 questions method',
      icon: <Users size={20} />,
      difficulty: 'beginner',
      estimatedTime: language === 'ru' ? '15 минут' : '15 minutes',
      category: 'analysis-framework',
      prerequisites: ['project-creation'],
      steps: [
        {
          id: 'kipling-1',
          title: language === 'ru' ? 'Перейдите на вкладку Киплинга' : 'Navigate to Kipling Tab',
          description: language === 'ru' 
            ? 'Нажмите на вкладку "Протокол Киплинга" в верхней навигации'
            : 'Click on the "Kipling Protocol" tab in the top navigation',
          action: 'navigate',
          target: 'kipling-tab'
        },
        {
          id: 'kipling-2',
          title: language === 'ru' ? 'Начните с "Кто"' : 'Start with "Who"',
          description: language === 'ru' 
            ? 'Определите ключевых участников, заинтересованные стороны и лиц, принимающих решения'
            : 'Identify key participants, stakeholders and decision makers',
          action: 'input',
          target: 'who-dimension'
        },
        {
          id: 'kipling-3',
          title: language === 'ru' ? 'Опишите "Что"' : 'Describe "What"',
          description: language === 'ru' 
            ? 'Укажите основные события, проблемы и вопросы, требующие решения'
            : 'Specify main events, problems and issues that need resolution',
          action: 'input',
          target: 'what-dimension'
        },
        {
          id: 'kipling-4',
          title: language === 'ru' ? 'Установите "Когда"' : 'Establish "When"',
          description: language === 'ru' 
            ? 'Определите временные рамки, сроки принятия решений и критические моменты'
            : 'Define timeframes, decision deadlines and critical moments',
          action: 'input',
          target: 'when-dimension'
        },
        {
          id: 'kipling-5',
          title: language === 'ru' ? 'Локализуйте "Где"' : 'Locate "Where"',
          description: language === 'ru' 
            ? 'Укажите географические или контекстуальные места событий'
            : 'Specify geographical or contextual locations of events',
          action: 'input',
          target: 'where-dimension'
        },
        {
          id: 'kipling-6',
          title: language === 'ru' ? 'Объясните "Почему"' : 'Explain "Why"',
          description: language === 'ru' 
            ? 'Раскройте причины, мотивы и движущие силы ситуации'
            : 'Reveal causes, motives and driving forces of the situation',
          action: 'input',
          target: 'why-dimension'
        },
        {
          id: 'kipling-7',
          title: language === 'ru' ? 'Опишите "Как"' : 'Describe "How"',
          description: language === 'ru' 
            ? 'Укажите методы, процессы и механизмы выполнения'
            : 'Specify methods, processes and execution mechanisms',
          action: 'input',
          target: 'how-dimension'
        },
        {
          id: 'kipling-8',
          title: language === 'ru' ? 'Генерируйте выводы' : 'Generate Insights',
          description: language === 'ru' 
            ? 'Используйте ИИ для создания аналитических выводов по каждому измерению'
            : 'Use AI to generate analytical insights for each dimension',
          action: 'click',
          target: 'generate-insights-button'
        }
      ]
    },
    {
      id: 'ikr-directive',
      title: language === 'ru' ? 'Директива IKR' : 'IKR Directive',
      description: language === 'ru' 
        ? 'Применение трёхэтапного процесса Intelligence-Knowledge-Reasoning'
        : 'Apply the three-stage Intelligence-Knowledge-Reasoning process',
      icon: <Target size={20} />,
      difficulty: 'intermediate',
      estimatedTime: language === 'ru' ? '20 минут' : '20 minutes',
      category: 'analysis-framework',
      prerequisites: ['kipling-analysis'],
      steps: [
        {
          id: 'ikr-1',
          title: language === 'ru' ? 'Откройте вкладку IKR' : 'Open IKR Tab',
          description: language === 'ru' 
            ? 'Перейдите к директиве IKR для углубленного анализа'
            : 'Navigate to the IKR directive for in-depth analysis',
          action: 'navigate',
          target: 'ikr-tab'
        },
        {
          id: 'ikr-2',
          title: language === 'ru' ? 'Сбор разведданных (Intelligence)' : 'Intelligence Collection',
          description: language === 'ru' 
            ? 'Документируйте источники, методы сбора и исходную информацию'
            : 'Document sources, collection methods and raw information',
          action: 'textarea',
          target: 'intelligence-section'
        },
        {
          id: 'ikr-3',
          title: language === 'ru' ? 'Синтез знаний (Knowledge)' : 'Knowledge Synthesis',
          description: language === 'ru' 
            ? 'Объедините данные в связанные паттерны и взаимосвязи'
            : 'Combine data into connected patterns and relationships',
          action: 'textarea',
          target: 'knowledge-section'
        },
        {
          id: 'ikr-4',
          title: language === 'ru' ? 'Стратегические рассуждения (Reasoning)' : 'Strategic Reasoning',
          description: language === 'ru' 
            ? 'Сформулируйте выводы, прогнозы и рекомендации'
            : 'Formulate conclusions, predictions and recommendations',
          action: 'textarea',
          target: 'reasoning-section'
        }
      ]
    },
    {
      id: 'ai-audit-setup',
      title: language === 'ru' ? 'Настройка ИИ аудита' : 'AI Audit Setup',
      description: language === 'ru' 
        ? 'Настройка и запуск автоматизированных агентов аудита'
        : 'Setup and run automated audit agents',
      icon: <Shield size={20} />,
      difficulty: 'intermediate',
      estimatedTime: language === 'ru' ? '10 минут' : '10 minutes',
      category: 'ai-features',
      steps: [
        {
          id: 'audit-1',
          title: language === 'ru' ? 'Перейдите к аудиту ИИ' : 'Navigate to AI Audit',
          description: language === 'ru' 
            ? 'Откройте вкладку "ИИ Аудит" для работы с агентами'
            : 'Open the "AI Audit" tab to work with agents',
          action: 'navigate',
          target: 'audit-tab'
        },
        {
          id: 'audit-2',
          title: language === 'ru' ? 'Выберите агента' : 'Select Agent',
          description: language === 'ru' 
            ? 'Нажмите на одного из доступных агентов аудита'
            : 'Click on one of the available audit agents',
          action: 'click',
          target: 'audit-agent'
        },
        {
          id: 'audit-3',
          title: language === 'ru' ? 'Настройте API' : 'Configure API',
          description: language === 'ru' 
            ? 'Нажмите кнопку "API" и введите ваш ключ облачного провайдера'
            : 'Click the "API" button and enter your cloud provider key',
          action: 'click',
          target: 'api-config-button'
        },
        {
          id: 'audit-4',
          title: language === 'ru' ? 'Запустите аудит' : 'Start Audit',
          description: language === 'ru' 
            ? 'Выберите тип аудита и нажмите кнопку запуска'
            : 'Choose audit type and click the start button',
          action: 'click',
          target: 'start-audit-button'
        }
      ]
    },
    {
      id: 'chat-assistant',
      title: language === 'ru' ? 'ИИ Чат-ассистент' : 'AI Chat Assistant',
      description: language === 'ru' 
        ? 'Использование ИИ чата для анализа и получения рекомендаций'
        : 'Using AI chat for analysis and getting recommendations',
      icon: <Robot size={20} />,
      difficulty: 'beginner',
      estimatedTime: language === 'ru' ? '8 минут' : '8 minutes',
      category: 'ai-features',
      steps: [
        {
          id: 'chat-1',
          title: language === 'ru' ? 'Откройте чат' : 'Open Chat',
          description: language === 'ru' 
            ? 'Перейдите на вкладку "ИИ Чат" для интерактивного общения'
            : 'Navigate to "AI Chat" tab for interactive communication',
          action: 'navigate',
          target: 'chat-tab'
        },
        {
          id: 'chat-2',
          title: language === 'ru' ? 'Задайте вопрос' : 'Ask a Question',
          description: language === 'ru' 
            ? 'Введите вопрос о вашем анализе в поле ввода'
            : 'Enter a question about your analysis in the input field',
          action: 'input',
          target: 'chat-input'
        },
        {
          id: 'chat-3',
          title: language === 'ru' ? 'Используйте быстрые действия' : 'Use Quick Actions',
          description: language === 'ru' 
            ? 'Попробуйте кнопки быстрых действий для получения контекстной помощи'
            : 'Try quick action buttons for contextual assistance',
          action: 'click',
          target: 'quick-action-button'
        }
      ]
    },
    {
      id: 'file-management',
      title: language === 'ru' ? 'Управление файлами' : 'File Management',
      description: language === 'ru' 
        ? 'Загрузка, анализ и управление файлами проекта'
        : 'Upload, analyze and manage project files',
      icon: <FileText size={20} />,
      difficulty: 'intermediate',
      estimatedTime: language === 'ru' ? '10 минут' : '10 minutes',
      category: 'data-management',
      steps: [
        {
          id: 'file-1',
          title: language === 'ru' ? 'Откройте управление файлами' : 'Open File Management',
          description: language === 'ru' 
            ? 'Перейдите на вкладку "Управление Файлами" для работы с документами'
            : 'Navigate to "File Management" tab to work with documents',
          action: 'navigate',
          target: 'files-tab'
        },
        {
          id: 'file-2',
          title: language === 'ru' ? 'Загрузите файлы' : 'Upload Files',
          description: language === 'ru' 
            ? 'Перетащите файлы в область загрузки или нажмите для выбора'
            : 'Drag files to upload area or click to select',
          action: 'upload',
          target: 'file-upload-area'
        },
        {
          id: 'file-3',
          title: language === 'ru' ? 'Анализируйте содержимое' : 'Analyze Content',
          description: language === 'ru' 
            ? 'Используйте ИИ агентов для анализа загруженных файлов'
            : 'Use AI agents to analyze uploaded files',
          action: 'click',
          target: 'analyze-file-button'
        }
      ]
    },
    {
      id: 'advanced-modules',
      title: language === 'ru' ? 'Продвинутые модули' : 'Advanced Modules',
      description: language === 'ru' 
        ? 'Освоение специализированных модулей: UI аудит, тестирование, аналитика'
        : 'Master specialized modules: UI audit, testing, analytics',
      icon: <Brain size={20} />,
      difficulty: 'advanced',
      estimatedTime: language === 'ru' ? '25 минут' : '25 minutes',
      category: 'advanced-features',
      steps: [
        {
          id: 'adv-1',
          title: language === 'ru' ? 'UI аудит эволюции' : 'UI Evolution Audit',
          description: language === 'ru' 
            ? 'Анализируйте и улучшайте пользовательский интерфейс системы'
            : 'Analyze and improve system user interface',
          action: 'navigate',
          target: 'ui-audit-tab'
        },
        {
          id: 'adv-2',
          title: language === 'ru' ? 'E2E тестирование' : 'E2E Testing',
          description: language === 'ru' 
            ? 'Настройте и запустите комплексные тесты системы'
            : 'Set up and run comprehensive system tests',
          action: 'navigate',
          target: 'testing-tab'
        },
        {
          id: 'adv-3',
          title: language === 'ru' ? 'Продвинутая аналитика' : 'Advanced Analytics',
          description: language === 'ru' 
            ? 'Генерируйте подробные отчеты и метрики производительности'
            : 'Generate detailed reports and performance metrics',
          action: 'navigate',
          target: 'analytics-tab'
        },
        {
          id: 'adv-4',
          title: language === 'ru' ? 'Мастер-журнал' : 'Master Journal',
          description: language === 'ru' 
            ? 'Управляйте централизованным журналом всех операций системы'
            : 'Manage centralized journal of all system operations',
          action: 'navigate',
          target: 'master-journal-tab'
        }
      ]
    },
    {
      id: 'collaboration-features',
      title: language === 'ru' ? 'Совместная работа' : 'Collaboration Features',
      description: language === 'ru' 
        ? 'Функции для командной работы и совместного анализа'
        : 'Features for team work and collaborative analysis',
      icon: <Users size={20} />,
      difficulty: 'intermediate',
      estimatedTime: language === 'ru' ? '15 минут' : '15 minutes',
      category: 'collaboration',
      steps: [
        {
          id: 'collab-1',
          title: language === 'ru' ? 'Дебаты агентов' : 'Agent Debates',
          description: language === 'ru' 
            ? 'Настройте дебаты между ИИ агентами для получения разных точек зрения'
            : 'Set up debates between AI agents to get different perspectives',
          action: 'navigate',
          target: 'debate-tab'
        },
        {
          id: 'collab-2',
          title: language === 'ru' ? 'Совместный анализ' : 'Collaborative Analysis',
          description: language === 'ru' 
            ? 'Организуйте сессии совместного анализа с командой'
            : 'Organize collaborative analysis sessions with team',
          action: 'navigate',
          target: 'collaboration-tab'
        },
        {
          id: 'collab-3',
          title: language === 'ru' ? 'Система уведомлений' : 'Notification System',
          description: language === 'ru' 
            ? 'Настройте уведомления о важных событиях и обновлениях'
            : 'Configure notifications for important events and updates',
          action: 'navigate',
          target: 'notifications-tab'
        }
      ]
    },
    {
      id: 'system-administration',
      title: language === 'ru' ? 'Администрирование системы' : 'System Administration',
      description: language === 'ru' 
        ? 'Управление настройками, безопасностью и интеграциями'
        : 'Manage settings, security and integrations',
      icon: <Shield size={20} />,
      difficulty: 'advanced',
      estimatedTime: language === 'ru' ? '20 минут' : '20 minutes',
      category: 'administration',
      steps: [
        {
          id: 'admin-1',
          title: language === 'ru' ? 'Глобальные настройки' : 'Global Settings',
          description: language === 'ru' 
            ? 'Настройте общие параметры системы и поведение агентов'
            : 'Configure system-wide parameters and agent behavior',
          action: 'navigate',
          target: 'global-settings-tab'
        },
        {
          id: 'admin-2',
          title: language === 'ru' ? 'Аутентификация' : 'Authentication',
          description: language === 'ru' 
            ? 'Управляйте пользователями, ролями и правами доступа'
            : 'Manage users, roles and access permissions',
          action: 'navigate',
          target: 'authentication-tab'
        },
        {
          id: 'admin-3',
          title: language === 'ru' ? 'Внешние API' : 'External APIs',
          description: language === 'ru' 
            ? 'Настройте интеграции с внешними сервисами и API'
            : 'Configure integrations with external services and APIs',
          action: 'navigate',
          target: 'api-integrator-tab'
        },
        {
          id: 'admin-4',
          title: language === 'ru' ? 'Резервное копирование' : 'Backup System',
          description: language === 'ru' 
            ? 'Настройте автоматическое резервное копирование данных'
            : 'Configure automatic data backup system',
          action: 'navigate',
          target: 'auto-backup-tab'
        }
      ]
    },
    {
      id: 'system-diagnostics',
      title: language === 'ru' ? 'Диагностика системы' : 'System Diagnostics',
      description: language === 'ru' 
        ? 'Мониторинг производительности и устранение проблем'
        : 'Performance monitoring and troubleshooting',
      icon: <Gear size={20} />,
      difficulty: 'advanced',
      estimatedTime: language === 'ru' ? '12 минут' : '12 minutes',
      category: 'troubleshooting',
      steps: [
        {
          id: 'diag-1',
          title: language === 'ru' ? 'Откройте диагностику' : 'Open Diagnostics',
          description: language === 'ru' 
            ? 'Перейдите на вкладку "Диагностика и Восстановление Системы"'
            : 'Navigate to "System Diagnostics & Recovery" tab',
          action: 'navigate',
          target: 'diagnostics-tab'
        },
        {
          id: 'diag-2',
          title: language === 'ru' ? 'Проверьте здоровье системы' : 'Check System Health',
          description: language === 'ru' 
            ? 'Изучите индикаторы здоровья системы в верхней части'
            : 'Review system health indicators at the top',
          action: 'view',
          target: 'system-health-indicators'
        },
        {
          id: 'diag-3',
          title: language === 'ru' ? 'Запустите автовосстановление' : 'Run Auto Recovery',
          description: language === 'ru' 
            ? 'При обнаружении проблем используйте функцию автовосстановления'
            : 'When issues are detected, use the auto recovery feature',
          action: 'click',
          target: 'auto-recovery-button'
        },
        {
          id: 'diag-4',
          title: language === 'ru' ? 'Система контрольных точек' : 'Checkpoint System',
          description: language === 'ru' 
            ? 'Создайте контрольные точки для восстановления системы'
            : 'Create checkpoints for system recovery',
          action: 'click',
          target: 'checkpoint-button'
        }
      ]
    },
    {
      id: 'expert-workflow',
      title: language === 'ru' ? 'Экспертный рабочий процесс' : 'Expert Workflow',
      description: language === 'ru' 
        ? 'Полный цикл профессионального анализа от начала до экспорта'
        : 'Complete professional analysis cycle from start to export',
      icon: <Target size={20} />,
      difficulty: 'advanced',
      estimatedTime: language === 'ru' ? '45 минут' : '45 minutes',
      category: 'expert',
      prerequisites: ['kipling-analysis', 'ikr-directive', 'ai-audit-setup'],
      steps: [
        {
          id: 'expert-1',
          title: language === 'ru' ? 'Создание комплексного проекта' : 'Create Comprehensive Project',
          description: language === 'ru' 
            ? 'Создайте проект с детальным описанием и планом анализа'
            : 'Create project with detailed description and analysis plan',
          action: 'create',
          target: 'project-creation'
        },
        {
          id: 'expert-2',
          title: language === 'ru' ? 'Применение экспертного анализа' : 'Apply Expert Analysis',
          description: language === 'ru' 
            ? 'Используйте готовый экспертный анализ на вкладке Intelligence'
            : 'Use ready-made expert analysis on Intelligence tab',
          action: 'click',
          target: 'expert-analysis-button'
        },
        {
          id: 'expert-3',
          title: language === 'ru' ? 'Комплексный аудит ИИ' : 'Comprehensive AI Audit',
          description: language === 'ru' 
            ? 'Запустите все типы аудита для полной проверки системы'
            : 'Run all audit types for complete system verification',
          action: 'multiple',
          target: 'all-audit-types'
        },
        {
          id: 'expert-4',
          title: language === 'ru' ? 'Интерактивная работа с ИИ' : 'Interactive AI Work',
          description: language === 'ru' 
            ? 'Используйте чат для углубления анализа и получения рекомендаций'
            : 'Use chat to deepen analysis and get recommendations',
          action: 'chat',
          target: 'ai-chat-interaction'
        },
        {
          id: 'expert-5',
          title: language === 'ru' ? 'Экспорт профессионального отчета' : 'Export Professional Report',
          description: language === 'ru' 
            ? 'Создайте комплексный отчет в нескольких форматах'
            : 'Generate comprehensive report in multiple formats',
          action: 'export',
          target: 'multi-format-export'
        }
      ]
    }
  ];

  const categories = [
    { 
      id: 'getting-started', 
      title: language === 'ru' ? 'Начало работы' : 'Getting Started',
      icon: <PlayCircle size={16} />,
      description: language === 'ru' ? 'Основы работы с платформой' : 'Platform basics'
    },
    { 
      id: 'analysis-framework', 
      title: language === 'ru' ? 'Фреймворк анализа' : 'Analysis Framework',
      icon: <Brain size={16} />,
      description: language === 'ru' ? 'Киплинг и IKR методология' : 'Kipling and IKR methodology'
    },
    { 
      id: 'ai-features', 
      title: language === 'ru' ? 'Возможности ИИ' : 'AI Features',
      icon: <Robot size={16} />,
      description: language === 'ru' ? 'ИИ агенты и чат' : 'AI agents and chat'
    },
    { 
      id: 'data-management', 
      title: language === 'ru' ? 'Управление данными' : 'Data Management',
      icon: <FileText size={16} />,
      description: language === 'ru' ? 'Файлы и база знаний' : 'Files and knowledge base'
    },
    { 
      id: 'advanced-features', 
      title: language === 'ru' ? 'Продвинутые функции' : 'Advanced Features',
      icon: <Star size={16} />,
      description: language === 'ru' ? 'Специализированные модули' : 'Specialized modules'
    },
    { 
      id: 'collaboration', 
      title: language === 'ru' ? 'Совместная работа' : 'Collaboration',
      icon: <Users size={16} />,
      description: language === 'ru' ? 'Командная работа' : 'Team features'
    },
    { 
      id: 'administration', 
      title: language === 'ru' ? 'Администрирование' : 'Administration',
      icon: <Shield size={16} />,
      description: language === 'ru' ? 'Настройки и безопасность' : 'Settings and security'
    },
    { 
      id: 'troubleshooting', 
      title: language === 'ru' ? 'Решение проблем' : 'Troubleshooting',
      icon: <HelpCircle size={16} />,
      description: language === 'ru' ? 'Диагностика и восстановление' : 'Diagnostics and recovery'
    },
    { 
      id: 'expert', 
      title: language === 'ru' ? 'Экспертный уровень' : 'Expert Level',
      icon: <Target size={16} />,
      description: language === 'ru' ? 'Комплексные рабочие процессы' : 'Comprehensive workflows'
    }
  ];

  // Filter sections based on search and category
  const filteredSections = guideSections.filter(section => {
    const matchesCategory = section.category === activeCategory;
    const matchesSearch = !searchQuery || 
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Tutorial mode functions
  const startTutorial = (sectionId: string) => {
    setSelectedSection(sectionId);
    setTutorialMode(true);
    setCurrentTutorialStep(0);
  };

  const nextTutorialStep = () => {
    const section = guideSections.find(s => s.id === selectedSection);
    if (section && currentTutorialStep < section.steps.length - 1) {
      setCurrentTutorialStep(currentTutorialStep + 1);
    }
  };

  const previousTutorialStep = () => {
    if (currentTutorialStep > 0) {
      setCurrentTutorialStep(currentTutorialStep - 1);
    }
  };

  const completeTutorial = () => {
    setTutorialMode(false);
    setSelectedSection(null);
    setCurrentTutorialStep(0);
  };

  // Toggle section expansion
  const toggleSectionExpansion = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Highlight specific steps
  const highlightStep = (target: string) => {
    setHighlightTarget(target);
    setTimeout(() => setHighlightTarget(null), 3000);
  };

  // Show step-by-step guide overlay
  const showStepGuideFor = (sectionId: string) => {
    setSelectedSection(sectionId);
    setShowStepGuide(true);
    addToRecentlyViewed(sectionId);
  };

  // Bookmark management
  const toggleBookmark = (sectionId: string) => {
    const newBookmarks = new Set(bookmarkedSections);
    if (newBookmarks.has(sectionId)) {
      newBookmarks.delete(sectionId);
    } else {
      newBookmarks.add(sectionId);
    }
    setBookmarkedSections(newBookmarks);
  };

  // Recently viewed management
  const addToRecentlyViewed = (sectionId: string) => {
    const newRecent = [sectionId, ...recentlyViewed.filter(id => id !== sectionId)].slice(0, 5);
    setRecentlyViewed(newRecent);
  };

  const getDifficultyColor = (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStepProgress = (sectionId: string) => {
    const section = guideSections.find(s => s.id === sectionId);
    if (!section) return 0;
    
    const completedSteps = progress.filter(p => 
      p.sectionId === sectionId && p.completed
    ).length;
    
    return (completedSteps / section.steps.length) * 100;
  };

  // Module-specific guidance
  const getModuleSpecificTips = () => {
    switch (currentModule) {
      case 'overview':
        return language === 'ru' 
          ? 'Совет: Используйте обзор для быстрой оценки прогресса всего проекта'
          : 'Tip: Use overview for quick assessment of overall project progress';
      case 'kipling':
        return language === 'ru' 
          ? 'Совет: Заполняйте измерения по порядку для лучшей структуры анализа'
          : 'Tip: Fill dimensions in order for better analysis structure';
      case 'ikr':
        return language === 'ru' 
          ? 'Совет: IKR строится на данных из протокола Киплинга'
          : 'Tip: IKR builds upon data from Kipling protocol';
      case 'audit':
        return language === 'ru' 
          ? 'Совет: Настройте API ключи перед запуском аудита'
          : 'Tip: Configure API keys before running audits';
      case 'chat':
        return language === 'ru' 
          ? 'Совет: Используйте кнопки быстрых действий для контекстной помощи'
          : 'Tip: Use quick action buttons for contextual help';
      default:
        return language === 'ru' 
          ? 'Совет: Изучите руководство для освоения всех возможностей'
          : 'Tip: Explore the guide to master all features';
    }
  };

  if (tutorialMode && selectedSection) {
    const section = guideSections.find(s => s.id === selectedSection);
    if (!section) return null;

    const currentStep = section.steps[currentTutorialStep];
    const isLastStep = currentTutorialStep === section.steps.length - 1;
    const isFirstStep = currentTutorialStep === 0;

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {section.icon}
                  {section.title}
                </CardTitle>
                <CardDescription>
                  {language === 'ru' ? 'Интерактивное обучение' : 'Interactive Tutorial'}
                </CardDescription>
              </div>
              <Badge variant="outline">
                {language === 'ru' ? 'Шаг' : 'Step'} {currentTutorialStep + 1} {language === 'ru' ? 'из' : 'of'} {section.steps.length}
              </Badge>
            </div>
            <Progress value={(currentTutorialStep / section.steps.length) * 100} className="mt-4" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">{currentStep.title}</h3>
              <p className="text-muted-foreground">{currentStep.description}</p>
              
              {currentStep.action && (
                <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 text-primary">
                    <Info size={16} />
                    <span className="text-sm font-medium">
                      {language === 'ru' ? 'Действие:' : 'Action:'} {currentStep.action}
                    </span>
                  </div>
                  {currentStep.target && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === 'ru' ? 'Цель:' : 'Target:'} {currentStep.target}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={previousTutorialStep}
                disabled={isFirstStep}
                className="flex items-center gap-2"
              >
                <ChevronLeft size={16} />
                {language === 'ru' ? 'Назад' : 'Previous'}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={completeTutorial}
                >
                  {language === 'ru' ? 'Выйти' : 'Exit'}
                </Button>
                
                {isLastStep ? (
                  <Button
                    onClick={completeTutorial}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    {language === 'ru' ? 'Завершить' : 'Complete'}
                  </Button>
                ) : (
                  <Button
                    onClick={nextTutorialStep}
                    className="flex items-center gap-2"
                  >
                    {language === 'ru' ? 'Далее' : 'Next'}
                    <ChevronRight size={16} />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Book size={32} className="text-primary" />
          <h1 className="text-3xl font-bold">
            {language === 'ru' ? 'Руководство пользователя AXON' : 'AXON User Guide'}
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {language === 'ru' 
            ? 'Полное руководство по использованию платформы интеллектуального анализа AXON. Изучите все возможности и освойте профессиональные методы анализа.'
            : 'Complete guide to using the AXON intelligence analysis platform. Learn all features and master professional analysis methods.'
          }
        </p>

        {/* Module-specific tip */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 text-primary">
            <Lightbulb size={16} />
            <span className="font-medium">
              {language === 'ru' ? 'Совет для текущего модуля:' : 'Current Module Tip:'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {getModuleSpecificTips()}
          </p>
        </div>

        {/* Quick Access Panel */}
        {(bookmarkedSections.size > 0 || recentlyViewed.length > 0) && (
          <Card className="bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20">
            <CardContent className="py-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Bookmarked Sections */}
                {bookmarkedSections.size > 0 && (
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Bookmark size={14} className="text-accent" />
                      <span className="text-sm font-medium text-accent">
                        {language === 'ru' ? 'Закладки' : 'Bookmarks'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(bookmarkedSections).slice(0, 3).map(sectionId => {
                        const section = guideSections.find(s => s.id === sectionId);
                        return section ? (
                          <Button
                            key={sectionId}
                            size="sm"
                            variant="outline"
                            onClick={() => showStepGuideFor(sectionId)}
                            className="text-xs h-7 px-2 flex items-center gap-1"
                          >
                            {section.icon}
                            <span>{section.title.length > 20 ? `${section.title.substring(0, 20)}...` : section.title}</span>
                          </Button>
                        ) : null;
                      })}
                      {bookmarkedSections.size > 3 && (
                        <Button size="sm" variant="ghost" className="text-xs h-7 px-2">
                          +{bookmarkedSections.size - 3}
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Recently Viewed */}
                {recentlyViewed.length > 0 && (
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock size={14} className="text-primary" />
                      <span className="text-sm font-medium text-primary">
                        {language === 'ru' ? 'Недавно просмотренные' : 'Recently Viewed'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentlyViewed.slice(0, 3).map(sectionId => {
                        const section = guideSections.find(s => s.id === sectionId);
                        return section ? (
                          <Button
                            key={sectionId}
                            size="sm"
                            variant="secondary"
                            onClick={() => showStepGuideFor(sectionId)}
                            className="text-xs h-7 px-2 flex items-center gap-1"
                          >
                            {section.icon}
                            <span>{section.title.length > 20 ? `${section.title.substring(0, 20)}...` : section.title}</span>
                          </Button>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        {/* Category Navigation */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <ScrollArea className="w-full lg:max-w-4xl">
            <TabsList className="grid grid-cols-3 lg:grid-cols-9 gap-1 h-auto p-1">
              {categories.map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id} 
                  className="flex flex-col items-center gap-1 h-auto p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {category.icon}
                  <span className="text-xs text-center leading-tight">{category.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>

          {/* Search */}
          <div className="relative w-full lg:w-64 flex-shrink-0">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={language === 'ru' ? 'Поиск руководств...' : 'Search guides...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Description */}
        <div className="bg-muted/30 border border-muted rounded-lg p-4">
          <div className="flex items-center gap-3">
            {categories.find(c => c.id === activeCategory)?.icon}
            <div>
              <h3 className="font-semibold">{categories.find(c => c.id === activeCategory)?.title}</h3>
              <p className="text-sm text-muted-foreground">
                {categories.find(c => c.id === activeCategory)?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Category Content */}
        {categories.map(category => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSections.map(section => (
                <Card key={section.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-l-4 border-l-transparent hover:border-l-primary">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {section.icon}
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-base leading-snug">{section.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getDifficultyColor(section.difficulty)}`} />
                            <span className="text-xs text-muted-foreground capitalize font-medium">
                              {language === 'ru' ? 
                                (section.difficulty === 'beginner' ? 'начальный' : 
                                 section.difficulty === 'intermediate' ? 'средний' : 'продвинутый') : 
                                section.difficulty}
                            </span>
                            <Circle size={3} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-medium">
                              {section.estimatedTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs bg-muted/50">
                        {section.steps.length} {language === 'ru' ? 'шагов' : 'steps'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(section.id);
                        }}
                        className={`p-1 h-6 w-6 ${bookmarkedSections.has(section.id) ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`}
                      >
                        <Bookmark size={12} className={bookmarkedSections.has(section.id) ? 'fill-current' : ''} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {section.description}
                    </p>
                    
                    {section.prerequisites && section.prerequisites.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Info size={12} className="text-amber-500" />
                          <p className="text-xs font-medium text-muted-foreground">
                            {language === 'ru' ? 'Требования:' : 'Prerequisites:'}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {section.prerequisites.map(prereq => (
                            <Badge key={prereq} variant="secondary" className="text-xs">
                              {guideSections.find(s => s.id === prereq)?.title || prereq}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium">
                          {language === 'ru' ? 'Прогресс изучения' : 'Learning Progress'}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {Math.round(getStepProgress(section.id))}%
                        </span>
                      </div>
                      <Progress value={getStepProgress(section.id)} className="h-2" />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => startTutorial(section.id)}
                        className="flex-1 flex items-center gap-2 h-9"
                      >
                        <Play size={14} />
                        {language === 'ru' ? 'Интерактивно' : 'Interactive'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => showStepGuideFor(section.id)}
                        className="flex items-center gap-2 h-9"
                      >
                        <Eye size={14} />
                        {language === 'ru' ? 'Шаги' : 'Steps'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleSectionExpansion(section.id)}
                        className="p-2 h-9 w-9"
                      >
                        {expandedSections.has(section.id) ? 
                          <CaretUp size={14} /> : 
                          <CaretDown size={14} />
                        }
                      </Button>
                    </div>

                    {/* Expanded Section Preview */}
                    {expandedSections.has(section.id) && (
                      <div className="mt-4 p-3 bg-muted/20 rounded-lg border border-muted space-y-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <List size={12} />
                          <span className="font-medium">
                            {language === 'ru' ? 'Предварительный просмотр шагов:' : 'Step Preview:'}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {section.steps.slice(0, 3).map((step, idx) => (
                            <div 
                              key={step.id} 
                              className={`flex items-start gap-2 p-2 rounded text-xs transition-all cursor-pointer hover:bg-primary/10 ${
                                highlightTarget === step.target ? 'bg-primary/20 border border-primary/40' : ''
                              }`}
                              onClick={() => highlightStep(step.target || '')}
                            >
                              <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                                <span className="text-xs font-bold text-primary">{idx + 1}</span>
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-foreground">{step.title}</div>
                                <div className="text-muted-foreground leading-tight">
                                  {step.description.length > 80 
                                    ? `${step.description.substring(0, 80)}...` 
                                    : step.description
                                  }
                                </div>
                                {step.action && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Badge variant="outline" className="text-xs h-4 px-1">
                                      {step.action}
                                    </Badge>
                                    {step.target && (
                                      <Badge variant="secondary" className="text-xs h-4 px-1">
                                        {step.target}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          {section.steps.length > 3 && (
                            <div className="text-center py-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedSection(section.id)}
                                className="text-xs h-6"
                              >
                                {language === 'ru' 
                                  ? `+${section.steps.length - 3} шагов ещё` 
                                  : `+${section.steps.length - 3} more steps`
                                }
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredSections.length === 0 && (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
                  <Search size={24} className="text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">
                    {language === 'ru' ? 'Руководства не найдены' : 'No guides found'}
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {language === 'ru' 
                      ? 'Попробуйте изменить поисковый запрос или выберите другую категорию. Используйте ключевые слова из названий модулей.'
                      : 'Try adjusting your search query or select a different category. Use keywords from module names.'
                    }
                  </p>
                </div>
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  {language === 'ru' ? 'Очистить поиск' : 'Clear Search'}
                </Button>
              </div>
            )}

            {/* Quick Stats for Category */}
            {filteredSections.length > 0 && (
              <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                <CardContent className="py-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center space-y-2">
                      <div className="relative">
                        <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
                          <BookBookmark size={20} className="text-primary" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">
                          {filteredSections.length}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {language === 'ru' ? 'Руководств' : 'Guides'}
                      </div>
                    </div>
                    
                    <div className="text-center space-y-2">
                      <div className="relative">
                        <div className="w-12 h-12 mx-auto bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center border-2 border-accent/20">
                          <CheckSquare size={20} className="text-accent" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center text-xs font-bold text-accent-foreground">
                          {filteredSections.reduce((acc, section) => acc + section.steps.length, 0)}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {language === 'ru' ? 'Шагов' : 'Steps'}
                      </div>
                    </div>
                    
                    <div className="text-center space-y-2">
                      <div className="relative">
                        <div className="w-12 h-12 mx-auto bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-full flex items-center justify-center border-2 border-green-500/20">
                          <Star size={20} className="text-green-600" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          {filteredSections.filter(s => s.difficulty === 'beginner').length}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {language === 'ru' ? 'Для новичков' : 'Beginner'}
                      </div>
                    </div>
                    
                    <div className="text-center space-y-2">
                      <div className="relative">
                        <div className="w-12 h-12 mx-auto bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-full flex items-center justify-center border-2 border-secondary/20">
                          <Clock size={20} className="text-secondary" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-xs font-bold text-secondary-foreground">
                          ~{Math.round(filteredSections.reduce((acc, section) => {
                            const time = parseInt(section.estimatedTime.split(' ')[0]) || 0;
                            return acc + time;
                          }, 0) / filteredSections.length)}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {language === 'ru' ? 'Мин. в среднем' : 'Avg Minutes'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Learning Path Indicator */}
                  <Separator className="my-4" />
                  <div className="flex items-center justify-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Path size={16} className="text-primary" />
                      <span className="font-medium">
                        {language === 'ru' ? 'Рекомендуемый путь обучения:' : 'Recommended Learning Path:'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {categories.find(c => c.id === activeCategory)?.id === 'getting-started' && (
                        <>
                          <Badge variant="default" className="text-xs">1. Основы</Badge>
                          <ArrowRight size={12} className="text-muted-foreground" />
                          <Badge variant="secondary" className="text-xs">2. Анализ</Badge>
                          <ArrowRight size={12} className="text-muted-foreground" />
                          <Badge variant="outline" className="text-xs">3. ИИ</Badge>
                        </>
                      )}
                      {categories.find(c => c.id === activeCategory)?.id === 'analysis-framework' && (
                        <>
                          <Badge variant="default" className="text-xs">Киплинг</Badge>
                          <ArrowRight size={12} className="text-muted-foreground" />
                          <Badge variant="secondary" className="text-xs">IKR</Badge>
                        </>
                      )}
                      {categories.find(c => c.id === activeCategory)?.id === 'ai-features' && (
                        <>
                          <Badge variant="default" className="text-xs">Аудит</Badge>
                          <ArrowRight size={12} className="text-muted-foreground" />
                          <Badge variant="secondary" className="text-xs">Чат</Badge>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Step-by-Step Guide Overlay */}
      {showStepGuide && selectedSection && (
        <Card className="fixed top-4 right-4 w-80 z-50 shadow-2xl border-primary/20 bg-background/95 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookBookmark size={16} className="text-primary" />
                <CardTitle className="text-sm">
                  {language === 'ru' ? 'Пошаговое руководство' : 'Step-by-Step Guide'}
                </CardTitle>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowStepGuide(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs text-muted-foreground font-medium">
              {guideSections.find(s => s.id === selectedSection)?.title}
            </div>
            
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {guideSections.find(s => s.id === selectedSection)?.steps.map((step, index) => (
                  <div 
                    key={step.id}
                    className={`p-2 rounded-lg border transition-all cursor-pointer hover:bg-primary/5 ${
                      highlightTarget === step.target 
                        ? 'bg-primary/10 border-primary/40 shadow-sm' 
                        : 'border-muted hover:border-primary/20'
                    }`}
                    onClick={() => highlightStep(step.target || '')}
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center mt-0.5">
                        <span className="text-xs font-bold text-primary">{index + 1}</span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="font-medium text-xs">{step.title}</div>
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          {step.description}
                        </div>
                        {step.action && (
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs h-4 px-1">
                              <NavigationArrow size={8} className="mr-1" />
                              {step.action}
                            </Badge>
                            {step.target && (
                              <Badge variant="secondary" className="text-xs h-4 px-1">
                                <MapPin size={8} className="mr-1" />
                                {step.target}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="pt-2 border-t">
              <Button
                size="sm"
                onClick={() => {
                  setShowStepGuide(false);
                  startTutorial(selectedSection);
                }}
                className="w-full flex items-center gap-2 h-8"
              >
                <Play size={12} />
                {language === 'ru' ? 'Начать интерактивное обучение' : 'Start Interactive Tutorial'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Detail View (Non-Tutorial) */}
      {selectedSection && !tutorialMode && (
        <Card className="mt-6 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-3 text-xl">
                  {guideSections.find(s => s.id === selectedSection)?.icon}
                  {guideSections.find(s => s.id === selectedSection)?.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {guideSections.find(s => s.id === selectedSection)?.description}
                </CardDescription>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">
                    {guideSections.find(s => s.id === selectedSection)?.difficulty === 'beginner' 
                      ? (language === 'ru' ? 'Начальный' : 'Beginner')
                      : guideSections.find(s => s.id === selectedSection)?.difficulty === 'intermediate'
                      ? (language === 'ru' ? 'Средний' : 'Intermediate')
                      : (language === 'ru' ? 'Продвинутый' : 'Advanced')
                    }
                  </Badge>
                  <Badge variant="outline">
                    {guideSections.find(s => s.id === selectedSection)?.estimatedTime}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" onClick={() => setSelectedSection(null)}>
                {language === 'ru' ? 'Закрыть' : 'Close'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ScrollArea className="h-96">
              <div className="space-y-6">
                {guideSections.find(s => s.id === selectedSection)?.steps.map((step, index) => (
                  <div key={step.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <h4 className="font-semibold text-base">{step.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                      {step.action && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs font-medium">
                            {language === 'ru' ? 'Действие:' : 'Action:'} {step.action}
                          </Badge>
                          {step.target && (
                            <Badge variant="secondary" className="text-xs">
                              {step.target}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator className="my-6" />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {language === 'ru' ? 'Готовы начать обучение?' : 'Ready to start learning?'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ru' 
                    ? 'Интерактивное обучение поможет освоить все шаги'
                    : 'Interactive tutorial will guide you through all steps'
                  }
                </p>
              </div>
              <Button
                onClick={() => startTutorial(selectedSection)}
                className="flex items-center gap-2"
              >
                <Play size={16} />
                {language === 'ru' ? 'Начать интерактивное обучение' : 'Start Interactive Tutorial'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NavigationGuide;