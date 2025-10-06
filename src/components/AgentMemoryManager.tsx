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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Database,
  Brain,
  FileText,
  Clock,
  CheckCircle,
  Warning,
  Play,
  Pause,
  Archive,
  PencilSimple,
  Trash,
  Download,
  Upload,
  Eye,
  Shield,
  Users,
  Target,
  Lightbulb,
  Gear,
  CloudArrowUp,
  ListChecks
} from '@phosphor-icons/react';

import {
  MemoryFile,
  MemoryEntry,
  AgentMemorySystem,
  MemoryProcessingPipeline,
  MemoryCreationRequest,
  AgentJournal,
  JournalEntry,
  MemoryVerificationCycle
} from '../types/memory';

interface AgentMemoryManagerProps {
  language: 'en' | 'ru';
  projectId: string;
  onMemoryCreated?: (memoryFile: MemoryFile) => void;
  onPipelineCompleted?: (pipeline: MemoryProcessingPipeline) => void;
}

// Переводы для интерфейса памяти агентов
const memoryTranslations = {
  en: {
    agentMemoryManager: 'Agent Memory Manager',
    agentMemoryDesc: 'Manage agent memory systems, debate logs, and knowledge base curation',
    memoryFiles: 'Memory Files',
    debateLogs: 'Debate Logs',
    agentJournals: 'Agent Journals',
    verificationPipeline: 'Verification Pipeline',
    createMemoryFile: 'Create Memory File',
    memoryFileCreated: 'Memory file created successfully',
    memoryFileFailed: 'Failed to create memory file',
    selectAgent: 'Select Agent',
    memoryFileName: 'Memory File Name',
    memoryFileDesc: 'Description',
    sourceType: 'Source Type',
    debateLogsSource: 'Debate Logs',
    auditResultsSource: 'Audit Results',
    manualEntrySource: 'Manual Entry',
    verification: 'Verification',
    enabled: 'Enabled',
    disabled: 'Disabled',
    silentVerification: 'Silent Verification',
    twoStageVerification: 'Two-Stage Verification',
    auditCuration: 'Audit Curation',
    memoryStatus: 'Memory Status',
    pending: 'Pending',
    processing: 'Processing',
    verifying: 'Verifying',
    curating: 'Curating',
    completed: 'Completed',
    failed: 'Failed',
    verified: 'Verified',
    active: 'Active',
    entries: 'Entries',
    relevance: 'Relevance',
    lastUpdated: 'Last Updated',
    viewMemory: 'View Memory',
    editMemory: 'Edit Memory',
    exportMemory: 'Export Memory',
    deleteMemory: 'Delete Memory',
    journalEntry: 'Journal Entry',
    importance: 'Importance',
    category: 'Category',
    debate: 'Debate',
    audit: 'Audit',
    decision: 'Decision',
    learning: 'Learning',
    error: 'Error',
    success: 'Success',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
    collecting: 'Collecting',
    stageProgress: 'Stage Progress',
    logCollection: 'Log Collection',
    auditReview: 'Audit Review',
    memoryCreation: 'Memory Creation',
    runningPipelines: 'Running Pipelines',
    completedPipelines: 'Completed Pipelines',
    noMemoryFiles: 'No memory files created yet',
    noPipelines: 'No processing pipelines running',
    createFirstMemory: 'Create your first memory file',
    agentNotSelected: 'Please select an agent first',
    memoryNameRequired: 'Memory file name is required',
    noLogsSelected: 'No logs selected for processing',
    verificationStarted: 'Verification process started',
    curationCompleted: 'Memory curation completed',
    backupCreated: 'Memory backup created',
    memoryRestored: 'Memory restored from backup'
  },
  ru: {
    agentMemoryManager: 'Менеджер Памяти Агентов',
    agentMemoryDesc: 'Управление системами памяти агентов, логами дебатов и курированием базы знаний',
    memoryFiles: 'Файлы Памяти',
    debateLogs: 'Логи Дебатов',
    agentJournals: 'Журналы Агентов',
    verificationPipeline: 'Конвейер Верификации',
    createMemoryFile: 'Создать Файл Памяти',
    memoryFileCreated: 'Файл памяти успешно создан',
    memoryFileFailed: 'Не удалось создать файл памяти',
    selectAgent: 'Выбрать Агента',
    memoryFileName: 'Название Файла Памяти',
    memoryFileDesc: 'Описание',
    sourceType: 'Тип Источника',
    debateLogsSource: 'Логи Дебатов',
    auditResultsSource: 'Результаты Аудита',
    manualEntrySource: 'Ручной Ввод',
    verification: 'Верификация',
    enabled: 'Включено',
    disabled: 'Отключено',
    silentVerification: 'Тихая Верификация',
    twoStageVerification: 'Двухэтапная Верификация',
    auditCuration: 'Курирование Аудита',
    memoryStatus: 'Статус Памяти',
    pending: 'Ожидание',
    processing: 'Обработка',
    verifying: 'Верификация',
    curating: 'Курирование',
    completed: 'Завершено',
    failed: 'Ошибка',
    verified: 'Проверено',
    active: 'Активно',
    entries: 'Записи',
    relevance: 'Релевантность',
    lastUpdated: 'Последнее Обновление',
    viewMemory: 'Просмотр Памяти',
    editMemory: 'Редактировать Память',
    exportMemory: 'Экспорт Памяти',
    deleteMemory: 'Удалить Память',
    journalEntry: 'Запись Журнала',
    importance: 'Важность',
    category: 'Категория',
    debate: 'Дебаты',
    audit: 'Аудит',
    decision: 'Решение',
    learning: 'Обучение',
    error: 'Ошибка',
    success: 'Успех',
    low: 'Низкая',
    medium: 'Средняя',
    high: 'Высокая',
    critical: 'Критическая',
    collecting: 'Сбор',
    stageProgress: 'Прогресс Этапа',
    logCollection: 'Сбор Логов',
    auditReview: 'Проверка Аудита',
    memoryCreation: 'Создание Памяти',
    runningPipelines: 'Активные Конвейеры',
    completedPipelines: 'Завершенные Конвейеры',
    noMemoryFiles: 'Файлы памяти еще не созданы',
    noPipelines: 'Нет запущенных конвейеров обработки',
    createFirstMemory: 'Создайте первый файл памяти',
    agentNotSelected: 'Сначала выберите агента',
    memoryNameRequired: 'Требуется название файла памяти',
    noLogsSelected: 'Не выбраны логи для обработки',
    verificationStarted: 'Процесс верификации запущен',
    curationCompleted: 'Курирование памяти завершено',
    backupCreated: 'Создан бэкап памяти',
    memoryRestored: 'Память восстановлена из бэкапа'
  }
};

