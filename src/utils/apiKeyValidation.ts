/**
 * API Key validation utilities for real-time connection testing
 * Supports OpenAI, Anthropic, Google AI, and Azure OpenAI
 */


// Provider configurations
interface ProviderConfig {
  name: string;
  testEndpoint: string;
  headers: (apiKey: string) => Record<string, string>;
  testPayload?: Record<string, any>;
  validateResponse: (response: Response, data: any) => boolean;
  formatError: (error: any) => string;
}

const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  openai: {
    name: 'OpenAI',
    testEndpoint: 'https://api.openai.com/v1/models',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    validateResponse: (response, data) => {
      return response.ok && data && data.data && Array.isArray(data.data);
    },
    formatError: (error) => {
      if (error.status === 401) return 'Invalid API key';
      if (error.status === 429) return 'Rate limit exceeded';
      if (error.status === 403) return 'Access forbidden';
      return `API error: ${error.status}`;
    }
  },
  
  anthropic: {
    name: 'Anthropic',
    testEndpoint: 'https://api.anthropic.com/v1/messages',
    headers: (apiKey) => ({
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    }),
    testPayload: {
      model: 'claude-3-haiku-20240307',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'Hi' }]
    },
    validateResponse: (response, data) => {
      return response.ok && data && (data.content || data.completion);
    },
    formatError: (error) => {
      if (error.status === 401) return 'Invalid API key';
      if (error.status === 429) return 'Rate limit exceeded';
      if (error.status === 400) return 'Bad request - check API format';
      return `API error: ${error.status}`;
    }
  },
  
  google: {
    name: 'Google AI',
    testEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    headers: (_apiKey) => ({
      'Content-Type': 'application/json'
    }),
    validateResponse: (response, _data) => {
      return response.ok && _data && _data.models && Array.isArray(_data.models);
    },
    formatError: (error) => {
      if (error.status === 403) return 'Invalid API key or access denied';
      if (error.status === 429) return 'Quota exceeded';
      return `API error: ${error.status}`;
    }
  },
  
  azure: {
    name: 'Azure OpenAI',
    testEndpoint: '', // Will be dynamic based on deployment
    headers: (apiKey) => ({
      'api-key': apiKey,
      'Content-Type': 'application/json'
    }),
    validateResponse: (response, data) => {
      // For Azure, we'll do a simpler validation since endpoints vary
      return response.ok;
    },
    formatError: (error) => {
      if (error.status === 401) return 'Invalid API key';
      if (error.status === 404) return 'Deployment not found';
      if (error.status === 429) return 'Rate limit exceeded';
      return `API error: ${error.status}`;
    }
  }
};

// API key validation result
export interface ValidationResult {
  isValid: boolean;
  provider: string;
  error?: string;
  responseTime?: number;
  details?: any;
}

/**
 * Validate API key for a specific provider
 */
export const validateApiKey = async (
  provider: string, 
  apiKey: string,
  customEndpoint?: string
): Promise<ValidationResult> => {
  const startTime = Date.now();
  
  try {
    const config = PROVIDER_CONFIGS[provider];
    if (!config) {
      return {
        isValid: false,
        provider,
        error: `Unsupported provider: ${provider}`
      };
    }

    // For development/demo mode, simulate validation
    if (process.env.NODE_ENV === 'development' || !navigator.onLine) {
      return simulateValidation(provider, apiKey);
    }

    // Special handling for Azure (requires custom endpoint)
    let endpoint = config.testEndpoint;
    if (provider === 'azure') {
      if (!customEndpoint) {
        return {
          isValid: false,
          provider,
          error: 'Azure requires custom endpoint URL'
        };
      }
      endpoint = `${customEndpoint}/openai/deployments?api-version=2023-05-15`;
    }

    // Add API key to endpoint for Google
    if (provider === 'google') {
      endpoint = `${endpoint}?key=${apiKey}`;
    }

    // Prepare request
    const requestOptions: RequestInit = {
      method: config.testPayload ? 'POST' : 'GET',
      headers: config.headers(apiKey),
      body: config.testPayload ? JSON.stringify(config.testPayload) : undefined
    };

    // Make API call with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(endpoint, {
      ...requestOptions,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;
    let data;
    
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    const isValid = config.validateResponse(response, data);

    if (isValid) {
      return {
        isValid: true,
        provider,
        responseTime,
        details: { status: response.status, dataReceived: !!data }
      };
    } else {
      return {
        isValid: false,
        provider,
        error: config.formatError({ status: response.status, data }),
        responseTime
      };
    }

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    if (error.name === 'AbortError') {
      return {
        isValid: false,
        provider,
        error: 'Request timeout (10s)',
        responseTime
      };
    }

    return {
      isValid: false,
      provider,
      error: error.message || 'Network error',
      responseTime
    };
  }
};

