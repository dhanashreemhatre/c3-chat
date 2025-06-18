"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Message, ChatModel } from "../types/chat";
import { chatService, Chat } from "../services/chatService";
import { modelService } from "../services/modelService";
import { chatCache, CachedChat } from '../utils/chatCache';

// import { stat } from "fs";

export interface ChatState {
  // Current chat
  currentChatId: string | null;
  messages: Message[];
  isLoading: boolean;

  // Chat management
  chats: Chat[];
  isLoadingChats: boolean;

  // UI state
  selectedModel: string;
  searchEnabled: boolean;

  // Error handling
  error: string | null;

  // User settings
  userApiKeys: Record<string, string>;

  // Model management
  availableModels: (ChatModel & { keySource: "user" | "server" })[];
  isLoadingModels: boolean;
}

export type ChatAction =
  | { type: "SET_CURRENT_CHAT"; payload: string | null }
  | { type: "SET_CURRENT_CHAT_ID"; payload: string }
  | { type: "SET_MESSAGES"; payload: Message[] }
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_IS_LOADING"; payload: boolean } // Add this line
  | { type: "SET_CHATS"; payload: Chat[] }
  | { type: "SET_LOADING_CHATS"; payload: boolean }
  | { type: "ADD_CHAT"; payload: Chat }
  | { type: "REMOVE_CHAT"; payload: string }
  | { type: "SET_SELECTED_MODEL"; payload: string }
  | { type: "SET_SEARCH_ENABLED"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | {
    type: "SET_USER_API_KEY";
    payload: { provider: string; apiKey: string };
  }
  | { type: "DELETE_ALL_CHATS" }
  | { type: "CLEAR_MESSAGES" }
  | { type: "RESET_STATE" }
  | {
    type: "SET_AVAILABLE_MODELS";
    payload: (ChatModel & { keySource: "user" | "server" })[];
  }
  | { type: "SET_LOADING_MODELS"; payload: boolean }
  | { type: "UPDATE_MESSAGE"; payload: Partial<Message> & { id: string } }
  | { type: "REMOVE_MESSAGE"; payload: string };

const initialState: ChatState = {
  currentChatId: null,
  messages: [],
  isLoading: false,
  chats: [],
  isLoadingChats: false,
  selectedModel: "models/gemini-2.0-flash",
  searchEnabled: false,
  error: null,
  userApiKeys: {},
  availableModels: [],
  isLoadingModels: false,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  console.log("ChatReducer action:", action.type); // Log all actions

  switch (action.type) {
    case "SET_CURRENT_CHAT":
      console.log("SET_CURRENT_CHAT - clearing messages");
      return {
        ...state,
        currentChatId: action.payload,
        messages: [], // Clear messages when switching chats
        error: null,
      };

    case "SET_CURRENT_CHAT_ID":
      console.log("SET_CURRENT_CHAT_ID - keeping messages");
      // New action that sets chat ID without clearing messages
      return {
        ...state,
        currentChatId: action.payload,
        error: null,
      };

    case "SET_MESSAGES":
      return {
        ...state,
        messages: action.payload,
      };

    case "ADD_MESSAGE":
      const newMessages = [...state.messages, action.payload];
      return {
        ...state,
        messages: newMessages,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_IS_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_CHATS":
      return {
        ...state,
        chats: action.payload,
      };

    case "SET_LOADING_CHATS":
      return {
        ...state,
        isLoadingChats: action.payload,
      };

    case "ADD_CHAT":
      return {
        ...state,
        chats: [action.payload, ...state.chats],
      };

    case "REMOVE_CHAT":
      return {
        ...state,
        chats: state.chats.filter((chat) => chat.id !== action.payload),
        currentChatId:
          state.currentChatId === action.payload ? null : state.currentChatId,
        messages: state.currentChatId === action.payload ? [] : state.messages,
      };

    case "SET_SELECTED_MODEL":
      return {
        ...state,
        selectedModel: action.payload,
      };

    case "SET_SEARCH_ENABLED":
      return {
        ...state,
        searchEnabled: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };

    case "SET_USER_API_KEY":
      return {
        ...state,
        userApiKeys: {
          ...state.userApiKeys,
          [action.payload.provider]: action.payload.apiKey,
        },
      };

    case "CLEAR_MESSAGES":
      return {
        ...state,
        messages: [],
      };

    case "RESET_STATE":
      return initialState;

    case "SET_AVAILABLE_MODELS": {
      const newModels = action.payload;
      console.log("[Reducer SET_AVAILABLE_MODELS] Incoming models:", newModels);
      console.log("[Reducer SET_AVAILABLE_MODELS] Current state.selectedModel:", state.selectedModel);

      let newSelectedModel = state.selectedModel;
      
      console.log("[Reducer SET_AVAILABLE_MODELS] Final newSelectedModel:", newSelectedModel);

      return {
        ...state,
        availableModels: newModels,
        selectedModel: newSelectedModel,
      };
    }
    case "SET_SELECTED_MODEL": { // Also log when this is explicitly called
        console.log("[Reducer SET_SELECTED_MODEL] Payload:", action.payload);
        return {
            ...state,
            selectedModel: action.payload,
        };
    }
    case "SET_LOADING_MODELS":
      return {
        ...state,
        isLoadingModels: action.payload,
      };

    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, ...action.payload }
            : msg
        ),
      };

    case "REMOVE_MESSAGE":
      return {
        ...state,
        messages: state.messages.filter(msg => msg.id !== action.payload),
      };

    default:
      return state;
  }
}

interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;

  // Chat actions
  sendMessage: (content: string, title?: string) => Promise<void>;
  loadChatMessages: (chatId: string) => Promise<void>;
  createNewChat: () => void;
  deleteChat: (chatId: string) => Promise<void>;
  deleteAllChats: () => Promise<void>;
  shareChat: (chatId: string) => Promise<string>;

  // Chat management
  loadUserChats: (forceRefresh?: boolean) => Promise<void>; // Update this line to add forceRefresh parameter
  switchToChat: (chatId: string) => Promise<void>;
  refreshChats: () => Promise<void>; // Add this new method
  clearChatCache: () => void; // Add this new method

  // User settings
  saveApiKey: (provider: string, apiKey: string) => Promise<void>;

  // Model management
  loadAvailableModels: () => Promise<void>;

  // Utility functions
  generateId: () => string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9);
  };

  // Helper function to handle streaming response
  const handleStreamingResponse = async (response: Response, assistantMessageId: string) => {
    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        console.log("Raw chunk received:", chunk);

        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            const jsonStr = trimmedLine.slice(6);
            console.log("JSON string to parse:", jsonStr);

            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr);
              console.log("Parsed data:", data);

              if (data.type === 'metadata') {
                if (data.chatId && !state.currentChatId) {
                  dispatch({ type: "SET_CURRENT_CHAT_ID", payload: data.chatId });
                }
              } else if (data.type === 'content') {
                fullContent = data.fullContent;
                dispatch({
                  type: "UPDATE_MESSAGE",
                  payload: {
                    id: assistantMessageId,
                    content: fullContent,
                    isStreaming: true,
                  },
                });
              } else if (data.type === 'done') {
                dispatch({
                  type: "UPDATE_MESSAGE",
                  payload: {
                    id: assistantMessageId,
                    content: data.fullContent,
                    isStreaming: false,
                  },
                });

                if (!state.currentChatId) {
                  loadUserChats();
                }
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError);
              console.error('Problematic JSON string:', jsonStr);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  };

  const sendMessage = async (
    content: string,
    title?: string,
  ): Promise<void> => {
    console.log("=== SEND MESSAGE START ===");
    console.log("Content:", content);
    console.log("Current state:", {
      currentChatId: state.currentChatId,
      messagesLength: state.messages.length,
      selectedModel: state.selectedModel,
      isLoading: state.isLoading
    });

    const userMessage: Message = {
      id: generateId(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    console.log("Adding user message:", userMessage);
    dispatch({ type: "ADD_MESSAGE", payload: userMessage });
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    const assistantMessageId = generateId();
    const assistantMessage: Message = {
      id: assistantMessageId,
      content: "",
      role: "assistant",
      timestamp: new Date(),
      isStreaming: true,
    };

    console.log("Adding assistant placeholder:", assistantMessage);
    dispatch({ type: "ADD_MESSAGE", payload: assistantMessage });

    try {
      const chatId = state.currentChatId;
      const cleanedModelId = state.selectedModel.replace("models/", "");
      const params = await modelService.getModelRequestParams(state.selectedModel);
      const messagesForApi = [...state.messages, userMessage];

      console.log("API request params:", {
        chatId,
        cleanedModelId,
        provider: params.normalizedProvider,
        messagesCount: messagesForApi.length
      });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messagesForApi,
          model: cleanedModelId,
          provider: params.normalizedProvider,
          chatId: chatId || undefined,
          title: title || undefined,
          search: state.searchEnabled,
          stream: true,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const contentType = response.headers.get("content-type");
      console.log("Content type:", contentType);

      if (contentType?.includes("text/plain")) {
        console.log("Handling streaming response");
        await handleStreamingResponse(response, assistantMessageId);
      } else {
        console.log("Handling JSON response");
        const data = await response.json();
        console.log("JSON response data:", data);

        dispatch({
          type: "UPDATE_MESSAGE",
          payload: {
            id: assistantMessageId,
            content: data.reply,
            isStreaming: false,
          },
        });

        if (!chatId && data.chatId) {
          console.log("Setting new chat ID:", data.chatId);
          dispatch({
            type: "SET_CURRENT_CHAT_ID",
            payload: data.chatId,
          });
          loadUserChats();
        }
      }

      // After successful API response, update cache
      if (state.currentChatId) {
        const currentMessages = [...state.messages, userMessage];
        if (assistantMessage) {
          currentMessages.push(assistantMessage);
        }
        
        const cachedMessages = currentMessages.map(msg => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: msg.timestamp.toISOString()
        }));
        
        chatCache.updateChatMessages(state.currentChatId, cachedMessages);
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send message";
      dispatch({ type: "SET_ERROR", payload: errorMessage });

      dispatch({ type: "REMOVE_MESSAGE", payload: assistantMessageId });
    } finally {
      console.log("=== SEND MESSAGE END ===");
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const loadUserChats = async (forceRefresh = false): Promise<void> => {
    dispatch({ type: "SET_LOADING_CHATS", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      if (!forceRefresh && chatCache.isCacheValid()) {
        const cachedChats = chatCache.getChats();
        if (cachedChats) {
          console.log('Loading chats from cache');
          const chats: Chat[] = cachedChats.map(cached => ({
            id: cached.id,
            title: cached.title,
            createdAt: cached.createdAt,
            updatedAt: cached.updatedAt,
            userId: '',
            isDeleted: false, // Add missing property
            // Remove messages property as it doesn't exist on Chat type
          }));
          
          dispatch({ type: "SET_CHATS", payload: chats });
          dispatch({ type: "SET_LOADING_CHATS", payload: false });
          
          loadUserChatsFromServer();
          return;
        }
      }

      await loadUserChatsFromServer();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load chats";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      dispatch({ type: "SET_LOADING_CHATS", payload: false });
    }
  };

  const loadUserChatsFromServer = async (): Promise<void> => {
    try {
      console.log('Loading chats from server');
      const chats = await chatService.getUserChats();
      dispatch({ type: "SET_CHATS", payload: chats });

      const cachedChats: CachedChat[] = chats.map(chat => ({
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        // Remove messages mapping as Chat type doesn't have messages
      }));
      
      chatCache.setChats(cachedChats);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load chats";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING_CHATS", payload: false });
    }
  };

  const loadChatMessages = async (chatId: string): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const cachedMessages = chatCache.getChatMessages(chatId);
      if (cachedMessages) {
        console.log('Loading messages from cache for chat:', chatId);
        const messages: Message[] = cachedMessages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role as 'user' | 'assistant',
          timestamp: new Date(msg.timestamp),
        }));
        
        dispatch({ type: "SET_MESSAGES", payload: messages });
        dispatch({ type: "SET_LOADING", payload: false });
        
        await loadChatMessagesFromServer(chatId);
        return;
      }

      await loadChatMessagesFromServer(chatId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load messages";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const loadChatMessagesFromServer = async (chatId: string): Promise<void> => {
    try {
      console.log('Loading messages from server for chat:', chatId);
      const chatMessages = await chatService.getChatMessages(chatId);
      const messages: Message[] = chatMessages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: new Date(msg.createdAt),
      }));

      dispatch({ type: "SET_MESSAGES", payload: messages });

      const cachedMessages = messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp.toISOString()
      }));
      
      chatCache.updateChatMessages(chatId, cachedMessages);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load messages";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const createNewChat = (): void => {
    dispatch({ type: "SET_CURRENT_CHAT", payload: null });
    dispatch({ type: "CLEAR_MESSAGES" });
    dispatch({ type: "SET_ERROR", payload: null });
  };

  const deleteChat = async (chatId: string): Promise<void> => {
    try {
      await chatService.deleteChat(chatId);
      dispatch({ type: "REMOVE_CHAT", payload: chatId });
      
      chatCache.removeChat(chatId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete chat";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    }
  };

  const deleteAllChats = async (): Promise<void> => {
    try {
      await chatService.deleteAllChats();
      dispatch({ type: "SET_CHATS", payload: [] });
      dispatch({ type: "SET_CURRENT_CHAT", payload: null });
      dispatch({ type: "CLEAR_MESSAGES" });
      
      chatCache.clearCache();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete all chats";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    }
  };

  // Add missing functions that are referenced in the context value
  const shareChat = async (chatId: string): Promise<string> => {
    try {
      return await chatService.shareChat(chatId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to share chat";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    }
  };

  const switchToChat = async (chatId: string): Promise<void> => {
    dispatch({ type: "SET_CURRENT_CHAT", payload: chatId });
    await loadChatMessages(chatId);
  };

  const saveApiKey = async (provider: string, apiKey: string): Promise<void> => {
    try {
      // Save to your backend or local storage
      dispatch({ 
        type: "SET_USER_API_KEY", 
        payload: { provider, apiKey } 
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save API key";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    }
  };

  const loadAvailableModels = useCallback(async (): Promise<void> => {
    dispatch({ type: "SET_LOADING_MODELS", payload: true });
    try {
      const modelResponse = await modelService.getAvailableModels();
      // Extract the models array from the response
      const models = Array.isArray(modelResponse) ? modelResponse : modelResponse.models || [];
      dispatch({ type: "SET_AVAILABLE_MODELS", payload: models });
    } catch (error) {
      console.error('Failed to load models:', error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load available models" });
    } finally {
      dispatch({ type: "SET_LOADING_MODELS", payload: false });
    }
  }, []);

  const refreshChats = async (): Promise<void> => {
    await loadUserChats(true);
  };

  const clearChatCache = (): void => {
    chatCache.clearCache();
  };

  const value: ChatContextType = {
    state,
    dispatch,
    sendMessage,
    loadChatMessages,
    createNewChat,
    deleteChat,
    deleteAllChats,
    shareChat,
    loadUserChats,
    switchToChat,
    saveApiKey,
    loadAvailableModels,
    generateId,
    refreshChats,
    clearChatCache,
  };

  useEffect(() => {
    loadUserChats();
    loadAvailableModels();
  }, [loadAvailableModels]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext(): ChatContextType {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
