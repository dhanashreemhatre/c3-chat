"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ArrowLeft,
    Bot,
    AlertCircle,
    Copy,
    Check,
    ExternalLink,
} from "lucide-react";
import { chatService, Chat } from "@/services/chatService";
import { MessageBubble } from "@/components/MessageBubble";
import { Message } from "@/types/chat";

interface SharedChatPageProps {
    params: { token: string };
}

export default function SharedChatPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copiedUrl, setCopiedUrl] = useState(false);

    useEffect(() => {
        if (token) {
            loadSharedChat();
        }
    }, [token]);

    const loadSharedChat = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get shared chat
            const sharedChat = await chatService.getSharedChat(token);
            setChat(sharedChat);

            // Get messages for the chat
            const chatMessages = await chatService.getChatMessages(
                sharedChat.id,
            );
            const formattedMessages: Message[] = chatMessages.map((msg) => ({
                id: msg.id,
                content: msg.content,
                role: msg.role,
                timestamp: new Date(msg.createdAt),
            }));

            setMessages(formattedMessages);
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to load shared chat";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const copyShareUrl = async () => {
        try {
            const url = window.location.href;
            await navigator.clipboard.writeText(url);
            setCopiedUrl(true);
            setTimeout(() => setCopiedUrl(false), 2000);
        } catch (error) {
            console.error("Failed to copy URL:", error);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading shared chat...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-slate-900 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-red-400 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Chat Not Found
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-300 mb-4">
                            {error === "Chat not found"
                                ? "This shared chat doesn't exist or has been removed."
                                : error}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => router.push("/")}
                                className="flex-1"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Go Home
                            </Button>
                            <Button
                                onClick={loadSharedChat}
                                variant="outline"
                                className="flex-1"
                            >
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!chat) {
        return null;
    }

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-4xl mx-auto p-4">
                {/* Header */}
                <Card className="mb-6 bg-slate-900/50 border-slate-700 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.push("/")}
                                    className="text-slate-400 hover:text-slate-100"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>

                                <div>
                                    <CardTitle className="text-xl text-slate-100">
                                        {chat.title || "Shared Chat"}
                                    </CardTitle>
                                    <p className="text-sm text-slate-400 mt-1">
                                        Shared on {formatDate(chat.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyShareUrl}
                                    className="text-slate-200 border-slate-600 hover:bg-slate-700"
                                >
                                    {copiedUrl ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copy Link
                                        </>
                                    )}
                                </Button>

                                <Button
                                    onClick={() => router.push("/chat")}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Start Your Own Chat
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Chat Messages */}
                <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
                    <CardContent className="p-0">
                        <ScrollArea className="h-[calc(100vh-12rem)]">
                            <div className="p-6">
                                {messages.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400">
                                        <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>This chat appears to be empty.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className="group"
                                            >
                                                <MessageBubble
                                                    message={message}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-slate-500 text-sm mb-2">
                        This is a shared conversation from C3Chat
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/")}
                            className="text-slate-400 hover:text-slate-100"
                        >
                            Learn More About C3Chat
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/chat")}
                            className="text-blue-400 hover:text-blue-300"
                        >
                            Create Your Own Chat
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
