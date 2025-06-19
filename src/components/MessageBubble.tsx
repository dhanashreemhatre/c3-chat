"use client";

import React, { useState, useRef } from "react";
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
import { MarkdownParser } from "./markdown/CustomMarkdown";
import { createPortal } from "react-dom";

interface MessageBubbleProps {
  message: Message;
  onCopy?: (content: string) => void;
  onReaction?: (messageId: string, reaction: "like" | "dislike") => void;
  onShare?: (messageId: string) => void;
  chatContext?: Message[];
  model?: string;
  provider?: string;
}

export function MessageBubble({
  message,
  onCopy,
  onReaction,
  // onShare,
  chatContext,
  model,
  provider,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // New state for expansion
  // const [showActions, setShowActions] = useState(false);
  const isUser = message.role === "user";

  // --- New state for explain popup ---
  const [selectedText, setSelectedText] = useState("");
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupLock, setPopupLock] = useState(false); // NEW

  // --- Handler for text selection ---
  const handleMouseUp = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (!selection) return;
    const text = selection.toString();
    if (text && contentRef.current && selection.anchorNode && contentRef.current.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      // Position relative to viewport, adjust for scroll
      setPopupPosition({ x: rect.left + rect.width / 2, y: rect.top - 8 + window.scrollY });
      setSelectedText(text);
      setShowPopup(true);
    } else {
      setShowPopup(false);
      setSelectedText("");
    }
  };

  // --- Handler for explain action ---
  const handleExplain = async () => {
    console.log('[Explain] handleExplain called');
    console.log('[Explain] selectedText:', selectedText);
    console.log('[Explain] chatContext:', chatContext);
    setIsLoadingExplanation(true);
    setExplainError(null);
    setShowModal(true);
    setShowPopup(false);
    window.getSelection()?.removeAllRanges();
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedText,
          chatContext: (chatContext || []).map(m => ({ role: m.role, content: m.content })),
          model,
          provider,
        }),
      });
      console.log('[Explain] API response status:', res.status);
      if (!res.ok) {
        const data = await res.json();
        console.log('[Explain] API error response:', data);
        throw new Error(data.error || "Failed to fetch explanation");
      }
      const data = await res.json();
      console.log('[Explain] API success response:', data);
      setExplanation(data.explanation || "No explanation returned.");
    } catch (err: any) {
      console.error('[Explain] API call failed:', err);
      setExplainError(err.message || "Failed to fetch explanation");
      setExplanation("");
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  // --- Handler to close modal ---
  const handleCloseModal = () => {
    setShowModal(false);
    setExplanation("");
  };

  // --- Dismiss popup on scroll or click elsewhere ---
  React.useEffect(() => {
    const handleScrollOrClick = (e: MouseEvent | Event) => {
      // Only dismiss if click is outside the popup and not locked
      if (popupLock) {
        // If locked, do not close
        return;
      }
      if (e instanceof MouseEvent && popupRef.current && e.target && popupRef.current.contains(e.target as Node)) {
        // Clicked inside popup, do nothing
        return;
      }
      setShowPopup(false);
      setSelectedText("");
    };
    if (showPopup) {
      window.addEventListener("scroll", handleScrollOrClick, true);
      window.addEventListener("mousedown", handleScrollOrClick, true);
    }
    return () => {
      window.removeEventListener("scroll", handleScrollOrClick, true);
      window.removeEventListener("mousedown", handleScrollOrClick, true);
    };
  }, [showPopup]);

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

  const MAX_LENGTH = 100;
  const isTruncated = isUser && message.content.length > MAX_LENGTH && !isExpanded;
  const displayContent = isTruncated
    ? `${message.content.substring(0, MAX_LENGTH)}...`
    : message.content;

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
          <div className="text-sm sm:text-base break-words whitespace-pre-wrap leading-relaxed
                       prose prose-invert prose-sm sm:prose-base
                       prose-p:mt-0 prose-p:mb-1 max-w-none overflow-wrap-anywhere"
           ref={contentRef}
           onMouseUp={handleMouseUp}
           >
            {/* Show loading spinner if assistant message is streaming and content is empty */}
            {!isUser && (message as any).isStreaming && !message.content && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="animate-spin w-5 h-5 text-blue-400" />
                <span className="ml-2 text-xs text-slate-400">Thinking...</span>
              </div>
            )}
            {/* Otherwise show the message content */}
            {(!((message as any).isStreaming && !message.content)) && (
              <MarkdownParser
                content={displayContent}/>
            )}
          </div>
          {isTruncated && (
            <Button
              variant="link"
              className="text-blue-400 font-bold hover:text-blue-300 p-0 h-auto text-xs sm:text-sm mt-1"
              onClick={() => setIsExpanded(true)}
            >
              Read more
            </Button>
          )}

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

      {/* --- Popup for Explain --- */}
      {showPopup && popupPosition && createPortal(
        <div
          ref={popupRef}
          style={{
            position: "absolute",
            left: popupPosition.x,
            top: popupPosition.y,
            zIndex: 9999,
            background: "#222",
            color: "#fff",
            borderRadius: 6,
            padding: "4px 10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            transform: "translate(-50%, -100%)",
            fontSize: 14,
            cursor: "pointer"
          }}
          onMouseDown={() => {
            console.log('[Explain] Popup mouse down');
            handleExplain();
          }}
        >
          Explain
        </div>,
        document.body
      )}

      {/* --- Modal for Explanation --- */}
      {showModal && createPortal(
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(20,20,20,0.7)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
          onClick={handleCloseModal}
        >
          <div style={{
            background: "#111",
            color: "#fff",
            borderRadius: 14,
            padding: 28,
            minWidth: 320,
            maxWidth: 480,
            boxShadow: "0 4px 32px rgba(0,0,0,0.28)",
            border: "1px solid #222",
            position: "relative"
          }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{marginTop:0, marginBottom:16, fontWeight:700, fontSize:20, letterSpacing: -0.5}}>Explanation</h3>
            <div style={{marginBottom:20, fontSize:16, lineHeight:1.6}}>
              {isLoadingExplanation ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 48 }}>
                  <Loader2 className="animate-spin" style={{ width: 32, height: 32, color: '#fff', opacity: 0.85 }} />
                </span>
              ) : explainError ? (
                <span style={{ color: '#ff5555' }}>{explainError}</span>
              ) : (
                explanation
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
