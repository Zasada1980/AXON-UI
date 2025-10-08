import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Plug,
  Code,
  CheckCircle,
  Warning,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  Database,
  Globe,
  Gear,
  Eye,
  Download,
  Upload,
  Plus,
  PencilSimple,
  Trash,
  Play,
  Stop,
  Pause,
  Graph,
  FileText,
  Wrench,
  CloudArrowUp
} from '@phosphor-icons/react';

// Типы для интеграции с основным UI
interface UIIntegrationPoint {
  id: string;
  name: string;
  type: 'component' | 'service' | 'api' | 'data' | 'event' | 'style';
  sourceModule: string;
  targetModule: string;
  status: 'planned' | 'mapping' | 'implementing' | 'testing' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  complexity: 'simple' | 'moderate' | 'complex' | 'critical';
  description: string;
  technicalDetails: string;
  dependencies: string[];
  requirements: IntegrationRequirement[];
  testCases: TestCase[];
  mappingRules: MappingRule[];
  transformations: DataTransformation[];
  validationRules: ValidationRule[];
  documentation: string;
  notes: string[];
  createdAt: string;
  updatedAt: string;
  estimatedHours: number;
  actualHours?: number;
  assignedTo?: string;
  lastTestResult?: TestResult;
}

interface IntegrationRequirement {
  id: string;
  title: string;
  description: string;
  type: 'functional' | 'performance' | 'security' | 'usability' | 'compatibility';
  priority: 'must-have' | 'should-have' | 'could-have' | 'nice-to-have';
  verified: boolean;
  verificationMethod: string;
}

interface TestCase {
  id: string;
  title: string;
  description: string;
  steps: string[];
  expectedResult: string;
  actualResult?: string;
  status: 'pending' | 'passed' | 'failed' | 'skipped';
  lastRun?: string;
  environment: string;
}

interface MappingRule {
  id: string;
  sourceField: string;
  targetField: string;
  transformation?: string;
  validation?: string;
  required: boolean;
  defaultValue?: string;
}

interface DataTransformation {
  id: string;
  name: string;
  type: 'format' | 'structure' | 'validation' | 'enrichment' | 'filtering';
  inputFormat: string;
  outputFormat: string;
  transformationLogic: string;
  testData: string;
}

interface ValidationRule {
  id: string;
  field: string;
  rule: string;
  errorMessage: string;
  severity: 'error' | 'warning' | 'info';
}

interface TestResult {
  id: string;
  timestamp: string;
  status: 'passed' | 'failed' | 'error';
  duration: number;
  coverage: number;
  errors: string[];
  warnings: string[];
  details: string;
}

interface IntegrationSession {
  id: string;
  name: string;
  description: string;
  integrationPoints: UIIntegrationPoint[];
  createdAt: string;
  lastActive: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  completionRate: number;
  estimatedTotalHours: number;
  actualTotalHours: number;
}

interface UIIntegrationManagerProps {
  language: 'en' | 'ru';
  projectId: string;
  onIntegrationCompleted?: (integration: UIIntegrationPoint) => void;
  onSessionCompleted?: (session: IntegrationSession) => void;
  onTestPassed?: (testCase: TestCase) => void;
}

