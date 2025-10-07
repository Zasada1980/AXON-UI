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
  PlayCircle
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

  // Comprehensive guide sections
  const guideSections: GuideSection[] = [
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
        }
      ]
    }
  ];

  const categories = [
    { 
      id: 'getting-started', 
      title: language === 'ru' ? 'Начало работы' : 'Getting Started',
      icon: <PlayCircle size={16} />
    },
    { 
      id: 'analysis-framework', 
      title: language === 'ru' ? 'Фреймворк анализа' : 'Analysis Framework',
      icon: <Brain size={16} />
    },
    { 
      id: 'ai-features', 
      title: language === 'ru' ? 'Возможности ИИ' : 'AI Features',
      icon: <Robot size={16} />
    },
    { 
      id: 'troubleshooting', 
      title: language === 'ru' ? 'Решение проблем' : 'Troubleshooting',
      icon: <HelpCircle size={16} />
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
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        {/* Category Navigation */}
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                {category.icon}
                <span className="hidden sm:inline">{category.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Search */}
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={language === 'ru' ? 'Поиск руководств...' : 'Search guides...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Content */}
        {categories.map(category => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSections.map(section => (
                <Card key={section.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {section.icon}
                        <div>
                          <CardTitle className="text-base">{section.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${getDifficultyColor(section.difficulty)}`} />
                            <span className="text-xs text-muted-foreground capitalize">
                              {section.difficulty}
                            </span>
                            <Circle size={3} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {section.estimatedTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {section.steps.length} {language === 'ru' ? 'шагов' : 'steps'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>
                    
                    {section.prerequisites && section.prerequisites.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          {language === 'ru' ? 'Требования:' : 'Prerequisites:'}
                        </p>
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
                        <span className="text-xs text-muted-foreground">
                          {language === 'ru' ? 'Прогресс' : 'Progress'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(getStepProgress(section.id))}%
                        </span>
                      </div>
                      <Progress value={getStepProgress(section.id)} className="h-1" />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => startTutorial(section.id)}
                        className="flex-1 flex items-center gap-2"
                      >
                        <Play size={14} />
                        {language === 'ru' ? 'Начать' : 'Start'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedSection(section.id)}
                        className="flex items-center gap-2"
                      >
                        <FileText size={14} />
                        {language === 'ru' ? 'Просмотр' : 'View'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredSections.length === 0 && (
              <div className="text-center py-12">
                <Search size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {language === 'ru' ? 'Руководства не найдены' : 'No guides found'}
                </h3>
                <p className="text-muted-foreground">
                  {language === 'ru' 
                    ? 'Попробуйте изменить поисковый запрос или выберите другую категорию'
                    : 'Try adjusting your search query or select a different category'
                  }
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Section Detail View (Non-Tutorial) */}
      {selectedSection && !tutorialMode && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {guideSections.find(s => s.id === selectedSection)?.icon}
                  {guideSections.find(s => s.id === selectedSection)?.title}
                </CardTitle>
                <CardDescription>
                  {guideSections.find(s => s.id === selectedSection)?.description}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => setSelectedSection(null)}>
                {language === 'ru' ? 'Закрыть' : 'Close'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {guideSections.find(s => s.id === selectedSection)?.steps.map((step, index) => (
                  <div key={step.id} className="flex gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {step.action && (
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="outline" className="text-xs">
                            {step.action}
                          </Badge>
                          {step.target && (
                            <span className="text-muted-foreground">{step.target}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="mt-4 pt-4 border-t">
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