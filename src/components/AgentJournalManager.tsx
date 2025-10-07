import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  FileText,
  Plus,
  Clock,
  Tag,
  Star,
  CheckCircle,
  Warning,
  PencilSimple,
  Trash,
  Download,
  Eye,
  Brain,
  Shield,
  Users,
  Target,
  ListChecks,
  Robot,
  ChatCircle,
  Gear
} from '@phosphor-icons/react';

import { AgentJournal, JournalEntry } from '../types/memory';

interface AgentJournalManagerProps {
  language: 'en' | 'ru';
  projectId: string;
  onEntryCreated?: (entry: JournalEntry) => void;
  onJournalExported?: (journal: AgentJournal) => void;
}

// Переводы для системы журналов агентов
const journalTranslations = {
  en: {
    agentJournalManager: 'Agent Journal Manager',
    agentJournalDesc: 'Manage agent journals, track learning progress, and document decisions',
    agentJournals: 'Agent Journals',
    journalEntries: 'Journal Entries',
    addEntry: 'Add Entry',
    createJournal: 'Create Journal',
    entryCreated: 'Journal entry created',
    entryFailed: 'Failed to create journal entry',
    selectAgent: 'Select Agent',
    entryTitle: 'Entry Title',
    entryContent: 'Content',
    entryCategory: 'Category',
    entryImportance: 'Importance',
    entryTags: 'Tags',
    addTags: 'Add tags (comma separated)',
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
    noJournals: 'No agent journals created yet',
    noEntries: 'No journal entries',
    createFirstJournal: 'Create your first agent journal',
    viewJournal: 'View Journal',
    editEntry: 'Edit Entry',
    deleteEntry: 'Delete Entry',
    exportJournal: 'Export Journal',
    totalEntries: 'Total Entries',
    lastEntry: 'Last Entry',
    categories: 'Categories',
    importance: 'Importance',
    timestamp: 'Timestamp',
    relatedMemories: 'Related Memories',
    projectContext: 'Project Context',
    module: 'Module',
    phase: 'Phase',
    completeness: 'Completeness',
    journalSummary: 'Journal Summary',
    entryDetails: 'Entry Details',
    mostActive: 'Most Active',
    recentActivity: 'Recent Activity',
    learningProgress: 'Learning Progress',
    decisionTracking: 'Decision Tracking',
    errorAnalysis: 'Error Analysis',
    successPatterns: 'Success Patterns',
    updateAllStatuses: 'Update All Work Statuses',
    statusUpdateComplete: 'Status update complete',
    statusUpdateFailed: 'Status update failed',
    workStatus: 'Work Status',
    inProgress: 'In Progress',
    completed: 'Completed',
    failed: 'Failed',
    urgent: 'Urgent',
    onHold: 'On Hold',
    unknown: 'Unknown',
    systemJournal: 'System Journal',
    criticalBlockTask: 'Critical Block Task',
    noJournalsToUpdate: 'No journals to update',
    updatingStatuses: 'Updating work statuses...',
    statusesUpdated: 'Statuses updated successfully! Processed'
  },
  ru: {
    agentJournalManager: 'Менеджер Журналов Агентов',
    agentJournalDesc: 'Управление журналами агентов, отслеживание прогресса обучения и документирование решений',
    agentJournals: 'Журналы Агентов',
    journalEntries: 'Записи Журнала',
    addEntry: 'Добавить Запись',
    createJournal: 'Создать Журнал',
    entryCreated: 'Запись журнала создана',
    entryFailed: 'Не удалось создать запись журнала',
    selectAgent: 'Выбрать Агента',
    entryTitle: 'Заголовок Записи',
    entryContent: 'Содержание',
    entryCategory: 'Категория',
    entryImportance: 'Важность',
    entryTags: 'Теги',
    addTags: 'Добавить теги (через запятую)',
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
    noJournals: 'Журналы агентов еще не созданы',
    noEntries: 'Нет записей в журнале',
    createFirstJournal: 'Создайте первый журнал агента',
    viewJournal: 'Просмотр Журнала',
    editEntry: 'Редактировать Запись',
    deleteEntry: 'Удалить Запись',
    exportJournal: 'Экспорт Журнала',
    totalEntries: 'Всего Записей',
    lastEntry: 'Последняя Запись',
    categories: 'Категории',
    importance: 'Важность',
    timestamp: 'Время',
    relatedMemories: 'Связанные Воспоминания',
    projectContext: 'Контекст Проекта',
    module: 'Модуль',
    phase: 'Фаза',
    completeness: 'Завершенность',
    journalSummary: 'Сводка Журнала',
    entryDetails: 'Детали Записи',
    mostActive: 'Наиболее Активный',
    recentActivity: 'Недавняя Активность',
    learningProgress: 'Прогресс Обучения',
    decisionTracking: 'Отслеживание Решений',
    errorAnalysis: 'Анализ Ошибок',
    successPatterns: 'Паттерны Успеха',
    updateAllStatuses: 'Обновить Все Статусы Работ',
    statusUpdateComplete: 'Обновление статусов завершено',
    statusUpdateFailed: 'Ошибка обновления статусов',
    workStatus: 'Статус Работы',
    inProgress: 'В Процессе',
    completed: 'Завершено',
    failed: 'Неудача',
    urgent: 'Срочно',
    onHold: 'Приостановлено',
    unknown: 'Неизвестно',
    systemJournal: 'Системный Журнал',
    criticalBlockTask: 'Критическое Задание Блока',
    noJournalsToUpdate: 'Нет журналов для обновления',
    updatingStatuses: 'Обновление статусов работ...',
    statusesUpdated: 'Статусы обновлены успешно! Обработано'
  }
};

export default function AgentJournalManager({ 
  language, 
  projectId, 
  onEntryCreated, 
  onJournalExported 
}: AgentJournalManagerProps) {
  const t = (key: keyof typeof journalTranslations.en) => journalTranslations[language][key];

  // Состояния для управления журналами агентов
  const [agentJournals, setAgentJournals] = useKV<AgentJournal[]>(`agent-journals-${projectId}`, []);
  const [selectedJournal, setSelectedJournal] = useState<AgentJournal | null>(null);
  
  // UI состояния
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [isViewingJournal, setIsViewingJournal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [entryTitle, setEntryTitle] = useState('');
  const [entryContent, setEntryContent] = useState('');
  const [entryCategory, setEntryCategory] = useState<JournalEntry['category']>('learning');
  const [entryImportance, setEntryImportance] = useState<JournalEntry['importance']>('medium');
  const [entryTags, setEntryTags] = useState('');

  // Доступные агенты
  const availableAgents = [
    { id: 'system-journal', name: language === 'ru' ? 'Системный Журнал' : 'System Journal', type: 'system' },
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
      case 'system': return <Gear size={16} />;
      case 'debate': return <Users size={16} />;
      case 'security': return <Shield size={16} />;
      case 'bias': return <Target size={16} />;
      case 'performance': return <ListChecks size={16} />;
      case 'compliance': return <CheckCircle size={16} />;
      default: return <Robot size={16} />;
    }
  };

  // Получить иконку для категории записи
  const getCategoryIcon = (category: JournalEntry['category']) => {
    switch (category) {
      case 'debate': return <ChatCircle size={16} className="text-blue-500" />;
      case 'audit': return <Shield size={16} className="text-orange-500" />;
      case 'decision': return <Target size={16} className="text-green-500" />;
      case 'learning': return <Brain size={16} className="text-purple-500" />;
      case 'error': return <Warning size={16} className="text-red-500" />;
      case 'success': return <CheckCircle size={16} className="text-green-600" />;
      default: return <FileText size={16} />;
    }
  };

  // Получить цвет badge для важности
  const getImportanceBadgeVariant = (importance: JournalEntry['importance']) => {
    switch (importance) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  // Найти или создать журнал для агента
  const findOrCreateJournal = (agentId: string): AgentJournal => {
    let journal = agentJournals?.find(j => j.agentId === agentId && j.projectId === projectId);
    
    if (!journal) {
      journal = {
        agentId,
        projectId,
        entries: [],
        metadata: {
          startDate: new Date().toISOString(),
          lastEntry: '',
          totalEntries: 0,
          categories: {}
        }
      };
      
      setAgentJournals(current => [...(current || []), journal!]);
    }
    
    return journal;
  };

  // Добавить запись в журнал
  const addJournalEntry = () => {
    if (!selectedAgent || !entryTitle.trim() || !entryContent.trim()) {
      toast.error(t('entryFailed'));
      return;
    }

    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: entryCategory,
      title: entryTitle,
      content: entryContent,
      importance: entryImportance,
      relatedMemories: [],
      tags: entryTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      projectContext: {
        module: 'journal',
        phase: 'documentation',
        completeness: 0
      }
    };

    // Обновить журнал агента
    setAgentJournals(current => 
      (current || []).map(journal => {
        if (journal.agentId === selectedAgent && journal.projectId === projectId) {
          const updatedCategories = { ...journal.metadata.categories };
          updatedCategories[entryCategory] = (updatedCategories[entryCategory] || 0) + 1;
          
          return {
            ...journal,
            entries: [...journal.entries, newEntry],
            metadata: {
              ...journal.metadata,
              lastEntry: new Date().toISOString(),
              totalEntries: journal.entries.length + 1,
              categories: updatedCategories
            }
          };
        }
        return journal;
      })
    );

    // Если журнал не существовал, создаем новый
    if (!agentJournals?.find(j => j.agentId === selectedAgent && j.projectId === projectId)) {
      const newJournal: AgentJournal = {
        agentId: selectedAgent,
        projectId,
        entries: [newEntry],
        metadata: {
          startDate: new Date().toISOString(),
          lastEntry: new Date().toISOString(),
          totalEntries: 1,
          categories: { [entryCategory]: 1 }
        }
      };
      
      setAgentJournals(current => [...(current || []), newJournal]);
    }

    // Очистить форму
    setEntryTitle('');
    setEntryContent('');
    setEntryTags('');
    setIsAddingEntry(false);
    
    if (onEntryCreated) {
      onEntryCreated(newEntry);
    }
    
    toast.success(t('entryCreated'));
  };

  // Обновить статусы всех работ в рабочих журналах
  const updateAllWorkStatuses = async () => {
    if (!agentJournals || agentJournals.length === 0) {
      toast.info(language === 'ru' ? 'Нет журналов для обновления' : 'No journals to update');
      return;
    }

    toast.info(language === 'ru' ? 'Обновление статусов работ...' : 'Updating work statuses...');

    // Перебираем все журналы и обновляем статусы записей
    setAgentJournals(current => 
      (current || []).map(journal => {
        const updatedEntries = journal.entries.map(entry => {
          // Определяем статус на основе категории и важности
          let workStatus: 'in-progress' | 'completed' | 'failed' | 'urgent' | 'on-hold' | 'unknown' = 'in-progress';
          
          if (entry.category === 'success') {
            workStatus = 'completed';
          } else if (entry.category === 'error') {
            workStatus = 'failed';
          } else if (entry.category === 'decision' && entry.importance === 'high') {
            workStatus = 'completed';
          } else if (entry.category === 'audit' && entry.importance === 'critical') {
            workStatus = 'urgent';
          } else if (entry.category === 'learning') {
            workStatus = 'in-progress';
          }

          // Обновляем контекст проекта с новым статусом
          const updatedContext = {
            ...entry.projectContext,
            workStatus,
            lastUpdated: new Date().toISOString(),
            completeness: entry.category === 'success' ? 100 : 
                         entry.category === 'error' ? 0 :
                         entry.projectContext.completeness || 50
          };

          return {
            ...entry,
            projectContext: updatedContext,
            // Добавляем тег со статусом если его еще нет
            tags: entry.tags.includes(`status:${workStatus}`) 
              ? entry.tags 
              : [...entry.tags, `status:${workStatus}`]
          };
        });

        // Обновляем метаданные журнала
        const statusCounts = updatedEntries.reduce((acc, entry) => {
          const status = entry.projectContext.workStatus || 'unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const updatedMetadata = {
          ...journal.metadata,
          lastStatusUpdate: new Date().toISOString(),
          statusDistribution: statusCounts,
          overallProgress: Math.round(
            ((statusCounts.completed || 0) / updatedEntries.length) * 100
          )
        };

        return {
          ...journal,
          entries: updatedEntries,
          metadata: updatedMetadata
        };
      })
    );

    // Создаем сводную запись об обновлении статусов
    const statusUpdateEntry: JournalEntry = {
      id: `status-update-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'success',
      title: language === 'ru' ? 'Обновление статусов работ завершено' : 'Work status update completed',
      content: language === 'ru' 
        ? `Выполнено критическое задание блока: обновлены статусы всех проделанных работ в рабочих журналах. Обновлено журналов: ${agentJournals.length}. Время обновления: ${new Date().toLocaleString()}`
        : `Critical block task completed: updated statuses of all completed work in working journals. Updated journals: ${agentJournals.length}. Update time: ${new Date().toLocaleString()}`,
      importance: 'high',
      relatedMemories: [],
      tags: ['status-update', 'block-task', 'critical', 'completed'],
      projectContext: {
        module: 'journal-manager',
        phase: 'status-synchronization',
        completeness: 100,
        workStatus: 'completed',
        lastUpdated: new Date().toISOString()
      }
    };

    // Добавляем запись в системный журнал
    const systemJournal = findOrCreateJournal('system-journal');
    setAgentJournals(current => 
      (current || []).map(journal => {
        if (journal.agentId === 'system-journal' && journal.projectId === projectId) {
          return {
            ...journal,
            entries: [...journal.entries, statusUpdateEntry],
            metadata: {
              ...journal.metadata,
              lastEntry: new Date().toISOString(),
              totalEntries: journal.entries.length + 1,
              categories: {
                ...journal.metadata.categories,
                success: (journal.metadata.categories.success || 0) + 1
              }
            }
          };
        }
        return journal;
      })
    );

    // Если системного журнала не было, создаем его
    if (!agentJournals?.find(j => j.agentId === 'system-journal' && j.projectId === projectId)) {
      const newSystemJournal: AgentJournal = {
        agentId: 'system-journal',
        projectId,
        entries: [statusUpdateEntry],
        metadata: {
          startDate: new Date().toISOString(),
          lastEntry: new Date().toISOString(),
          totalEntries: 1,
          categories: { success: 1 },
          lastStatusUpdate: new Date().toISOString(),
          statusDistribution: { completed: 1 },
          overallProgress: 100
        }
      };
      
      setAgentJournals(current => [...(current || []), newSystemJournal]);
    }

    toast.success(
      language === 'ru' 
        ? `Статусы обновлены успешно! Обработано ${agentJournals.length} журналов.`
        : `Statuses updated successfully! Processed ${agentJournals.length} journals.`
    );
  };

  // Создать начальные записи с выполненными работами для демонстрации
  const createInitialWorkEntries = () => {
    if (!selectedAgent) {
      toast.error(language === 'ru' ? 'Выберите агента' : 'Select an agent');
      return;
    }

    // Создаем несколько записей с разными статусами
    const initialEntries: Omit<JournalEntry, 'id'>[] = [
      {
        timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 дня назад
        category: 'success',
        title: language === 'ru' ? 'Завершена интеграция модуля аудита' : 'Audit module integration completed',
        content: language === 'ru' ? 
          'Успешно завершена интеграция модуля аудита с основной системой. Все тесты пройдены, функциональность проверена.' :
          'Successfully completed audit module integration with main system. All tests passed, functionality verified.',
        importance: 'high',
        relatedMemories: [],
        tags: ['integration', 'audit', 'completed'],
        projectContext: {
          module: 'audit-integration',
          phase: 'implementation',
          completeness: 100
        }
      },
      {
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 дня назад
        category: 'learning',
        title: language === 'ru' ? 'Изучение протокола Киплинга' : 'Kipling protocol learning',
        content: language === 'ru' ? 
          'Проведен анализ и изучение протокола Киплинга для улучшения аналитических возможностей системы.' :
          'Conducted analysis and study of Kipling protocol to improve system analytical capabilities.',
        importance: 'medium',
        relatedMemories: [],
        tags: ['learning', 'kipling', 'analysis'],
        projectContext: {
          module: 'kipling-protocol',
          phase: 'research',
          completeness: 75
        }
      },
      {
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 день назад
        category: 'audit',
        title: language === 'ru' ? 'Критический аудит безопасности' : 'Critical security audit',
        content: language === 'ru' ? 
          'Обнаружены критические уязвимости в системе аутентификации. Требуется немедленное исправление.' :
          'Critical vulnerabilities discovered in authentication system. Immediate fix required.',
        importance: 'critical',
        relatedMemories: [],
        tags: ['security', 'critical', 'vulnerability'],
        projectContext: {
          module: 'authentication',
          phase: 'audit',
          completeness: 30
        }
      },
      {
        timestamp: new Date().toISOString(), // сейчас
        category: 'decision',
        title: language === 'ru' ? 'Решение о приоритетах разработки' : 'Development priorities decision',
        content: language === 'ru' ? 
          'Принято решение сосредоточиться на исправлении уязвимостей безопасности как на высшем приоритете.' :
          'Decision made to focus on security vulnerability fixes as highest priority.',
        importance: 'high',
        relatedMemories: [],
        tags: ['decision', 'priorities', 'security'],
        projectContext: {
          module: 'project-management',
          phase: 'planning',
          completeness: 90
        }
      }
    ];

    // Добавляем записи в журнал
    initialEntries.forEach(entryData => {
      const newEntry: JournalEntry = {
        ...entryData,
        id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      // Обновляем журнал агента
      setAgentJournals(current => {
        const updated = (current || []).map(journal => {
          if (journal.agentId === selectedAgent && journal.projectId === projectId) {
            const updatedCategories = { ...journal.metadata.categories };
            updatedCategories[entryData.category] = (updatedCategories[entryData.category] || 0) + 1;
            
            return {
              ...journal,
              entries: [...journal.entries, newEntry],
              metadata: {
                ...journal.metadata,
                lastEntry: new Date().toISOString(),
                totalEntries: journal.entries.length + 1,
                categories: updatedCategories
              }
            };
          }
          return journal;
        });

        // Если журнал не существовал, создаем новый
        if (!current?.find(j => j.agentId === selectedAgent && j.projectId === projectId)) {
          const categoriesCount = initialEntries.reduce((acc, entry) => {
            acc[entry.category] = (acc[entry.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const newJournal: AgentJournal = {
            agentId: selectedAgent,
            projectId,
            entries: initialEntries.map((entryData, index) => ({
              ...entryData,
              id: `entry-${Date.now()}-${index}`
            })),
            metadata: {
              startDate: new Date(Date.now() - 86400000 * 3).toISOString(),
              lastEntry: new Date().toISOString(),
              totalEntries: initialEntries.length,
              categories: categoriesCount
            }
          };
          
          return [...(current || []), newJournal];
        }

        return updated;
      });
    });

    toast.success(
      language === 'ru' ? 
        `Создано ${initialEntries.length} записей с выполненными работами` :
        `Created ${initialEntries.length} entries with completed work`
    );
  };

  // Экспортировать журнал
  const exportJournal = (journal: AgentJournal) => {
    const exportData = {
      agent: availableAgents.find(a => a.id === journal.agentId)?.name || journal.agentId,
      project: projectId,
      exported: new Date().toISOString(),
      metadata: journal.metadata,
      entries: journal.entries.map(entry => ({
        timestamp: entry.timestamp,
        category: entry.category,
        title: entry.title,
        content: entry.content,
        importance: entry.importance,
        tags: entry.tags,
        context: entry.projectContext
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-journal-${journal.agentId}-${projectId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (onJournalExported) {
      onJournalExported(journal);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText size={24} className="text-primary" />
          {t('agentJournalManager')}
        </CardTitle>
        <CardDescription>
          {t('agentJournalDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Control Buttons */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <Button 
                  onClick={updateAllWorkStatuses}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={!agentJournals || agentJournals.length === 0}
                >
                  <CheckCircle size={16} className="mr-2" />
                  {t('updateAllStatuses')}
                </Button>
                
                <div className="flex items-center gap-2">
                  <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={language === 'ru' ? 'Выберите агента' : 'Select agent'} />
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
                  
                  <Button 
                    onClick={createInitialWorkEntries}
                    variant="outline"
                    disabled={!selectedAgent}
                  >
                    <Plus size={16} className="mr-2" />
                    {language === 'ru' ? 'Создать Тестовые Записи' : 'Create Test Entries'}
                  </Button>
                </div>
              </div>
            </div>

            <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus size={16} className="mr-2" />
                    {t('addEntry')}
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('addEntry')}</DialogTitle>
                  <DialogDescription>
                    {language === 'ru' 
                      ? 'Создайте новую запись в журнале агента'
                      : 'Create a new entry in the agent journal'
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
                    <Label htmlFor="entry-title">{t('entryTitle')}</Label>
                    <Input
                      id="entry-title"
                      value={entryTitle}
                      onChange={(e) => setEntryTitle(e.target.value)}
                      placeholder={language === 'ru' ? 'Заголовок записи' : 'Entry title'}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('entryCategory')}</Label>
                      <Select value={entryCategory} onValueChange={(value: JournalEntry['category']) => setEntryCategory(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="debate">{t('debate')}</SelectItem>
                          <SelectItem value="audit">{t('audit')}</SelectItem>
                          <SelectItem value="decision">{t('decision')}</SelectItem>
                          <SelectItem value="learning">{t('learning')}</SelectItem>
                          <SelectItem value="error">{t('error')}</SelectItem>
                          <SelectItem value="success">{t('success')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>{t('entryImportance')}</Label>
                      <Select value={entryImportance} onValueChange={(value: JournalEntry['importance']) => setEntryImportance(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">{t('low')}</SelectItem>
                          <SelectItem value="medium">{t('medium')}</SelectItem>
                          <SelectItem value="high">{t('high')}</SelectItem>
                          <SelectItem value="critical">{t('critical')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="entry-content">{t('entryContent')}</Label>
                    <Textarea
                      id="entry-content"
                      value={entryContent}
                      onChange={(e) => setEntryContent(e.target.value)}
                      placeholder={language === 'ru' ? 'Содержание записи...' : 'Entry content...'}
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="entry-tags">{t('entryTags')}</Label>
                    <Input
                      id="entry-tags"
                      value={entryTags}
                      onChange={(e) => setEntryTags(e.target.value)}
                      placeholder={t('addTags')}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddingEntry(false)}>
                      {language === 'ru' ? 'Отмена' : 'Cancel'}
                    </Button>
                    <Button onClick={addJournalEntry}>
                      {t('addEntry')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Agent Journals List */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('agentJournals')}</h3>
            
            {(!agentJournals || agentJournals.length === 0) ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>{t('noJournals')}</p>
                <p className="text-sm">{t('createFirstJournal')}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {agentJournals.map(journal => {
                  const agent = availableAgents.find(a => a.id === journal.agentId);
                  const recentEntries = journal.entries
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 3);
                  
                  return (
                    <Card key={`${journal.agentId}-${journal.projectId}`} className="cyber-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {agent && getAgentIcon(agent.type)}
                            <h4 className="font-medium">{agent?.name || journal.agentId}</h4>
                          </div>
                          <Badge variant="secondary">
                            {journal.metadata.totalEntries} {language === 'ru' ? 'записей' : 'entries'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-muted-foreground">{t('totalEntries')}: </span>
                            <span className="font-medium">{journal.metadata.totalEntries}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t('categories')}: </span>
                            <span className="font-medium">{Object.keys(journal.metadata.categories).length}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t('lastEntry')}: </span>
                            <span className="font-medium">
                              {journal.metadata.lastEntry ? 
                                new Date(journal.metadata.lastEntry).toLocaleDateString() : 
                                '—'
                              }
                            </span>
                          </div>
                          {journal.metadata.overallProgress !== undefined && (
                            <div>
                              <span className="text-muted-foreground">{language === 'ru' ? 'Прогресс' : 'Progress'}: </span>
                              <span className="font-medium text-accent">{journal.metadata.overallProgress}%</span>
                            </div>
                          )}
                        </div>

                        {/* Work Status Distribution */}
                        {journal.metadata.statusDistribution && Object.keys(journal.metadata.statusDistribution).length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium mb-2">{t('workStatus')}</h5>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(journal.metadata.statusDistribution).map(([status, count]) => (
                                <Badge 
                                  key={status} 
                                  variant={status === 'completed' ? 'default' : status === 'failed' ? 'destructive' : status === 'urgent' ? 'destructive' : 'outline'} 
                                  className="text-xs"
                                >
                                  {status === 'in-progress' ? t('inProgress') :
                                   status === 'completed' ? t('completed') :
                                   status === 'failed' ? t('failed') :
                                   status === 'urgent' ? t('urgent') :
                                   status === 'on-hold' ? t('onHold') :
                                   t('unknown')}: {count}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Recent Entries Preview */}
                        {recentEntries.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium mb-2">{t('recentActivity')}</h5>
                            <div className="space-y-2">
                              {recentEntries.map(entry => (
                                <div key={entry.id} className="flex items-center gap-2 text-sm">
                                  {getCategoryIcon(entry.category)}
                                  <span className="flex-1 truncate">{entry.title}</span>
                                  <Badge variant={getImportanceBadgeVariant(entry.importance)} className="text-xs">
                                    {t(entry.importance)}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Category Distribution */}
                        <div className="mb-4">
                          <h5 className="text-sm font-medium mb-2">{t('categories')}</h5>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(journal.metadata.categories).map(([category, count]) => (
                              <Badge key={category} variant="outline" className="text-xs">
                                {t(category as keyof typeof journalTranslations.en)}: {count}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            setSelectedJournal(journal);
                            setIsViewingJournal(true);
                          }}>
                            <Eye size={14} className="mr-1" />
                            {t('viewJournal')}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => exportJournal(journal)}>
                            <Download size={14} className="mr-1" />
                            {t('exportJournal')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Journal Viewer Dialog */}
        <Dialog open={isViewingJournal} onOpenChange={setIsViewingJournal}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText size={20} />
                {selectedJournal && (
                  availableAgents.find(a => a.id === selectedJournal.agentId)?.name || selectedJournal.agentId
                )} {language === 'ru' ? 'Журнал' : 'Journal'}
              </DialogTitle>
              <DialogDescription>
                {selectedJournal && (
                  `${selectedJournal.metadata.totalEntries} ${language === 'ru' ? 'записей' : 'entries'} • ${language === 'ru' ? 'Начат' : 'Started'} ${new Date(selectedJournal.metadata.startDate).toLocaleDateString()}`
                )}
              </DialogDescription>
            </DialogHeader>
            
            {selectedJournal && (
              <ScrollArea className="h-[60vh]">
                <div className="space-y-4">
                  {/* Journal Summary */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-medium mb-2">{t('journalSummary')}</h4>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="text-muted-foreground">{t('totalEntries')}: </span>
                          <span className="font-medium">{selectedJournal.metadata.totalEntries}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{language === 'ru' ? 'Начат' : 'Started'}: </span>
                          <span className="font-medium">
                            {new Date(selectedJournal.metadata.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        {selectedJournal.metadata.lastEntry && (
                          <div>
                            <span className="text-muted-foreground">{t('lastEntry')}: </span>
                            <span className="font-medium">
                              {new Date(selectedJournal.metadata.lastEntry).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">{t('categories')}</h4>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(selectedJournal.metadata.categories).map(([category, count]) => (
                          <Badge key={category} variant="outline" className="text-xs">
                            {t(category as keyof typeof journalTranslations.en)}: {count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Journal Entries */}
                  <div>
                    <h4 className="font-medium mb-3">
                      {t('journalEntries')} ({selectedJournal.entries.length})
                    </h4>
                    
                    {selectedJournal.entries.length === 0 ? (
                      <p className="text-muted-foreground text-sm">{t('noEntries')}</p>
                    ) : (
                      <div className="space-y-4">
                        {selectedJournal.entries
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .map(entry => (
                            <div key={entry.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {getCategoryIcon(entry.category)}
                                  <h5 className="font-medium">{entry.title}</h5>
                                  <Badge variant={getImportanceBadgeVariant(entry.importance)} className="text-xs">
                                    {t(entry.importance)}
                                  </Badge>
                                  {entry.projectContext.workStatus && (
                                    <Badge 
                                      variant={
                                        entry.projectContext.workStatus === 'completed' ? 'default' :
                                        entry.projectContext.workStatus === 'failed' ? 'destructive' :
                                        entry.projectContext.workStatus === 'urgent' ? 'destructive' :
                                        'outline'
                                      } 
                                      className="text-xs"
                                    >
                                      {entry.projectContext.workStatus === 'in-progress' ? t('inProgress') :
                                       entry.projectContext.workStatus === 'completed' ? t('completed') :
                                       entry.projectContext.workStatus === 'failed' ? t('failed') :
                                       entry.projectContext.workStatus === 'urgent' ? t('urgent') :
                                       entry.projectContext.workStatus === 'on-hold' ? t('onHold') :
                                       t('unknown')}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{new Date(entry.timestamp).toLocaleString()}</span>
                                  {entry.projectContext.lastUpdated && (
                                    <span>
                                      • {language === 'ru' ? 'Обновлено' : 'Updated'}: {new Date(entry.projectContext.lastUpdated).toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-sm mb-3">{entry.content}</p>
                              
                              {entry.tags.length > 0 && (
                                <div className="flex items-center gap-1 mb-2">
                                  <Tag size={12} className="text-muted-foreground" />
                                  {entry.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-4">
                                  <span>
                                    {t('module')}: {entry.projectContext.module}
                                  </span>
                                  <span>
                                    {t('phase')}: {entry.projectContext.phase}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                                    <PencilSimple size={12} className="mr-1" />
                                    {t('editEntry')}
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-destructive">
                                    <Trash size={12} className="mr-1" />
                                    {t('deleteEntry')}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        }
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