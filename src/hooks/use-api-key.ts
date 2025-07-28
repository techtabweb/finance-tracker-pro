import { useState, useCallback, useEffect } from 'react';

interface ApiKeyData {
  geminiApiKey: string;
  isConfigured: boolean;
  lastUpdated?: string;
}

const KV_KEY = 'api-keys';

export function useApiKey() {
  const [apiKeyData, setApiKeyData] = useState<ApiKeyData>({
    geminiApiKey: '',
    isConfigured: false
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load API key from storage on mount
  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Try to get from localStorage first (for backwards compatibility)
      const stored = localStorage.getItem(KV_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setApiKeyData({
          geminiApiKey: parsed.geminiApiKey || '',
          isConfigured: !!(parsed.geminiApiKey && parsed.geminiApiKey.length > 0),
          lastUpdated: parsed.lastUpdated
        });
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveApiKey = useCallback(async (apiKey: string) => {
    try {
      const keyData: ApiKeyData = {
        geminiApiKey: apiKey.trim(),
        isConfigured: !!(apiKey.trim().length > 0),
        lastUpdated: new Date().toISOString()
      };

      // Save to localStorage
      localStorage.setItem(KV_KEY, JSON.stringify(keyData));
      
      setApiKeyData(keyData);
      return { success: true };
    } catch (error) {
      console.error('Error saving API key:', error);
      return { success: false, error: 'Failed to save API key' };
    }
  }, []);

  const clearApiKey = useCallback(async () => {
    try {
      localStorage.removeItem(KV_KEY);
      setApiKeyData({
        geminiApiKey: '',
        isConfigured: false
      });
      return { success: true };
    } catch (error) {
      console.error('Error clearing API key:', error);
      return { success: false, error: 'Failed to clear API key' };
    }
  }, []);

  const validateApiKey = useCallback((apiKey: string): boolean => {
    // Basic validation for Gemini API key format
    return apiKey.startsWith('AIza') && apiKey.length >= 39;
  }, []);

  const getApiKey = useCallback((): string | null => {
    return apiKeyData.isConfigured ? apiKeyData.geminiApiKey : null;
  }, [apiKeyData]);

  return {
    apiKeyData,
    isLoading,
    saveApiKey,
    clearApiKey,
    validateApiKey,
    getApiKey,
    isConfigured: apiKeyData.isConfigured
  };
}