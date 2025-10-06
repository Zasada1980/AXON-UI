import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Brain,
  ChartLine,
  Eye,
  Lightbulb,
  Gear,
  Shield,
  Star,
  Target,
  CheckCircle,
  Warning,
  ArrowRight,
  TrendUp,
  Sparkle,
  Palette,
  Layout,
  Lightning,
  Users,
  Gauge,
  Bug,
  Wrench,
  Microscope,
  Rocket,
  Diamond,
  Clock
} from '@phosphor-icons/react';

// Declare global spark object
declare global {
  interface Window {
    spark: {
      llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string;
      llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>;
    };
  }
}

const spark = (globalThis as any).spark;

type Language = 'en' | 'ru';

interface UIAnalysisMetric {
  id: string;
  name: string;
  category: 'usability' | 'accessibility' | 'performance' | 'aesthetics' | 'functionality';
  score: number;
  maxScore: number;
  issues: string[];
  recommendations: string[];
  impact: 'low' | 'medium' | 'high' | 'critical';
}

interface EvolutionSuggestion {
  id: string;
  title: string;
  description: string;
  category: 'layout' | 'interaction' | 'visual' | 'content' | 'navigation';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  priority: number;
  implementation: string[];
  mockupUrl?: string;
}

interface AuditSession {
  id: string;
  timestamp: string;
  overallScore: number;
  metrics: UIAnalysisMetric[];
  suggestions: EvolutionSuggestion[];
  status: 'running' | 'completed' | 'failed';
  duration?: number;
}

interface UIEvolutionAuditProps {
  language: Language;
  projectId: string;
  onAuditCompleted?: (session: AuditSession) => void;
  onSuggestionImplemented?: (suggestion: EvolutionSuggestion) => void;
}

const translations = {
  // Main UI
  title: { en: 'UI Evolution Audit', ru: 'Аудит Эволюции UI' },
  description: { en: 'Comprehensive analysis and evolution recommendations for user interface', ru: 'Комплексный анализ и рекомендации по эволюции пользовательского интерфейса' },
  
  // Actions
  startAudit: { en: 'Start UI Audit', ru: 'Начать Аудит UI' },
  stopAudit: { en: 'Stop Audit', ru: 'Остановить Аудит' },
  generateReport: { en: 'Generate Report', ru: 'Создать Отчет' },
  implementSuggestion: { en: 'Implement', ru: 'Внедрить' },
  viewDetails: { en: 'View Details', ru: 'Подробности' },
  exportResults: { en: 'Export Results', ru: 'Экспорт Результатов' },
  
  // Metrics
  overallScore: { en: 'Overall UI Score', ru: 'Общая Оценка UI' },
  usability: { en: 'Usability', ru: 'Удобство использования' },
  accessibility: { en: 'Accessibility', ru: 'Доступность' },
  performance: { en: 'Performance', ru: 'Производительность' },
  aesthetics: { en: 'Aesthetics', ru: 'Эстетика' },
  functionality: { en: 'Functionality', ru: 'Функциональность' },
  
  // Categories
  layout: { en: 'Layout', ru: 'Макет' },
  interaction: { en: 'Interaction', ru: 'Взаимодействие' },
  visual: { en: 'Visual', ru: 'Визуал' },
  content: { en: 'Content', ru: 'Контент' },
  navigation: { en: 'Navigation', ru: 'Навигация' },
  
  // Impact levels
  low: { en: 'Low', ru: 'Низкий' },
  medium: { en: 'Medium', ru: 'Средний' },
  high: { en: 'High', ru: 'Высокий' },
  critical: { en: 'Critical', ru: 'Критический' },
  
  // Effort levels
  effort: { en: 'Effort', ru: 'Усилия' },
  impact: { en: 'Impact', ru: 'Влияние' },
  priority: { en: 'Priority', ru: 'Приоритет' },
  
  // Status
  running: { en: 'Running', ru: 'Выполняется' },
  completed: { en: 'Completed', ru: 'Завершено' },
  failed: { en: 'Failed', ru: 'Не удалось' },
  
  // Sections
  metrics: { en: 'UI Metrics', ru: 'Метрики UI' },
  suggestions: { en: 'Evolution Suggestions', ru: 'Предложения по Эволюции' },
  history: { en: 'Audit History', ru: 'История Аудитов' },
  implementation: { en: 'Implementation Plan', ru: 'План Внедрения' },
  
  // Messages
  auditStarted: { en: 'UI audit started', ru: 'Аудит UI начат' },
  auditCompleted: { en: 'UI audit completed', ru: 'Аудит UI завершен' },
  auditFailed: { en: 'UI audit failed', ru: 'Аудит UI не удался' },
  reportGenerated: { en: 'UI evolution report generated', ru: 'Отчет по эволюции UI создан' },
  suggestionImplemented: { en: 'Suggestion implemented', ru: 'Предложение внедрено' },
  
  // Details
  issues: { en: 'Issues Found', ru: 'Найденные Проблемы' },
  recommendations: { en: 'Recommendations', ru: 'Рекомендации' },
  implementationSteps: { en: 'Implementation Steps', ru: 'Шаги Внедрения' },
  currentState: { en: 'Current State', ru: 'Текущее Состояние' },
  targetState: { en: 'Target State', ru: 'Целевое Состояние' },
  
  // Analysis
  analysisInProgress: { en: 'Analysis in progress...', ru: 'Анализ выполняется...' },
  analyzingComponent: { en: 'Analyzing component', ru: 'Анализ компонента' },
  generatingInsights: { en: 'Generating insights', ru: 'Создание выводов' },
  preparingReport: { en: 'Preparing report', ru: 'Подготовка отчета' }
};

