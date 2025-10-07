import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { apiKeyStorage, initializeEncryption } from '../utils/encryption';
import { validateApiKey, ValidationResult, getValidationStatusText, getValidationStatusColor } from '../utils/apiKeyValidation';
import {
  Key,
  Shield,
  Eye,
  EyeSlash,
  CheckCircle,
  Warning,
  X,
  Plus,
  CloudArrowUp,
  Robot,
  Brain,
  SecurityCamera,
  Clock,
  WifiSlash
} from '@phosphor-icons/react';

type Language = 'en' | 'ru';

interface APIProvider {
  id: string;
  name: string;
  icon: React.ReactElement;
  description: string;
  testEndpoint?: string;
  status: 'connected' | 'disconnected' | 'testing' | 'error';
  lastValidated?: string;
  validationResult?: ValidationResult;
  responseTime?: number;
}

interface Props {
  language: Language;
  projectId: string;
  onApiKeyUpdate?: (provider: string, isValid: boolean) => void;
}

const translations: Record<string, { en: string; ru: string }> = {
  secureApiManagement: { en: 'Secure API Key Management', ru: 'Безопасное Управление API Ключами' },
  apiDescription: { 
    en: 'Manage your AI provider API keys with AES-256 encryption', 
    ru: 'Управляйте ключами AI провайдеров с шифрованием AES-256' 
  },
  provider: { en: 'Provider', ru: 'Провайдер' },
  apiKey: { en: 'API Key', ru: 'API Ключ' },
  enterApiKey: { en: 'Enter API key...', ru: 'Введите API ключ...' },
  saveKey: { en: 'Save Key', ru: 'Сохранить Ключ' },
  testConnection: { en: 'Test Connection', ru: 'Проверить Соединение' },
  removeKey: { en: 'Remove Key', ru: 'Удалить Ключ' },
  connected: { en: 'Connected', ru: 'Подключено' },
  disconnected: { en: 'Disconnected', ru: 'Отключено' },
  testing: { en: 'Testing...', ru: 'Тестирование...' },
  error: { en: 'Error', ru: 'Ошибка' },
  showKey: { en: 'Show Key', ru: 'Показать Ключ' },
  hideKey: { en: 'Hide Key', ru: 'Скрыть Ключ' },
  encryptionStatus: { en: 'Encryption Status', ru: 'Статус Шифрования' },
  encrypted: { en: 'Keys are encrypted with AES-256', ru: 'Ключи зашифрованы AES-256' },
  notEncrypted: { en: 'Encryption not available', ru: 'Шифрование недоступно' },
  lastValidated: { en: 'Last validated', ru: 'Последняя проверка' },
  never: { en: 'Never', ru: 'Никогда' },
  validationSuccess: { en: 'API key validated successfully', ru: 'API ключ успешно проверен' },
  validationFailed: { en: 'API key validation failed', ru: 'Проверка API ключа не удалась' },
  keyTooShort: { en: 'API key too short', ru: 'API ключ слишком короткий' },
  invalidFormat: { en: 'Invalid API key format', ru: 'Неверный формат API ключа' },
};

