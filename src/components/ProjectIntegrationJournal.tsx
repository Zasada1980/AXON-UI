import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  FileText,
  Calendar,
  MapPin,
  Users,
  Lightbulb,
  CheckCircle,
  Clock,
  Warning,
  Target,
  Stack,
  GitBranch,
  Download,
  Upload,
  Plus,
  PencilSimple,
  Trash,
  BookOpen,
  Graph,
  Database,
  Gear,
  Activity
} from '@phosphor-icons/react';

// Типы для интеграционного журнала
interface IntegrationEntry {
  id: string;
  timestamp: string;
  type: 'task' | 'milestone' | 'integration' | 'issue' | 'decision' | 'test';
  category: 'ui' | 'backend' | 'database' | 'api' | 'deployment' | 'documentation';
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed' | 'blocked' | 'testing' | 'approved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  dependencies: string[];
  tags: string[];
  estimatedHours?: number;
  actualHours?: number;
  notes: string[];
  attachments: string[];
  relatedComponents: string[];
  integrationPoints: string[];
}

interface ProjectMap {
  id: string;
  name: string;
  version: string;
  lastUpdated: string;
  overview: {
    totalComponents: number;
    completedComponents: number;
    pendingIntegrations: number;
    criticalIssues: number;
  };
  architecture: {
    layers: ArchitectureLayer[];
    connections: ComponentConnection[];
  };
  integrationPlan: IntegrationPhase[];
  riskAssessment: RiskItem[];
}

interface ArchitectureLayer {
  id: string;
  name: string;
  type: 'presentation' | 'business' | 'data' | 'integration' | 'infrastructure';
  components: Component[];
  dependencies: string[];
  status: 'design' | 'development' | 'testing' | 'completed';
}

interface Component {
  id: string;
  name: string;
  type: 'component' | 'service' | 'module' | 'api' | 'database';
  status: 'planned' | 'in-progress' | 'completed' | 'deprecated';
  integrationComplexity: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];
  interfaces: string[];
  documentation: string;
  testCoverage: number;
}

interface ComponentConnection {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'api' | 'data' | 'event' | 'ui' | 'service';
  status: 'planned' | 'implemented' | 'tested' | 'production';
  documentation: string;
}

interface IntegrationPhase {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'in-progress' | 'completed' | 'delayed';
  milestones: Milestone[];
  dependencies: string[];
  risks: string[];
}

interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  deliverables: string[];
  criteria: string[];
}

interface RiskItem {
  id: string;
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high' | 'critical';
  status: 'identified' | 'mitigating' | 'resolved' | 'accepted';
  mitigation: string;
  owner: string;
}

interface ProjectIntegrationJournalProps {
  language: 'en' | 'ru';
  projectId: string;
  onEntryCreated?: (entry: IntegrationEntry) => void;
  onMapUpdated?: (map: ProjectMap) => void;
  onPhaseCompleted?: (phase: IntegrationPhase) => void;
}

