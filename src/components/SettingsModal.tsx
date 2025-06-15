"use client";

import { useState } from "react";
import { X, Settings, Key, Palette, Globe, Trash2 } from "lucide-react";
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

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { state, dispatch } = useChatContext();
    const [activeTab, setActiveTab] = useState("general");
    const [showApiKeyForm, setShowApiKeyForm] = useState(false);
    const [apiKeyProvider, setApiKeyProvider] = useState("");
    const [apiKeyValue, setApiKeyValue] = useState("");

    if (!isOpen) return null;

    const handleSaveApiKey = (e: React.FormEvent) => {
        e.preventDefault();
        // Save API key logic here
        console.log("Saving API key for:", apiKeyProvider, apiKeyValue);
        // Reset form
        setApiKeyValue("");
        setApiKeyProvider("");
        setShowApiKeyForm(false);
    };

    const handleDeleteAllChats = () => {
        if (window.confirm("Are you sure you want to delete all chats? This action cannot be undone.")) {
            dispatch({ type: "DELETE_ALL_CHATS" });
        }
    };

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
                                <Settings className="w-4 h-4 mr-2" />
                                General
                            </TabsTrigger>
                            <TabsTrigger
                                value="api-keys"
                                className="data-[state=active]:dark data-[state=active]:text-slate-100"
                            >
                                <Key className="w-4 h-4 mr-2" />
                                API Keys
                            </TabsTrigger>
                            <TabsTrigger
                                value="appearance"
                                className="data-[state=active]:dark data-[state=active]:text-slate-100"
                            >
                                <Palette className="w-4 h-4 mr-2" />
                                Appearance
                            </TabsTrigger>
                            <TabsTrigger
                                value="data"
                                className="data-[state=active]:dark data-[state=active]:text-slate-100"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Data
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-4 h-[calc(100%-60px)] overflow-y-auto">
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
                                                className="w-4 h-4 text-blue-600 dark border-slate-500 rounded focus:ring-blue-500"
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
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-100 mb-2">
                                            API Key Management
                                        </h3>
                                        <p className="text-sm text-slate-400 mb-4">
                                            Manage your API keys for different AI providers
                                        </p>
                                    </div>

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
                                                        {Array.from(new Set(CHAT_MODELS.map(model => model.provider))).map((provider) => (
                                                            <option key={provider} value={provider.toLowerCase()}>
                                                                {provider}
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
                                                        onClick={() => setShowApiKeyForm(false)}
                                                        className="text-slate-200 border-slate-600 hover:dark"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
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