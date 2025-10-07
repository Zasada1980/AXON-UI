import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  CheckCircle, 
  Warning, 
  Star, 
  Clock, 
  Database,
  Eye,
  Plus,
  ListChecks,
  ChartLine,
  FileText,
  Brain
} from '@phosphor-icons/react';

interface CredibilityScore {
  overall: number;
  factors: {
    reliability: number;
    accuracy: number;
    timeliness: number;
    relevance: number;
    completeness: number;
  };
  confidence: number;
}

interface SourceVerification {
  id: string;
  sourceId: string;
  verifiedBy: string;
  verificationDate: string;
  method: 'cross-reference' | 'expert-review' | 'automated' | 'manual';
  status: 'verified' | 'disputed' | 'unverified';
  notes: string;
  evidence: string[];
}

interface IntelligenceSource {
  id: string;
  name: string;
  type: 'primary' | 'secondary' | 'tertiary';
  category: 'human' | 'technical' | 'documentary' | 'open-source';
  description: string;
  credibilityScore: CredibilityScore;
  verifications: SourceVerification[];
  lastAssessment: string;
  assessmentHistory: {
    date: string;
    score: number;
    assessor: string;
    notes: string;
  }[];
  reliability: number;
  trackRecord: {
    totalAssessments: number;
    accurateInformation: number;
    inaccurateInformation: number;
    timely: number;
    delayed: number;
  };
  riskFactors: string[];
  biasIndicators: string[];
}

interface Props {
  language: 'en' | 'ru';
  projectId: string;
  onSourceAssessed?: (source: IntelligenceSource) => void;
  onVerificationCompleted?: (verification: SourceVerification) => void;
}

