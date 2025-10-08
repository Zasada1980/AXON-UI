import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Link,
  Users,
  Brain,
  Target,
  Shield,
  FileText,
  CheckCircle,
  Warning,
  Info,
  ArrowRight,
  Gear,
  Database,
  CloudArrowUp,
  Robot,
  FloppyDisk
} from '@phosphor-icons/react';

interface ModuleIntegration {
  id: string;
  fromModule: string;
  toModule: string;
  type: 'data-flow' | 'trigger' | 'dependency' | 'sync' | 'notification';
  description: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  lastExecuted?: string;
  executionCount: number;
  data?: any;
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    module: string;
    event: string;
    condition?: string;
  };
  actions: {
    module: string;
    action: string;
    parameters?: any;
  }[];
  isActive: boolean;
  lastTriggered?: string;
  triggerCount: number;
}

interface CrossModuleIntegratorProps {
  language: 'en' | 'ru';
  projectId: string;
  currentModule?: string;
  onIntegrationExecuted?: (integration: ModuleIntegration) => void;
  onRuleTriggered?: (rule: AutomationRule) => void;
}

const translations = {
  crossModuleIntegration: { en: 'Cross-Module Integration', ru: 'Межмодульная Интеграция' },
  integrationHub: { en: 'Integration Hub', ru: 'Центр Интеграции' },
  automationRules: { en: 'Automation Rules', ru: 'Правила Автоматизации' },
  moduleConnections: { en: 'Module Connections', ru: 'Соединения Модулей' },
  dataFlow: { en: 'Data Flow', ru: 'Поток Данных' },
  
  // Integration types
  'data-flow': { en: 'Data Flow', ru: 'Поток Данных' },
  trigger: { en: 'Trigger', ru: 'Триггер' },
  dependency: { en: 'Dependency', ru: 'Зависимость' },
  sync: { en: 'Synchronization', ru: 'Синхронизация' },
  notification: { en: 'Notification', ru: 'Уведомление' },
  
  // Status
  active: { en: 'Active', ru: 'Активно' },
  inactive: { en: 'Inactive', ru: 'Неактивно' },
  error: { en: 'Error', ru: 'Ошибка' },
  pending: { en: 'Pending', ru: 'Ожидает' },
  
  // Modules
  overview: { en: 'Overview', ru: 'Обзор' },
  kipling: { en: 'Kipling', ru: 'Киплинг' },
  ikr: { en: 'IKR', ru: 'IKR' },
  audit: { en: 'Audit', ru: 'Аудит' },
  debate: { en: 'Debate', ru: 'Дебаты' },
  executor: { en: 'Executor', ru: 'Исполнитель' },
  memory: { en: 'Memory', ru: 'Память' },
  files: { en: 'Files', ru: 'Файлы' },
  chat: { en: 'Chat', ru: 'Чат' },
  analytics: { en: 'Analytics', ru: 'Аналитика' },
  
  // Actions
  enableIntegration: { en: 'Enable Integration', ru: 'Включить Интеграцию' },
  disableIntegration: { en: 'Disable Integration', ru: 'Отключить Интеграцию' },
  testIntegration: { en: 'Test Integration', ru: 'Тестировать Интеграцию' },
  createRule: { en: 'Create Rule', ru: 'Создать Правило' },
  editRule: { en: 'Edit Rule', ru: 'Редактировать Правило' },
  deleteRule: { en: 'Delete Rule', ru: 'Удалить Правило' },
  
  // Messages
  integrationEnabled: { en: 'Integration enabled', ru: 'Интеграция включена' },
  integrationDisabled: { en: 'Integration disabled', ru: 'Интеграция отключена' },
  integrationTested: { en: 'Integration test completed', ru: 'Тест интеграции завершен' },
  ruleCreated: { en: 'Automation rule created', ru: 'Правило автоматизации создано' },
  ruleTriggered: { en: 'Rule triggered successfully', ru: 'Правило успешно сработало' }
};

