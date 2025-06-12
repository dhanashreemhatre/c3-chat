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

export interface CreateChatRequest {
  messages: Message[];
  provider: string;
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
  async sendMessage(request: CreateChatRequest): Promise<ChatResponse> {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
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
}

export const chatService = ChatService.getInstance();
