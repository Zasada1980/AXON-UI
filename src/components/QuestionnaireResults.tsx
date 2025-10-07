import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  CheckCircle,
  Star,
  ArrowRight,
  Download,
  Eye
} from '@phosphor-icons/react';

interface QuestionnaireResultsProps {
  language: 'ru' | 'en';
  questionnaireData: {
    responses: Record<string, any>;
    ikrMapping: {
      intelligence: any[];
      knowledge: any[];
      reasoning: any[];
    };
    completionScore: number;
    dimensionProgress: Array<{
      dimension: string;
      progress: number;
      answered: number;
      total: number;
    }>;
  };
  onApplyToProject: (data: any) => void;
  onGenerateReport: () => void;
}

const QuestionnaireResults: React.FC<QuestionnaireResultsProps> = ({
  language,
  questionnaireData,
  onApplyToProject,
  onGenerateReport
}) => {
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);

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

  const getIKRRecommendations = () => {
    const { intelligence, knowledge, reasoning } = questionnaireData.ikrMapping;
    
    return {
      intelligence: {
        score: (intelligence.length / (intelligence.length + knowledge.length + reasoning.length)) * 100,
        recommendations: language === 'ru' ? [
          'Собрано достаточно первичной информации для анализа',
          'Рекомендуется проверить достоверность источников',
          'Необходимо заполнить информационные пробелы'
        ] : [
          'Sufficient primary information collected for analysis',
          'Recommend verifying source credibility',
          'Need to fill information gaps'
        ]
      },
      knowledge: {
        score: (knowledge.length / (intelligence.length + knowledge.length + reasoning.length)) * 100,
        recommendations: language === 'ru' ? [
          'Хорошая база для синтеза паттернов и связей',
          'Можно приступать к построению концептуальной модели',
          'Рекомендуется дополнительный анализ взаимосвязей'
        ] : [
          'Good foundation for pattern and relationship synthesis',
          'Can proceed with conceptual model building',
          'Recommend additional relationship analysis'
        ]
      },
      reasoning: {
        score: (reasoning.length / (intelligence.length + knowledge.length + reasoning.length)) * 100,
        recommendations: language === 'ru' ? [
          'Достаточно данных для стратегического анализа',
          'Можно формулировать выводы и рекомендации',
          'Необходима проверка логических цепочек'
        ] : [
          'Sufficient data for strategic analysis',
          'Can formulate conclusions and recommendations',
          'Need to verify logical chains'
        ]
      }
    };
  };

  const ikrRecommendations = getIKRRecommendations();

  const getDimensionResponses = (dimension: string) => {
    return Object.entries(questionnaireData.responses)
      .filter(([questionId]) => questionId.startsWith(dimension))
      .map(([questionId, response]) => ({ questionId, response }));
  };

  const generateInsightSummary = (): string[] => {
    const insights: string[] = [];
    
    // Анализ полноты ответов
    if (questionnaireData.completionScore >= 90) {
      insights.push(
        language === 'ru' 
          ? 'Высокая полнота сбора информации (90%+)' 
          : 'High information collection completeness (90%+)'
      );
    } else if (questionnaireData.completionScore >= 70) {
      insights.push(
        language === 'ru'
          ? 'Средняя полнота сбора информации (70-90%)'
          : 'Medium information collection completeness (70-90%)'
      );
    } else {
      insights.push(
        language === 'ru'
          ? 'Низкая полнота сбора информации (<70%). Рекомендуется дополнить ответы.'
          : 'Low information collection completeness (<70%). Recommend completing answers.'
      );
    }

    // Анализ балансировки IKR
    const ikrBalance = questionnaireData.ikrMapping;
    const total = ikrBalance.intelligence.length + ikrBalance.knowledge.length + ikrBalance.reasoning.length;
    
    if (ikrBalance.intelligence.length / total > 0.5) {
      insights.push(
        language === 'ru'
          ? 'Преобладает сбор разведданных - хорошо для начальной стадии'
          : 'Intelligence gathering dominates - good for initial stage'
      );
    }
    
    if (ikrBalance.reasoning.length / total > 0.4) {
      insights.push(
        language === 'ru'
          ? 'Много стратегических вопросов - готовность к выводам'
          : 'Many strategic questions - readiness for conclusions'
      );
    }

    return insights;
  };

  return (
    <div className="space-y-6">
      {/* Header with Results Summary */}
      <Card className="cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <CheckCircle size={24} className="text-green-400" />
            {language === 'ru' ? 'Результаты Анкеты Киплинга' : 'Kipling Questionnaire Results'}
          </CardTitle>
          <CardDescription>
            {language === 'ru'
              ? 'Анализ собранной информации и рекомендации для IKR-анализа'
              : 'Analysis of collected information and IKR-analysis recommendations'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-400">
                {Math.round(questionnaireData.completionScore)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {language === 'ru' ? 'Полнота ответов' : 'Completion Rate'}
              </div>
              <Progress value={questionnaireData.completionScore} className="h-2" />
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-blue-400">
                {questionnaireData.dimensionProgress.filter(d => d.progress >= 80).length}/6
              </div>
              <div className="text-sm text-muted-foreground">
                {language === 'ru' ? 'Заполненные измерения' : 'Completed Dimensions'}
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-purple-400">
                {Object.keys(questionnaireData.responses).length}
              </div>
              <div className="text-sm text-muted-foreground">
                {language === 'ru' ? 'Всего ответов' : 'Total Responses'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dimension Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={20} />
            {language === 'ru' ? 'Анализ по Измерениям' : 'Dimension Analysis'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {questionnaireData.dimensionProgress.map((dim) => (
              <Card 
                key={dim.dimension}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedDimension === dim.dimension ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedDimension(
                  selectedDimension === dim.dimension ? null : dim.dimension
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {getDimensionIcon(dim.dimension)}
                    <div>
                      <h4 className="font-medium uppercase">{dim.dimension}</h4>
                      <p className="text-sm text-muted-foreground">
                        {dim.answered}/{dim.total} {language === 'ru' ? 'ответов' : 'answers'}
                      </p>
                    </div>
                  </div>
                  <Progress value={dim.progress} className="h-2 mb-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {Math.round(dim.progress)}%
                    </span>
                    <Button variant="ghost" size="sm">
                      <Eye size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {selectedDimension && (
            <div className="mt-6 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                {getDimensionIcon(selectedDimension)}
                {language === 'ru' ? 'Ответы по измерению' : 'Dimension Responses'} "{selectedDimension.toUpperCase()}"
              </h4>
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {getDimensionResponses(selectedDimension).map(({ questionId, response }, index) => (
                    <div key={questionId} className="border-l-2 border-primary pl-3">
                      <p className="text-sm font-medium">
                        {language === 'ru' ? 'Вопрос' : 'Question'} {index + 1}:
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {typeof response === 'string' ? response : JSON.stringify(response)}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* IKR Mapping Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain size={20} />
            {language === 'ru' ? 'Анализ IKR Директивы' : 'IKR Directive Analysis'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Intelligence */}
            <Card className="border-blue-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  {language === 'ru' ? 'Разведка' : 'Intelligence'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {questionnaireData.ikrMapping.intelligence.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === 'ru' ? 'вопросов' : 'questions'}
                    </div>
                  </div>
                  <Progress value={ikrRecommendations.intelligence.score} className="h-2" />
                  <div className="space-y-1">
                    {ikrRecommendations.intelligence.recommendations.map((rec, index) => (
                      <p key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                        <Star size={10} className="text-blue-400 mt-1 flex-shrink-0" />
                        {rec}
                      </p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Knowledge */}
            <Card className="border-green-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  {language === 'ru' ? 'Знания' : 'Knowledge'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {questionnaireData.ikrMapping.knowledge.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === 'ru' ? 'вопросов' : 'questions'}
                    </div>
                  </div>
                  <Progress value={ikrRecommendations.knowledge.score} className="h-2" />
                  <div className="space-y-1">
                    {ikrRecommendations.knowledge.recommendations.map((rec, index) => (
                      <p key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                        <Star size={10} className="text-green-400 mt-1 flex-shrink-0" />
                        {rec}
                      </p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reasoning */}
            <Card className="border-purple-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  {language === 'ru' ? 'Рассуждения' : 'Reasoning'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {questionnaireData.ikrMapping.reasoning.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === 'ru' ? 'вопросов' : 'questions'}
                    </div>
                  </div>
                  <Progress value={ikrRecommendations.reasoning.score} className="h-2" />
                  <div className="space-y-1">
                    {ikrRecommendations.reasoning.recommendations.map((rec, index) => (
                      <p key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                        <Star size={10} className="text-purple-400 mt-1 flex-shrink-0" />
                        {rec}
                      </p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star size={20} />
            {language === 'ru' ? 'Ключевые Выводы' : 'Key Insights'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {generateInsightSummary().map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <CheckCircle size={16} className="text-green-400 mt-1 flex-shrink-0" />
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button 
          onClick={() => onApplyToProject(questionnaireData)}
          className="flex items-center gap-2"
        >
          <ArrowRight size={16} />
          {language === 'ru' ? 'Применить к Проекту' : 'Apply to Project'}
        </Button>
        
        <Button 
          variant="outline"
          onClick={onGenerateReport}
          className="flex items-center gap-2"
        >
          <Download size={16} />
          {language === 'ru' ? 'Скачать Отчёт' : 'Download Report'}
        </Button>
      </div>
    </div>
  );
};

export default QuestionnaireResults;