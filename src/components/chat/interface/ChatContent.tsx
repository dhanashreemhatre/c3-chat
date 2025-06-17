import { useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { Message } from "../../../types/chat";


interface ChatContentProps {
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
  onShareChat: () => Promise<string | null>;
  onStartChat: () => void;
  onSuggestionClick: (suggestion: string) => void;
  onCopyMessage: (content: string) => Promise<void>;
  onMessageReaction: (messageId: string, reaction: "like" | "dislike") => void;
  onShareMessage: (messageId: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
}

export function ChatContent({
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
  onShareChat,
  onStartChat,
  onSuggestionClick,
  onCopyMessage,
  onMessageReaction,
  onShareMessage,
  inputRef,
}: ChatContentProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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

    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  return (
    <Card className="flex-1 flex flex-col mb-2 dark border-border backdrop-blur-sm shadow-2xl overflow-x-scroll">
      <CardContent className="flex-1 p-0 flex flex-col min-h-0 w-full">
        <ScrollArea className="flex-1 min-h-0 w-full" ref={scrollAreaRef}>
          <div className="p-2 sm:p-4 md:p-6 space-y-4 w-full">
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              currentChatId={currentChatId}
              currentModel={currentModel}
              searchEnabled={searchEnabled}
              onStartChat={onStartChat}
              onSuggestionClick={onSuggestionClick}
              onCopyMessage={onCopyMessage}
              onMessageReaction={onMessageReaction}
              onShareMessage={onShareMessage}
            />
          </div>
        </ScrollArea>

        <ChatInput
          inputValue={inputValue}
          onInputChange={onInputChange}
          onSubmit={onSubmit}
          onKeyDown={onKeyDown}
          isLoading={isLoading}
          searchEnabled={searchEnabled}
          onToggleSearch={onToggleSearch}
          onFileUpload={onFileUpload}
          onShareChat={onShareChat}
          currentChatId={currentChatId}
          inputRef={inputRef}
        />
      </CardContent>
    </Card>
  );
}