/**
 * Simple encryption utilities for secure storage of sensitive data
 * Uses Web Crypto API with AES-GCM encryption
 */

import { toast } from 'sonner';

// Generate encryption key from environment or use secure fallback
const getEncryptionPassword = (): string => {
  // Try to get from environment variables first
  if (typeof process !== 'undefined' && process.env?.AXON_ENCRYPTION_KEY) {
    return process.env.AXON_ENCRYPTION_KEY;
  }
  
  // Fallback: generate from browser fingerprint + timestamp
  const browserFingerprint = [
    navigator.userAgent,
    navigator.language,
    new Date().toDateString(),
    'axon-secure-fallback'
  ].join('-');
  
  return btoa(browserFingerprint).substring(0, 32);
};

// Simple key derivation
const deriveKey = async (password: string): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const salt = encoder.encode('axon-salt-2024'); // Fixed salt for simplicity
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

// Convert ArrayBuffer to hex string
const bufferToHex = (buffer: ArrayBuffer): string => {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Convert hex string to ArrayBuffer
const hexToBuffer = (hex: string): ArrayBuffer => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
};

// Encrypted data structure
interface EncryptedData {
  encrypted: string;
  iv: string;
  timestamp: number;
}

/**
 * Encrypt sensitive data using AES-256-GCM
 */
export const encryptData = async (data: string): Promise<EncryptedData> => {
  try {
    if (!crypto.subtle) {
      throw new Error('Web Crypto API not available');
    }

    const password = getEncryptionPassword();
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Derive encryption key
    const key = await deriveKey(password);
    
    // Encrypt the data
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encoder.encode(data)
    );

    return {
      encrypted: bufferToHex(encryptedBuffer),
      iv: bufferToHex(iv.buffer),
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    toast.error('Failed to encrypt data');
    throw error;
  }
};

/**
 * Decrypt sensitive data using AES-256-GCM
 */
export const decryptData = async (encryptedData: EncryptedData): Promise<string> => {
  try {
    if (!crypto.subtle) {
      throw new Error('Web Crypto API not available');
    }

    const password = getEncryptionPassword();
    const decoder = new TextDecoder();
    
    // Derive decryption key
    const key = await deriveKey(password);
    
    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: hexToBuffer(encryptedData.iv),
      },
      key,
      hexToBuffer(encryptedData.encrypted)
    );

    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption failed:', error);
    toast.error('Failed to decrypt data - data may be corrupted');
    throw error;
  }
};

/**
 * Secure storage wrapper for localStorage with encryption
 */
export const secureStorage = {
  /**
   * Store encrypted data in localStorage
   */
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      const encryptedData = await encryptData(value);
      localStorage.setItem(`secure_${key}`, JSON.stringify(encryptedData));
    } catch (error) {
      console.error('Secure storage setItem failed:', error);
      throw error;
    }
  },

  /**
   * Retrieve and decrypt data from localStorage
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      const storedData = localStorage.getItem(`secure_${key}`);
      if (!storedData) return null;

      const encryptedData: EncryptedData = JSON.parse(storedData);
      return await decryptData(encryptedData);
    } catch (error) {
      console.error('Secure storage getItem failed:', error);
      return null;
    }
  },

  /**
   * Remove encrypted data from localStorage
   */
  removeItem: (key: string): void => {
    localStorage.removeItem(`secure_${key}`);
  },

  /**
   * Check if encrypted item exists
   */
  hasItem: (key: string): boolean => {
    return localStorage.getItem(`secure_${key}`) !== null;
  },

  /**
   * Migrate unencrypted data to encrypted format
   */
  migrateUnencryptedItem: async (key: string): Promise<boolean> => {
    try {
      const unencryptedValue = localStorage.getItem(key);
      if (!unencryptedValue) return false;

      // Store encrypted version
      await secureStorage.setItem(key, unencryptedValue);
      
      // Remove unencrypted version
      localStorage.removeItem(key);
      
      return true;
    } catch (error) {
      console.error('Migration failed for key:', key, error);
      return false;
    }
  },
};

/**
 * API Key specific encryption utilities
 */
export const apiKeyStorage = {
  /**
   * Store API key securely
   */
  setApiKey: async (provider: string, apiKey: string): Promise<void> => {
    if (!apiKey.trim()) {
      throw new Error('API key cannot be empty');
    }
    
    await secureStorage.setItem(`api_key_${provider}`, apiKey);
    toast.success(`${provider} API key encrypted and stored securely`);
  },

  /**
   * Retrieve API key securely
   */
  getApiKey: async (provider: string): Promise<string | null> => {
    return await secureStorage.getItem(`api_key_${provider}`);
  },

  /**
   * Remove API key
   */
  removeApiKey: (provider: string): void => {
    secureStorage.removeItem(`api_key_${provider}`);
    toast.success(`${provider} API key removed`);
  },

  /**
   * Check if API key exists
   */
  hasApiKey: (provider: string): boolean => {
    return secureStorage.hasItem(`api_key_${provider}`);
  },

  /**
   * Migrate all unencrypted API keys
   */
  migrateAllApiKeys: async (): Promise<void> => {
    const providers = ['openai', 'anthropic', 'google', 'azure'];
    let migratedCount = 0;

    for (const provider of providers) {
      const migrated = await secureStorage.migrateUnencryptedItem(`api_key_${provider}`);
      if (migrated) {
        migratedCount++;
      }
    }

    if (migratedCount > 0) {
      toast.success(`Migrated ${migratedCount} API keys to encrypted storage`);
    }
  },
};

/**
 * Utility to check if data is encrypted
 */
export const isEncryptedData = (data: string): boolean => {
  try {
    const parsed = JSON.parse(data);
    return (
      typeof parsed === 'object' &&
      parsed.encrypted &&
      parsed.iv &&
      parsed.timestamp
    );
  } catch {
    return false;
  }
};

/**
 * Initialize encryption system and migrate existing data
 */
export const initializeEncryption = async (): Promise<void> => {
  try {
    // Check if crypto.subtle is available
    if (!crypto.subtle) {
      console.warn('Web Crypto API not available - encryption disabled');
      toast.warning('Encryption not available in this environment');
      return;
    }

    // Migrate existing unencrypted API keys
    await apiKeyStorage.migrateAllApiKeys();
    
    console.log('Encryption system initialized successfully');
  } catch (error) {
    console.error('Failed to initialize encryption system:', error);
    toast.error('Failed to initialize encryption system');
  }
};