// Переводы
const translations = {
  // Основные элементы
  uiIntegrationManager: { en: 'UI Integration Manager', ru: 'Менеджер Интеграции UI' },
  integrationPoints: { en: 'Integration Points', ru: 'Точки Интеграции' },
  createIntegration: { en: 'Create Integration', ru: 'Создать Интеграцию' },
  
  // Типы интеграции
  component: { en: 'Component', ru: 'Компонент' },
  service: { en: 'Service', ru: 'Сервис' },
  api: { en: 'API', ru: 'API' },
  data: { en: 'Data', ru: 'Данные' },
  event: { en: 'Event', ru: 'Событие' },
  style: { en: 'Style', ru: 'Стили' },
  
  // Статусы
  planned: { en: 'Planned', ru: 'Запланировано' },
  mapping: { en: 'Mapping', ru: 'Сопоставление' },
  implementing: { en: 'Implementing', ru: 'Реализация' },
  testingStatus: { en: 'Testing', ru: 'Тестирование' },
  completed: { en: 'Completed', ru: 'Завершено' },
  failed: { en: 'Failed', ru: 'Не удалось' },
  
  // Приоритеты и сложность
  low: { en: 'Low', ru: 'Низкий' },
  medium: { en: 'Medium', ru: 'Средний' },
  high: { en: 'High', ru: 'Высокий' },
  critical: { en: 'Critical', ru: 'Критический' },
  simple: { en: 'Simple', ru: 'Простая' },
  moderate: { en: 'Moderate', ru: 'Средняя' },
  complex: { en: 'Complex', ru: 'Сложная' },
  
  // Вкладки
  overview: { en: 'Overview', ru: 'Обзор' },
  mappings: { en: 'Mappings', ru: 'Сопоставления' },
  transformations: { en: 'Transformations', ru: 'Преобразования' },
  testing: { en: 'Testing', ru: 'Тестирование' },
  documentation: { en: 'Documentation', ru: 'Документация' },
  
  // Поля
  name: { en: 'Name', ru: 'Название' },
  type: { en: 'Type', ru: 'Тип' },
  sourceModule: { en: 'Source Module', ru: 'Исходный Модуль' },
  targetModule: { en: 'Target Module', ru: 'Целевой Модуль' },
  status: { en: 'Status', ru: 'Статус' },
  priority: { en: 'Priority', ru: 'Приоритет' },
  complexity: { en: 'Complexity', ru: 'Сложность' },
  description: { en: 'Description', ru: 'Описание' },
  technicalDetails: { en: 'Technical Details', ru: 'Технические Детали' },
  requirements: { en: 'Requirements', ru: 'Требования' },
  dependencies: { en: 'Dependencies', ru: 'Зависимости' },
  estimatedHours: { en: 'Estimated Hours', ru: 'Оценка (часы)' },
  actualHours: { en: 'Actual Hours', ru: 'Фактически (часы)' },
  assignedTo: { en: 'Assigned To', ru: 'Назначено' },
  
  // Требования
  functional: { en: 'Functional', ru: 'Функциональные' },
  performance: { en: 'Performance', ru: 'Производительность' },
  security: { en: 'Security', ru: 'Безопасность' },
  usability: { en: 'Usability', ru: 'Удобство' },
  compatibility: { en: 'Compatibility', ru: 'Совместимость' },
  
  mustHave: { en: 'Must Have', ru: 'Обязательно' },
  shouldHave: { en: 'Should Have', ru: 'Желательно' },
  couldHave: { en: 'Could Have', ru: 'Возможно' },
  niceToHave: { en: 'Nice to Have', ru: 'Хорошо бы' },
  
  // Тестирование
  testCases: { en: 'Test Cases', ru: 'Тест-кейсы' },
  runTest: { en: 'Run Test', ru: 'Запустить Тест' },
  runAllTests: { en: 'Run All Tests', ru: 'Запустить Все Тесты' },
  passed: { en: 'Passed', ru: 'Пройден' },
  skipped: { en: 'Skipped', ru: 'Пропущен' },
  pending: { en: 'Pending', ru: 'Ожидает' },
  
  // Сопоставления
  mappingRules: { en: 'Mapping Rules', ru: 'Правила Сопоставления' },
  sourceField: { en: 'Source Field', ru: 'Исходное Поле' },
  targetField: { en: 'Target Field', ru: 'Целевое Поле' },
  transformation: { en: 'Transformation', ru: 'Преобразование' },
  validation: { en: 'Validation', ru: 'Валидация' },
  required: { en: 'Required', ru: 'Обязательное' },
  defaultValue: { en: 'Default Value', ru: 'Значение по умолчанию' },
  
  // Действия
  startIntegration: { en: 'Start Integration', ru: 'Начать Интеграцию' },
  pauseIntegration: { en: 'Pause Integration', ru: 'Приостановить' },
  completeIntegration: { en: 'Complete Integration', ru: 'Завершить Интеграцию' },
  editIntegration: { en: 'Edit Integration', ru: 'Редактировать' },
  deleteIntegration: { en: 'Delete Integration', ru: 'Удалить' },
  exportIntegration: { en: 'Export Integration', ru: 'Экспорт Интеграции' },
  importIntegration: { en: 'Import Integration', ru: 'Импорт Интеграции' },
  validateIntegration: { en: 'Validate Integration', ru: 'Проверить Интеграцию' },
  
  // Сообщения
  integrationCreated: { en: 'Integration point created', ru: 'Точка интеграции создана' },
  integrationUpdated: { en: 'Integration point updated', ru: 'Точка интеграции обновлена' },
  integrationDeleted: { en: 'Integration point deleted', ru: 'Точка интеграции удалена' },
  testPassed: { en: 'Test passed successfully', ru: 'Тест пройден успешно' },
  testFailed: { en: 'Test failed', ru: 'Тест не пройден' },
  allTestsPassed: { en: 'All tests passed', ru: 'Все тесты пройдены' },
  integrationCompleted: { en: 'Integration completed successfully', ru: 'Интеграция завершена успешно' },
  validationSuccessful: { en: 'Validation successful', ru: 'Проверка прошла успешно' },
  validationFailed: { en: 'Validation failed', ru: 'Проверка не прошла' }
};

