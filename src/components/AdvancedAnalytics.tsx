import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// removed unused Badge import
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendUp, 
  TrendDown,
  Clock, 
  CheckCircle, 
  Warning,
  Target,
  ChartLine,
  Download,
  ArrowsCounterClockwise,
  FileText
} from '@phosphor-icons/react';
import { toast } from 'sonner';

type Language = 'en' | 'ru';

interface VelocityMetric {
  period: string;
  tasksCompleted: number;
  storyPoints: number;
  avgTaskTime: number;
  blockers: number;
}

interface QualityMetric {
  testCoverage: number;
  bugDensity: number;
  codeQuality: number;
  performanceScore: number;
  securityScore: number;
}

interface ProductivityMetric {
  focusTime: number;
  interruptions: number;
  multitasking: number;
  deepWorkSessions: number;
  efficiency: number;
}

interface BurndownData {
  date: string;
  planned: number;
  actual: number;
  scope: number;
}

interface AnalyticsData {
  velocity: VelocityMetric[];
  quality: QualityMetric;
  productivity: ProductivityMetric;
  burndown: BurndownData[];
  trends: {
    velocityTrend: number;
    qualityTrend: number;
    productivityTrend: number;
  };
}

interface AdvancedAnalyticsProps {
  language: Language;
  projectId: string;
  onReportGenerated?: (report: any) => void;
}

const translations = {
  // Main titles
  advancedAnalytics: { en: 'Advanced Analytics', ru: 'Расширенная Аналитика' },
  performanceMetrics: { en: 'Performance Metrics', ru: 'Метрики Производительности' },
  qualityMetrics: { en: 'Quality Metrics', ru: 'Метрики Качества' },
  velocityTracking: { en: 'Velocity Tracking', ru: 'Отслеживание Скорости' },
  burndownChart: { en: 'Burndown Chart', ru: 'График Сгорания' },
  trendAnalysis: { en: 'Trend Analysis', ru: 'Анализ Трендов' },
  
  // Metrics
  tasksCompleted: { en: 'Tasks Completed', ru: 'Задач Выполнено' },
  storyPoints: { en: 'Story Points', ru: 'Story Points' },
  avgTaskTime: { en: 'Avg Task Time', ru: 'Среднее Время Задачи' },
  blockers: { en: 'Blockers', ru: 'Блокеры' },
  testCoverage: { en: 'Test Coverage', ru: 'Покрытие Тестами' },
  bugDensity: { en: 'Bug Density', ru: 'Плотность Багов' },
  codeQuality: { en: 'Code Quality', ru: 'Качество Кода' },
  performanceScore: { en: 'Performance Score', ru: 'Оценка Производительности' },
  securityScore: { en: 'Security Score', ru: 'Оценка Безопасности' },
  focusTime: { en: 'Focus Time', ru: 'Время Фокуса' },
  interruptions: { en: 'Interruptions', ru: 'Прерывания' },
  deepWorkSessions: { en: 'Deep Work Sessions', ru: 'Сессии Глубокой Работы' },
  efficiency: { en: 'Efficiency', ru: 'Эффективность' },
  
  // Time periods
  lastWeek: { en: 'Last Week', ru: 'Последняя Неделя' },
  lastMonth: { en: 'Last Month', ru: 'Последний Месяц' },
  lastQuarter: { en: 'Last Quarter', ru: 'Последний Квартал' },
  
  // Trends
  increasing: { en: 'Increasing', ru: 'Растет' },
  decreasing: { en: 'Decreasing', ru: 'Снижается' },
  stable: { en: 'Stable', ru: 'Стабильно' },
  
  // Actions
  generateReport: { en: 'Generate Report', ru: 'Создать Отчет' },
  exportData: { en: 'Export Data', ru: 'Экспорт Данных' },
  refreshData: { en: 'Refresh Data', ru: 'Обновить Данные' },
  viewDetails: { en: 'View Details', ru: 'Подробнее' },
  
  // Labels
  hours: { en: 'hours', ru: 'часов' },
  minutes: { en: 'minutes', ru: 'минут' },
  days: { en: 'days', ru: 'дней' },
  tasks: { en: 'tasks', ru: 'задач' },
  
  // Messages
  dataRefreshed: { en: 'Analytics data refreshed', ru: 'Данные аналитики обновлены' },
  reportGenerated: { en: 'Report generated successfully', ru: 'Отчет успешно создан' },
  dataExported: { en: 'Data exported successfully', ru: 'Данные успешно экспортированы' },
  
  // Insights
  velocityInsight: { en: 'Team velocity is trending upward', ru: 'Скорость команды растет' },
  qualityInsight: { en: 'Code quality metrics are stable', ru: 'Метрики качества кода стабильны' },
  productivityInsight: { en: 'Focus time has increased by 15%', ru: 'Время фокуса увеличилось на 15%' },
  
  // Recommendations
  recommendations: { en: 'Recommendations', ru: 'Рекомендации' },
  velocityRec: { en: 'Consider breaking down larger tasks', ru: 'Рассмотрите разбиение крупных задач' },
  qualityRec: { en: 'Increase test coverage to 90%+', ru: 'Увеличьте покрытие тестами до 90%+' },
  productivityRec: { en: 'Schedule more deep work sessions', ru: 'Запланируйте больше сессий глубокой работы' }
};

const useTranslation = (language: Language) => {
  return (key: string): string => {
    return translations[key]?.[language] || key;
  };
};

export default function AdvancedAnalytics({ 
  language, 
  projectId,
  onReportGenerated
}: AdvancedAnalyticsProps) {
  const t = useTranslation(language);
  
  // Default data structure
  const defaultAnalyticsData: AnalyticsData = {
    velocity: [],
    quality: {
      testCoverage: 75,
      bugDensity: 2.1,
      codeQuality: 85,
      performanceScore: 90,
      securityScore: 88
    },
    productivity: {
      focusTime: 6.5,
      interruptions: 12,
      multitasking: 25,
      deepWorkSessions: 3,
      efficiency: 82
    },
    burndown: [],
    trends: {
      velocityTrend: 8.5,
      qualityTrend: -2.1,
      productivityTrend: 15.3
    }
  };
  
  // Persistent storage
  const [analyticsData, setAnalyticsData] = useKV<AnalyticsData>(`analytics-${projectId}`, defaultAnalyticsData);
  
  // UI state
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeMetric, setActiveMetric] = useState<'velocity' | 'quality' | 'productivity'>('velocity');
  
  // Generate sample data for demonstration
  const generateSampleData = (): AnalyticsData => {
    const velocity: VelocityMetric[] = [];
    const burndown: BurndownData[] = [];
    
    // Generate velocity data for last 12 weeks
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i * 7);
      
      velocity.push({
        period: date.toISOString().split('T')[0],
        tasksCompleted: Math.floor(Math.random() * 20) + 10,
        storyPoints: Math.floor(Math.random() * 50) + 25,
        avgTaskTime: Math.random() * 4 + 2,
        blockers: Math.floor(Math.random() * 5)
      });
    }
    
    // Generate burndown data for current sprint (14 days)
    let remainingWork = 100;
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      
      const idealProgress = 100 - (i / 13 * 100);
      const actualProgress = remainingWork - (Math.random() * 10 + 2);
      remainingWork = Math.max(0, actualProgress);
      
      burndown.push({
        date: date.toISOString().split('T')[0],
        planned: idealProgress,
        actual: remainingWork,
        scope: 100 + (Math.random() * 10 - 5) // Scope changes
      });
    }
    
    return {
      velocity,
      quality: {
        testCoverage: Math.random() * 20 + 70,
        bugDensity: Math.random() * 3 + 1,
        codeQuality: Math.random() * 20 + 75,
        performanceScore: Math.random() * 15 + 85,
        securityScore: Math.random() * 20 + 75
      },
      productivity: {
        focusTime: Math.random() * 3 + 5,
        interruptions: Math.floor(Math.random() * 20) + 5,
        multitasking: Math.random() * 30 + 15,
        deepWorkSessions: Math.floor(Math.random() * 4) + 2,
        efficiency: Math.random() * 25 + 70
      },
      burndown,
      trends: {
        velocityTrend: (Math.random() - 0.5) * 20,
        qualityTrend: (Math.random() - 0.5) * 15,
        productivityTrend: (Math.random() - 0.5) * 25
      }
    };
  };
  
  // Initialize with sample data if not exists
  useEffect(() => {
    if (!analyticsData || !analyticsData.velocity || !Array.isArray(analyticsData.velocity) || analyticsData.velocity.length === 0) {
      const sampleData = generateSampleData();
      setAnalyticsData(sampleData);
    }
  }, [analyticsData, setAnalyticsData]);
  
  // Refresh analytics data
  const refreshData = async () => {
    setIsRefreshing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newData = generateSampleData();
    setAnalyticsData(newData);
    
    setIsRefreshing(false);
    toast.success(t('dataRefreshed'));
  };
  
  // Generate detailed report
  const generateReport = () => {
    if (!analyticsData) {
      toast.error('No analytics data available');
      return;
    }
    
    const report = {
      timestamp: new Date().toISOString(),
      projectId,
      period: selectedPeriod,
      data: analyticsData,
      insights: [
        t('velocityInsight'),
        t('qualityInsight'),
        t('productivityInsight')
      ],
      recommendations: [
        t('velocityRec'),
        t('qualityRec'),
        t('productivityRec')
      ]
    };
    
    if (onReportGenerated) {
      onReportGenerated(report);
    }
    
    // Create downloadable report
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${projectId}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(t('reportGenerated'));
  };
  
  // Export raw data
  const exportData = () => {
    if (!analyticsData?.velocity || !Array.isArray(analyticsData.velocity)) {
      toast.error('No velocity data available to export');
      return;
    }
    
    const csvData = analyticsData.velocity.map(v => 
      `${v.period},${v.tasksCompleted},${v.storyPoints},${v.avgTaskTime},${v.blockers}`
    ).join('\n');
    
    const blob = new Blob([`Period,Tasks,Points,AvgTime,Blockers\n${csvData}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-data-${projectId}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(t('dataExported'));
  };
  
  // Get trend icon and color
  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <TrendUp className="text-green-500" size={16} />;
    if (trend < -5) return <TrendDown className="text-red-500" size={16} />;
    return <div className="w-4 h-4" />; // placeholder for stable
  };
  
  // Safely get recent velocity metrics
  const getRecentVelocity = () => {
    if (!analyticsData?.velocity || !Array.isArray(analyticsData.velocity)) {
      return [];
    }
    return analyticsData.velocity.slice(-4);
  };
  
  const recentVelocity = getRecentVelocity();
  const avgVelocity = recentVelocity.length > 0 ? recentVelocity.reduce((sum, v) => sum + v.tasksCompleted, 0) / recentVelocity.length : 0;
  const avgStoryPoints = recentVelocity.length > 0 ? recentVelocity.reduce((sum, v) => sum + v.storyPoints, 0) / recentVelocity.length : 0;
  
  // Safety check for analytics data
  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-muted-foreground">Loading analytics data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ChartLine size={24} className="text-primary" />
                {t('advancedAnalytics')}
              </CardTitle>
              <CardDescription>
                {t('performanceMetrics')}
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={selectedPeriod} onValueChange={(value: 'week' | 'month' | 'quarter') => setSelectedPeriod(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">{t('lastWeek')}</SelectItem>
                  <SelectItem value="month">{t('lastMonth')}</SelectItem>
                  <SelectItem value="quarter">{t('lastQuarter')}</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
                <ArrowsCounterClockwise size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {t('refreshData')}
              </Button>
              
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download size={16} className="mr-2" />
                {t('exportData')}
              </Button>
              
              <Button size="sm" onClick={generateReport}>
                <FileText size={16} className="mr-2" />
                {t('generateReport')}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Key Metrics Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('tasksCompleted')}</p>
                    <p className="text-2xl font-bold">{Math.round(avgVelocity)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {getTrendIcon(analyticsData?.trends?.velocityTrend || 0)}
                      <span className="text-xs text-muted-foreground">
                        {Math.abs(analyticsData?.trends?.velocityTrend || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Target size={32} className="text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('storyPoints')}</p>
                    <p className="text-2xl font-bold">{Math.round(avgStoryPoints)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {getTrendIcon((analyticsData?.trends?.velocityTrend || 0) * 0.8)}
                      <span className="text-xs text-muted-foreground">
                        {Math.abs((analyticsData?.trends?.velocityTrend || 0) * 0.8).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <ChartLine size={32} className="text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('testCoverage')}</p>
                    <p className="text-2xl font-bold">{Math.round(analyticsData?.quality?.testCoverage || 0)}%</p>
                    <div className="flex items-center gap-1 mt-1">
                      {getTrendIcon(analyticsData?.trends?.qualityTrend || 0)}
                      <span className="text-xs text-muted-foreground">
                        {Math.abs(analyticsData?.trends?.qualityTrend || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <CheckCircle size={32} className="text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('efficiency')}</p>
                    <p className="text-2xl font-bold">{Math.round(analyticsData?.productivity?.efficiency || 0)}%</p>
                    <div className="flex items-center gap-1 mt-1">
                      {getTrendIcon(analyticsData?.trends?.productivityTrend || 0)}
                      <span className="text-xs text-muted-foreground">
                        {Math.abs(analyticsData?.trends?.productivityTrend || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <TrendUp size={32} className="text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Separator className="my-6" />
          
          {/* Detailed Metrics Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeMetric === 'velocity' ? 'default' : 'outline'}
              onClick={() => setActiveMetric('velocity')}
            >
              {t('velocityTracking')}
            </Button>
            <Button
              variant={activeMetric === 'quality' ? 'default' : 'outline'}
              onClick={() => setActiveMetric('quality')}
            >
              {t('qualityMetrics')}
            </Button>
            <Button
              variant={activeMetric === 'productivity' ? 'default' : 'outline'}
              onClick={() => setActiveMetric('productivity')}
            >
              {t('performanceMetrics')}
            </Button>
          </div>
          
          {/* Velocity Metrics */}
          {activeMetric === 'velocity' && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t('velocityTracking')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array.isArray(recentVelocity) && recentVelocity.map((v, index) => (
                        <div key={v.period} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Week {index + 1}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(v.period).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{v.tasksCompleted} {t('tasks')}</p>
                            <p className="text-xs text-muted-foreground">{v.storyPoints} points</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t('burndownChart')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {analyticsData?.burndown?.slice(-1)[0]?.actual || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Remaining work units
                        </p>
                      </div>
                      <Progress 
                        value={100 - (analyticsData?.burndown?.slice(-1)[0]?.actual || 0)} 
                        className="h-3"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Start</span>
                        <span>Current</span>
                        <span>Target</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {/* Quality Metrics */}
          {activeMetric === 'quality' && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{t('testCoverage')}</span>
                      <span className="text-lg font-bold">{Math.round(analyticsData?.quality?.testCoverage || 0)}%</span>
                    </div>
                    <Progress value={analyticsData?.quality?.testCoverage || 0} className="h-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{t('codeQuality')}</span>
                      <span className="text-lg font-bold">{Math.round(analyticsData?.quality?.codeQuality || 0)}%</span>
                    </div>
                    <Progress value={analyticsData?.quality?.codeQuality || 0} className="h-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{t('securityScore')}</span>
                      <span className="text-lg font-bold">{Math.round(analyticsData?.quality?.securityScore || 0)}%</span>
                    </div>
                    <Progress value={analyticsData?.quality?.securityScore || 0} className="h-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{t('performanceScore')}</span>
                      <span className="text-lg font-bold">{Math.round(analyticsData?.quality?.performanceScore || 0)}%</span>
                    </div>
                    <Progress value={analyticsData?.quality?.performanceScore || 0} className="h-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{t('bugDensity')}</span>
                      <span className="text-lg font-bold">{(analyticsData?.quality?.bugDensity || 0).toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">bugs per 1000 lines</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {/* Productivity Metrics */}
          {activeMetric === 'productivity' && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Focus & Deep Work</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('focusTime')}</span>
                      <span className="font-medium">{(analyticsData?.productivity?.focusTime || 0).toFixed(1)} {t('hours')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('deepWorkSessions')}</span>
                      <span className="font-medium">{analyticsData?.productivity?.deepWorkSessions || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('interruptions')}</span>
                      <span className="font-medium">{analyticsData?.productivity?.interruptions || 0}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Overall Efficiency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-primary">
                        {Math.round(analyticsData?.productivity?.efficiency || 0)}%
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Productivity efficiency score
                      </p>
                    </div>
                    <Progress value={analyticsData?.productivity?.efficiency || 0} className="h-3" />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          <Separator className="my-6" />
          
          {/* Insights and Recommendations */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5" />
                  <p className="text-sm">{t('velocityInsight')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Warning size={16} className="text-yellow-500 mt-0.5" />
                  <p className="text-sm">{t('qualityInsight')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <TrendUp size={16} className="text-blue-500 mt-0.5" />
                  <p className="text-sm">{t('productivityInsight')}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('recommendations')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Target size={16} className="text-primary mt-0.5" />
                  <p className="text-sm">{t('velocityRec')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-primary mt-0.5" />
                  <p className="text-sm">{t('qualityRec')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Clock size={16} className="text-primary mt-0.5" />
                  <p className="text-sm">{t('productivityRec')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}