const CrossModuleIntegrator: React.FC<CrossModuleIntegratorProps> = ({
  language,
  projectId,
  currentModule,
  onIntegrationExecuted,
  onRuleTriggered
}) => {
  const t = (key: string) => translations[key]?.[language] || key;
  
  const [integrations, setIntegrations] = useKV<ModuleIntegration[]>(`module-integrations-${projectId}`, []);
  const [automationRules, setAutomationRules] = useKV<AutomationRule[]>(`automation-rules-${projectId}`, []);
  const [activeTab, setActiveTab] = useState<'connections' | 'automation' | 'flow'>('connections');

  // Initialize default integrations
  useEffect(() => {
    if (!integrations || integrations.length === 0) {
      const defaultIntegrations: ModuleIntegration[] = [
        {
          id: 'audit-to-microtasks',
          fromModule: 'audit',
          toModule: 'microtasks',
          type: 'trigger',
          description: language === 'ru' 
            ? 'Автоматическое создание микро-задач из результатов аудита'
            : 'Automatically create micro-tasks from audit results',
          status: 'active',
          executionCount: 0
        },
        {
          id: 'debate-to-memory',
          fromModule: 'debate',
          toModule: 'memory',
          type: 'data-flow',
          description: language === 'ru' 
            ? 'Сохранение важных решений дебатов в память агентов'
            : 'Save important debate decisions to agent memory',
          status: 'active',
          executionCount: 0
        },
        {
          id: 'files-to-chat',
          fromModule: 'files',
          toModule: 'chat',
          type: 'sync',
          description: language === 'ru' 
            ? 'Синхронизация результатов анализа файлов с чат-контекстом'
            : 'Sync file analysis results with chat context',
          status: 'active',
          executionCount: 0
        },
        {
          id: 'kipling-to-ikr',
          fromModule: 'kipling',
          toModule: 'ikr',
          type: 'dependency',
          description: language === 'ru' 
            ? 'Автоматическое обновление IKR на основе анализа Киплинга'
            : 'Automatically update IKR based on Kipling analysis',
          status: 'active',
          executionCount: 0
        },
        {
          id: 'all-to-analytics',
          fromModule: '*',
          toModule: 'analytics',
          type: 'notification',
          description: language === 'ru' 
            ? 'Отправка метрик из всех модулей в систему аналитики'
            : 'Send metrics from all modules to analytics system',
          status: 'active',
          executionCount: 0
        }
      ];
      
      setIntegrations(defaultIntegrations);
    }

    if (!automationRules || automationRules.length === 0) {
      const defaultRules: AutomationRule[] = [
        {
          id: 'audit-findings-to-tasks',
          name: language === 'ru' ? 'Создание задач из находок аудита' : 'Create Tasks from Audit Findings',
          description: language === 'ru' 
            ? 'Автоматически создавать микро-задачи для критических находок аудита'
            : 'Automatically create micro-tasks for critical audit findings',
          trigger: {
            module: 'audit',
            event: 'audit_completed',
            condition: 'findings.length > 0 && findings.some(f => f.severity === "critical")'
          },
          actions: [
            {
              module: 'microtasks',
              action: 'create_task',
              parameters: {
                title: 'Fix Critical Security Issue',
                priority: 'urgent',
                estimatedMinutes: 45
              }
            },
            {
              module: 'notifications',
              action: 'send_alert',
              parameters: {
                type: 'security_alert',
                priority: 'high'
              }
            }
          ],
          isActive: true,
          triggerCount: 0
        },
        {
          id: 'debate-consensus-to-memory',
          name: language === 'ru' ? 'Сохранение консенсуса дебатов' : 'Save Debate Consensus',
          description: language === 'ru' 
            ? 'Сохранять важные решения дебатов в память агентов'
            : 'Save important debate decisions to agent memory',
          trigger: {
            module: 'debate',
            event: 'debate_completed',
            condition: 'consensusLevel > 80'
          },
          actions: [
            {
              module: 'memory',
              action: 'create_backup_request',
              parameters: {
                type: 'decision',
                quality: 'high'
              }
            }
          ],
          isActive: true,
          triggerCount: 0
        },
        {
          id: 'file-analysis-to-context',
          name: language === 'ru' ? 'Обновление контекста из файлов' : 'Update Context from Files',
          description: language === 'ru' 
            ? 'Обновлять контекст чата и анализа на основе результатов анализа файлов'
            : 'Update chat and analysis context based on file analysis results',
          trigger: {
            module: 'files',
            event: 'file_analyzed',
            condition: 'analysis.confidence > 75'
          },
          actions: [
            {
              module: 'chat',
              action: 'update_context',
              parameters: {
                source: 'file_analysis'
              }
            },
            {
              module: 'kipling',
              action: 'suggest_updates',
              parameters: {
                basedOn: 'file_insights'
              }
            }
          ],
          isActive: true,
          triggerCount: 0
        }
      ];
      
      setAutomationRules(defaultRules);
    }
  }, [integrations, automationRules, setIntegrations, setAutomationRules, language]);

  // Get module icon
  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'overview': return <Target size={16} className="text-blue-500" />;
      case 'kipling': return <Users size={16} className="text-purple-500" />;
      case 'ikr': return <Brain size={16} className="text-green-500" />;
      case 'audit': return <Shield size={16} className="text-red-500" />;
      case 'debate': return <Users size={16} className="text-orange-500" />;
      case 'executor': return <Gear size={16} className="text-yellow-500" />;
      case 'memory': return <Database size={16} className="text-pink-500" />;
      case 'files': return <FileText size={16} className="text-cyan-500" />;
      case 'chat': return <Robot size={16} className="text-indigo-500" />;
      case 'analytics': return <ArrowRight size={16} className="text-gray-500" />;
      case '*': return <CloudArrowUp size={16} className="text-gray-400" />;
      default: return <Info size={16} className="text-gray-500" />;
    }
  };

  // Get integration type icon
  const getIntegrationTypeIcon = (type: ModuleIntegration['type']) => {
    switch (type) {
      case 'data-flow': return <ArrowRight size={16} className="text-blue-500" />;
      case 'trigger': return <Gear size={16} className="text-green-500" />;
      case 'dependency': return <Link size={16} className="text-purple-500" />;
      case 'sync': return <FloppyDisk size={16} className="text-orange-500" />;
      case 'notification': return <Info size={16} className="text-cyan-500" />;
      default: return <Info size={16} className="text-gray-500" />;
    }
  };

  // Get status badge variant
  const getStatusVariant = (status: ModuleIntegration['status']) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'error': return 'destructive';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  // Toggle integration status
  const toggleIntegration = (integrationId: string) => {
    setIntegrations(current => 
      (current || []).map(integration => 
        integration.id === integrationId 
          ? {
              ...integration,
              status: integration.status === 'active' ? 'inactive' : 'active',
              lastExecuted: integration.status === 'inactive' ? new Date().toISOString() : integration.lastExecuted
            }
          : integration
      )
    );
    
    const integration = integrations?.find(i => i.id === integrationId);
    if (integration) {
      toast.success(integration.status === 'active' ? t('integrationDisabled') : t('integrationEnabled'));
    }
  };

  // Test integration
  const testIntegration = async (integrationId: string) => {
    const integration = integrations?.find(i => i.id === integrationId);
    if (!integration) return;

    // Update integration with test execution
    setIntegrations(current => 
      (current || []).map(i => 
        i.id === integrationId 
          ? {
              ...i,
              lastExecuted: new Date().toISOString(),
              executionCount: i.executionCount + 1,
              status: 'active'
            }
          : i
      )
    );

    onIntegrationExecuted?.(integration);
    toast.success(t('integrationTested'));
  };

  // Toggle automation rule
  const toggleRule = (ruleId: string) => {
    setAutomationRules(current => 
      (current || []).map(rule => 
        rule.id === ruleId 
          ? { ...rule, isActive: !rule.isActive }
          : rule
      )
    );
    
    const rule = automationRules?.find(r => r.id === ruleId);
    if (rule) {
      toast.success(rule.isActive ? 'Rule disabled' : 'Rule enabled');
    }
  };

  // Simulate rule triggering
  const simulateRuleTrigger = async (ruleId: string) => {
    const rule = automationRules?.find(r => r.id === ruleId);
    if (!rule || !rule.isActive) return;

    // Update rule with trigger execution
    setAutomationRules(current => 
      (current || []).map(r => 
        r.id === ruleId 
          ? {
              ...r,
              lastTriggered: new Date().toISOString(),
              triggerCount: r.triggerCount + 1
            }
          : r
      )
    );

    onRuleTriggered?.(rule);
    toast.success(t('ruleTriggered'));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link size={24} className="text-primary" />
            {t('crossModuleIntegration')}
          </CardTitle>
          <CardDescription>
            {language === 'ru' 
              ? 'Управление интеграциями и автоматизацией между модулями системы'
              : 'Manage integrations and automation between system modules'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'connections' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('connections')}
            >
              <Link size={16} className="mr-2" />
              {t('moduleConnections')}
            </Button>
            <Button
              variant={activeTab === 'automation' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('automation')}
            >
              <Gear size={16} className="mr-2" />
              {t('automationRules')}
            </Button>
            <Button
              variant={activeTab === 'flow' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('flow')}
            >
              <ArrowRight size={16} className="mr-2" />
              {t('dataFlow')}
            </Button>
          </div>

          {/* Module Connections Tab */}
          {activeTab === 'connections' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{t('moduleConnections')}</h3>
                <Badge variant="outline">
                  {integrations?.filter(i => i.status === 'active').length || 0} / {integrations?.length || 0} active
                </Badge>
              </div>

              <div className="grid gap-4">
                {integrations?.map(integration => (
                  <Card key={integration.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getModuleIcon(integration.fromModule)}
                            <span className="text-sm font-medium">{t(integration.fromModule)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getIntegrationTypeIcon(integration.type)}
                            <ArrowRight size={16} className="text-muted-foreground" />
                          </div>
                          <div className="flex items-center gap-2">
                            {getModuleIcon(integration.toModule)}
                            <span className="text-sm font-medium">{t(integration.toModule)}</span>
                          </div>
                        </div>
                        <Badge variant={getStatusVariant(integration.status)}>
                          {t(integration.status)}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {integration.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-4">
                          <span>Type: {t(integration.type)}</span>
                          <span>Executions: {integration.executionCount}</span>
                          {integration.lastExecuted && (
                            <span>Last: {new Date(integration.lastExecuted).toLocaleString()}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={integration.status === 'active' ? 'destructive' : 'default'}
                          onClick={() => toggleIntegration(integration.id)}
                        >
                          {integration.status === 'active' ? t('disableIntegration') : t('enableIntegration')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testIntegration(integration.id)}
                          disabled={integration.status !== 'active'}
                        >
                          <CheckCircle size={16} className="mr-2" />
                          {t('testIntegration')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    <Link size={48} className="mx-auto mb-4" />
                    <p>No integrations configured</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Automation Rules Tab */}
          {activeTab === 'automation' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{t('automationRules')}</h3>
                <Badge variant="outline">
                  {automationRules?.filter(r => r.isActive).length || 0} / {automationRules?.length || 0} active
                </Badge>
              </div>

              <div className="grid gap-4">
                {automationRules?.map(rule => (
                  <Card key={rule.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{rule.name}</h4>
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                        </div>
                        <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                          {rule.isActive ? t('active') : t('inactive')}
                        </Badge>
                      </div>

                      {/* Trigger Info */}
                      <div className="space-y-2 mb-4">
                        <div className="p-2 bg-muted rounded-lg">
                          <div className="text-xs font-medium mb-1">Trigger:</div>
                          <div className="flex items-center gap-2 text-sm">
                            {getModuleIcon(rule.trigger.module)}
                            <span>{t(rule.trigger.module)}</span>
                            <ArrowRight size={14} />
                            <span>{rule.trigger.event}</span>
                          </div>
                          {rule.trigger.condition && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Condition: {rule.trigger.condition}
                            </div>
                          )}
                        </div>

                        <div className="p-2 bg-muted rounded-lg">
                          <div className="text-xs font-medium mb-1">Actions:</div>
                          <div className="space-y-1">
                            {rule.actions.map((action, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                {getModuleIcon(action.module)}
                                <span>{t(action.module)}</span>
                                <ArrowRight size={14} />
                                <span>{action.action}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span>Triggered: {rule.triggerCount} times</span>
                        {rule.lastTriggered && (
                          <span>Last: {new Date(rule.lastTriggered).toLocaleString()}</span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={rule.isActive ? 'destructive' : 'default'}
                          onClick={() => toggleRule(rule.id)}
                        >
                          {rule.isActive ? 'Disable' : 'Enable'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => simulateRuleTrigger(rule.id)}
                          disabled={!rule.isActive}
                        >
                          <CheckCircle size={16} className="mr-2" />
                          Test Rule
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    <Gear size={48} className="mx-auto mb-4" />
                    <p>No automation rules configured</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Data Flow Tab */}
          {activeTab === 'flow' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">{t('dataFlow')}</h3>
              
              {/* Flow Visualization */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Integration Flow Map</CardTitle>
                  <CardDescription>
                    Visual representation of data flow between modules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Module Grid */}
                    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                      {['overview', 'kipling', 'ikr', 'audit', 'debate', 'executor', 'memory', 'files', 'chat', 'analytics'].map(module => {
                        const moduleIntegrations = integrations?.filter(i => 
                          i.fromModule === module || i.toModule === module
                        ) || [];
                        const isSource = moduleIntegrations.some(i => i.fromModule === module);
                        const isTarget = moduleIntegrations.some(i => i.toModule === module);
                        
                        return (
                          <Card key={module} className={`text-center ${
                            currentModule === module ? 'ring-2 ring-primary' : ''
                          }`}>
                            <CardContent className="p-3">
                              <div className="flex flex-col items-center gap-2">
                                {getModuleIcon(module)}
                                <span className="text-sm font-medium">{t(module)}</span>
                                <div className="flex gap-1">
                                  {isSource && (
                                    <Badge variant="outline" className="text-xs">
                                      Source
                                    </Badge>
                                  )}
                                  {isTarget && (
                                    <Badge variant="secondary" className="text-xs">
                                      Target
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {moduleIntegrations.length} connections
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    <Separator />

                    {/* Active Flows */}
                    <div>
                      <h4 className="font-medium mb-3">Active Data Flows</h4>
                      <div className="space-y-2">
                        {integrations?.filter(i => i.status === 'active' && i.type === 'data-flow').map(integration => (
                          <div key={integration.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                {getModuleIcon(integration.fromModule)}
                                <span className="text-sm">{t(integration.fromModule)}</span>
                              </div>
                              <ArrowRight size={16} className="text-muted-foreground" />
                              <div className="flex items-center gap-2">
                                {getModuleIcon(integration.toModule)}
                                <span className="text-sm">{t(integration.toModule)}</span>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {integration.executionCount} transfers
                            </div>
                          </div>
                        )) || (
                          <p className="text-sm text-muted-foreground">No active data flows</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Flow Statistics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {integrations?.filter(i => i.status === 'active').length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Integrations</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {automationRules?.filter(r => r.isActive).length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Rules</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {integrations?.reduce((sum, i) => sum + i.executionCount, 0) || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Executions</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-500">
                      {automationRules?.reduce((sum, r) => sum + r.triggerCount, 0) || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Rule Triggers</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CrossModuleIntegrator;