import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Brain,
  FloppyDisk,
  ClockCounterClockwise,
  FileText,
  Robot,
  Database,
  CheckCircle,
  Warning,
  Info,
  Star,
  Trash,
  Download,
  Upload,
  Gear,
  Shield,
  Bug,
  Target,
  ArrowRight,
  Play,
  Pause,
  Stop
} from '@phosphor-icons/react';

interface AgentMemory {
  id: string;
  agentId: string;
  agentName: string;
  type: 'solution' | 'pattern' | 'issue' | 'insight' | 'decision';
  title: string;
  description: string;
  content: string;
  tags: string[];
  quality: number; // 1-100
  relevance: number; // 1-100
  confidence: number; // 1-100
  sourceLogs: string[]; // Log IDs that contributed to this memory
  relatedMemories: string[]; // Related memory IDs
  createdAt: string;
  lastAccessed: string;
  usageCount: number;
  projectId: string;
  context: {
    module: string;
    phase: string;
    participants: string[];
  };
}

interface MemoryBackupRequest {
  id: string;
  agentId: string;
  name: string;
  description: string;
  sourceLogs: string[];
  status: 'pending' | 'processing' | 'review' | 'completed' | 'failed';
  createdAt: string;
  processedAt?: string;
  reviewedAt?: string;
  extractedMemories: AgentMemory[];
  reviewNotes?: string;
}

interface DebateLog {
  id: string;
  sessionId: string;
  round: number;
  agentId: string;
  message: string;
  timestamp: string;
  quality: number;
  tags: string[];
  memoryExtracted: boolean;
}

interface AgentBackupMemoryProps {
  language: 'en' | 'ru';
  projectId: string;
  onMemoryCreated?: (memory: AgentMemory) => void;
  onBackupCompleted?: (request: MemoryBackupRequest) => void;
}

const translations = {
  // Agent Memory System
  agentMemory: { en: 'Agent Memory', ru: 'Память Агентов' },
  agentMemorySystem: { en: 'Agent Memory System', ru: 'Система Памяти Агентов' },
  memoryBackup: { en: 'Memory Backup', ru: 'Резервное Копирование Памяти' },
  logCollection: { en: 'Log Collection', ru: 'Сбор Логов' },
  memoryCreation: { en: 'Memory Creation', ru: 'Создание Памяти' },
  silentVerification: { en: 'Silent Verification', ru: 'Тихая Верификация' },
  auditCuration: { en: 'Audit Curation', ru: 'Курирование Аудитом' },
  debateMemory: { en: 'Debate Memory', ru: 'Память Дебатов' },
  agentLearning: { en: 'Agent Learning', ru: 'Обучение Агентов' },
  
  // Memory types
  solution: { en: 'Solution', ru: 'Решение' },
  pattern: { en: 'Pattern', ru: 'Паттерн' },
  issue: { en: 'Issue', ru: 'Проблема' },
  insight: { en: 'Insight', ru: 'Инсайт' },
  decision: { en: 'Decision', ru: 'Решение' },
  
  // Status
  pending: { en: 'Pending', ru: 'Ожидает' },
  processing: { en: 'Processing', ru: 'Обрабатывается' },
  review: { en: 'Review', ru: 'На Проверке' },
  completed: { en: 'Completed', ru: 'Завершено' },
  failed: { en: 'Failed', ru: 'Не удался' },
  
  // Actions
  createBackup: { en: 'Create Memory Backup', ru: 'Создать Резервную Копию Памяти' },
  processLogs: { en: 'Process Logs', ru: 'Обработать Логи' },
  startReview: { en: 'Start Review', ru: 'Начать Проверку' },
  approveMemory: { en: 'Approve Memory', ru: 'Утвердить Память' },
  rejectMemory: { en: 'Reject Memory', ru: 'Отклонить Память' },
  exportMemories: { en: 'Export Memories', ru: 'Экспортировать Память' },
  importMemories: { en: 'Import Memories', ru: 'Импортировать Память' },
  
  // Fields
  memoryTitle: { en: 'Memory Title', ru: 'Название Памяти' },
  memoryDescription: { en: 'Description', ru: 'Описание' },
  memoryContent: { en: 'Content', ru: 'Содержание' },
  memoryTags: { en: 'Tags', ru: 'Теги' },
  qualityScore: { en: 'Quality Score', ru: 'Оценка Качества' },
  relevanceScore: { en: 'Relevance', ru: 'Релевантность' },
  confidenceScore: { en: 'Confidence', ru: 'Достоверность' },
  sourceAgents: { en: 'Source Agents', ru: 'Агенты Источники' },
  
  // Messages
  memoryCreated: { en: 'Memory created successfully', ru: 'Память успешно создана' },
  backupCompleted: { en: 'Memory backup completed', ru: 'Резервное копирование памяти завершено' },
  reviewStarted: { en: 'Review process started', ru: 'Процесс проверки начат' },
  memoryApproved: { en: 'Memory approved and stored', ru: 'Память утверждена и сохранена' },
  memoryRejected: { en: 'Memory rejected', ru: 'Память отклонена' },
  logsProcessed: { en: 'Logs processed successfully', ru: 'Логи успешно обработаны' },
  
  // Tabs
  memoryLibrary: { en: 'Memory Library', ru: 'Библиотека Памяти' },
  backupRequests: { en: 'Backup Requests', ru: 'Запросы Резервирования' },
  reviewQueue: { en: 'Review Queue', ru: 'Очередь Проверки' },
  agentProfiles: { en: 'Agent Profiles', ru: 'Профили Агентов' }
};

