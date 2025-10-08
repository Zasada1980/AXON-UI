import React, { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import KiplingQuestionnaire from '../components/KiplingQuestionnaire';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from '@phosphor-icons/react';
import { axon } from '@/services/axonAdapter';
import { toast } from 'sonner';

type Language = 'en' | 'ru';

interface KiplingDimension {
  id: string;
  title: string;
  question: string;
  content: string;
  insights: string[];
  priority: 'high' | 'medium' | 'low';
  completeness: number;
}

interface AnalysisProject {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  lastModified: string;
  completeness: number;
  dimensions: KiplingDimension[];
  ikrDirective: {
    intelligence: string;
    knowledge: string;
    reasoning: string;
  };
  auditAgents: any[];
  auditSessions: any[];
  chatSessions: any[];
}

interface Props {
  language: Language;
  projectId: string;
  onNavigate: (page: string) => void;
}

const translations: Record<string, { en: string; ru: string }> = {
  kiplingAnalysis: { en: 'Kipling Analysis', ru: 'Анализ по Киплингу' },
  analysisContent: { en: 'Analysis Content', ru: 'Содержимое анализа' },
  complete: { en: 'complete', ru: 'выполнено' },
  backToOverview: { en: 'Back to Overview', ru: 'Назад к обзору' },
  updateDimension: { en: 'Update Dimension', ru: 'Обновить измерение' },
  dimensionUpdated: { en: 'Dimension updated successfully', ru: 'Измерение успешно обновлено' }
};

export default function KiplingAnalysisPage({ language, projectId, onNavigate }: Props) {
  const [projects, setProjects] = useKV<AnalysisProject[]>('axon-projects', []);
  const [isGenerating, setIsGenerating] = useState(false);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  // Get current project data
  const projectData = projects?.find(p => p.id === projectId);

  const updateDimension = (dimensionId: string, content: string) => {
    if (!projectData) return;

    const updatedProjects = projects?.map(project => {
      if (project.id === projectId) {
        const updatedDimensions = project.dimensions.map(dimension => {
          if (dimension.id === dimensionId) {
            const completeness = Math.min(100, Math.max(0, (content.length / 500) * 100));
            return {
              ...dimension,
              content,
              completeness: Math.round(completeness),
              insights: content.length > 100 ? [
                'Key insight extracted from analysis',
                'Pattern identified in the content',
                'Recommendation based on findings'
              ] : []
            };
          }
          return dimension;
        });

        return {
          ...project,
          dimensions: updatedDimensions,
          lastModified: new Date().toISOString()
        };
      }
      return project;
    });

    setProjects(updatedProjects || []);
  };

  const generateWithAxon = async () => {
    if (!projectData) return;
    try {
      setIsGenerating(true);
      const prompt = projectData.dimensions
        .map((d) => `[${d.title}]\nQ: ${d.question}\nContent: ${d.content || '-'}\n`)
        .join('\n');
      const res = await axon.analyze({
        projectId,
        prompt,
        mode: 'kipling',
        language,
      });

      // Простая интеграция результата: добавим инсайт к каждому измерению и подтолкнём completeness
      const updatedProjects = projects?.map((p) => {
        if (p.id !== projectId) return p;
        const newDims = p.dimensions.map((d) => ({
          ...d,
          insights: [...(d.insights || []), res.content.slice(0, 240)],
          completeness: Math.min(100, Math.max(d.completeness || 0, 70)),
        }));
        return { ...p, dimensions: newDims, lastModified: new Date().toISOString() };
      });
      setProjects(updatedProjects || []);
      toast.success(language === 'ru' ? 'Анализ получен от AXON' : 'Analysis received from AXON');
    } catch (e: any) {
      toast.error((language === 'ru' ? 'Ошибка запроса: ' : 'Request error: ') + String(e?.message || e));
    } finally {
      setIsGenerating(false);
    }
  };

  if (!projectData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">
          {language === 'ru' ? 'Проект не найден' : 'Project not found'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'ru' 
            ? 'Выбранный проект не существует' 
            : 'The selected project does not exist'
          }
        </p>
        <Button 
          onClick={() => onNavigate('overview')}
          className="mt-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          {t('backToOverview')}
        </Button>
      </div>
    );
  }

  return (
    <div className="module-kipling space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('kiplingAnalysis')}</h1>
          <p className="text-muted-foreground mt-1">{projectData.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => onNavigate('overview')}
          >
            <ArrowLeft size={16} className="mr-2" />
            {t('backToOverview')}
          </Button>
          <Button onClick={generateWithAxon} disabled={isGenerating}>
            {isGenerating ? (language === 'ru' ? 'Генерация…' : 'Generating…') : (language === 'ru' ? 'Сгенерировать анализ (AXON)' : 'Generate (AXON)')}
          </Button>
        </div>
      </div>

      {/* Kipling Dimensions Grid */}
      <div className="grid gap-6">
        {projectData.dimensions.map(dimension => (
          <Card key={dimension.id} className="kipling-dimension">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="text-xl">{dimension.title}</CardTitle>
                  <CardDescription>{dimension.question}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor={`content-${dimension.id}`}>{t('analysisContent')}</Label>
                <Textarea
                  id={`content-${dimension.id}`}
                  value={dimension.content}
                  onChange={(e) => updateDimension(dimension.id, e.target.value)}
                  placeholder={`Analysis for: ${dimension.question}`}
                  rows={6}
                  className="mt-2"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Progress value={dimension.completeness} className="w-32" />
                  <span className="text-sm text-muted-foreground">
                    {Math.round(dimension.completeness)}% {t('complete')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    dimension.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    dimension.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {dimension.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'ru' ? 'Общий прогресс анализа' : 'Overall Analysis Progress'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress 
              value={projectData.dimensions.reduce((sum, d) => sum + d.completeness, 0) / projectData.dimensions.length} 
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              {language === 'ru' 
                ? `Завершено ${projectData.dimensions.filter(d => d.completeness >= 80).length} из ${projectData.dimensions.length} измерений`
                : `Completed ${projectData.dimensions.filter(d => d.completeness >= 80).length} of ${projectData.dimensions.length} dimensions`
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}