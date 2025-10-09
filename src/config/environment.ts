/**
 * Environment Configuration
 * Централизованная конфигурация переменных окружения
 * 
 * @module config/environment
 */

export const environment = {
  /** UI Configuration */
  ui: {
    /** Port for Vite dev server */
    port: Number(import.meta.env.UI_PORT) || 5000,
    /** Host for dev server */
    host: import.meta.env.HOST || 'localhost',
  },
  
  /** AXON Backend Configuration */
  axon: {
    /** Proxy target for AXON API (vite proxy) */
    proxyTarget: import.meta.env.VITE_AXON_PROXY_TARGET || '',
    /** Base URL for AXON API endpoints */
    baseUrl: import.meta.env.VITE_AXON_BASE_URL || '/api/axon',
    /** Full endpoint URL (computed) */
    get endpoint() {
      return this.proxyTarget || this.baseUrl;
    },
  },
  
  /** Environment flags */
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const;

export type Environment = typeof environment;

/**
 * Type-safe environment variable access
 * Usage: getEnv('VITE_AXON_BASE_URL', '/api/axon')
 */
export function getEnv(key: string, defaultValue: string = ''): string {
  return (import.meta.env[key] as string) || defaultValue;
}

/**
 * Validate required environment variables
 * Call this in main.tsx to ensure all required vars are set
 */
export function validateEnvironment(): boolean {
  const required: string[] = [
    // Add required env vars here if needed
  ];
  
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    return false;
  }
  
  return true;
}

export default environment;