// Переводы
const translations = {
  // Основные элементы
  integrationJournal: { en: 'Integration Journal', ru: 'Журнал Интеграции' },
  projectMap: { en: 'Project Map', ru: 'Карта Проекта' },
  functionalityMap: { en: 'Functionality Map', ru: 'Карта Функционала' },
  
  // Типы записей
  task: { en: 'Task', ru: 'Задача' },
  milestone: { en: 'Milestone', ru: 'Веха' },
  integration: { en: 'Integration', ru: 'Интеграция' },
  issue: { en: 'Issue', ru: 'Проблема' },
  decision: { en: 'Decision', ru: 'Решение' },
  test: { en: 'Test', ru: 'Тест' },
  
  // Категории
  ui: { en: 'UI', ru: 'Интерфейс' },
  backend: { en: 'Backend', ru: 'Бэкенд' },
  database: { en: 'Database', ru: 'База данных' },
  api: { en: 'API', ru: 'API' },
  deployment: { en: 'Deployment', ru: 'Развертывание' },
  documentation: { en: 'Documentation', ru: 'Документация' },
  
  // Статусы
  planned: { en: 'Planned', ru: 'Запланировано' },
  inProgress: { en: 'In Progress', ru: 'В Работе' },
  completed: { en: 'Completed', ru: 'Завершено' },
  blocked: { en: 'Blocked', ru: 'Заблокировано' },
  testing: { en: 'Testing', ru: 'Тестирование' },
  approved: { en: 'Approved', ru: 'Утверждено' },
  
  // Приоритеты
  low: { en: 'Low', ru: 'Низкий' },
  medium: { en: 'Medium', ru: 'Средний' },
  high: { en: 'High', ru: 'Высокий' },
  critical: { en: 'Critical', ru: 'Критический' },
  
  // Действия
  createEntry: { en: 'Create Entry', ru: 'Создать Запись' },
  editEntry: { en: 'Edit Entry', ru: 'Редактировать' },
  deleteEntry: { en: 'Delete Entry', ru: 'Удалить' },
  exportJournal: { en: 'Export Journal', ru: 'Экспорт Журнала' },
  importData: { en: 'Import Data', ru: 'Импорт Данных' },
  generateReport: { en: 'Generate Report', ru: 'Генерация Отчета' },
  
  // Поля формы
  title: { en: 'Title', ru: 'Заголовок' },
  description: { en: 'Description', ru: 'Описание' },
  type: { en: 'Type', ru: 'Тип' },
  category: { en: 'Category', ru: 'Категория' },
  status: { en: 'Status', ru: 'Статус' },
  priority: { en: 'Priority', ru: 'Приоритет' },
  assignedTo: { en: 'Assigned To', ru: 'Назначено' },
  dependencies: { en: 'Dependencies', ru: 'Зависимости' },
  tags: { en: 'Tags', ru: 'Теги' },
  estimatedHours: { en: 'Estimated Hours', ru: 'Оценка (часы)' },
  actualHours: { en: 'Actual Hours', ru: 'Фактически (часы)' },
  notes: { en: 'Notes', ru: 'Заметки' },
  
  // Архитектура
  architecture: { en: 'Architecture', ru: 'Архитектура' },
  layers: { en: 'Layers', ru: 'Слои' },
  components: { en: 'Components', ru: 'Компоненты' },
  connections: { en: 'Connections', ru: 'Связи' },
  integrationPoints: { en: 'Integration Points', ru: 'Точки Интеграции' },
  
  // Фазы интеграции
  integrationPhases: { en: 'Integration Phases', ru: 'Фазы Интеграции' },
  currentPhase: { en: 'Current Phase', ru: 'Текущая Фаза' },
  nextMilestone: { en: 'Next Milestone', ru: 'Следующая Веха' },
  
  // Аналитика
  overview: { en: 'Overview', ru: 'Обзор' },
  progress: { en: 'Progress', ru: 'Прогресс' },
  timeline: { en: 'Timeline', ru: 'Временная шкала' },
  risks: { en: 'Risks', ru: 'Риски' },
  
  // Сообщения
  entryCreated: { en: 'Entry created successfully', ru: 'Запись успешно создана' },
  entryUpdated: { en: 'Entry updated successfully', ru: 'Запись успешно обновлена' },
  entryDeleted: { en: 'Entry deleted successfully', ru: 'Запись успешно удалена' },
  dataExported: { en: 'Data exported successfully', ru: 'Данные успешно экспортированы' },
  dataImported: { en: 'Data imported successfully', ru: 'Данные успешно импортированы' }
};

