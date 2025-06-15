"use client";

import React, { useState } from "react";
import {
  Bot,
  User,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message } from "../types/chat";
import { formatTime } from "../utils/chat";

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


  const renderContent = (content: string) => {
    // Simple markdown-like rendering
    let processedContent = content;

    // Bold text
    processedContent = processedContent.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>",
    );

    // Italic text
    processedContent = processedContent.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Code blocks
    processedContent = processedContent.replace(
      /```([\s\S]*?)```/g,
      '<pre class="bg-slate-800 p-3 rounded-lg my-2 overflow-x-auto"><code>$1</code></pre>',
    );

    // Inline code
    processedContent = processedContent.replace(
      /`([^`]+)`/g,
      '<code class="bg-slate-700 px-1.5 py-0.5 rounded text-sm">$1</code>',
    );

    // Links
    processedContent = processedContent.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>',
    );

    // Lists
    processedContent = processedContent.replace(
      /^- (.+)$/gm,
      '<li class="ml-4">$1</li>',
    );
    processedContent = processedContent.replace(
      /(<li.*<\/li>)/,
      '<ul class="list-disc list-inside space-y-1">$1</ul>',
    );

    // Numbered lists
    processedContent = processedContent.replace(
      /^(\d+)\. (.+)$/gm,
      '<li class="ml-4">$2</li>',
    );
    processedContent = processedContent.replace(
      /(<li.*<\/li>)/g, // Removed 's' flag for compatibility with older targets
      '<ol class="list-decimal list-inside space-y-1">$1</ol>',
    );
    // Ensure list regexes for ul and ol don't conflict if both are present or one after another.
    // The current replacement might wrap individual li items in separate ul/ol.
    // A more robust markdown parser would be better for complex cases.
    // For simplicity, assuming lists are not immediately consecutive or nested in a way that breaks this.

    return processedContent;
  };

  return (
    <div
      className={`group flex gap-3 mb-6 animate-fade-in ${isUser ? "justify-end" : "justify-start"}`}
    // onMouseEnter={() => setShowActions(true)}
    // onMouseLeave={() => setShowActions(false)}
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
          className={`rounded-2xl px-4 py-3 shadow-lg transition-all duration-200 hover:shadow-xl ${ // Removed 'relative'
            isUser
              ? "bg-foreground hover:bg-muted-foreground text-black ml-auto transform hover:scale-[1.02]"
              : "bg-secondary from-slate-800/80 to-slate-700/80 backdrop-blur-sm border border-white/5 text-slate-100 hover:border-white/10"
            }`}
        >
          {/* Message content */}
          <div
            className="break-words whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: renderContent(message.content),
            }}
          />

          {/* Action buttons */}

          <div
            className={`mt-2 flex items-center gap-2 opacity-100 transition-opacity ${isUser ? "justify-end" : "justify-start"
              }`}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-6 w-6 bg-black/20 hover:bg-black/40 text-white/70 hover:text-white"
              title="Copy message"
            >
              {copied ? (
                <Check className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
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
                  className="h-6 w-6 bg-black/20 hover:bg-black/40 text-white/70 hover:text-green-400"
                  title="Like this response"
                >
                  <ThumbsUp className="w-3 h-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleReaction("dislike")}
                  className="h-6 w-6 bg-black/20 hover:bg-black/40 text-white/70 hover:text-red-400"
                  title="Dislike this response"
                >
                  <ThumbsDown className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>

        </div>

        {/* Timestamp */}
        <div
          className={`flex items-center gap-2 mt-2 ${isUser ? "justify-end" : "justify-start"}`}
        >
          <p className="text-xs text-slate-400">
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}
