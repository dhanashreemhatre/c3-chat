"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Bot,
  Globe,
  GlobeLock,
  Paperclip ,
  Share2,
  LogOut,
  Settings,
  PanelLeftOpen,
} from "lucide-react";
import { signOut } from "next-auth/react";

import { CHAT_MODELS } from "../../constants/models";
import { MessageBubble } from "../MessageBubble";
import ModelSelector from "../ModelSelector";
import ChatSidebar from "../ChatSidebar";
import ApiKeyManager from "../ApiKeyManager";
import FileUpload, { UploadedFile } from "../FileUpload";
import SettingsModal from "../SettingsModal"; // Import SettingsModal
import { useChatContext } from "../../contexts/ChatContext";

export default function ChatInterface() {
  const { state, dispatch, sendMessage, shareChat } = useChatContext();

  const [inputValue, setInputValue] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showApiKeyManager, setShowApiKeyManager] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // New state for settings modal
  // const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector(
          "[data-radix-scroll-area-viewport]",
        ) as HTMLElement;

        if (scrollContainer) {
          // Use setTimeout to ensure the DOM has updated
          setTimeout(() => {
            scrollContainer.scrollTo({
              top: scrollContainer.scrollHeight,
              behavior: "smooth",
            });
          }, 100);
        }
      }
    };

    // Scroll when messages change or loading state changes
    if (state.messages.length > 0) {
      scrollToBottom();
    }
  }, [state.messages, state.isLoading]);

  // Focus input after loading
  useEffect(() => {
    if (!state.isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state.isLoading]);

  // --- START: VIRTUAL KEYBOARD HANDLING ---
  // Add this useEffect to handle the virtual keyboard on mobile devices.
  useEffect(() => {
    // This tells the browser we will handle content occlusion by the virtual keyboard.
    if ("virtualKeyboard" in navigator) {
      (navigator as Navigator & { virtualKeyboard: { overlaysContent: boolean } }).virtualKeyboard.overlaysContent = true;
    }
  }, []);
  // --- END: VIRTUAL KEYBOARD HANDLING ---


  // Handle sending messages
  const handleSendMessage = async () => {
    // console.log("handleSendMessage called with inputValue:", inputValue);
    // console.log("Current messages before sending:", state.messages);
    // console.log("Current loading state:", state.isLoading);

    if (!inputValue.trim() || state.isLoading) return;

    const content = inputValue.trim();
    const title =
      state.messages.length === 0 ? generateChatTitle(content) : undefined;

    setInputValue("");

    try {
      console.log("Sending message:", content);
      await sendMessage(content, title);
      console.log("Message sent, new messages:", state.messages);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Generate a title from the first message
  const generateChatTitle = (content: string): string => {
    return content.length > 50 ? content.substring(0, 50) + "..." : content;
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Copy message content to clipboard
  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // Visual feedback handled by MessageBubble
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  // Handle message reactions
  const handleMessageReaction = (
    messageId: string,
    reaction: "like" | "dislike",
  ) => {
    // In a full implementation, this would send the reaction to the backend
    console.log(`Reaction: ${reaction} for message ${messageId}`);
  };

  // Handle sharing individual messages
  const handleShareMessage = (messageId: string) => {
    const message = state.messages.find((m) => m.id === messageId);
    if (message) {
      navigator.clipboard.writeText(message.content);
      // Could implement proper message sharing here
    }
  };

  // Handle sharing entire chat
  const handleShareChat = async () => {
    if (!state.currentChatId) return;

    try {
      const token = await shareChat(state.currentChatId);
      setShareToken(token);
      const shareUrl = `${window.location.origin}/shared/${token}`;
      navigator.clipboard.writeText(shareUrl);
    } catch (error) {
      console.error("Failed to share chat:", error);
    }
  };

  // Toggle search mode
  const toggleSearch = () => {
    dispatch({
      type: "SET_SEARCH_ENABLED",
      payload: !state.searchEnabled,
    });
  };

  // Handle file upload
  const handleFileUploaded = (file: UploadedFile) => {
    // In a full implementation, this would notify the user
    console.log("File uploaded:", file);
  };

  const currentModel = CHAT_MODELS.find((m) => m.id === state.selectedModel);

  // Only allow sidebar to open if it's not already open
  const handleSidebarToggle = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div
      className={`bg-black flex sm:min-h-0 min-h-[100dvh] h-[100dvh] sm:h-screen transition-all duration-300 ${
        sidebarOpen ? "" : "w-full"
      }`}
      style={{
        boxSizing: "border-box",
      }}
    >
      {/* Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggleAction={handleSidebarToggle}
      />

      {/* Main Chat Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-0 transition-all duration-300 ${
          sidebarOpen ? "" : "max-w-full"
        }`}
      >
        <div className="flex flex-col h-full w-full mx-auto px-2 sm:px-4 lg:px-6 xl:max-w-6xl">
          {/* Header */}
          <Card className="my-0 bg-transparent w-full">
            <CardHeader className="pb-1">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex justify-between gap-2 w-full">
                  {/* Title And Menu */}
                  <div className="flex items-center gap-2 min-w-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (!sidebarOpen) setSidebarOpen(true);
                      }}
                      className="text-slate-400 hover:text-slate-100 hover:dark md:hidden flex-shrink-0"
                    >
                      <PanelLeftOpen className="w-8 h-8" />
                    </Button>
                    <CardTitle className="text-xl text-slate-100 truncate">
                      C3Chat AI Assistant
                    </CardTitle>
                  </div>
                  {/* Logout and Settings */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Logout Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>

                    {/* Settings Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSettings(true)}
                      className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                      title="Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

              </div>
            </CardHeader>
          </Card>

          {/* Error Display
          {state.error && (
            <Card className="mx-2 sm:mx-4 lg:mx-6 mb-4 bg-red-900/20 border-red-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{state.error}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      dispatch({
                        type: "SET_ERROR",
                        payload: null,
                      })
                    }
                    className="ml-auto text-red-400 hover:text-red-300"
                  >
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          )} */}

          {/* Chat Messages */}
          <Card className="flex-1 flex flex-col mb-2 dark border-border backdrop-blur-sm shadow-2xl overflow-x-scroll">
            <CardContent className="flex-1 p-0 flex flex-col min-h-0 w-full">
              <ScrollArea className="flex-1 min-h-0 w-full" ref={scrollAreaRef}>
                <div className="p-2 sm:p-4 md:p-6 space-y-4 w-full">
                  {(() => {

                    if (state.messages.length === 0 && !state.isLoading) {
                      // console.log("Showing EmptyState");
                      return (
                        <EmptyState
                          currentModel={currentModel}
                          onStartChat={() => inputRef.current?.focus()}
                          searchEnabled={state.searchEnabled}
                          onSuggestionClick={(suggestion) => {
                            setInputValue(suggestion);
                            inputRef.current?.focus();
                          }}
                        />
                      );
                    } else if (
                      state.messages.length === 0 &&
                      state.isLoading &&
                      state.currentChatId
                    ) {
                      // console.log("Showing chat loading screen");
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
                            <span className="text-slate-400 text-sm">
                              Loading chat...
                            </span>
                          </div>
                        </div>
                      );
                    } else {
                      // console.log(
                      //   "Showing messages area with",
                      //   state.messages.length,
                      //   "messages",
                      // );
                      return (
                        <div className="space-y-4 sm:space-y-6 w-full">
                          {state.messages.map((message, index) => (
                            <div
                              key={message.id || index}
                              className="w-full max-w-full"
                            >
                              <MessageBubble
                                message={message}
                                onCopy={handleCopyMessage}
                                onReaction={handleMessageReaction}
                                onShare={handleShareMessage}
                              />
                            </div>
                          ))}
                        </div>
                      );
                    }
                  })()}
                </div>
              </ScrollArea>

              {/* Input area */}
              <div
                className="sticky inset-x-0 bottom-0 z-20 transition-all duration-200 ease-in-out w-full"
                style={{
                  paddingBottom: "env(keyboard-inset-height, 0px)",
                }}
              >
                {/* Input Area */}
                <div className="p-4 sm:p-4 pb-2 sm:pb-2 border-t border-border dark flex-shrink-0 w-full">
                  <div className="flex gap-2 w-full">
                    <div className="flex-1 relative min-w-0">
                      <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                          state.searchEnabled
                            ? "Ask me anything... (Web search enabled)"
                            : "Type your message..."
                        }
                        disabled={state.isLoading}
                        className="dark border-border text-slate-100 placeholder-slate-400 pr-12 h-10 sm:h-12 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all w-full"
                      />
                    </div>

                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || state.isLoading}
                      size="icon"
                      className="h-10 sm:h-12 w-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex-shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-start mt-1 text-xs text-slate-500 flex-wrap gap-1">
                    {/* File Paperclip Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowFileUpload(true)}
                      className="text-slate-400 hover:text-slate-100 hover:bg-slate-800 flex-shrink-0"
                      title="Upload Files"
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>

                    {/* Search Toggle */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleSearch}
                      className={`text-slate-400 hover:text-slate-100 hover:bg-slate-800 flex-shrink-0 ${
                        state.searchEnabled ? "text-green-400" : ""
                      }`}
                      title={
                        state.searchEnabled
                          ? "Disable Web Search"
                          : "Enable Web Search"
                      }
                    >
                      {state.searchEnabled ? (
                        <Globe className="w-4 h-4" />
                      ) : (
                        <GlobeLock className="w-4 h-4" />
                      )}
                    </Button>
                    
                    {/* Share Chat */}
                    {state.currentChatId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleShareChat}
                        className="text-slate-400 hover:text-slate-100 hover:bg-slate-800 flex-shrink-0"
                        title="Share Chat"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    )}

                    <div className="flex-1 min-w-0">
                      <ModelSelector />
                    </div>

                    {/* Chat info */}
                    {state.currentChatId && (
                      <div className="hidden sm:block text-center text-xs text-slate-500 mt-1 truncate">
                        Chat ID: {state.currentChatId}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Components */}
      <ApiKeyManager
        isOpen={showApiKeyManager}
        onClose={() => setShowApiKeyManager(false)}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <FileUpload
        isOpen={showFileUpload}
        onCloseAction={() => setShowFileUpload(false)}
        onFileUploaded={handleFileUploaded}
      />

      {/* Share Token Modal */}
      {shareToken && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Chat Shared!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">
                Your chat has been shared. The link has been copied to your
                clipboard.
              </p>
              <div className="bg-slate-700 p-3 rounded text-sm text-slate-300 break-all mb-4">
                {`${window.location.origin}/shared/${shareToken}`}
              </div>
              <Button onClick={() => setShareToken(null)} className="w-full">
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Empty state component
function EmptyState({
  currentModel,
  searchEnabled,
  onSuggestionClick,
}: {
  currentModel?: { name: string };
  onStartChat: () => void;
  searchEnabled: boolean;
  onSuggestionClick: (suggestion: string) => void;
}) {
  const suggestions = [
    "What's the weather like today?",
    "Explain quantum computing",
    "Write a Python function to sort a list",
    "What are the latest AI developments?",
    "Help me plan a trip to Japan",
    "Explain blockchain technology",
  ];

  return (
     <ScrollArea className="min-h-0 sm:h-full w-full flex">
    <div className="flex items-center justify-center text-slate-400">
     
        <div className="text-center max-w-2xl px-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/10">
            <Bot className="w-10 h-10 text-blue-400" />
          </div>

          <h3 className="text-xl font-semibold text-slate-200 mb-2">
            Ready to Chat
          </h3>

          <p className="text-slate-400 leading-relaxed mb-6">
            Start a conversation with{" "}
            <span className="text-blue-400 font-medium">
              {currentModel?.name}
            </span>
            . Ask questions, get help, or just have a friendly chat!
            {searchEnabled && (
              <span className="block mt-2 text-green-400">
                <Globe className="w-4 h-4 inline mr-1" />
                Web search is enabled for real-time information
              </span>
            )}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => onSuggestionClick(suggestion)}
                className="text-left text-slate-300 border-slate-600 hover:bg-slate-800 hover:border-slate-500 p-3 h-auto whitespace-normal"
              >
                {suggestion}
              </Button>
            ))}
          </div>

          <div className="text-xs text-slate-500">
            <p>
              Tip: Use web search for current events and real-time information
            </p>
          </div>
        </div>
     
    </div>
     </ScrollArea>
  );
}