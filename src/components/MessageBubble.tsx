"use client";

import React, { useState } from "react";
import Markdown from "react-markdown";
import {
  Bot,
  User,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message } from "../types/chat";
import { formatTime } from "../utils/chat";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

interface MessageBubbleProps {
  message: Message;
  onCopy?: (content: string) => void;
  onReaction?: (messageId: string, reaction: "like" | "dislike") => void;
  onShare?: (messageId: string) => void;
}

export function MessageBubble({
  message,
  onCopy,
  onReaction,
  // onShare,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  // const [showActions, setShowActions] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      onCopy?.(message.content);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  const handleReaction = (reaction: "like" | "dislike") => {
    onReaction?.(message.id, reaction);
  };

  return (
    <div
      className={`group flex gap-2 sm:gap-3 mb-4 sm:mb-6 animate-fade-in ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/10">
          <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
        </div>
      )}

      <div
        className={`${
          isUser 
            ? 'max-w-[50%] sm:max-w-[55%] md:max-w-[60%] lg:max-w-[65%] xl:max-w-[70%]' 
            : 'max-w-[75%] sm:max-w-[80%] md:max-w-[85%] lg:max-w-[90%] xl:max-w-[95%]'
        } ${isUser ? "order-first" : ""} min-w-0`}
      >
        <div
          className={`rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-lg transition-all duration-200 hover:shadow-xl ${ 
            isUser
              ? "bg-foreground hover:bg-muted-foreground text-black ml-auto transform hover:scale-[1.02]"
              : "bg-secondary from-slate-800/80 to-slate-700/80 backdrop-blur-sm border border-white/5 text-slate-100 hover:border-white/10"
            }`}
        >
          {/* Message content */}
          <div className="text-sm sm:text-base break-words whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none overflow-wrap-anywhere prose-sm sm:prose-base">
            {/* Show loading spinner if assistant message is streaming and content is empty */}
            {!isUser && (message as any).isStreaming && !message.content && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="animate-spin w-5 h-5 text-blue-400" />
                <span className="ml-2 text-xs text-slate-400">Thinking...</span>
              </div>
            )}
            {/* Otherwise show the message content */}
            {(!((message as any).isStreaming && !message.content)) && (
              <Markdown
                components={{
                  code({ className, children, ...rest }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <div className="max-w-60 overflow-x-auto">
                      <SyntaxHighlighter
                        PreTag="div"
                        language={match[1]}
                        style={vscDarkPlus as any}
                        {...rest}
                        ref={null}
                        className="text-xs sm:text-sm !bg-transparent"
                      >
                        {String(children)}
                      </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code {...rest} className={`${className} text-xs sm:text-sm`}>
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => (
                    <p className="text-sm sm:text-base leading-relaxed">{children}</p>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-lg sm:text-xl font-bold">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base sm:text-lg font-bold">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm sm:text-base font-bold">{children}</h3>
                  ),
                }}
              >
                {message.content}
              </Markdown>
            )}
          </div>

          {/* Action buttons */}
          <div
            className={`mt-2 flex items-center gap-1 sm:gap-2 opacity-100 transition-opacity ${
              isUser ? "justify-end" : "justify-start"
            }`}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-5 w-5 sm:h-6 sm:w-6 bg-black/20 hover:bg-black/40 text-white/70 hover:text-white"
              title="Copy message"
            >
              {copied ? (
                <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              ) : (
                <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              )}
            </Button>
            {copied && (
              <span className="text-xs text-green-400 animate-fade-in">
                Copied!
              </span>
            )}

            {!isUser && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleReaction("like")}
                  className="h-5 w-5 sm:h-6 sm:w-6 bg-black/20 hover:bg-black/40 text-white/70 hover:text-green-400"
                  title="Like this response"
                >
                  <ThumbsUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleReaction("dislike")}
                  className="h-5 w-5 sm:h-6 sm:w-6 bg-black/20 hover:bg-black/40 text-white/70 hover:text-red-400"
                  title="Dislike this response"
                >
                  <ThumbsDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div
          className={`flex items-center gap-2 mt-1 sm:mt-2 ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          <p className="text-xs text-slate-400">
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>

      {isUser && (
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </div>
      )}
    </div>
  );
}
