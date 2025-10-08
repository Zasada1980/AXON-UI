import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  FileText, 
  Calendar, 
  MapPin, 
  Lightbulb, 
  Gear,
  CheckCircle,
  Download,
  ArrowRight,
  Target,
  Star,
  Eye,
  ChartBar,
  Brain,
  TrendUp
} from '@phosphor-icons/react';

interface QuestionnaireResultsProps {
  language: 'en' | 'ru';
  questionnaireData: any;
  onApplyToProject: (data: any) => void;
  onGenerateReport: () => void;
}

const QuestionnaireResults: React.FC<QuestionnaireResultsProps> = ({
  language,
  questionnaireData,
  onApplyToProject,
  onGenerateReport
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Extract data from questionnaire
  const { responses, completedQuestions, totalQuestions, dimensionBreakdown, ikrMapping } = questionnaireData;

  // Calculate completion percentage
  const completionPercentage = Math.round((completedQuestions / totalQuestions) * 100);

  // Get dimension icon
  const getDimensionIcon = (dimension: string, size: number = 20) => {
    switch (dimension) {
      case 'who': return <Users size={size} />;
      case 'what': return <FileText size={size} />;
      case 'when': return <Calendar size={size} />;
      case 'where': return <MapPin size={size} />;
      case 'why': return <Lightbulb size={size} />;
      case 'how': return <Gear size={size} />;
      default: return <FileText size={size} />;
    }
  };

  // Get dimension name
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

  // Get response quality score
  const getResponseQuality = (response: string) => {
    if (!response) return 0;
    const length = response.length;
    if (length < 50) return 25;
    if (length < 150) return 50;
    if (length < 300) return 75;
    return 100;
  };

  // Calculate overall analysis quality
  const calculateAnalysisQuality = () => {
    const responseLengths = Object.values(responses).map(r => (r as string).length);
    const avgLength = responseLengths.reduce((sum, len) => sum + len, 0) / responseLengths.length;
    const completionScore = (completedQuestions / totalQuestions) * 100;
    const depthScore = Math.min(100, (avgLength / 200) * 100);
    return Math.round((completionScore * 0.6 + depthScore * 0.4));
  };

  const analysisQuality = calculateAnalysisQuality();

  // Group responses by dimension for display
  const responsesByDimension = Object.entries(responses).reduce((acc, [questionId, response]) => {
    const dimension = questionId.split('-')[0];
    if (!acc[dimension]) acc[dimension] = [];
    acc[dimension].push({ questionId, response: response as string });
    return acc;
  }, {} as Record<string, Array<{ questionId: string; response: string }>>);

  // Generate insights preview
  const generateInsightsPreview = (): Array<{type: string; text: string}> => {
    const insights: Array<{type: string; text: string}> = [];

    // Completion insights
    if (completionPercentage >= 90) {
      insights.push({
        type: 'success',
        text: language === 'ru' 
          ? 'Отличная полнота анализа - все ключевые аспекты рассмотрены'
          : 'Excellent analysis completeness - all key aspects covered'
      });
    } else if (completionPercentage >= 70) {
      insights.push({
        type: 'warning',
        text: language === 'ru' 
          ? 'Хорошая полнота анализа, но некоторые аспекты можно углубить'
          : 'Good analysis completeness, but some aspects could be deepened'
      });
    } else {
      insights.push({
        type: 'error',
        text: language === 'ru' 
          ? 'Анализ требует дополнения - много пропущенных важных вопросов'
          : 'Analysis needs completion - many important questions missed'
      });
    }

    // Dimension-specific insights
    Object.entries(dimensionBreakdown).forEach(([dimension, count]) => {
      if ((count as number) === 0) {
        insights.push({
          type: 'warning',
          text: language === 'ru' 
            ? `Измерение "${getDimensionName(dimension)}" не заполнено`
            : `"${getDimensionName(dimension)}" dimension not completed`
        });
      }
    });

    // Quality insights
    if (analysisQuality >= 80) {
      insights.push({
        type: 'success',
        text: language === 'ru' 
          ? 'Высокое качество ответов - подробные и содержательные'
          : 'High quality responses - detailed and comprehensive'
      });
    }

    return insights.slice(0, 5); // Limit to 5 insights
  };

  const insights = generateInsightsPreview();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle size={32} className="text-green-500" />
              <div>
                <CardTitle className="text-2xl">
                  {language === 'ru' ? 'Результаты Анкеты Киплинга' : 'Kipling Questionnaire Results'}
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  {language === 'ru' 
                    ? 'Систематический анализ успешно завершен'
                    : 'Systematic analysis successfully completed'
                  }
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-500">{completionPercentage}%</div>
              <div className="text-sm text-muted-foreground">
                {language === 'ru' ? 'завершено' : 'completed'}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ru' ? 'Ответы' : 'Responses'}
                </p>
                <p className="text-2xl font-bold text-primary">{completedQuestions}/{totalQuestions}</p>
              </div>
              <FileText size={24} className="text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ru' ? 'Качество' : 'Quality'}
                </p>
                <p className="text-2xl font-bold text-accent">{analysisQuality}%</p>
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
                <p className="text-2xl font-bold text-secondary">
                  {Object.values(dimensionBreakdown).filter(count => (count as number) > 0).length}/6
                </p>
              </div>
              <Brain size={24} className="text-secondary/60" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ru' ? 'Готовность' : 'Readiness'}
                </p>
                <p className="text-2xl font-bold text-green-500">
                  {completionPercentage >= 70 ? (language === 'ru' ? 'Готов' : 'Ready') : (language === 'ru' ? 'Частично' : 'Partial')}
                </p>
              </div>
              <TrendUp size={24} className="text-green-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye size={16} />
            {language === 'ru' ? 'Обзор' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="dimensions" className="flex items-center gap-2">
            <Target size={16} />
            {language === 'ru' ? 'Измерения' : 'Dimensions'}
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb size={16} />
            {language === 'ru' ? 'Выводы' : 'Insights'}
          </TabsTrigger>
          <TabsTrigger value="ikr" className="flex items-center gap-2">
            <ChartBar size={16} />
            IKR
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Completion Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBar size={20} />
                  {language === 'ru' ? 'Прогресс по Измерениям' : 'Progress by Dimensions'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(dimensionBreakdown).map(([dimension, count]) => (
                  <div key={dimension} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getDimensionIcon(dimension, 16)}
                        <span className="font-medium">{getDimensionName(dimension)}</span>
                      </div>
                      <Badge variant={(count as number) > 0 ? 'default' : 'secondary'}>
                        {count as number} {language === 'ru' ? 'ответов' : 'responses'}
                      </Badge>
                    </div>
                    <Progress value={(count as number) > 0 ? 100 : 0} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb size={20} />
                  {language === 'ru' ? 'Ключевые Выводы' : 'Key Insights'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {insights.map((insight, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                        insight.type === 'success' ? 'border-l-green-500 bg-green-500/5' :
                        insight.type === 'warning' ? 'border-l-yellow-500 bg-yellow-500/5' :
                        'border-l-red-500 bg-red-500/5'
                      }`}>
                        <p className="text-sm">{insight.text}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'ru' ? 'Сводная Статистика' : 'Summary Statistics'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{
                    (Object.values(responses) as string[]).join(' ').length
                  }</div>
                  <div className="text-sm text-muted-foreground">
                    {language === 'ru' ? 'Символов написано' : 'Characters Written'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">
                    {Math.round((Object.values(responses) as string[]).reduce((sum, r) => sum + r.length, 0) / completedQuestions)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {language === 'ru' ? 'Среднее на ответ' : 'Average per Response'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">
                    {Object.values(responses).filter(r => (r as string).length > 100).length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {language === 'ru' ? 'Детальных ответов' : 'Detailed Responses'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dimensions Tab */}
        <TabsContent value="dimensions" className="space-y-6">
          <div className="grid gap-6">
            {Object.entries(responsesByDimension).map(([dimension, responses]) => (
              <Card key={dimension}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {getDimensionIcon(dimension, 24)}
                    <div>
                      <CardTitle className="text-xl">{getDimensionName(dimension)}</CardTitle>
                      <CardDescription>
                        {responses.length} {language === 'ru' ? 'ответов в этом измерении' : 'responses in this dimension'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {responses.map(({ questionId, response }, index) => (
                      <div key={questionId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            {language === 'ru' ? `Вопрос ${index + 1}` : `Question ${index + 1}`}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {language === 'ru' ? 'Качество' : 'Quality'}: {getResponseQuality(response)}%
                          </Badge>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm">{response}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain size={24} />
                {language === 'ru' ? 'Автоматически Сгенерированные Выводы' : 'Automatically Generated Insights'}
              </CardTitle>
              <CardDescription>
                {language === 'ru' 
                  ? 'Анализ ваших ответов и рекомендации для следующих шагов'
                  : 'Analysis of your responses and recommendations for next steps'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-green-500/20 bg-green-500/5">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">
                        {language === 'ru' ? 'Сильные стороны анализа' : 'Analysis Strengths'}
                      </h4>
                      <ul className="text-sm space-y-1">
                        {completionPercentage >= 70 && (
                          <li>• {language === 'ru' ? 'Высокая полнота ответов' : 'High response completeness'}</li>
                        )}
                        {Object.values(dimensionBreakdown).filter(c => (c as number) > 0).length >= 5 && (
                          <li>• {language === 'ru' ? 'Комплексный охват измерений' : 'Comprehensive dimension coverage'}</li>
                        )}
                        {analysisQuality >= 75 && (
                          <li>• {language === 'ru' ? 'Детальность ответов' : 'Response detail quality'}</li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-yellow-500/20 bg-yellow-500/5">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2">
                        {language === 'ru' ? 'Области для улучшения' : 'Areas for Improvement'}
                      </h4>
                      <ul className="text-sm space-y-1">
                        {Object.entries(dimensionBreakdown).filter(([_, count]) => count === 0).map(([dim, _]) => (
                          <li key={dim}>• {language === 'ru' ? `Дополните измерение "${getDimensionName(dim)}"` : `Complete "${getDimensionName(dim)}" dimension`}</li>
                        ))}
                        {analysisQuality < 60 && (
                          <li>• {language === 'ru' ? 'Углубите детализацию ответов' : 'Increase response detail'}</li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">
                    {language === 'ru' ? 'Рекомендуемые следующие шаги' : 'Recommended Next Steps'}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium">1</span>
                      </div>
                      <div>
                        <p className="font-medium">{language === 'ru' ? 'Применить к проекту' : 'Apply to Project'}</p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ru' 
                            ? 'Интегрируйте результаты анкеты в ваш проект анализа'
                            : 'Integrate questionnaire results into your analysis project'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium">2</span>
                      </div>
                      <div>
                        <p className="font-medium">{language === 'ru' ? 'Запустить ИИ аудит' : 'Run AI Audit'}</p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ru' 
                            ? 'Используйте агентов аудита для глубокого анализа'
                            : 'Use audit agents for deep analysis'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium">3</span>
                      </div>
                      <div>
                        <p className="font-medium">{language === 'ru' ? 'Генерировать выводы' : 'Generate Insights'}</p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ru' 
                            ? 'Получите ИИ-рекомендации для каждого измерения'
                            : 'Get AI recommendations for each dimension'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IKR Preview Tab */}
        <TabsContent value="ikr" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target size={24} />
                {language === 'ru' ? 'Предпросмотр IKR Директивы' : 'IKR Directive Preview'}
              </CardTitle>
              <CardDescription>
                {language === 'ru' 
                  ? 'Автоматическое заполнение секций Intelligence-Knowledge-Reasoning на основе ваших ответов'
                  : 'Automatic filling of Intelligence-Knowledge-Reasoning sections based on your responses'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(ikrMapping).map(([section, questions]) => (
                <div key={section}>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    {section === 'intelligence' && <Eye size={16} />}
                    {section === 'knowledge' && <Brain size={16} />}
                    {section === 'reasoning' && <Target size={16} />}
                    {section === 'intelligence' && (language === 'ru' ? 'Сбор Разведданных' : 'Intelligence Collection')}
                    {section === 'knowledge' && (language === 'ru' ? 'Синтез Знаний' : 'Knowledge Synthesis')}
                    {section === 'reasoning' && (language === 'ru' ? 'Стратегические Рассуждения' : 'Strategic Reasoning')}
                  </h4>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      {language === 'ru' ? 'Будет заполнено из ответов:' : 'Will be filled from responses:'}
                    </p>
                    <div className="space-y-2">
                      {(questions as any[]).map((q, index) => (
                        <div key={q.id} className="text-sm">
                          <span className="font-medium">
                            {index + 1}. {responses[q.id] ? 
                              (responses[q.id] as string).substring(0, 100) + '...' : 
                              (language === 'ru' ? 'Ответ не предоставлен' : 'Response not provided')
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-medium">
                {language === 'ru' ? 'Готовы применить результаты?' : 'Ready to apply results?'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {language === 'ru' 
                  ? 'Интегрируйте данные анкеты в ваш проект для дальнейшего анализа'
                  : 'Integrate questionnaire data into your project for further analysis'
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onGenerateReport}>
                <Download size={16} className="mr-2" />
                {language === 'ru' ? 'Экспорт Отчета' : 'Export Report'}
              </Button>
              <Button onClick={() => onApplyToProject(questionnaireData)}>
                <ArrowRight size={16} className="mr-2" />
                {language === 'ru' ? 'Применить к Проекту' : 'Apply to Project'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionnaireResults;