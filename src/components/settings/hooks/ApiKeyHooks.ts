import { useState, useCallback } from 'react';
import { ApiKeyEntry } from '@/types/settings';

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
  const [isLoadingApiKeys, setIsLoadingApiKeys] = useState(false);
  const [isDeletingApiKey, setIsDeletingApiKey] = useState<string | null>(null);

  const fetchApiKeysFromServer = useCallback(async () => {
    setIsLoadingApiKeys(true);
    try {
      const response = await fetch('/api/user-api-key');
      if (!response.ok) {
        throw new Error(`Failed to fetch API keys: ${response.statusText}`);
      }
      const data = await response.json();
      
      const serverApiKeys: ApiKeyEntry[] = (data.apiKeys || []).map((item: any) => ({
        provider: item.provider,
        apiKey: item.apiKey,
        isVisible: false,
        status: "active" as const,
      }));
      
      setApiKeys(serverApiKeys);
    } catch (error) {
      console.error('Failed to fetch API keys from server:', error);
      throw error;
    } finally {
      setIsLoadingApiKeys(false);
    }
  }, []);

  const saveApiKeyToServer = useCallback(async (provider: string, apiKey: string) => {
    const response = await fetch('/api/user-api-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, apiKey }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save API key: ${response.statusText}`);
    }

    return response.json();
  }, []);

  const deleteApiKeyFromServer = useCallback(async (provider: string) => {
    setIsDeletingApiKey(provider);
    try {
      const response = await fetch('/api/user-api-key', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete API key: ${response.statusText}`);
      }

      setApiKeys((prev) => prev.filter((key) => key.provider !== provider));
      await fetchApiKeysFromServer();
    } catch (error) {
      console.error('Failed to delete API key from server:', error);
      throw error;
    } finally {
      setIsDeletingApiKey(null);
    }
  }, [fetchApiKeysFromServer]);

  return {
    apiKeys,
    setApiKeys,
    isLoadingApiKeys,
    isDeletingApiKey,
    fetchApiKeysFromServer,
    saveApiKeyToServer,
    deleteApiKeyFromServer,
  };
}