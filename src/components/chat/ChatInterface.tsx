"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, Sparkles } from "lucide-react";

import { Message } from "../../types/chat";
import { CHAT_MODELS } from "../../constants/models";
import { generateId, simulateAIResponse } from "../../utils/chat";
import { MessageBubble } from "../MessageBubble";
import { LoadingIndicator } from "../LoadingIndicator";
import { ModelSelector } from "../ModelSelector";

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [selectedModel, setSelectedModel] = useState(CHAT_MODELS[0].id);
    const [isLoading, setIsLoading] = useState(false);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector(
                "[data-radix-scroll-area-viewport]",
            );
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    // Handle sending messages
    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: generateId(),
            content: inputValue.trim(),
            role: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            const response = await simulateAIResponse(
                inputValue,
                selectedModel,
            );

            const assistantMessage: Message = {
                id: generateId(),
                content: response,
                role: "assistant",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            // Could add error handling UI here
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const currentModel = CHAT_MODELS.find((m) => m.id === selectedModel);

    return (
        <div className="min-h-screen bg-black p-2 sm:p-4 lg:p-6">
            <div className="flex flex-col h-screen max-w-6xl mx-auto">
                {/* Header */}
                <Card className="mb-4 dark border-slate-700 backdrop-blur-sm shadow-2xl">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl text-slate-100">
                                        C3Chat AI Assistant
                                    </CardTitle>
                                    <p className="text-sm text-slate-400 mt-1">
                                        Powered by {currentModel?.name}
                                    </p>
                                </div>
                            </div>

                            <ModelSelector
                                selectedModel={selectedModel}
                                onModelChange={setSelectedModel}
                            />
                        </div>
                    </CardHeader>
                </Card>

                {/* Chat Messages */}
                <Card className="flex-1 flex flex-col dark border-slate-700 backdrop-blur-sm shadow-2xl overflow-hidden">
                    <CardContent className="flex-1 p-0 flex flex-col">
                        <ScrollArea className="flex-1" ref={scrollAreaRef}>
                            <div className="p-4 sm:p-6">
                                {messages.length === 0 ? (
                                    <EmptyState currentModel={currentModel} />
                                ) : (
                                    <div className="space-y-2">
                                        {messages.map((message) => (
                                            <MessageBubble
                                                key={message.id}
                                                message={message}
                                            />
                                        ))}
                                        {isLoading && <LoadingIndicator />}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 sm:p-6 border-t border-slate-700 dark">
                            <div className="flex gap-3 max-w-4xl mx-auto">
                                <div className="flex-1 relative">
                                    <Input
                                        ref={inputRef}
                                        value={inputValue}
                                        onChange={(e) =>
                                            setInputValue(e.target.value)
                                        }
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type your message..."
                                        disabled={isLoading}
                                        className="bg-slate-800/50 border-slate-600 text-slate-100 placeholder-slate-400 pr-12 h-12 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || isLoading}
                                    size="icon"
                                    className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    <Send className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Empty state component
function EmptyState({ currentModel }: { currentModel?: { name: string } }) {
    return (
        <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/10">
                    <Bot className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-200 mb-2">
                    Ready to Chat
                </h3>
                <p className="text-slate-400 leading-relaxed">
                    Start a conversation with{" "}
                    <span className="text-blue-400 font-medium">
                        {currentModel?.name}
                    </span>
                    . Ask questions, get help, or just have a friendly chat!
                </p>
            </div>
        </div>
    );
}
