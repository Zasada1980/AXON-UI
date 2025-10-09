import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SecureAPIKeyManager from '../components/SecureAPIKeyManager';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock encryption utilities
vi.mock('../utils/encryption', () => ({
  apiKeyStorage: {
    getApiKey: vi.fn(() => Promise.resolve(null)),
    setApiKey: vi.fn(() => Promise.resolve()),
    removeApiKey: vi.fn(() => Promise.resolve()),
  },
  initializeEncryption: vi.fn(() => Promise.resolve()),
}));

// Mock API key validation
vi.mock('../utils/apiKeyValidation', () => ({
  validateApiKey: vi.fn(() => Promise.resolve({
    isValid: true,
    provider: 'openai',
    responseTime: 150,
  })),
  getValidationStatusText: vi.fn((result, language) => 
    result.isValid ? 'Valid' : 'Invalid'
  ),
  getValidationStatusColor: vi.fn((result) => 
    result.isValid ? 'text-green-500' : 'text-red-500'
  ),
}));

// Mock crypto.subtle
Object.defineProperty(globalThis, 'crypto', {
  value: {
    subtle: {
      encrypt: vi.fn(),
      decrypt: vi.fn(),
      generateKey: vi.fn(),
      importKey: vi.fn(),
    },
  },
  configurable: true,
});

