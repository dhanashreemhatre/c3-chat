import { Bot, User } from "lucide-react";
import { Message } from "../types/chat";
import { formatTime } from "../utils/chat";

interface MessageBubbleProps {
    message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === "user";

    return (
        <div
            className={`flex gap-3 mb-4 animate-fade-in ${isUser ? "justify-end" : "justify-start"}`}
        >
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/10">
                    <Bot className="w-4 h-4 text-blue-400" />
                </div>
            )}

            <div
                className={`max-w-[85%] sm:max-w-[70%] ${isUser ? "order-first" : ""}`}
            >
                <div
                    className={`rounded-2xl px-4 py-3 shadow-lg transition-all duration-200 hover:shadow-xl ${
                        isUser
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto transform hover:scale-[1.02]"
                            : "bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm border border-white/5 text-slate-100 hover:border-white/10"
                    }`}
                >
                    <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                    </p>
                </div>

                <p
                    className={`text-xs text-slate-400 mt-2 ${isUser ? "text-right" : "text-left"}`}
                >
                    {formatTime(message.timestamp)}
                </p>
            </div>

            {isUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <User className="w-4 h-4 text-white" />
                </div>
            )}
        </div>
    );
}
