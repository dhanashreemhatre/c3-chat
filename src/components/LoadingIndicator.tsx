import { Bot } from "lucide-react";

export function LoadingIndicator() {
    return (
        <div className="flex gap-3 justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/10">
                <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/5">
                <div className="flex gap-1">
                    <div
                        className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                        style={{ animationDelay: "0ms" }}
                    />
                    <div
                        className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                        style={{ animationDelay: "150ms" }}
                    />
                    <div
                        className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                        style={{ animationDelay: "300ms" }}
                    />
                </div>
            </div>
        </div>
    );
}
