import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  FileText, 
  Calendar, 
  MapPin, 
  Lightbulb, 
  Gear,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Brain,
  Target,
  Star,
  Question
} from '@phosphor-icons/react';

type Language = 'en' | 'ru';

interface KiplingQuestion {
  id: string;
  category: 'who' | 'what' | 'when' | 'where' | 'why' | 'how';
  subcategory: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  questionText: {
    en: string;
    ru: string;
  };
  helpText?: {
    en: string;
    ru: string;
  };
  inputType: 'text' | 'textarea' | 'select' | 'multiselect';
  options?: {
    en: string[];
    ru: string[];
  };
  validationRules?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
  };
  ikrMapping: 'intelligence' | 'knowledge' | 'reasoning';
}

interface QuestionnaireProps {
  language: Language;
  onQuestionnaireComplete: (data: {
    responses: Record<string, string>;
    completeness: number;
    ikrMapping: Record<string, KiplingQuestion[]>;
    metadata: {
      startTime: string;
      endTime: string;
      totalQuestions: number;
      answeredQuestions: number;
    };
  }) => void;
  onProgressUpdate?: (progress: number) => void;
}

const KiplingQuestionnaire: React.FC<QuestionnaireProps> = ({
  language,
  onQuestionnaireComplete,
  onProgressUpdate
}) => {
  // Questionnaire state
  const [responses, setResponses] = useKV<Record<string, string>>('kipling-questionnaire-responses', {});
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime] = useState(new Date().toISOString());
  const [showSummary, setShowSummary] = useState(false);

  // Comprehensive Kipling Questions based on IKR directive
  const kiplingQuestions: KiplingQuestion[] = [
    // WHO Questions - Intelligence Gathering
    {
      id: 'who-primary-actors',
      category: 'who',
      subcategory: 'primary-actors',
      priority: 'critical',
      questionText: {
        en: 'Who are the primary actors, stakeholders, or decision-makers directly involved in this situation?',
        ru: 'Кто являются основными участниками, заинтересованными сторонами или лицами, принимающими решения, непосредственно вовлеченными в эту ситуацию?'
      },
      helpText: {
        en: 'List individuals, organizations, or groups with direct influence or involvement. Include their roles and level of authority.',
        ru: 'Перечислите лиц, организации или группы с прямым влиянием или участием. Укажите их роли и уровень полномочий.'
      },
      inputType: 'textarea',
      validationRules: { required: true, minLength: 50 },
      ikrMapping: 'intelligence'
    },
    {
      id: 'who-secondary-influences',
      category: 'who',
      subcategory: 'secondary-influences',
      priority: 'high',
      questionText: {
        en: 'Who are the secondary influences, advisors, or entities that may affect outcomes indirectly?',
        ru: 'Кто являются вторичными влияниями, советниками или субъектами, которые могут косвенно повлиять на результаты?'
      },
      helpText: {
        en: 'Consider background influencers, consultants, interest groups, media, or other indirect actors.',
        ru: 'Рассмотрите фоновых влиятелей, консультантов, группы интересов, СМИ или других косвенных участников.'
      },
      inputType: 'textarea',
      validationRules: { minLength: 30 },
      ikrMapping: 'intelligence'
    },
    {
      id: 'who-opposition-resistance',
      category: 'who',
      subcategory: 'opposition',
      priority: 'high',
      questionText: {
        en: 'Who might oppose, resist, or create obstacles to the desired outcomes?',
        ru: 'Кто может противостоять, сопротивляться или создавать препятствия для достижения желаемых результатов?'
      },
      helpText: {
        en: 'Identify potential adversaries, competing interests, or sources of resistance.',
        ru: 'Определите потенциальных противников, конкурирующие интересы или источники сопротивления.'
      },
      inputType: 'textarea',
      validationRules: { minLength: 30 },
      ikrMapping: 'knowledge'
    },
    {
      id: 'who-target-audience',
      category: 'who',
      subcategory: 'target-audience',
      priority: 'medium',
      questionText: {
        en: 'Who is the target audience or beneficiary that will be affected by the analysis results?',
        ru: 'Кто является целевой аудиторией или бенефициаром, который будет затронут результатами анализа?'
      },
      inputType: 'textarea',
      validationRules: { minLength: 20 },
      ikrMapping: 'reasoning'
    },

    // WHAT Questions - Core Issues and Content
    {
      id: 'what-core-issue',
      category: 'what',
      subcategory: 'core-issue',
      priority: 'critical',
      questionText: {
        en: 'What is the core issue, problem, or opportunity that requires analysis?',
        ru: 'В чем заключается основная проблема, вопрос или возможность, требующая анализа?'
      },
      helpText: {
        en: 'Define the central challenge or opportunity in clear, specific terms. Avoid vague generalizations.',
        ru: 'Определите центральный вызов или возможность в ясных, конкретных терминах. Избегайте расплывчатых обобщений.'
      },
      inputType: 'textarea',
      validationRules: { required: true, minLength: 50 },
      ikrMapping: 'intelligence'
    },
    {
      id: 'what-current-situation',
      category: 'what',
      subcategory: 'current-situation',
      priority: 'critical',
      questionText: {
        en: 'What is currently happening? Describe the present state and ongoing developments.',
        ru: 'Что происходит в настоящее время? Опишите текущее состояние и происходящие события.'
      },
      helpText: {
        en: 'Provide factual, observable information about the current state without interpretation.',
        ru: 'Предоставьте фактическую, наблюдаемую информацию о текущем состоянии без интерпретации.'
      },
      inputType: 'textarea',
      validationRules: { required: true, minLength: 50 },
      ikrMapping: 'intelligence'
    },
    {
      id: 'what-desired-outcome',
      category: 'what',
      subcategory: 'desired-outcome',
      priority: 'high',
      questionText: {
        en: 'What is the desired end state or successful outcome you want to achieve?',
        ru: 'Каково желаемое конечное состояние или успешный результат, которого вы хотите достичь?'
      },
      inputType: 'textarea',
      validationRules: { required: true, minLength: 30 },
      ikrMapping: 'reasoning'
    },
    {
      id: 'what-constraints-limitations',
      category: 'what',
      subcategory: 'constraints',
      priority: 'high',
      questionText: {
        en: 'What are the key constraints, limitations, or boundaries that must be considered?',
        ru: 'Каковы ключевые ограничения, лимиты или границы, которые необходимо учитывать?'
      },
      helpText: {
        en: 'Include resource limitations, legal/regulatory constraints, technical boundaries, or policy restrictions.',
        ru: 'Включите ограничения ресурсов, правовые/регулятивные ограничения, технические границы или политические ограничения.'
      },
      inputType: 'textarea',
      validationRules: { minLength: 30 },
      ikrMapping: 'knowledge'
    },
    {
      id: 'what-available-resources',
      category: 'what',
      subcategory: 'resources',
      priority: 'medium',
      questionText: {
        en: 'What resources, tools, or assets are available to address this situation?',
        ru: 'Какие ресурсы, инструменты или активы доступны для решения этой ситуации?'
      },
      inputType: 'textarea',
      validationRules: { minLength: 20 },
      ikrMapping: 'knowledge'
    },

    // WHEN Questions - Temporal Analysis
    {
      id: 'when-timeline-critical',
      category: 'when',
      subcategory: 'timeline',
      priority: 'critical',
      questionText: {
        en: 'When did this situation begin, and what are the critical timing factors or deadlines?',
        ru: 'Когда началась эта ситуация, и каковы критические временные факторы или сроки?'
      },
      helpText: {
        en: 'Provide specific dates, timeframes, and any time-sensitive elements that affect decision-making.',
        ru: 'Укажите конкретные даты, временные рамки и любые временно-чувствительные элементы, влияющие на принятие решений.'
      },
      inputType: 'textarea',
      validationRules: { required: true, minLength: 30 },
      ikrMapping: 'intelligence'
    },
    {
      id: 'when-historical-context',
      category: 'when',
      subcategory: 'historical-context',
      priority: 'high',
      questionText: {
        en: 'When have similar situations occurred before, and what historical patterns are relevant?',
        ru: 'Когда подобные ситуации возникали ранее, и какие исторические паттерны релевантны?'
      },
      inputType: 'textarea',
      validationRules: { minLength: 30 },
      ikrMapping: 'knowledge'
    },
    {
      id: 'when-decision-points',
      category: 'when',
      subcategory: 'decision-points',
      priority: 'high',
      questionText: {
        en: 'When must key decisions be made, and what is the optimal timing for interventions?',
        ru: 'Когда должны быть приняты ключевые решения, и каково оптимальное время для вмешательств?'
      },
      inputType: 'textarea',
      validationRules: { minLength: 20 },
      ikrMapping: 'reasoning'
    },
    {
      id: 'when-monitoring-intervals',
      category: 'when',
      subcategory: 'monitoring',
      priority: 'medium',
      questionText: {
        en: 'When should progress be evaluated, and what monitoring intervals are appropriate?',
        ru: 'Когда следует оценивать прогресс, и какие интервалы мониторинга подходят?'
      },
      inputType: 'textarea',
      validationRules: { minLength: 20 },
      ikrMapping: 'reasoning'
    },

    // WHERE Questions - Geographic and Contextual Location
    {
      id: 'where-geographic-scope',
      category: 'where',
      subcategory: 'geographic-scope',
      priority: 'high',
      questionText: {
        en: 'Where is this situation taking place geographically, and what is the scope of impact?',
        ru: 'Где географически происходит эта ситуация, и каков масштаб воздействия?'
      },
      helpText: {
        en: 'Specify countries, regions, cities, or other geographic boundaries. Include virtual/digital spaces if relevant.',
        ru: 'Укажите страны, регионы, города или другие географические границы. Включите виртуальные/цифровые пространства, если релевантно.'
      },
      inputType: 'textarea',
      validationRules: { required: true, minLength: 30 },
      ikrMapping: 'intelligence'
    },
    {
      id: 'where-organizational-context',
      category: 'where',
      subcategory: 'organizational',
      priority: 'high',
      questionText: {
        en: 'Where within organizational structures, hierarchies, or systems is this situated?',
        ru: 'Где в рамках организационных структур, иерархий или систем это расположено?'
      },
      inputType: 'textarea',
      validationRules: { minLength: 30 },
      ikrMapping: 'knowledge'
    },
    {
      id: 'where-information-sources',
      category: 'where',
      subcategory: 'information-sources',
      priority: 'medium',
      questionText: {
        en: 'Where can reliable information and data be found to support this analysis?',
        ru: 'Где можно найти надежную информацию и данные для поддержки этого анализа?'
      },
      inputType: 'textarea',
      validationRules: { minLength: 20 },
      ikrMapping: 'intelligence'
    },
    {
      id: 'where-implementation-locations',
      category: 'where',
      subcategory: 'implementation',
      priority: 'medium',
      questionText: {
        en: 'Where will solutions be implemented, and what locations require special consideration?',
        ru: 'Где будут реализованы решения, и какие места требуют особого рассмотрения?'
      },
      inputType: 'textarea',
      validationRules: { minLength: 20 },
      ikrMapping: 'reasoning'
    },

    // WHY Questions - Causation and Motivation
    {
      id: 'why-root-causes',
      category: 'why',
      subcategory: 'root-causes',
      priority: 'critical',
      questionText: {
        en: 'Why is this situation occurring? What are the underlying root causes and driving factors?',
        ru: 'Почему происходит эта ситуация? Каковы основные первопричины и движущие факторы?'
      },
      helpText: {
        en: 'Look beyond surface symptoms to identify deeper systemic, structural, or fundamental causes.',
        ru: 'Смотрите за пределы поверхностных симптомов, чтобы выявить более глубокие системные, структурные или фундаментальные причины.'
      },
      inputType: 'textarea',
      validationRules: { required: true, minLength: 50 },
      ikrMapping: 'knowledge'
    },
    {
      id: 'why-stakeholder-motivations',
      category: 'why',
      subcategory: 'motivations',
      priority: 'high',
      questionText: {
        en: 'Why are different stakeholders involved? What motivates their actions and positions?',
        ru: 'Почему вовлечены различные заинтересованные стороны? Что мотивирует их действия и позиции?'
      },
      inputType: 'textarea',
      validationRules: { minLength: 30 },
      ikrMapping: 'knowledge'
    },
    {
      id: 'why-importance-urgency',
      category: 'why',
      subcategory: 'importance',
      priority: 'high',
      questionText: {
        en: 'Why is this analysis important now? What makes it urgent or significant?',
        ru: 'Почему этот анализ важен сейчас? Что делает его срочным или значимым?'
      },
      inputType: 'textarea',
      validationRules: { required: true, minLength: 30 },
      ikrMapping: 'reasoning'
    },
    {
      id: 'why-potential-consequences',
      category: 'why',
      subcategory: 'consequences',
      priority: 'medium',
      questionText: {
        en: 'Why should we be concerned about potential consequences of action or inaction?',
        ru: 'Почему нас должны беспокоить потенциальные последствия действий или бездействия?'
      },
      inputType: 'textarea',
      validationRules: { minLength: 30 },
      ikrMapping: 'reasoning'
    },

    // HOW Questions - Methods and Mechanisms
    {
      id: 'how-current-approaches',
      category: 'how',
      subcategory: 'current-approaches',
      priority: 'high',
      questionText: {
        en: 'How are current efforts or approaches addressing this situation? What methods are being used?',
        ru: 'Как текущие усилия или подходы решают эту ситуацию? Какие методы используются?'
      },
      helpText: {
        en: 'Describe existing processes, methodologies, tools, or strategies currently in use.',
        ru: 'Опишите существующие процессы, методологии, инструменты или стратегии, используемые в настоящее время.'
      },
      inputType: 'textarea',
      validationRules: { required: true, minLength: 30 },
      ikrMapping: 'intelligence'
    },
    {
      id: 'how-information-gathering',
      category: 'how',
      subcategory: 'information-gathering',
      priority: 'high',
      questionText: {
        en: 'How will additional information be gathered and validated for this analysis?',
        ru: 'Как будет собираться и проверяться дополнительная информация для этого анализа?'
      },
      inputType: 'textarea',
      validationRules: { minLength: 30 },
      ikrMapping: 'intelligence'
    },
    {
      id: 'how-success-measurement',
      category: 'how',
      subcategory: 'success-measurement',
      priority: 'high',
      questionText: {
        en: 'How will success be measured and evaluated? What are the key performance indicators?',
        ru: 'Как будет измеряться и оцениваться успех? Каковы ключевые показатели эффективности?'
      },
      inputType: 'textarea',
      validationRules: { minLength: 30 },
      ikrMapping: 'reasoning'
    },
    {
      id: 'how-risk-mitigation',
      category: 'how',
      subcategory: 'risk-mitigation',
      priority: 'medium',
      questionText: {
        en: 'How will risks be identified, assessed, and mitigated throughout the process?',
        ru: 'Как будут выявляться, оцениваться и смягчаться риски на протяжении всего процесса?'
      },
      inputType: 'textarea',
      validationRules: { minLength: 30 },
      ikrMapping: 'reasoning'
    },
    {
      id: 'how-adaptation-learning',
      category: 'how',
      subcategory: 'adaptation',
      priority: 'medium',
      questionText: {
        en: 'How will the approach be adapted based on new information and lessons learned?',
        ru: 'Как будет адаптироваться подход на основе новой информации и извлеченных уроков?'
      },
      inputType: 'textarea',
      validationRules: { minLength: 20 },
      ikrMapping: 'knowledge'
    }
  ];

  // Group questions by category for navigation
  const questionsByCategory = kiplingQuestions.reduce((acc, question) => {
    if (!acc[question.category]) acc[question.category] = [];
    acc[question.category].push(question);
    return acc;
  }, {} as Record<string, KiplingQuestion[]>);

  // Calculate progress
  const totalQuestions = kiplingQuestions.length;
  const answeredQuestions = Object.keys(responses || {}).length;
  const progress = Math.round((answeredQuestions / totalQuestions) * 100);

  // Update progress when responses change
  useEffect(() => {
    if (onProgressUpdate) {
      onProgressUpdate(progress);
    }
  }, [progress, onProgressUpdate]);

  // Get current question
  const currentQuestion = kiplingQuestions[currentStep];

  // Handle response update
  const updateResponse = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Navigation functions
  const goToNext = () => {
    if (currentStep < kiplingQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowSummary(true);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Skip question
  const skipQuestion = () => {
    goToNext();
  };

  // Complete questionnaire
  const completeQuestionnaire = () => {
    const ikrMapping = kiplingQuestions.reduce((acc, question) => {
      if (!acc[question.ikrMapping]) acc[question.ikrMapping] = [];
      acc[question.ikrMapping].push(question);
      return acc;
    }, {} as Record<string, KiplingQuestion[]>);

    onQuestionnaireComplete({
      responses: responses || {},
      completeness: progress,
      ikrMapping,
      metadata: {
        startTime,
        endTime: new Date().toISOString(),
        totalQuestions,
        answeredQuestions
      }
    });
  };

  // Category icons
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'who': return <Users size={20} />;
      case 'what': return <FileText size={20} />;
      case 'when': return <Calendar size={20} />;
      case 'where': return <MapPin size={20} />;
      case 'why': return <Lightbulb size={20} />;
      case 'how': return <Gear size={20} />;
      default: return <Question size={20} />;
    }
  };

  // Priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (showSummary) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle size={24} className="text-green-500" />
            {language === 'ru' ? 'Анкета завершена' : 'Questionnaire Complete'}
          </CardTitle>
          <CardDescription>
            {language === 'ru' 
              ? 'Просмотрите ваши ответы перед применением к проекту'
              : 'Review your responses before applying to project'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{answeredQuestions}</div>
                <div className="text-sm text-muted-foreground">
                  {language === 'ru' ? 'Отвеченных вопросов' : 'Questions Answered'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent">{progress}%</div>
                <div className="text-sm text-muted-foreground">
                  {language === 'ru' ? 'Завершенность' : 'Completion'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-secondary">
                  {Object.keys(questionsByCategory).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  {language === 'ru' ? 'Категорий Киплинга' : 'Kipling Categories'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Summary */}
          <div className="space-y-4">
            <h4 className="font-medium">
              {language === 'ru' ? 'Сводка по категориям:' : 'Category Summary:'}
            </h4>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(questionsByCategory).map(([category, questions]) => {
                const answeredInCategory = questions.filter(q => responses?.[q.id]).length;
                const categoryProgress = Math.round((answeredInCategory / questions.length) * 100);
                
                return (
                  <Card key={category} className="p-3">
                    <div className="flex items-center gap-3 mb-2">
                      {getCategoryIcon(category)}
                      <span className="font-medium capitalize">{category}</span>
                      <Badge variant="outline" className="ml-auto">
                        {answeredInCategory}/{questions.length}
                      </Badge>
                    </div>
                    <Progress value={categoryProgress} className="h-2" />
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button variant="outline" onClick={() => setShowSummary(false)}>
              <ArrowLeft size={16} className="mr-2" />
              {language === 'ru' ? 'Назад к вопросам' : 'Back to Questions'}
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={completeQuestionnaire}>
                {language === 'ru' ? 'Сохранить ответы' : 'Save Responses'}
              </Button>
              <Button onClick={completeQuestionnaire}>
                <Target size={16} className="mr-2" />
                {language === 'ru' ? 'Применить к проекту' : 'Apply to Project'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) return null;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getCategoryIcon(currentQuestion.category)}
            <div>
              <CardTitle className="text-xl">
                {language === 'ru' ? 'Протокол Киплинга' : 'Kipling Protocol'}
              </CardTitle>
              <CardDescription>
                {language === 'ru' 
                  ? `Вопрос ${currentStep + 1} из ${totalQuestions} • Категория: ${currentQuestion.category.toUpperCase()}`
                  : `Question ${currentStep + 1} of ${totalQuestions} • Category: ${currentQuestion.category.toUpperCase()}`
                }
              </CardDescription>
            </div>
          </div>
          <Badge className={getPriorityColor(currentQuestion.priority)}>
            {currentQuestion.priority}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>{language === 'ru' ? 'Прогресс:' : 'Progress:'}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Question */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              {currentQuestion.questionText[language]}
            </h3>
            {currentQuestion.helpText && (
              <p className="text-sm text-muted-foreground">
                {currentQuestion.helpText[language]}
              </p>
            )}
          </div>

          {/* Input Field */}
          <div className="space-y-2">
            {currentQuestion.inputType === 'textarea' ? (
              <Textarea
                value={responses?.[currentQuestion.id] || ''}
                onChange={(e) => updateResponse(currentQuestion.id, e.target.value)}
                placeholder={language === 'ru' ? 'Введите ваш подробный ответ...' : 'Enter your detailed response...'}
                rows={6}
                className="resize-none"
              />
            ) : currentQuestion.inputType === 'select' && currentQuestion.options ? (
              <Select
                value={responses?.[currentQuestion.id] || ''}
                onValueChange={(value) => updateResponse(currentQuestion.id, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ru' ? 'Выберите опцию...' : 'Select an option...'} />
                </SelectTrigger>
                <SelectContent>
                  {currentQuestion.options[language].map((option, index) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={responses?.[currentQuestion.id] || ''}
                onChange={(e) => updateResponse(currentQuestion.id, e.target.value)}
                placeholder={language === 'ru' ? 'Введите ваш ответ...' : 'Enter your response...'}
              />
            )}

            {/* Validation Feedback */}
            {currentQuestion.validationRules?.required && 
             (!responses?.[currentQuestion.id] || responses[currentQuestion.id].length === 0) && (
              <p className="text-sm text-destructive">
                {language === 'ru' ? 'Этот вопрос обязателен для ответа' : 'This question is required'}
              </p>
            )}
            
            {currentQuestion.validationRules?.minLength && 
             responses?.[currentQuestion.id] &&
             responses[currentQuestion.id].length < currentQuestion.validationRules.minLength && (
              <p className="text-sm text-muted-foreground">
                {language === 'ru' 
                  ? `Минимум ${currentQuestion.validationRules.minLength} символов (текущий: ${responses[currentQuestion.id].length})`
                  : `Minimum ${currentQuestion.validationRules.minLength} characters (current: ${responses[currentQuestion.id].length})`
                }
              </p>
            )}
          </div>
        </div>

        {/* IKR Mapping Info */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={16} />
              <span className="text-sm font-medium">
                {language === 'ru' ? 'Соответствие IKR:' : 'IKR Mapping:'}
              </span>
              <Badge variant="outline" className="text-xs">
                {currentQuestion.ikrMapping === 'intelligence' && (language === 'ru' ? 'Разведка' : 'Intelligence')}
                {currentQuestion.ikrMapping === 'knowledge' && (language === 'ru' ? 'Знания' : 'Knowledge')}
                {currentQuestion.ikrMapping === 'reasoning' && (language === 'ru' ? 'Рассуждения' : 'Reasoning')}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {currentQuestion.ikrMapping === 'intelligence' && (language === 'ru' 
                ? 'Этот вопрос поможет собрать исходные разведданные и информацию.'
                : 'This question helps gather raw intelligence and information.'
              )}
              {currentQuestion.ikrMapping === 'knowledge' && (language === 'ru'
                ? 'Этот вопрос поможет синтезировать знания из собранной информации.'
                : 'This question helps synthesize knowledge from gathered information.'
              )}
              {currentQuestion.ikrMapping === 'reasoning' && (language === 'ru'
                ? 'Этот вопрос поможет применить логические рассуждения для выводов.'
                : 'This question helps apply logical reasoning for conclusions.'
              )}
            </p>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={goToPrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft size={16} className="mr-2" />
            {language === 'ru' ? 'Назад' : 'Previous'}
          </Button>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={skipQuestion}>
              {language === 'ru' ? 'Пропустить' : 'Skip'}
            </Button>
            
            <Button onClick={goToNext}>
              {currentStep === kiplingQuestions.length - 1 ? (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  {language === 'ru' ? 'Завершить' : 'Complete'}
                </>
              ) : (
                <>
                  {language === 'ru' ? 'Далее' : 'Next'}
                  <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Navigation */}
        <Separator />
        <div className="space-y-3">
          <h4 className="text-sm font-medium">
            {language === 'ru' ? 'Быстрая навигация по категориям:' : 'Quick category navigation:'}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {Object.entries(questionsByCategory).map(([category, questions]) => {
              const answeredInCategory = questions.filter(q => responses?.[q.id]).length;
              const firstQuestionIndex = kiplingQuestions.findIndex(q => q.category === category);
              const isCurrentCategory = currentQuestion.category === category;
              
              return (
                <Button
                  key={category}
                  variant={isCurrentCategory ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentStep(firstQuestionIndex)}
                  className="h-auto p-2 flex flex-col items-center gap-1"
                >
                  {getCategoryIcon(category)}
                  <span className="text-xs font-medium capitalize">{category}</span>
                  <Badge variant="secondary" className="text-xs">
                    {answeredInCategory}/{questions.length}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KiplingQuestionnaire;