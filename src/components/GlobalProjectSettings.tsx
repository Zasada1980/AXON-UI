import React, { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Gear, 
  Download, 
  Upload, 
  Trash, 
  Plus, 
  Shield, 
  // Globe, 
  Robot, 
  Terminal, 
  // FileText,
  Database,
  // Key,
  Eye,
  Users,
  ChartLine,
  Play,
  // Stop,
  // Warning,
  // CheckCircle,
  ArrowRight,
  FloppyDisk,
  // Bug,
  // Lightbulb,
  // Target,
  // ListChecks,
  // SecurityCamera,
  // CloudArrowUp,
  Brain,
  Archive,
  // Graph
} from '@phosphor-icons/react';

// Type definitions for global project settings
interface ProjectSettings {
  name: string;
  type: 'local' | 'cloud' | 'hybrid';
  description: string;
  resources: {
    maxActiveAgents: number;
    maxAgentHierarchyDepth: number;
    maxConcurrentTasks: number;
  };
  models: {
    allowedModels: string[];
    defaultModel: string;
    internetAccess: boolean;
    perAgentOverride: boolean;
  };
  limits: {
    defaultTimeout: number;
    networkTimeout: number;
    maxMessageSize: number;
    maxFileSize: number;
  };
  storage: {
    autoBackup: boolean;
    retentionDays: number;
    compression: boolean;
  };
  security: {
    allowSystemCommands: boolean;
    allowAgentCreation: boolean;
    ipWhitelist: string[];
    rateLimitEnabled: boolean;
    // Authentication System settings
    authenticationEnabled?: boolean;
    sessionTimeout?: number;
    twoFactorRequired?: boolean;
    maxConcurrentSessions?: number;
    // API Key Management settings
    encryptionEnabled?: boolean;
    autoKeyValidation?: boolean;
    keyRotationEnabled?: boolean;
    secureKeyStorage?: boolean;
  };
  automation: {
    autoStartAgents: boolean;
    autoCheckEnvironment: boolean;
    autoStartTerminal: boolean;
    autoSnapshot: boolean;
    autoArchiveLogs: boolean;
  };
  ux?: {
    acaAutoPickFramework?: boolean;
  };
  utilities?: {
    maxFileSize?: number;
    allowedFileTypes?: string[];
    autoAnalyzeFiles?: boolean;
    enableSemanticSearch?: boolean;
    maxSearchResults?: number;
    enablePushNotifications?: boolean;
    enableEmailNotifications?: boolean;
    notificationFrequency?: 'immediate' | 'hourly' | 'daily';
    showHelpTips?: boolean;
    enableGuidedTour?: boolean;
  };
}

interface AgentTemplate {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: string;
  color: string;
  skills: string[];
  personality: string;
  permissions: {
    canRunScripts: boolean;
    canCreateAgents: boolean;
    canAccessLogs: boolean;
    canModifyKnowledgeBase: boolean;
  };
  autoStart: boolean;
  defaultSettings: Record<string, any>;
}

interface KnowledgeBase {
  id: string;
  name: string;
  type: 'markdown' | 'jsonl' | 'sqlite' | 'archive';
  size: number;
  objects: number;
  version: string;
  owners: string[];
  lastModified: string;
  path: string;
}

interface AnalyticsReport {
  id: string;
  title: string;
  type: 'debate' | 'agent_performance' | 'trends' | 'training';
  generatedAt: string;
  summary: string;
  insights: string[];
  data: Record<string, any>;
}

interface GlobalProjectSettingsProps {
  language: 'en' | 'ru';
  projectId: string;
  onSettingsChanged?: (settings: ProjectSettings) => void;
  onAgentTemplateCreated?: (template: AgentTemplate) => void;
  onKnowledgeBaseUpdated?: (kb: KnowledgeBase) => void;
  onAnalyticsReportGenerated?: (report: AnalyticsReport) => void;
}

