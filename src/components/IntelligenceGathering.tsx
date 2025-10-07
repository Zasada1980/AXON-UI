import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Database, 
  MagnifyingGlass, 
  Shield, 
  ChartLine, 
  Clock, 
  CheckCircle, 
  Warning,
  Info,
  Brain
} from '@phosphor-icons/react';

interface IntelligenceSource {
  id: string;
  name: string;
  type: 'primary' | 'secondary';
  reliability: number;
  lastUpdated: string;
  status: 'active' | 'inactive' | 'error';
  dataPoints: number;
  credibilityScore: number;
}

interface IntelligenceGap {
  id: string;
  area: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  suggestedSources: string[];
  estimatedResolution: string;
}

interface CollectionMethod {
  id: string;
  name: string;
  description: string;
  effectiveness: number;
  cost: 'low' | 'medium' | 'high';
  timeRequired: string;
  isActive: boolean;
}

interface Props {
  language: 'en' | 'ru';
  projectId: string;
  onIntelligenceGathered?: (data: any) => void;
  onGapIdentified?: (gap: IntelligenceGap) => void;
}

const IntelligenceGathering: React.FC<Props> = ({ 
  language, 
  projectId, 
  onIntelligenceGathered,
  onGapIdentified 
}) => {
  const [activeTab, setActiveTab] = useState('sources');
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectionProgress, setCollectionProgress] = useState(0);
  
  // Persistent storage for intelligence data
  const [sources, setSources] = useKV<IntelligenceSource[]>(`intel-sources-${projectId}`, []);
  const [gaps, setGaps] = useKV<IntelligenceGap[]>(`intel-gaps-${projectId}`, []);
  const [methods, setMethods] = useKV<CollectionMethod[]>(`intel-methods-${projectId}`, []);
  const [collectionLog, setCollectionLog] = useKV<any[]>(`intel-log-${projectId}`, []);

  // Translation helper
  const t = (key: string) => {
    const translations: Record<string, { en: string; ru: string }> = {
      intelligenceGathering: { en: 'Intelligence Gathering', ru: 'Сбор Разведданных' },
      dataSources: { en: 'Data Sources', ru: 'Источники Данных' },
      collectionMethods: { en: 'Collection Methods', ru: 'Методы Сбора' },
      informationGaps: { en: 'Information Gaps', ru: 'Информационные Пробелы' },
      collectionLog: { en: 'Collection Log', ru: 'Журнал Сбора' },
      startCollection: { en: 'Start Collection', ru: 'Начать Сбор' },
      stopCollection: { en: 'Stop Collection', ru: 'Остановить Сбор' },
      reliability: { en: 'Reliability', ru: 'Достоверность' },
      credibility: { en: 'Credibility', ru: 'Доверие' },
      primary: { en: 'Primary', ru: 'Первичный' },
      secondary: { en: 'Secondary', ru: 'Вторичный' },
      active: { en: 'Active', ru: 'Активен' },
      inactive: { en: 'Inactive', ru: 'Неактивен' },
      error: { en: 'Error', ru: 'Ошибка' },
      high: { en: 'High', ru: 'Высокий' },
      medium: { en: 'Medium', ru: 'Средний' },
      low: { en: 'Low', ru: 'Низкий' },
      effectiveness: { en: 'Effectiveness', ru: 'Эффективность' },
      cost: { en: 'Cost', ru: 'Стоимость' },
      timeRequired: { en: 'Time Required', ru: 'Требуемое Время' },
      lastUpdated: { en: 'Last Updated', ru: 'Последнее Обновление' },
      dataPoints: { en: 'Data Points', ru: 'Точки Данных' },
      suggestedSources: { en: 'Suggested Sources', ru: 'Предлагаемые Источники' },
      estimatedResolution: { en: 'Estimated Resolution', ru: 'Предполагаемое Решение' },
      collectionInProgress: { en: 'Collection in Progress', ru: 'Сбор в Процессе' },
      analysisComplete: { en: 'Analysis Complete', ru: 'Анализ Завершен' }
    };
    return translations[key]?.[language] || key;
  };

  // Initialize default sources and methods
  useEffect(() => {
    if (!sources || sources.length === 0) {
      const defaultSources: IntelligenceSource[] = [
        {
          id: 'source-1',
          name: language === 'ru' ? 'Анализ кодовой базы' : 'Codebase Analysis',
          type: 'primary',
          reliability: 95,
          lastUpdated: new Date().toISOString(),
          status: 'active',
          dataPoints: 1247,
          credibilityScore: 98
        },
        {
          id: 'source-2',
          name: language === 'ru' ? 'Архитектура UI' : 'UI Architecture',
          type: 'primary',
          reliability: 90,
          lastUpdated: new Date().toISOString(),
          status: 'active',
          dataPoints: 856,
          credibilityScore: 92
        },
        {
          id: 'source-3',
          name: language === 'ru' ? 'Паттерны использования' : 'Usage Patterns',
          type: 'secondary',
          reliability: 75,
          lastUpdated: new Date().toISOString(),
          status: 'inactive',
          dataPoints: 423,
          credibilityScore: 78
        }
      ];
      setSources(defaultSources);
    }

    if (!methods || methods.length === 0) {
      const defaultMethods: CollectionMethod[] = [
        {
          id: 'method-1',
          name: language === 'ru' ? 'Статический анализ кода' : 'Static Code Analysis',
          description: language === 'ru' ? 'Автоматический анализ структуры и качества кода' : 'Automated analysis of code structure and quality',
          effectiveness: 85,
          cost: 'low',
          timeRequired: language === 'ru' ? '2-4 часа' : '2-4 hours',
          isActive: true
        },
        {
          id: 'method-2',
          name: language === 'ru' ? 'Анализ зависимостей' : 'Dependency Analysis',
          description: language === 'ru' ? 'Изучение внешних зависимостей и интеграций' : 'Study of external dependencies and integrations',
          effectiveness: 70,
          cost: 'medium',
          timeRequired: language === 'ru' ? '1-2 дня' : '1-2 days',
          isActive: true
        },
        {
          id: 'method-3',
          name: language === 'ru' ? 'Пользовательское тестирование' : 'User Testing',
          description: language === 'ru' ? 'Прямое наблюдение за использованием системы' : 'Direct observation of system usage',
          effectiveness: 95,
          cost: 'high',
          timeRequired: language === 'ru' ? '1-2 недели' : '1-2 weeks',
          isActive: false
        }
      ];
      setMethods(defaultMethods);
    }

    if (!gaps || gaps.length === 0) {
      const defaultGaps: IntelligenceGap[] = [
        {
          id: 'gap-1',
          area: language === 'ru' ? 'Метрики производительности' : 'Performance Metrics',
          description: language === 'ru' ? 'Отсутствуют данные о производительности в реальных условиях' : 'Missing real-world performance data',
          priority: 'high',
          suggestedSources: [
            language === 'ru' ? 'Мониторинг производительности' : 'Performance monitoring',
            language === 'ru' ? 'Пользовательская аналитика' : 'User analytics'
          ],
          estimatedResolution: language === 'ru' ? '1-2 недели' : '1-2 weeks'
        },
        {
          id: 'gap-2',
          area: language === 'ru' ? 'Пользовательское поведение' : 'User Behavior',
          description: language === 'ru' ? 'Нет данных о том, как пользователи взаимодействуют с системой' : 'No data on how users interact with the system',
          priority: 'medium',
          suggestedSources: [
            language === 'ru' ? 'Аналитика использования' : 'Usage analytics',
            language === 'ru' ? 'Пользовательские интервью' : 'User interviews'
          ],
          estimatedResolution: language === 'ru' ? '2-3 недели' : '2-3 weeks'
        }
      ];
      setGaps(defaultGaps);
    }
  }, [language, sources?.length, methods?.length, gaps?.length, setSources, setMethods, setGaps]);

  // Start intelligence collection process
  const startCollection = async () => {
    setIsCollecting(true);
    setCollectionProgress(0);

    const activeMethods = methods?.filter(m => m.isActive) || [];
    const progressStep = 100 / activeMethods.length;

    for (let i = 0; i < activeMethods.length; i++) {
      const method = activeMethods[i];
      
      // Simulate collection process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const logEntry = {
        id: `log-${Date.now()}-${i}`,
        timestamp: new Date().toISOString(),
        method: method.name,
        status: 'completed',
        dataCollected: Math.floor(Math.random() * 100) + 50,
        findings: [
          language === 'ru' 
            ? `Обнаружено ${Math.floor(Math.random() * 20) + 5} потенциальных улучшений`
            : `Found ${Math.floor(Math.random() * 20) + 5} potential improvements`,
          language === 'ru'
            ? `Выявлено ${Math.floor(Math.random() * 10) + 2} области для оптимизации`
            : `Identified ${Math.floor(Math.random() * 10) + 2} optimization areas`
        ]
      };

      setCollectionLog(current => [...(current || []), logEntry]);
      setCollectionProgress((i + 1) * progressStep);

      if (onIntelligenceGathered) {
        onIntelligenceGathered(logEntry);
      }
    }

    setIsCollecting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MagnifyingGlass size={24} className="text-primary" />
            {t('intelligenceGathering')}
          </CardTitle>
          <CardDescription>
            {language === 'ru' 
              ? 'Систематический сбор и оценка информации для анализа'
              : 'Systematic collection and assessment of information for analysis'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Activity size={16} />
                <span className="text-sm text-muted-foreground">
                  {sources?.filter(s => s.status === 'active').length || 0} / {sources?.length || 0} {t('active').toLowerCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Database size={16} />
                <span className="text-sm text-muted-foreground">
                  {sources?.reduce((sum, s) => sum + s.dataPoints, 0) || 0} {t('dataPoints').toLowerCase()}
                </span>
              </div>
            </div>
            
            <Button 
              onClick={startCollection}
              disabled={isCollecting}
              className="flex items-center gap-2"
            >
              {isCollecting ? (
                <>
                  <Clock size={16} className="animate-spin" />
                  {t('collectionInProgress')}
                </>
              ) : (
                <>
                  <MagnifyingGlass size={16} />
                  {t('startCollection')}
                </>
              )}
            </Button>
          </div>

          {isCollecting && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t('collectionInProgress')}</span>
                <span className="text-sm text-muted-foreground">{Math.round(collectionProgress)}%</span>
              </div>
              <Progress value={collectionProgress} className="h-2" />
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sources">{t('dataSources')}</TabsTrigger>
              <TabsTrigger value="methods">{t('collectionMethods')}</TabsTrigger>
              <TabsTrigger value="gaps">{t('informationGaps')}</TabsTrigger>
              <TabsTrigger value="log">{t('collectionLog')}</TabsTrigger>
            </TabsList>

            <TabsContent value="sources" className="space-y-4">
              <div className="grid gap-4">
                {sources?.map(source => (
                  <Card key={source.id} className="cyber-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(source.status)}`} />
                          <h4 className="font-medium">{source.name}</h4>
                          <Badge variant={source.type === 'primary' ? 'default' : 'secondary'}>
                            {t(source.type)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Shield size={14} />
                          {source.credibilityScore}%
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">{t('reliability')}: </span>
                          <span className="font-medium">{source.reliability}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t('dataPoints')}: </span>
                          <span className="font-medium">{source.dataPoints.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t('lastUpdated')}: </span>
                          <span className="font-medium">
                            {new Date(source.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="methods" className="space-y-4">
              <div className="grid gap-4">
                {methods?.map(method => (
                  <Card key={method.id} className="cyber-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <ChartLine size={20} className="text-primary" />
                          <h4 className="font-medium">{method.name}</h4>
                          {method.isActive && (
                            <Badge variant="default">{t('active')}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{t('effectiveness')}: {method.effectiveness}%</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">{t('cost')}: </span>
                          <Badge variant="outline">{t(method.cost)}</Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t('timeRequired')}: </span>
                          <span className="font-medium">{method.timeRequired}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="gaps" className="space-y-4">
              <div className="grid gap-4">
                {gaps?.map(gap => (
                  <Card key={gap.id} className="cyber-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Warning size={20} className="text-warning" />
                          <h4 className="font-medium">{gap.area}</h4>
                          <Badge variant={getPriorityColor(gap.priority) as any}>
                            {t(gap.priority)}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onGapIdentified?.(gap)}
                        >
                          <Brain size={14} className="mr-2" />
                          {language === 'ru' ? 'Анализ' : 'Analyze'}
                        </Button>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{gap.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">{t('suggestedSources')}: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {gap.suggestedSources.map((source, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {source}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t('estimatedResolution')}: </span>
                          <span className="font-medium">{gap.estimatedResolution}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="log" className="space-y-4">
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {!collectionLog || collectionLog.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Info size={32} className="mx-auto mb-2 opacity-50" />
                      <p>{language === 'ru' ? 'Журнал сбора пуст' : 'Collection log is empty'}</p>
                    </div>
                  ) : (
                    (collectionLog || []).slice().reverse().map(entry => (
                      <Card key={entry.id} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-500" />
                            <span className="font-medium text-sm">{entry.method}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {entry.findings.map((finding: string, i: number) => (
                            <p key={i} className="text-xs text-muted-foreground">• {finding}</p>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {language === 'ru' ? 'Собрано данных' : 'Data collected'}: {entry.dataCollected}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligenceGathering;