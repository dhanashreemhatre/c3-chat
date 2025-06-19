"use client";

import { useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import { CHAT_MODELS } from "../../constants/models";
import { MessageBubble } from "../MessageBubble";
import ChatSidebar from "../ChatSidebar";
import FileUpload, { UploadedFile } from "../FileUpload";
import SettingsModal from "../settings/SettingsModal";
import { useChatContext } from "../../contexts/ChatContext";

// Import new components and hooks
import { ChatHeader } from "./interface/ChatHeader";
import { EmptyState } from "./interface/EmptyState";
import { ShareTokenModal } from "./interface/ShareTokenModal";
import { useChatInput } from "./hooks/useChatInput";
import { useUIState } from "./hooks/useUIState";
import { useMessageHandlers } from "./hooks/useMessageHandlers";
import { ChatInput } from "./interface/ChatInput";
import { getModelRequestParams } from "../../utils/modelUtils";

export default function ChatInterface() {
  const { state, dispatch } = useChatContext();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const { inputValue, setInputValue, inputRef, clearInput, focusInput, handleKeyDown } = useChatInput();
  const { 
    sidebarOpen, setSidebarOpen, 
    showSettings, setShowSettings,
    showFileUpload, setShowFileUpload,
    shareToken, setShareToken 
  } = useUIState();
  const { handleSendMessage, handleShareChat } = useMessageHandlers();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector(
          "[data-radix-scroll-area-viewport]",
        ) as HTMLElement;

        if (scrollContainer) {
          setTimeout(() => {
            scrollContainer.scrollTo({
              top: scrollContainer.scrollHeight,
              behavior: "smooth",
            });
          }, 100);
        }
      }
    };

    if (state.messages.length > 0) {
      scrollToBottom();
    }
  }, [state.messages, state.isLoading]);

  // Focus input after loading
  useEffect(() => {
    if (!state.isLoading) {
      focusInput();
    }
  }, [state.isLoading, focusInput]);

  // Virtual keyboard handling
  useEffect(() => {
    if ("virtualKeyboard" in navigator) {
      (navigator as Navigator & { virtualKeyboard: { overlaysContent: boolean } }).virtualKeyboard.overlaysContent = true;
    }
  }, []);

  // Event handlers
  const onSubmit = () => handleSendMessage(inputValue, clearInput);
  const onKeyDownHandler = (e: React.KeyboardEvent) => handleKeyDown(e, onSubmit);
  const onToggleSearch = () => dispatch({ type: "SET_SEARCH_ENABLED", payload: !state.searchEnabled });
  const onShareChatHandler = async (): Promise<string | null> => {
    try {
      const token = await handleShareChat();
      setShareToken(token ?? null); // Convert undefined to null
      return token ?? null;
    } catch (error) {
      // Handle error
      return null;
    }
  };

  // Message handlers
  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  const handleMessageReaction = (messageId: string, reaction: "like" | "dislike") => {
    console.log(`Reaction: ${reaction} for message ${messageId}`);
  };

  const handleShareMessage = (messageId: string) => {
    const message = state.messages.find((m) => m.id === messageId);
    if (message) {
      navigator.clipboard.writeText(message.content);
    }
  };

  const handleFileUploaded = (file: UploadedFile) => {
    console.log("File uploaded:", file);
  };

  let normalizedProvider = "google";
  try {
    if (state.selectedModel && CHAT_MODELS.some(m => m.id === state.selectedModel)) {
      normalizedProvider = getModelRequestParams(state.selectedModel).provider.toLowerCase();
    }
  } catch (e) {
    console.error("Could not normalize provider for model:", state.selectedModel, e);
  }

  return (
    <div
      className={`bg-black flex sm:min-h-0 min-h-[100dvh] h-[100dvh] sm:h-screen transition-all duration-300 ${
        sidebarOpen ? "" : "w-full"
      }`}
      style={{ boxSizing: "border-box" }}
    >
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggleAction={() => setSidebarOpen(prev => !prev)}
      />

      <div
        className={`flex-1 flex flex-col min-w-0 min-h-0 transition-all duration-300 ${
          sidebarOpen ? "" : "max-w-full"
        }`}
      >
        <div className="flex flex-col h-full w-full mx-auto px-2 sm:px-4 lg:px-6 xl:max-w-6xl">
          <Card className="my-0 bg-transparent w-full">
            <ChatHeader
              sidebarOpen={sidebarOpen}
              onSidebarToggle={() => setSidebarOpen(true)}
              onSettingsClick={() => setShowSettings(true)}
            />
          </Card>

          <Card className="flex-1 flex flex-col mb-2 dark border-border backdrop-blur-sm shadow-2xl overflow-x-scroll">
            <CardContent className="flex-1 p-0 flex flex-col min-h-0 w-full">
              <ScrollArea className="flex-1 min-h-0 w-full" ref={scrollAreaRef}>
                <div className="p-2 sm:p-4 md:p-6 space-y-4 w-full">
                  {(() => {
                    if (state.messages.length === 0 && !state.isLoading) {
                      return (
                        <EmptyState
                          currentModel={CHAT_MODELS.find((m) => m.id === state.selectedModel)}
                          onStartChat={focusInput}
                          searchEnabled={state.searchEnabled}
                          onSuggestionClick={(suggestion) => {
                            setInputValue(suggestion);
                            focusInput();
                          }}
                        />
                      );
                    } else if (state.messages.length === 0 && state.isLoading && state.currentChatId) {
                      return (
                        <div className="flex items-center justify-center h-full">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="flex space-x-1">
                              <div className="w-3 h-3 bg-slate-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-3 h-3 bg-slate-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-3 h-3 bg-slate-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                            <span className="text-slate-400 text-sm">Loading chat...</span>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="space-y-4 sm:space-y-6 w-full">
                          {state.messages.map((message, index) => (
                            <div key={message.id || index} className="w-full max-w-full">
                              <MessageBubble
                                message={message}
                                onCopy={handleCopyMessage}
                                onReaction={handleMessageReaction}
                                onShare={handleShareMessage}
                                chatContext={state.messages}
                                model={state.selectedModel}
                                provider={normalizedProvider}
                              />
                            </div>
                          ))}
                        </div>
                      );
                    }
                  })()}
                </div>
              </ScrollArea>

              <ChatInput
                inputValue={inputValue}
                onInputChange={setInputValue}
                onSubmit={onSubmit}
                onKeyDown={onKeyDownHandler}
                isLoading={state.isLoading}
                searchEnabled={state.searchEnabled}
                onToggleSearch={onToggleSearch}
                onFileUpload={() => setShowFileUpload(true)}
                onShareChat={onShareChatHandler}
                currentChatId={state.currentChatId ?? undefined}
                inputRef={inputRef}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <FileUpload
        isOpen={showFileUpload}
        onCloseAction={() => setShowFileUpload(false)}
        onFileUploaded={handleFileUploaded}
      />

      <ShareTokenModal
        shareToken={shareToken}
        onClose={() => setShareToken(null)}
      />
    </div>
  );
}