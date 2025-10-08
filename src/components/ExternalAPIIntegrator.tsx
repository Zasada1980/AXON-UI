import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Plugs,
  CloudArrowUp,
  Key,
  CheckCircle,
  Warning,
  X,
  Play,
  Pause,
  Stop,
  Gear,
  Eye,
  EyeSlash,
  Repeat,
  Globe,
  Database,
  FileCode,
  Shield,
  Timer,
  Graph,
  ListChecks
} from '@phosphor-icons/react';

interface APIProvider {
  id: string;
  name: string;
  type: 'llm' | 'storage' | 'analytics' | 'notification' | 'search' | 'custom';
  baseUrl: string;
  authType: 'api_key' | 'oauth' | 'bearer' | 'basic' | 'custom';
  documentation: string;
  rateLimit: {
    requests: number;
    period: 'second' | 'minute' | 'hour' | 'day';
  };
  supportedMethods: string[];
  defaultHeaders: Record<string, string>;
  isActive: boolean;
}

interface APIConnection {
  id: string;
  providerId: string;
  name: string;
  description: string;
  config: {
    apiKey?: string;
    endpoint?: string;
    customHeaders?: Record<string, string>;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  authentication: {
    type: string;
    credentials: Record<string, string>;
    tokenExpiry?: string;
    refreshToken?: string;
  };
  usage: {
    requestCount: number;
    lastRequest: string;
    quotaUsed: number;
    quotaLimit: number;
    errors: number;
  };
  status: 'connected' | 'disconnected' | 'error' | 'rate_limited';
  createdAt: string;
  lastTested: string;
  isActive: boolean;
}

interface APIRequest {
  id: string;
  connectionId: string;
  method: string;
  endpoint: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: string;
  response?: {
    status: number;
    headers: Record<string, string>;
    body: any;
    duration: number;
  };
  error?: string;
  retryCount: number;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  headers: Record<string, string>;
  status: 'active' | 'inactive' | 'failed';
  lastTriggered?: string;
  triggerCount: number;
  createdAt: string;
}

interface ExternalAPIIntegratorProps {
  language: string;
  projectId: string;
  onConnectionEstablished: (connection: APIConnection) => void;
  onRequestCompleted: (request: APIRequest) => void;
  onWebhookTriggered: (webhook: Webhook) => void;
}

const ExternalAPIIntegrator: React.FC<ExternalAPIIntegratorProps> = ({
  language,
  projectId,
  onConnectionEstablished,
  onRequestCompleted,
  onWebhookTriggered
}) => {
  const [providers, setProviders] = useKV<APIProvider[]>('api-providers', []);
  const [connections, setConnections] = useKV<APIConnection[]>(`api-connections-${projectId}`, []);
  const [requests, setRequests] = useKV<APIRequest[]>(`api-requests-${projectId}`, []);
  const [webhooks, setWebhooks] = useKV<Webhook[]>(`webhooks-${projectId}`, []);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [newConnection, setNewConnection] = useState<Partial<APIConnection>>({
    name: '',
    description: '',
    config: {
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000
    },
    authentication: {
      type: 'api_key',
      credentials: {}
    },
    isActive: true
  });
  const [newRequest, setNewRequest] = useState<Partial<APIRequest>>({
    method: 'GET',
    endpoint: '',
    headers: {},
    body: undefined
  });
  const [newWebhook, setNewWebhook] = useState<Partial<Webhook>>({
    name: '',
    url: '',
    secret: '',
    events: [],
    headers: {},
    status: 'active'
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      externalAPIIntegrator: { en: 'External API Integrator', ru: 'Интегратор Внешних API' },
      apiProviders: { en: 'API Providers', ru: 'Провайдеры API' },
      connections: { en: 'Connections', ru: 'Подключения' },
      requestHistory: { en: 'Request History', ru: 'История Запросов' },
      webhooks: { en: 'Webhooks', ru: 'Веб-хуки' },
      addProvider: { en: 'Add Provider', ru: 'Добавить Провайдера' },
      newConnection: { en: 'New Connection', ru: 'Новое Подключение' },
      testConnection: { en: 'Test Connection', ru: 'Тестировать Подключение' },
      makeRequest: { en: 'Make Request', ru: 'Выполнить Запрос' },
      createWebhook: { en: 'Create Webhook', ru: 'Создать Веб-хук' },
      connectionName: { en: 'Connection Name', ru: 'Название Подключения' },
      description: { en: 'Description', ru: 'Описание' },
      apiKey: { en: 'API Key', ru: 'API Ключ' },
      endpoint: { en: 'Endpoint', ru: 'Конечная Точка' },
      timeout: { en: 'Timeout (ms)', ru: 'Таймаут (мс)' },
      retryAttempts: { en: 'Retry Attempts', ru: 'Попытки Повтора' },
      retryDelay: { en: 'Retry Delay (ms)', ru: 'Задержка Повтора (мс)' },
      authType: { en: 'Authentication Type', ru: 'Тип Аутентификации' },
      customHeaders: { en: 'Custom Headers', ru: 'Пользовательские Заголовки' },
      method: { en: 'HTTP Method', ru: 'HTTP Метод' },
      requestBody: { en: 'Request Body', ru: 'Тело Запроса' },
      response: { en: 'Response', ru: 'Ответ' },
      webhookName: { en: 'Webhook Name', ru: 'Название Веб-хука' },
      webhookUrl: { en: 'Webhook URL', ru: 'URL Веб-хука' },
      secret: { en: 'Secret', ru: 'Секрет' },
      events: { en: 'Events', ru: 'События' },
      status: { en: 'Status', ru: 'Статус' },
      connected: { en: 'Connected', ru: 'Подключено' },
      disconnected: { en: 'Disconnected', ru: 'Отключено' },
      error: { en: 'Error', ru: 'Ошибка' },
      rate_limited: { en: 'Rate Limited', ru: 'Ограничение Скорости' },
      active: { en: 'Active', ru: 'Активен' },
      inactive: { en: 'Inactive', ru: 'Неактивен' },
      failed: { en: 'Failed', ru: 'Ошибка' },
      requestCount: { en: 'Request Count', ru: 'Количество Запросов' },
      lastRequest: { en: 'Last Request', ru: 'Последний Запрос' },
      quotaUsed: { en: 'Quota Used', ru: 'Использовано Квоты' },
      errors: { en: 'Errors', ru: 'Ошибки' },
      save: { en: 'Save', ru: 'Сохранить' },
      cancel: { en: 'Cancel', ru: 'Отмена' },
      test: { en: 'Test', ru: 'Тест' },
      send: { en: 'Send', ru: 'Отправить' },
      create: { en: 'Create', ru: 'Создать' },
      edit: { en: 'Edit', ru: 'Редактировать' },
      delete: { en: 'Delete', ru: 'Удалить' },
      showSecrets: { en: 'Show Secrets', ru: 'Показать Секреты' },
      hideSecrets: { en: 'Hide Secrets', ru: 'Скрыть Секреты' },
      duration: { en: 'Duration', ru: 'Длительность' }
    };
    return translations[key]?.[language] || key;
  };

  // Initialize default providers
  useEffect(() => {
    if (!providers || providers.length === 0) {
      const defaultProviders: APIProvider[] = [
        {
          id: 'openai',
          name: 'OpenAI',
          type: 'llm',
          baseUrl: 'https://api.openai.com/v1',
          authType: 'bearer',
          documentation: 'https://platform.openai.com/docs/api-reference',
          rateLimit: { requests: 3500, period: 'minute' },
          supportedMethods: ['GET', 'POST'],
          defaultHeaders: { 'Content-Type': 'application/json' },
          isActive: true
        },
        {
          id: 'anthropic',
          name: 'Anthropic',
          type: 'llm',
          baseUrl: 'https://api.anthropic.com',
          authType: 'api_key',
          documentation: 'https://docs.anthropic.com/claude/reference',
          rateLimit: { requests: 1000, period: 'minute' },
          supportedMethods: ['POST'],
          defaultHeaders: { 'Content-Type': 'application/json' },
          isActive: true
        },
        {
          id: 'github',
          name: 'GitHub API',
          type: 'storage',
          baseUrl: 'https://api.github.com',
          authType: 'bearer',
          documentation: 'https://docs.github.com/en/rest',
          rateLimit: { requests: 5000, period: 'hour' },
          supportedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
          defaultHeaders: { 'Accept': 'application/vnd.github.v3+json' },
          isActive: true
        },
        {
          id: 'slack',
          name: 'Slack',
          type: 'notification',
          baseUrl: 'https://slack.com/api',
          authType: 'bearer',
          documentation: 'https://api.slack.com/',
          rateLimit: { requests: 1, period: 'second' },
          supportedMethods: ['GET', 'POST'],
          defaultHeaders: { 'Content-Type': 'application/json' },
          isActive: true
        }
      ];
      setProviders(defaultProviders);
    }
  }, [providers, setProviders]);

  const testAPIConnection = async (connectionId: string) => {
    const connection = (connections || []).find(c => c.id === connectionId);
    if (!connection) return;

    const provider = (providers || []).find(p => p.id === connection.providerId);
    if (!provider) return;

    setIsTestingConnection(true);

    try {
      // Simulate API test call
      const testEndpoint = provider.baseUrl + '/health';
      const headers = {
        ...provider.defaultHeaders,
        ...connection.config.customHeaders
      };

      if (connection.authentication.type === 'api_key' && connection.config.apiKey) {
        headers['Authorization'] = `Bearer ${connection.config.apiKey}`;
      }

      // Simulate HTTP request
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update connection status
      setConnections(current => 
        (current || []).map(c => 
          c.id === connectionId 
            ? { 
                ...c, 
                status: 'connected', 
                lastTested: new Date().toISOString(),
                usage: {
                  ...c.usage,
                  requestCount: c.usage.requestCount + 1,
                  lastRequest: new Date().toISOString()
                }
              }
            : c
        )
      );

      toast.success(language === 'ru' ? 'Подключение успешно' : 'Connection successful');

    } catch (error) {
      setConnections(current => 
        (current || []).map(c => 
          c.id === connectionId 
            ? { ...c, status: 'error', lastTested: new Date().toISOString() }
            : c
        )
      );
      toast.error(language === 'ru' ? 'Ошибка подключения' : 'Connection failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const saveConnection = () => {
    if (!newConnection.name?.trim() || !selectedProvider) {
      toast.error(language === 'ru' ? 'Заполните обязательные поля' : 'Fill required fields');
      return;
    }

    const connection: APIConnection = {
      id: `conn-${Date.now()}`,
      providerId: selectedProvider,
      name: newConnection.name!,
      description: newConnection.description || '',
      config: newConnection.config!,
      authentication: newConnection.authentication!,
      usage: {
        requestCount: 0,
        lastRequest: '',
        quotaUsed: 0,
        quotaLimit: 0,
        errors: 0
      },
      status: 'disconnected',
      createdAt: new Date().toISOString(),
      lastTested: '',
      isActive: newConnection.isActive!
    };

    setConnections(current => [...(current || []), connection]);
    onConnectionEstablished(connection);
    setShowConnectionDialog(false);
    setNewConnection({
      name: '',
      description: '',
      config: { timeout: 30000, retryAttempts: 3, retryDelay: 1000 },
      authentication: { type: 'api_key', credentials: {} },
      isActive: true
    });
    setSelectedProvider(null);
    toast.success(language === 'ru' ? 'Подключение сохранено' : 'Connection saved');
  };

  const executeAPIRequest = async () => {
    if (!newRequest.method || !newRequest.endpoint) {
      toast.error(language === 'ru' ? 'Заполните метод и URL' : 'Fill method and endpoint');
      return;
    }

    const requestId = `req-${Date.now()}`;
    const request: APIRequest = {
      id: requestId,
      connectionId: 'manual',
      method: newRequest.method!,
      endpoint: newRequest.endpoint!,
      headers: newRequest.headers || {},
      body: newRequest.body,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate response
      const response = {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: { success: true, data: 'Simulated response' },
        duration: 1000
      };

      const completedRequest = { ...request, response };
      setRequests(current => [completedRequest, ...(current || [])]);
      onRequestCompleted(completedRequest);
      toast.success(language === 'ru' ? 'Запрос выполнен' : 'Request completed');

    } catch (error) {
      const failedRequest = { ...request, error: 'Request failed' };
      setRequests(current => [failedRequest, ...(current || [])]);
      toast.error(language === 'ru' ? 'Ошибка запроса' : 'Request failed');
    }

    setShowRequestDialog(false);
    setNewRequest({
      method: 'GET',
      endpoint: '',
      headers: {},
      body: undefined
    });
  };

  const createWebhook = () => {
    if (!newWebhook.name?.trim() || !newWebhook.url?.trim()) {
      toast.error(language === 'ru' ? 'Заполните обязательные поля' : 'Fill required fields');
      return;
    }

    const webhook: Webhook = {
      id: `webhook-${Date.now()}`,
      name: newWebhook.name!,
      url: newWebhook.url!,
      secret: newWebhook.secret || '',
      events: newWebhook.events || [],
      headers: newWebhook.headers || {},
      status: newWebhook.status!,
      triggerCount: 0,
      createdAt: new Date().toISOString()
    };

    setWebhooks(current => [...(current || []), webhook]);
    setShowWebhookDialog(false);
    setNewWebhook({
      name: '',
      url: '',
      secret: '',
      events: [],
      headers: {},
      status: 'active'
    });
    toast.success(language === 'ru' ? 'Веб-хук создан' : 'Webhook created');
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plugs size={24} className="text-primary" />
            {t('externalAPIIntegrator')}
          </CardTitle>
          <CardDescription>
            {language === 'ru' 
              ? 'Управление внешними API подключениями и интеграциями'
              : 'Manage external API connections and integrations'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <Dialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plugs size={16} className="mr-2" />
                  {t('newConnection')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('newConnection')}</DialogTitle>
                  <DialogDescription>
                    {language === 'ru' 
                      ? 'Создайте новое подключение к внешнему API'
                      : 'Create a new external API connection'
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Provider Selection */}
                  <div>
                    <Label>API Provider</Label>
                    <Select value={selectedProvider || ''} onValueChange={setSelectedProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select API provider..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(providers || []).map(provider => (
                          <SelectItem key={provider.id} value={provider.id}>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{provider.type}</Badge>
                              {provider.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Connection Details */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>{t('connectionName')}</Label>
                      <Input
                        value={newConnection.name || ''}
                        onChange={(e) => setNewConnection(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter connection name..."
                      />
                    </div>
                    <div>
                      <Label>{t('description')}</Label>
                      <Input
                        value={newConnection.description || ''}
                        onChange={(e) => setNewConnection(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Optional description..."
                      />
                    </div>
                  </div>

                  {/* Authentication */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Authentication</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>{t('authType')}</Label>
                        <Select 
                          value={newConnection.authentication?.type} 
                          onValueChange={(value) => setNewConnection(prev => ({
                            ...prev,
                            authentication: { ...prev.authentication!, type: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="api_key">API Key</SelectItem>
                            <SelectItem value="bearer">Bearer Token</SelectItem>
                            <SelectItem value="basic">Basic Auth</SelectItem>
                            <SelectItem value="oauth">OAuth 2.0</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{t('apiKey')}</Label>
                        <div className="relative">
                          <Input
                            type={showSecrets ? 'text' : 'password'}
                            value={newConnection.config?.apiKey || ''}
                            onChange={(e) => setNewConnection(prev => ({
                              ...prev,
                              config: { ...prev.config!, apiKey: e.target.value }
                            }))}
                            placeholder="Enter API key..."
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-8 w-8 p-0"
                            onClick={() => setShowSecrets(!showSecrets)}
                          >
                            {showSecrets ? <EyeSlash size={16} /> : <Eye size={16} />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Configuration */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Configuration</h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label>{t('timeout')}</Label>
                        <Input
                          type="number"
                          value={newConnection.config?.timeout}
                          onChange={(e) => setNewConnection(prev => ({
                            ...prev,
                            config: { ...prev.config!, timeout: parseInt(e.target.value) }
                          }))}
                        />
                      </div>
                      <div>
                        <Label>{t('retryAttempts')}</Label>
                        <Input
                          type="number"
                          value={newConnection.config?.retryAttempts}
                          onChange={(e) => setNewConnection(prev => ({
                            ...prev,
                            config: { ...prev.config!, retryAttempts: parseInt(e.target.value) }
                          }))}
                        />
                      </div>
                      <div>
                        <Label>{t('retryDelay')}</Label>
                        <Input
                          type="number"
                          value={newConnection.config?.retryDelay}
                          onChange={(e) => setNewConnection(prev => ({
                            ...prev,
                            config: { ...prev.config!, retryDelay: parseInt(e.target.value) }
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowConnectionDialog(false)}>
                      {t('cancel')}
                    </Button>
                    <Button onClick={saveConnection}>
                      {t('save')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <CloudArrowUp size={16} className="mr-2" />
                  {t('makeRequest')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('makeRequest')}</DialogTitle>
                  <DialogDescription>
                    {language === 'ru' 
                      ? 'Выполните HTTP запрос к внешнему API'
                      : 'Execute HTTP request to external API'
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label>{t('method')}</Label>
                      <Select 
                        value={newRequest.method} 
                        onValueChange={(value) => setNewRequest(prev => ({ ...prev, method: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label>{t('endpoint')}</Label>
                      <Input
                        value={newRequest.endpoint || ''}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, endpoint: e.target.value }))}
                        placeholder="https://api.example.com/endpoint"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>{t('customHeaders')}</Label>
                    <Textarea
                      value={JSON.stringify(newRequest.headers, null, 2)}
                      onChange={(e) => {
                        try {
                          const headers = JSON.parse(e.target.value);
                          setNewRequest(prev => ({ ...prev, headers }));
                        } catch (error) {
                          // Invalid JSON, ignore
                        }
                      }}
                      placeholder='{"Content-Type": "application/json"}'
                      rows={3}
                    />
                  </div>

                  {['POST', 'PUT', 'PATCH'].includes(newRequest.method || '') && (
                    <div>
                      <Label>{t('requestBody')}</Label>
                      <Textarea
                        value={typeof newRequest.body === 'string' ? newRequest.body : JSON.stringify(newRequest.body, null, 2)}
                        onChange={(e) => {
                          try {
                            const body = JSON.parse(e.target.value);
                            setNewRequest(prev => ({ ...prev, body }));
                          } catch (error) {
                            setNewRequest(prev => ({ ...prev, body: e.target.value }));
                          }
                        }}
                        placeholder='{"key": "value"}'
                        rows={4}
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
                      {t('cancel')}
                    </Button>
                    <Button onClick={executeAPIRequest}>
                      {t('send')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Globe size={16} className="mr-2" />
                  {t('createWebhook')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('createWebhook')}</DialogTitle>
                  <DialogDescription>
                    {language === 'ru' 
                      ? 'Создайте веб-хук для получения событий'
                      : 'Create webhook to receive events'
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>{t('webhookName')}</Label>
                    <Input
                      value={newWebhook.name || ''}
                      onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter webhook name..."
                    />
                  </div>
                  <div>
                    <Label>{t('webhookUrl')}</Label>
                    <Input
                      value={newWebhook.url || ''}
                      onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://your-app.com/webhook"
                    />
                  </div>
                  <div>
                    <Label>{t('secret')}</Label>
                    <Input
                      type="password"
                      value={newWebhook.secret || ''}
                      onChange={(e) => setNewWebhook(prev => ({ ...prev, secret: e.target.value }))}
                      placeholder="Optional secret for verification"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowWebhookDialog(false)}>
                      {t('cancel')}
                    </Button>
                    <Button onClick={createWebhook}>
                      {t('create')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* API Connections */}
      {(connections || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database size={20} />
              {t('connections')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(connections || []).map((connection) => {
                const provider = (providers || []).find(p => p.id === connection.providerId);
                return (
                  <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{connection.name}</h4>
                        <Badge variant={
                          connection.status === 'connected' ? 'default' :
                          connection.status === 'error' ? 'destructive' :
                          connection.status === 'rate_limited' ? 'secondary' : 'outline'
                        }>
                          {t(connection.status)}
                        </Badge>
                        {provider && (
                          <Badge variant="outline">{provider.name}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{connection.description}</p>
                      <div className="grid gap-2 text-xs text-muted-foreground md:grid-cols-4">
                        <span>{t('requestCount')}: {connection.usage.requestCount}</span>
                        <span>{t('errors')}: {connection.usage.errors}</span>
                        <span>{connection.usage.lastRequest && `${t('lastRequest')}: ${new Date(connection.usage.lastRequest).toLocaleDateString()}`}</span>
                        <span>{connection.lastTested && `Tested: ${new Date(connection.lastTested).toLocaleDateString()}`}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testAPIConnection(connection.id)}
                        disabled={isTestingConnection}
                      >
                        {isTestingConnection ? (
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Shield size={14} />
                        )}
                        {t('test')}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Gear size={14} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request History */}
      {(requests || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks size={20} />
              {t('requestHistory')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {(requests || []).slice(0, 10).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{request.method}</Badge>
                        <span className="font-mono text-sm">{request.endpoint}</span>
                        {request.response && (
                          <Badge variant={request.response.status < 400 ? 'default' : 'destructive'}>
                            {request.response.status}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(request.timestamp).toLocaleString()}
                        {request.response && (
                          <span className="ml-4">{formatDuration(request.response.duration)}</span>
                        )}
                        {request.error && (
                          <span className="ml-4 text-destructive">{request.error}</span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Webhooks */}
      {(webhooks || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe size={20} />
              {t('webhooks')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(webhooks || []).map((webhook) => (
                <div key={webhook.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{webhook.name}</h4>
                      <Badge variant={
                        webhook.status === 'active' ? 'default' :
                        webhook.status === 'failed' ? 'destructive' : 'secondary'
                      }>
                        {t(webhook.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">{webhook.url}</p>
                    <div className="text-xs text-muted-foreground">
                      Triggers: {webhook.triggerCount}
                      {webhook.lastTriggered && (
                        <span className="ml-4">Last: {new Date(webhook.lastTriggered).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Gear size={14} />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Play size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExternalAPIIntegrator;