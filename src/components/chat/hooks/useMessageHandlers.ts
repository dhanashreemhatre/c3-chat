import { useCallback } from 'react';
import { useChatContext } from '../../../contexts/ChatContext';

export function useMessageHandlers() {
  const { state, sendMessage, shareChat } = useChatContext();

  const handleSendMessage = useCallback(async (content: string, clearInput: () => void) => {
    if (!content.trim() || state.isLoading) return;

    const title = state.messages.length === 0 ? generateChatTitle(content) : undefined;
    clearInput();

    try {
      await sendMessage(content, title);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }, [state.isLoading, state.messages.length, sendMessage]);

  const handleShareChat = useCallback(async () => {
    if (!state.currentChatId) return;

    try {
      const token = await shareChat(state.currentChatId);
      const shareUrl = `${window.location.origin}/shared/${token}`;
      navigator.clipboard.writeText(shareUrl);
      return token;
    } catch (error) {
      console.error("Failed to share chat:", error);
      throw error;
    }
  }, [state.currentChatId, shareChat]);

  return {
    handleSendMessage,
    handleShareChat
  };
}

function generateChatTitle(content: string): string {
  return content.length > 50 ? content.substring(0, 50) + "..." : content;
}