const SecureAPIKeyManager: React.FC<Props> = ({ language, projectId, onApiKeyUpdate }) => {
  const [providers, setProviders] = useState<APIProvider[]>([
    {
      id: 'openai',
      name: 'OpenAI',
      icon: <Brain size={20} />,
      description: 'GPT-4, GPT-3.5, DALL-E, Whisper',
      testEndpoint: 'https://api.openai.com/v1/models',
      status: 'disconnected'
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      icon: <Robot size={20} />,
      description: 'Claude 3, Claude 2',
      status: 'disconnected'
    },
    {
      id: 'google',
      name: 'Google AI',
      icon: <CloudArrowUp size={20} />,
      description: 'Gemini Pro, PaLM',
      status: 'disconnected'
    },
    {
      id: 'azure',
      name: 'Azure OpenAI',
      icon: <SecurityCamera size={20} />,
      description: 'Enterprise OpenAI API',
      status: 'disconnected'
    }
  ]);

  const [newApiKey, setNewApiKey] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [encryptionAvailable, setEncryptionAvailable] = useState(false);
  const [storedKeys, setStoredKeys] = useState<Record<string, string>>({});

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  // Initialize encryption and load existing keys
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        await initializeEncryption();
        setEncryptionAvailable(!!crypto.subtle);
        await loadExistingKeys();
      } catch (error) {
        console.error('Failed to initialize encryption:', error);
        setEncryptionAvailable(false);
      }
    };

    initializeSystem();
  }, []);

  // Load existing API keys
  const loadExistingKeys = async () => {
    const keys: Record<string, string> = {};
    const updatedProviders = [...providers];

    for (const provider of updatedProviders) {
      try {
        const apiKey = await apiKeyStorage.getApiKey(provider.id);
        if (apiKey) {
          keys[provider.id] = apiKey;
          provider.status = 'connected';
        }
      } catch (error) {
        console.error(`Failed to load key for ${provider.id}:`, error);
        provider.status = 'error';
      }
    }

    setStoredKeys(keys);
    setProviders(updatedProviders);
  };

  // Validate API key format
  const validateApiKeyFormat = (provider: string, key: string): string | null => {
    const trimmedKey = key.trim();
    
    if (trimmedKey.length < 10) {
      return t('keyTooShort');
    }

    // Basic format validation for each provider
    switch (provider) {
      case 'openai':
        if (!trimmedKey.startsWith('sk-')) {
          return t('invalidFormat');
        }
        break;
      case 'anthropic':
        if (!trimmedKey.startsWith('sk-ant-')) {
          return t('invalidFormat');
        }
        break;
      case 'google':
        // Google AI API keys typically don't have a specific prefix
        break;
      case 'azure':
        // Azure keys are typically 32-character hex strings
        if (trimmedKey.length !== 32) {
          return t('invalidFormat');
        }
        break;
    }

    return null;
  };

  // Test API key connection using real validation
  const testApiKeyConnection = async (provider: string, key: string): Promise<ValidationResult> => {
    try {
      const result = await validateApiKey(provider, key);
      return result;
    } catch (error) {
      console.error(`API test failed for ${provider}:`, error);
      return {
        isValid: false,
        provider,
        error: 'Network error'
      };
    }
  };

  // Save API key
  const saveApiKey = async () => {
    if (!selectedProvider || !newApiKey.trim()) {
      toast.error('Please select a provider and enter an API key');
      return;
    }

    // Validate format first
    const formatError = validateApiKeyFormat(selectedProvider, newApiKey);
    if (formatError) {
      toast.error(formatError);
      return;
    }

    // Update provider status to testing
    setProviders(current => 
      current.map(p => 
        p.id === selectedProvider 
          ? { ...p, status: 'testing' as const }
          : p
      )
    );

    try {
      // Test connection using real validation
      const validationResult = await testApiKeyConnection(selectedProvider, newApiKey);
      
      if (validationResult.isValid) {
        // Save encrypted key
        await apiKeyStorage.setApiKey(selectedProvider, newApiKey);
        
        // Update state
        setStoredKeys(current => ({ ...current, [selectedProvider]: newApiKey }));
        setProviders(current => 
          current.map(p => 
            p.id === selectedProvider 
              ? { 
                  ...p, 
                  status: 'connected' as const, 
                  lastValidated: new Date().toISOString(),
                  validationResult,
                  responseTime: validationResult.responseTime
                }
              : p
          )
        );

        toast.success(`${t('validationSuccess')} (${validationResult.responseTime}ms)`);
        onApiKeyUpdate?.(selectedProvider, true);
        
        // Clear form
        setNewApiKey('');
        setSelectedProvider('');
      } else {
        // Update provider status to error
        setProviders(current => 
          current.map(p => 
            p.id === selectedProvider 
              ? { 
                  ...p, 
                  status: 'error' as const,
                  validationResult,
                  responseTime: validationResult.responseTime
                }
              : p
          )
        );
        
        toast.error(`${t('validationFailed')}: ${validationResult.error}`);
        onApiKeyUpdate?.(selectedProvider, false);
      }
    } catch (error) {
      console.error('Failed to save API key:', error);
      setProviders(current => 
        current.map(p => 
          p.id === selectedProvider 
            ? { ...p, status: 'error' as const }
            : p
        )
      );
      toast.error('Failed to save API key');
    }
  };

  // Remove API key
  const removeApiKey = async (provider: string) => {
    try {
      apiKeyStorage.removeApiKey(provider);
      
      setStoredKeys(current => {
        const updated = { ...current };
        delete updated[provider];
        return updated;
      });
      
      setProviders(current => 
        current.map(p => 
          p.id === provider 
            ? { ...p, status: 'disconnected' as const, lastValidated: undefined }
            : p
        )
      );

      onApiKeyUpdate?.(provider, false);
    } catch (error) {
      console.error('Failed to remove API key:', error);
      toast.error('Failed to remove API key');
    }
  };

  // Toggle key visibility
  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(current => ({ ...current, [provider]: !current[provider] }));
  };

  // Mask API key for display
  const maskApiKey = (key: string): string => {
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'testing': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'connected': return 'default';
      case 'testing': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card className="module-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Shield size={24} className="text-module-primary" />
          <div>
            <CardTitle>{t('secureApiManagement')}</CardTitle>
            <CardDescription>{t('apiDescription')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Encryption Status */}
        <Alert>
          <Shield size={16} />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>{t('encryptionStatus')}</span>
              <Badge variant={encryptionAvailable ? 'default' : 'destructive'}>
                {encryptionAvailable ? t('encrypted') : t('notEncrypted')}
              </Badge>
            </div>
          </AlertDescription>
        </Alert>

        {/* Add New API Key */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Add New API Key</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="provider">{t('provider')}</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider..." />
                </SelectTrigger>
                <SelectContent>
                  {providers.map(provider => (
                    <SelectItem key={provider.id} value={provider.id}>
                      <div className="flex items-center gap-2">
                        {provider.icon}
                        {provider.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="apikey">{t('apiKey')}</Label>
              <Input
                id="apikey"
                type="password"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                placeholder={t('enterApiKey')}
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={saveApiKey}
                disabled={!selectedProvider || !newApiKey.trim()}
                className="w-full"
              >
                <Key size={16} className="mr-2" />
                {t('saveKey')}
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Existing API Keys */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configured Providers</h3>
          
          <div className="grid gap-4">
            {providers.map(provider => (
              <Card key={provider.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {provider.icon}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{provider.name}</h4>
                        <Badge variant={getStatusBadgeVariant(provider.status)}>
                          {provider.validationResult ? 
                            getValidationStatusText(provider.validationResult, language) :
                            t(provider.status)
                          }
                        </Badge>
                        {provider.responseTime && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock size={12} />
                            {provider.responseTime}ms
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{provider.description}</p>
                      {provider.lastValidated && (
                        <p className="text-xs text-muted-foreground">
                          {t('lastValidated')}: {new Date(provider.lastValidated).toLocaleString()}
                        </p>
                      )}
                      {provider.validationResult?.error && (
                        <p className="text-xs text-red-400">
                          Error: {provider.validationResult.error}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {storedKeys[provider.id] && (
                      <>
                        <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {showKeys[provider.id] 
                            ? storedKeys[provider.id] 
                            : maskApiKey(storedKeys[provider.id])
                          }
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleKeyVisibility(provider.id)}
                        >
                          {showKeys[provider.id] ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeApiKey(provider.id)}
                        >
                          <X size={16} />
                        </Button>
                      </>
                    )}
                    
                    {provider.status === 'testing' && (
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecureAPIKeyManager;