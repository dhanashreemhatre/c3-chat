"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Settings, Key, Palette, Globe, Trash2, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChatContext } from "@/contexts/ChatContext";
import { CHAT_MODELS } from "@/constants/models";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ApiKeyEntry {
    provider: string;
    apiKey: string;
    isVisible: boolean;
    status: "active" | "invalid" | "unused";
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { state, dispatch, deleteAllChats, loadUserChats, saveApiKey } = useChatContext();
    const [activeTab, setActiveTab] = useState("general");
    const [showApiKeyForm, setShowApiKeyForm] = useState(false);
    const [apiKeyProvider, setApiKeyProvider] = useState("");
    const [apiKeyValue, setApiKeyValue] = useState("");
    const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoadingApiKeys, setIsLoadingApiKeys] = useState(false);
    const [isDeletingApiKey, setIsDeletingApiKey] = useState<string | null>(null);

    // Get unique providers from chat models
    const availableProviders = Array.from(
        new Set(CHAT_MODELS.map((model) => model.provider.toLowerCase())),
    );

    const fetchApiKeysFromServer = useCallback(async () => {
        setIsLoadingApiKeys(true);
        try {
            const response = await fetch('/api/user-api-key');
            if (!response.ok) {
                throw new Error(`Failed to fetch API keys: ${response.statusText}`);
            }
            const data = await response.json();
            
            // Transform server response to match our ApiKeyEntry format
            // Server returns: { success: true, apiKeys: [{ provider: "google", apiKey: "***..." }] }
            const serverApiKeys: ApiKeyEntry[] = (data.apiKeys || []).map((item: any) => ({
                provider: item.provider,
                apiKey: item.apiKey,
                isVisible: false,
                status: "active" as const,
            }));
            
            setApiKeys(serverApiKeys);
        } catch (error) {
            console.error('Failed to fetch API keys from server:', error);
            setError(error instanceof Error ? error.message : "Failed to fetch API keys from server");
            // Fallback to local state if server fetch fails
            loadApiKeysFromLocal();
        } finally {
            setIsLoadingApiKeys(false);
        }
    }, []);

    const deleteApiKeyFromServer = useCallback(async (provider: string) => {
        setIsDeletingApiKey(provider);
        try {
            const response = await fetch('/api/user-api-key', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ provider }),
            });

            if (!response.ok) {
                throw new Error(`Failed to delete API key: ${response.statusText}`);
            }

            // Remove from local state immediately for better UX
            setApiKeys((prev) => prev.filter((key) => key.provider !== provider));
            setSuccess(`API key for ${provider} deleted successfully!`);
            setTimeout(() => setSuccess(null), 3000);

            // Refresh from server to ensure consistency
            await fetchApiKeysFromServer();
        } catch (error) {
            console.error('Failed to delete API key from server:', error);
            setError(error instanceof Error ? error.message : "Failed to delete API key from server");
        } finally {
            setIsDeletingApiKey(null);
        }
    }, [fetchApiKeysFromServer]);

    const loadApiKeysFromLocal = useCallback(() => {
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

    const loadApiKeys = useCallback(() => {
        // Try to fetch from server first, fallback to local if it fails
        fetchApiKeysFromServer();
    }, [fetchApiKeysFromServer]);

    useEffect(() => {
        if (isOpen) {
            loadApiKeys();
        }
    }, [isOpen, loadApiKeys]);

    const validateApiKeyFormat = (provider: string, apiKey: string): boolean => {
        const patterns: Record<string, RegExp> = {
            // More flexible OpenAI pattern - starts with sk- followed by base64-like characters
            openai: /^sk-/,
            anthropic: /^sk-ant-[a-zA-Z0-9\-_]{95,}$/,
            google: /^[a-zA-Z0-9\-_]{39}$/,
        };

        const pattern = patterns[provider.toLowerCase()];
        return pattern ? pattern.test(apiKey) : apiKey.length > 10;
    };

    const handleSaveApiKey = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!apiKeyProvider || !apiKeyValue.trim()) {
            setError("Please select a provider and enter an API key");
            return;
        }

        if (!validateApiKeyFormat(apiKeyProvider, apiKeyValue)) {
            setError("Invalid API key format for selected provider");
            return;
        }

        try {
            setError(null);
            await saveApiKey(apiKeyProvider, apiKeyValue.trim());

            const newEntry: ApiKeyEntry = {
                provider: apiKeyProvider,
                apiKey: apiKeyValue.trim(),
                isVisible: false,
                status: "active",
            };

            setApiKeys((prev) => {
                const filtered = prev.filter((key) => key.provider !== apiKeyProvider);
                return [...filtered, newEntry];
            });

            setApiKeyValue("");
            setApiKeyProvider("");
            setShowApiKeyForm(false);
            setSuccess(`API key for ${apiKeyProvider} saved successfully!`);

            setTimeout(() => setSuccess(null), 3000);
            
            // Refresh API keys from server after saving
            await fetchApiKeysFromServer();
        } catch (error) {
            setError(
                error instanceof Error ? error.message : "Failed to save API key",
            );
        }
    };

    const handleRemoveApiKey = async (provider: string) => {
        if (
            !window.confirm(`Are you sure you want to remove the API key for ${provider}?`)
        ) {
            return;
        }

        try {
            setError(null);
            
            // Try to delete from server first
            await deleteApiKeyFromServer(provider);
            
            // Also remove from local context as fallback
            await saveApiKey(provider, "");
        } catch (error) {
            // If server deletion fails, try local deletion as fallback
            try {
                await saveApiKey(provider, "");
                setApiKeys((prev) => prev.filter((key) => key.provider !== provider));
                setSuccess(`API key for ${provider} removed successfully!`);
                setTimeout(() => setSuccess(null), 3000);
            } catch (localError) {
                setError(
                    error instanceof Error ? error.message : "Failed to remove API key",
                );
            }
        }
    };

    const handleDeleteAllChats = async () => {
        if (!window.confirm("Are you sure you want to delete all chats? This action cannot be undone.")) {
            return;
        }
        try {
            await deleteAllChats(); // This clears chats in context
            await loadUserChats();  // This refetches from server (should be empty after deletion)
            setSuccess("All chats deleted successfully!");
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to delete chats");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] dark border-slate-700 flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-slate-400" />
                        <CardTitle className="text-slate-100">Settings</CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-100 hover:dark"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                        <TabsList className="grid w-full grid-cols-4 dark">
                            <TabsTrigger
                                value="general"
                                className="data-[state=active]:dark data-[state=active]:text-slate-100"
                            >
                                <Settings className="hidden sm:block w-4 h-4 mr-2" />
                                General
                            </TabsTrigger>
                            <TabsTrigger
                                value="api-keys"
                                className="data-[state=active]:dark data-[state=active]:text-slate-100"
                            >
                                <Key className="hidden sm:block w-4 h-4 mr-2" />
                                API Keys
                            </TabsTrigger>
                            <TabsTrigger
                                value="appearance"
                                className="data-[state=active]:dark data-[state=active]:text-slate-100"
                            >
                                <Palette className="hidden sm:block w-4 h-4 mr-2" />
                                Appearance
                            </TabsTrigger>
                            <TabsTrigger
                                value="data"
                                className="data-[state=active]:dark data-[state=active]:text-slate-100"
                            >
                                <Trash2 className="hidden sm:block w-4 h-4 mr-2" />
                                Data
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-4 h-[calc(100%-60px)] overflow-y-auto">
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

                            {/* General Settings */}
                            <TabsContent value="general" className="mt-0">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-100 mb-2">
                                            General Settings
                                        </h3>
                                        <p className="text-sm text-slate-400 mb-4">
                                            Configure your AI model and search preferences
                                        </p>
                                    </div>

                                    {/* Model Selection */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-200">
                                            AI Model
                                        </label>
                                        <select
                                            value={state.selectedModel}
                                            onChange={(e) =>
                                                dispatch({
                                                    type: "SET_SELECTED_MODEL",
                                                    payload: e.target.value,
                                                })
                                            }
                                            className="w-full p-3 rounded-lg dark border border-slate-600 text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        >
                                            {CHAT_MODELS.map((model) => (
                                                <option key={model.id} value={model.id}>
                                                    {model.name} ({model.provider})
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-slate-400">
                                            Choose the AI model for your conversations
                                        </p>
                                    </div>

                                    {/* Search Toggle */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-200">
                                            Web Search
                                        </label>
                                        <div className="flex items-center gap-3 p-3 dark rounded-lg border border-slate-600">
                                            <input
                                                type="checkbox"
                                                id="web-search"
                                                checked={state.searchEnabled}
                                                onChange={(e) =>
                                                    dispatch({
                                                        type: "SET_SEARCH_ENABLED",
                                                        payload: e.target.checked,
                                                    })
                                                }
                                                className="w-4 h-4 text-blue-600 dark:border-slate-500 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor="web-search" className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                                                <Globe className="w-4 h-4" />
                                                Enable Web Search
                                            </label>
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            Allow the AI to search the web for up-to-date information
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* API Keys */}
                            <TabsContent value="api-keys" className="mt-0">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-100 mb-2">
                                                API Key Management
                                            </h3>
                                            <p className="text-sm text-slate-400 mb-4">
                                                Manage your API keys for different AI providers. Add your own API keys to unlock unlimited usage.
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={fetchApiKeysFromServer}
                                            disabled={isLoadingApiKeys}
                                            className="text-slate-200 border-slate-600 hover:dark"
                                        >
                                            {isLoadingApiKeys ? "Refreshing..." : "Refresh"}
                                        </Button>
                                    </div>

                                    {/* Loading State */}
                                    {isLoadingApiKeys && (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                            <span className="ml-2 text-slate-400">Loading API keys...</span>
                                        </div>
                                    )}

                                    {/* Existing API Keys */}
                                    {!isLoadingApiKeys && apiKeys.length > 0 && (
                                        <div className="space-y-3 mb-6">
                                            <h4 className="text-sm font-medium text-slate-200">Your API Keys</h4>
                                            {apiKeys.map((keyEntry) => (
                                                <div key={keyEntry.provider} className="p-3 dark rounded-lg border border-slate-600">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-200 capitalize">
                                                                {String(keyEntry.provider)}
                                                            </p>
                                                            <p className="text-xs text-slate-400 font-mono">
                                                                {String(keyEntry.apiKey)}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-900/20 border border-green-500/30">
                                                                <div className="w-2 h-2 bg-green-400 rounded-full" />
                                                                <span className="text-xs text-green-400">Active</span>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveApiKey(String(keyEntry.provider))}
                                                                disabled={isDeletingApiKey === keyEntry.provider}
                                                                className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 disabled:opacity-50"
                                                            >
                                                                {isDeletingApiKey === keyEntry.provider ? (
                                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                                                                ) : (
                                                                    <Trash2 className="w-4 h-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {!isLoadingApiKeys && (
                                        <div className="space-y-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowApiKeyForm(!showApiKeyForm)}
                                                className="w-full text-slate-200 border-slate-600 hover:dark"
                                            >
                                                <Key className="w-4 h-4 mr-2" />
                                                {showApiKeyForm ? "Cancel" : "Add API Key"}
                                            </Button>

                                            {showApiKeyForm && (
                                                <form
                                                    onSubmit={handleSaveApiKey}
                                                    className="space-y-4 p-4 dark rounded-lg border border-slate-600"
                                                >
                                                    <div>
                                                        <label className="text-sm font-medium text-slate-200 mb-2 block">
                                                            Provider
                                                        </label>
                                                        <select
                                                            value={apiKeyProvider}
                                                            onChange={(e) => setApiKeyProvider(e.target.value)}
                                                            className="w-full p-3 rounded-lg dark border border-slate-500 text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                            required
                                                        >
                                                            <option value="">Select Provider</option>
                                                            {availableProviders.map((provider) => (
                                                                <option key={provider} value={provider}>
                                                                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="text-sm font-medium text-slate-200 mb-2 block">
                                                            API Key
                                                        </label>
                                                        <Input
                                                            type="password"
                                                            placeholder="Enter your API key..."
                                                            value={apiKeyValue}
                                                            onChange={(e) => setApiKeyValue(e.target.value)}
                                                            className="dark border-slate-500 text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Button type="submit" className="flex-1">
                                                            Save API Key
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setShowApiKeyForm(false);
                                                                setApiKeyProvider("");
                                                                setApiKeyValue("");
                                                                setError(null);
                                                            }}
                                                            className="text-slate-200 border-slate-600 hover:dark"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </form>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Appearance */}
                            <TabsContent value="appearance" className="mt-0">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-100 mb-2">
                                            Appearance Settings
                                        </h3>
                                        <p className="text-sm text-slate-400 mb-4">
                                            Customize the look and feel of your chat interface
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-4 dark rounded-lg border border-slate-600">
                                            <h4 className="text-sm font-medium text-slate-200 mb-2">Theme</h4>
                                            <p className="text-sm text-slate-400">Theme customization coming soon...</p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Data Management */}
                            <TabsContent value="data" className="mt-0">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-100 mb-2">
                                            Data Management
                                        </h3>
                                        <p className="text-sm text-slate-400 mb-4">
                                            Manage your chat data and history
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 dark rounded-lg border border-slate-600">
                                            <h4 className="text-sm font-medium text-slate-200 mb-2">Chat History</h4>
                                            <p className="text-sm text-slate-400 mb-4">
                                                You currently have {state.chats.length} chat(s) saved.
                                            </p>
                                            <Button
                                                variant="destructive"
                                                onClick={handleDeleteAllChats}
                                                disabled={state.chats.length === 0}
                                                className="w-full"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete All Chats
                                            </Button>
                                            <p className="text-xs text-slate-500 mt-2">
                                                This action cannot be undone. All your chat history will be permanently deleted.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}