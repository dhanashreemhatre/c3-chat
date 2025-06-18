import { Card } from "@/components/ui/card";
import ChatSidebar from "../../ChatSidebar";
import { ChatHeader } from "./ChatHeader";
import { ChatContent } from "./ChatContent";

import type { Message } from "@/types/chat";

interface ChatLayoutProps {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  onSettingsClick: () => void;
  messages: Message[];
  isLoading: boolean;
  currentChatId?: string;
  currentModel?: { name: string };
  searchEnabled: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onToggleSearch: () => void;
  onFileUpload: () => void;
  onShareChat: () => void;
  onStartChat: () => void;
  onSuggestionClick: (suggestion: string) => void;
  onCopyMessage: (content: string) => Promise<void>;
  onMessageReaction: (messageId: string, reaction: "like" | "dislike") => void;
  onShareMessage: (messageId: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
}

export function ChatLayout({
  sidebarOpen,
  onSidebarToggle,
  onSettingsClick,
  messages,
  isLoading,
  currentChatId,
  currentModel,
  searchEnabled,
  inputValue,
  onInputChange,
  onSubmit,
  onKeyDown,
  onToggleSearch,
  onFileUpload,
  onStartChat,
  onSuggestionClick,
  onCopyMessage,
  onMessageReaction,
  onShareMessage,
  inputRef,
}: ChatLayoutProps) {
  return (
    <div
      className={`bg-black flex sm:min-h-0 min-h-[100dvh] h-[100dvh] sm:h-screen transition-all duration-300 ${
        sidebarOpen ? "" : "w-full"
      }`}
      style={{ boxSizing: "border-box" }}
    >
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggleAction={() => onSidebarToggle()}
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
              onSidebarToggle={() => onSidebarToggle()}
              onSettingsClick={onSettingsClick}
            />
          </Card>

          <ChatContent
            messages={messages}
            isLoading={isLoading}
            currentChatId={currentChatId}
            currentModel={currentModel}
            searchEnabled={searchEnabled}
            inputValue={inputValue}
            onInputChange={onInputChange}
            onSubmit={onSubmit}
            onKeyDown={onKeyDown}
            onToggleSearch={onToggleSearch}
            onFileUpload={onFileUpload}
            onStartChat={onStartChat}
            onSuggestionClick={onSuggestionClick}
            onCopyMessage={onCopyMessage}
            onMessageReaction={onMessageReaction}
            onShareMessage={onShareMessage}
            inputRef={inputRef} onShareChat={function (): Promise<string | null> {
              throw new Error("Function not implemented.");
            } }          />
        </div>
      </div>
    </div>
  );
}