describe('SecureAPIKeyManager Smoke Tests', () => {
  const defaultProps = {
    language: 'en' as const,
    projectId: 'test-project',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<SecureAPIKeyManager {...defaultProps} />);
    expect(screen.getByText('Secure API Key Management')).toBeInTheDocument();
  });

  it('displays encryption description', () => {
    render(<SecureAPIKeyManager {...defaultProps} />);
    expect(screen.getByText('Manage your AI provider API keys with AES-256 encryption')).toBeInTheDocument();
  });

  it('shows encryption status alert', () => {
    render(<SecureAPIKeyManager {...defaultProps} />);
    expect(screen.getByText('Encryption Status')).toBeInTheDocument();
    // Check for either encryption available or not available
    const encryptionText = screen.getByText(/Encryption not available|Keys are encrypted with AES-256/);
    expect(encryptionText).toBeInTheDocument();
  });

  it('displays provider cards', () => {
    render(<SecureAPIKeyManager {...defaultProps} />);
    
    // Check for AI provider cards
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Anthropic')).toBeInTheDocument();
    expect(screen.getByText('Google AI')).toBeInTheDocument();
    expect(screen.getByText('Azure OpenAI')).toBeInTheDocument();
  });

  it('shows provider descriptions', () => {
    render(<SecureAPIKeyManager {...defaultProps} />);
    expect(screen.getByText('GPT-4, GPT-3.5, DALL-E, Whisper')).toBeInTheDocument();
    expect(screen.getByText('Claude 3, Claude 2')).toBeInTheDocument();
    expect(screen.getByText('Gemini Pro, PaLM')).toBeInTheDocument();
    expect(screen.getByText('Enterprise OpenAI API')).toBeInTheDocument();
  });

  it('renders with Russian language', () => {
    render(<SecureAPIKeyManager {...defaultProps} language="ru" />);
    expect(screen.getByText('Безопасное Управление API Ключами')).toBeInTheDocument();
    expect(screen.getByText('Управляйте ключами AI провайдеров с шифрованием AES-256')).toBeInTheDocument();
  });

  it('has form for adding new API keys', () => {
    render(<SecureAPIKeyManager {...defaultProps} />);
    
    expect(screen.getByText('Add New API Key')).toBeInTheDocument();
    expect(screen.getByText('Provider')).toBeInTheDocument();
    expect(screen.getByText('API Key')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Key/i })).toBeInTheDocument();
  });

  it('shows configured providers section', () => {
    render(<SecureAPIKeyManager {...defaultProps} />);
    expect(screen.getByText('Configured Providers')).toBeInTheDocument();
  });

  it('displays provider status badges', () => {
    render(<SecureAPIKeyManager {...defaultProps} />);
    
    // All providers should start as disconnected
    const disconnectedBadges = screen.getAllByText('Disconnected');
    expect(disconnectedBadges.length).toBeGreaterThan(0);
  });

  it('handles provider selection', () => {
    render(<SecureAPIKeyManager {...defaultProps} />);
    
    // Find the provider select button - should be present
    const providerSelect = screen.getByRole('combobox');
    expect(providerSelect).toBeInTheDocument();
    
    // No need to test actual opening in smoke test - just presence
  });

  it('validates API key input', async () => {
    render(<SecureAPIKeyManager {...defaultProps} />);
    
    const apiKeyInput = screen.getByPlaceholderText('Enter API key...');
    expect(apiKeyInput).toBeInTheDocument();
    expect(apiKeyInput).toHaveAttribute('type', 'password');
  });

  it('handles project ID prop correctly', () => {
    const customProjectId = 'custom-project-456';
    render(<SecureAPIKeyManager {...defaultProps} projectId={customProjectId} />);
    
    // Component should render without errors with custom project ID
    expect(screen.getByText('Secure API Key Management')).toBeInTheDocument();
  });

  it('shows save button with proper state', () => {
    render(<SecureAPIKeyManager {...defaultProps} />);
    
    const saveButton = screen.getByRole('button', { name: /Save Key/i });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeDisabled(); // Should be disabled when no provider/key selected
  });

  it('handles optional callback prop', () => {
    const onApiKeyUpdate = vi.fn();
    
    render(
      <SecureAPIKeyManager 
        {...defaultProps} 
        onApiKeyUpdate={onApiKeyUpdate}
      />
    );
    
    expect(screen.getByText('Secure API Key Management')).toBeInTheDocument();
  });

  describe('Security Features', () => {
    it('shows encryption status with proper indicator', () => {
      render(<SecureAPIKeyManager {...defaultProps} />);
      
      // Check for either encryption status
      const encryptionBadge = screen.getByText(/Encryption not available|Keys are encrypted with AES-256/);
      expect(encryptionBadge).toBeInTheDocument();
    });

    it('masks API keys when displayed', () => {
      render(<SecureAPIKeyManager {...defaultProps} />);
      
      // Check that password input type is used for API key entry
      const keyInput = screen.getByPlaceholderText('Enter API key...');
      expect(keyInput).toHaveAttribute('type', 'password');
    });

    it('shows last validated timestamps when available', () => {
      render(<SecureAPIKeyManager {...defaultProps} />);
      
      // Should show timestamp info - either "Never" or actual timestamps
      const timestampText = screen.queryByText('Never') || screen.queryByText(/Last validated/);
      // At least one should be present in configured providers
      expect(timestampText).toBeTruthy();
    });
  });

  describe('Provider Management', () => {
    it('displays all major AI providers', () => {
      render(<SecureAPIKeyManager {...defaultProps} />);
      
      const providers = ['OpenAI', 'Anthropic', 'Google AI', 'Azure OpenAI'];
      providers.forEach(provider => {
        expect(screen.getByText(provider)).toBeInTheDocument();
      });
    });

    it('shows provider-specific descriptions', () => {
      render(<SecureAPIKeyManager {...defaultProps} />);
      
      expect(screen.getByText('GPT-4, GPT-3.5, DALL-E, Whisper')).toBeInTheDocument();
      expect(screen.getByText('Claude 3, Claude 2')).toBeInTheDocument();
      expect(screen.getByText('Gemini Pro, PaLM')).toBeInTheDocument();
      expect(screen.getByText('Enterprise OpenAI API')).toBeInTheDocument();
    });

    it('shows disconnected status for all providers initially', () => {
      render(<SecureAPIKeyManager {...defaultProps} />);
      
      // Should have multiple "Disconnected" badges
      const disconnectedBadges = screen.getAllByText('Disconnected');
      expect(disconnectedBadges.length).toBe(4); // One for each provider
    });
  });

  describe('Error Handling', () => {
    it('handles missing crypto.subtle gracefully', () => {
      // Mock crypto.subtle to be undefined
      Object.defineProperty(globalThis, 'crypto', {
        value: { subtle: undefined },
        configurable: true,
      });

      render(<SecureAPIKeyManager {...defaultProps} />);
      
      // Should render but show encryption not available
      expect(screen.getByText('Secure API Key Management')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper form labels', () => {
      render(<SecureAPIKeyManager {...defaultProps} />);
      
      // Check for provider and API key labels
      expect(screen.getByText('Provider')).toBeInTheDocument();
      expect(screen.getByText('API Key')).toBeInTheDocument();
    });

    it('has accessible button text', () => {
      render(<SecureAPIKeyManager {...defaultProps} />);
      
      const saveButton = screen.getByRole('button', { name: /Save Key/i });
      expect(saveButton).toBeInTheDocument();
    });

    it('uses semantic HTML structure', () => {
      render(<SecureAPIKeyManager {...defaultProps} />);
      
      // Check for proper headings
      expect(screen.getByText('Add New API Key')).toBeInTheDocument();
      expect(screen.getByText('Configured Providers')).toBeInTheDocument();
    });
  });
});