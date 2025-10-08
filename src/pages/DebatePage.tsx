import React, { useState, useEffect } from 'react';
import { axon } from '@/services/axonAdapter'
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Users, ChatCircle, Play, Pause, Stop, Plus, ArrowRight, ThumbsUp, ThumbsDown, Clock, Lightbulb, Robot, Microphone, MicrophoneSlash } from '@phosphor-icons/react';

interface DebatePageProps {
  language: 'en' | 'ru';
  projectId: string;
  onNavigate: (pageId: string) => void;
}

interface DebateAgent {
  id: string;
  name: string;
  stance: 'for' | 'against' | 'neutral' | 'moderator';
  model: 'gpt-4' | 'gpt-4-turbo' | 'claude-3' | 'gemini-pro' | 'local';
  personality: string;
  expertise: string;
  avatar: string;
  isActive: boolean;
  currentArgument?: string;
  argumentCount: number;
  winRate: number;
}

interface DebateMessage {
  id: string;
  agentId: string;
  content: string;
  type: 'argument' | 'counterargument' | 'question' | 'summary' | 'conclusion';
  timestamp: string;
  reactions: {
    thumbsUp: number;
    thumbsDown: number;
    insightful: number;
  };
  confidence: number;
}

interface DebateSession {
  id: string;
  title: string;
  topic: string;
  description: string;
  participants: string[]; // Agent IDs
  moderator?: string; // Agent ID
  status: 'setup' | 'active' | 'paused' | 'completed' | 'archived';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  messages: DebateMessage[];
  currentRound: number;
  maxRounds: number;
  rules: {
    timePerRound: number; // minutes
    maxArgumentLength: number; // characters
    allowInterruptions: boolean;
    requireConsensus: boolean;
  };
  results?: {
    winner: 'for' | 'against' | 'draw';
    consensus: boolean;
    finalScore: number;
    keyInsights: string[];
  };
}

// Minimal shape for DebateLogManager session to allow import on deep-link
interface LogManagerSession {
  id: string;
  topic: string;
  participants: string[];
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'stopped' | 'failed';
  currentRound: number;
  totalRounds: number;
  logs: Array<{
    id: string;
    agentId: string;
    message: string;
    messageType: 'argument' | 'counter-argument' | 'synthesis' | 'question' | 'conclusion';
    confidence: number;
    timestamp: string;
    supportingData: string[];
    referencedMemories: string[];
  }>;
}

const DebatePage: React.FC<DebatePageProps> = ({
  language,
  projectId,
  onNavigate: _onNavigate,
}) => {
  // Persistent storage
  const [debateAgents, setDebateAgents] = useKV<DebateAgent[]>(`debate-agents-${projectId}`, []);
  const [debateSessions, setDebateSessions] = useKV<DebateSession[]>(`debate-sessions-${projectId}`, []);
  const [currentSession, setCurrentSession] = useKV<string | null>(`current-debate-${projectId}`, null);
  // Access log manager store to import a session when deep-linking
  const [logManagerSessions] = useKV<LogManagerSession[]>(`debate-log-sessions-${projectId}`, []);
  
  // UI state
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [activeView, setActiveView] = useState<'agents' | 'sessions' | 'debate'>('sessions');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [readOnlySessionId, setReadOnlySessionId] = useState<string | null>(null);
  
  // Form state
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentStance, setNewAgentStance] = useState<'for' | 'against' | 'neutral' | 'moderator'>('for');
  const [newAgentModel, setNewAgentModel] = useState<'gpt-4' | 'gpt-4-turbo' | 'claude-3' | 'gemini-pro' | 'local'>('gpt-4');
  const [newAgentPersonality, setNewAgentPersonality] = useState('');
  const [newAgentExpertise, setNewAgentExpertise] = useState('');
  
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionTopic, setNewSessionTopic] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');
  const [newSessionMaxRounds, setNewSessionMaxRounds] = useState(5);

  // Translations
  const t = (key: string): string => {
    const translations: Record<string, { en: string; ru: string }> = {
      // Page header
      agentDebate: { en: 'Agent Debate', ru: 'Дебаты Агентов' },
      debateDescription: { en: 'Multi-agent debate and consensus building system', ru: 'Система дебатов и достижения консенсуса между агентами' },
      
      // Navigation
      agents: { en: 'Agents', ru: 'Агенты' },
      sessions: { en: 'Sessions', ru: 'Сессии' },
      debate: { en: 'Debate', ru: 'Дебаты' },
      
      // Agent stances
      for: { en: 'For', ru: 'За' },
      against: { en: 'Against', ru: 'Против' },
      neutral: { en: 'Neutral', ru: 'Нейтральный' },
      moderator: { en: 'Moderator', ru: 'Модератор' },
      
      // Status
      setup: { en: 'Setup', ru: 'Настройка' },
      active: { en: 'Active', ru: 'Активен' },
      paused: { en: 'Paused', ru: 'Приостановлен' },
      completed: { en: 'Completed', ru: 'Завершен' },
      archived: { en: 'Archived', ru: 'Архивирован' },
      
      // Message types
      argument: { en: 'Argument', ru: 'Аргумент' },
      counterargument: { en: 'Counter-argument', ru: 'Контраргумент' },
      question: { en: 'Question', ru: 'Вопрос' },
      summary: { en: 'Summary', ru: 'Резюме' },
      conclusion: { en: 'Conclusion', ru: 'Заключение' },
      
      // Actions
      newAgent: { en: 'New Agent', ru: 'Новый Агент' },
      newSession: { en: 'New Session', ru: 'Новая Сессия' },
      createAgent: { en: 'Create Agent', ru: 'Создать Агента' },
      createSession: { en: 'Create Session', ru: 'Создать Сессию' },
      startDebate: { en: 'Start Debate', ru: 'Начать Дебаты' },
      pauseDebate: { en: 'Pause Debate', ru: 'Приостановить Дебаты' },
      stopDebate: { en: 'Stop Debate', ru: 'Остановить Дебаты' },
      joinDebate: { en: 'Join Debate', ru: 'Присоединиться к Дебатам' },
      viewSession: { en: 'View Session', ru: 'Посмотреть Сессию' },
      
      // Form fields
      agentName: { en: 'Agent Name', ru: 'Имя Агента' },
      stance: { en: 'Stance', ru: 'Позиция' },
      model: { en: 'AI Model', ru: 'ИИ Модель' },
      personality: { en: 'Personality', ru: 'Личность' },
      expertise: { en: 'Expertise', ru: 'Экспертиза' },
      sessionTitle: { en: 'Session Title', ru: 'Название Сессии' },
      topic: { en: 'Topic', ru: 'Тема' },
      description: { en: 'Description', ru: 'Описание' },
      participants: { en: 'Participants', ru: 'Участники' },
      maxRounds: { en: 'Max Rounds', ru: 'Максимум Раундов' },
      
      // Messages
      agentCreated: { en: 'Debate agent created successfully', ru: 'Агент дебатов успешно создан' },
      sessionCreated: { en: 'Debate session created successfully', ru: 'Сессия дебатов успешно создана' },
      nameRequired: { en: 'Name is required', ru: 'Имя обязательно' },
      topicRequired: { en: 'Topic is required', ru: 'Тема обязательна' },
      
      // Metrics
      winRate: { en: 'Win Rate', ru: 'Процент Побед' },
      argumentCount: { en: 'Arguments', ru: 'Аргументов' },
      currentRound: { en: 'Round', ru: 'Раунд' },
      consensus: { en: 'Consensus', ru: 'Консенсус' },
      confidence: { en: 'Confidence', ru: 'Уверенность' },
      
      // Placeholder text
      agentNamePlaceholder: { en: 'Enter agent name', ru: 'Введите имя агента' },
      personalityPlaceholder: { en: 'e.g., Analytical, Passionate, Diplomatic', ru: 'например, Аналитичный, Страстный, Дипломатичный' },
      expertisePlaceholder: { en: 'e.g., Economics, Technology, Ethics', ru: 'например, Экономика, Технологии, Этика' },
      sessionTitlePlaceholder: { en: 'Enter session title', ru: 'Введите название сессии' },
      topicPlaceholder: { en: 'What topic will be debated?', ru: 'Какая тема будет обсуждаться?' },
      descriptionPlaceholder: { en: 'Additional context and rules...', ru: 'Дополнительный контекст и правила...' },
      
      save: { en: 'Save', ru: 'Сохранить' },
      cancel: { en: 'Cancel', ru: 'Отмена' },
      
      // Status messages
      noActiveSessions: { en: 'No active debate sessions', ru: 'Нет активных сессий дебатов' },
      createFirstSession: { en: 'Create your first debate session', ru: 'Создайте вашу первую сессию дебатов' },
      setupAgentsFirst: { en: 'Set up debate agents first', ru: 'Сначала настройте агентов для дебатов' },
      selectParticipants: { en: 'Select at least 2 participants', ru: 'Выберите минимум 2 участников' }
    };
    
    return translations[key]?.[language] || key;
  };

  // Get current session data
  const effectiveSessionId = readOnlySessionId || currentSession
  const currentSessionData = debateSessions?.find(s => s.id === effectiveSessionId);

  // Read deep-link from location.hash: #session=<id>
  useEffect(() => {
    const onOpenSession = (e: Event) => {
      const ev = e as CustomEvent<LogManagerSession>
      const lm = ev.detail
      if (!lm) return
      const existsLocal = (debateSessions || []).some(s => s.id === lm.id)
      if (!existsLocal) {
        const mapType = (t: LogManagerSession['logs'][number]['messageType']): DebateMessage['type'] => {
          switch (t) {
            case 'argument': return 'argument'
            case 'counter-argument': return 'counterargument'
            case 'synthesis': return 'summary'
            case 'question': return 'question'
            case 'conclusion': return 'conclusion'
            default: return 'argument'
          }
        }
        const imported: DebateSession = {
          id: lm.id,
          title: lm.topic,
          topic: lm.topic,
          description: '',
          participants: lm.participants,
          moderator: undefined,
          status: lm.status === 'running' ? 'active' : lm.status === 'completed' ? 'completed' : 'paused',
          createdAt: lm.startTime,
          startedAt: lm.startTime,
          completedAt: lm.endTime,
          messages: (lm.logs || []).map(l => ({
            id: `import-${l.id}`,
            agentId: l.agentId,
            content: l.message,
            type: mapType(l.messageType),
            timestamp: l.timestamp,
            reactions: { thumbsUp: 0, thumbsDown: 0, insightful: 0 },
            confidence: l.confidence,
          })),
          currentRound: lm.currentRound,
          maxRounds: lm.totalRounds,
          rules: { timePerRound: 5, maxArgumentLength: 500, allowInterruptions: false, requireConsensus: false },
        }
        setDebateSessions(current => ([...(current || []), imported]))
      }
    }
    const applyFromHash = () => {
      if (typeof window === 'undefined') return
      const hash = window.location.hash || ''
      const m = hash.match(/#session=([^&]+)/)
      if (m && m[1]) {
        const id = decodeURIComponent(m[1])
        // If session exists locally — open it; otherwise try importing from log manager store
        const existsLocal = (debateSessions || []).some(s => s.id === id)
        if (!existsLocal) {
          const lm = (logManagerSessions || []).find(s => s.id === id)
          if (lm) {
            const mapType = (t: LogManagerSession['logs'][number]['messageType']): DebateMessage['type'] => {
              switch (t) {
                case 'argument': return 'argument'
                case 'counter-argument': return 'counterargument'
                case 'synthesis': return 'summary'
                case 'question': return 'question'
                case 'conclusion': return 'conclusion'
                default: return 'argument'
              }
            }
            const imported: DebateSession = {
              id: lm.id,
              title: lm.topic,
              topic: lm.topic,
              description: '',
              participants: lm.participants,
              moderator: undefined,
              status: lm.status === 'running' ? 'active' : lm.status === 'completed' ? 'completed' : 'paused',
              createdAt: lm.startTime,
              startedAt: lm.startTime,
              completedAt: lm.endTime,
              messages: (lm.logs || []).map(l => ({
                id: `import-${l.id}`,
                agentId: l.agentId,
                content: l.message,
                type: mapType(l.messageType),
                timestamp: l.timestamp,
                reactions: { thumbsUp: 0, thumbsDown: 0, insightful: 0 },
                confidence: l.confidence,
              })),
              currentRound: lm.currentRound,
              maxRounds: lm.totalRounds,
              rules: { timePerRound: 5, maxArgumentLength: 500, allowInterruptions: false, requireConsensus: false },
            }
            setDebateSessions(current => ([...(current || []), imported]))
          }
        }
        setReadOnlySessionId(id)
        setActiveView('debate')
      } else {
        setReadOnlySessionId(null)
      }
    }
    applyFromHash()
    if (typeof window !== 'undefined') {
      window.addEventListener('debate:open-session', onOpenSession as EventListener)
      window.addEventListener('hashchange', applyFromHash)
      return () => {
        window.removeEventListener('hashchange', applyFromHash)
        window.removeEventListener('debate:open-session', onOpenSession as EventListener)
      }
    }
  }, [debateSessions, logManagerSessions, setDebateSessions])

  // Initialize default agents if none exist
  useEffect(() => {
    if (!debateAgents || debateAgents.length === 0) {
      const defaultAgents: DebateAgent[] = [
        {
          id: 'advocate-agent-1',
          name: language === 'ru' ? 'Адвокат' : 'Advocate',
          stance: 'for',
          model: 'gpt-4',
          personality: language === 'ru' ? 'Убедительный и логичный' : 'Persuasive and logical',
          expertise: language === 'ru' ? 'Аргументация и дебаты' : 'Argumentation and debate',
          avatar: '🎯',
          isActive: true,
          argumentCount: 0,
          winRate: 75
        },
        {
          id: 'critic-agent-1',
          name: language === 'ru' ? 'Критик' : 'Critic',
          stance: 'against',
          model: 'claude-3',
          personality: language === 'ru' ? 'Скептичный и аналитичный' : 'Skeptical and analytical',
          expertise: language === 'ru' ? 'Критический анализ' : 'Critical analysis',
          avatar: '🔍',
          isActive: true,
          argumentCount: 0,
          winRate: 68
        },
        {
          id: 'moderator-agent-1',
          name: language === 'ru' ? 'Модератор' : 'Moderator',
          stance: 'moderator',
          model: 'gemini-pro',
          personality: language === 'ru' ? 'Беспристрастный и организованный' : 'Impartial and organized',
          expertise: language === 'ru' ? 'Фасилитация дискуссий' : 'Discussion facilitation',
          avatar: '⚖️',
          isActive: true,
          argumentCount: 0,
          winRate: 85
        },
        {
          id: 'neutral-agent-1',
          name: language === 'ru' ? 'Аналитик' : 'Analyst',
          stance: 'neutral',
          model: 'gpt-4-turbo',
          personality: language === 'ru' ? 'Объективный и детальный' : 'Objective and detailed',
          expertise: language === 'ru' ? 'Анализ данных и фактов' : 'Data and fact analysis',
          avatar: '📊',
          isActive: true,
          argumentCount: 0,
          winRate: 72
        }
      ];
      setDebateAgents(defaultAgents);
    }
  }, [debateAgents, setDebateAgents, language]);

  // Create new agent
  const createAgent = () => {
    if (!newAgentName.trim()) {
      toast.error(t('nameRequired'));
      return;
    }

    const avatars = ['🎯', '🔍', '⚖️', '📊', '🧠', '💡', '🎭', '🔬', '📚', '🗣️'];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const newAgent: DebateAgent = {
      id: `agent-${Date.now()}`,
      name: newAgentName,
      stance: newAgentStance,
      model: newAgentModel,
      personality: newAgentPersonality,
      expertise: newAgentExpertise,
      avatar: randomAvatar,
      isActive: true,
      argumentCount: 0,
      winRate: 50
    };

    setDebateAgents(current => [...(current || []), newAgent]);
    
    // Reset form
    setNewAgentName('');
    setNewAgentStance('for');
    setNewAgentModel('gpt-4');
    setNewAgentPersonality('');
    setNewAgentExpertise('');
    setIsCreatingAgent(false);
    
    toast.success(t('agentCreated'));
  };

  // Create new session
  const createSession = () => {
    if (!newSessionTitle.trim()) {
      toast.error(t('nameRequired'));
      return;
    }
    if (!newSessionTopic.trim()) {
      toast.error(t('topicRequired'));
      return;
    }
    if (selectedAgents.length < 2) {
      toast.error(t('selectParticipants'));
      return;
    }

    const newSession: DebateSession = {
      id: `session-${Date.now()}`,
      title: newSessionTitle,
      topic: newSessionTopic,
      description: newSessionDescription,
      participants: selectedAgents,
      moderator: debateAgents?.find(a => a.stance === 'moderator')?.id,
      status: 'setup',
      createdAt: new Date().toISOString(),
      messages: [],
      currentRound: 1,
      maxRounds: newSessionMaxRounds,
      rules: {
        timePerRound: 5,
        maxArgumentLength: 500,
        allowInterruptions: false,
        requireConsensus: false
      }
    };

    setDebateSessions(current => [...(current || []), newSession]);
    setCurrentSession(newSession.id);
    
    // Reset form
    setNewSessionTitle('');
    setNewSessionTopic('');
    setNewSessionDescription('');
    setSelectedAgents([]);
    setIsCreatingSession(false);
    setActiveView('debate');
    
    toast.success(t('sessionCreated'));
  };

  // Get stance color
  const getStanceColor = (stance: string) => {
    switch (stance) {
      case 'for': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'against': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'neutral': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'moderator': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'setup': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paused': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'archived': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="module-debate min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Users size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('agentDebate')}</h1>
              <p className="text-muted-foreground">{t('debateDescription')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={activeView === 'sessions' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('sessions')}
                className="rounded-md"
              >
                <ChatCircle size={16} className="mr-2" />
                {t('sessions')}
              </Button>
              <Button
                variant={activeView === 'agents' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('agents')}
                className="rounded-md"
              >
                <Robot size={16} className="mr-2" />
                {t('agents')}
              </Button>
              {currentSessionData && (
                <Button
                  variant={activeView === 'debate' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('debate')}
                  className="rounded-md"
                >
                  <Microphone size={16} className="mr-2" />
                  {t('debate')}
                </Button>
              )}
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
                      {t('debateDescription')}
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
                      <Label htmlFor="stance">{t('stance')}</Label>
                      <Select value={newAgentStance} onValueChange={(value: any) => setNewAgentStance(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="for">{t('for')}</SelectItem>
                          <SelectItem value="against">{t('against')}</SelectItem>
                          <SelectItem value="neutral">{t('neutral')}</SelectItem>
                          <SelectItem value="moderator">{t('moderator')}</SelectItem>
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
                    <div>
                      <Label htmlFor="personality">{t('personality')}</Label>
                      <Input
                        id="personality"
                        value={newAgentPersonality}
                        onChange={(e) => setNewAgentPersonality(e.target.value)}
                        placeholder={t('personalityPlaceholder')}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="expertise">{t('expertise')}</Label>
                      <Input
                        id="expertise"
                        value={newAgentExpertise}
                        onChange={(e) => setNewAgentExpertise(e.target.value)}
                        placeholder={t('expertisePlaceholder')}
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
              <Dialog open={isCreatingSession} onOpenChange={setIsCreatingSession}>
                <DialogTrigger asChild>
                  <Button data-testid="debate-new-session-header">
                    <Plus size={16} className="mr-2" />
                    {t('newSession')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t('createSession')}</DialogTitle>
                    <DialogDescription>
                      {t('debateDescription')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sessionTitle">{t('sessionTitle')}</Label>
                        <Input
                          id="sessionTitle"
                          value={newSessionTitle}
                          onChange={(e) => setNewSessionTitle(e.target.value)}
                          placeholder={t('sessionTitlePlaceholder')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxRounds">{t('maxRounds')}</Label>
                        <Input
                          id="maxRounds"
                          type="number"
                          value={newSessionMaxRounds}
                          onChange={(e) => setNewSessionMaxRounds(parseInt(e.target.value))}
                          min={1}
                          max={20}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="topic">{t('topic')}</Label>
                      <Input
                        id="topic"
                        value={newSessionTopic}
                        onChange={(e) => setNewSessionTopic(e.target.value)}
                        placeholder={t('topicPlaceholder')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">{t('description')}</Label>
                      <Textarea
                        id="description"
                        value={newSessionDescription}
                        onChange={(e) => setNewSessionDescription(e.target.value)}
                        placeholder={t('descriptionPlaceholder')}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>{t('participants')}</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {(debateAgents || []).map(agent => (
                          <div
                            key={agent.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedAgents.includes(agent.id)
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => {
                              setSelectedAgents(current =>
                                current.includes(agent.id)
                                  ? current.filter(id => id !== agent.id)
                                  : [...current, agent.id]
                              );
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{agent.avatar}</span>
                              <div>
                                <p className="font-medium text-sm">{agent.name}</p>
                                <Badge variant="outline" className={`text-xs ${getStanceColor(agent.stance)}`}>
                                  {t(agent.stance)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsCreatingSession(false)}>
                      {t('cancel')}
                    </Button>
                    <Button onClick={createSession}>{t('createSession')}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        {activeView === 'agents' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(debateAgents || []).map(agent => (
              <Card key={agent.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{agent.avatar}</div>
                      <div>
                        <CardTitle className="text-base">{agent.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {agent.expertise}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className={getStanceColor(agent.stance)}>
                      {t(agent.stance)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {agent.model.toUpperCase()}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${agent.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {agent.personality}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium">{t('winRate')}</Label>
                      <div className="mt-1">
                        <Progress value={agent.winRate} className="w-full h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {agent.winRate}%
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">{t('argumentCount')}</Label>
                      <p className="text-lg font-semibold mt-1">
                        {agent.argumentCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {activeView === 'sessions' && (
          <div className="space-y-6">
            {(debateSessions || []).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(debateSessions || []).map(session => (
                  <Card key={session.id} className="cursor-pointer hover:shadow-lg transition-shadow" 
                        onClick={() => {
                          setCurrentSession(session.id);
                          setReadOnlySessionId(null);
                          // update hash to clean state
                          if (typeof window !== 'undefined') {
                            if (window.location.hash) window.history.replaceState(null, '', window.location.pathname + window.location.search)
                          }
                          setActiveView('debate');
                        }}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{session.title}</CardTitle>
                        <Badge variant="outline" className={getStatusColor(session.status)}>
                          {t(session.status)}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {session.topic}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(session.createdAt).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {t('currentRound')}: {session.currentRound}/{session.maxRounds}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {session.participants.length} {t('participants')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        {(() => {
                          const turnsTotal = Math.max(session.participants.length, 1)
                          const turnsDone = session.messages.length % turnsTotal
                          const turnsDisplay = turnsDone === 0 && session.messages.length > 0 ? turnsTotal : turnsDone
                          return (
                            <span className="text-xs text-muted-foreground">
                              {language === 'ru' ? 'Ходов в раунде' : 'Turns in round'}: {turnsDisplay}/{turnsTotal}
                            </span>
                          )
                        })()}
                        <span />
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {session.participants.slice(0, 3).map(participantId => {
                          const agent = debateAgents?.find(a => a.id === participantId);
                          return agent ? (
                            <span key={agent.id} className="text-lg" title={agent.name}>
                              {agent.avatar}
                            </span>
                          ) : null;
                        })}
                        {session.participants.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{session.participants.length - 3}
                          </span>
                        )}
                      </div>
                      
                      <Button size="sm" className="w-full">
                        <ArrowRight size={14} className="mr-2" />
                        {t('joinDebate')}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ChatCircle size={64} className="mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">
                  {t('noActiveSessions')}
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {t('createFirstSession')}
                </p>
                <Button size="lg" onClick={() => setIsCreatingSession(true)} data-testid="debate-new-session-empty">
                  <Plus size={20} className="mr-2" />
                  {t('newSession')}
                </Button>
              </div>
            )}
          </div>
        )}
        
        {activeView === 'debate' && currentSessionData && (
          <div className="space-y-6" data-session-id={currentSessionData.id}>
            {/* Session Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{currentSessionData.title}</CardTitle>
                    <CardDescription>{currentSessionData.topic}</CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={getStatusColor(currentSessionData.status)}>
                      {t(currentSessionData.status)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {t('currentRound')}: {currentSessionData.currentRound}/{currentSessionData.maxRounds}
                    </span>
                    {/* Copy deep-link */}
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid="debate-copy-link"
                      onClick={async () => {
                        const url = `${window.location.origin}${window.location.pathname}#session=${encodeURIComponent(currentSessionData.id)}`
                        try {
                          await navigator.clipboard.writeText(url)
                          toast.success(language==='ru'? 'Ссылка скопирована' : 'Link copied')
                        } catch {
                          toast.error(language==='ru'? 'Не удалось скопировать ссылку' : 'Failed to copy link')
                        }
                      }}
                    >
                      {language==='ru'?'Скопировать ссылку':'Copy link'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button size="sm" disabled={!!readOnlySessionId} onClick={async () => {
                    if (!currentSessionData) return;
                    try {
                      const system = { role: 'system', content: `You are participating in a structured multi-agent debate. Topic: ${currentSessionData.topic}. Format concise, evidence-based arguments.` }
                      const user = { role: 'user', content: currentSessionData.description || 'Start the debate with an opening argument.' }
                      const res = await axon.chat({ projectId, language, messages: [system as any, user as any] })
                      const content = res.message.content
                      const firstParticipant = currentSessionData.participants[0]
                      const msg: DebateMessage = {
                        id: `msg-${Date.now()}`,
                        agentId: firstParticipant,
                        content,
                        type: 'argument',
                        timestamp: new Date().toISOString(),
                        reactions: { thumbsUp: 0, thumbsDown: 0, insightful: 0 },
                        confidence: 70,
                      }
                      setDebateSessions(current => (current || []).map(s => s.id === currentSessionData.id ? { ...s, messages: [...s.messages, msg], status: 'active', startedAt: s.startedAt || new Date().toISOString() } : s))
                    } catch (e: any) {
                      toast.error(language==='ru'?'Не удалось начать дебаты':'Failed to start debate', { description: String(e?.message || e) })
                    }
                  }}>
                    <Play size={14} className="mr-2" />
                    {t('startDebate')}
                  </Button>
                  <Button variant="outline" size="sm" disabled={!!readOnlySessionId} onClick={() => {
                    if (!currentSessionData) return;
                    setDebateSessions(current => (current || []).map(s => s.id === currentSessionData.id ? { ...s, status: 'paused' } : s))
                  }}>
                    <Pause size={14} className="mr-2" />
                    {t('pauseDebate')}
                  </Button>
                  <Button variant="outline" size="sm" disabled={!!readOnlySessionId} onClick={() => {
                    if (!currentSessionData) return;
                    setDebateSessions(current => (current || []).map(s => s.id === currentSessionData.id ? { ...s, status: 'completed', completedAt: new Date().toISOString() } : s))
                  }}>
                    <Stop size={14} className="mr-2" />
                    {t('stopDebate')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Debate Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Microphone size={20} />
                  {t('debate')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {currentSessionData.messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MicrophoneSlash size={48} className="mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {language === 'ru' 
                            ? 'Дебаты еще не начались. Нажмите "Начать Дебаты" чтобы начать.'
                            : 'Debate has not started yet. Click "Start Debate" to begin.'
                          }
                        </p>
                      </div>
                    ) : (
                      currentSessionData.messages.map(message => {
                        const agent = debateAgents?.find(a => a.id === message.agentId);
                        return (
                          <div key={message.id} className="flex gap-3 p-4 rounded-lg bg-muted/30">
                            <div className="text-2xl">{agent?.avatar || '🤖'}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">{agent?.name || 'Unknown Agent'}</span>
                                <Badge variant="outline" className="text-xs">
                                  {t(message.type)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-sm">{message.content}</p>
                              <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center gap-1">
                                  <ThumbsUp size={14} className="text-muted-foreground" />
                                  <span className="text-xs">{message.reactions.thumbsUp}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <ThumbsDown size={14} className="text-muted-foreground" />
                                  <span className="text-xs">{message.reactions.thumbsDown}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Lightbulb size={14} className="text-muted-foreground" />
                                  <span className="text-xs">{message.reactions.insightful}</span>
                                </div>
                                <div className="ml-auto">
                                  <Progress value={message.confidence} className="w-16 h-2" />
                                  <span className="text-xs text-muted-foreground">{message.confidence}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
                {/* Quick reply via AXON */}
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="secondary" disabled={!!readOnlySessionId} onClick={async () => {
                    if (!currentSessionData) return;
                    const turnsInRound = currentSessionData.participants.length
                    const turnsDoneInCurrentRound = currentSessionData.messages.length % turnsInRound
                    const canProceed = (currentSessionData.currentRound < currentSessionData.maxRounds) ||
                      (currentSessionData.currentRound === currentSessionData.maxRounds && turnsDoneInCurrentRound !== 0)
                    if (!canProceed) {
                      return
                    }
                    const lastAgentId = currentSessionData.participants[(currentSessionData.messages.length) % currentSessionData.participants.length]
                    const history = currentSessionData.messages.slice(-6).map(m => ({ role: 'user' as const, content: m.content }))
                    try {
                      const system = { role: 'system', content: `Continue the debate on: ${currentSessionData.topic}. Provide concise next argument or counterargument.` }
                      const res = await axon.chat({ projectId, language, messages: [system as any, ...history] })
                      const msg: DebateMessage = {
                        id: `msg-${Date.now()}`,
                        agentId: lastAgentId,
                        content: res.message.content,
                        type: 'counterargument',
                        timestamp: new Date().toISOString(),
                        reactions: { thumbsUp: 0, thumbsDown: 0, insightful: 0 },
                        confidence: 70,
                      }
                      setDebateSessions(current => (current || []).map(s => {
                        if (s.id !== currentSessionData.id) return s
                        const turns = s.participants.length
                        const willCompleteRound = ((s.messages.length + 1) % turns) === 0
                        const nextRound = willCompleteRound ? Math.min(s.currentRound + 1, s.maxRounds) : s.currentRound
                        return { ...s, messages: [...s.messages, msg], currentRound: nextRound }
                      }))
                    } catch (e: any) {
                      toast.error(language==='ru'?'Ошибка генерации аргумента':'Failed to generate argument', { description: String(e?.message || e) })
                    }
                  }}>
                    {language==='ru'?'Сгенерировать ход (AXON)':'Generate turn (AXON)'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {activeView === 'debate' && !currentSessionData && (
          <div className="text-center py-12">
            <Users size={64} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              {t('noActiveSessions')}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t('createFirstSession')}
            </p>
            <Button size="lg" onClick={() => setActiveView('sessions')}>
              <ChatCircle size={20} className="mr-2" />
              {t('sessions')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebatePage;