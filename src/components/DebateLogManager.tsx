import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  ChatCircle,
  Users,
  Clock,
  Archive,
  Download,
  Eye,
  Brain,
  Target,
  CheckCircle,
  Warning,
  Play,
  Stop,
  PaperPlaneTilt,
  Robot,
  Gear
} from '@phosphor-icons/react';

import { DebateLog, MemoryEntry } from '../types/memory';

interface DebateLogManagerProps {
  language: 'en' | 'ru';
  projectId: string;
  onLogCreated?: (log: DebateLog) => void;
  onMemoryExtracted?: (memories: MemoryEntry[]) => void;
}

// Переводы для системы логов дебатов
const debateLogTranslations = {
  en: {
    debateLogManager: 'Debate Log Manager',
    debateLogDesc: 'Manage debate logs, extract insights, and create memory entries',
    activeSessions: 'Active Sessions',
    debateHistory: 'Debate History',
    logAnalysis: 'Log Analysis',
    memoryExtraction: 'Memory Extraction',
    startNewDebate: 'Start New Debate',
    debateStarted: 'Debate session started',
    debateStopped: 'Debate session stopped',
    debateTopic: 'Debate Topic',
    participants: 'Participants',
    roundNumber: 'Round',
    messageType: 'Type',
    confidence: 'Confidence',
    timestamp: 'Timestamp',
    argument: 'Argument',
    counterArgument: 'Counter-Argument',
    synthesis: 'Synthesis',
    question: 'Question',
    conclusion: 'Conclusion',
    extractMemories: 'Extract Memories',
    memoriesExtracted: 'Memories extracted successfully',
    memoryExtractionFailed: 'Memory extraction failed',
    noActiveSessions: 'No active debate sessions',
    noDebateHistory: 'No debate history available',
    startFirstDebate: 'Start your first debate session',
    viewDetails: 'View Details',
    stopSession: 'Stop Session',
    downloadLogs: 'Download Logs',
    sessionDuration: 'Duration',
    totalRounds: 'Total Rounds',
    status: 'Status',
    running: 'Running',
    completed: 'Completed',
    stopped: 'Stopped',
    failed: 'Failed',
    analyzing: 'Analyzing',
    agent: 'Agent',
    quality: 'Quality',
    relevance: 'Relevance',
    extractionProgress: 'Extraction Progress',
    logCollection: 'Log Collection',
    contentAnalysis: 'Content Analysis',
    memoryCreation: 'Memory Creation',
    verificationCheck: 'Verification Check'
  },
  ru: {
    debateLogManager: 'Менеджер Логов Дебатов',
    debateLogDesc: 'Управление логами дебатов, извлечение инсайтов и создание записей памяти',
    activeSessions: 'Активные Сессии',
    debateHistory: 'История Дебатов',
    logAnalysis: 'Анализ Логов',
    memoryExtraction: 'Извлечение Памяти',
    startNewDebate: 'Начать Новые Дебаты',
    debateStarted: 'Сессия дебатов начата',
    debateStopped: 'Сессия дебатов остановлена',
    debateTopic: 'Тема Дебатов',
    participants: 'Участники',
    roundNumber: 'Раунд',
    messageType: 'Тип',
    confidence: 'Уверенность',
    timestamp: 'Время',
    argument: 'Аргумент',
    counterArgument: 'Контраргумент',
    synthesis: 'Синтез',
    question: 'Вопрос',
    conclusion: 'Заключение',
    extractMemories: 'Извлечь Память',
    memoriesExtracted: 'Память успешно извлечена',
    memoryExtractionFailed: 'Ошибка извлечения памяти',
    noActiveSessions: 'Нет активных сессий дебатов',
    noDebateHistory: 'История дебатов недоступна',
    startFirstDebate: 'Начните первую сессию дебатов',
    viewDetails: 'Просмотр Деталей',
    stopSession: 'Остановить Сессию',
    downloadLogs: 'Скачать Логи',
    sessionDuration: 'Длительность',
    totalRounds: 'Всего Раундов',
    status: 'Статус',
    running: 'Выполняется',
    completed: 'Завершено',
    stopped: 'Остановлено',
    failed: 'Ошибка',
    analyzing: 'Анализ',
    agent: 'Агент',
    quality: 'Качество',
    relevance: 'Релевантность',
    extractionProgress: 'Прогресс Извлечения',
    logCollection: 'Сбор Логов',
    contentAnalysis: 'Анализ Содержания',
    memoryCreation: 'Создание Памяти',
    verificationCheck: 'Проверка Верификации'
  }
};

interface DebateSession {
  id: string;
  topic: string;
  participants: string[];
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'stopped' | 'failed';
  currentRound: number;
  totalRounds: number;
  logs: DebateLog[];
}

export default function DebateLogManager({ 
  language, 
  projectId, 
  onLogCreated, 
  onMemoryExtracted 
}: DebateLogManagerProps) {
  const t = (key: keyof typeof debateLogTranslations.en) => debateLogTranslations[language][key];

  // Состояния для управления логами дебатов
  const [debateSessions, setDebateSessions] = useKV<DebateSession[]>(`debate-sessions-${projectId}`, []);
  const [selectedSession, setSelectedSession] = useState<DebateSession | null>(null);
  const [extractionProgress, setExtractionProgress] = useState<{
    sessionId: string;
    stage: string;
    progress: number;
  } | null>(null);

  // UI состояния
  const [isViewingSession, setIsViewingSession] = useState(false);
  const [isExtractingMemory, setIsExtractingMemory] = useState(false);

  // Создать новую сессию дебатов (симуляция)
  const startNewDebateSession = () => {
    const newSession: DebateSession = {
      id: `debate-${Date.now()}`,
      topic: language === 'ru' 
        ? 'Анализ кибербезопасности в современных ИТ-системах' 
        : 'Cybersecurity analysis in modern IT systems',
      participants: ['Debate Agent 1', 'Debate Agent 2', 'Moderator Agent'],
      startTime: new Date().toISOString(),
      status: 'running',
      currentRound: 1,
      totalRounds: 3,
      logs: []
    };

    setDebateSessions(current => [...(current || []), newSession]);
    
    // Симуляция логов дебатов
    setTimeout(() => simulateDebateLogs(newSession.id), 1000);
    
    toast.success(t('debateStarted'));
  };

  // Симуляция логов дебатов
  const simulateDebateLogs = (sessionId: string) => {
    const sampleLogs: Omit<DebateLog, 'id' | 'sessionId' | 'timestamp'>[] = [
      {
        round: 1,
        agentId: 'debate-agent-1',
        message: language === 'ru' 
          ? 'Современные системы кибербезопасности должны использовать многоуровневую защиту для эффективного противодействия угрозам.'
          : 'Modern cybersecurity systems should implement multi-layered defense for effective threat mitigation.',
        messageType: 'argument',
        confidence: 85,
        supportingData: ['industry_standards', 'threat_analysis'],
        referencedMemories: []
      },
      {
        round: 1,
        agentId: 'debate-agent-2',
        message: language === 'ru' 
          ? 'Однако многоуровневая защита может создать ложное чувство безопасности и усложнить управление системой.'
          : 'However, multi-layered defense can create false sense of security and complicate system management.',
        messageType: 'counter-argument',
        confidence: 78,
        supportingData: ['complexity_analysis', 'user_experience'],
        referencedMemories: []
      },
      {
        round: 1,
        agentId: 'moderator-agent',
        message: language === 'ru' 
          ? 'Необходимо найти баланс между безопасностью и удобством использования при проектировании защитных систем.'
          : 'Balance between security and usability must be found when designing protection systems.',
        messageType: 'synthesis',
        confidence: 92,
        supportingData: ['usability_research', 'security_frameworks'],
        referencedMemories: []
      }
    ];

    sampleLogs.forEach((logData, index) => {
      setTimeout(() => {
        const newLog: DebateLog = {
          ...logData,
          id: `log-${Date.now()}-${index}`,
          sessionId,
          timestamp: new Date().toISOString()
        };

        setDebateSessions(current => 
          (current || []).map(session => 
            session.id === sessionId 
              ? { ...session, logs: [...session.logs, newLog] }
              : session
          )
        );

        if (onLogCreated) {
          onLogCreated(newLog);
        }
      }, index * 2000);
    });

    // Завершить сессию через 10 секунд
    setTimeout(() => {
      setDebateSessions(current => 
        (current || []).map(session => 
          session.id === sessionId 
            ? { ...session, status: 'completed' as const, endTime: new Date().toISOString() }
            : session
        )
      );
    }, 8000);
  };

  // Остановить сессию дебатов
  const stopDebateSession = (sessionId: string) => {
    setDebateSessions(current => 
      (current || []).map(session => 
        session.id === sessionId 
          ? { ...session, status: 'stopped' as const, endTime: new Date().toISOString() }
          : session
      )
    );
    toast.success(t('debateStopped'));
  };

  // Извлечь память из логов
  const extractMemoryFromLogs = async (sessionId: string) => {
    const session = debateSessions?.find(s => s.id === sessionId);
    if (!session || session.logs.length === 0) {
      toast.error(t('memoryExtractionFailed'));
      return;
    }

    setIsExtractingMemory(true);
    setExtractionProgress({ sessionId, stage: t('logCollection'), progress: 0 });

    // Этап 1: Сбор логов
    await simulateExtractionStage(sessionId, t('logCollection'), 2000);
    
    // Этап 2: Анализ содержания  
    await simulateExtractionStage(sessionId, t('contentAnalysis'), 3000);
    
    // Этап 3: Создание памяти
    await simulateExtractionStage(sessionId, t('memoryCreation'), 2000);
    
    // Этап 4: Проверка верификации
    await simulateExtractionStage(sessionId, t('verificationCheck'), 1500);

    // Создать записи памяти
    const memoryEntries: MemoryEntry[] = session.logs.map(log => ({
      id: `memory-${log.id}`,
      timestamp: log.timestamp,
      agentId: log.agentId,
      projectId,
      type: 'debate' as const,
      content: log.message,
      context: {
        module: 'debate',
        action: log.messageType,
        relevance: log.confidence,
        accuracy: log.confidence
      },
      tags: ['debate', log.messageType, `round-${log.round}`],
      verified: true,
      source: 'debate' as const
    }));

    if (onMemoryExtracted) {
      onMemoryExtracted(memoryEntries);
    }

    setIsExtractingMemory(false);
    setExtractionProgress(null);
    toast.success(t('memoriesExtracted'));
  };

  // Симуляция этапа извлечения
  const simulateExtractionStage = async (sessionId: string, stage: string, duration: number) => {
    return new Promise<void>((resolve) => {
      const startTime = Date.now();
      
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        
        setExtractionProgress({ sessionId, stage, progress });
        
        if (progress >= 100) {
          resolve();
        } else {
          setTimeout(updateProgress, 50);
        }
      };
      
      updateProgress();
    });
  };

  // Получить статус badge вариант
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'running':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'stopped':
        return 'outline';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Получить иконку для типа сообщения
  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'argument':
        return <PaperPlaneTilt size={16} className="text-blue-500" />;
      case 'counter-argument':
        return <Target size={16} className="text-orange-500" />;
      case 'synthesis':
        return <Brain size={16} className="text-green-500" />;
      case 'question':
        return <ChatCircle size={16} className="text-purple-500" />;
      case 'conclusion':
        return <CheckCircle size={16} className="text-cyan-500" />;
      default:
        return <ChatCircle size={16} />;
    }
  };

  const activeSessions = debateSessions?.filter(s => s.status === 'running') || [];
  const completedSessions = debateSessions?.filter(s => s.status !== 'running') || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChatCircle size={24} className="text-primary" />
          {t('debateLogManager')}
        </CardTitle>
        <CardDescription>
          {t('debateLogDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Active Sessions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('activeSessions')}</h3>
              <Button onClick={startNewDebateSession}>
                <Play size={16} className="mr-2" />
                {t('startNewDebate')}
              </Button>
            </div>

            {activeSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>{t('noActiveSessions')}</p>
                <p className="text-sm">{t('startFirstDebate')}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {activeSessions.map(session => (
                  <Card key={session.id} className="cyber-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{session.topic}</h4>
                        <Badge variant={getStatusBadgeVariant(session.status)}>
                          {t(session.status as keyof typeof debateLogTranslations.en)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-muted-foreground">{t('participants')}: </span>
                          <span className="font-medium">{session.participants.length}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t('roundNumber')}: </span>
                          <span className="font-medium">{session.currentRound}/{session.totalRounds}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{language === 'ru' ? 'Сообщений' : 'Messages'}: </span>
                          <span className="font-medium">{session.logs.length}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          setSelectedSession(session);
                          setIsViewingSession(true);
                        }}>
                          <Eye size={14} className="mr-1" />
                          {t('viewDetails')}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => stopDebateSession(session.id)}>
                          <Stop size={14} className="mr-1" />
                          {t('stopSession')}
                        </Button>
                        {session.logs.length > 0 && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => extractMemoryFromLogs(session.id)}
                            disabled={isExtractingMemory}
                          >
                            <Brain size={14} className="mr-1" />
                            {t('extractMemories')}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Debate History */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('debateHistory')}</h3>
            
            {completedSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Archive size={48} className="mx-auto mb-4 opacity-50" />
                <p>{t('noDebateHistory')}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {completedSessions.map(session => (
                  <Card key={session.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{session.topic}</h4>
                        <Badge variant={getStatusBadgeVariant(session.status)}>
                          {t(session.status as keyof typeof debateLogTranslations.en)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-muted-foreground">{t('sessionDuration')}: </span>
                          <span className="font-medium">
                            {session.endTime ? 
                              Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000) + ' min'
                              : '—'
                            }
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t('totalRounds')}: </span>
                          <span className="font-medium">{session.totalRounds}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{language === 'ru' ? 'Сообщений' : 'Messages'}: </span>
                          <span className="font-medium">{session.logs.length}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{language === 'ru' ? 'Завершено' : 'Ended'}: </span>
                          <span className="font-medium">
                            {session.endTime ? new Date(session.endTime).toLocaleDateString() : '—'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          setSelectedSession(session);
                          setIsViewingSession(true);
                        }}>
                          <Eye size={14} className="mr-1" />
                          {t('viewDetails')}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download size={14} className="mr-1" />
                          {t('downloadLogs')}
                        </Button>
                        {session.logs.length > 0 && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => extractMemoryFromLogs(session.id)}
                            disabled={isExtractingMemory}
                          >
                            <Brain size={14} className="mr-1" />
                            {t('extractMemories')}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Memory Extraction Progress */}
          {extractionProgress && (
            <Card className="cyber-border glow-cyan">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Brain size={20} className="animate-pulse" />
                    {t('extractionProgress')}
                  </h4>
                  <Badge variant="secondary">{t('analyzing')}</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{extractionProgress.stage}</span>
                    <span>{Math.round(extractionProgress.progress)}%</span>
                  </div>
                  <Progress value={extractionProgress.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Session Detail Dialog */}
        <Dialog open={isViewingSession} onOpenChange={setIsViewingSession}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ChatCircle size={20} />
                {selectedSession?.topic}
              </DialogTitle>
              <DialogDescription>
                {language === 'ru' 
                  ? `Сессия дебатов с ${selectedSession?.participants.length} участниками`
                  : `Debate session with ${selectedSession?.participants.length} participants`
                }
              </DialogDescription>
            </DialogHeader>
            
            {selectedSession && (
              <ScrollArea className="h-[60vh]">
                <div className="space-y-4">
                  {/* Session Info */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <span className="text-sm text-muted-foreground">{t('status')}: </span>
                      <Badge variant={getStatusBadgeVariant(selectedSession.status)}>
                        {t(selectedSession.status as keyof typeof debateLogTranslations.en)}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">{t('participants')}: </span>
                      <span className="text-sm font-medium">
                        {selectedSession.participants.join(', ')}
                      </span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Debate Logs */}
                  <div>
                    <h4 className="font-medium mb-3">
                      {language === 'ru' ? 'Логи дебатов' : 'Debate Logs'} ({selectedSession.logs.length})
                    </h4>
                    
                    {selectedSession.logs.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        {language === 'ru' ? 'Логи еще не созданы' : 'No logs created yet'}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {selectedSession.logs.map(log => (
                          <div key={log.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getMessageTypeIcon(log.messageType)}
                                <span className="font-medium text-sm">{log.agentId}</span>
                                <Badge variant="outline" className="text-xs">
                                  {t(log.messageType as keyof typeof debateLogTranslations.en)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{t('confidence')}: {log.confidence}%</span>
                                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                              </div>
                            </div>
                            
                            <p className="text-sm mb-2">{log.message}</p>
                            
                            {log.supportingData.length > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">
                                  {language === 'ru' ? 'Данные:' : 'Data:'}
                                </span>
                                {log.supportingData.map(data => (
                                  <Badge key={data} variant="outline" className="text-xs">
                                    {data}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}