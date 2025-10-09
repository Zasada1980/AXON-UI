import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
// import { Separator } from '@/components/ui/separator';
import { Users, Shield, Brain, FileText, Calendar, Clock, TrendUp, CheckCircle, Warning, Star, ArrowRight, Lightbulb } from '@phosphor-icons/react';
import { axon } from '@/services/axonAdapter'
import { toast } from 'sonner'

interface ProjectDashboardProps {
  language: 'en' | 'ru';
  project: any;
  onNavigate: (page: string) => void;
  systemHealth?: {
    overall: number;
    components: {
      storage: number;
      ai: number;
      ui: number;
      memory: number;
    };
    issues: string[];
  };
  calculateCompleteness: (project: any) => number;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  language,
  project,
  onNavigate,
  systemHealth,
  calculateCompleteness
}) => {
  const t = (key: string) => {
    const translations: Record<string, { en: string; ru: string }> = {
      // Dashboard titles
      projectDashboard: { en: 'Project Dashboard', ru: 'Панель Проекта' },
      analyticsOverview: { en: 'Analytics Overview', ru: 'Обзор Аналитики' },
      quickActions: { en: 'Quick Actions', ru: 'Быстрые Действия' },
      progressStatus: { en: 'Progress Status', ru: 'Статус Прогресса' },
      systemStatus: { en: 'System Status', ru: 'Статус Системы' },
      recentActivity: { en: 'Recent Activity', ru: 'Недавняя Активность' },
      
      // Metrics
      projectHealth: { en: 'Project Health', ru: 'Здоровье Проекта' },
      activeInsights: { en: 'Active Insights', ru: 'Активные Выводы' },
      aiAudits: { en: 'AI Audits', ru: 'ИИ Аудиты' },
      systemHealth: { en: 'System Health', ru: 'Здоровье Системы' },
      completed: { en: 'completed', ru: 'завершено' },
      
      // Progress sections
      kiplingDimensions: { en: 'Kipling Dimensions', ru: 'Измерения Киплинга' },
      ikrDirective: { en: 'IKR Directive', ru: 'Директива IKR' },
      generatedInsights: { en: 'Generated Insights', ru: 'Созданные Выводы' },
      
      // Actions
      startAnalysis: { en: 'Start Analysis', ru: 'Начать Анализ' },
      continueWork: { en: 'Continue Work', ru: 'Продолжить Работу' },
      viewDetails: { en: 'View Details', ru: 'Подробнее' },
      runAudit: { en: 'Run Audit', ru: 'Запустить Аудит' },
      openChat: { en: 'Open AI Chat', ru: 'Открыть ИИ Чат' },
      openReports: { en: 'Project Reports', ru: 'Отчеты Проекта' },
      
      // Status messages
      allSystemsOperational: { en: 'All Systems Operational', ru: 'Все Системы Работают' },
      warningDetected: { en: 'Warning Detected', ru: 'Обнаружено Предупреждение' },
      issuesDetected: { en: 'Issues Detected', ru: 'Обнаружены Проблемы' },
      
      // Activity
      lastModified: { en: 'Last Modified', ru: 'Последнее Изменение' },
      createdAt: { en: 'Created', ru: 'Создан' },
      nextSteps: { en: 'Recommended Next Steps', ru: 'Рекомендуемые Следующие Шаги' },
    };
    
    return translations[key]?.[language] || key;
  };

  const completeness = calculateCompleteness(project);
  const totalInsights = (project.dimensions || []).reduce((sum: number, d: any) => sum + ((d.insights || []).length), 0);
  const completedAudits = (project.auditSessions || []).filter((s: any) => s.status === 'completed').length;
  const completedDimensions = (project.dimensions || []).filter((d: any) => d.content && d.content.length > 0).length;
  const ikrCompleted = Object.values(project.ikrDirective).filter((v: any) => v.length > 50).length;

  const getNextSteps = (): Array<{
    title: string;
    action: () => void;
    priority: 'high' | 'medium' | 'low';
  }> => {
    const steps: Array<{
      title: string;
      action: () => void;
      priority: 'high' | 'medium' | 'low';
    }> = [];
    
    if (completedDimensions < 6) {
      steps.push({
        title: language === 'ru' ? 'Завершить анализ Киплинга' : 'Complete Kipling Analysis',
        action: () => onNavigate('kipling'),
        priority: 'high'
      });
    }
    
    if (ikrCompleted < 3) {
      steps.push({
        title: language === 'ru' ? 'Заполнить IKR директиву' : 'Fill IKR Directive',
        action: () => onNavigate('ikr'),
        priority: 'high'
      });
    }
    
    if (totalInsights < 5) {
      steps.push({
        title: language === 'ru' ? 'Сгенерировать больше выводов' : 'Generate More Insights',
        action: () => onNavigate('kipling'),
        priority: 'medium'
      });
    }
    
    if (completedAudits === 0) {
      steps.push({
        title: language === 'ru' ? 'Запустить ИИ аудит' : 'Run AI Audit',
        action: () => onNavigate('audit'),
        priority: 'medium'
      });
    }
    
    return steps;
  };

  const nextSteps = getNextSteps();
  const [isAxonChecking, setIsAxonChecking] = useState(false)
  const [axonOnline, setAxonOnline] = useState<boolean | null>(null)
  const checkAxon = async () => {
    setIsAxonChecking(true)
    try {
      const h = await axon.health()
      setAxonOnline(!!h.ok)
      toast[h.ok ? 'success' : 'error'](h.ok ? (language==='ru'?'AXON доступен':'AXON online') : (language==='ru'?'AXON недоступен':'AXON offline'))
    } catch {
      setAxonOnline(false)
      toast.error(language==='ru'?'AXON недоступен':'AXON offline')
    } finally {
      setIsAxonChecking(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with project info */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <p className="text-muted-foreground">{project.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{t('createdAt')}: {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{t('lastModified')}: {new Date(project.lastModified).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Progress value={completeness} className="w-32" />
          <Badge variant={completeness > 80 ? 'default' : 'secondary'} className="text-sm">
            {completeness}% {language === 'ru' ? 'готово' : 'complete'}
          </Badge>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('overview')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('projectHealth')}</p>
                <p className="text-2xl font-bold text-primary">{completeness}%</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                completeness >= 80 ? 'bg-green-500' :
                completeness >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AXON</p>
                <p className={`text-2xl font-bold ${axonOnline ? 'text-green-500' : axonOnline===false ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {axonOnline===null ? (language==='ru'?'не проверен':'unknown') : (axonOnline ? 'online' : 'offline')}
                </p>
              </div>
              <Shield size={16} className={axonOnline ? 'text-green-500' : 'text-muted-foreground'} />
            </div>
            <div className="mt-3">
              <Button size="sm" variant="outline" onClick={checkAxon} disabled={isAxonChecking}>
                {isAxonChecking ? (language==='ru'?'Проверка...':'Checking...') : (language==='ru'?'Проверить':'Check')}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('kipling')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('activeInsights')}</p>
                <p className="text-2xl font-bold text-accent">{totalInsights}</p>
              </div>
              <Brain size={16} className="text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('audit')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('aiAudits')}</p>
                <p className="text-2xl font-bold text-secondary">{completedAudits}</p>
              </div>
              <Shield size={16} className="text-secondary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('systemHealth')}</p>
                <p className="text-2xl font-bold text-green-500">{systemHealth?.overall || 100}%</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                (systemHealth?.overall || 100) >= 90 ? 'bg-green-500' :
                (systemHealth?.overall || 100) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              } ${(systemHealth?.overall || 100) < 100 ? 'animate-pulse' : ''}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendUp size={20} />
            {t('progressStatus')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t('kiplingDimensions')}</span>
                  <span>{completedDimensions}/6</span>
                </div>
                <Progress value={(completedDimensions / 6) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t('ikrDirective')}</span>
                  <span>{ikrCompleted}/3</span>
                </div>
                <Progress value={(ikrCompleted / 3) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t('generatedInsights')}</span>
                  <span>{totalInsights}</span>
                </div>
                <Progress value={Math.min(100, (totalInsights / 6) * 100)} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions and Next Steps */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star size={20} />
              {t('quickActions')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => onNavigate('intelligence')} className="w-full justify-start">
              <Lightbulb size={16} className="mr-2" />
              {t('startAnalysis')}
            </Button>
            <Button onClick={() => onNavigate('kipling')} variant="outline" className="w-full justify-start">
              <Users size={16} className="mr-2" />
              {completeness > 20 ? t('continueWork') : t('startAnalysis')}
            </Button>
            <Button onClick={() => onNavigate('audit')} variant="outline" className="w-full justify-start">
              <Shield size={16} className="mr-2" />
              {t('runAudit')}
            </Button>
            <Button onClick={() => onNavigate('reports')} variant="outline" className="w-full justify-start">
              <FileText size={16} className="mr-2" />
              {t('openReports')}
            </Button>
            <Button onClick={() => onNavigate('reports')} variant="outline" className="w-full justify-start">
              <FileText size={16} className="mr-2" />
              {t('openReports')}
            </Button>
            <Button onClick={() => onNavigate('chat')} variant="outline" className="w-full justify-start">
              <Brain size={16} className="mr-2" />
              {t('openChat')}
            </Button>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle size={20} />
              {t('nextSteps')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextSteps.length > 0 ? (
              <div className="space-y-3">
                {nextSteps.map((step, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={step.priority === 'high' ? 'default' : 'secondary'} className="text-xs">
                        {step.priority === 'high' ? (language === 'ru' ? 'Важно' : 'High') : (language === 'ru' ? 'Средне' : 'Medium')}
                      </Badge>
                      <span className="text-sm">{step.title}</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={step.action}>
                      <ArrowRight size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle size={32} className="mx-auto text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {language === 'ru' ? 'Все основные задачи выполнены!' : 'All main tasks completed!'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} />
              {t('systemStatus')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Storage</span>
                  <span className="text-sm font-medium">{systemHealth.components.storage}%</span>
                </div>
                <Progress value={systemHealth.components.storage} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">AI</span>
                  <span className="text-sm font-medium">{systemHealth.components.ai}%</span>
                </div>
                <Progress value={systemHealth.components.ai} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">UI</span>
                  <span className="text-sm font-medium">{systemHealth.components.ui}%</span>
                </div>
                <Progress value={systemHealth.components.ui} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Memory</span>
                  <span className="text-sm font-medium">{systemHealth.components.memory}%</span>
                </div>
                <Progress value={systemHealth.components.memory} className="h-2" />
              </div>
            </div>
            
            {systemHealth.issues.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Warning size={16} className="text-yellow-500" />
                  <span className="text-sm font-medium">{t('issuesDetected')}</span>
                </div>
                <ul className="space-y-1">
                  {systemHealth.issues.map((issue, index) => (
                    <li key={index} className="text-xs text-muted-foreground">• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectDashboard;