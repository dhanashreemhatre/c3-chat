export interface CachedChat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: Array<{
    id: string;
    content: string;
    role: string;
    timestamp: string;
  }>;
}

export interface ChatCache {
  chats: CachedChat[];
  lastUpdated: string;
  version: number;
}

const CACHE_KEY = 'c3-chat-cache';
const CACHE_VERSION = 1;
const CACHE_EXPIRY = 1000 * 60 * 30; // 30 minutes

export const chatCache = {
  // Get cached chats
  getChats(): CachedChat[] | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data: ChatCache = JSON.parse(cached);
      
      // Check version compatibility
      if (data.version !== CACHE_VERSION) {
        this.clearCache();
        return null;
      }

      // Check if cache is expired
      const now = Date.now();
      const cacheTime = new Date(data.lastUpdated).getTime();
      
      if (now - cacheTime > CACHE_EXPIRY) {
        this.clearCache();
        return null;
      }

      return data.chats;
    } catch (error) {
      console.error('Error reading chat cache:', error);
      this.clearCache();
      return null;
    }
  },

  // Cache chats
  setChats(chats: CachedChat[]): void {
    try {
      const data: ChatCache = {
        chats,
        lastUpdated: new Date().toISOString(),
        version: CACHE_VERSION,
      };
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error caching chats:', error);
    }
  },

  // Get cached messages for a specific chat
  getChatMessages(chatId: string): CachedChat['messages'] | null {
    const chats = this.getChats();
    if (!chats) return null;

    const chat = chats.find(c => c.id === chatId);
    return chat?.messages || null;
  },

  // Update messages for a specific chat
  updateChatMessages(chatId: string, messages: CachedChat['messages']): void {
    const chats = this.getChats() || [];
    const chatIndex = chats.findIndex(c => c.id === chatId);
    
    if (chatIndex >= 0) {
      chats[chatIndex].messages = messages;
      this.setChats(chats);
    }
  },

  // Add or update a single chat
  updateChat(chat: CachedChat): void {
    const chats = this.getChats() || [];
    const existingIndex = chats.findIndex(c => c.id === chat.id);
    
    if (existingIndex >= 0) {
      chats[existingIndex] = { ...chats[existingIndex], ...chat };
    } else {
      chats.unshift(chat);
    }
    
    this.setChats(chats);
  },

  // Remove a chat from cache
  removeChat(chatId: string): void {
    const chats = this.getChats() || [];
    const filteredChats = chats.filter(c => c.id !== chatId);
    this.setChats(filteredChats);
  },

  // Clear all cache
  clearCache(): void {
    localStorage.removeItem(CACHE_KEY);
  },

  // Check if cache is valid
  isCacheValid(): boolean {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return false;

    try {
      const data: ChatCache = JSON.parse(cached);
      const now = Date.now();
      const cacheTime = new Date(data.lastUpdated).getTime();
      
      return (now - cacheTime < CACHE_EXPIRY) && (data.version === CACHE_VERSION);
    } catch {
      return false;
    }
  }
};