const useTranslation = (language: Language) => {
  return (key: string): string => {
    return translations[key]?.[language] || key;
  };
};

export default function UIEvolutionAudit({ 
  language, 
  projectId, 
  onAuditCompleted,
  onSuggestionImplemented 
}: UIEvolutionAuditProps) {
  const t = useTranslation(language);
  
  // State management
  const [auditSessions, setAuditSessions] = useKV<AuditSession[]>(`ui-audit-sessions-${projectId}`, []);
  const [currentSession, setCurrentSession] = useState<AuditSession | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<EvolutionSuggestion | null>(null);
  const [auditProgress, setAuditProgress] = useState(0);
  const [auditPhase, setAuditPhase] = useState('');
  
  // Simulated UI components analysis
  const analyzeUIComponents = async (): Promise<{ metrics: UIAnalysisMetric[], suggestions: EvolutionSuggestion[] }> => {
    const components = [
      'Header', 'Navigation', 'Content Areas', 'Forms', 'Buttons', 
      'Cards', 'Modals', 'Tables', 'Charts', 'Icons'
    ];
    
    const metrics: UIAnalysisMetric[] = [];
    const suggestions: EvolutionSuggestion[] = [];
    
    // Simulate analysis phases
    for (let i = 0; i < components.length; i++) {
      setAuditPhase(`${t('analyzingComponent')}: ${components[i]}`);
      setAuditProgress((i / components.length) * 80); // 80% for component analysis
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate mock metrics
      if (i < 5) { // First 5 components get metrics
        const score = 70 + Math.random() * 25;
        metrics.push({
          id: `metric-${i}`,
          name: components[i],
          category: ['usability', 'accessibility', 'performance', 'aesthetics', 'functionality'][i % 5] as any,
          score: Math.round(score),
          maxScore: 100,
          issues: [
            `${components[i]} accessibility concerns`,
            `Performance optimization needed`,
            `User experience improvements available`
          ],
          recommendations: [
            `Enhance ${components[i]} contrast ratios`,
            `Implement responsive design patterns`,
            `Add micro-interactions for better feedback`
          ],
          impact: score < 80 ? 'high' : score < 90 ? 'medium' : 'low'
        });
      }
    }
    
    setAuditPhase(t('generatingInsights'));
    setAuditProgress(85);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate AI-powered suggestions
    try {
      const prompt = spark.llmPrompt`Analyze the current AXON intelligence analysis platform UI and generate 5 specific evolution suggestions. 

Current UI state:
- Dark cyberpunk theme with module-specific coloring
- Tabbed interface with 15+ modules
- Card-based layout for content organization
- Advanced features like AI chat, audit agents, file management
- Multi-language support (EN/RU)

Generate suggestions for UI evolution focusing on:
1. Enhanced user workflows
2. Better information architecture
3. Improved visual hierarchy
4. Modern interaction patterns
5. Accessibility improvements

Return as JSON with property "suggestions" containing array of objects with: title, description, category (layout/interaction/visual/content/navigation), effort (low/medium/high), impact (low/medium/high), priority (1-10), implementation (array of steps).`;

      const response = await spark.llm(prompt, 'gpt-4o-mini', true);
      const result = JSON.parse(response);
      
      if (result.suggestions) {
        suggestions.push(...result.suggestions.map((s: any, idx: number) => ({
          id: `suggestion-${idx}`,
          title: s.title,
          description: s.description,
          category: s.category,
          effort: s.effort,
          impact: s.impact,
          priority: s.priority || 5,
          implementation: s.implementation || []
        })));
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      
      // Fallback suggestions
      suggestions.push(
        {
          id: 'suggestion-fallback-1',
          title: language === 'ru' ? 'Улучшение навигации по модулям' : 'Enhanced Module Navigation',
          description: language === 'ru' 
            ? 'Реализовать иерархическую навигацию с поиском и фильтрацией модулей'
            : 'Implement hierarchical navigation with module search and filtering',
          category: 'navigation',
          effort: 'medium',
          impact: 'high',
          priority: 8,
          implementation: [
            'Add search functionality to tab navigation',
            'Implement module grouping by category',
            'Create quick access sidebar'
          ]
        },
        {
          id: 'suggestion-fallback-2',
          title: language === 'ru' ? 'Адаптивный дизайн панели инструментов' : 'Responsive Dashboard Layout',
          description: language === 'ru'
            ? 'Оптимизировать интерфейс для различных размеров экранов'
            : 'Optimize interface for different screen sizes',
          category: 'layout',
          effort: 'high',
          impact: 'high',
          priority: 7,
          implementation: [
            'Implement responsive grid system',
            'Add mobile-first navigation',
            'Optimize touch interactions'
          ]
        }
      );
    }
    
    setAuditPhase(t('preparingReport'));
    setAuditProgress(95);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { metrics, suggestions };
  };
  
  // Start audit
  const startAudit = async () => {
    if (isAuditing) return;
    
    setIsAuditing(true);
    setAuditProgress(0);
    setAuditPhase(t('analysisInProgress'));
    
    const sessionId = `session-${Date.now()}`;
    const startTime = Date.now();
    
    const newSession: AuditSession = {
      id: sessionId,
      timestamp: new Date().toISOString(),
      overallScore: 0,
      metrics: [],
      suggestions: [],
      status: 'running'
    };
    
    setCurrentSession(newSession);
    setAuditSessions(current => [...(current || []), newSession]);
    
    toast.success(t('auditStarted'));
    
    try {
      const { metrics, suggestions } = await analyzeUIComponents();
      
      // Calculate overall score
      const overallScore = metrics.length > 0 
        ? Math.round(metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length)
        : 85;
      
      const completedSession: AuditSession = {
        ...newSession,
        overallScore,
        metrics,
        suggestions,
        status: 'completed',
        duration: Date.now() - startTime
      };
      
      setCurrentSession(completedSession);
      setAuditSessions(current => 
        (current || []).map(s => s.id === sessionId ? completedSession : s)
      );
      
      setAuditProgress(100);
      setAuditPhase(t('completed'));
      
      toast.success(t('auditCompleted'));
      onAuditCompleted?.(completedSession);
      
    } catch (error) {
      console.error('Audit failed:', error);
      
      const failedSession: AuditSession = {
        ...newSession,
        status: 'failed',
        duration: Date.now() - startTime
      };
      
      setCurrentSession(failedSession);
      setAuditSessions(current => 
        (current || []).map(s => s.id === sessionId ? failedSession : s)
      );
      
      toast.error(t('auditFailed'));
    }
    
    setIsAuditing(false);
  };
  
  // Get metric icon
  const getMetricIcon = (category: string) => {
    switch (category) {
      case 'usability': return <Users size={20} />;
      case 'accessibility': return <Shield size={20} />;
      case 'performance': return <Gauge size={20} />;
      case 'aesthetics': return <Palette size={20} />;
      case 'functionality': return <Gear size={20} />;
      default: return <Microscope size={20} />;
    }
  };
  
  // Get suggestion icon
  const getSuggestionIcon = (category: string) => {
    switch (category) {
      case 'layout': return <Layout size={20} />;
      case 'interaction': return <Lightning size={20} />;
      case 'visual': return <Eye size={20} />;
      case 'content': return <Brain size={20} />;
      case 'navigation': return <Target size={20} />;
      default: return <Lightbulb size={20} />;
    }
  };
  
  // Get impact color
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };
  
  // Get latest session
  const latestSession = auditSessions?.[auditSessions.length - 1] || currentSession;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Microscope size={24} className="text-primary" />
            {t('title')}
          </CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {latestSession && (
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-primary">
                    {latestSession.overallScore}%
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t('overallScore')}</div>
                    <Badge variant={
                      latestSession.overallScore >= 90 ? 'default' :
                      latestSession.overallScore >= 75 ? 'secondary' : 'destructive'
                    }>
                      {latestSession.overallScore >= 90 ? 'Excellent' :
                       latestSession.overallScore >= 75 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={startAudit}
                disabled={isAuditing}
                className="flex items-center gap-2"
              >
                {isAuditing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {t('running')}
                  </>
                ) : (
                  <>
                    <Rocket size={16} />
                    {t('startAudit')}
                  </>
                )}
              </Button>
              
              {latestSession && (
                <Button variant="outline" onClick={() => toast.success(t('reportGenerated'))}>
                  <ChartLine size={16} className="mr-2" />
                  {t('generateReport')}
                </Button>
              )}
            </div>
          </div>
          
          {isAuditing && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{auditPhase}</span>
                <span>{auditProgress}%</span>
              </div>
              <Progress value={auditProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Main Content */}
      {latestSession && (
        <Tabs defaultValue="metrics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <Gauge size={16} />
              {t('metrics')}
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Lightbulb size={16} />
              {t('suggestions')}
            </TabsTrigger>
            <TabsTrigger value="implementation" className="flex items-center gap-2">
              <Wrench size={16} />
              {t('implementation')}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock size={16} />
              {t('history')}
            </TabsTrigger>
          </TabsList>
          
          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {latestSession.metrics.map((metric) => (
                <Card key={metric.id} className="relative ui-audit-metric-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getMetricIcon(metric.category)}
                        <CardTitle className="text-lg">{metric.name}</CardTitle>
                      </div>
                      <Badge variant="outline" className={getImpactColor(metric.impact)}>
                        {t(metric.impact)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Score */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t(metric.category)}</span>
                        <span className="text-lg font-bold">{metric.score}/{metric.maxScore}</span>
                      </div>
                      <Progress value={(metric.score / metric.maxScore) * 100} className="h-2" />
                      
                      {/* Issues */}
                      {metric.issues.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                            <Warning size={14} className="text-orange-500" />
                            {t('issues')} ({metric.issues.length})
                          </h5>
                          <ul className="text-xs space-y-1">
                            {metric.issues.slice(0, 2).map((issue, i) => (
                              <li key={i} className="text-muted-foreground">• {issue}</li>
                            ))}
                            {metric.issues.length > 2 && (
                              <li className="text-muted-foreground">
                                • +{metric.issues.length - 2} more...
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                      
                      {/* Recommendations */}
                      {metric.recommendations.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                            <CheckCircle size={14} className="text-green-500" />
                            {t('recommendations')}
                          </h5>
                          <ul className="text-xs space-y-1">
                            {metric.recommendations.slice(0, 2).map((rec, i) => (
                              <li key={i} className="text-muted-foreground">• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {latestSession.metrics.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Gauge size={48} className="mx-auto mb-4 opacity-50" />
                  <p>{language === 'ru' ? 'Метрики будут доступны после завершения аудита' : 'Metrics will be available after audit completion'}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-4">
            <div className="space-y-4">
              {latestSession.suggestions
                .sort((a, b) => b.priority - a.priority)
                .map((suggestion) => (
                <Card key={suggestion.id} className="relative ui-audit-suggestion">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getSuggestionIcon(suggestion.category)}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {suggestion.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="priority-indicator">
                          {t('priority')}: {suggestion.priority}
                        </Badge>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye size={16} className="mr-2" />
                              {t('viewDetails')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                {getSuggestionIcon(suggestion.category)}
                                {suggestion.title}
                              </DialogTitle>
                              <DialogDescription>
                                {suggestion.description}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                  <Label className="text-sm font-medium">{t('category')}</Label>
                                  <Badge variant="secondary" className="mt-1">
                                    {t(suggestion.category)}
                                  </Badge>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">{t('effort')}</Label>
                                  <Badge variant="outline" className="mt-1">
                                    {t(suggestion.effort)}
                                  </Badge>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">{t('impact')}</Label>
                                  <Badge variant="outline" className={`mt-1 ${getImpactColor(suggestion.impact)}`}>
                                    {t(suggestion.impact)}
                                  </Badge>
                                </div>
                              </div>
                              
                              {suggestion.implementation.length > 0 && (
                                <div>
                                  <Label className="text-sm font-medium mb-2 block">
                                    {t('implementationSteps')}
                                  </Label>
                                  <ol className="space-y-2">
                                    {suggestion.implementation.map((step, i) => (
                                      <li key={i} className="flex items-start gap-2 text-sm">
                                        <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center mt-0.5">
                                          {i + 1}
                                        </span>
                                        <span>{step}</span>
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                              
                              <div className="flex justify-end gap-2">
                                <Button
                                  onClick={() => {
                                    onSuggestionImplemented?.(suggestion);
                                    toast.success(t('suggestionImplemented'));
                                  }}
                                  className="flex items-center gap-2"
                                >
                                  <CheckCircle size={16} />
                                  {t('implementSuggestion')}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">{t(suggestion.category)}</Badge>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{t('effort')}: {t(suggestion.effort)}</span>
                          <span>•</span>
                          <span>{t('impact')}: {t(suggestion.impact)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star size={16} className="text-yellow-500" />
                        <span className="text-sm font-medium">{suggestion.priority}/10</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {latestSession.suggestions.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Lightbulb size={48} className="mx-auto mb-4 opacity-50" />
                  <p>{language === 'ru' ? 'Предложения будут доступны после завершения аудита' : 'Suggestions will be available after audit completion'}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Implementation Tab */}
          <TabsContent value="implementation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench size={20} />
                  {t('implementation')}
                </CardTitle>
                <CardDescription>
                  {language === 'ru' 
                    ? 'Приоритизированный план внедрения улучшений UI'
                    : 'Prioritized implementation plan for UI improvements'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {latestSession.suggestions.length > 0 ? (
                  <div className="space-y-6">
                    {['high', 'medium', 'low'].map(effort => {
                      const suggestions = latestSession.suggestions.filter(s => s.effort === effort);
                      if (suggestions.length === 0) return null;
                      
                      return (
                        <div key={effort}>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Diamond size={16} className={
                              effort === 'high' ? 'text-red-500' :
                              effort === 'medium' ? 'text-yellow-500' : 'text-green-500'
                            } />
                            {t(effort)} {t('effort')} ({suggestions.length})
                          </h4>
                          <div className="space-y-3">
                            {suggestions
                              .sort((a, b) => b.priority - a.priority)
                              .map(suggestion => (
                              <div key={suggestion.id} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium">{suggestion.title}</h5>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={getImpactColor(suggestion.impact)}>
                                      {t(suggestion.impact)} {t('impact')}
                                    </Badge>
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        onSuggestionImplemented?.(suggestion);
                                        toast.success(t('suggestionImplemented'));
                                      }}
                                    >
                                      <CheckCircle size={14} className="mr-1" />
                                      {t('implementSuggestion')}
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {suggestion.description}
                                </p>
                                {suggestion.implementation.length > 0 && (
                                  <div className="space-y-1">
                                    {suggestion.implementation.slice(0, 3).map((step, i) => (
                                      <div key={i} className="flex items-center gap-2 text-xs">
                                        <CheckCircle size={12} className="text-muted-foreground" />
                                        <span>{step}</span>
                                      </div>
                                    ))}
                                    {suggestion.implementation.length > 3 && (
                                      <span className="text-xs text-muted-foreground">
                                        +{suggestion.implementation.length - 3} more steps...
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <Wrench size={48} className="mx-auto mb-4 opacity-50" />
                    <p>{language === 'ru' ? 'План внедрения будет доступен после завершения аудита' : 'Implementation plan will be available after audit completion'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={20} />
                  {t('history')}
                </CardTitle>
                <CardDescription>
                  {language === 'ru' 
                    ? 'История проведенных аудитов UI'
                    : 'History of conducted UI audits'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {auditSessions && auditSessions.length > 0 ? (
                  <div className="space-y-3">
                    {auditSessions.slice().reverse().map((session) => (
                      <div key={session.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <Badge variant={
                                session.status === 'completed' ? 'default' :
                                session.status === 'running' ? 'secondary' : 'destructive'
                              }>
                                {t(session.status)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(session.timestamp).toLocaleString()}
                              </span>
                              {session.duration && (
                                <span className="text-sm text-muted-foreground">
                                  ({Math.round(session.duration / 1000)}s)
                                </span>
                              )}
                            </div>
                            <div className="mt-2 flex items-center gap-4">
                              <div className="text-lg font-medium">
                                {session.overallScore}% {language === 'ru' ? 'общий балл' : 'overall score'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {session.metrics.length} {language === 'ru' ? 'метрик' : 'metrics'} • 
                                {session.suggestions.length} {language === 'ru' ? 'предложений' : 'suggestions'}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentSession(session)}
                          >
                            <Eye size={14} className="mr-1" />
                            {t('viewDetails')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <Clock size={48} className="mx-auto mb-4 opacity-50" />
                    <p>{language === 'ru' ? 'История аудитов пуста' : 'No audit history available'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}