const SourceCredibilityAssessment: React.FC<Props> = ({ 
  language, 
  projectId, 
  onSourceAssessed,
  onVerificationCompleted 
}) => {
  const [activeTab, setActiveTab] = useState('sources');
  const [isAssessing, setIsAssessing] = useState(false);
  const [showAddSource, setShowAddSource] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  
  // Form state for new source
  const [newSource, setNewSource] = useState({
    name: '',
    type: 'primary' as const,
    category: 'human' as const,
    description: ''
  });

  // Persistent storage
  const [sources, setSources] = useKV<IntelligenceSource[]>(`sources-assessment-${projectId}`, []);
  const [verifications, setVerifications] = useKV<SourceVerification[]>(`source-verifications-${projectId}`, []);

  // Translation helper
  const t = (key: string) => {
    const translations: Record<string, { en: string; ru: string }> = {
      sourceCredibility: { en: 'Source Credibility Assessment', ru: 'Оценка Достоверности Источников' },
      sources: { en: 'Sources', ru: 'Источники' },
      assessments: { en: 'Assessments', ru: 'Оценки' },
      verifications: { en: 'Verifications', ru: 'Верификации' },
      analytics: { en: 'Analytics', ru: 'Аналитика' },
      addSource: { en: 'Add Source', ru: 'Добавить Источник' },
      startAssessment: { en: 'Start Assessment', ru: 'Начать Оценку' },
      sourceName: { en: 'Source Name', ru: 'Название Источника' },
      sourceType: { en: 'Source Type', ru: 'Тип Источника' },
      sourceCategory: { en: 'Source Category', ru: 'Категория Источника' },
      description: { en: 'Description', ru: 'Описание' },
      primary: { en: 'Primary', ru: 'Первичный' },
      secondary: { en: 'Secondary', ru: 'Вторичный' },
      tertiary: { en: 'Tertiary', ru: 'Третичный' },
      human: { en: 'Human Intelligence', ru: 'Человеческая Разведка' },
      technical: { en: 'Technical Intelligence', ru: 'Техническая Разведка' },
      documentary: { en: 'Documentary', ru: 'Документальный' },
      openSource: { en: 'Open Source', ru: 'Открытые Источники' },
      credibilityScore: { en: 'Credibility Score', ru: 'Оценка Достоверности' },
      reliability: { en: 'Reliability', ru: 'Надёжность' },
      accuracy: { en: 'Accuracy', ru: 'Точность' },
      timeliness: { en: 'Timeliness', ru: 'Своевременность' },
      relevance: { en: 'Relevance', ru: 'Релевантность' },
      completeness: { en: 'Completeness', ru: 'Полнота' },
      confidence: { en: 'Confidence', ru: 'Доверие' },
      verificationMethod: { en: 'Verification Method', ru: 'Метод Верификации' },
      crossReference: { en: 'Cross Reference', ru: 'Перекрёстная Ссылка' },
      expertReview: { en: 'Expert Review', ru: 'Экспертная Проверка' },
      automated: { en: 'Automated', ru: 'Автоматизированная' },
      manual: { en: 'Manual', ru: 'Ручная' },
      verified: { en: 'Verified', ru: 'Верифицирован' },
      disputed: { en: 'Disputed', ru: 'Спорный' },
      unverified: { en: 'Unverified', ru: 'Не верифицирован' },
      trackRecord: { en: 'Track Record', ru: 'Послужной Список' },
      riskFactors: { en: 'Risk Factors', ru: 'Факторы Риска' },
      biasIndicators: { en: 'Bias Indicators', ru: 'Индикаторы Предвзятости' },
      lastAssessment: { en: 'Last Assessment', ru: 'Последняя Оценка' },
      totalAssessments: { en: 'Total Assessments', ru: 'Всего Оценок' },
      accurateInfo: { en: 'Accurate Information', ru: 'Точная Информация' },
      inaccurateInfo: { en: 'Inaccurate Information', ru: 'Неточная Информация' },
      cancel: { en: 'Cancel', ru: 'Отмена' },
      save: { en: 'Save', ru: 'Сохранить' },
      assess: { en: 'Assess', ru: 'Оценить' },
      verify: { en: 'Verify', ru: 'Верифицировать' },
      overall: { en: 'Overall', ru: 'Общая' }
    };
    return translations[key]?.[language] || key;
  };

  // Initialize default sources
  useEffect(() => {
    if (!sources || sources.length === 0) {
      const defaultSources: IntelligenceSource[] = [
        {
          id: 'source-1',
          name: language === 'ru' ? 'Анализ исходного кода' : 'Source Code Analysis',
          type: 'primary',
          category: 'technical',
          description: language === 'ru' 
            ? 'Статический анализ кодовой базы платформы AXON'
            : 'Static analysis of AXON platform codebase',
          credibilityScore: {
            overall: 95,
            factors: {
              reliability: 98,
              accuracy: 95,
              timeliness: 90,
              relevance: 100,
              completeness: 92
            },
            confidence: 98
          },
          verifications: [],
          lastAssessment: new Date().toISOString(),
          assessmentHistory: [
            {
              date: new Date().toISOString(),
              score: 95,
              assessor: 'System',
              notes: language === 'ru' ? 'Первичная оценка' : 'Initial assessment'
            }
          ],
          reliability: 95,
          trackRecord: {
            totalAssessments: 1,
            accurateInformation: 1,
            inaccurateInformation: 0,
            timely: 1,
            delayed: 0
          },
          riskFactors: [],
          biasIndicators: []
        },
        {
          id: 'source-2',
          name: language === 'ru' ? 'Документация пользователя' : 'User Documentation',
          type: 'secondary',
          category: 'documentary',
          description: language === 'ru'
            ? 'Официальная документация и руководства пользователя'
            : 'Official documentation and user guides',
          credibilityScore: {
            overall: 85,
            factors: {
              reliability: 90,
              accuracy: 85,
              timeliness: 70,
              relevance: 95,
              completeness: 85
            },
            confidence: 85
          },
          verifications: [],
          lastAssessment: new Date().toISOString(),
          assessmentHistory: [
            {
              date: new Date().toISOString(),
              score: 85,
              assessor: 'System',
              notes: language === 'ru' ? 'Требует обновления' : 'Needs updating'
            }
          ],
          reliability: 85,
          trackRecord: {
            totalAssessments: 1,
            accurateInformation: 1,
            inaccurateInformation: 0,
            timely: 0,
            delayed: 1
          },
          riskFactors: [
            language === 'ru' ? 'Устаревшая информация' : 'Outdated information'
          ],
          biasIndicators: []
        }
      ];
      setSources(defaultSources);
    }
  }, [language, sources, setSources]);

  // Calculate overall credibility score
  const calculateCredibilityScore = (source: IntelligenceSource): number => {
    const { factors } = source.credibilityScore;
    const weights = {
      reliability: 0.25,
      accuracy: 0.25,
      timeliness: 0.15,
      relevance: 0.20,
      completeness: 0.15
    };
    
    return Math.round(
      factors.reliability * weights.reliability +
      factors.accuracy * weights.accuracy +
      factors.timeliness * weights.timeliness +
      factors.relevance * weights.relevance +
      factors.completeness * weights.completeness
    );
  };

  // Start AI-powered assessment
  const startAssessment = async (sourceId: string) => {
    setIsAssessing(true);
    setSelectedSource(sourceId);

    try {
      // Simulate AI assessment process
      await new Promise(resolve => setTimeout(resolve, 2000));

      const source = sources?.find(s => s.id === sourceId);
      if (!source) return;

      // Generate new assessment scores with some variation
      const newFactors = {
        reliability: Math.max(0, Math.min(100, source.credibilityScore.factors.reliability + (Math.random() - 0.5) * 10)),
        accuracy: Math.max(0, Math.min(100, source.credibilityScore.factors.accuracy + (Math.random() - 0.5) * 10)),
        timeliness: Math.max(0, Math.min(100, source.credibilityScore.factors.timeliness + (Math.random() - 0.5) * 15)),
        relevance: Math.max(0, Math.min(100, source.credibilityScore.factors.relevance + (Math.random() - 0.5) * 5)),
        completeness: Math.max(0, Math.min(100, source.credibilityScore.factors.completeness + (Math.random() - 0.5) * 10))
      };

      const newOverall = calculateCredibilityScore({ ...source, credibilityScore: { ...source.credibilityScore, factors: newFactors } });

      const updatedSource: IntelligenceSource = {
        ...source,
        credibilityScore: {
          overall: newOverall,
          factors: newFactors,
          confidence: Math.max(80, Math.min(100, source.credibilityScore.confidence + (Math.random() - 0.5) * 5))
        },
        lastAssessment: new Date().toISOString(),
        assessmentHistory: [
          ...source.assessmentHistory,
          {
            date: new Date().toISOString(),
            score: newOverall,
            assessor: 'AI System',
            notes: language === 'ru' ? 'Автоматическая переоценка' : 'Automated reassessment'
          }
        ],
        trackRecord: {
          ...source.trackRecord,
          totalAssessments: source.trackRecord.totalAssessments + 1
        }
      };

      setSources(current => 
        (current || []).map(s => s.id === sourceId ? updatedSource : s)
      );

      if (onSourceAssessed) {
        onSourceAssessed(updatedSource);
      }

    } catch (error) {
      console.error('Assessment error:', error);
    } finally {
      setIsAssessing(false);
      setSelectedSource(null);
    }
  };

  // Add new source
  const addSource = () => {
    if (!newSource.name.trim()) return;

    const source: IntelligenceSource = {
      id: `source-${Date.now()}`,
      name: newSource.name,
      type: newSource.type,
      category: newSource.category,
      description: newSource.description,
      credibilityScore: {
        overall: 50,
        factors: {
          reliability: 50,
          accuracy: 50,
          timeliness: 50,
          relevance: 50,
          completeness: 50
        },
        confidence: 50
      },
      verifications: [],
      lastAssessment: new Date().toISOString(),
      assessmentHistory: [{
        date: new Date().toISOString(),
        score: 50,
        assessor: 'User',
        notes: language === 'ru' ? 'Новый источник' : 'New source'
      }],
      reliability: 50,
      trackRecord: {
        totalAssessments: 0,
        accurateInformation: 0,
        inaccurateInformation: 0,
        timely: 0,
        delayed: 0
      },
      riskFactors: [],
      biasIndicators: []
    };

    setSources(current => [...(current || []), source]);
    setNewSource({ name: '', type: 'primary', category: 'human', description: '' });
    setShowAddSource(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield size={24} className="text-primary" />
                {t('sourceCredibility')}
              </CardTitle>
              <CardDescription>
                {language === 'ru' 
                  ? 'Систематическая оценка достоверности и надёжности источников информации'
                  : 'Systematic assessment of information source credibility and reliability'
                }
              </CardDescription>
            </div>
            
            <Dialog open={showAddSource} onOpenChange={setShowAddSource}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-2" />
                  {t('addSource')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('addSource')}</DialogTitle>
                  <DialogDescription>
                    {language === 'ru'
                      ? 'Добавьте новый источник информации для оценки'
                      : 'Add a new information source for assessment'
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>{t('sourceName')}</Label>
                    <Input
                      value={newSource.name}
                      onChange={(e) => setNewSource(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={language === 'ru' ? 'Название источника' : 'Source name'}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('sourceType')}</Label>
                      <Select value={newSource.type} onValueChange={(value: any) => setNewSource(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">{t('primary')}</SelectItem>
                          <SelectItem value="secondary">{t('secondary')}</SelectItem>
                          <SelectItem value="tertiary">{t('tertiary')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{t('sourceCategory')}</Label>
                      <Select value={newSource.category} onValueChange={(value: any) => setNewSource(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="human">{t('human')}</SelectItem>
                          <SelectItem value="technical">{t('technical')}</SelectItem>
                          <SelectItem value="documentary">{t('documentary')}</SelectItem>
                          <SelectItem value="open-source">{t('openSource')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>{t('description')}</Label>
                    <Textarea
                      value={newSource.description}
                      onChange={(e) => setNewSource(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={language === 'ru' ? 'Описание источника' : 'Source description'}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddSource(false)}>
                      {t('cancel')}
                    </Button>
                    <Button onClick={addSource}>
                      {t('save')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sources">{t('sources')}</TabsTrigger>
              <TabsTrigger value="assessments">{t('assessments')}</TabsTrigger>
              <TabsTrigger value="verifications">{t('verifications')}</TabsTrigger>
              <TabsTrigger value="analytics">{t('analytics')}</TabsTrigger>
            </TabsList>

            <TabsContent value="sources" className="space-y-4">
              <div className="grid gap-4">
                {sources?.map(source => (
                  <Card key={source.id} className="cyber-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {source.category === 'human' && <Eye size={20} className="text-blue-500" />}
                            {source.category === 'technical' && <Database size={20} className="text-green-500" />}
                            {source.category === 'documentary' && <FileText size={20} className="text-purple-500" />}
                            {source.category === 'open-source' && <ChartLine size={20} className="text-orange-500" />}
                          </div>
                          <div>
                            <h4 className="font-medium">{source.name}</h4>
                            <p className="text-sm text-muted-foreground">{source.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getScoreBadgeVariant(source.credibilityScore.overall) as any}>
                            {source.credibilityScore.overall}%
                          </Badge>
                          <Button 
                            size="sm" 
                            onClick={() => startAssessment(source.id)}
                            disabled={isAssessing && selectedSource === source.id}
                          >
                            {isAssessing && selectedSource === source.id ? (
                              <>
                                <Clock size={14} className="mr-2 animate-spin" />
                                {language === 'ru' ? 'Оценка...' : 'Assessing...'}
                              </>
                            ) : (
                              <>
                                <Brain size={14} className="mr-2" />
                                {t('assess')}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{t('reliability')}</span>
                            <span className={getScoreColor(source.credibilityScore.factors.reliability)}>
                              {Math.round(source.credibilityScore.factors.reliability)}%
                            </span>
                          </div>
                          <Progress value={source.credibilityScore.factors.reliability} className="h-2" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{t('accuracy')}</span>
                            <span className={getScoreColor(source.credibilityScore.factors.accuracy)}>
                              {Math.round(source.credibilityScore.factors.accuracy)}%
                            </span>
                          </div>
                          <Progress value={source.credibilityScore.factors.accuracy} className="h-2" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{t('timeliness')}</span>
                            <span className={getScoreColor(source.credibilityScore.factors.timeliness)}>
                              {Math.round(source.credibilityScore.factors.timeliness)}%
                            </span>
                          </div>
                          <Progress value={source.credibilityScore.factors.timeliness} className="h-2" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{t('relevance')}</span>
                            <span className={getScoreColor(source.credibilityScore.factors.relevance)}>
                              {Math.round(source.credibilityScore.factors.relevance)}%
                            </span>
                          </div>
                          <Progress value={source.credibilityScore.factors.relevance} className="h-2" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{t('completeness')}</span>
                            <span className={getScoreColor(source.credibilityScore.factors.completeness)}>
                              {Math.round(source.credibilityScore.factors.completeness)}%
                            </span>
                          </div>
                          <Progress value={source.credibilityScore.factors.completeness} className="h-2" />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Badge variant="outline">{t(source.type)}</Badge>
                          <Badge variant="outline">{t(source.category)}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <ListChecks size={14} />
                          {t('totalAssessments')}: {source.trackRecord.totalAssessments}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {t('lastAssessment')}: {new Date(source.lastAssessment).toLocaleDateString()}
                        </div>
                      </div>

                      {source.riskFactors.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center gap-2 mb-2">
                            <Warning size={14} className="text-orange-500" />
                            <span className="text-sm font-medium">{t('riskFactors')}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(source.riskFactors || []).map((risk, i) => (
                              <Badge key={i} variant="destructive" className="text-xs">
                                {risk}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="assessments" className="space-y-4">
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {sources?.flatMap(source => 
                    source.assessmentHistory.map(assessment => (
                      <Card key={`${source.id}-${assessment.date}`} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Star size={16} className="text-yellow-500" />
                            <span className="font-medium text-sm">{source.name}</span>
                            <Badge variant={getScoreBadgeVariant(assessment.score) as any}>
                              {assessment.score}%
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(assessment.date).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{assessment.notes}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {language === 'ru' ? 'Оценщик' : 'Assessor'}: {assessment.assessor}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="verifications" className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Shield size={32} className="mx-auto mb-2 opacity-50" />
                <p>{language === 'ru' ? 'Верификации будут отображаться здесь' : 'Verifications will appear here'}</p>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{language === 'ru' ? 'Средняя достоверность' : 'Average Credibility'}</p>
                        <p className="text-2xl font-bold text-primary">
                          {sources?.length ? Math.round(sources.reduce((sum, s) => sum + s.credibilityScore.overall, 0) / sources.length) : 0}%
                        </p>
                      </div>
                      <ChartLine size={24} className="text-primary" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{language === 'ru' ? 'Высоконадёжные' : 'High Credibility'}</p>
                        <p className="text-2xl font-bold text-green-500">
                          {sources?.filter(s => s.credibilityScore.overall >= 80).length || 0}
                        </p>
                      </div>
                      <CheckCircle size={24} className="text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{language === 'ru' ? 'Требуют проверки' : 'Need Review'}</p>
                        <p className="text-2xl font-bold text-orange-500">
                          {sources?.filter(s => s.credibilityScore.overall < 60).length || 0}
                        </p>
                      </div>
                      <Warning size={24} className="text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SourceCredibilityAssessment;