const AgentBackupMemory: React.FC<AgentBackupMemoryProps> = ({
  language,
  projectId,
  onMemoryCreated,
  onBackupCompleted
}) => {
  const t = (key: string) => translations[key]?.[language] || key;
  
  const [memories, setMemories] = useKV<AgentMemory[]>(`agent-memories-${projectId}`, []);
  const [backupRequests, setBackupRequests] = useKV<MemoryBackupRequest[]>(`memory-backups-${projectId}`, []);
  const [debateLogs, setDebateLogs] = useKV<DebateLog[]>(`debate-logs-${projectId}`, []);
  
  const [activeTab, setActiveTab] = useState<'library' | 'backup' | 'review' | 'profiles'>('library');
  const [selectedMemory, setSelectedMemory] = useState<AgentMemory | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<MemoryBackupRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newMemoryForm, setNewMemoryForm] = useState({
    title: '',
    description: '',
    content: '',
    type: 'insight' as AgentMemory['type'],
    tags: '',
    agentId: 'user'
  });

  // Available agents for memory creation
  const availableAgents = [
    { id: 'user', name: 'User Input', type: 'manual' },
    { id: 'security-agent', name: 'Security Agent', type: 'ai' },
    { id: 'bias-agent', name: 'Bias Detection Agent', type: 'ai' },
    { id: 'performance-agent', name: 'Performance Agent', type: 'ai' },
    { id: 'compliance-agent', name: 'Compliance Agent', type: 'ai' },
    { id: 'debate-agent-1', name: 'Debate Agent Pro', type: 'ai' },
    { id: 'debate-agent-2', name: 'Debate Agent Counter', type: 'ai' },
    { id: 'moderator-agent', name: 'Moderator Agent', type: 'ai' }
  ];

  // Create a new memory backup request
  const createBackupRequest = async (agentId: string, logIds: string[]) => {
    const agent = availableAgents.find(a => a.id === agentId);
    if (!agent) return;

    const request: MemoryBackupRequest = {
      id: `backup-${Date.now()}`,
      agentId,
      name: `${agent.name} Memory Backup - ${new Date().toLocaleDateString()}`,
      description: `Automated memory extraction from ${logIds.length} debate logs`,
      sourceLogs: logIds,
      status: 'pending',
      createdAt: new Date().toISOString(),
      extractedMemories: []
    };

    setBackupRequests(current => [...(current || []), request]);
    toast.success(t('createBackup'));
    return request;
  };

  // Process logs to extract memories
  const processLogs = async (requestId: string) => {
    const request = backupRequests?.find(r => r.id === requestId);
    if (!request) return;

    setIsProcessing(true);
    
    // Update request status
    setBackupRequests(current => 
      (current || []).map(r => 
        r.id === requestId 
          ? { ...r, status: 'processing', processedAt: new Date().toISOString() }
          : r
      )
    );

    try {
      // Simulate AI processing of logs to extract memories
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock extracted memories
      const extractedMemories: AgentMemory[] = [
        {
          id: `memory-${Date.now()}-1`,
          agentId: request.agentId,
          agentName: availableAgents.find(a => a.id === request.agentId)?.name || 'Unknown',
          type: 'solution',
          title: language === 'ru' ? 'Эффективное решение проблемы интеграции' : 'Effective Integration Problem Solution',
          description: language === 'ru' 
            ? 'Найденное решение для типовой проблемы интеграции модулей'
            : 'Found solution for common module integration issue',
          content: language === 'ru'
            ? 'Подробное описание решения с примерами кода и конфигурации'
            : 'Detailed solution description with code examples and configuration',
          tags: ['integration', 'solution', 'modules'],
          quality: 85,
          relevance: 90,
          confidence: 88,
          sourceLogs: request.sourceLogs.slice(0, 2),
          relatedMemories: [],
          createdAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
          usageCount: 0,
          projectId,
          context: {
            module: 'integration',
            phase: 'development',
            participants: [request.agentId]
          }
        },
        {
          id: `memory-${Date.now()}-2`,
          agentId: request.agentId,
          agentName: availableAgents.find(a => a.id === request.agentId)?.name || 'Unknown',
          type: 'pattern',
          title: language === 'ru' ? 'Паттерн обработки ошибок' : 'Error Handling Pattern',
          description: language === 'ru' 
            ? 'Выявленный паттерн для обработки ошибок в системе'
            : 'Identified pattern for system error handling',
          content: language === 'ru'
            ? 'Описание паттерна с примерами применения'
            : 'Pattern description with usage examples',
          tags: ['error-handling', 'pattern', 'best-practice'],
          quality: 78,
          relevance: 85,
          confidence: 82,
          sourceLogs: request.sourceLogs.slice(1, 3),
          relatedMemories: [],
          createdAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
          usageCount: 0,
          projectId,
          context: {
            module: 'system',
            phase: 'design',
            participants: [request.agentId]
          }
        }
      ];

      // Update request with extracted memories and change status to review
      setBackupRequests(current => 
        (current || []).map(r => 
          r.id === requestId 
            ? { 
                ...r, 
                status: 'review', 
                extractedMemories,
                reviewedAt: new Date().toISOString()
              }
            : r
        )
      );

      toast.success(t('logsProcessed'));
    } catch (error) {
      console.error('Log processing error:', error);
      
      setBackupRequests(current => 
        (current || []).map(r => 
          r.id === requestId 
            ? { ...r, status: 'failed' }
            : r
        )
      );
      
      toast.error('Log processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Review and approve/reject memories
  const reviewMemory = async (requestId: string, memoryId: string, approve: boolean, notes?: string) => {
    const request = backupRequests?.find(r => r.id === requestId);
    const memory = request?.extractedMemories.find(m => m.id === memoryId);
    
    if (!request || !memory) return;

    if (approve) {
      // Add to permanent memory library
      setMemories(current => [...(current || []), memory]);
      onMemoryCreated?.(memory);
      toast.success(t('memoryApproved'));
    } else {
      toast.success(t('memoryRejected'));
    }

    // Remove the memory from extraction queue and add review notes
    setBackupRequests(current => 
      (current || []).map(r => 
        r.id === requestId 
          ? {
              ...r,
              extractedMemories: r.extractedMemories.filter(m => m.id !== memoryId),
              reviewNotes: notes,
              status: r.extractedMemories.length <= 1 ? 'completed' : 'review'
            }
          : r
      )
    );
  };

  // Create manual memory
  const createManualMemory = () => {
    if (!newMemoryForm.title.trim() || !newMemoryForm.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    const memory: AgentMemory = {
      id: `memory-${Date.now()}`,
      agentId: newMemoryForm.agentId,
      agentName: availableAgents.find(a => a.id === newMemoryForm.agentId)?.name || 'Unknown',
      type: newMemoryForm.type,
      title: newMemoryForm.title,
      description: newMemoryForm.description,
      content: newMemoryForm.content,
      tags: newMemoryForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      quality: 75,
      relevance: 80,
      confidence: 85,
      sourceLogs: [],
      relatedMemories: [],
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      usageCount: 0,
      projectId,
      context: {
        module: 'manual',
        phase: 'input',
        participants: [newMemoryForm.agentId]
      }
    };

    setMemories(current => [...(current || []), memory]);
    setNewMemoryForm({
      title: '',
      description: '',
      content: '',
      type: 'insight',
      tags: '',
      agentId: 'user'
    });
    
    onMemoryCreated?.(memory);
    toast.success(t('memoryCreated'));
  };

  // Generate sample logs for demonstration
  const generateSampleLogs = () => {
    const sampleLogs: DebateLog[] = [
      {
        id: `log-${Date.now()}-1`,
        sessionId: `session-${Date.now()}`,
        round: 1,
        agentId: 'debate-agent-1',
        message: 'Integration approach should prioritize modularity and loose coupling for better maintainability.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        quality: 85,
        tags: ['integration', 'architecture', 'modularity'],
        memoryExtracted: false
      },
      {
        id: `log-${Date.now()}-2`,
        sessionId: `session-${Date.now()}`,
        round: 1,
        agentId: 'debate-agent-2',
        message: 'Counter-argument: Tight coupling might be more efficient for performance-critical components.',
        timestamp: new Date(Date.now() - 3500000).toISOString(),
        quality: 78,
        tags: ['performance', 'coupling', 'optimization'],
        memoryExtracted: false
      },
      {
        id: `log-${Date.now()}-3`,
        sessionId: `session-${Date.now()}`,
        round: 2,
        agentId: 'moderator-agent',
        message: 'Both approaches have merit. The decision should be based on specific use case requirements.',
        timestamp: new Date(Date.now() - 3400000).toISOString(),
        quality: 92,
        tags: ['synthesis', 'decision', 'context'],
        memoryExtracted: false
      }
    ];

    setDebateLogs(current => [...(current || []), ...sampleLogs]);
    toast.success('Sample logs generated for demonstration');
  };

  // Get icon for memory type
  const getMemoryTypeIcon = (type: AgentMemory['type']) => {
    switch (type) {
      case 'solution': return <CheckCircle size={16} className="text-green-500" />;
      case 'pattern': return <Target size={16} className="text-blue-500" />;
      case 'issue': return <Warning size={16} className="text-red-500" />;
      case 'insight': return <Brain size={16} className="text-purple-500" />;
      case 'decision': return <Shield size={16} className="text-orange-500" />;
      default: return <Info size={16} className="text-gray-500" />;
    }
  };

  // Get status badge variant
  const getStatusVariant = (status: MemoryBackupRequest['status']) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'review': return 'outline';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain size={24} className="text-primary" />
            {t('agentMemorySystem')}
          </CardTitle>
          <CardDescription>
            {language === 'ru' 
              ? 'Система управления памятью агентов для сбора и сохранения важной информации'
              : 'Agent memory management system for collecting and storing important information'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'library' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('library')}
            >
              <Database size={16} className="mr-2" />
              {t('memoryLibrary')}
            </Button>
            <Button
              variant={activeTab === 'backup' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('backup')}
            >
              <FloppyDisk size={16} className="mr-2" />
              {t('backupRequests')}
            </Button>
            <Button
              variant={activeTab === 'review' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('review')}
            >
              <ClockCounterClockwise size={16} className="mr-2" />
              {t('reviewQueue')}
            </Button>
            <Button
              variant={activeTab === 'profiles' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('profiles')}
            >
              <Robot size={16} className="mr-2" />
              {t('agentProfiles')}
            </Button>
          </div>

          {/* Memory Library Tab */}
          {activeTab === 'library' && (
            <div className="space-y-6">
              {/* Create Manual Memory */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('memoryCreation')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="memory-title">{t('memoryTitle')}</Label>
                      <Input
                        id="memory-title"
                        value={newMemoryForm.title}
                        onChange={(e) => setNewMemoryForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter memory title..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="memory-type">Type</Label>
                      <Select
                        value={newMemoryForm.type}
                        onValueChange={(value: AgentMemory['type']) => 
                          setNewMemoryForm(prev => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solution">{t('solution')}</SelectItem>
                          <SelectItem value="pattern">{t('pattern')}</SelectItem>
                          <SelectItem value="issue">{t('issue')}</SelectItem>
                          <SelectItem value="insight">{t('insight')}</SelectItem>
                          <SelectItem value="decision">{t('decision')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="memory-description">{t('memoryDescription')}</Label>
                    <Input
                      id="memory-description"
                      value={newMemoryForm.description}
                      onChange={(e) => setNewMemoryForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="memory-content">{t('memoryContent')}</Label>
                    <Textarea
                      id="memory-content"
                      value={newMemoryForm.content}
                      onChange={(e) => setNewMemoryForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Detailed memory content..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="memory-tags">{t('memoryTags')}</Label>
                      <Input
                        id="memory-tags"
                        value={newMemoryForm.tags}
                        onChange={(e) => setNewMemoryForm(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
                    <div>
                      <Label htmlFor="memory-agent">Agent</Label>
                      <Select
                        value={newMemoryForm.agentId}
                        onValueChange={(value) => 
                          setNewMemoryForm(prev => ({ ...prev, agentId: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableAgents.map(agent => (
                            <SelectItem key={agent.id} value={agent.id}>
                              {agent.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button onClick={createManualMemory} className="w-full">
                    <Brain size={16} className="mr-2" />
                    {t('memoryCreation')}
                  </Button>
                </CardContent>
              </Card>

              {/* Memory List */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t('memoryLibrary')}</h3>
                {!memories || memories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain size={48} className="mx-auto mb-4" />
                    <p>No memories stored yet</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {memories.map(memory => (
                      <Card key={memory.id} className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setSelectedMemory(memory)}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {getMemoryTypeIcon(memory.type)}
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium line-clamp-1">{memory.title}</h4>
                                <p className="text-xs text-muted-foreground">{memory.agentName}</p>
                              </div>
                            </div>
                            <Badge variant="secondary">{t(memory.type)}</Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {memory.description}
                          </p>
                          
                          <div className="flex gap-1 mb-3 flex-wrap">
                            {memory.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {memory.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{memory.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid gap-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span>{t('qualityScore')}:</span>
                              <div className="flex items-center gap-2">
                                <Progress value={memory.quality} className="w-16 h-1" />
                                <span>{memory.quality}%</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>{t('relevanceScore')}:</span>
                              <div className="flex items-center gap-2">
                                <Progress value={memory.relevance} className="w-16 h-1" />
                                <span>{memory.relevance}%</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                            <span>{new Date(memory.createdAt).toLocaleDateString()}</span>
                            <span>Used: {memory.usageCount} times</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Backup Requests Tab */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{t('backupRequests')}</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateSampleLogs}
                  >
                    <Upload size={16} className="mr-2" />
                    Generate Sample Logs
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      const logIds = (debateLogs || []).slice(0, 3).map(log => log.id);
                      createBackupRequest('debate-agent-1', logIds);
                    }}
                    disabled={!debateLogs || debateLogs.length === 0}
                  >
                    <FloppyDisk size={16} className="mr-2" />
                    {t('createBackup')}
                  </Button>
                </div>
              </div>

              {!backupRequests || backupRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FloppyDisk size={48} className="mx-auto mb-4" />
                  <p>No backup requests yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {backupRequests.map(request => (
                    <Card key={request.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{request.name}</h4>
                            <p className="text-sm text-muted-foreground">{request.description}</p>
                          </div>
                          <Badge variant={getStatusVariant(request.status)}>
                            {t(request.status)}
                          </Badge>
                        </div>
                        
                        <div className="grid gap-2 text-sm mb-4">
                          <div className="flex items-center justify-between">
                            <span>Agent:</span>
                            <span>{availableAgents.find(a => a.id === request.agentId)?.name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Source Logs:</span>
                            <span>{request.sourceLogs.length}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Created:</span>
                            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                          </div>
                          {request.extractedMemories.length > 0 && (
                            <div className="flex items-center justify-between">
                              <span>Extracted Memories:</span>
                              <span>{request.extractedMemories.length}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {request.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => processLogs(request.id)}
                              disabled={isProcessing}
                            >
                              <Play size={16} className="mr-2" />
                              {t('processLogs')}
                            </Button>
                          )}
                          {request.status === 'processing' && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                              Processing...
                            </div>
                          )}
                          {request.status === 'review' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <ClockCounterClockwise size={16} className="mr-2" />
                              {t('startReview')}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Review Queue Tab */}
          {activeTab === 'review' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">{t('reviewQueue')}</h3>
              
              {selectedRequest ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRequest(null)}
                    >
                      <ArrowRight size={16} className="mr-2 rotate-180" />
                      Back
                    </Button>
                    <h4 className="font-medium">{selectedRequest.name}</h4>
                  </div>
                  
                  {selectedRequest.extractedMemories.map(memory => (
                    <Card key={memory.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getMemoryTypeIcon(memory.type)}
                            <div>
                              <h5 className="font-medium">{memory.title}</h5>
                              <p className="text-sm text-muted-foreground">{memory.description}</p>
                            </div>
                          </div>
                          <Badge variant="secondary">{t(memory.type)}</Badge>
                        </div>
                        
                        <div className="p-3 bg-muted rounded-lg mb-4">
                          <p className="text-sm">{memory.content}</p>
                        </div>
                        
                        <div className="grid gap-2 text-xs mb-4">
                          <div className="flex items-center justify-between">
                            <span>{t('qualityScore')}:</span>
                            <div className="flex items-center gap-2">
                              <Progress value={memory.quality} className="w-20 h-1" />
                              <span>{memory.quality}%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>{t('confidenceScore')}:</span>
                            <div className="flex items-center gap-2">
                              <Progress value={memory.confidence} className="w-20 h-1" />
                              <span>{memory.confidence}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => reviewMemory(selectedRequest.id, memory.id, true)}
                          >
                            <CheckCircle size={16} className="mr-2" />
                            {t('approveMemory')}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => reviewMemory(selectedRequest.id, memory.id, false)}
                          >
                            <Trash size={16} className="mr-2" />
                            {t('rejectMemory')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {backupRequests?.filter(r => r.status === 'review' && r.extractedMemories.length > 0).map(request => (
                    <Card key={request.id} className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedRequest(request)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{request.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {request.extractedMemories.length} memories awaiting review
                            </p>
                          </div>
                          <ArrowRight size={16} className="text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      <ClockCounterClockwise size={48} className="mx-auto mb-4" />
                      <p>No memories awaiting review</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Agent Profiles Tab */}
          {activeTab === 'profiles' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">{t('agentProfiles')}</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                {availableAgents.map(agent => {
                  const agentMemories = memories?.filter(m => m.agentId === agent.id) || [];
                  const totalUsage = agentMemories.reduce((sum, m) => sum + m.usageCount, 0);
                  const avgQuality = agentMemories.length > 0 
                    ? agentMemories.reduce((sum, m) => sum + m.quality, 0) / agentMemories.length 
                    : 0;

                  return (
                    <Card key={agent.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <Robot size={24} className="text-primary" />
                          <div>
                            <h4 className="font-medium">{agent.name}</h4>
                            <Badge variant={agent.type === 'ai' ? 'default' : 'secondary'}>
                              {agent.type.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid gap-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span>Stored Memories:</span>
                            <Badge variant="outline">{agentMemories.length}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Total Usage:</span>
                            <span>{totalUsage}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Average Quality:</span>
                            <div className="flex items-center gap-2">
                              <Progress value={avgQuality} className="w-16 h-1" />
                              <span>{Math.round(avgQuality)}%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Memory Types:</span>
                            <div className="flex gap-1">
                              {Array.from(new Set(agentMemories.map(m => m.type))).map(type => (
                                <Badge key={type} variant="outline" className="text-xs">
                                  {t(type)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Memory Detail Modal */}
      {selectedMemory && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getMemoryTypeIcon(selectedMemory.type)}
                {selectedMemory.title}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setSelectedMemory(null)}>
                ×
              </Button>
            </div>
            <CardDescription>
              {selectedMemory.agentName} • {new Date(selectedMemory.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Description</Label>
              <p className="text-sm">{selectedMemory.description}</p>
            </div>
            
            <div>
              <Label>Content</Label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{selectedMemory.content}</p>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>{t('qualityScore')}</Label>
                <div className="flex items-center gap-2">
                  <Progress value={selectedMemory.quality} className="flex-1" />
                  <span className="text-sm">{selectedMemory.quality}%</span>
                </div>
              </div>
              <div>
                <Label>{t('relevanceScore')}</Label>
                <div className="flex items-center gap-2">
                  <Progress value={selectedMemory.relevance} className="flex-1" />
                  <span className="text-sm">{selectedMemory.relevance}%</span>
                </div>
              </div>
              <div>
                <Label>{t('confidenceScore')}</Label>
                <div className="flex items-center gap-2">
                  <Progress value={selectedMemory.confidence} className="flex-1" />
                  <span className="text-sm">{selectedMemory.confidence}%</span>
                </div>
              </div>
            </div>
            
            {selectedMemory.tags.length > 0 && (
              <div>
                <Label>Tags</Label>
                <div className="flex gap-1 flex-wrap">
                  {selectedMemory.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Usage Count:</span>
                <span>{selectedMemory.usageCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Accessed:</span>
                <span>{new Date(selectedMemory.lastAccessed).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Source Logs:</span>
                <span>{selectedMemory.sourceLogs.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgentBackupMemory;