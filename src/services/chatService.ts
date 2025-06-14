import { Message } from '../types/chat';

export interface ChatResponse {
  reply: string;
  chatId: string;
  searchResults?: any;
}

export interface Chat {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  shareToken?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  provider: string;
  createdAt: string;
}
interface SendMessageParams {
  messages: Message[];
  modelId: string;
  provider: string;  // We'll still take this but override it with the correct value
  chatId?: string;
  title?: string;
  search?: boolean;
}

interface SendMessageResponse {
  reply: string;
  chatId: string;
  citations?: any[];
}

export interface CreateChatRequest {
  messages: Message[];
  provider: string;
  modelId: string;
  chatId?: string;
  title?: string;
  search?: boolean;
}

export class ChatService {
  private static instance: ChatService;

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  /**
   * Send a message and get AI response
   */
  async sendMessage(params: SendMessageParams): Promise<SendMessageResponse> {
    // Get the correct model name and provider
    // console.log("Getting model parameters for:", params.modelId);
    // const { actualModelName, normalizedProvider } = await modelService.getModelRequestParams(params.modelId);

    // console.log(`Using model: ${actualModelName}, provider: ${normalizedProvider}`);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: params.messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          model: params.modelId, // Use the mapped model name
          provider: params.provider, // Use the normalized provider
          chatId: params.chatId,
          title: params.title,
          search: params.search,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error in sendMessage:", error);
      throw error;
    }
  }
  /**
   * Get messages for a specific chat
   */
  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    const response = await fetch(`/api/chat?chatId=${chatId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.messages || [];
  }

  /**
   * Get all user chats
   */
  async getUserChats(): Promise<Chat[]> {
    const response = await fetch('/api/chat');

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.chats || [];
  }

  /**
   * Delete a specific chat
   */
  async deleteChat(chatId: string): Promise<boolean> {
    const response = await fetch(`/api/chat/${chatId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success;
  }

  /**
   * Delete all user chats
   */
  async deleteAllChats(): Promise<boolean> {
    const response = await fetch('/api/chat', {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success;
  }

  /**
   * Share a chat and get share token
   */
  async shareChat(chatId: string): Promise<string> {
    const response = await fetch(`/api/share-chat/${chatId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Unable to share chat');
    }

    const data = await response.json();
    return data.shareToken;
  }

  /**
   * Get shared chat by token
   */
  async getSharedChat(token: string): Promise<Chat> {
    const response = await fetch(`/api/shared-chat/${token}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Chat not found');
    }

    const data = await response.json();
    return data.chat;
  }

  /**
   * Save user API key
   */
  async saveUserApiKey(apiKey: string, provider: string): Promise<boolean> {
    const response = await fetch('/api/user-api-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        provider,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to save API key');
    }

    const data = await response.json();
    return data.success;
  }

  /**
   * Upload a file (when enabled)
   */
  async uploadFile(file: File): Promise<boolean> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'File upload failed');
    }

    const data = await response.json();
    return data.success;
  }
  async loadChatHistory(chatId: string): Promise<Message[]> {
    try {
      const response = await fetch(`/api/chat/${chatId}`);

      if (!response.ok) {
        throw new Error(`Failed to load chat history: ${response.status}`);
      }

      const data = await response.json();
      return data.messages;
    } catch (error) {
      console.error("Error loading chat history:", error);
      throw error;
    }
  }
}

export const chatService = ChatService.getInstance();