const ProjectIntegrationJournal: React.FC<ProjectIntegrationJournalProps> = ({
  language,
  projectId,
  onEntryCreated,
  onMapUpdated,
  onPhaseCompleted
}) => {
  const t = (key: string) => translations[key as keyof typeof translations]?.[language] || key;

  // Состояние компонента
  const [entries, setEntries] = useKV<IntegrationEntry[]>(`integration-journal-${projectId}`, []);
  const [projectMap, setProjectMap] = useKV<ProjectMap | null>(`project-map-${projectId}`, null);
  
  const [activeTab, setActiveTab] = useState('journal');
  const [isCreatingEntry, setIsCreatingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<IntegrationEntry | null>(null);
  const [selectedEntryType, setSelectedEntryType] = useState<IntegrationEntry['type']>('task');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Форма создания/редактирования записи
  const [formData, setFormData] = useState<Partial<IntegrationEntry>>({
    type: 'task',
    category: 'ui',
    status: 'planned',
    priority: 'medium',
    dependencies: [],
    tags: [],
    notes: [],
    attachments: [],
    relatedComponents: [],
    integrationPoints: []
  });

  // Инициализация карты проекта при первом запуске
  useEffect(() => {
    if (!projectMap) {
      initializeProjectMap();
    }
  }, [projectMap]);

  const initializeProjectMap = () => {
    const initialMap: ProjectMap = {
      id: projectId,
      name: 'AXON Integration Project',
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      overview: {
        totalComponents: 0,
        completedComponents: 0,
        pendingIntegrations: 0,
        criticalIssues: 0
      },
      architecture: {
        layers: [
          {
            id: 'presentation',
            name: 'Presentation Layer',
            type: 'presentation',
            components: [],
            dependencies: [],
            status: 'design'
          },
          {
            id: 'business',
            name: 'Business Logic Layer',
            type: 'business',
            components: [],
            dependencies: ['presentation'],
            status: 'design'
          },
          {
            id: 'data',
            name: 'Data Layer',
            type: 'data',
            components: [],
            dependencies: ['business'],
            status: 'design'
          }
        ],
        connections: []
      },
      integrationPlan: [],
      riskAssessment: []
    };
    
    setProjectMap(initialMap);
  };

  const createEntry = () => {
    if (!formData.title?.trim()) {
      toast.error('Title is required');
      return;
    }

    const newEntry: IntegrationEntry = {
      id: `entry-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: formData.type || 'task',
      category: formData.category || 'ui',
      title: formData.title,
      description: formData.description || '',
      status: formData.status || 'planned',
      priority: formData.priority || 'medium',
      assignedTo: formData.assignedTo,
      dependencies: formData.dependencies || [],
      tags: formData.tags || [],
      estimatedHours: formData.estimatedHours,
      actualHours: formData.actualHours,
      notes: formData.notes || [],
      attachments: formData.attachments || [],
      relatedComponents: formData.relatedComponents || [],
      integrationPoints: formData.integrationPoints || []
    };

    setEntries(current => [...(current || []), newEntry]);
    setIsCreatingEntry(false);
    resetForm();
    
    if (onEntryCreated) {
      onEntryCreated(newEntry);
    }
    
    toast.success(t('entryCreated'));
  };

  const updateEntry = () => {
    if (!editingEntry || !formData.title?.trim()) return;

    const updatedEntry: IntegrationEntry = {
      ...editingEntry,
      ...formData,
      title: formData.title,
      description: formData.description || '',
      timestamp: new Date().toISOString()
    };

    setEntries(current => 
      (current || []).map(entry => 
        entry.id === editingEntry.id ? updatedEntry : entry
      )
    );
    
    setEditingEntry(null);
    resetForm();
    toast.success(t('entryUpdated'));
  };

  const deleteEntry = (entryId: string) => {
    setEntries(current => 
      (current || []).filter(entry => entry.id !== entryId)
    );
    toast.success(t('entryDeleted'));
  };

  const resetForm = () => {
    setFormData({
      type: 'task',
      category: 'ui',
      status: 'planned',
      priority: 'medium',
      dependencies: [],
      tags: [],
      notes: [],
      attachments: [],
      relatedComponents: [],
      integrationPoints: []
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'blocked': return 'bg-red-500';
      case 'testing': return 'bg-yellow-500';
      case 'approved': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredEntries = (entries || []).filter(entry => {
    const categoryMatch = filterCategory === 'all' || entry.category === filterCategory;
    const statusMatch = filterStatus === 'all' || entry.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  const exportJournal = () => {
    const exportData = {
      entries: entries || [],
      projectMap,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integration-journal-${projectId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(t('dataExported'));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen size={24} className="text-primary" />
            {t('integrationJournal')}
          </CardTitle>
          <CardDescription>
            {language === 'ru' 
              ? 'Полный журнал работ над проектом и карта интеграции функционала'
              : 'Complete project work journal and functionality integration map'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="journal">{t('integrationJournal')}</TabsTrigger>
              <TabsTrigger value="map">{t('projectMap')}</TabsTrigger>
              <TabsTrigger value="phases">{t('integrationPhases')}</TabsTrigger>
              <TabsTrigger value="analytics">{t('overview')}</TabsTrigger>
            </TabsList>

            {/* Журнал интеграции */}
            <TabsContent value="journal" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t('category')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="ui">{t('ui')}</SelectItem>
                      <SelectItem value="backend">{t('backend')}</SelectItem>
                      <SelectItem value="database">{t('database')}</SelectItem>
                      <SelectItem value="api">{t('api')}</SelectItem>
                      <SelectItem value="deployment">{t('deployment')}</SelectItem>
                      <SelectItem value="documentation">{t('documentation')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t('status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="planned">{t('planned')}</SelectItem>
                      <SelectItem value="in-progress">{t('inProgress')}</SelectItem>
                      <SelectItem value="completed">{t('completed')}</SelectItem>
                      <SelectItem value="blocked">{t('blocked')}</SelectItem>
                      <SelectItem value="testing">{t('testing')}</SelectItem>
                      <SelectItem value="approved">{t('approved')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={exportJournal}>
                    <Download size={16} className="mr-2" />
                    {t('exportJournal')}
                  </Button>
                  
                  <Dialog open={isCreatingEntry} onOpenChange={setIsCreatingEntry}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus size={16} className="mr-2" />
                        {t('createEntry')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{editingEntry ? t('editEntry') : t('createEntry')}</DialogTitle>
                        <DialogDescription>
                          {language === 'ru' 
                            ? 'Создайте новую запись в журнале интеграции'
                            : 'Create a new integration journal entry'
                          }
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor="entry-type">{t('type')}</Label>
                            <Select 
                              value={formData.type} 
                              onValueChange={(value: IntegrationEntry['type']) => 
                                setFormData({...formData, type: value})
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="task">{t('task')}</SelectItem>
                                <SelectItem value="milestone">{t('milestone')}</SelectItem>
                                <SelectItem value="integration">{t('integration')}</SelectItem>
                                <SelectItem value="issue">{t('issue')}</SelectItem>
                                <SelectItem value="decision">{t('decision')}</SelectItem>
                                <SelectItem value="test">{t('test')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="entry-category">{t('category')}</Label>
                            <Select 
                              value={formData.category} 
                              onValueChange={(value: IntegrationEntry['category']) => 
                                setFormData({...formData, category: value})
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ui">{t('ui')}</SelectItem>
                                <SelectItem value="backend">{t('backend')}</SelectItem>
                                <SelectItem value="database">{t('database')}</SelectItem>
                                <SelectItem value="api">{t('api')}</SelectItem>
                                <SelectItem value="deployment">{t('deployment')}</SelectItem>
                                <SelectItem value="documentation">{t('documentation')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="entry-title">{t('title')}</Label>
                          <Input
                            id="entry-title"
                            value={formData.title || ''}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder={language === 'ru' ? 'Название задачи или записи' : 'Task or entry title'}
                          />
                        </div>

                        <div>
                          <Label htmlFor="entry-description">{t('description')}</Label>
                          <Textarea
                            id="entry-description"
                            value={formData.description || ''}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder={language === 'ru' ? 'Подробное описание' : 'Detailed description'}
                            rows={3}
                          />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor="entry-status">{t('status')}</Label>
                            <Select 
                              value={formData.status} 
                              onValueChange={(value: IntegrationEntry['status']) => 
                                setFormData({...formData, status: value})
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="planned">{t('planned')}</SelectItem>
                                <SelectItem value="in-progress">{t('inProgress')}</SelectItem>
                                <SelectItem value="completed">{t('completed')}</SelectItem>
                                <SelectItem value="blocked">{t('blocked')}</SelectItem>
                                <SelectItem value="testing">{t('testing')}</SelectItem>
                                <SelectItem value="approved">{t('approved')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="entry-priority">{t('priority')}</Label>
                            <Select 
                              value={formData.priority} 
                              onValueChange={(value: IntegrationEntry['priority']) => 
                                setFormData({...formData, priority: value})
                              }
                            >
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

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor="entry-estimated">{t('estimatedHours')}</Label>
                            <Input
                              id="entry-estimated"
                              type="number"
                              value={formData.estimatedHours || ''}
                              onChange={(e) => setFormData({...formData, estimatedHours: parseInt(e.target.value) || undefined})}
                              placeholder="8"
                            />
                          </div>

                          <div>
                            <Label htmlFor="entry-actual">{t('actualHours')}</Label>
                            <Input
                              id="entry-actual"
                              type="number"
                              value={formData.actualHours || ''}
                              onChange={(e) => setFormData({...formData, actualHours: parseInt(e.target.value) || undefined})}
                              placeholder="6"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsCreatingEntry(false)}>
                            {language === 'ru' ? 'Отмена' : 'Cancel'}
                          </Button>
                          <Button onClick={editingEntry ? updateEntry : createEntry}>
                            {editingEntry ? t('entryUpdated') : t('createEntry')}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredEntries.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {language === 'ru' 
                            ? 'Записей пока нет. Создайте первую запись в журнале.'
                            : 'No entries yet. Create your first journal entry.'
                          }
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredEntries.map(entry => (
                      <Card key={entry.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{t(entry.type)}</Badge>
                                <Badge variant="secondary">{t(entry.category)}</Badge>
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(entry.status)}`} />
                                <span className="text-sm text-muted-foreground">{t(entry.status)}</span>
                                <div className={`w-2 h-2 rounded-full ${getPriorityColor(entry.priority)}`} />
                                <span className="text-sm text-muted-foreground">{t(entry.priority)}</span>
                              </div>
                              
                              <h4 className="font-medium mb-1">{entry.title}</h4>
                              {entry.description && (
                                <p className="text-sm text-muted-foreground mb-2">{entry.description}</p>
                              )}
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  {new Date(entry.timestamp).toLocaleDateString()}
                                </div>
                                {entry.estimatedHours && (
                                  <div className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {entry.estimatedHours}h est.
                                  </div>
                                )}
                                {entry.actualHours && (
                                  <div className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {entry.actualHours}h actual
                                  </div>
                                )}
                              </div>
                              
                              {entry.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {entry.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1 ml-4">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingEntry(entry);
                                  setFormData(entry);
                                  setIsCreatingEntry(true);
                                }}
                              >
                                <PencilSimple size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteEntry(entry.id)}
                              >
                                <Trash size={14} />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Карта проекта */}
            <TabsContent value="map" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stack size={20} />
                      {t('architecture')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {projectMap?.architecture.layers.map(layer => (
                        <div key={layer.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{layer.name}</h4>
                            <Badge variant={layer.status === 'completed' ? 'default' : 'secondary'}>
                              {layer.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {layer.components.length} components
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Graph size={20} />
                      {t('integrationPoints')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {projectMap?.architecture.connections.map(connection => (
                        <div key={connection.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{connection.type.toUpperCase()}</span>
                            <Badge variant={connection.status === 'production' ? 'default' : 'outline'}>
                              {connection.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {connection.sourceId} → {connection.targetId}
                          </p>
                        </div>
                      ))}
                      
                      {(!projectMap?.architecture.connections || projectMap.architecture.connections.length === 0) && (
                        <div className="text-center py-6">
                          <Graph size={48} className="mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">
                            {language === 'ru' 
                              ? 'Точки интеграции не определены'
                              : 'No integration points defined'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Фазы интеграции */}
            <TabsContent value="phases" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch size={20} />
                    {t('integrationPhases')}
                  </CardTitle>
                  <CardDescription>
                    {language === 'ru' 
                      ? 'Планирование и отслеживание фаз интеграции проекта'
                      : 'Planning and tracking project integration phases'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projectMap?.integrationPlan.map(phase => (
                      <div key={phase.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{phase.name}</h4>
                          <Badge variant={phase.status === 'completed' ? 'default' : 'secondary'}>
                            {phase.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{phase.description}</p>
                        
                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="text-sm">
                            <span className="font-medium">Start:</span> {new Date(phase.startDate).toLocaleDateString()}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">End:</span> {new Date(phase.endDate).toLocaleDateString()}
                          </div>
                        </div>
                        
                        {phase.milestones.length > 0 && (
                          <div className="mt-3">
                            <h5 className="font-medium text-sm mb-2">Milestones:</h5>
                            <div className="space-y-1">
                              {phase.milestones.map(milestone => (
                                <div key={milestone.id} className="flex items-center justify-between text-sm">
                                  <span>{milestone.name}</span>
                                  <Badge variant={milestone.status === 'completed' ? 'default' : 'outline'} className="text-xs">
                                    {milestone.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {(!projectMap?.integrationPlan || projectMap.integrationPlan.length === 0) && (
                      <div className="text-center py-8">
                        <GitBranch size={48} className="mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {language === 'ru' 
                            ? 'Фазы интеграции не определены'
                            : 'No integration phases defined'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Аналитика */}
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                        <p className="text-2xl font-bold">{(entries || []).length}</p>
                      </div>
                      <FileText size={24} className="text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold">
                          {(entries || []).filter(e => e.status === 'completed').length}
                        </p>
                      </div>
                      <CheckCircle size={24} className="text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                        <p className="text-2xl font-bold">
                          {(entries || []).filter(e => e.status === 'in-progress').length}
                        </p>
                      </div>
                      <Activity size={24} className="text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Blocked</p>
                        <p className="text-2xl font-bold">
                          {(entries || []).filter(e => e.status === 'blocked').length}
                        </p>
                      </div>
                      <Warning size={24} className="text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t('progress')} by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['ui', 'backend', 'database', 'api', 'deployment', 'documentation'].map(category => {
                      const categoryEntries = (entries || []).filter(e => e.category === category);
                      const completed = categoryEntries.filter(e => e.status === 'completed').length;
                      const percentage = categoryEntries.length > 0 ? (completed / categoryEntries.length) * 100 : 0;
                      
                      return (
                        <div key={category}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{t(category)}</span>
                            <span className="text-sm text-muted-foreground">
                              {completed}/{categoryEntries.length} ({Math.round(percentage)}%)
                            </span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectIntegrationJournal;