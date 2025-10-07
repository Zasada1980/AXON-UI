import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Users,
  FileText,
  Calendar,
  MapPin,
  Lightbulb,
  Gear,
  Target,
  Brain,
  Star,
  Info,
  Play
} from '@phosphor-icons/react';

interface KiplingQuestionPreviewProps {
  language: 'ru' | 'en';
  onStartQuestionnaire: () => void;
}

const KiplingQuestionPreview: React.FC<KiplingQuestionPreviewProps> = ({
  language,
  onStartQuestionnaire
}) => {
  const dimensionInfo = {
    who: {
      icon: <Users size={24} className="text-blue-400" />,
      title: language === 'ru' ? 'КТО (WHO)' : 'WHO',
      description: language === 'ru' 
        ? 'Анализ участников, заинтересованных сторон и лиц, принимающих решения'
        : 'Analysis of participants, stakeholders and decision-makers',
      questions: language === 'ru' ? [
        'Кто являются ключевые участники ситуации?',
        'Кто заинтересован в результатах анализа?',
        'Кто может противодействовать целям?'
      ] : [
        'Who are the key participants in the situation?',
        'Who is interested in the analysis results?',
        'Who might oppose the objectives?'
      ],
      ikrMapping: language === 'ru' ? 'Разведка + Знания + Рассуждения' : 'Intelligence + Knowledge + Reasoning',
      priority: 'critical'
    },
    what: {
      icon: <FileText size={24} className="text-green-400" />,
      title: language === 'ru' ? 'ЧТО (WHAT)' : 'WHAT',
      description: language === 'ru'
        ? 'Определение сути проблемы, масштаба и необходимых ресурсов'
        : 'Defining the essence of the problem, scope and required resources',
      questions: language === 'ru' ? [
        'Что именно происходит в ситуации?',
        'Каков масштаб проблемы?',
        'Какие ресурсы необходимы?'
      ] : [
        'What exactly is happening in the situation?',
        'What is the scope of the problem?',
        'What resources are needed?'
      ],
      ikrMapping: language === 'ru' ? 'Разведка + Знания' : 'Intelligence + Knowledge',
      priority: 'critical'
    },
    when: {
      icon: <Calendar size={24} className="text-yellow-400" />,
      title: language === 'ru' ? 'КОГДА (WHEN)' : 'WHEN',
      description: language === 'ru'
        ? 'Временные рамки, сроки и закономерности развития ситуации'
        : 'Timeframes, deadlines and patterns of situation development',
      questions: language === 'ru' ? [
        'Когда началась ситуация?',
        'Насколько срочны решения?',
        'Есть ли временные закономерности?'
      ] : [
        'When did the situation begin?',
        'How urgent are the decisions?',
        'Are there temporal patterns?'
      ],
      ikrMapping: language === 'ru' ? 'Разведка + Рассуждения' : 'Intelligence + Reasoning',
      priority: 'high'
    },
    where: {
      icon: <MapPin size={24} className="text-purple-400" />,
      title: language === 'ru' ? 'ГДЕ (WHERE)' : 'WHERE',
      description: language === 'ru'
        ? 'Географическое расположение и контекстуальная среда'
        : 'Geographical location and contextual environment',
      questions: language === 'ru' ? [
        'Где происходит ситуация?',
        'Как влияет окружающая среда?'
      ] : [
        'Where is the situation taking place?',
        'How does the environment influence it?'
      ],
      ikrMapping: language === 'ru' ? 'Разведка + Знания' : 'Intelligence + Knowledge',
      priority: 'medium'
    },
    why: {
      icon: <Lightbulb size={24} className="text-orange-400" />,
      title: language === 'ru' ? 'ПОЧЕМУ (WHY)' : 'WHY',
      description: language === 'ru'
        ? 'Глубинные причины, мотивации и движущие силы'
        : 'Root causes, motivations and driving forces',
      questions: language === 'ru' ? [
        'Почему возникла ситуация?',
        'Каковы мотивации участников?'
      ] : [
        'Why did the situation arise?',
        'What are the participants\' motivations?'
      ],
      ikrMapping: language === 'ru' ? 'Разведка + Знания + Рассуждения' : 'Intelligence + Knowledge + Reasoning',
      priority: 'critical'
    },
    how: {
      icon: <Gear size={24} className="text-red-400" />,
      title: language === 'ru' ? 'КАК (HOW)' : 'HOW',
      description: language === 'ru'
        ? 'Механизмы, методы решения и минимизация рисков'
        : 'Mechanisms, solution methods and risk minimization',
      questions: language === 'ru' ? [
        'Как происходят процессы?',
        'Как можно решить ситуацию?',
        'Как минимизировать риски?'
      ] : [
        'How do the processes occur?',
        'How can the situation be resolved?',
        'How to minimize risks?'
      ],
      ikrMapping: language === 'ru' ? 'Знания + Рассуждения' : 'Knowledge + Reasoning',
      priority: 'critical'
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

  const statsInfo = {
    totalQuestions: 16,
    estimatedTime: language === 'ru' ? '15-20 минут' : '15-20 minutes',
    dimensions: 6,
    ikrMappings: 3
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Brain size={32} className="text-cyan-400" />
            <div>
              <h2 className="text-2xl">
                {language === 'ru' ? 'Анкета по Протоколу Киплинга' : 'Kipling Protocol Questionnaire'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {language === 'ru' 
                  ? 'Структурированный сбор информации для анализа IKR'
                  : 'Structured information gathering for IKR analysis'
                }
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">{statsInfo.totalQuestions}</div>
              <div className="text-sm text-muted-foreground">
                {language === 'ru' ? 'Всего вопросов' : 'Total Questions'}
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-blue-400">{statsInfo.dimensions}</div>
              <div className="text-sm text-muted-foreground">
                {language === 'ru' ? 'Измерений' : 'Dimensions'}
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-400">{statsInfo.ikrMappings}</div>
              <div className="text-sm text-muted-foreground">
                {language === 'ru' ? 'IKR секций' : 'IKR Sections'}
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-orange-400">{statsInfo.estimatedTime}</div>
              <div className="text-sm text-muted-foreground">
                {language === 'ru' ? 'Время' : 'Time'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purpose and Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={20} />
            {language === 'ru' ? 'Цель и Преимущества' : 'Purpose and Benefits'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Star size={16} className="text-yellow-400" />
                {language === 'ru' ? 'Что вы получите:' : 'What you will get:'}
              </h4>
              <ul className="space-y-2 text-sm">
                {(language === 'ru' ? [
                  'Структурированный анализ по всем 6 измерениям Киплинга',
                  'Автоматическое заполнение IKR директивы',
                  'Персональные рекомендации по анализу',
                  'Выявление информационных пробелов',
                  'Готовая основа для принятия решений'
                ] : [
                  'Structured analysis across all 6 Kipling dimensions',
                  'Automatic IKR directive completion',
                  'Personalized analysis recommendations',
                  'Information gap identification',
                  'Ready foundation for decision making'
                ]).map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Info size={16} className="text-blue-400" />
                {language === 'ru' ? 'Как это работает:' : 'How it works:'}
              </h4>
              <ul className="space-y-2 text-sm">
                {(language === 'ru' ? [
                  'Вопросы адаптированы под методологию IKR',
                  'Автоматическая категоризация ответов',
                  'Интеллектуальный анализ полноты данных',
                  'Генерация выводов и рекомендаций',
                  'Интеграция с основным проектом'
                ] : [
                  'Questions adapted for IKR methodology',
                  'Automatic response categorization',
                  'Intelligent data completeness analysis',
                  'Generation of insights and recommendations',
                  'Integration with main project'
                ]).map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-400">{index + 1}</span>
                    </div>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dimension Preview */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'ru' ? 'Измерения Протокола Киплинга' : 'Kipling Protocol Dimensions'}
          </CardTitle>
          <CardDescription>
            {language === 'ru'
              ? 'Каждое измерение содержит специально разработанные вопросы для сбора важной информации'
              : 'Each dimension contains specially designed questions to gather essential information'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {Object.entries(dimensionInfo).map(([key, info]) => (
              <Card key={key} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {info.icon}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-lg">{info.title}</h4>
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(info.priority)}`} />
                        <Badge variant="outline" className="text-xs">
                          {info.ikrMapping}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{info.description}</p>
                      
                      <div className="mt-3">
                        <h5 className="text-sm font-medium mb-2">
                          {language === 'ru' ? 'Примеры вопросов:' : 'Example questions:'}
                        </h5>
                        <ul className="space-y-1">
                          {info.questions.map((question, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary">•</span>
                              {question}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* IKR Integration */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain size={20} className="text-primary" />
            {language === 'ru' ? 'Интеграция с IKR Директивой' : 'IKR Directive Integration'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-blue-500/30">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target size={20} className="text-blue-400" />
                </div>
                <h4 className="font-medium mb-2">
                  {language === 'ru' ? 'Intelligence (Разведка)' : 'Intelligence'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {language === 'ru'
                    ? 'Сбор первичной информации и фактов'
                    : 'Collection of primary information and facts'
                  }
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-green-500/30">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star size={20} className="text-green-400" />
                </div>
                <h4 className="font-medium mb-2">
                  {language === 'ru' ? 'Knowledge (Знания)' : 'Knowledge'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {language === 'ru'
                    ? 'Синтез паттернов и взаимосвязей'
                    : 'Synthesis of patterns and relationships'
                  }
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-purple-500/30">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lightbulb size={20} className="text-purple-400" />
                </div>
                <h4 className="font-medium mb-2">
                  {language === 'ru' ? 'Reasoning (Рассуждения)' : 'Reasoning'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {language === 'ru'
                    ? 'Стратегические выводы и рекомендации'
                    : 'Strategic conclusions and recommendations'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Start Button */}
      <div className="text-center">
        <Button 
          onClick={onStartQuestionnaire}
          size="lg"
          className="px-8 py-4 text-lg"
        >
          <Play size={20} className="mr-3" />
          {language === 'ru' ? 'Начать Анкетирование' : 'Start Questionnaire'}
        </Button>
        <p className="text-sm text-muted-foreground mt-3">
          {language === 'ru'
            ? 'Данные будут автоматически сохранены и интегрированы в ваш проект'
            : 'Data will be automatically saved and integrated into your project'
          }
        </p>
      </div>
    </div>
  );
};

export default KiplingQuestionPreview;