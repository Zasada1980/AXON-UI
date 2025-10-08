import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  FileText, 
  Calendar, 
  MapPin, 
  Lightbulb, 
  Gear,
  Play,
  Clock,
  Star,
  Target,
  Brain
} from '@phosphor-icons/react';

interface KiplingQuestionPreviewProps {
  language: 'en' | 'ru';
  onStartQuestionnaire: () => void;
}

const KiplingQuestionPreview: React.FC<KiplingQuestionPreviewProps> = ({
  language,
  onStartQuestionnaire
}) => {
  // Question statistics by dimension
  const dimensionStats = {
    who: { questions: 4, importance: 'high', estimatedTime: 8 },
    what: { questions: 5, importance: 'high', estimatedTime: 12 },
    when: { questions: 4, importance: 'medium', estimatedTime: 7 },
    where: { questions: 4, importance: 'medium', estimatedTime: 6 },
    why: { questions: 4, importance: 'high', estimatedTime: 9 },
    how: { questions: 5, importance: 'high', estimatedTime: 11 }
  };

  const totalQuestions = Object.values(dimensionStats).reduce((sum, stat) => sum + stat.questions, 0);
  const totalTime = Object.values(dimensionStats).reduce((sum, stat) => sum + stat.estimatedTime, 0);
  const highPriorityQuestions = Object.values(dimensionStats).filter(stat => stat.importance === 'high').reduce((sum, stat) => sum + stat.questions, 0);

  // Get dimension icon
  const getDimensionIcon = (dimension: string) => {
    switch (dimension) {
      case 'who': return <Users size={20} />;
      case 'what': return <FileText size={20} />;
      case 'when': return <Calendar size={20} />;
      case 'where': return <MapPin size={20} />;
      case 'why': return <Lightbulb size={20} />;
      case 'how': return <Gear size={20} />;
      default: return <FileText size={20} />;
    }
  };

  // Get dimension translations
  const getDimensionName = (dimension: string) => {
    const names = {
      who: { en: 'Who', ru: 'Кто' },
      what: { en: 'What', ru: 'Что' },
      when: { en: 'When', ru: 'Когда' },
      where: { en: 'Where', ru: 'Где' },
      why: { en: 'Why', ru: 'Почему' },
      how: { en: 'How', ru: 'Как' }
    };
    return names[dimension as keyof typeof names]?.[language] || dimension;
  };

  // Get dimension descriptions
  const getDimensionDescription = (dimension: string) => {
    const descriptions = {
      who: { 
        en: 'Stakeholders, actors, decision-makers, and key participants',
        ru: 'Заинтересованные стороны, участники, лица принимающие решения'
      },
      what: { 
        en: 'Core issues, problems, objectives, and desired outcomes',
        ru: 'Основные проблемы, задачи, цели и желаемые результаты'
      },
      when: { 
        en: 'Timelines, deadlines, historical context, and scheduling',
        ru: 'Временные рамки, дедлайны, исторический контекст и планирование'
      },
      where: { 
        en: 'Geographic scope, organizational context, and implementation locations',
        ru: 'Географический охват, организационный контекст и места реализации'
      },
      why: { 
        en: 'Root causes, motivations, importance, and potential consequences',
        ru: 'Первопричины, мотивации, важность и потенциальные последствия'
      },
      how: { 
        en: 'Methods, approaches, measurement criteria, and implementation strategies',
        ru: 'Методы, подходы, критерии оценки и стратегии реализации'
      }
    };
    return descriptions[dimension as keyof typeof descriptions]?.[language] || '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target size={32} className="text-primary" />
              <div>
                <CardTitle className="text-2xl">
                  {language === 'ru' ? 'Интерактивная Анкета Киплинга' : 'Interactive Kipling Questionnaire'}
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  {language === 'ru' 
                    ? 'Систематический анализ ситуации по методу 6 вопросов Киплинга'
                    : 'Systematic situational analysis using Kipling\'s 6 questions method'
                  }
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{totalQuestions}</div>
              <div className="text-sm text-muted-foreground">
                {language === 'ru' ? 'вопросов' : 'questions'}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ru' ? 'Время выполнения' : 'Completion Time'}
                </p>
                <p className="text-2xl font-bold text-primary">{totalTime} {language === 'ru' ? 'мин' : 'min'}</p>
              </div>
              <Clock size={24} className="text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ru' ? 'Приоритетные' : 'High Priority'}
                </p>
                <p className="text-2xl font-bold text-accent">{highPriorityQuestions}</p>
              </div>
              <Star size={24} className="text-accent/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ru' ? 'Измерения' : 'Dimensions'}
                </p>
                <p className="text-2xl font-bold text-secondary">6</p>
              </div>
              <Brain size={24} className="text-secondary/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dimensions Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={20} />
            {language === 'ru' ? 'Обзор Измерений Киплинга' : 'Kipling Dimensions Overview'}
          </CardTitle>
          <CardDescription>
            {language === 'ru' 
              ? 'Каждое измерение содержит серию целевых вопросов для глубокого анализа'
              : 'Each dimension contains a series of targeted questions for deep analysis'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(dimensionStats).map(([dimension, stats]) => (
              <Card key={dimension} className="border-l-4 border-l-primary/30">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getDimensionIcon(dimension)}
                        <h4 className="font-semibold text-lg">{getDimensionName(dimension)}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={stats.importance === 'high' ? 'default' : 'secondary'}>
                          {stats.importance === 'high' ? 
                            (language === 'ru' ? 'Высокий' : 'High') :
                            (language === 'ru' ? 'Средний' : 'Medium')
                          }
                        </Badge>
                        {stats.importance === 'high' && <Star size={14} className="text-accent" />}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {getDimensionDescription(dimension)}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {stats.questions} {language === 'ru' ? 'вопросов' : 'questions'}
                      </span>
                      <span className="text-muted-foreground">
                        ~{stats.estimatedTime} {language === 'ru' ? 'мин' : 'min'}
                      </span>
                    </div>
                    
                    <Progress value={(stats.questions / 6) * 100} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'ru' ? 'Преимущества Метода Киплинга' : 'Benefits of Kipling Method'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Target size={16} className="text-primary" />
                {language === 'ru' ? 'Систематический подход' : 'Systematic Approach'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {language === 'ru' 
                  ? 'Структурированный анализ всех ключевых аспектов ситуации без пропусков'
                  : 'Structured analysis of all key aspects of the situation without gaps'
                }
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Brain size={16} className="text-primary" />
                {language === 'ru' ? 'Глубина анализа' : 'Analysis Depth'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {language === 'ru' 
                  ? 'Выявление скрытых связей и факторов, влияющих на ситуацию'
                  : 'Revealing hidden connections and factors affecting the situation'
                }
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Users size={16} className="text-primary" />
                {language === 'ru' ? 'Учет всех сторон' : 'All Stakeholders'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {language === 'ru' 
                  ? 'Комплексное рассмотрение интересов всех заинтересованных сторон'
                  : 'Comprehensive consideration of all stakeholders\' interests'
                }
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Lightbulb size={16} className="text-primary" />
                {language === 'ru' ? 'Готовые решения' : 'Ready Solutions'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {language === 'ru' 
                  ? 'Автоматическое формирование плана действий на основе анализа'
                  : 'Automatic action plan generation based on analysis'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
        <CardHeader>
          <CardTitle>
            {language === 'ru' ? 'Готовы начать анализ?' : 'Ready to start analysis?'}
          </CardTitle>
          <CardDescription>
            {language === 'ru' 
              ? 'Пройдите интерактивную анкету и получите структурированный анализ вашей ситуации. Все данные автоматически интегрируются в ваш проект.'
              : 'Complete the interactive questionnaire and get a structured analysis of your situation. All data will be automatically integrated into your project.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">
                {language === 'ru' ? 'Что вы получите:' : 'What you\'ll get:'}
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {language === 'ru' ? 'Заполненные измерения Киплинга' : 'Completed Kipling dimensions'}</li>
                <li>• {language === 'ru' ? 'Автоматическое заполнение IKR директивы' : 'Automatic IKR directive completion'}</li>
                <li>• {language === 'ru' ? 'Готовый план дальнейших действий' : 'Ready action plan for next steps'}</li>
                <li>• {language === 'ru' ? 'Экспорт результатов в различных форматах' : 'Export results in various formats'}</li>
              </ul>
            </div>
            
            <Button onClick={onStartQuestionnaire} size="lg" className="min-w-40">
              <Play size={20} className="mr-2" />
              {language === 'ru' ? 'Начать Анкету' : 'Start Questionnaire'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'ru' ? 'Советы для эффективного заполнения' : 'Tips for Effective Completion'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-primary">
                {language === 'ru' ? '🎯 Будьте конкретными' : '🎯 Be Specific'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {language === 'ru' 
                  ? 'Чем детальнее ваши ответы, тем точнее будет анализ и рекомендации'
                  : 'The more detailed your answers, the more accurate the analysis and recommendations'
                }
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-primary">
                {language === 'ru' ? '⭐ Приоритеты важны' : '⭐ Priorities Matter'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {language === 'ru' 
                  ? 'Вопросы со звездочкой особенно важны для качественного анализа'
                  : 'Questions with stars are especially important for quality analysis'
                }
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-primary">
                {language === 'ru' ? '🔄 Можно возвращаться' : '🔄 You Can Return'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {language === 'ru' 
                  ? 'Используйте навигацию для возврата к предыдущим вопросам'
                  : 'Use navigation to return to previous questions'
                }
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-primary">
                {language === 'ru' ? '💡 Думайте широко' : '💡 Think Broadly'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {language === 'ru' 
                  ? 'Рассматривайте ситуацию с разных углов и перспектив'
                  : 'Consider the situation from different angles and perspectives'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KiplingQuestionPreview;