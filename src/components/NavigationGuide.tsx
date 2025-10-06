import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Question,
  MagnifyingGlass,
  List,
  Play,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Lightbulb,
  Warning,
  Info,
  Target,
  Users,
  Robot,
  Brain,
  Gear,
  Shield,
  ChartLine,
  Eye
} from '@phosphor-icons/react';

interface HelpStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  example?: string;
  warning?: string;
  tips?: string[];
}

interface HelpSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  steps: HelpStep[];
  category: 'basic' | 'advanced' | 'troubleshooting';
  estimatedTime: number; // minutes
  prerequisites?: string[];
  relatedSections?: string[];
}

interface NavigationGuideProps {
  language: 'en' | 'ru';
  currentModule?: string;
  onSectionSelect?: (sectionId: string) => void;
  onStepComplete?: (stepId: string) => void;
}

const translations = {
  // Navigation
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
  backToHelp: { en: 'Back to Help', ru: 'Назад к Помощи' },
  relatedTopics: { en: 'Related Topics', ru: 'Связанные Темы' },
  helpfulTips: { en: 'Helpful Tips', ru: 'Полезные Советы' },
  commonIssues: { en: 'Common Issues', ru: 'Частые Проблемы' },
  estimatedTime: { en: 'Estimated Time', ru: 'Примерное Время' },
  prerequisites: { en: 'Prerequisites', ru: 'Предварительные Требования' },
  
  // Tutorial Steps
  step: { en: 'Step', ru: 'Шаг' },
  of: { en: 'of', ru: 'из' },
  completed: { en: 'Completed', ru: 'Завершено' },
  inProgress: { en: 'In Progress', ru: 'В Процессе' },
  notStarted: { en: 'Not Started', ru: 'Не Начато' },
  
  // Categories
  gettingStarted: { en: 'Getting Started', ru: 'Начало Работы' },
  projectManagement: { en: 'Project Management', ru: 'Управление Проектами' },
  analysisTools: { en: 'Analysis Tools', ru: 'Инструменты Анализа' },
  aiFeatures: { en: 'AI Features', ru: 'Возможности ИИ' },
  systemSettings: { en: 'System Settings', ru: 'Настройки Системы' },
  
  // Action words
  minutes: { en: 'minutes', ru: 'минут' },
  optional: { en: 'Optional', ru: 'Опционально' },
  required: { en: 'Required', ru: 'Обязательно' },
  recommended: { en: 'Recommended', ru: 'Рекомендуется' }
};