/**
 * Simulate API validation for development/offline mode
 */
const simulateValidation = async (provider: string, apiKey: string): Promise<ValidationResult> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

  // Basic format validation
  const config = PROVIDER_CONFIGS[provider];
  if (!config) {
    return {
      isValid: false,
      provider,
      error: 'Unknown provider'
    };
  }

  // Check key format
  let isValidFormat = false;
  switch (provider) {
    case 'openai':
      isValidFormat = apiKey.startsWith('sk-') && apiKey.length > 20;
      break;
    case 'anthropic':
      isValidFormat = apiKey.startsWith('sk-ant-') && apiKey.length > 30;
      break;
    case 'google':
      isValidFormat = apiKey.length > 30;
      break;
    case 'azure':
      isValidFormat = apiKey.length === 32;
      break;
  }

  if (!isValidFormat) {
    return {
      isValid: false,
      provider,
      error: 'Invalid API key format'
    };
  }

  // Simulate 85% success rate
  const isValid = Math.random() > 0.15;
  
  if (isValid) {
    return {
      isValid: true,
      provider,
      responseTime: 600 + Math.random() * 800,
      details: { mode: 'simulated', status: 200 }
    };
  } else {
    return {
      isValid: false,
      provider,
      error: 'Simulated API error',
      responseTime: 400 + Math.random() * 600
    };
  }
};

/**
 * Validate multiple API keys in parallel
 */
export const validateMultipleApiKeys = async (
  keys: Record<string, string>
): Promise<Record<string, ValidationResult>> => {
  const validationPromises = Object.entries(keys).map(async ([provider, apiKey]) => {
    const result = await validateApiKey(provider, apiKey);
    return [provider, result] as [string, ValidationResult];
  });

  const results = await Promise.all(validationPromises);
  return Object.fromEntries(results);
};

/**
 * Get validation status text for UI
 */
export const getValidationStatusText = (result: ValidationResult, language: 'en' | 'ru'): string => {
  const translations = {
    valid: { en: 'Valid', ru: 'Действителен' },
    invalid: { en: 'Invalid', ru: 'Недействителен' },
    testing: { en: 'Testing...', ru: 'Проверка...' },
    error: { en: 'Error', ru: 'Ошибка' },
    timeout: { en: 'Timeout', ru: 'Таймаут' },
    offline: { en: 'Offline', ru: 'Офлайн' }
  };

  if (result.isValid) {
    return translations.valid[language];
  }

  if (result.error?.includes('timeout')) {
    return translations.timeout[language];
  }

  if (result.error?.includes('Network')) {
    return translations.offline[language];
  }

  return translations.invalid[language];
};

/**
 * Get validation status color for UI
 */
export const getValidationStatusColor = (result: ValidationResult): string => {
  if (result.isValid) return 'text-green-500';
  if (result.error?.includes('timeout') || result.error?.includes('Network')) {
    return 'text-yellow-500';
  }
  return 'text-red-500';
};

/**
 * Initialize validation system
 */
export const initializeValidationSystem = () => {
  console.log('API Key validation system initialized');
  
  // Check if we're online
  if (!navigator.onLine) {
    console.warn('Application is offline - using simulated validation');
  }
  
  return true;
};