export default function AgentMemoryManager({ 
  language, 
  projectId, 
  onMemoryCreated, 
  onPipelineCompleted 
}: AgentMemoryManagerProps) {
  const t = (key: keyof typeof memoryTranslations.en) => memoryTranslations[language][key];

  // Состояния для управления памятью агентов
  const [memoryFiles, setMemoryFiles] = useKV<MemoryFile[]>(`memory-files-${projectId}`, []);
  const [processingPipelines, setProcessingPipelines] = useKV<MemoryProcessingPipeline[]>(`memory-pipelines-${projectId}`, []);
  const [agentJournals, setAgentJournals] = useKV<AgentJournal[]>(`agent-journals-${projectId}`, []);
  
  // UI состояния
  const [selectedTab, setSelectedTab] = useState('memory-files');
  const [isCreatingMemory, setIsCreatingMemory] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [memoryName, setMemoryName] = useState('');
  const [memoryDescription, setMemoryDescription] = useState('');
  const [sourceType, setSourceType] = useState<'debate' | 'audit' | 'manual'>('debate');
  const [verificationEnabled, setVerificationEnabled] = useState(true);
  const [viewingMemory, setViewingMemory] = useState<MemoryFile | null>(null);

  // Доступные агенты для создания памяти
  const availableAgents = [
    { id: 'debate-agent-1', name: 'Debate Agent 1', type: 'debate' },
    { id: 'debate-agent-2', name: 'Debate Agent 2', type: 'debate' },
    { id: 'security-agent', name: 'Security Agent', type: 'audit' },
    { id: 'bias-agent', name: 'Bias Detection Agent', type: 'audit' },
    { id: 'performance-agent', name: 'Performance Agent', type: 'audit' },
    { id: 'compliance-agent', name: 'Compliance Agent', type: 'audit' }
  ];

  // Получить иконку для типа агента
  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
      case 'debate': return <Users size={20} />;
      case 'security': return <Shield size={20} />;
      case 'bias': return <Target size={20} />;
      case 'performance': return <ListChecks size={20} />;
      case 'compliance': return <CheckCircle size={20} />;
      default: return <Brain size={20} />;
    }
  };

  // Создать файл памяти
  const createMemoryFile = async () => {
    if (!selectedAgent) {
      toast.error(t('agentNotSelected'));
      return;
    }
    
    if (!memoryName.trim()) {
      toast.error(t('memoryNameRequired'));
      return;
    }

    const newMemoryFile: MemoryFile = {
      id: `memory-${Date.now()}`,
      agentId: selectedAgent,
      projectId,
      name: memoryName,
      description: memoryDescription,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      entries: [],
      metadata: {
        totalEntries: 0,
        averageRelevance: 0,
        verificationCycles: 0,
        lastVerification: ''
      },
      status: 'pending'
    };

    // Создать pipeline для обработки
    const pipeline: MemoryProcessingPipeline = {
      id: `pipeline-${Date.now()}`,
      request: {
        projectId,
        agentId: selectedAgent,
        sourceLogIds: [], // Будут заполнены при сборе логов
        name: memoryName,
        description: memoryDescription,
        triggerType: 'manual',
        verificationRequired: verificationEnabled
      },
      status: 'collecting',
      stages: {
        logCollection: {
          name: 'Log Collection',
          status: 'running',
          startTime: new Date().toISOString(),
          progress: 0,
          details: 'Starting log collection process...',
          logs: []
        },
        silentVerification: {
          name: 'Silent Verification',
          status: 'pending',
          progress: 0,
          details: 'Waiting for log collection to complete',
          logs: []
        },
        auditCuration: {
          name: 'Audit Curation',
          status: 'pending',
          progress: 0,
          details: 'Waiting for verification to complete',
          logs: []
        },
        memoryCreation: {
          name: 'Memory Creation',
          status: 'pending',
          progress: 0,
          details: 'Waiting for curation to complete',
          logs: []
        }
      }
    };

    setMemoryFiles(current => [...(current || []), newMemoryFile]);
    setProcessingPipelines(current => [...(current || []), pipeline]);
    
    // Запустить процесс создания памяти
    setTimeout(() => {
      processMemoryCreation(pipeline);
    }, 1000);

    setIsCreatingMemory(false);
    setMemoryName('');
    setMemoryDescription('');
    setSelectedAgent('');
    
    toast.success(t('memoryFileCreated'));
  };

  // Процесс создания памяти (симуляция для демонстрации)
  const processMemoryCreation = async (pipeline: MemoryProcessingPipeline) => {
    // Этап 1: Сбор логов
    await simulateStage('logCollection', pipeline, 3000);
    
    // Этап 2: Тихая верификация (если включена)
    if (pipeline.request.verificationRequired) {
      await simulateStage('silentVerification', pipeline, 5000);
    }
    
    // Этап 3: Курирование аудитом
    await simulateStage('auditCuration', pipeline, 4000);
    
    // Этап 4: Создание файла памяти
    await simulateStage('memoryCreation', pipeline, 2000);
    
    // Завершение
    setProcessingPipelines(current => 
      (current || []).map(p => 
        p.id === pipeline.id 
          ? { ...p, status: 'completed' as const }
          : p
      )
    );

    // Обновить файл памяти
    setMemoryFiles(current => 
      (current || []).map(f => 
        f.agentId === pipeline.request.agentId && f.name === pipeline.request.name
          ? { 
              ...f, 
              status: 'active' as const,
              lastUpdated: new Date().toISOString(),
              metadata: {
                ...f.metadata,
                verificationCycles: pipeline.request.verificationRequired ? 2 : 0,
                lastVerification: new Date().toISOString()
              }
            }
          : f
      )
    );

    if (onPipelineCompleted) {
      onPipelineCompleted(pipeline);
    }
    
    toast.success(t('curationCompleted'));
  };

  // Симуляция этапа обработки
  const simulateStage = async (stageName: keyof MemoryProcessingPipeline['stages'], pipeline: MemoryProcessingPipeline, duration: number) => {
    return new Promise<void>((resolve) => {
      const startTime = Date.now();
      
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        
        setProcessingPipelines(current => 
          (current || []).map(p => 
            p.id === pipeline.id 
              ? {
                  ...p,
                  stages: {
                    ...p.stages,
                    [stageName]: {
                      ...p.stages[stageName],
                      status: progress >= 100 ? 'completed' as const : 'running' as const,
                      progress,
                      endTime: progress >= 100 ? new Date().toISOString() : undefined,
                      details: progress >= 100 ? 'Stage completed successfully' : `Processing... ${Math.round(progress)}%`
                    }
                  }
                }
              : p
          )
        );
        
        if (progress >= 100) {
          resolve();
        } else {
          setTimeout(updateProgress, 100);
        }
      };
      
      updateProgress();
    });
  };

  // Получить статус badge цвет
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'verified':
        return 'default';
      case 'processing':
      case 'verifying':
      case 'curating':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database size={24} className="text-primary" />
          {t('agentMemoryManager')}
        </CardTitle>
        <CardDescription>
          {t('agentMemoryDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="memory-files">{t('memoryFiles')}</TabsTrigger>
            <TabsTrigger value="debate-logs">{t('debateLogs')}</TabsTrigger>
            <TabsTrigger value="journals">{t('agentJournals')}</TabsTrigger>
            <TabsTrigger value="pipeline">{t('verificationPipeline')}</TabsTrigger>
          </TabsList>

          {/* Memory Files Tab */}
          <TabsContent value="memory-files" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t('memoryFiles')}</h3>
              <Dialog open={isCreatingMemory} onOpenChange={setIsCreatingMemory}>
                <DialogTrigger asChild>
                  <Button>
                    <CloudArrowUp size={16} className="mr-2" />
                    {t('createMemoryFile')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('createMemoryFile')}</DialogTitle>
                    <DialogDescription>
                      {language === 'ru' 
                        ? 'Создайте новый файл памяти для агента из логов дебатов или результатов аудита'
                        : 'Create a new memory file for an agent from debate logs or audit results'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="agent-select">{t('selectAgent')}</Label>
                      <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectAgent')} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableAgents.map(agent => (
                            <SelectItem key={agent.id} value={agent.id}>
                              <div className="flex items-center gap-2">
                                {getAgentIcon(agent.type)}
                                {agent.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="memory-name">{t('memoryFileName')}</Label>
                      <Input
                        id="memory-name"
                        value={memoryName}
                        onChange={(e) => setMemoryName(e.target.value)}
                        placeholder={language === 'ru' ? 'Название файла памяти' : 'Memory file name'}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="memory-desc">{t('memoryFileDesc')}</Label>
                      <Textarea
                        id="memory-desc"
                        value={memoryDescription}
                        onChange={(e) => setMemoryDescription(e.target.value)}
                        placeholder={language === 'ru' ? 'Описание содержания памяти' : 'Description of memory contents'}
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label>{t('sourceType')}</Label>
                      <Select value={sourceType} onValueChange={(value: 'debate' | 'audit' | 'manual') => setSourceType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="debate">{t('debateLogsSource')}</SelectItem>
                          <SelectItem value="audit">{t('auditResultsSource')}</SelectItem>
                          <SelectItem value="manual">{t('manualEntrySource')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="verification"
                        checked={verificationEnabled}
                        onChange={(e) => setVerificationEnabled(e.target.checked)}
                      />
                      <Label htmlFor="verification">{t('silentVerification')}</Label>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreatingMemory(false)}>
                        {language === 'ru' ? 'Отмена' : 'Cancel'}
                      </Button>
                      <Button onClick={createMemoryFile}>
                        {t('createMemoryFile')}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {(!memoryFiles || memoryFiles.length === 0) ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Database size={48} className="mx-auto mb-4 opacity-50" />
                  <p>{t('noMemoryFiles')}</p>
                  <p className="text-sm">{t('createFirstMemory')}</p>
                </div>
              ) : (
                memoryFiles.map(memory => (
                  <Card key={memory.id} className="cyber-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getAgentIcon(availableAgents.find(a => a.id === memory.agentId)?.type || 'debate')}
                          <h4 className="font-medium">{memory.name}</h4>
                        </div>
                        <Badge variant={getStatusBadgeVariant(memory.status)}>
                          {t(memory.status as keyof typeof memoryTranslations.en)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{memory.description}</p>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">{t('entries')}: </span>
                          <span className="font-medium">{memory.metadata.totalEntries}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t('relevance')}: </span>
                          <span className="font-medium">{Math.round(memory.metadata.averageRelevance)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t('lastUpdated')}: </span>
                          <span className="font-medium">
                            {new Date(memory.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4">
                        <Button size="sm" variant="outline" onClick={() => setViewingMemory(memory)}>
                          <Eye size={14} className="mr-1" />
                          {t('viewMemory')}
                        </Button>
                        <Button size="sm" variant="outline">
                          <PencilSimple size={14} className="mr-1" />
                          {t('editMemory')}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download size={14} className="mr-1" />
                          {t('exportMemory')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-4">
            <h3 className="text-lg font-semibold">{t('verificationPipeline')}</h3>
            
            {/* Running Pipelines */}
            <div>
              <h4 className="font-medium mb-2">{t('runningPipelines')}</h4>
              {(!processingPipelines || processingPipelines.filter(p => p.status !== 'completed' && p.status !== 'failed').length === 0) ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  {t('noPipelines')}
                </div>
              ) : (
                <div className="space-y-3">
                  {processingPipelines
                    .filter(p => p.status !== 'completed' && p.status !== 'failed')
                    .map(pipeline => (
                      <Card key={pipeline.id} className="cyber-border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium">{pipeline.request.name}</h5>
                            <Badge variant="secondary">{t(pipeline.status as keyof typeof memoryTranslations.en)}</Badge>
                          </div>
                          
                          <div className="space-y-3">
                            {Object.entries(pipeline.stages).map(([key, stage]) => (
                              <div key={key} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span>{stage.name}</span>
                                  <span className="text-muted-foreground">{Math.round(stage.progress)}%</span>
                                </div>
                                <Progress value={stage.progress} className="h-2" />
                                <p className="text-xs text-muted-foreground">{stage.details}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  }
                </div>
              )}
            </div>
          </TabsContent>

          {/* Other tabs would be implemented similarly */}
          <TabsContent value="debate-logs" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>{language === 'ru' ? 'Логи дебатов будут отображаться здесь' : 'Debate logs will be displayed here'}</p>
            </div>
          </TabsContent>

          <TabsContent value="journals" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>{language === 'ru' ? 'Журналы агентов будут отображаться здесь' : 'Agent journals will be displayed here'}</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Memory Viewer Dialog */}
        <Dialog open={!!viewingMemory} onOpenChange={() => setViewingMemory(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain size={20} />
                {viewingMemory?.name}
              </DialogTitle>
              <DialogDescription>
                {viewingMemory?.description}
              </DialogDescription>
            </DialogHeader>
            
            {viewingMemory && (
              <ScrollArea className="h-[50vh]">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t('entries')}: </span>
                      <span className="font-medium">{viewingMemory.metadata.totalEntries}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('relevance')}: </span>
                      <span className="font-medium">{Math.round(viewingMemory.metadata.averageRelevance)}%</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">{language === 'ru' ? 'Записи памяти' : 'Memory Entries'}</h4>
                    {viewingMemory.entries.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        {language === 'ru' ? 'Записи еще не созданы' : 'No entries created yet'}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {viewingMemory.entries.map(entry => (
                          <div key={entry.id} className="border rounded p-3 text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant="outline">{t(entry.type as keyof typeof memoryTranslations.en)}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(entry.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p>{entry.content}</p>
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