const NavigationGuide: React.FC<NavigationGuideProps> = ({
  language,
  currentModule,
  onSectionSelect,
  onStepComplete
}) => {
  const t = (key: string) => translations[key]?.[language] || key;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [tutorialMode, setTutorialMode] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'basic' | 'advanced' | 'troubleshooting'>('all');

  // Generate comprehensive help sections
  const helpSections: HelpSection[] = [
    {
      id: 'project-creation',
      title: language === 'ru' ? 'Создание проекта' : 'Creating a Project',
      description: language === 'ru' 
        ? 'Узнайте, как создать новый проект анализа и настроить его параметры'
        : 'Learn how to create a new analysis project and configure its settings',
      icon: 'plus',
      category: 'basic',
      estimatedTime: 5,
      steps: [
        {
          id: 'create-project-1',
          title: language === 'ru' ? 'Нажмите кнопку "Новый Анализ"' : 'Click "New Analysis" Button',
          description: language === 'ru' 
            ? 'Найдите и нажмите кнопку "Новый Анализ" в правом верхнем углу экрана'
            : 'Find and click the "New Analysis" button in the top right corner of the screen',
          action: 'click',
          example: language === 'ru' 
            ? 'Кнопка находится рядом с селектором языка'
            : 'The button is located next to the language selector'
        },
        {
          id: 'create-project-2',
          title: language === 'ru' ? 'Заполните информацию о проекте' : 'Fill Project Information',
          description: language === 'ru' 
            ? 'Введите название проекта и его описание в открывшемся диалоге'
            : 'Enter the project title and description in the opened dialog',
          tips: [
            language === 'ru' 
              ? 'Используйте описательные названия для легкого поиска'
              : 'Use descriptive names for easy searching',
            language === 'ru' 
              ? 'Описание поможет вспомнить цель анализа позже'
              : 'Description will help remember the analysis purpose later'
          ]
        },
        {
          id: 'create-project-3',
          title: language === 'ru' ? 'Создайте проект' : 'Create the Project',
          description: language === 'ru' 
            ? 'Нажмите кнопку "Создать Проект" для завершения'
            : 'Click "Create Project" button to complete',
          example: language === 'ru' 
            ? 'Проект: "Анализ безопасности системы"'
            : 'Project: "System Security Analysis"'
        }
      ]
    },
    {
      id: 'kipling-analysis',
      title: language === 'ru' ? 'Анализ по протоколу Киплинга' : 'Kipling Protocol Analysis',
      description: language === 'ru' 
        ? 'Систематический анализ по методу 6 вопросов: Кто, Что, Когда, Где, Почему, Как'
        : 'Systematic analysis using the 6 questions method: Who, What, When, Where, Why, How',
      icon: 'users',
      category: 'basic',
      estimatedTime: 15,
      steps: [
        {
          id: 'kipling-1',
          title: language === 'ru' ? 'Перейдите на вкладку Kipling' : 'Navigate to Kipling Tab',
          description: language === 'ru' 
            ? 'Откройте вкладку "Протокол Киплинга" для начала анализа'
            : 'Open the "Kipling Protocol" tab to start analysis',
          action: 'navigate'
        },
        {
          id: 'kipling-2',
          title: language === 'ru' ? 'Изучите измерения' : 'Study the Dimensions',
          description: language === 'ru' 
            ? 'Ознакомьтесь с каждым из 6 измерений и их вопросами'
            : 'Familiarize yourself with each of the 6 dimensions and their questions',
          tips: [
            language === 'ru' 
              ? 'Кто: участники, заинтересованные стороны'
              : 'Who: participants, stakeholders',
            language === 'ru' 
              ? 'Что: основные события и проблемы'
              : 'What: main events and issues'
          ]
        },
        {
          id: 'kipling-3',
          title: language === 'ru' ? 'Заполните анализ' : 'Fill the Analysis',
          description: language === 'ru' 
            ? 'Добавьте детальную информацию в каждое измерение'
            : 'Add detailed information to each dimension',
          warning: language === 'ru' 
            ? 'Не оставляйте измерения пустыми - это снизит качество анализа'
            : 'Do not leave dimensions empty - this will reduce analysis quality'
        },
        {
          id: 'kipling-4',
          title: language === 'ru' ? 'Генерируйте выводы' : 'Generate Insights',
          description: language === 'ru' 
            ? 'Используйте кнопку "Создать Выводы" для получения рекомендаций ИИ'
            : 'Use "Generate Insights" button to get AI recommendations',
          action: 'click'
        }
      ]
    },
    {
      id: 'ai-audit-setup',
      title: language === 'ru' ? 'Настройка аудита ИИ' : 'AI Audit Setup',
      description: language === 'ru' 
        ? 'Настройка и запуск агентов аудита для анализа проекта'
        : 'Setting up and running audit agents for project analysis',
      icon: 'robot',
      category: 'advanced',
      estimatedTime: 10,
      prerequisites: ['project-creation'],
      steps: [
        {
          id: 'audit-1',
          title: language === 'ru' ? 'Откройте вкладку аудита' : 'Open Audit Tab',
          description: language === 'ru' 
            ? 'Перейдите на вкладку "Аудит ИИ"'
            : 'Navigate to the "AI Audit" tab',
          action: 'navigate'
        },
        {
          id: 'audit-2',
          title: language === 'ru' ? 'Выберите агента' : 'Select an Agent',
          description: language === 'ru' 
            ? 'Выберите подходящий тип агента для вашего анализа'
            : 'Choose the appropriate agent type for your analysis',
          tips: [
            language === 'ru' 
              ? 'Агент Безопасности - для анализа уязвимостей'
              : 'Security Agent - for vulnerability analysis',
            language === 'ru' 
              ? 'Агент Предвзятости - для обнаружения bias'
              : 'Bias Agent - for bias detection'
          ]
        },
        {
          id: 'audit-3',
          title: language === 'ru' ? 'Настройте API' : 'Configure API',
          description: language === 'ru' 
            ? 'Нажмите кнопку "API" и введите ключ облачного провайдера'
            : 'Click "API" button and enter cloud provider key',
          warning: language === 'ru' 
            ? 'Без API ключа агент не сможет работать'
            : 'Agent cannot work without API key'
        },
        {
          id: 'audit-4',
          title: language === 'ru' ? 'Запустите аудит' : 'Start Audit',
          description: language === 'ru' 
            ? 'Выберите тип аудита и нажмите кнопку запуска'
            : 'Choose audit type and click start button',
          action: 'click'
        }
      ]
    },
    {
      id: 'file-management',
      title: language === 'ru' ? 'Управление файлами' : 'File Management',
      description: language === 'ru' 
        ? 'Загрузка и анализ файлов проекта с помощью ИИ агентов'
        : 'Upload and analyze project files using AI agents',
      icon: 'upload',
      category: 'advanced',
      estimatedTime: 8,
      steps: [
        {
          id: 'files-1',
          title: language === 'ru' ? 'Загрузите файлы' : 'Upload Files',
          description: language === 'ru' 
            ? 'Перетащите файлы в область загрузки или выберите их'
            : 'Drag files to upload area or select them',
          tips: [
            language === 'ru' 
              ? 'Поддерживаются форматы: TXT, MD, JSON, CSV, PDF'
              : 'Supported formats: TXT, MD, JSON, CSV, PDF'
          ]
        },
        {
          id: 'files-2',
          title: language === 'ru' ? 'Добавьте метаданные' : 'Add Metadata',
          description: language === 'ru' 
            ? 'Добавьте описание и теги для лучшей организации'
            : 'Add description and tags for better organization'
        },
        {
          id: 'files-3',
          title: language === 'ru' ? 'Запустите анализ' : 'Run Analysis',
          description: language === 'ru' 
            ? 'Выберите тип анализа и получите результаты от ИИ'
            : 'Choose analysis type and get results from AI'
        }
      ]
    },
    {
      id: 'chat-assistant',
      title: language === 'ru' ? 'ИИ Помощник' : 'AI Assistant',
      description: language === 'ru' 
        ? 'Использование чат-бота для получения помощи по проекту'
        : 'Using chatbot for project assistance',
      icon: 'chat',
      category: 'basic',
      estimatedTime: 5,
      steps: [
        {
          id: 'chat-1',
          title: language === 'ru' ? 'Откройте чат' : 'Open Chat',
          description: language === 'ru' 
            ? 'Перейдите на вкладку "ИИ Чат"'
            : 'Navigate to "AI Chat" tab'
        },
        {
          id: 'chat-2',
          title: language === 'ru' ? 'Задайте вопрос' : 'Ask a Question',
          description: language === 'ru' 
            ? 'Введите вопрос о вашем проекте или анализе'
            : 'Enter a question about your project or analysis',
          example: language === 'ru' 
            ? '"Анализируй мой прогресс" или "Помоги с измерениями Киплинга"'
            : '"Analyze my progress" or "Help with Kipling dimensions"'
        },
        {
          id: 'chat-3',
          title: language === 'ru' ? 'Используйте контекстные кнопки' : 'Use Context Buttons',
          description: language === 'ru' 
            ? 'Используйте готовые кнопки для быстрых запросов'
            : 'Use ready-made buttons for quick requests'
        }
      ]
    },
    {
      id: 'troubleshooting-common',
      title: language === 'ru' ? 'Решение частых проблем' : 'Common Issues Solutions',
      description: language === 'ru' 
        ? 'Решения наиболее частых проблем при работе с платформой'
        : 'Solutions for most common platform issues',
      icon: 'warning',
      category: 'troubleshooting',
      estimatedTime: 3,
      steps: [
        {
          id: 'trouble-1',
          title: language === 'ru' ? 'Аудит не запускается' : 'Audit Not Starting',
          description: language === 'ru' 
            ? 'Проверьте настройку API ключа и подключение к интернету'
            : 'Check API key setup and internet connection',
          tips: [
            language === 'ru' 
              ? 'Убедитесь, что API ключ введен правильно'
              : 'Make sure API key is entered correctly',
            language === 'ru' 
              ? 'Проверьте подключение к интернету'
              : 'Check internet connection'
          ]
        },
        {
          id: 'trouble-2',
          title: language === 'ru' ? 'Медленная работа' : 'Slow Performance',
          description: language === 'ru' 
            ? 'Уменьшите глубину анализа или выберите более быструю модель'
            : 'Reduce analysis depth or choose faster model'
        },
        {
          id: 'trouble-3',
          title: language === 'ru' ? 'Не сохраняется прогресс' : 'Progress Not Saving',
          description: language === 'ru' 
            ? 'Проверьте, включен ли localStorage в браузере'
            : 'Check if localStorage is enabled in browser'
        }
      ]
    }
  ];

  // Get icon component
  const getIcon = (iconName: string, size = 20) => {
    const iconProps = { size, className: "text-primary" };
    switch (iconName) {
      case 'plus': return <Target {...iconProps} />;
      case 'users': return <Users {...iconProps} />;
      case 'robot': return <Robot {...iconProps} />;
      case 'upload': return <Question {...iconProps} />;
      case 'chat': return <Brain {...iconProps} />;
      case 'warning': return <Warning {...iconProps} />;
      default: return <Info {...iconProps} />;
    }
  };

  // Filter sections
  const filteredSections = helpSections.filter(section => {
    const matchesFilter = filter === 'all' || section.category === filter;
    const matchesSearch = !searchQuery || 
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Get current tutorial section
  const currentSection = selectedSection ? helpSections.find(s => s.id === selectedSection) : null;
  const currentTutorialStep = currentSection?.steps[currentStep];

  // Step completion handlers
  const completeStep = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    onStepComplete?.(stepId);
  };

  const nextStep = () => {
    if (currentSection && currentStep < currentSection.steps.length - 1) {
      if (currentTutorialStep) {
        completeStep(currentTutorialStep.id);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startTutorial = (sectionId: string) => {
    setSelectedSection(sectionId);
    setCurrentStep(0);
    setTutorialMode(true);
    onSectionSelect?.(sectionId);
  };

  const finishTutorial = () => {
    if (currentSection && currentTutorialStep) {
      completeStep(currentTutorialStep.id);
    }
    setTutorialMode(false);
    setSelectedSection(null);
    setCurrentStep(0);
  };

  return (
    <div className="space-y-6">
      {!tutorialMode ? (
        // Main Help Interface
        <>
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Question size={24} className="text-primary" />
                {t('helpSystem')}
              </CardTitle>
              <CardDescription>
                {language === 'ru' 
                  ? 'Найдите инструкции и руководства по использованию платформы'
                  : 'Find instructions and guides for using the platform'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlass size={16} className="absolute left-3 top-3 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="pl-10"
                />
              </div>

              {/* Category Filters */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'basic' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('basic')}
                >
                  {t('basicUsage')}
                </Button>
                <Button
                  variant={filter === 'advanced' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('advanced')}
                >
                  {t('advancedFeatures')}
                </Button>
                <Button
                  variant={filter === 'troubleshooting' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('troubleshooting')}
                >
                  {t('troubleshooting')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Help Sections */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredSections.map(section => {
              const completedStepsCount = section.steps.filter(step => 
                completedSteps.has(step.id)
              ).length;
              const progress = (completedStepsCount / section.steps.length) * 100;

              return (
                <Card key={section.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getIcon(section.icon)}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium">{section.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {section.description}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        section.category === 'basic' ? 'default' :
                        section.category === 'advanced' ? 'secondary' : 'destructive'
                      }>
                        {t(section.category === 'basic' ? 'basicUsage' : 
                           section.category === 'advanced' ? 'advancedFeatures' : 'troubleshooting')}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {/* Progress */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>{completedStepsCount}/{section.steps.length} {t('completed').toLowerCase()}</span>
                          <span>{section.estimatedTime} {t('minutes')}</span>
                        </div>
                        <Progress value={progress} className="h-1" />
                      </div>

                      {/* Prerequisites */}
                      {section.prerequisites && section.prerequisites.length > 0 && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">{t('prerequisites')}: </span>
                          {section.prerequisites.map(prereq => {
                            const prereqSection = helpSections.find(s => s.id === prereq);
                            return prereqSection ? (
                              <Badge key={prereq} variant="outline" className="text-xs mr-1">
                                {prereqSection.title}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => startTutorial(section.id)}
                          className="flex-1"
                        >
                          <Play size={14} className="mr-1" />
                          {progress > 0 ? (language === 'ru' ? 'Продолжить' : 'Continue') : 
                                        (language === 'ru' ? 'Начать' : 'Start')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedSection(section.id);
                            setTutorialMode(false);
                          }}
                        >
                          <Eye size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Links for Current Module */}
          {currentModule && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target size={20} className="text-primary" />
                  {language === 'ru' ? 'Помощь по текущему модулю' : 'Current Module Help'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {language === 'ru' 
                    ? `Активный модуль: ${currentModule}. Здесь будут контекстные подсказки.`
                    : `Active module: ${currentModule}. Contextual hints will appear here.`}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        // Tutorial Mode
        currentSection && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getIcon(currentSection.icon)}
                    {currentSection.title}
                  </CardTitle>
                  <CardDescription>
                    {t('step')} {currentStep + 1} {t('of')} {currentSection.steps.length}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={finishTutorial}>
                  ×
                </Button>
              </div>
              <Progress value={((currentStep + 1) / currentSection.steps.length) * 100} />
            </CardHeader>
            <CardContent className="space-y-6">
              {currentTutorialStep && (
                <>
                  {/* Current Step */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{currentTutorialStep.title}</h3>
                    <p className="text-muted-foreground">{currentTutorialStep.description}</p>

                    {/* Example */}
                    {currentTutorialStep.example && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb size={16} className="text-primary" />
                          <span className="text-sm font-medium">
                            {language === 'ru' ? 'Пример' : 'Example'}
                          </span>
                        </div>
                        <p className="text-sm">{currentTutorialStep.example}</p>
                      </div>
                    )}

                    {/* Warning */}
                    {currentTutorialStep.warning && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Warning size={16} className="text-destructive" />
                          <span className="text-sm font-medium text-destructive">
                            {language === 'ru' ? 'Внимание' : 'Warning'}
                          </span>
                        </div>
                        <p className="text-sm text-destructive">{currentTutorialStep.warning}</p>
                      </div>
                    )}

                    {/* Tips */}
                    {currentTutorialStep.tips && currentTutorialStep.tips.length > 0 && (
                      <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Info size={16} className="text-primary" />
                          <span className="text-sm font-medium text-primary">
                            {t('helpfulTips')}
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {currentTutorialStep.tips.map((tip, index) => (
                            <li key={index} className="text-sm flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={previousStep}
                      disabled={currentStep === 0}
                    >
                      <ArrowLeft size={16} className="mr-2" />
                      {t('previousStep')}
                    </Button>

                    <Badge variant="secondary">
                      {currentStep + 1} / {currentSection.steps.length}
                    </Badge>

                    {currentStep < currentSection.steps.length - 1 ? (
                      <Button onClick={nextStep}>
                        {t('nextStep')}
                        <ArrowRight size={16} className="ml-2" />
                      </Button>
                    ) : (
                      <Button onClick={finishTutorial}>
                        <CheckCircle size={16} className="mr-2" />
                        {t('finishTutorial')}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
};

export default NavigationGuide;