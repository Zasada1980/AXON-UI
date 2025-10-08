import React, { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { axon } from '@/services/axonAdapter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Target, Brain, MagnifyingGlass, Lightbulb, ArrowRight, Plus, PencilSimple, Eye } from '@phosphor-icons/react';
// IKR tools/components
import IntelligenceGathering from '@/components/IntelligenceGathering';
import KiplingQuestionnaire from '@/components/KiplingQuestionnaire';
import AdvancedCognitiveAnalysis from '@/components/AdvancedCognitiveAnalysis';
import MicroTaskExecutor from '@/components/MicroTaskExecutor';

interface IKRDirectiveProps {
  language: 'en' | 'ru';
  projectId: string;
  onNavigate: (pageId: string) => void;
}

interface IKRComponent {
  id: string;
  type: 'intelligence' | 'knowledge' | 'reasoning';
  title: string;
  content: string;
  status: 'pending' | 'in-progress' | 'completed' | 'validated';
  priority: 'critical' | 'high' | 'medium' | 'low';
  completeness: number;
  validationNotes: string;
  lastUpdated: string;
}

interface IKRAnalysis {
  id: string;
  projectId: string;
  title: string;
  description: string;
  components: IKRComponent[];
  overallCompleteness: number;
  createdAt: string;
  lastModified: string;
}

const IKRDirectivePage: React.FC<IKRDirectiveProps> = ({
  language,
  projectId,
  onNavigate: _onNavigate
}) => {
  // Persistent storage for IKR analyses
  const [ikrAnalyses, setIkrAnalyses] = useKV<IKRAnalysis[]>(`ikr-analyses-${projectId}`, []);
  const [currentAnalysis, setCurrentAnalysis] = useKV<string | null>(`current-ikr-${projectId}`, null);

  // AXON analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<string>('');

  // UI state
  const [isCreatingAnalysis, setIsCreatingAnalysis] = useState(false);
  const [_isEditingComponent, _setIsEditingComponent] = useState<string | null>(null);
  const [newAnalysisTitle, setNewAnalysisTitle] = useState('');
  const [newAnalysisDescription, setNewAnalysisDescription] = useState('');
  const [_selectedComponentType, _setSelectedComponentType] = useState<'intelligence' | 'knowledge' | 'reasoning'>('intelligence');

  // Translations
  const t = (key: string): string => {
    const translations: Record<string, { en: string; ru: string }> = {
      // Page header
      ikrDirective: { en: 'IKR Directive', ru: 'Директива IKR' },
      ikrDescription: { en: 'Intelligence-Knowledge-Reasoning Analysis Framework', ru: 'Система анализа Разведка-Знания-Рассуждения' },
      
      // IKR Components
      intelligence: { en: 'Intelligence', ru: 'Разведка' },
      intelligenceDesc: { en: 'Information gathering and source analysis', ru: 'Сбор информации и анализ источников' },
      knowledge: { en: 'Knowledge', ru: 'Знания' },
      knowledgeDesc: { en: 'Structured knowledge and insights synthesis', ru: 'Структурированные знания и синтез инсайтов' },
      reasoning: { en: 'Reasoning', ru: 'Рассуждения' },
      reasoningDesc: { en: 'Logical analysis and conclusion formation', ru: 'Логический анализ и формирование выводов' },
      
      // Status
      pending: { en: 'Pending', ru: 'Ожидает' },
      inProgress: { en: 'In Progress', ru: 'В работе' },
      completed: { en: 'Completed', ru: 'Завершено' },
      validated: { en: 'Validated', ru: 'Проверено' },
      
      // Priority
      critical: { en: 'Critical', ru: 'Критично' },
      high: { en: 'High', ru: 'Высокий' },
      medium: { en: 'Medium', ru: 'Средний' },
      low: { en: 'Low', ru: 'Низкий' },
      
      // Actions
      newAnalysis: { en: 'New IKR Analysis', ru: 'Новый IKR Анализ' },
      createAnalysis: { en: 'Create Analysis', ru: 'Создать Анализ' },
      editComponent: { en: 'Edit Component', ru: 'Редактировать Компонент' },
      addComponent: { en: 'Add Component', ru: 'Добавить Компонент' },
      save: { en: 'Save', ru: 'Сохранить' },
      cancel: { en: 'Cancel', ru: 'Отмена' },
      export: { en: 'Export', ru: 'Экспорт' },
      import: { en: 'Import', ru: 'Импорт' },
      
      // Form fields
      title: { en: 'Title', ru: 'Заголовок' },
      description: { en: 'Description', ru: 'Описание' },
      content: { en: 'Content', ru: 'Содержание' },
      validationNotes: { en: 'Validation Notes', ru: 'Заметки по валидации' },
      
      // Messages
      analysisCreated: { en: 'IKR Analysis created successfully', ru: 'IKR Анализ успешно создан' },
      componentUpdated: { en: 'Component updated successfully', ru: 'Компонент успешно обновлен' },
      titleRequired: { en: 'Title is required', ru: 'Заголовок обязателен' },
      
      // Overview
      overallProgress: { en: 'Overall Progress', ru: 'Общий Прогресс' },
      componentStatus: { en: 'Component Status', ru: 'Статус Компонентов' },
      recentActivity: { en: 'Recent Activity', ru: 'Последняя Активность' }
    };
    
    return translations[key]?.[language] || key;
  };

  // Get current analysis
  const currentAnalysisData = ikrAnalyses?.find(a => a.id === currentAnalysis);

  // Create new analysis
  const createAnalysis = () => {
    if (!newAnalysisTitle.trim()) {
      toast.error(t('titleRequired'));
      return;
    }

    const newAnalysis: IKRAnalysis = {
      id: Date.now().toString(),
      projectId,
      title: newAnalysisTitle,
      description: newAnalysisDescription,
      components: [
        {
          id: 'intelligence-1',
          type: 'intelligence',
          title: t('intelligence'),
          content: '',
          status: 'pending',
          priority: 'high',
          completeness: 0,
          validationNotes: '',
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'knowledge-1',
          type: 'knowledge',
          title: t('knowledge'),
          content: '',
          status: 'pending',
          priority: 'high',
          completeness: 0,
          validationNotes: '',
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'reasoning-1',
          type: 'reasoning',
          title: t('reasoning'),
          content: '',
          status: 'pending',
          priority: 'high',
          completeness: 0,
          validationNotes: '',
          lastUpdated: new Date().toISOString()
        }
      ],
      overallCompleteness: 0,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    setIkrAnalyses(current => [...(current || []), newAnalysis]);
    setCurrentAnalysis(newAnalysis.id);
    setNewAnalysisTitle('');
    setNewAnalysisDescription('');
    setIsCreatingAnalysis(false);
    toast.success(t('analysisCreated'));
  };

  // Update component
  const _updateComponent = (componentId: string, updates: Partial<IKRComponent>) => {
    if (!currentAnalysisData) return;

    const updatedComponents = currentAnalysisData.components.map(comp =>
      comp.id === componentId
        ? { ...comp, ...updates, lastUpdated: new Date().toISOString() }
        : comp
    );

    const overallCompleteness = Math.round(
      updatedComponents.reduce((sum, comp) => sum + comp.completeness, 0) / updatedComponents.length
    );

    const updatedAnalysis = {
      ...currentAnalysisData,
      components: updatedComponents,
      overallCompleteness,
      lastModified: new Date().toISOString()
    };

    setIkrAnalyses(current =>
      current?.map(analysis =>
        analysis.id === currentAnalysis ? updatedAnalysis : analysis
      ) || []
    );

  toast.success(t('componentUpdated'));
  _setIsEditingComponent(null);
  };

  // Get component icon
  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'intelligence': return <MagnifyingGlass size={20} />;
      case 'knowledge': return <Brain size={20} />;
      case 'reasoning': return <Lightbulb size={20} />;
      default: return <Target size={20} />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'validated': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // AXON analysis handler
  const runAxonAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResult('');
    setAnalysisError('');
    try {
      const prompt = currentAnalysisData?.description || '';
      const req = {
        projectId,
        prompt,
        mode: 'ikr' as const,
        language,
      };
      const res = await axon.analyze(req);
      setAnalysisResult(res.content);
    } catch (err: any) {
      setAnalysisError(err?.message || 'AXON анализ не удался');
      toast.error(err?.message || 'AXON анализ не удался');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Apply AXON analysis result to I/K/R components
  const applyAxonResult = () => {
    if (!currentAnalysisData || !analysisResult) return;
    const text = analysisResult.trim();
    const segments = text.split(/\n{2,}/).filter(Boolean);
    const [intel, know, reason] = [
      segments[0] || text.slice(0, Math.ceil(text.length / 3)),
      segments[1] || text.slice(Math.ceil(text.length / 3), Math.ceil((2 * text.length) / 3)),
      segments[2] || text.slice(Math.ceil((2 * text.length) / 3))
    ];

    const updatesByType: Record<'intelligence'|'knowledge'|'reasoning', string> = {
      intelligence: intel,
      knowledge: know,
      reasoning: reason,
    };

    const updatedComponents = currentAnalysisData.components.map(c => {
      const add = updatesByType[c.type as keyof typeof updatesByType] || '';
      const newContent = [c.content || '', add].filter(Boolean).join('\n\n');
      const completeness = Math.min(100, Math.max(c.completeness, Math.round(Math.min(100, (newContent.length / 500) * 100))));
      const status: IKRComponent['status'] = completeness >= 80 ? 'completed' : 'in-progress';
      return { ...c, content: newContent, completeness, status, validationNotes: c.validationNotes };
    });

    const overallCompleteness = Math.round(
      updatedComponents.reduce((sum, comp) => sum + comp.completeness, 0) / updatedComponents.length
    );

    const updatedAnalysis: IKRAnalysis = {
      ...currentAnalysisData,
      components: updatedComponents,
      overallCompleteness,
      lastModified: new Date().toISOString()
    };

    setIkrAnalyses(current => current?.map(a => a.id === currentAnalysis ? updatedAnalysis : a) || []);
    toast.success(language === 'ru' ? 'Результат AXON применён' : 'AXON result applied');
  };

  // Helpers: update I/K/R components based on tool outputs
  const updateIKRComponentByType = (type: 'intelligence'|'knowledge'|'reasoning', append: string) => {
    const analysis = currentAnalysisData;
    if (!analysis) return;
    const updatedComponents = analysis.components.map(comp => {
      if (comp.type !== type) return comp;
      const newContent = [comp.content || '', append].filter(Boolean).join('\n\n');
      const completeness = Math.min(100, Math.max(comp.completeness, Math.round(Math.min(100, (newContent.length / 500) * 100))));
      const status: IKRComponent['status'] = completeness >= 80 ? 'completed' : 'in-progress';
      return { ...comp, content: newContent, completeness, status, lastUpdated: new Date().toISOString() };
    });
    const overallCompleteness = Math.round(updatedComponents.reduce((sum, c) => sum + c.completeness, 0) / updatedComponents.length);
    const updatedAnalysis: IKRAnalysis = { ...analysis, components: updatedComponents, overallCompleteness, lastModified: new Date().toISOString() };
    setIkrAnalyses(current => current?.map(a => a.id === currentAnalysis ? updatedAnalysis : a) || []);
  };

  return (
    <div className="module-ikr min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Target size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('ikrDirective')}</h1>
              <p className="text-muted-foreground">{t('ikrDescription')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentAnalysisData && (
              <Badge variant="secondary" className="px-3 py-1">
                {currentAnalysisData.overallCompleteness}% {t('completed')}
              </Badge>
            )}

            {/* AXON анализ кнопка */}
            {currentAnalysisData && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={runAxonAnalysis} disabled={isAnalyzing} variant="outline">
                      {isAnalyzing ? (
                        <span className="flex items-center gap-2"><MagnifyingGlass size={16} className="animate-spin" /> Анализ AXON...</span>
                      ) : (
                        <span className="flex items-center gap-2"><MagnifyingGlass size={16} /> AXON анализ</span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {language==='ru' ? 'Запустить анализ AXON на основе описания' : 'Run AXON analysis from description'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Dialog open={isCreatingAnalysis} onOpenChange={setIsCreatingAnalysis}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus size={16} className="mr-2" />
                        {t('newAnalysis')}
                      </Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    {language==='ru' ? 'Создать новый IKR анализ' : 'Create new IKR analysis'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('createAnalysis')}</DialogTitle>
                  <DialogDescription>
                    {t('ikrDescription')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">{t('title')}</Label>
                    <Input
                      id="title"
                      value={newAnalysisTitle}
                      onChange={(e) => setNewAnalysisTitle(e.target.value)}
                      placeholder={language === 'ru' ? 'Введите название анализа' : 'Enter analysis title'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">{t('description')}</Label>
                    <Textarea
                      id="description"
                      value={newAnalysisDescription}
                      onChange={(e) => setNewAnalysisDescription(e.target.value)}
                      placeholder={language === 'ru' ? 'Краткое описание анализа' : 'Brief analysis description'}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreatingAnalysis(false)}>
                      {t('cancel')}
                    </Button>
                    <Button onClick={createAnalysis}>{t('createAnalysis')}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        {!currentAnalysisData ? (
          <div className="text-center py-12">
            <Target size={64} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              {language === 'ru' ? 'Создайте IKR Анализ' : 'Create IKR Analysis'}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {language === 'ru' 
                ? 'Начните структурированный анализ с использованием методологии Intelligence-Knowledge-Reasoning'
                : 'Start structured analysis using Intelligence-Knowledge-Reasoning methodology'
              }
            </p>
            {(ikrAnalyses || []).length > 0 && (
              <div className="max-w-2xl mx-auto mb-8">
                <h3 className="text-lg font-medium mb-4">
                  {language === 'ru' ? 'Предыдущие анализы' : 'Previous Analyses'}
                </h3>
                <div className="grid gap-3">
                  {(ikrAnalyses || []).map(analysis => (
                    <Card key={analysis.id} className="cursor-pointer hover:shadow-md transition-shadow" 
                          onClick={() => setCurrentAnalysis(analysis.id)}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="text-left">
                          <h4 className="font-medium">{analysis.title}</h4>
                          <p className="text-sm text-muted-foreground">{analysis.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={analysis.overallCompleteness} className="w-20" />
                          <ArrowRight size={20} className="text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            <Button onClick={() => setIsCreatingAnalysis(true)} size="lg">
              <Plus size={20} className="mr-2" />
              {t('createAnalysis')}
            </Button>
          </div>
        ) : (
          // Analysis view
          <div className="space-y-6">
            {/* Analysis Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye size={20} />
                  {currentAnalysisData.title}
                </CardTitle>
                <CardDescription>{currentAnalysisData.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">{t('overallProgress')}</Label>
                    <div className="mt-2">
                      <Progress value={currentAnalysisData.overallCompleteness} className="w-full" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {currentAnalysisData.overallCompleteness}% {t('completed')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('componentStatus')}</Label>
                    <div className="mt-2 flex gap-1">
                      {currentAnalysisData.components.map(comp => (
                        <div
                          key={comp.id}
                          className={`w-3 h-3 rounded-full ${
                            comp.status === 'validated' ? 'bg-purple-500' :
                            comp.status === 'completed' ? 'bg-green-500' :
                            comp.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-500'
                          }`}
                          title={`${comp.title}: ${t(comp.status)}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('recentActivity')}</Label>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(currentAnalysisData.lastModified).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')}
                    </p>
                  </div>
                </div>
                {/* AXON анализ результат/ошибка */}
                {(isAnalyzing || analysisResult || analysisError) && (
                  <div className="mt-6">
                    {isAnalyzing && (
                      <div className="flex items-center gap-2 text-blue-500"><MagnifyingGlass size={16} className="animate-spin" /> Анализ AXON выполняется...</div>
                    )}
                    {analysisResult && (
                      <div className="mt-2 p-3 rounded bg-green-50 text-green-900 text-sm whitespace-pre-line border border-green-200">
                        <b>Результат AXON:</b>
                        <div>{analysisResult}</div>
                        <div className="mt-3">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" onClick={applyAxonResult}>
                                  {language==='ru'?"Применить к I/K/R":"Apply to I/K/R"}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {language==='ru' ? 'Распределить результат по секциям I/K/R' : 'Distribute result into I/K/R sections'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    )}
                    {analysisError && (
                      <div className="mt-2 p-3 rounded bg-red-50 text-red-900 text-sm border border-red-200">
                        <b>Ошибка AXON:</b> {analysisError}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* IKR Components */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {currentAnalysisData.components.map(component => (
                <Card key={component.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {getComponentIcon(component.type)}
                        </div>
                        <div>
                          <CardTitle className="text-base">{component.title}</CardTitle>
                          <CardDescription className="text-xs">
                            {t(`${component.type}Desc`)}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => _setIsEditingComponent(component.id)}
                      >
                        <PencilSimple size={14} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(component.status)}>
                        {t(component.status)}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(component.priority)}>
                        {t(component.priority)}
                      </Badge>
                    </div>

                    <div>
                      <Progress value={component.completeness} className="w-full" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {component.completeness}% {t('completed')}
                      </p>
                    </div>

                    {component.content && (
                      <div className="text-sm text-muted-foreground line-clamp-3">
                        {component.content}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* IKR Tools Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{language==='ru' ? 'Инструменты IKR' : 'IKR Tools'}</CardTitle>
                <CardDescription>
                  {language==='ru' ? 'Связанные модули: сбор разведданных, анкета Киплинга, когнитивный анализ, микро-задачи' : 'Related modules: intelligence gathering, Kipling questionnaire, cognitive analysis, micro-tasks'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Intelligence Gathering */}
                <div className="border rounded p-4">
                  <IntelligenceGathering
                    language={language}
                    projectId={projectId}
                    onIntelligenceGathered={(data) => {
                      const text = typeof data === 'string' ? data : JSON.stringify(data)
                      updateIKRComponentByType('intelligence', text)
                      toast.success(language==='ru' ? 'Разведданные собраны' : 'Intelligence gathered')
                    }}
                    onGapIdentified={(gap) => {
                      toast.info((language==='ru' ? 'Выявлен разрыв: ' : 'Gap identified: ') + gap.area)
                    }}
                  />
                </div>

                {/* Kipling Questionnaire */}
                <div className="border rounded p-4">
                  <KiplingQuestionnaire
                    language={language}
                    onQuestionnaireComplete={(data) => {
                      const text = typeof data === 'string' ? data : JSON.stringify(data)
                      updateIKRComponentByType('knowledge', text)
                      toast.success(language==='ru' ? 'Анкета Киплинга завершена' : 'Kipling questionnaire completed')
                    }}
                    onProgressUpdate={(_progress) => {}}
                  />
                </div>

                {/* Advanced Cognitive Analysis */}
                <div className="border rounded p-4">
                  <AdvancedCognitiveAnalysis
                    language={language}
                    projectId={projectId}
                    onAnalysisCompleted={(session) => {
                      const summary = [
                        ...(session.insights || []).map(s => `• ${s}`),
                        ...(session.recommendations || []).map(r => `→ ${r}`),
                        `confidence: ${session.confidence}%`
                      ].join('\n')
                      updateIKRComponentByType('reasoning', summary)
                    }}
                  />
                </div>

                {/* Micro Task Executor */}
                <div className="border rounded p-4">
                  <MicroTaskExecutor
                    language={language}
                    projectId={projectId}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default IKRDirectivePage;