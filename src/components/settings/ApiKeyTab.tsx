import { useState, useEffect } from "react";
import { useApiKeys } from "./hooks/ApiKeyHooks";
import { useChatContext } from "@/contexts/ChatContext";
import { CHAT_MODELS } from "@/constants/models";
import { TabsContent } from "../ui/tabs";
import { Button } from "../ui/button";
import { Key, Trash2 } from "lucide-react";
import { Input } from "../ui/input";

interface ApiKeysTabProps {
    onError: (message: string) => void;
    onSuccess: (message: string) => void;
}

export function ApiKeysTab({ onError, onSuccess }: ApiKeysTabProps) {
    const { saveApiKey } = useChatContext();
    const {
        apiKeys,
        isLoadingApiKeys,
        isDeletingApiKey,
        fetchApiKeysFromServer,
        saveApiKeyToServer,
        deleteApiKeyFromServer,
    } = useApiKeys();

    const [showApiKeyForm, setShowApiKeyForm] = useState(false);
    const [apiKeyProvider, setApiKeyProvider] = useState("");
    const [apiKeyValue, setApiKeyValue] = useState("");
    const availableProviders = Array.from(
        new Set(CHAT_MODELS.map((model) => model.provider.toLowerCase()))
    );

    useEffect(() => {
        fetchApiKeysFromServer().catch((error) => {
            onError(error.message);
        });
    }, [fetchApiKeysFromServer, onError]);

    const validateApiKeyFormat = (provider: string, apiKey: string): boolean => {
        const patterns: Record<string, RegExp> = {
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
            onError("Please select a provider and enter an API key");
            return;
        }

        if (!validateApiKeyFormat(apiKeyProvider, apiKeyValue)) {
            onError("Invalid API key format for selected provider");
            return;
        }

        try {
            await saveApiKeyToServer(apiKeyProvider, apiKeyValue.trim());
            await saveApiKey(apiKeyProvider, apiKeyValue.trim());

            setApiKeyValue("");
            setApiKeyProvider("");
            setShowApiKeyForm(false);
            onSuccess(`API key for ${apiKeyProvider} saved successfully!`);

            await fetchApiKeysFromServer();
        } catch (error) {
            onError(error instanceof Error ? error.message : "Failed to save API key");
        }
    };

    const handleRemoveApiKey = async (provider: string) => {
        if (!window.confirm(`Are you sure you want to remove the API key for ${provider}?`)) {
            return;
        }

        try {
            await deleteApiKeyFromServer(provider);
            await saveApiKey(provider, "");
            onSuccess(`API key for ${provider} removed successfully!`);
        } catch (error) {
            onError(error instanceof Error ? error.message : "Failed to remove API key");
        }
    };

    return (
        <div className="space-y-6">
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
                                                {keyEntry.apiKey.length > 20
                                                    ? `${keyEntry.apiKey.slice(0, 20)}***${keyEntry.apiKey.slice(-3)}`
                                                    : keyEntry.apiKey}
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
        </div>
    );
}