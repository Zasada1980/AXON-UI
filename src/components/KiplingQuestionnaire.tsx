import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  FileText, 
  Calendar, 
  MapPin, 
  Lightbulb, 
  Gear,
  CaretLeft,
  CaretRight,
  CheckCircle,
  ArrowRight,
  Target,
  Star
} from '@phosphor-icons/react';

interface Question {
  id: string;
  dimension: 'who' | 'what' | 'when' | 'where' | 'why' | 'how';
  category: string;
  text: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  options?: string[];
  required: boolean;
  placeholder?: string;
  importance: 'high' | 'medium' | 'low';
}

interface KiplingQuestionnaireProps {
  language: 'en' | 'ru';
  onQuestionnaireComplete: (data: any) => void;
  onProgressUpdate: (progress: number) => void;
}

const KiplingQuestionnaire: React.FC<KiplingQuestionnaireProps> = ({
  language,
  onQuestionnaireComplete,
  onProgressUpdate
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  // Comprehensive question bank for systematic analysis
  const questions: Question[] = [
    // WHO dimension - stakeholders and actors
    {
      id: 'who-primary-actors',
      dimension: 'who',
      category: language === 'ru' ? 'Основные участники' : 'Primary Actors',
      text: language === 'ru' 
        ? 'Кто являются ключевыми участниками или основными действующими лицами в данной ситуации?'
        : 'Who are the key participants or main actors in this situation?',
      type: 'textarea',
      required: true,
      placeholder: language === 'ru' 
        ? 'Перечислите основных людей, организации или группы, которые играют активную роль...'
        : 'List the main people, organizations or groups that play an active role...',
      importance: 'high'
    },
    {
      id: 'who-secondary-influences',
      dimension: 'who',
      category: language === 'ru' ? 'Вторичные влияния' : 'Secondary Influences',
      text: language === 'ru'
        ? 'Кто еще может оказывать влияние на ситуацию, но не является прямым участником?'
        : 'Who else might influence the situation but is not a direct participant?',
      type: 'textarea',
      required: false,
      placeholder: language === 'ru'
        ? 'Консультанты, регулирующие органы, общественность, СМИ...'
        : 'Consultants, regulatory bodies, public, media...',
      importance: 'medium'
    },
    {
      id: 'who-opposition-resistance',
      dimension: 'who',
      category: language === 'ru' ? 'Оппозиция и сопротивление' : 'Opposition & Resistance',
      text: language === 'ru'
        ? 'Кто может противостоять или создавать препятствия для достижения целей?'
        : 'Who might oppose or create obstacles to achieving the goals?',
      type: 'textarea',
      required: false,
      placeholder: language === 'ru'
        ? 'Конкуренты, скептики, группы с конфликтующими интересами...'
        : 'Competitors, skeptics, groups with conflicting interests...',
      importance: 'high'
    },
    {
      id: 'who-target-audience',
      dimension: 'who',
      category: language === 'ru' ? 'Целевая аудитория' : 'Target Audience',
      text: language === 'ru'
        ? 'Кто является целевой аудиторией или теми, кто получит пользу от результатов?'
        : 'Who is the target audience or those who will benefit from the outcomes?',
      type: 'textarea',
      required: true,
      placeholder: language === 'ru'
        ? 'Конечные пользователи, клиенты, бенефициары...'
        : 'End users, clients, beneficiaries...',
      importance: 'high'
    },

    // WHAT dimension - core issues and content
    {
      id: 'what-core-issue',
      dimension: 'what',
      category: language === 'ru' ? 'Основная проблема' : 'Core Issue',
      text: language === 'ru'
        ? 'Что представляет собой основная проблема или задача, которую необходимо решить?'
        : 'What is the core problem or challenge that needs to be addressed?',
      type: 'textarea',
      required: true,
      placeholder: language === 'ru'
        ? 'Опишите суть проблемы, её природу и масштаб...'
        : 'Describe the essence of the problem, its nature and scope...',
      importance: 'high'
    },
    {
      id: 'what-current-situation',
      dimension: 'what',
      category: language === 'ru' ? 'Текущая ситуация' : 'Current Situation',
      text: language === 'ru'
        ? 'Что происходит в настоящий момент? Каково текущее состояние дел?'
        : 'What is happening right now? What is the current state of affairs?',
      type: 'textarea',
      required: true,
      placeholder: language === 'ru'
        ? 'Опишите статус-кво, текущие процессы, существующие проблемы...'
        : 'Describe the status quo, current processes, existing problems...',
      importance: 'high'
    },
    {
      id: 'what-desired-outcome',
      dimension: 'what',
      category: language === 'ru' ? 'Желаемый результат' : 'Desired Outcome',
      text: language === 'ru'
        ? 'Что должно быть достигнуто? Каков идеальный конечный результат?'
        : 'What should be achieved? What is the ideal end result?',
      type: 'textarea',
      required: true,
      placeholder: language === 'ru'
        ? 'Опишите целевое состояние, ожидаемые результаты, критерии успеха...'
        : 'Describe the target state, expected results, success criteria...',
      importance: 'high'
    },
    {
      id: 'what-constraints-limitations',
      dimension: 'what',
      category: language === 'ru' ? 'Ограничения' : 'Constraints',
      text: language === 'ru'
        ? 'Что ограничивает возможности решения? Какие существуют препятствия?'
        : 'What limits the solution possibilities? What obstacles exist?',
      type: 'textarea',
      required: false,
      placeholder: language === 'ru'
        ? 'Бюджетные ограничения, технические лимиты, регулятивные требования...'
        : 'Budget constraints, technical limits, regulatory requirements...',
      importance: 'medium'
    },
    {
      id: 'what-available-resources',
      dimension: 'what',
      category: language === 'ru' ? 'Доступные ресурсы' : 'Available Resources',
      text: language === 'ru'
        ? 'Что имеется в распоряжении для решения задачи? Какие ресурсы доступны?'
        : 'What is available to solve the task? What resources are accessible?',
      type: 'textarea',
      required: false,
      placeholder: language === 'ru'
        ? 'Бюджет, персонал, технологии, время, экспертиза...'
        : 'Budget, personnel, technologies, time, expertise...',
      importance: 'medium'
    },

    // WHEN dimension - temporal aspects
    {
      id: 'when-timeline-critical',
      dimension: 'when',
      category: language === 'ru' ? 'Критические сроки' : 'Critical Timeline',
      text: language === 'ru'
        ? 'Когда должны быть достигнуты ключевые результаты? Каковы критические временные рамки?'
        : 'When should key results be achieved? What are the critical timeframes?',
      type: 'textarea',
      required: true,
      placeholder: language === 'ru'
        ? 'Дедлайны, этапы, временные ограничения...'
        : 'Deadlines, milestones, time constraints...',
      importance: 'high'
    },
    {
      id: 'when-historical-context',
      dimension: 'when',
      category: language === 'ru' ? 'Исторический контекст' : 'Historical Context',
      text: language === 'ru'
        ? 'Когда началась эта ситуация? Какова предыстория?'
        : 'When did this situation begin? What is the background history?',
      type: 'textarea',
      required: false,
      placeholder: language === 'ru'
        ? 'Ключевые события, предшествующие обстоятельства, эволюция проблемы...'
        : 'Key events, preceding circumstances, problem evolution...',
      importance: 'medium'
    },
    {
      id: 'when-decision-points',
      dimension: 'when',
      category: language === 'ru' ? 'Точки принятия решений' : 'Decision Points',
      text: language === 'ru'
        ? 'Когда необходимо принимать ключевые решения? Какова последовательность действий?'
        : 'When do key decisions need to be made? What is the sequence of actions?',
      type: 'textarea',
      required: false,
      placeholder: language === 'ru'
        ? 'Этапы планирования, контрольные точки, моменты выбора...'
        : 'Planning stages, checkpoints, choice moments...',
      importance: 'medium'
    },
    {
      id: 'when-monitoring-intervals',
      dimension: 'when',
      category: language === 'ru' ? 'Интервалы мониторинга' : 'Monitoring Intervals',
      text: language === 'ru'
        ? 'Когда и как часто следует оценивать прогресс и корректировать планы?'
        : 'When and how often should progress be evaluated and plans adjusted?',
      type: 'select',
      options: language === 'ru' 
        ? ['Ежедневно', 'Еженедельно', 'Ежемесячно', 'Ежеквартально', 'По этапам', 'По потребности']
        : ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'By milestones', 'As needed'],
      required: false,
      importance: 'low'
    },

    // WHERE dimension - location and context
    {
      id: 'where-geographic-scope',
      dimension: 'where',
      category: language === 'ru' ? 'Географический охват' : 'Geographic Scope',
      text: language === 'ru'
        ? 'Где происходят ключевые события? Каков географический масштаб?'
        : 'Where do key events take place? What is the geographic scale?',
      type: 'textarea',
      required: false,
      placeholder: language === 'ru'
        ? 'Локально, региональный, национальный, международный...'
        : 'Local, regional, national, international...',
      importance: 'medium'
    },
    {
      id: 'where-organizational-context',
      dimension: 'where',
      category: language === 'ru' ? 'Организационный контекст' : 'Organizational Context',
      text: language === 'ru'
        ? 'Где в организационной структуре происходят изменения? В каких подразделениях?'
        : 'Where in the organizational structure do changes occur? In which departments?',
      type: 'textarea',
      required: false,
      placeholder: language === 'ru'
        ? 'Отделы, команды, уровни иерархии, внешние партнеры...'
        : 'Departments, teams, hierarchy levels, external partners...',
      importance: 'medium'
    },
    {
      id: 'where-information-sources',
      dimension: 'where',
      category: language === 'ru' ? 'Источники информации' : 'Information Sources',
      text: language === 'ru'
        ? 'Где можно найти достоверную информацию и данные для анализа?'
        : 'Where can reliable information and data for analysis be found?',
      type: 'textarea',
      required: true,
      placeholder: language === 'ru'
        ? 'Базы данных, отчеты, эксперты, исследования...'
        : 'Databases, reports, experts, research...',
      importance: 'high'
    },
    {
      id: 'where-implementation-locations',
      dimension: 'where',
      category: language === 'ru' ? 'Места реализации' : 'Implementation Locations',
      text: language === 'ru'
        ? 'Где будут внедряться решения? Какие места наиболее подходят?'
        : 'Where will solutions be implemented? Which locations are most suitable?',
      type: 'textarea',
      required: false,
      placeholder: language === 'ru'
        ? 'Пилотные площадки, производственные объекты, офисы...'
        : 'Pilot sites, production facilities, offices...',
      importance: 'medium'
    },

    // WHY dimension - causes and motivations
    {
      id: 'why-root-causes',
      dimension: 'why',
      category: language === 'ru' ? 'Первопричины' : 'Root Causes',
      text: language === 'ru'
        ? 'Почему возникла эта ситуация? Каковы глубинные причины?'
        : 'Why did this situation arise? What are the underlying causes?',
      type: 'textarea',
      required: true,
      placeholder: language === 'ru'
        ? 'Системные проблемы, недостатки процессов, внешние факторы...'
        : 'Systemic issues, process deficiencies, external factors...',
      importance: 'high'
    },
    {
      id: 'why-stakeholder-motivations',
      dimension: 'why',
      category: language === 'ru' ? 'Мотивации сторон' : 'Stakeholder Motivations',
      text: language === 'ru'
        ? 'Почему различные стороны заинтересованы в решении или сопротивляются изменениям?'
        : 'Why are different parties interested in the solution or resistant to changes?',
      type: 'textarea',
      required: false,
      placeholder: language === 'ru'
        ? 'Личные интересы, корпоративные цели, опасения...'
        : 'Personal interests, corporate goals, concerns...',
      importance: 'medium'
    },
    {
      id: 'why-importance-urgency',
      dimension: 'why',
      category: language === 'ru' ? 'Важность и срочность' : 'Importance & Urgency',
      text: language === 'ru'
        ? 'Почему это важно решить именно сейчас? Что делает вопрос актуальным?'
        : 'Why is it important to solve this now? What makes the issue relevant?',
      type: 'textarea',
      required: true,
      placeholder: language === 'ru'
        ? 'Рыночные условия, конкурентное давление, риски...'
        : 'Market conditions, competitive pressure, risks...',
      importance: 'high'
    },
    {
      id: 'why-potential-consequences',
      dimension: 'why',
      category: language === 'ru' ? 'Потенциальные последствия' : 'Potential Consequences',
      text: language === 'ru'
        ? 'Почему бездействие недопустимо? Каковы риски отсутствия решения?'
        : 'Why is inaction unacceptable? What are the risks of not having a solution?',
      type: 'textarea',
      required: false,
      placeholder: language === 'ru'
        ? 'Упущенные возможности, усугубление проблем, конкурентные потери...'
        : 'Missed opportunities, problem escalation, competitive losses...',
      importance: 'medium'
    },

    // HOW dimension - methods and mechanisms
    {
      id: 'how-current-approaches',
      dimension: 'how',
      category: language === 'ru' ? 'Текущие подходы' : 'Current Approaches',
      text: language === 'ru'
        ? 'Как в настоящее время решаются подобные задачи? Какие методы используются?'
        : 'How are similar tasks currently being solved? What methods are used?',
      type: 'textarea',
      required: false,
      placeholder: language === 'ru'
        ? 'Существующие процессы, инструменты, методологии...'
        : 'Existing processes, tools, methodologies...',
      importance: 'medium'
    },
    {
      id: 'how-information-gathering',
      dimension: 'how',
      category: language === 'ru' ? 'Сбор информации' : 'Information Gathering',
      text: language === 'ru'
        ? 'Как будет собираться и анализироваться необходимая информация?'
        : 'How will necessary information be collected and analyzed?',
      type: 'textarea',
      required: true,
      placeholder: language === 'ru'
        ? 'Методы исследования, аналитические инструменты, источники данных...'
        : 'Research methods, analytical tools, data sources...',
      importance: 'high'
    },
    {
      id: 'how-success-measurement',
      dimension: 'how',
      category: language === 'ru' ? 'Измерение успеха' : 'Success Measurement',
      text: language === 'ru'
        ? 'Как будет оцениваться успех? Какие метрики и KPI будут использоваться?'
        : 'How will success be measured? What metrics and KPIs will be used?',
      type: 'textarea',
      required: true,
      placeholder: language === 'ru'
        ? 'Количественные показатели, качественные критерии, методы оценки...'
        : 'Quantitative indicators, qualitative criteria, assessment methods...',
      importance: 'high'
    },
    {
      id: 'how-risk-mitigation',
      dimension: 'how',
      category: language === 'ru' ? 'Управление рисками' : 'Risk Mitigation',
      text: language === 'ru'
        ? 'Как будут выявляться и минимизироваться риски? Какие меры предосторожности?'
        : 'How will risks be identified and minimized? What precautionary measures?',
      type: 'textarea',
      required: false,
      placeholder: language === 'ru'
        ? 'План управления рисками, резервные варианты, мониторинг...'
        : 'Risk management plan, backup options, monitoring...',
      importance: 'medium'
    },
    {
      id: 'how-adaptation-learning',
      dimension: 'how',
      category: language === 'ru' ? 'Адаптация и обучение' : 'Adaptation & Learning',
      text: language === 'ru'
        ? 'Как будет происходить адаптация планов на основе полученного опыта?'
        : 'How will plans be adapted based on experience gained?',
      type: 'textarea',
      required: false,
      placeholder: language === 'ru'
        ? 'Циклы обратной связи, корректировки стратегии, накопление знаний...'
        : 'Feedback loops, strategy adjustments, knowledge accumulation...',
      importance: 'medium'
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Update progress callback
  useEffect(() => {
    onProgressUpdate(progress);
  }, [progress, onProgressUpdate]);

  // Get icon for dimension
  const getDimensionIcon = (dimension: string) => {
    switch (dimension) {
      case 'who': return <Users size={16} />;
      case 'what': return <FileText size={16} />;
      case 'when': return <Calendar size={16} />;
      case 'where': return <MapPin size={16} />;
      case 'why': return <Lightbulb size={16} />;
      case 'how': return <Gear size={16} />;
      default: return <FileText size={16} />;
    }
  };

  // Handle response update
  const updateResponse = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Navigate to next question
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Navigate to previous question
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Complete questionnaire
  const completeQuestionnaire = () => {
    // Group responses by dimension for IKR mapping
    const ikrMapping = {
      intelligence: questions.filter(q => 
        ['how-information-gathering', 'where-information-sources', 'what-available-resources'].includes(q.id)
      ),
      knowledge: questions.filter(q => 
        ['what-core-issue', 'why-root-causes', 'when-historical-context'].includes(q.id)
      ),
      reasoning: questions.filter(q => 
        ['what-desired-outcome', 'how-success-measurement', 'how-adaptation-learning'].includes(q.id)
      )
    };

    onQuestionnaireComplete({
      responses,
      completedQuestions: Object.keys(responses).length,
      totalQuestions: questions.length,
      dimensionBreakdown: questions.reduce((acc, q) => {
        if (!acc[q.dimension]) acc[q.dimension] = 0;
        if (responses[q.id]) acc[q.dimension]++;
        return acc;
      }, {} as Record<string, number>),
      ikrMapping,
      timestamp: new Date().toISOString()
    });
  };

  // Check if current question is answered
  const isCurrentQuestionAnswered = responses[currentQuestion.id]?.trim().length > 0;

  // Calculate completion stats
  const completionStats = {
    total: Object.keys(responses).length,
    byDimension: questions.reduce((acc, q) => {
      if (!acc[q.dimension]) acc[q.dimension] = { answered: 0, total: 0 };
      acc[q.dimension].total++;
      if (responses[q.id]) acc[q.dimension].answered++;
      return acc;
    }, {} as Record<string, { answered: number; total: number }>)
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target size={24} className="text-primary" />
                {language === 'ru' ? 'Анкета Киплинга' : 'Kipling Questionnaire'}
              </CardTitle>
              <CardDescription>
                {language === 'ru' 
                  ? 'Систематический анализ по методу 6 вопросов'
                  : 'Systematic analysis using the 6 questions method'
                }
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {currentQuestionIndex + 1} / {questions.length}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{language === 'ru' ? 'Прогресс' : 'Progress'}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Current Question */}
      <Card className="fade-in">
        <CardHeader>
          <div className="flex items-center gap-3">
            {getDimensionIcon(currentQuestion.dimension)}
            <div>
              <Badge variant="outline" className="mb-2">
                {currentQuestion.dimension.toUpperCase()}
              </Badge>
              <CardTitle className="text-lg">{currentQuestion.category}</CardTitle>
              <CardDescription className="mt-2">
                {currentQuestion.text}
              </CardDescription>
            </div>
            {currentQuestion.importance === 'high' && (
              <Star size={16} className="text-accent flex-shrink-0" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Question Input */}
          {currentQuestion.type === 'textarea' ? (
            <div>
              <Label htmlFor="response">
                {language === 'ru' ? 'Ваш ответ' : 'Your Answer'}
                {currentQuestion.required && <span className="text-destructive">*</span>}
              </Label>
              <Textarea
                id="response"
                value={responses[currentQuestion.id] || ''}
                onChange={(e) => updateResponse(currentQuestion.id, e.target.value)}
                placeholder={currentQuestion.placeholder}
                rows={4}
                className="mt-2"
              />
            </div>
          ) : currentQuestion.type === 'select' ? (
            <div>
              <Label htmlFor="response">
                {language === 'ru' ? 'Выберите вариант' : 'Select Option'}
                {currentQuestion.required && <span className="text-destructive">*</span>}
              </Label>
              <Select 
                value={responses[currentQuestion.id] || ''} 
                onValueChange={(value) => updateResponse(currentQuestion.id, value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={language === 'ru' ? 'Выберите...' : 'Select...'} />
                </SelectTrigger>
                <SelectContent>
                  {currentQuestion.options?.map((option, index) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <Label htmlFor="response">
                {language === 'ru' ? 'Ваш ответ' : 'Your Answer'}
                {currentQuestion.required && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="response"
                value={responses[currentQuestion.id] || ''}
                onChange={(e) => updateResponse(currentQuestion.id, e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="mt-2"
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <CaretLeft size={16} className="mr-2" />
              {language === 'ru' ? 'Назад' : 'Previous'}
            </Button>

            <div className="flex items-center gap-2">
              {isCurrentQuestionAnswered && (
                <CheckCircle size={16} className="text-green-500" />
              )}
              <span className="text-sm text-muted-foreground">
                {language === 'ru' ? 'Заполнено' : 'Completed'}: {completionStats.total}/{questions.length}
              </span>
            </div>

            {currentQuestionIndex < questions.length - 1 ? (
              <Button 
                onClick={nextQuestion}
                disabled={currentQuestion.required && !isCurrentQuestionAnswered}
              >
                {language === 'ru' ? 'Далее' : 'Next'}
                <CaretRight size={16} className="ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={completeQuestionnaire}
                disabled={currentQuestion.required && !isCurrentQuestionAnswered}
              >
                {language === 'ru' ? 'Завершить' : 'Complete'}
                <CheckCircle size={16} className="ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dimension Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {language === 'ru' ? 'Прогресс по измерениям' : 'Progress by Dimensions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(completionStats.byDimension).map(([dimension, stats]) => (
              <div key={dimension} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getDimensionIcon(dimension)}
                    <span className="font-medium">{dimension.toUpperCase()}</span>
                  </div>
                  <Badge variant={stats.answered === stats.total ? 'default' : 'secondary'}>
                    {stats.answered}/{stats.total}
                  </Badge>
                </div>
                <Progress 
                  value={(stats.answered / stats.total) * 100} 
                  className="h-1" 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {language === 'ru' ? 'Быстрая навигация' : 'Quick Navigation'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                    index === currentQuestionIndex 
                      ? 'bg-primary/10 border border-primary' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setCurrentQuestionIndex(index)}
                >
                  <div className="flex items-center gap-2">
                    {getDimensionIcon(question.dimension)}
                    <span className="text-sm font-medium">{question.category}</span>
                    {question.importance === 'high' && (
                      <Star size={12} className="text-accent" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {responses[question.id] && (
                      <CheckCircle size={16} className="text-green-500" />
                    )}
                    <Badge variant="outline" className="text-xs">
                      {index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default KiplingQuestionnaire;