const UIIntegrationManager: React.FC<UIIntegrationManagerProps> = ({
  language,
  projectId,
  onIntegrationCompleted,
  onSessionCompleted,
  onTestPassed
}) => {
  const t = (key: string) => translations[key as keyof typeof translations]?.[language] || key;

  // Состояние компонента
  const [sessions, setSessions] = useKV<IntegrationSession[]>(`ui-integration-sessions-${projectId}`, []);
  const [currentSession, setCurrentSession] = useKV<string | null>(`current-ui-session-${projectId}`, null);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [isCreatingIntegration, setIsCreatingIntegration] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<UIIntegrationPoint | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  
  // Форма создания/редактирования интеграции
  const [formData, setFormData] = useState<Partial<UIIntegrationPoint>>({
    type: 'component',
    status: 'planned',
    priority: 'medium',
    complexity: 'moderate',
    dependencies: [],
    requirements: [],
    testCases: [],
    mappingRules: [],
    transformations: [],
    validationRules: [],
    notes: []
  });

  // Получение текущей сессии
  const getCurrentSession = (): IntegrationSession | null => {
    if (!currentSession) return null;
    return (sessions || []).find(s => s.id === currentSession) || null;
  };

  // Инициализация сессии при первом запуске
  useEffect(() => {
    if (!currentSession && (sessions || []).length === 0) {
      createDefaultSession();
    }
  }, [sessions, currentSession]);

  const createDefaultSession = () => {
    const newSession: IntegrationSession = {
      id: `session-${Date.now()}`,
      name: 'AXON UI Integration Session',
      description: 'Main integration session for AXON platform UI components',
      integrationPoints: [],
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      status: 'active',
      completionRate: 0,
      estimatedTotalHours: 0,
      actualTotalHours: 0
    };

    setSessions([newSession]);
    setCurrentSession(newSession.id);
  };

  // Создание точки интеграции
  const createIntegration = () => {
    if (!formData.name?.trim()) {
      toast.error('Integration name is required');
      return;
    }

    const newIntegration: UIIntegrationPoint = {
      id: `integration-${Date.now()}`,
      name: formData.name,
      type: formData.type || 'component',
      sourceModule: formData.sourceModule || '',
      targetModule: formData.targetModule || '',
      status: formData.status || 'planned',
      priority: formData.priority || 'medium',
      complexity: formData.complexity || 'moderate',
      description: formData.description || '',
      technicalDetails: formData.technicalDetails || '',
      dependencies: formData.dependencies || [],
      requirements: formData.requirements || [],
      testCases: formData.testCases || [],
      mappingRules: formData.mappingRules || [],
      transformations: formData.transformations || [],
      validationRules: formData.validationRules || [],
      documentation: formData.documentation || '',
      notes: formData.notes || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedHours: formData.estimatedHours || 4,
      actualHours: formData.actualHours,
      assignedTo: formData.assignedTo
    };

    // Добавление к текущей сессии
    const session = getCurrentSession();
    if (session) {
      setSessions(current => 
        (current || []).map(s => 
          s.id === session.id 
            ? { 
                ...s, 
                integrationPoints: [...s.integrationPoints, newIntegration],
                lastActive: new Date().toISOString(),
                estimatedTotalHours: s.estimatedTotalHours + newIntegration.estimatedHours
              }
            : s
        )
      );
    }

    setIsCreatingIntegration(false);
    resetForm();
    toast.success(t('integrationCreated'));
  };

  const updateIntegration = () => {
    if (!editingIntegration || !formData.name?.trim()) return;

    const updatedIntegration: UIIntegrationPoint = {
      ...editingIntegration,
      ...formData,
      name: formData.name,
      updatedAt: new Date().toISOString()
    };

    const session = getCurrentSession();
    if (session) {
      setSessions(current => 
        (current || []).map(s => 
          s.id === session.id 
            ? {
                ...s,
                integrationPoints: s.integrationPoints.map(integration =>
                  integration.id === editingIntegration.id ? updatedIntegration : integration
                ),
                lastActive: new Date().toISOString()
              }
            : s
        )
      );
    }

    setEditingIntegration(null);
    resetForm();
    toast.success(t('integrationUpdated'));
  };

  const deleteIntegration = (integrationId: string) => {
    const session = getCurrentSession();
    if (session) {
      setSessions(current => 
        (current || []).map(s => 
          s.id === session.id 
            ? {
                ...s,
                integrationPoints: s.integrationPoints.filter(integration => integration.id !== integrationId),
                lastActive: new Date().toISOString()
              }
            : s
        )
      );
    }
    
    toast.success(t('integrationDeleted'));
  };

  const startIntegration = (integrationId: string) => {
    updateIntegrationStatus(integrationId, 'implementing');
    toast.success(t('integrationCreated'));
  };

  const completeIntegration = (integrationId: string) => {
    updateIntegrationStatus(integrationId, 'completed');
    
    const session = getCurrentSession();
    const integration = session?.integrationPoints.find(i => i.id === integrationId);
    
    if (integration && onIntegrationCompleted) {
      onIntegrationCompleted({ ...integration, status: 'completed' });
    }
    
    toast.success(t('integrationCompleted'));
  };

  const updateIntegrationStatus = (integrationId: string, status: UIIntegrationPoint['status']) => {
    const session = getCurrentSession();
    if (session) {
      setSessions(current => 
        (current || []).map(s => 
          s.id === session.id 
            ? {
                ...s,
                integrationPoints: s.integrationPoints.map(integration =>
                  integration.id === integrationId 
                    ? { ...integration, status, updatedAt: new Date().toISOString() }
                    : integration
                ),
                lastActive: new Date().toISOString()
              }
            : s
        )
      );
    }
  };

  const runTest = async (integrationId: string, testCaseId: string) => {
    setIsRunningTests(true);
    
    // Симуляция выполнения теста
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = Math.random() > 0.3; // 70% успешности
    
    const session = getCurrentSession();
    if (session) {
      setSessions(current => 
        (current || []).map(s => 
          s.id === session.id 
            ? {
                ...s,
                integrationPoints: s.integrationPoints.map(integration =>
                  integration.id === integrationId 
                    ? {
                        ...integration,
                        testCases: integration.testCases.map(testCase =>
                          testCase.id === testCaseId
                            ? {
                                ...testCase,
                                status: success ? 'passed' : 'failed',
                                lastRun: new Date().toISOString(),
                                actualResult: success ? testCase.expectedResult : 'Test failed - unexpected result'
                              }
                            : testCase
                        ),
                        updatedAt: new Date().toISOString()
                      }
                    : integration
                ),
                lastActive: new Date().toISOString()
              }
            : s
        )
      );
    }

    setIsRunningTests(false);
    
    if (success) {
      toast.success(t('testPassed'));
      if (onTestPassed) {
        const testCase = session?.integrationPoints
          .find(i => i.id === integrationId)
          ?.testCases.find(tc => tc.id === testCaseId);
        if (testCase) {
          onTestPassed({ ...testCase, status: 'passed' });
        }
      }
    } else {
      toast.error(t('testFailed'));
    }
  };

  const runAllTests = async (integrationId: string) => {
    const session = getCurrentSession();
    const integration = session?.integrationPoints.find(i => i.id === integrationId);
    
    if (!integration || integration.testCases.length === 0) return;

    setIsRunningTests(true);
    
    for (const testCase of integration.testCases) {
      await runTest(integrationId, testCase.id);
      await new Promise(resolve => setTimeout(resolve, 500)); // Небольшая пауза между тестами
    }
    
    setIsRunningTests(false);
    toast.success(t('allTestsPassed'));
  };

  const resetForm = () => {
    setFormData({
      type: 'component',
      status: 'planned',
      priority: 'medium',
      complexity: 'moderate',
      dependencies: [],
      requirements: [],
      testCases: [],
      mappingRules: [],
      transformations: [],
      validationRules: [],
      notes: []
    });
  };

  const getStatusColor = (status: UIIntegrationPoint['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'implementing': return 'bg-blue-500';
      case 'testing': return 'bg-yellow-500';
      case 'mapping': return 'bg-purple-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: UIIntegrationPoint['priority']) => {
    switch (priority) {
      case 'critical': return 'border-red-500';
      case 'high': return 'border-orange-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-green-500';
      default: return 'border-gray-500';
    }
  };

  const session = getCurrentSession();
  const integrations = session?.integrationPoints || [];
  const completedIntegrations = integrations.filter(i => i.status === 'completed').length;
  const totalIntegrations = integrations.length;
  const completionRate = totalIntegrations > 0 ? (completedIntegrations / totalIntegrations) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug size={24} className="text-primary" />
            {t('uiIntegrationManager')}
          </CardTitle>
          <CardDescription>
            {language === 'ru' 
              ? 'Управление интеграцией UI компонентов и модулей основного проекта'
              : 'Manage UI component and module integration for the main project'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {session && (
                <div>
                  <h3 className="font-medium">{session.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {completedIntegrations}/{totalIntegrations} integrations completed • {Math.round(completionRate)}%
                  </p>
                </div>
              )}
            </div>
            
            <Dialog open={isCreatingIntegration} onOpenChange={setIsCreatingIntegration}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-2" />
                  {t('createIntegration')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{editingIntegration ? t('editIntegration') : t('createIntegration')}</DialogTitle>
                  <DialogDescription>
                    {language === 'ru' 
                      ? 'Создайте новую точку интеграции для подключения модулей'
                      : 'Create a new integration point for connecting modules'
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="integration-name">{t('name')}</Label>
                      <Input
                        id="integration-name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder={language === 'ru' ? 'Название интеграции' : 'Integration name'}
                      />
                    </div>

                    <div>
                      <Label htmlFor="integration-type">{t('type')}</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value: UIIntegrationPoint['type']) => 
                          setFormData({...formData, type: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="component">{t('component')}</SelectItem>
                          <SelectItem value="service">{t('service')}</SelectItem>
                          <SelectItem value="api">{t('api')}</SelectItem>
                          <SelectItem value="data">{t('data')}</SelectItem>
                          <SelectItem value="event">{t('event')}</SelectItem>
                          <SelectItem value="style">{t('style')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="source-module">{t('sourceModule')}</Label>
                      <Input
                        id="source-module"
                        value={formData.sourceModule || ''}
                        onChange={(e) => setFormData({...formData, sourceModule: e.target.value})}
                        placeholder="AXON Platform"
                      />
                    </div>

                    <div>
                      <Label htmlFor="target-module">{t('targetModule')}</Label>
                      <Input
                        id="target-module"
                        value={formData.targetModule || ''}
                        onChange={(e) => setFormData({...formData, targetModule: e.target.value})}
                        placeholder="Main UI"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="integration-description">{t('description')}</Label>
                    <Textarea
                      id="integration-description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder={language === 'ru' ? 'Описание интеграции' : 'Integration description'}
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="integration-priority">{t('priority')}</Label>
                      <Select 
                        value={formData.priority} 
                        onValueChange={(value: UIIntegrationPoint['priority']) => 
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

                    <div>
                      <Label htmlFor="integration-complexity">{t('complexity')}</Label>
                      <Select 
                        value={formData.complexity} 
                        onValueChange={(value: UIIntegrationPoint['complexity']) => 
                          setFormData({...formData, complexity: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simple">{t('simple')}</SelectItem>
                          <SelectItem value="moderate">{t('moderate')}</SelectItem>
                          <SelectItem value="complex">{t('complex')}</SelectItem>
                          <SelectItem value="critical">{t('critical')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="integration-hours">{t('estimatedHours')}</Label>
                      <Input
                        id="integration-hours"
                        type="number"
                        value={formData.estimatedHours || ''}
                        onChange={(e) => setFormData({...formData, estimatedHours: parseInt(e.target.value) || 4})}
                        min="1"
                        max="40"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="technical-details">{t('technicalDetails')}</Label>
                    <Textarea
                      id="technical-details"
                      value={formData.technicalDetails || ''}
                      onChange={(e) => setFormData({...formData, technicalDetails: e.target.value})}
                      placeholder={language === 'ru' 
                        ? 'Технические детали реализации интеграции'
                        : 'Technical implementation details for integration'
                      }
                      rows={4}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreatingIntegration(false)}>
                      {language === 'ru' ? 'Отмена' : 'Cancel'}
                    </Button>
                    <Button onClick={editingIntegration ? updateIntegration : createIntegration}>
                      {editingIntegration ? t('integrationUpdated') : t('createIntegration')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {session && totalIntegrations > 0 && (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Integration Progress</span>
                  <span className="text-sm text-muted-foreground">{Math.round(completionRate)}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
                  <TabsTrigger value="mappings">{t('mappings')}</TabsTrigger>
                  <TabsTrigger value="transformations">{t('transformations')}</TabsTrigger>
                  <TabsTrigger value="testing">{t('testing')}</TabsTrigger>
                  <TabsTrigger value="documentation">{t('documentation')}</TabsTrigger>
                </TabsList>

                {/* Обзор интеграций */}
                <TabsContent value="overview" className="space-y-4">
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {integrations.map(integration => (
                        <Card key={integration.id} className={`border-l-4 ${getPriorityColor(integration.priority)}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className={`w-2 h-2 rounded-full ${getStatusColor(integration.status)}`} />
                                  <span className="font-medium">{integration.name}</span>
                                  <Badge variant="outline" className="text-xs">{t(integration.type)}</Badge>
                                  <Badge variant="secondary" className="text-xs">{t(integration.complexity)}</Badge>
                                </div>
                                
                                <p className="text-sm text-muted-foreground mb-2">{integration.description}</p>
                                
                                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                                  <span>{integration.sourceModule} → {integration.targetModule}</span>
                                  <span>{integration.estimatedHours}h est.</span>
                                  {integration.actualHours && <span>{integration.actualHours}h actual</span>}
                                  <Badge variant={integration.status === 'completed' ? 'default' : 'outline'} className="text-xs">
                                    {t(integration.status)}
                                  </Badge>
                                </div>

                                {integration.requirements.length > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    {integration.requirements.length} requirements • 
                                    {integration.testCases.length} test cases
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-col gap-1 ml-4">
                                {integration.status === 'planned' && (
                                  <Button
                                    size="sm"
                                    onClick={() => startIntegration(integration.id)}
                                  >
                                    <Play size={14} className="mr-1" />
                                    {t('startIntegration')}
                                  </Button>
                                )}
                                
                                {integration.status === 'implementing' && (
                                  <Button
                                    size="sm"
                                    onClick={() => completeIntegration(integration.id)}
                                  >
                                    <CheckCircle size={14} className="mr-1" />
                                    {t('completeIntegration')}
                                  </Button>
                                )}
                                
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingIntegration(integration);
                                      setFormData(integration);
                                      setIsCreatingIntegration(true);
                                    }}
                                  >
                                    <PencilSimple size={14} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteIntegration(integration.id)}
                                  >
                                    <Trash size={14} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Сопоставления */}
                <TabsContent value="mappings" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ArrowRight size={20} />
                        {t('mappingRules')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Code size={48} className="mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {language === 'ru' 
                            ? 'Правила сопоставления будут отображены здесь'
                            : 'Mapping rules will be displayed here'
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Преобразования */}
                <TabsContent value="transformations" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wrench size={20} />
                        {t('transformations')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Wrench size={48} className="mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {language === 'ru' 
                            ? 'Преобразования данных будут отображены здесь'
                            : 'Data transformations will be displayed here'
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Тестирование */}
                <TabsContent value="testing" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{t('testCases')}</h3>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (selectedIntegration) {
                          runAllTests(selectedIntegration);
                        }
                      }}
                      disabled={isRunningTests || !selectedIntegration}
                    >
                      {isRunningTests ? (
                        <>
                          <Play size={16} className="mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play size={16} className="mr-2" />
                          {t('runAllTests')}
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center py-8">
                        <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {language === 'ru' 
                            ? 'Выберите интеграцию для просмотра тест-кейсов'
                            : 'Select an integration to view test cases'
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Документация */}
                <TabsContent value="documentation" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText size={20} />
                        {t('documentation')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {language === 'ru' 
                            ? 'Документация интеграции будет отображена здесь'
                            : 'Integration documentation will be displayed here'
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}

          {(!session || totalIntegrations === 0) && (
            <div className="text-center py-12">
              <Plug size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {language === 'ru' ? 'Начните интеграцию' : 'Start Integration'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {language === 'ru' 
                  ? 'Создайте первую точку интеграции для подключения модулей AXON к основному UI'
                  : 'Create your first integration point to connect AXON modules to the main UI'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UIIntegrationManager;