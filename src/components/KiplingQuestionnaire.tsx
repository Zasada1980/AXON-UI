import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import {
  Users,
  FileText,
  Calendar,
  MapPin,
  Lightbulb,
  Gear,
  Target,
  Brain,
  Shield,
  CheckCircle,
  Warning,
  Info,
  ArrowRight,
  Star
} from '@phosphor-icons/react';

interface KiplingQuestion {
  id: string;
  dimension: 'who' | 'what' | 'when' | 'where' | 'why' | 'how';
  category: 'essential' | 'detailed' | 'strategic';
  priority: 'critical' | 'high' | 'medium' | 'low';
  question: {
    ru: string;
    en: string;
  };
  subQuestions?: {
    ru: string[];
    en: string[];
  };
  inputType: 'text' | 'textarea' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'date' | 'number';
  options?: {
    ru: string[];
    en: string[];
  };
  placeholder?: {
    ru: string;
    en: string;
  };
  validation?: {
    required: boolean;
    minLength?: number;
    maxLength?: number;
  };
  ikrMapping: {
    intelligence: boolean;
    knowledge: boolean;
    reasoning: boolean;
  };
}

interface KiplingQuestionnaireProps {
  language: 'ru' | 'en';
  onQuestionnaireComplete: (responses: Record<string, any>) => void;
  onProgressUpdate: (progress: number) => void;
}

const KiplingQuestionnaire: React.FC<KiplingQuestionnaireProps> = ({
  language,
  onQuestionnaireComplete,
  onProgressUpdate
}) => {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Comprehensive Kipling Protocol Questions for Intelligence Analysis
  const questions: KiplingQuestion[] = [
    // WHO Dimension - Critical Stakeholder Analysis
    {
      id: 'who-primary-actors',
      dimension: 'who',
      category: 'essential',
      priority: 'critical',
      question: {
        ru: 'Кто являются ключевыми участниками, принимающими решения в данной ситуации?',
        en: 'Who are the key decision-makers and participants in this situation?'
      },
      subQuestions: {
        ru: [
          'Назовите конкретные имена и должности',
          'Укажите их уровень влияния (1-10)',
          'Опишите их мотивации и интересы'
        ],
        en: [
          'Provide specific names and positions',
          'Indicate their level of influence (1-10)',
          'Describe their motivations and interests'
        ]
      },
      inputType: 'textarea',
      placeholder: {
        ru: 'Пример: Иван Петров (CEO), уровень влияния 9/10, мотивация - увеличение прибыли...',
        en: 'Example: John Smith (CEO), influence level 9/10, motivation - profit increase...'
      },
      validation: { required: true, minLength: 50 },
      ikrMapping: { intelligence: true, knowledge: true, reasoning: false }
    },
    {
      id: 'who-stakeholders',
      dimension: 'who',
      category: 'detailed',
      priority: 'high',
      question: {
        ru: 'Кто ещё заинтересован в результатах данного анализа?',
        en: 'Who else has a stake in the outcome of this analysis?'
      },
      inputType: 'multiselect',
      options: {
        ru: [
          'Внутренние сотрудники',
          'Внешние партнёры',
          'Конкуренты',
          'Регулирующие органы',
          'Общественность',
          'Инвесторы',
          'Клиенты',
          'Поставщики'
        ],
        en: [
          'Internal employees',
          'External partners',
          'Competitors',
          'Regulatory bodies',
          'Public',
          'Investors',
          'Customers',
          'Suppliers'
        ]
      },
      validation: { required: true },
      ikrMapping: { intelligence: true, knowledge: false, reasoning: true }
    },
    {
      id: 'who-opposition',
      dimension: 'who',
      category: 'strategic',
      priority: 'high',
      question: {
        ru: 'Кто может противодействовать или препятствовать достижению целей?',
        en: 'Who might oppose or hinder the achievement of objectives?'
      },
      inputType: 'textarea',
      placeholder: {
        ru: 'Опишите потенциальных противников, их ресурсы и методы противодействия',
        en: 'Describe potential opponents, their resources and methods of opposition'
      },
      validation: { required: false, minLength: 30 },
      ikrMapping: { intelligence: true, knowledge: true, reasoning: true }
    },

    // WHAT Dimension - Core Issue Analysis
    {
      id: 'what-primary-issue',
      dimension: 'what',
      category: 'essential',
      priority: 'critical',
      question: {
        ru: 'Что именно происходит? Опишите основную проблему или ситуацию максимально конкретно.',
        en: 'What exactly is happening? Describe the main problem or situation as specifically as possible.'
      },
      inputType: 'textarea',
      placeholder: {
        ru: 'Избегайте общих формулировок. Используйте факты, цифры, конкретные события...',
        en: 'Avoid general statements. Use facts, numbers, specific events...'
      },
      validation: { required: true, minLength: 100 },
      ikrMapping: { intelligence: true, knowledge: false, reasoning: false }
    },
    {
      id: 'what-scope',
      dimension: 'what',
      category: 'detailed',
      priority: 'high',
      question: {
        ru: 'Каков масштаб проблемы или ситуации?',
        en: 'What is the scope of the problem or situation?'
      },
      inputType: 'radio',
      options: {
        ru: [
          'Локальная (отдел/команда)',
          'Организационная (вся компания)',
          'Отраслевая (сектор рынка)',
          'Региональная (город/область)',
          'Национальная (страна)',
          'Международная (несколько стран)',
          'Глобальная (весь мир)'
        ],
        en: [
          'Local (department/team)',
          'Organizational (entire company)',
          'Industry (market sector)',
          'Regional (city/state)',
          'National (country)',
          'International (multiple countries)',
          'Global (worldwide)'
        ]
      },
      validation: { required: true },
      ikrMapping: { intelligence: false, knowledge: true, reasoning: true }
    },
    {
      id: 'what-resources-needed',
      dimension: 'what',
      category: 'strategic',
      priority: 'medium',
      question: {
        ru: 'Какие ресурсы необходимы для решения ситуации?',
        en: 'What resources are needed to address the situation?'
      },
      inputType: 'multiselect',
      options: {
        ru: [
          'Финансовые ресурсы',
          'Человеческие ресурсы',
          'Технологические ресурсы',
          'Информационные ресурсы',
          'Временные ресурсы',
          'Материальные ресурсы',
          'Экспертные знания',
          'Правовая поддержка'
        ],
        en: [
          'Financial resources',
          'Human resources',
          'Technology resources',
          'Information resources',
          'Time resources',
          'Material resources',
          'Expert knowledge',
          'Legal support'
        ]
      },
      validation: { required: true },
      ikrMapping: { intelligence: false, knowledge: true, reasoning: true }
    },

    // WHEN Dimension - Temporal Analysis
    {
      id: 'when-timeline',
      dimension: 'when',
      category: 'essential',
      priority: 'high',
      question: {
        ru: 'Когда началась ситуация и каковы ключевые временные рамки?',
        en: 'When did the situation begin and what are the key timeframes?'
      },
      inputType: 'textarea',
      placeholder: {
        ru: 'Укажите: дату начала, важные вехи, дедлайны, периоды активности...',
        en: 'Specify: start date, important milestones, deadlines, activity periods...'
      },
      validation: { required: true, minLength: 50 },
      ikrMapping: { intelligence: true, knowledge: true, reasoning: false }
    },
    {
      id: 'when-urgency',
      dimension: 'when',
      category: 'strategic',
      priority: 'critical',
      question: {
        ru: 'Насколько срочно требуется принятие решений и действий?',
        en: 'How urgently are decisions and actions required?'
      },
      inputType: 'radio',
      options: {
        ru: [
          'Немедленно (в течение часов)',
          'Очень срочно (в течение дней)',
          'Срочно (в течение недель)',
          'Умеренно срочно (в течение месяцев)',
          'Не срочно (более полугода)'
        ],
        en: [
          'Immediately (within hours)',
          'Very urgent (within days)',
          'Urgent (within weeks)',
          'Moderately urgent (within months)',
          'Not urgent (more than 6 months)'
        ]
      },
      validation: { required: true },
      ikrMapping: { intelligence: false, knowledge: false, reasoning: true }
    },
    {
      id: 'when-patterns',
      dimension: 'when',
      category: 'detailed',
      priority: 'medium',
      question: {
        ru: 'Есть ли временные закономерности или цикличность в данной ситуации?',
        en: 'Are there temporal patterns or cyclical nature in this situation?'
      },
      inputType: 'textarea',
      placeholder: {
        ru: 'Опишите повторяющиеся события, сезонность, периодичность...',
        en: 'Describe recurring events, seasonality, periodicity...'
      },
      validation: { required: false, minLength: 30 },
      ikrMapping: { intelligence: true, knowledge: true, reasoning: true }
    },

    // WHERE Dimension - Geographical and Contextual Location
    {
      id: 'where-location',
      dimension: 'where',
      category: 'essential',
      priority: 'high',
      question: {
        ru: 'Где происходит ситуация? Укажите географическое и контекстуальное расположение.',
        en: 'Where is the situation taking place? Specify geographical and contextual location.'
      },
      inputType: 'textarea',
      placeholder: {
        ru: 'Город, страна, офис, департамент, онлайн-платформа, рынок...',
        en: 'City, country, office, department, online platform, market...'
      },
      validation: { required: true, minLength: 30 },
      ikrMapping: { intelligence: true, knowledge: false, reasoning: false }
    },
    {
      id: 'where-environment',
      dimension: 'where',
      category: 'detailed',
      priority: 'medium',
      question: {
        ru: 'Как влияет окружающая среда и контекст на ситуацию?',
        en: 'How does the environment and context influence the situation?'
      },
      inputType: 'multiselect',
      options: {
        ru: [
          'Политическая обстановка',
          'Экономические условия',
          'Социальные факторы',
          'Технологические условия',
          'Правовая среда',
          'Культурные особенности',
          'Природные условия',
          'Конкурентная среда'
        ],
        en: [
          'Political situation',
          'Economic conditions',
          'Social factors',
          'Technological conditions',
          'Legal environment',
          'Cultural specifics',
          'Natural conditions',
          'Competitive environment'
        ]
      },
      validation: { required: true },
      ikrMapping: { intelligence: true, knowledge: true, reasoning: true }
    },

    // WHY Dimension - Causal Analysis
    {
      id: 'why-root-causes',
      dimension: 'why',
      category: 'essential',
      priority: 'critical',
      question: {
        ru: 'Почему возникла данная ситуация? Каковы глубинные причины?',
        en: 'Why did this situation arise? What are the root causes?'
      },
      inputType: 'textarea',
      placeholder: {
        ru: 'Используйте анализ "5 Почему". Идите от симптомов к корневым причинам...',
        en: 'Use "5 Whys" analysis. Go from symptoms to root causes...'
      },
      validation: { required: true, minLength: 100 },
      ikrMapping: { intelligence: true, knowledge: true, reasoning: true }
    },
    {
      id: 'why-motivations',
      dimension: 'why',
      category: 'strategic',
      priority: 'high',
      question: {
        ru: 'Каковы мотивации и интересы ключевых участников?',
        en: 'What are the motivations and interests of key participants?'
      },
      inputType: 'textarea',
      placeholder: {
        ru: 'Опишите что движет каждой стороной: власть, деньги, статус, безопасность...',
        en: 'Describe what drives each party: power, money, status, security...'
      },
      validation: { required: true, minLength: 50 },
      ikrMapping: { intelligence: true, knowledge: true, reasoning: true }
    },

    // HOW Dimension - Operational Analysis
    {
      id: 'how-mechanisms',
      dimension: 'how',
      category: 'essential',
      priority: 'high',
      question: {
        ru: 'Как происходят процессы? Опишите механизмы и методы.',
        en: 'How do the processes occur? Describe mechanisms and methods.'
      },
      inputType: 'textarea',
      placeholder: {
        ru: 'Детально опишите последовательность действий, процедуры, технологии...',
        en: 'Describe in detail the sequence of actions, procedures, technologies...'
      },
      validation: { required: true, minLength: 100 },
      ikrMapping: { intelligence: true, knowledge: true, reasoning: false }
    },
    {
      id: 'how-solutions',
      dimension: 'how',
      category: 'strategic',
      priority: 'critical',
      question: {
        ru: 'Как можно решить ситуацию? Какие есть варианты действий?',
        en: 'How can the situation be resolved? What action options exist?'
      },
      inputType: 'textarea',
      placeholder: {
        ru: 'Предложите несколько альтернативных решений с их плюсами и минусами...',
        en: 'Suggest several alternative solutions with their pros and cons...'
      },
      validation: { required: true, minLength: 100 },
      ikrMapping: { intelligence: false, knowledge: true, reasoning: true }
    },
    {
      id: 'how-risks',
      dimension: 'how',
      category: 'strategic',
      priority: 'high',
      question: {
        ru: 'Как можно минимизировать риски при реализации решений?',
        en: 'How can risks be minimized when implementing solutions?'
      },
      inputType: 'textarea',
      placeholder: {
        ru: 'Опишите потенциальные риски и стратегии их митигации...',
        en: 'Describe potential risks and their mitigation strategies...'
      },
      validation: { required: true, minLength: 50 },
      ikrMapping: { intelligence: false, knowledge: true, reasoning: true }
    }
  ];

  const getDimensionIcon = (dimension: string) => {
    switch (dimension) {
      case 'who': return <Users size={20} className="text-blue-400" />;
      case 'what': return <FileText size={20} className="text-green-400" />;
      case 'when': return <Calendar size={20} className="text-yellow-400" />;
      case 'where': return <MapPin size={20} className="text-purple-400" />;
      case 'why': return <Lightbulb size={20} className="text-orange-400" />;
      case 'how': return <Gear size={20} className="text-red-400" />;
      default: return <Target size={20} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getDimensionProgress = () => {
    const dimensionGroups = questions.reduce((acc, q) => {
      if (!acc[q.dimension]) acc[q.dimension] = { total: 0, answered: 0 };
      acc[q.dimension].total++;
      if (responses[q.id]) acc[q.dimension].answered++;
      return acc;
    }, {} as Record<string, { total: number; answered: number }>);

    return Object.entries(dimensionGroups).map(([dimension, stats]) => ({
      dimension,
      progress: (stats.answered / stats.total) * 100,
      answered: stats.answered,
      total: stats.total
    }));
  };

  const getOverallProgress = () => {
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(responses).length;
    return (answeredQuestions / totalQuestions) * 100;
  };

  const validateResponse = (question: KiplingQuestion, value: any): string | null => {
    if (question.validation?.required && (!value || value.toString().trim() === '')) {
      return language === 'ru' ? 'Это поле обязательно для заполнения' : 'This field is required';
    }

    if (question.validation?.minLength && value && value.toString().length < question.validation.minLength) {
      return language === 'ru' 
        ? `Минимальная длина: ${question.validation.minLength} символов`
        : `Minimum length: ${question.validation.minLength} characters`;
    }

    if (question.validation?.maxLength && value && value.toString().length > question.validation.maxLength) {
      return language === 'ru'
        ? `Максимальная длина: ${question.validation.maxLength} символов`
        : `Maximum length: ${question.validation.maxLength} characters`;
    }

    return null;
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
    
    // Clear validation error for this question
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }

    // Update progress
    const newProgress = getOverallProgress();
    onProgressUpdate(newProgress);
  };

  const validateCurrentStep = (): boolean => {
    const currentQuestion = questions[currentStep];
    const value = responses[currentQuestion.id];
    const error = validateResponse(currentQuestion, value);
    
    if (error) {
      setValidationErrors(prev => ({ ...prev, [currentQuestion.id]: error }));
      return false;
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < questions.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        completeQuestionnaire();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeQuestionnaire = () => {
    // Validate all critical questions
    const criticalQuestions = questions.filter(q => q.priority === 'critical');
    const missingCritical = criticalQuestions.filter(q => !responses[q.id]);
    
    if (missingCritical.length > 0) {
      toast.error(
        language === 'ru' 
          ? `Пожалуйста, ответьте на все критически важные вопросы (${missingCritical.length} осталось)`
          : `Please answer all critical questions (${missingCritical.length} remaining)`
      );
      return;
    }

    // Generate IKR mapping
    const ikrData = {
      intelligence: questions.filter(q => q.ikrMapping.intelligence && responses[q.id]),
      knowledge: questions.filter(q => q.ikrMapping.knowledge && responses[q.id]),
      reasoning: questions.filter(q => q.ikrMapping.reasoning && responses[q.id])
    };

    onQuestionnaireComplete({
      responses,
      ikrMapping: ikrData,
      completionScore: getOverallProgress(),
      dimensionProgress: getDimensionProgress()
    });

    toast.success(
      language === 'ru'
        ? 'Анкета по протоколу Киплинга завершена! Данные готовы для анализа IKR.'
        : 'Kipling Protocol questionnaire completed! Data ready for IKR analysis.'
    );
  };

  const renderQuestionInput = (question: KiplingQuestion) => {
    const value = responses[question.id] || '';
    const error = validationErrors[question.id];

    switch (question.inputType) {
      case 'textarea':
        return (
          <div className="space-y-2">
            <Textarea
              value={value}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              placeholder={question.placeholder?.[language]}
              rows={4}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2">
            <Input
              value={value}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              placeholder={question.placeholder?.[language]}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            <RadioGroup value={value} onValueChange={(val) => handleResponseChange(question.id, val)}>
              {question.options?.[language].map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                  <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            <div className="grid gap-2">
              {question.options?.[language].map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${question.id}-${index}`}
                    checked={(value || []).includes(option)}
                    onCheckedChange={(checked) => {
                      const currentValues = value || [];
                      if (checked) {
                        handleResponseChange(question.id, [...currentValues, option]);
                      } else {
                        handleResponseChange(question.id, currentValues.filter((v: string) => v !== option));
                      }
                    }}
                  />
                  <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
                </div>
              ))}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            <Select value={value} onValueChange={(val) => handleResponseChange(question.id, val)}>
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={question.placeholder?.[language]} />
              </SelectTrigger>
              <SelectContent>
                {question.options?.[language].map((option, index) => (
                  <SelectItem key={index} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  const currentQuestion = questions[currentStep];
  const progress = getOverallProgress();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Brain size={24} className="text-cyan-400" />
            {language === 'ru' ? 'Анкета по Протоколу Киплинга' : 'Kipling Protocol Questionnaire'}
          </CardTitle>
          <CardDescription>
            {language === 'ru' 
              ? 'Структурированный сбор информации для эффективного анализа по методологии IKR'
              : 'Structured information gathering for effective IKR methodology analysis'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {language === 'ru' ? 'Общий прогресс:' : 'Overall progress:'} {Math.round(progress)}%
              </span>
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} / {questions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Dimension Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={20} />
            {language === 'ru' ? 'Прогресс по измерениям' : 'Dimension Progress'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {getDimensionProgress().map((dim) => (
              <div key={dim.dimension} className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  {getDimensionIcon(dim.dimension)}
                  <span className="text-sm font-medium uppercase">{dim.dimension}</span>
                </div>
                <Progress value={dim.progress} className="h-1" />
                <span className="text-xs text-muted-foreground">
                  {dim.answered}/{dim.total}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card className="cyber-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getDimensionIcon(currentQuestion.dimension)}
              <div>
                <CardTitle className="text-lg">
                  {currentQuestion.question[language]}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="uppercase">
                    {currentQuestion.dimension}
                  </Badge>
                  <Badge variant="secondary">
                    {language === 'ru' ? 'Категория:' : 'Category:'} {currentQuestion.category}
                  </Badge>
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(currentQuestion.priority)}`} />
                  <span className="text-xs text-muted-foreground capitalize">
                    {currentQuestion.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sub-questions */}
          {currentQuestion.subQuestions && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Info size={16} />
                {language === 'ru' ? 'Уточняющие вопросы:' : 'Clarifying questions:'}
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {currentQuestion.subQuestions[language].map((sub, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-4 h-4 bg-accent rounded-full flex-shrink-0 mt-1 flex items-center justify-center text-xs text-accent-foreground">
                      {index + 1}
                    </span>
                    {sub}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Question Input */}
          <div>
            <Label className="text-base font-medium">
              {language === 'ru' ? 'Ваш ответ:' : 'Your answer:'}
              {currentQuestion.validation?.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
            <div className="mt-2">
              {renderQuestionInput(currentQuestion)}
            </div>
          </div>

          {/* IKR Mapping Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <h5 className="font-medium text-sm flex items-center gap-2 mb-2">
              <Target size={14} />
              {language === 'ru' ? 'Связь с IKR:' : 'IKR Mapping:'}
            </h5>
            <div className="flex gap-4 text-xs">
              {currentQuestion.ikrMapping.intelligence && (
                <Badge variant="outline" className="text-blue-600">
                  {language === 'ru' ? 'Разведка' : 'Intelligence'}
                </Badge>
              )}
              {currentQuestion.ikrMapping.knowledge && (
                <Badge variant="outline" className="text-green-600">
                  {language === 'ru' ? 'Знания' : 'Knowledge'}
                </Badge>
              )}
              {currentQuestion.ikrMapping.reasoning && (
                <Badge variant="outline" className="text-purple-600">
                  {language === 'ru' ? 'Рассуждения' : 'Reasoning'}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          {language === 'ru' ? 'Назад' : 'Previous'}
        </Button>
        
        <div className="flex items-center gap-2">
          {currentStep === questions.length - 1 ? (
            <Button onClick={completeQuestionnaire} className="flex items-center gap-2">
              <CheckCircle size={16} />
              {language === 'ru' ? 'Завершить анкету' : 'Complete Questionnaire'}
            </Button>
          ) : (
            <Button onClick={nextStep} className="flex items-center gap-2">
              {language === 'ru' ? 'Далее' : 'Next'}
              <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Question List (for reference) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {language === 'ru' ? 'Все вопросы анкеты' : 'All Questionnaire Questions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {questions.map((question, index) => {
              const isAnswered = !!responses[question.id];
              const isCurrent = index === currentStep;
              
              return (
                <div
                  key={question.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    isCurrent ? 'border-primary bg-primary/5' : 
                    isAnswered ? 'border-green-500/30 bg-green-500/5' : 
                    'border-border'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      isAnswered ? 'bg-green-500 text-white' :
                      isCurrent ? 'bg-primary text-primary-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {isAnswered ? <CheckCircle size={12} /> : index + 1}
                    </span>
                    {getDimensionIcon(question.dimension)}
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {question.question[language]}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs uppercase">
                        {question.dimension}
                      </Badge>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(question.priority)}`} />
                    </div>
                  </div>
                  
                  {isAnswered && (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle size={12} className="mr-1" />
                      {language === 'ru' ? 'Отвечено' : 'Answered'}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KiplingQuestionnaire;