import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Shield,
  Robot,
  CheckCircle,
  Warning,
  X,
  Clock,
  Play,
  Pause,
  Stop,
  Plus,
  Eye,
  ArrowRight,
  Target,
  Brain,
  ListChecks,
  Cpu,
  Bug
} from '@phosphor-icons/react';

interface AuditPageProps {
  language: 'en' | 'ru';
  projectId: string;
  onNavigate: (pageId: string) => void;
}

interface AuditAgent {
  id: string;
  name: string;
  role: 'primary' | 'secondary' | 'validator' | 'critic';
  model: 'gpt-4' | 'gpt-4-turbo' | 'claude-3' | 'gemini-pro' | 'local';
  status: 'idle' | 'running' | 'paused' | 'error' | 'completed';
  specialty: string;
  instructions: string;
  lastActivity: string;
  sessionsCompleted: number;
  successRate: number;
}

interface AuditSession {
  id: string;
  title: string;
  description: string;
  participants: string[]; // Agent IDs
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  results: AuditResult[];
  metrics: {
    duration: number;
    consensusReached: boolean;
    confidenceLevel: number;
    criticalIssuesFound: number;
  };
}

interface AuditResult {
  id: string;
  agentId: string;
  category: 'security' | 'performance' | 'logic' | 'compliance' | 'quality';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
  timestamp: string;
}

const AuditPage: React.FC<AuditPageProps> = ({
  language,
  projectId,
  onNavigate
}) => {
  // Persistent storage
  const [auditAgents, setAuditAgents] = useKV<AuditAgent[]>(`audit-agents-${projectId}`, []);
  const [auditSessions, setAuditSessions] = useKV<AuditSession[]>(`audit-sessions-${projectId}`, []);
  
  // UI state
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'agents' | 'sessions' | 'results'>('agents');
  
  // Form state
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentRole, setNewAgentRole] = useState<'primary' | 'secondary' | 'validator' | 'critic'>('primary');
  const [newAgentModel, setNewAgentModel] = useState<'gpt-4' | 'gpt-4-turbo' | 'claude-3' | 'gemini-pro' | 'local'>('gpt-4');
  const [newAgentSpecialty, setNewAgentSpecialty] = useState('');
  const [newAgentInstructions, setNewAgentInstructions] = useState('');

  // Translations
  const t = (key: string): string => {
    const translations: Record<string, { en: string; ru: string }> = {
      // Page header
      aiAudit: { en: 'AI Audit', ru: 'ИИ Аудит' },
      auditDescription: { en: 'Automated AI agent auditing and validation system', ru: 'Система автоматизированного аудита и валидации ИИ агентов' },
      
      // Navigation
      agents: { en: 'Agents', ru: 'Агенты' },
      sessions: { en: 'Sessions', ru: 'Сессии' },
      results: { en: 'Results', ru: 'Результаты' },
      
      // Agent roles
      primary: { en: 'Primary', ru: 'Основной' },
      secondary: { en: 'Secondary', ru: 'Вторичный' },
      validator: { en: 'Validator', ru: 'Валидатор' },
      critic: { en: 'Critic', ru: 'Критик' },
      
      // Status
      idle: { en: 'Idle', ru: 'Ожидание' },
      running: { en: 'Running', ru: 'Работает' },
      paused: { en: 'Paused', ru: 'Приостановлен' },
      error: { en: 'Error', ru: 'Ошибка' },
      completed: { en: 'Completed', ru: 'Завершен' },
      pending: { en: 'Pending', ru: 'Ожидает' },
      failed: { en: 'Failed', ru: 'Провален' },
      
      // Severity
      critical: { en: 'Critical', ru: 'Критично' },
      high: { en: 'High', ru: 'Высокий' },
      medium: { en: 'Medium', ru: 'Средний' },
      low: { en: 'Low', ru: 'Низкий' },
      info: { en: 'Info', ru: 'Инфо' },
      
      // Categories
      security: { en: 'Security', ru: 'Безопасность' },
      performance: { en: 'Performance', ru: 'Производительность' },
      logic: { en: 'Logic', ru: 'Логика' },
      compliance: { en: 'Compliance', ru: 'Соответствие' },
      quality: { en: 'Quality', ru: 'Качество' },
      
      // Actions
      newAgent: { en: 'New Agent', ru: 'Новый Агент' },
      newSession: { en: 'New Session', ru: 'Новая Сессия' },
      createAgent: { en: 'Create Agent', ru: 'Создать Агента' },
      createSession: { en: 'Create Session', ru: 'Создать Сессию' },
      startAudit: { en: 'Start Audit', ru: 'Начать Аудит' },
      pauseAudit: { en: 'Pause Audit', ru: 'Приостановить Аудит' },
      stopAudit: { en: 'Stop Audit', ru: 'Остановить Аудит' },
      viewResults: { en: 'View Results', ru: 'Посмотреть Результаты' },
      
      // Form fields
      agentName: { en: 'Agent Name', ru: 'Имя Агента' },
      role: { en: 'Role', ru: 'Роль' },
      model: { en: 'AI Model', ru: 'ИИ Модель' },
      specialty: { en: 'Specialty', ru: 'Специализация' },
      instructions: { en: 'Instructions', ru: 'Инструкции' },
      sessionTitle: { en: 'Session Title', ru: 'Название Сессии' },
      description: { en: 'Description', ru: 'Описание' },
      participants: { en: 'Participants', ru: 'Участники' },
      
      // Messages
      agentCreated: { en: 'Audit agent created successfully', ru: 'Аудиторский агент успешно создан' },
      sessionCreated: { en: 'Audit session created successfully', ru: 'Аудиторская сессия успешно создана' },
      nameRequired: { en: 'Name is required', ru: 'Имя обязательно' },
      
      // Metrics
      successRate: { en: 'Success Rate', ru: 'Уровень Успеха' },
      sessionsCompleted: { en: 'Sessions Completed', ru: 'Сессий Завершено' },
      consensusReached: { en: 'Consensus Reached', ru: 'Консенсус Достигнут' },
      confidenceLevel: { en: 'Confidence Level', ru: 'Уровень Доверия' },
      criticalIssues: { en: 'Critical Issues', ru: 'Критичные Проблемы' },
      duration: { en: 'Duration', ru: 'Длительность' },
      
      // Placeholder text
      agentNamePlaceholder: { en: 'Enter agent name', ru: 'Введите имя агента' },
      specialtyPlaceholder: { en: 'e.g., Security Analysis, Performance Testing', ru: 'например, Анализ Безопасности, Тестирование Производительности' },
      instructionsPlaceholder: { en: 'Detailed instructions for this agent...', ru: 'Подробные инструкции для этого агента...' },
      sessionTitlePlaceholder: { en: 'Enter session title', ru: 'Введите название сессии' },
      descriptionPlaceholder: { en: 'What will be audited in this session?', ru: 'Что будет проверяться в этой сессии?' },
      
      save: { en: 'Save', ru: 'Сохранить' },
      cancel: { en: 'Cancel', ru: 'Отмена' }
    };
    
    return translations[key]?.[language] || key;
  };

  // Initialize default agents if none exist
  useEffect(() => {
    if (!auditAgents || auditAgents.length === 0) {
      const defaultAgents: AuditAgent[] = [
        {
          id: 'security-agent-1',
          name: language === 'ru' ? 'Агент Безопасности' : 'Security Agent',
          role: 'primary',
          model: 'gpt-4',
          status: 'idle',
          specialty: language === 'ru' ? 'Анализ уязвимостей и угроз безопасности' : 'Security vulnerability and threat analysis',
          instructions: language === 'ru' 
            ? 'Анализируй код и системы на предмет уязвимостей безопасности, потенциальных угроз и соответствия стандартам безопасности.'
            : 'Analyze code and systems for security vulnerabilities, potential threats, and compliance with security standards.',
          lastActivity: new Date().toISOString(),
          sessionsCompleted: 0,
          successRate: 100
        },
        {
          id: 'performance-agent-1',
          name: language === 'ru' ? 'Агент Производительности' : 'Performance Agent',
          role: 'secondary',
          model: 'claude-3',
          status: 'idle',
          specialty: language === 'ru' ? 'Оптимизация производительности и ресурсов' : 'Performance and resource optimization',
          instructions: language === 'ru'
            ? 'Оценивай производительность системы, выявляй узкие места и предлагай оптимизации.'
            : 'Evaluate system performance, identify bottlenecks, and suggest optimizations.',
          lastActivity: new Date().toISOString(),
          sessionsCompleted: 0,
          successRate: 100
        },
        {
          id: 'logic-validator-1',
          name: language === 'ru' ? 'Валидатор Логики' : 'Logic Validator',
          role: 'validator',
          model: 'gemini-pro',
          status: 'idle',
          specialty: language === 'ru' ? 'Проверка логической корректности' : 'Logical correctness validation',
          instructions: language === 'ru'
            ? 'Проверяй логическую корректность алгоритмов, выявляй противоречия и ошибки в рассуждениях.'
            : 'Validate logical correctness of algorithms, identify contradictions and reasoning errors.',
          lastActivity: new Date().toISOString(),
          sessionsCompleted: 0,
          successRate: 100
        },
        {
          id: 'critic-agent-1',
          name: language === 'ru' ? 'Агент-Критик' : 'Critic Agent',
          role: 'critic',
          model: 'gpt-4-turbo',
          status: 'idle',
          specialty: language === 'ru' ? 'Критический анализ и поиск недостатков' : 'Critical analysis and flaw detection',
          instructions: language === 'ru'
            ? 'Критически анализируй все предложения и решения, ищи потенциальные проблемы и слабые места.'
            : 'Critically analyze all proposals and solutions, look for potential problems and weaknesses.',
          lastActivity: new Date().toISOString(),
          sessionsCompleted: 0,
          successRate: 100
        }
      ];
      setAuditAgents(defaultAgents);
    }
  }, [auditAgents, setAuditAgents, language]);

  // Create new agent
  const createAgent = () => {
    if (!newAgentName.trim()) {
      toast.error(t('nameRequired'));
      return;
    }

    const newAgent: AuditAgent = {
      id: `agent-${Date.now()}`,
      name: newAgentName,
      role: newAgentRole,
      model: newAgentModel,
      status: 'idle',
      specialty: newAgentSpecialty,
      instructions: newAgentInstructions,
      lastActivity: new Date().toISOString(),
      sessionsCompleted: 0,
      successRate: 100
    };

    setAuditAgents(current => [...(current || []), newAgent]);
    
    // Reset form
    setNewAgentName('');
    setNewAgentRole('primary');
    setNewAgentModel('gpt-4');
    setNewAgentSpecialty('');
    setNewAgentInstructions('');
    setIsCreatingAgent(false);
    
    toast.success(t('agentCreated'));
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'primary': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'secondary': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'validator': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'critic': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'running': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'primary': return <Shield size={16} />;
      case 'secondary': return <Robot size={16} />;
      case 'validator': return <CheckCircle size={16} />;
      case 'critic': return <Bug size={16} />;
      default: return <Brain size={16} />;
    }
  };

  return (
    <div className="module-audit min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Shield size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('aiAudit')}</h1>
              <p className="text-muted-foreground">{t('auditDescription')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={activeView === 'agents' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('agents')}
                className="rounded-md"
              >
                <Robot size={16} className="mr-2" />
                {t('agents')}
              </Button>
              <Button
                variant={activeView === 'sessions' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('sessions')}
                className="rounded-md"
              >
                <ListChecks size={16} className="mr-2" />
                {t('sessions')}
              </Button>
              <Button
                variant={activeView === 'results' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('results')}
                className="rounded-md"
              >
                <Target size={16} className="mr-2" />
                {t('results')}
              </Button>
            </div>
            
            {/* Action Buttons */}
            {activeView === 'agents' && (
              <Dialog open={isCreatingAgent} onOpenChange={setIsCreatingAgent}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus size={16} className="mr-2" />
                    {t('newAgent')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t('createAgent')}</DialogTitle>
                    <DialogDescription>
                      {t('auditDescription')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="agentName">{t('agentName')}</Label>
                      <Input
                        id="agentName"
                        value={newAgentName}
                        onChange={(e) => setNewAgentName(e.target.value)}
                        placeholder={t('agentNamePlaceholder')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="specialty">{t('specialty')}</Label>
                      <Input
                        id="specialty"
                        value={newAgentSpecialty}
                        onChange={(e) => setNewAgentSpecialty(e.target.value)}
                        placeholder={t('specialtyPlaceholder')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">{t('role')}</Label>
                      <Select value={newAgentRole} onValueChange={(value: any) => setNewAgentRole(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">{t('primary')}</SelectItem>
                          <SelectItem value="secondary">{t('secondary')}</SelectItem>
                          <SelectItem value="validator">{t('validator')}</SelectItem>
                          <SelectItem value="critic">{t('critic')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="model">{t('model')}</Label>
                      <Select value={newAgentModel} onValueChange={(value: any) => setNewAgentModel(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                          <SelectItem value="claude-3">Claude-3</SelectItem>
                          <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                          <SelectItem value="local">Local Model</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="instructions">{t('instructions')}</Label>
                      <Textarea
                        id="instructions"
                        value={newAgentInstructions}
                        onChange={(e) => setNewAgentInstructions(e.target.value)}
                        placeholder={t('instructionsPlaceholder')}
                        rows={4}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsCreatingAgent(false)}>
                      {t('cancel')}
                    </Button>
                    <Button onClick={createAgent}>{t('createAgent')}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            
            {activeView === 'sessions' && (
              <Button>
                <Plus size={16} className="mr-2" />
                {t('newSession')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        {activeView === 'agents' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(auditAgents || []).map(agent => (
              <Card key={agent.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {getRoleIcon(agent.role)}
                      </div>
                      <div>
                        <CardTitle className="text-base">{agent.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {agent.specialty}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className={getRoleColor(agent.role)}>
                        {t(agent.role)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={getStatusColor(agent.status)}>
                      {t(agent.status)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {agent.model.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium">{t('successRate')}</Label>
                      <div className="mt-1">
                        <Progress value={agent.successRate} className="w-full h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {agent.successRate}%
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">{t('sessionsCompleted')}</Label>
                      <p className="text-lg font-semibold mt-1">
                        {agent.sessionsCompleted}
                      </p>
                    </div>
                  </div>
                  
                  {agent.instructions && (
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {agent.instructions}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="flex-1">
                      <Play size={14} className="mr-1" />
                      {t('startAudit')}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {activeView === 'sessions' && (
          <div className="text-center py-12">
            <ListChecks size={64} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              {language === 'ru' ? 'Аудиторские Сессии' : 'Audit Sessions'}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {language === 'ru' 
                ? 'Создайте новую сессию аудита для запуска проверки с выбранными агентами'
                : 'Create a new audit session to run validation with selected agents'
              }
            </p>
            <Button size="lg">
              <Plus size={20} className="mr-2" />
              {t('newSession')}
            </Button>
          </div>
        )}
        
        {activeView === 'results' && (
          <div className="text-center py-12">
            <Target size={64} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              {language === 'ru' ? 'Результаты Аудита' : 'Audit Results'}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {language === 'ru' 
                ? 'Результаты аудита появятся здесь после завершения сессий'
                : 'Audit results will appear here after sessions are completed'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditPage;