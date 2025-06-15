"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Key,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  
  AlertCircle,
  CheckCircle,
  X,
  Shield,
  Info,
} from "lucide-react";
import { useChatContext } from "../contexts/ChatContext";
import { CHAT_MODELS } from "../constants/models";

interface ApiKeyManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ApiKeyEntry {
  provider: string;
  apiKey: string;
  isVisible: boolean;
  lastUsed?: string;
  status: "active" | "invalid" | "unused";
}

export default function ApiKeyManager({ isOpen, onClose }: ApiKeyManagerProps) {
  const { state, saveApiKey } = useChatContext();
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
  const [newProvider, setNewProvider] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get unique providers from chat models
  const availableProviders = Array.from(
    new Set(CHAT_MODELS.map((model) => model.provider.toLowerCase())),
  );

  const loadApiKeys = useCallback(() => {
    // Convert state.userApiKeys to ApiKeyEntry format
    const entries: ApiKeyEntry[] = Object.entries(state.userApiKeys).map(
      ([provider, apiKey]) => ({
        provider,
        apiKey: apiKey as string,
        isVisible: false,
        status: "active" as const,
      }),
    );
    setApiKeys(entries);
  }, [state.userApiKeys]);

  useEffect(() => {
    if (isOpen) {
      loadApiKeys();
    }
  }, [isOpen, loadApiKeys]);

  const handleAddApiKey = async () => {
    if (!newProvider || !newApiKey.trim()) {
      setError("Please select a provider and enter an API key");
      return;
    }

    // Validate API key format based on provider
    if (!validateApiKeyFormat(newProvider, newApiKey)) {
      setError("Invalid API key format for selected provider");
      return;
    }

    try {
      setError(null);
      await saveApiKey(newProvider, newApiKey.trim());

      // Add to local state
      const newEntry: ApiKeyEntry = {
        provider: newProvider,
        apiKey: newApiKey.trim(),
        isVisible: false,
        status: "active",
      };

      setApiKeys((prev) => {
        const filtered = prev.filter((key) => key.provider !== newProvider);
        return [...filtered, newEntry];
      });

      setNewProvider("");
      setNewApiKey("");
      setIsAdding(false);
      setSuccess(`API key for ${newProvider} saved successfully!`);

      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to save API key",
      );
    }
  };

  const validateApiKeyFormat = (provider: string, apiKey: string): boolean => {
    const patterns: Record<string, RegExp> = {
      openai: /^sk-[a-zA-Z0-9]{48,}$/,
      anthropic: /^sk-ant-[a-zA-Z0-9\-_]{95,}$/,
      google: /^[a-zA-Z0-9\-_]{39}$/,
    };

    const pattern = patterns[provider.toLowerCase()];
    return pattern ? pattern.test(apiKey) : apiKey.length > 10; // Fallback validation
  };

  const handleRemoveApiKey = async (provider: string) => {
    if (
      !confirm(`Are you sure you want to remove the API key for ${provider}?`)
    ) {
      return;
    }

    try {
      // For removal, we'll save an empty key (or implement a delete endpoint)
      await saveApiKey(provider, "");
      setApiKeys((prev) => prev.filter((key) => key.provider !== provider));
      setSuccess(`API key for ${provider} removed successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to remove API key",
      );
    }
  };

  const toggleVisibility = (provider: string) => {
    setApiKeys((prev) =>
      prev.map((key) =>
        key.provider === provider ? { ...key, isVisible: !key.isVisible } : key,
      ),
    );
  };

  const maskApiKey = (apiKey: string): string => {
    if (apiKey.length <= 8) return "••••••••";
    return (
      apiKey.substring(0, 4) + "••••••••" + apiKey.substring(apiKey.length - 4)
    );
  };

  const getProviderInfo = (provider: string) => {
    const info: Record<string, { name: string; color: string; docs: string }> =
      {
        openai: {
          name: "OpenAI",
          color: "from-green-400 to-green-600",
          docs: "https://platform.openai.com/api-keys",
        },
        anthropic: {
          name: "Anthropic",
          color: "from-orange-400 to-orange-600",
          docs: "https://console.anthropic.com/settings/keys",
        },
        google: {
          name: "Google",
          color: "from-blue-400 to-blue-600",
          docs: "https://aistudio.google.com/app/apikey",
        },
      };

    return (
      info[provider.toLowerCase()] || {
        name: provider.charAt(0).toUpperCase() + provider.slice(1),
        color: "from-gray-400 to-gray-600",
        docs: "#",
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border-slate-700 flex flex-col">
        <CardHeader className="pb-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <Key className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-100">
                  API Key Management
                </CardTitle>
                <p className="text-sm text-slate-400 mt-1">
                  Manage your AI provider API keys securely
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-6 overflow-hidden flex flex-col">
          {/* Status Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-500/30">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-900/20 border border-green-500/30">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">{success}</span>
              </div>
            </div>
          )}

          {/* Info Panel */}
          <div className="mb-6 p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-200 font-medium mb-2">About API Keys</p>
                <p className="text-blue-100/80 mb-2">
                  Add your own API keys to unlock unlimited usage. Without API
                  keys, you&apos;re limited to 10 free chats.
                </p>
                <p className="text-blue-100/60 text-xs">
                  Your API keys are stored securely and only used for your
                  conversations.
                </p>
              </div>
            </div>
          </div>

          {/* Add New API Key */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">
                Your API Keys
              </h3>
              <Button
                onClick={() => setIsAdding(!isAdding)}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Key
              </Button>
            </div>

            {isAdding && (
              <Card className="p-4 bg-slate-800/50 border-slate-600 mb-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Provider
                    </label>
                    <select
                      value={newProvider}
                      onChange={(e) => setNewProvider(e.target.value)}
                      className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-slate-100"
                    >
                      <option value="">Select a provider</option>
                      {availableProviders.map((provider) => {
                        const info = getProviderInfo(provider);
                        return (
                          <option key={provider} value={provider}>
                            {info.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      API Key
                    </label>
                    <Input
                      type="password"
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                      placeholder="Enter your API key"
                      className="bg-slate-700 border-slate-600 text-slate-100"
                    />
                    {newProvider && (
                      <p className="text-xs text-slate-400 mt-1">
                        Get your API key from{" "}
                        <a
                          href={getProviderInfo(newProvider).docs}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          {getProviderInfo(newProvider).name} dashboard
                        </a>
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddApiKey}
                      disabled={!newProvider || !newApiKey.trim()}
                      className="flex-1"
                    >
                      Save API Key
                    </Button>
                    <Button
                      onClick={() => {
                        setIsAdding(false);
                        setNewProvider("");
                        setNewApiKey("");
                        setError(null);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* API Keys List */}
          <ScrollArea className="flex-1">
            {apiKeys.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                <p className="text-slate-400 mb-2">No API keys configured</p>
                <p className="text-sm text-slate-500">
                  Add your API keys to enable unlimited usage
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((keyEntry) => {
                  const info = getProviderInfo(keyEntry.provider);
                  return (
                    <Card
                      key={keyEntry.provider}
                      className="p-4 bg-slate-800/30 border-slate-700 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full bg-gradient-to-r ${info.color}`}
                          />
                          <div>
                            <p className="font-medium text-slate-200">
                              {info.name}
                            </p>
                            <p className="text-sm text-slate-400 font-mono">
                              {keyEntry.isVisible
                                ? keyEntry.apiKey
                                : maskApiKey(keyEntry.apiKey)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-900/20 border border-green-500/30">
                            <div className="w-2 h-2 bg-green-400 rounded-full" />
                            <span className="text-xs text-green-400 font-medium">
                              Active
                            </span>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleVisibility(keyEntry.provider)}
                            className="h-8 w-8 text-slate-400 hover:text-slate-100"
                          >
                            {keyEntry.isVisible ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleRemoveApiKey(keyEntry.provider)
                            }
                            className="h-8 w-8 text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-700 text-center">
            <p className="text-xs text-slate-500">
              API keys are encrypted and stored securely. They are only used for
              your chat requests.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