const GlobalProjectSettings: React.FC<GlobalProjectSettingsProps> = ({
  language,
  projectId,
  onSettingsChanged,
  onAgentTemplateCreated,
  // onKnowledgeBaseUpdated,
  onAnalyticsReportGenerated
}) => {
  // State management
  const [settings, setSettings] = useKV<ProjectSettings>(`project-settings-${projectId}`, {
    name: 'AXON Project',
    type: 'hybrid',
    description: 'Intelligence Analysis Project',
    resources: {
      maxActiveAgents: 5,
      maxAgentHierarchyDepth: 3,
      maxConcurrentTasks: 10
    },
    models: {
      allowedModels: ['gpt-4o', 'gpt-4o-mini', 'claude-3', 'gemini-pro'],
      defaultModel: 'gpt-4o-mini',
      internetAccess: false,
      perAgentOverride: true
    },
    limits: {
      defaultTimeout: 300000,
      networkTimeout: 30000,
      maxMessageSize: 100000,
      maxFileSize: 10485760
    },
    storage: {
      autoBackup: true,
      retentionDays: 30,
      compression: true
    },
    security: {
      allowSystemCommands: false,
      allowAgentCreation: true,
      ipWhitelist: [],
      rateLimitEnabled: true,
      // Authentication System defaults
      authenticationEnabled: true,
      sessionTimeout: 1440, // 24 hours in minutes
      twoFactorRequired: false,
      maxConcurrentSessions: 3,
      // API Key Management defaults
      encryptionEnabled: true,
      autoKeyValidation: true,
      keyRotationEnabled: false,
      secureKeyStorage: true,
    },
    automation: {
      autoStartAgents: true,
      autoCheckEnvironment: true,
      autoStartTerminal: false,
      autoSnapshot: true,
      autoArchiveLogs: true
    },
    ux: {
      acaAutoPickFramework: true,
    }
  });

  const [agentTemplates, setAgentTemplates] = useKV<AgentTemplate[]>(`agent-templates-${projectId}`, []);
  const [knowledgeBases] = useKV<KnowledgeBase[]>(`knowledge-bases-${projectId}`, []);
  const [analyticsReports, setAnalyticsReports] = useKV<AnalyticsReport[]>(`analytics-reports-${projectId}`, []);
  
  const [terminalHistory, setTerminalHistory] = useKV<Array<{
    id: string;
    command: string;
    output: string;
    timestamp: string;
    status: 'success' | 'error' | 'pending';
    agent?: string;
  }>>(`terminal-history-${projectId}`, []);

  // const [isTerminalVisible, setIsTerminalVisible] = useState(false);
  const [currentCommand, setCurrentCommand] = useState('');
  const [terminalMode, setTerminalMode] = useState<'auto' | 'confirm' | 'readonly'>('confirm');

  // Get translation function
  const t = (key: string) => {
    const translations: Record<string, { en: string; ru: string }> = {
      // Project Settings
      projectSettings: { en: 'Project Settings', ru: 'Настройки Проекта' },
      projectName: { en: 'Project Name', ru: 'Название Проекта' },
      projectType: { en: 'Project Type', ru: 'Тип Проекта' },
      projectDescription: { en: 'Description', ru: 'Описание' },
      local: { en: 'Local', ru: 'Локальный' },
      cloud: { en: 'Cloud', ru: 'Облачный' },
      hybrid: { en: 'Hybrid', ru: 'Гибридный' },
      
      // Resources
      resources: { en: 'Resources & Concurrency', ru: 'Ресурсы и Конкурентность' },
      maxActiveAgents: { en: 'Max Active Agents', ru: 'Максимум Активных Агентов' },
      maxAgentHierarchy: { en: 'Max Agent Hierarchy Depth', ru: 'Максимальная Глубина Иерархии' },
      maxConcurrentTasks: { en: 'Max Concurrent Tasks', ru: 'Максимум Параллельных Задач' },
      
      // Models
      modelsAccess: { en: 'Models & Access', ru: 'Модели и Доступ' },
      allowedModels: { en: 'Allowed Models', ru: 'Разрешённые Модели' },
      defaultModel: { en: 'Default Model', ru: 'Модель по Умолчанию' },
      internetAccess: { en: 'Internet Access', ru: 'Доступ к Интернету' },
      perAgentOverride: { en: 'Per-Agent Override', ru: 'Переопределение на Агента' },
      
      // Security
      security: { en: 'Security & Access', ru: 'Безопасность и Доступ' },
      allowSystemCommands: { en: 'Allow System Commands', ru: 'Разрешить Системные Команды' },
      allowAgentCreation: { en: 'Allow Agent Creation', ru: 'Разрешить Создание Агентов' },
      authenticationEnabled: { en: 'Authentication Enabled', ru: 'Аутентификация Включена' },
      sessionTimeout: { en: 'Session Timeout (minutes)', ru: 'Таймаут Сессии (минуты)' },
      twoFactorRequired: { en: 'Two-Factor Required', ru: 'Обязательная 2FA' },
      maxConcurrentSessions: { en: 'Max Concurrent Sessions', ru: 'Максимум Одновременных Сессий' },
      encryptionEnabled: { en: 'Encryption Enabled', ru: 'Шифрование Включено' },
      autoKeyValidation: { en: 'Auto Key Validation', ru: 'Автопроверка Ключей' },
      keyRotationEnabled: { en: 'Key Rotation Enabled', ru: 'Ротация Ключей Включена' },
      secureKeyStorage: { en: 'Secure Key Storage', ru: 'Безопасное Хранение Ключей' },
      
      // Automation
      automation: { en: 'Automation & Defaults', ru: 'Автоматизация и Умолчания' },
      autoStartAgents: { en: 'Auto-Start Agents', ru: 'Автозапуск Агентов' },
      autoCheckEnvironment: { en: 'Auto-Check Environment', ru: 'Автопроверка Окружения' },
      autoStartTerminal: { en: 'Auto-Start Terminal', ru: 'Автозапуск Терминала' },
      
      // Agent Templates
      agentTemplates: { en: 'Agent Templates', ru: 'Шаблоны Агентов' },
      createTemplate: { en: 'Create Template', ru: 'Создать Шаблон' },
      templateName: { en: 'Template Name', ru: 'Название Шаблона' },
      role: { en: 'Role', ru: 'Роль' },
      skills: { en: 'Skills', ru: 'Навыки' },
      personality: { en: 'Personality', ru: 'Личность' },
      
      // Knowledge Base
      knowledgeBase: { en: 'Knowledge Base', ru: 'База Знаний' },
      importKB: { en: 'Import KB', ru: 'Импорт БЗ' },
      exportKB: { en: 'Export KB', ru: 'Экспорт БЗ' },
      clearKB: { en: 'Clear KB', ru: 'Очистить БЗ' },
      
      // Terminal
      terminal: { en: 'Agent Console', ru: 'Консоль Агентов' },
      terminalMode: { en: 'Execution Mode', ru: 'Режим Выполнения' },
      automatic: { en: 'Automatic', ru: 'Автоматический' },
      confirmation: { en: 'With Confirmation', ru: 'С Подтверждением' },
      readonly: { en: 'Read-Only', ru: 'Только Чтение' },
      
      // Analytics
      analytics: { en: 'Analytics & Training', ru: 'Аналитика и Обучение' },
      debateAnalysis: { en: 'Debate Analysis', ru: 'Анализ Дебатов' },
      agentTraining: { en: 'Agent Training', ru: 'Обучение Агентов' },
      trendsReports: { en: 'Trends & Reports', ru: 'Тренды и Отчёты' },
      
      // Utilities
      utilities: { en: 'Utilities & Tools', ru: 'Утилиты и Инструменты' },
      fileUploadSettings: { en: 'File Upload Settings', ru: 'Настройки Загрузки Файлов' },
      maxFileSize: { en: 'Max File Size (MB)', ru: 'Максимальный Размер Файла (МБ)' },
      allowedFileTypes: { en: 'Allowed File Types', ru: 'Разрешённые Типы Файлов' },
      autoAnalyzeFiles: { en: 'Auto-Analyze Uploaded Files', ru: 'Автоанализ Загруженных Файлов' },
      searchSettings: { en: 'Search & Filter Settings', ru: 'Настройки Поиска и Фильтров' },
      enableSemanticSearch: { en: 'Enable Semantic Search', ru: 'Включить Семантический Поиск' },
      maxSearchResults: { en: 'Max Search Results', ru: 'Максимум Результатов Поиска' },
      notificationSettings: { en: 'Notification Settings', ru: 'Настройки Уведомлений' },
      enablePushNotifications: { en: 'Enable Push Notifications', ru: 'Включить Push Уведомления' },
      enableEmailNotifications: { en: 'Enable Email Notifications', ru: 'Включить Email Уведомления' },
      notificationFrequency: { en: 'Notification Frequency', ru: 'Частота Уведомлений' },
      immediateNotifications: { en: 'Immediate', ru: 'Немедленно' },
      hourlyNotifications: { en: 'Hourly', ru: 'Ежечасно' },
      dailyNotifications: { en: 'Daily', ru: 'Ежедневно' },
      navigationSettings: { en: 'Navigation & Guide Settings', ru: 'Настройки Навигации и Гида' },
      showHelpTips: { en: 'Show Help Tips', ru: 'Показывать Подсказки' },
      enableGuidedTour: { en: 'Enable Guided Tour', ru: 'Включить Интерактивный Тур' },
      
      // Actions
      save: { en: 'Save', ru: 'Сохранить' },
      export: { en: 'Export', ru: 'Экспорт' },
      import: { en: 'Import', ru: 'Импорт' },
      reset: { en: 'Reset to Default', ru: 'Сбросить к Умолчанию' },
      execute: { en: 'Execute', ru: 'Выполнить' },
      clear: { en: 'Clear', ru: 'Очистить' },
      
      // Status
      enabled: { en: 'Enabled', ru: 'Включено' },
      disabled: { en: 'Disabled', ru: 'Отключено' },
      active: { en: 'Active', ru: 'Активно' },
      inactive: { en: 'Inactive', ru: 'Неактивно' }
    };
    
    return translations[key]?.[language] || key;
  };

  // Update settings function
  const updateSettings = (key: keyof ProjectSettings, value: any) => {
    if (!settings) return;
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChanged?.(newSettings);
  };

  // Create agent template
  const createAgentTemplate = async (templateData: Partial<AgentTemplate>) => {
    const newTemplate: AgentTemplate = {
      id: `template-${Date.now()}`,
      name: templateData.name || 'New Agent',
      role: templateData.role || 'Assistant',
      description: templateData.description || '',
      icon: templateData.icon || '🤖',
      color: templateData.color || '#0ea5e9',
      skills: templateData.skills || [],
      personality: templateData.personality || 'Helpful and professional',
      permissions: {
        canRunScripts: false,
        canCreateAgents: false,
        canAccessLogs: true,
        canModifyKnowledgeBase: false,
        ...templateData.permissions
      },
      autoStart: templateData.autoStart || false,
      defaultSettings: templateData.defaultSettings || {}
    };

    setAgentTemplates(current => [...(current || []), newTemplate]);
    onAgentTemplateCreated?.(newTemplate);
    toast.success(language === 'ru' ? 'Шаблон агента создан' : 'Agent template created');
  };

  // Execute terminal command
  const executeCommand = async (command: string, agentId?: string) => {
    const commandId = `cmd-${Date.now()}`;
    const historyEntry = {
      id: commandId,
      command,
      output: '',
      timestamp: new Date().toISOString(),
      status: 'pending' as const,
      agent: agentId
    };

    setTerminalHistory(current => [...(current || []), historyEntry]);

    // Simulate command execution
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock command execution result
      const mockOutput = `Executed: ${command}\nResult: Success\nAgent: ${agentId || 'System'}`;
      
      setTerminalHistory(current => 
        (current || []).map(entry => 
          entry.id === commandId 
            ? { ...entry, output: mockOutput, status: 'success' as const }
            : entry
        )
      );
      
      toast.success(language === 'ru' ? 'Команда выполнена' : 'Command executed');
    } catch (error) {
      setTerminalHistory(current => 
        (current || []).map(entry => 
          entry.id === commandId 
            ? { ...entry, output: `Error: ${error}`, status: 'error' as const }
            : entry
        )
      );
      
      toast.error(language === 'ru' ? 'Ошибка выполнения команды' : 'Command execution failed');
    }
  };

  // Generate analytics report
  const generateAnalyticsReport = async (type: AnalyticsReport['type']) => {
    const reportId = `report-${Date.now()}`;
    const newReport: AnalyticsReport = {
      id: reportId,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Analysis`,
      type,
      generatedAt: new Date().toISOString(),
      summary: 'Comprehensive analysis of system performance and agent behavior',
      insights: [
        'Agent performance improved by 15% over last period',
        'Debate resolution time decreased by 8%',
        'Knowledge base utilization increased by 23%'
      ],
      data: {
        period: '7d',
        totalSessions: 45,
        successRate: 87.3,
        avgResponseTime: 2.4
      }
    };

    setAnalyticsReports(current => [...(current || []), newReport]);
    onAnalyticsReportGenerated?.(newReport);
    toast.success(language === 'ru' ? 'Отчёт аналитики создан' : 'Analytics report generated');
  };

  // Ensure settings is available
  if (!settings) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gear size={24} className="text-primary" />
            {t('projectSettings')}
          </CardTitle>
          <CardDescription>
            {language === 'ru' 
              ? 'Центральная панель управления всей системой' 
              : 'Central control panel for the entire system'}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="project" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="project" className="flex items-center gap-2">
            <Gear size={16} />
            {t('projectSettings')}
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Robot size={16} />
            {t('agentTemplates')}
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <Database size={16} />
            {t('knowledgeBase')}
          </TabsTrigger>
          <TabsTrigger value="terminal" className="flex items-center gap-2">
            <Terminal size={16} />
            {t('terminal')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <ChartLine size={16} />
            {t('analytics')}
          </TabsTrigger>
          <TabsTrigger value="utilities" className="flex items-center gap-2">
            <Gear size={16} />
            {t('utilities')}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield size={16} />
            {t('security')}
          </TabsTrigger>
        </TabsList>

        {/* Project Settings Tab */}
        <TabsContent value="project" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Project Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('projectSettings')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="project-name">{t('projectName')}</Label>
                  <Input
                    id="project-name"
                    value={settings.name}
                    onChange={(e) => updateSettings('name', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>{t('projectType')}</Label>
                  <Select 
                    value={settings.type} 
                    onValueChange={(value: 'local' | 'cloud' | 'hybrid') => updateSettings('type', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">{t('local')}</SelectItem>
                      <SelectItem value="cloud">{t('cloud')}</SelectItem>
                      <SelectItem value="hybrid">{t('hybrid')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="project-description">{t('projectDescription')}</Label>
                  <Textarea
                    id="project-description"
                    value={settings.description}
                    onChange={(e) => updateSettings('description', e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('resources')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t('maxActiveAgents')}: {settings.resources.maxActiveAgents}</Label>
                  <Input
                    type="range"
                    min="1"
                    max="20"
                    value={settings.resources.maxActiveAgents}
                    onChange={(e) => updateSettings('resources', {
                      ...settings.resources,
                      maxActiveAgents: parseInt(e.target.value)
                    })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>{t('maxAgentHierarchy')}: {settings.resources.maxAgentHierarchyDepth}</Label>
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={settings.resources.maxAgentHierarchyDepth}
                    onChange={(e) => updateSettings('resources', {
                      ...settings.resources,
                      maxAgentHierarchyDepth: parseInt(e.target.value)
                    })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label>{t('maxConcurrentTasks')}: {settings.resources.maxConcurrentTasks}</Label>
                  <Input
                    type="range"
                    min="1"
                    max="50"
                    value={settings.resources.maxConcurrentTasks}
                    onChange={(e) => updateSettings('resources', {
                      ...settings.resources,
                      maxConcurrentTasks: parseInt(e.target.value)
                    })}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Models & Access */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('modelsAccess')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t('defaultModel')}</Label>
                  <Select 
                    value={settings.models.defaultModel} 
                    onValueChange={(value) => updateSettings('models', {
                      ...settings.models,
                      defaultModel: value
                    })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.models.allowedModels.map(model => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>{t('internetAccess')}</Label>
                  <Switch
                    checked={settings.models.internetAccess}
                    onCheckedChange={(checked) => updateSettings('models', {
                      ...settings.models,
                      internetAccess: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>{t('perAgentOverride')}</Label>
                  <Switch
                    checked={settings.models.perAgentOverride}
                    onCheckedChange={(checked) => updateSettings('models', {
                      ...settings.models,
                      perAgentOverride: checked
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Automation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('automation')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>{t('autoStartAgents')}</Label>
                  <Switch
                    checked={settings.automation.autoStartAgents}
                    onCheckedChange={(checked) => updateSettings('automation', {
                      ...settings.automation,
                      autoStartAgents: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>{t('autoCheckEnvironment')}</Label>
                  <Switch
                    checked={settings.automation.autoCheckEnvironment}
                    onCheckedChange={(checked) => updateSettings('automation', {
                      ...settings.automation,
                      autoCheckEnvironment: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>{t('autoStartTerminal')}</Label>
                  <Switch
                    checked={settings.automation.autoStartTerminal}
                    onCheckedChange={(checked) => updateSettings('automation', {
                      ...settings.automation,
                      autoStartTerminal: checked
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* UX Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">UX</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>ACA: Auto-pick first framework</Label>
                    <p className="text-sm text-muted-foreground">Автоматически подставлять первый фреймворк, если пользователь не выбрал</p>
                  </div>
                  <Switch
                    checked={Boolean(settings.ux?.acaAutoPickFramework)}
                    onCheckedChange={(checked) => updateSettings('ux', {
                      ...(settings.ux || {}),
                      acaAutoPickFramework: checked
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Agent Templates Tab */}
        <TabsContent value="agents" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t('agentTemplates')}</h3>
            <Button onClick={() => createAgentTemplate({ name: 'New Template' })}>
              <Plus size={16} className="mr-2" />
              {t('createTemplate')}
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(agentTemplates || []).map(template => (
              <Card key={template.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{ backgroundColor: template.color + '20', color: template.color }}
                    >
                      {template.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription className="text-sm">{template.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {template.skills.slice(0, 3).map(skill => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {template.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {template.autoStart ? t('active') : t('inactive')}
                      </span>
                      <div className="flex items-center gap-1">
                        {template.permissions.canRunScripts && <Terminal size={12} />}
                        {template.permissions.canCreateAgents && <Users size={12} />}
                        {template.permissions.canAccessLogs && <Eye size={12} />}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {(agentTemplates || []).length === 0 && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Robot size={48} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    {language === 'ru' 
                      ? 'Нет созданных шаблонов агентов' 
                      : 'No agent templates created yet'}
                  </p>
                  <Button 
                    onClick={() => createAgentTemplate({ name: 'Default Assistant' })}
                    className="mt-4"
                    variant="outline"
                  >
                    <Plus size={16} className="mr-2" />
                    {t('createTemplate')}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t('knowledgeBase')}</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Upload size={16} className="mr-2" />
                {t('importKB')}
              </Button>
              <Button variant="outline" size="sm">
                <Download size={16} className="mr-2" />
                {t('exportKB')}
              </Button>
              <Button variant="destructive" size="sm">
                <Trash size={16} className="mr-2" />
                {t('clearKB')}
              </Button>
            </div>
          </div>
          
          <div className="grid gap-4">
            {(knowledgeBases || []).length > 0 ? (
              (knowledgeBases || []).map(kb => (
                <Card key={kb.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{kb.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {kb.objects} objects • {(kb.size / 1024 / 1024).toFixed(2)} MB • v{kb.version}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{kb.type}</Badge>
                        <Button size="sm" variant="outline">
                          <Eye size={16} className="mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download size={16} className="mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Database size={48} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    {language === 'ru' 
                      ? 'База знаний не инициализирована' 
                      : 'Knowledge base not initialized'}
                  </p>
                  <Button className="mt-4" variant="outline">
                    <Plus size={16} className="mr-2" />
                    {language === 'ru' ? 'Создать базу' : 'Create Knowledge Base'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Terminal Tab */}
        <TabsContent value="terminal" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Terminal size={20} />
                  {t('terminal')}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">{t('terminalMode')}:</Label>
                  <Select value={terminalMode} onValueChange={(value: any) => setTerminalMode(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">{t('automatic')}</SelectItem>
                      <SelectItem value="confirm">{t('confirmation')}</SelectItem>
                      <SelectItem value="readonly">{t('readonly')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Terminal History */}
                <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
                  {(terminalHistory || []).map(entry => (
                    <div key={entry.id} className="mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400">[{new Date(entry.timestamp).toLocaleTimeString()}]</span>
                        {entry.agent && <span className="text-yellow-400">({entry.agent})</span>}
                        <span className={entry.status === 'success' ? 'text-green-400' : entry.status === 'error' ? 'text-red-400' : 'text-yellow-400'}>
                          ${entry.command}
                        </span>
                      </div>
                      {entry.output && (
                        <div className="ml-4 text-gray-300 whitespace-pre-wrap">
                          {entry.output}
                        </div>
                      )}
                    </div>
                  ))}
                  {(terminalHistory || []).length === 0 && (
                    <div className="text-gray-500">
                      {language === 'ru' ? 'История команд пуста' : 'Command history is empty'}
                    </div>
                  )}
                </div>
                
                {/* Command Input */}
                <div className="flex items-center gap-2">
                  <Input
                    value={currentCommand}
                    onChange={(e) => setCurrentCommand(e.target.value)}
                    placeholder={language === 'ru' ? 'Введите команду...' : 'Enter command...'}
                    disabled={terminalMode === 'readonly'}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && currentCommand.trim()) {
                        executeCommand(currentCommand);
                        setCurrentCommand('');
                      }
                    }}
                    className="font-mono"
                  />
                  <Button
                    onClick={() => {
                      if (currentCommand.trim()) {
                        executeCommand(currentCommand);
                        setCurrentCommand('');
                      }
                    }}
                    disabled={!currentCommand.trim() || terminalMode === 'readonly'}
                  >
                    <Play size={16} className="mr-2" />
                    {t('execute')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setTerminalHistory([])}
                  >
                    <Trash size={16} className="mr-2" />
                    {t('clear')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button
              onClick={() => generateAnalyticsReport('debate')}
              className="h-20 flex flex-col items-center justify-center"
              variant="outline"
            >
              <Users size={24} className="mb-2" />
              {t('debateAnalysis')}
            </Button>
            
            <Button
              onClick={() => generateAnalyticsReport('agent_performance')}
              className="h-20 flex flex-col items-center justify-center"
              variant="outline"
            >
              <Robot size={24} className="mb-2" />
              {t('agentTraining')}
            </Button>
            
            <Button
              onClick={() => generateAnalyticsReport('trends')}
              className="h-20 flex flex-col items-center justify-center"
              variant="outline"
            >
              <ChartLine size={24} className="mb-2" />
              {t('trendsReports')}
            </Button>
            
            <Button
              onClick={() => generateAnalyticsReport('training')}
              className="h-20 flex flex-col items-center justify-center"
              variant="outline"
            >
              <Brain size={24} className="mb-2" />
              Training Data
            </Button>
          </div>
          
          {/* Analytics Reports */}
          <div className="space-y-4">
            <h4 className="font-medium">Recent Reports</h4>
            {(analyticsReports || []).length > 0 ? (
              (analyticsReports || []).slice(-5).reverse().map(report => (
                <Card key={report.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">{report.title}</h5>
                        <p className="text-sm text-muted-foreground">
                          {new Date(report.generatedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{report.type}</Badge>
                        <Button size="sm" variant="outline">
                          <Eye size={16} className="mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download size={16} className="mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                    {report.insights.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-1">Key Insights:</p>
                        <ul className="text-sm text-muted-foreground">
                          {report.insights.slice(0, 2).map((insight, i) => (
                            <li key={i}>• {insight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ChartLine size={48} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    {language === 'ru' 
                      ? 'Отчёты аналитики не созданы' 
                      : 'No analytics reports generated yet'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Utilities Tab */}
        <TabsContent value="utilities" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* File Upload Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload size={20} />
                  {t('fileUploadSettings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">{t('maxFileSize')}</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={settings?.utilities?.maxFileSize || 10}
                    onChange={(e) => {
                      const utilities = { ...settings?.utilities, maxFileSize: parseInt(e.target.value) };
                      updateSettings('utilities', utilities);
                    }}
                    min={1}
                    max={100}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="allowedFileTypes">{t('allowedFileTypes')}</Label>
                  <Input
                    id="allowedFileTypes"
                    value={settings?.utilities?.allowedFileTypes?.join(', ') || 'pdf, doc, txt, md, json, csv'}
                    onChange={(e) => {
                      const utilities = { ...settings?.utilities, allowedFileTypes: e.target.value.split(', ').map(t => t.trim()) };
                      updateSettings('utilities', utilities);
                    }}
                    placeholder="pdf, doc, txt, md, json, csv"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('autoAnalyzeFiles')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ru' 
                        ? 'Автоматически анализировать загруженные файлы' 
                        : 'Automatically analyze uploaded files'}
                    </p>
                  </div>
                  <Switch
                    checked={settings?.utilities?.autoAnalyzeFiles ?? true}
                    onCheckedChange={(checked) => {
                      const utilities = { ...settings?.utilities, autoAnalyzeFiles: checked };
                      updateSettings('utilities', utilities);
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Search & Filter Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye size={20} />
                  {t('searchSettings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('enableSemanticSearch')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ru' 
                        ? 'Включить семантический поиск для улучшения результатов' 
                        : 'Enable semantic search for better results'}
                    </p>
                  </div>
                  <Switch
                    checked={settings?.utilities?.enableSemanticSearch ?? true}
                    onCheckedChange={(checked) => {
                      const utilities = { ...settings?.utilities, enableSemanticSearch: checked };
                      updateSettings('utilities', utilities);
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxSearchResults">{t('maxSearchResults')}</Label>
                  <Input
                    id="maxSearchResults"
                    type="number"
                    value={settings?.utilities?.maxSearchResults || 50}
                    onChange={(e) => {
                      const utilities = { ...settings?.utilities, maxSearchResults: parseInt(e.target.value) };
                      updateSettings('utilities', utilities);
                    }}
                    min={10}
                    max={500}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Robot size={20} />
                  {t('notificationSettings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('enablePushNotifications')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ru' 
                        ? 'Включить push уведомления в браузере' 
                        : 'Enable browser push notifications'}
                    </p>
                  </div>
                  <Switch
                    checked={settings?.utilities?.enablePushNotifications ?? false}
                    onCheckedChange={(checked) => {
                      const utilities = { ...settings?.utilities, enablePushNotifications: checked };
                      updateSettings('utilities', utilities);
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('enableEmailNotifications')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ru' 
                        ? 'Включить email уведомления' 
                        : 'Enable email notifications'}
                    </p>
                  </div>
                  <Switch
                    checked={settings?.utilities?.enableEmailNotifications ?? false}
                    onCheckedChange={(checked) => {
                      const utilities = { ...settings?.utilities, enableEmailNotifications: checked };
                      updateSettings('utilities', utilities);
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notificationFrequency">{t('notificationFrequency')}</Label>
                  <Select 
                    value={settings?.utilities?.notificationFrequency || 'immediate'} 
                    onValueChange={(value) => {
                      const utilities = { ...settings?.utilities, notificationFrequency: value as 'immediate' | 'hourly' | 'daily' };
                      updateSettings('utilities', utilities);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">{t('immediateNotifications')}</SelectItem>
                      <SelectItem value="hourly">{t('hourlyNotifications')}</SelectItem>
                      <SelectItem value="daily">{t('dailyNotifications')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Navigation & Guide Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain size={20} />
                  {t('navigationSettings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('showHelpTips')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ru' 
                        ? 'Показывать контекстные подсказки и советы' 
                        : 'Show contextual help tips and guidance'}
                    </p>
                  </div>
                  <Switch
                    checked={settings?.utilities?.showHelpTips ?? true}
                    onCheckedChange={(checked) => {
                      const utilities = { ...settings?.utilities, showHelpTips: checked };
                      updateSettings('utilities', utilities);
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('enableGuidedTour')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ru' 
                        ? 'Включить интерактивный тур для новых пользователей' 
                        : 'Enable interactive tour for new users'}
                    </p>
                  </div>
                  <Switch
                    checked={settings?.utilities?.enableGuidedTour ?? true}
                    onCheckedChange={(checked) => {
                      const utilities = { ...settings?.utilities, enableGuidedTour: checked };
                      updateSettings('utilities', utilities);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield size={20} />
                  {t('security')}
                </CardTitle>
                <CardDescription>Basic security and access control settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('allowSystemCommands')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ru' 
                        ? 'Разрешить выполнение системных команд' 
                        : 'Allow execution of system commands'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.allowSystemCommands}
                    onCheckedChange={(checked) => updateSettings('security', {
                      ...settings.security,
                      allowSystemCommands: checked
                    })}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('allowAgentCreation')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ru' 
                        ? 'Разрешить агентам создавать других агентов' 
                        : 'Allow agents to create other agents'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.allowAgentCreation}
                    onCheckedChange={(checked) => updateSettings('security', {
                      ...settings.security,
                      allowAgentCreation: checked
                    })}
                  />
                </div>
                
                <Separator />
                
                <div>
                  <Label>IP Whitelist</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    {language === 'ru' 
                      ? 'Разрешённые IP адреса (по одному на строку)' 
                      : 'Allowed IP addresses (one per line)'}
                  </p>
                  <Textarea
                    value={settings.security.ipWhitelist.join('\n')}
                    onChange={(e) => updateSettings('security', {
                      ...settings.security,
                      ipWhitelist: e.target.value.split('\n').filter(ip => ip.trim())
                    })}
                    placeholder="192.168.1.1\n10.0.0.1"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Authentication System Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={20} />
                  Authentication System
                </CardTitle>
                <CardDescription>User authentication and session management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('authenticationEnabled')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ru' 
                        ? 'Включить систему аутентификации' 
                        : 'Enable authentication system'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.authenticationEnabled ?? true}
                    onCheckedChange={(checked) => updateSettings('security', {
                      ...settings.security,
                      authenticationEnabled: checked
                    })}
                  />
                </div>
                
                <Separator />
                
                <div>
                  <Label>{t('sessionTimeout')}</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    {language === 'ru' 
                      ? 'Время жизни сессии в минутах' 
                      : 'Session lifetime in minutes'}
                  </p>
                  <Input
                    type="number"
                    value={settings.security.sessionTimeout ?? 1440}
                    onChange={(e) => updateSettings('security', {
                      ...settings.security,
                      sessionTimeout: parseInt(e.target.value) || 1440
                    })}
                    min={5}
                    max={10080}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('twoFactorRequired')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ru' 
                        ? 'Обязательная двухфакторная аутентификация' 
                        : 'Require two-factor authentication'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.twoFactorRequired ?? false}
                    onCheckedChange={(checked) => updateSettings('security', {
                      ...settings.security,
                      twoFactorRequired: checked
                    })}
                  />
                </div>
                
                <div>
                  <Label>{t('maxConcurrentSessions')}</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    {language === 'ru' 
                      ? 'Максимальное количество одновременных сессий' 
                      : 'Maximum number of concurrent sessions'}
                  </p>
                  <Input
                    type="number"
                    value={settings.security.maxConcurrentSessions ?? 3}
                    onChange={(e) => updateSettings('security', {
                      ...settings.security,
                      maxConcurrentSessions: parseInt(e.target.value) || 3
                    })}
                    min={1}
                    max={10}
                  />
                </div>
              </CardContent>
            </Card>

            {/* API Key Management Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye size={20} />
                  API Key Management
                </CardTitle>
                <CardDescription>Secure storage and validation of API keys</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('encryptionEnabled')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ru' 
                        ? 'Шифровать API ключи при хранении' 
                        : 'Encrypt API keys when storing'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.encryptionEnabled ?? true}
                    onCheckedChange={(checked) => updateSettings('security', {
                      ...settings.security,
                      encryptionEnabled: checked
                    })}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('autoKeyValidation')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ru' 
                        ? 'Автоматически проверять валидность ключей' 
                        : 'Automatically validate key validity'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.autoKeyValidation ?? true}
                    onCheckedChange={(checked) => updateSettings('security', {
                      ...settings.security,
                      autoKeyValidation: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('keyRotationEnabled')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ru' 
                        ? 'Включить автоматическую ротацию ключей' 
                        : 'Enable automatic key rotation'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.keyRotationEnabled ?? false}
                    onCheckedChange={(checked) => updateSettings('security', {
                      ...settings.security,
                      keyRotationEnabled: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('secureKeyStorage')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ru' 
                        ? 'Использовать безопасное хранилище ключей' 
                        : 'Use secure key storage backend'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.secureKeyStorage ?? true}
                    onCheckedChange={(checked) => updateSettings('security', {
                      ...settings.security,
                      secureKeyStorage: checked
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Status Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield size={20} />
                  Security Status
                </CardTitle>
                <CardDescription>Current security configuration overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Authentication</span>
                  <Badge variant={settings.security.authenticationEnabled ? 'default' : 'destructive'}>
                    {settings.security.authenticationEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Encryption</span>
                  <Badge variant={settings.security.encryptionEnabled ? 'default' : 'destructive'}>
                    {settings.security.encryptionEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">2FA Required</span>
                  <Badge variant={settings.security.twoFactorRequired ? 'default' : 'secondary'}>
                    {settings.security.twoFactorRequired ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">System Commands</span>
                  <Badge variant={settings.security.allowSystemCommands ? 'destructive' : 'default'}>
                    {settings.security.allowSystemCommands ? 'Allowed' : 'Blocked'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Session Timeout</span>
                  <Badge variant="outline">
                    {Math.floor((settings.security.sessionTimeout ?? 1440) / 60)}h {(settings.security.sessionTimeout ?? 1440) % 60}m
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="text-xs text-muted-foreground">
                  {language === 'ru' 
                    ? 'Настройки безопасности применяются немедленно' 
                    : 'Security settings take effect immediately'}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline">
          <Archive size={16} className="mr-2" />
          {t('export')} Configuration
        </Button>
        
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <ArrowRight size={16} className="mr-2 rotate-180" />
            {t('reset')}
          </Button>
          <Button onClick={() => toast.success(t('save') + 'd')}>
            <FloppyDisk size={16} className="mr-2" />
            {t('save')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GlobalProjectSettings;