import { MessageBubble } from "../../MessageBubble";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import { Message } from "../../../types/chat";


interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  currentChatId?: string;
  currentModel?: { name: string };
  searchEnabled: boolean;
  onStartChat: () => void;
  onSuggestionClick: (suggestion: string) => void;
  onCopyMessage: (content: string) => Promise<void>;
  onMessageReaction: (messageId: string, reaction: "like" | "dislike") => void;
  onShareMessage: (messageId: string) => void;
}

export function ChatMessages({
  messages,
  isLoading,
  currentChatId,
  currentModel,
  searchEnabled,
  onStartChat,
  onSuggestionClick,
  onCopyMessage,
  onMessageReaction,
  onShareMessage,
}: ChatMessagesProps) {
  if (messages.length === 0 && !isLoading) {
    return (
      <EmptyState
        currentModel={currentModel}
        onStartChat={onStartChat}
        searchEnabled={searchEnabled}
        onSuggestionClick={onSuggestionClick}
      />
    );
  }

  if (messages.length === 0 && isLoading && currentChatId) {
    return <LoadingState message="Loading chat..." />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {messages.map((message, index) => (
        <div key={message.id || index} className="w-full max-w-full">
          <MessageBubble
            message={message}
            onCopy={onCopyMessage}
            onReaction={onMessageReaction}
            onShare={onShareMessage}
          />
        </div>
      ))}
    </div>
  );
}