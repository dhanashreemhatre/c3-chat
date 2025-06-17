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
  loadUserChats: () => Promise<void>;
  switchToChat: (chatId: string) => Promise<void>;

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

    // 1. Add user message immediately
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

    // 2. Create assistant message placeholder for streaming
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

      // 3. Make the API call
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
          stream: true, // Enable streaming
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

      // Check if response is streaming (plain text) or JSON
      if (contentType?.includes("text/plain")) {
        console.log("Handling streaming response");
        await handleStreamingResponse(response, assistantMessageId);
      } else {
        console.log("Handling JSON response");
        const data = await response.json();
        console.log("JSON response data:", data);

        // Update the assistant message with the complete response
        dispatch({
          type: "UPDATE_MESSAGE",
          payload: {
            id: assistantMessageId,
            content: data.reply,
            isStreaming: false,
          },
        });

        // Update current chat ID if it was a new chat
        if (!chatId && data.chatId) {
          console.log("Setting new chat ID:", data.chatId);
          dispatch({
            type: "SET_CURRENT_CHAT_ID",
            payload: data.chatId,
          });
          loadUserChats();
        }
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send message";
      dispatch({ type: "SET_ERROR", payload: errorMessage });

      // Remove the failed assistant message
      dispatch({ type: "REMOVE_MESSAGE", payload: assistantMessageId });
    } finally {
      console.log("=== SEND MESSAGE END ===");
      dispatch({ type: "SET_LOADING", payload: false });
    }
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
        console.log("Raw chunk received:", chunk); // Debug log

        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            const jsonStr = trimmedLine.slice(6);
            console.log("JSON string to parse:", jsonStr); // Debug log

            // Skip empty data lines
            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr);
              console.log("Parsed data:", data); // Debug log

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

                // Reload chats if this was a new chat
                if (!state.currentChatId) {
                  loadUserChats();
                }
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError);
              console.error('Problematic JSON string:', jsonStr);
              // Continue processing other lines instead of failing completely
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  };

  const loadChatMessages = async (chatId: string): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const chatMessages = await chatService.getChatMessages(chatId);
      const messages: Message[] = chatMessages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: new Date(msg.createdAt),
      }));

      dispatch({ type: "SET_MESSAGES", payload: messages });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load messages";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete all chats";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    }
  };

  const shareChat = async (chatId: string): Promise<string> => {
    try {
      const shareToken = await chatService.shareChat(chatId);
      return shareToken;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to share chat";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    }
  };

  const loadUserChats = async (): Promise<void> => {
    dispatch({ type: "SET_LOADING_CHATS", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const chats = await chatService.getUserChats();
      dispatch({ type: "SET_CHATS", payload: chats });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load chats";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
    } finally {
      dispatch({ type: "SET_LOADING_CHATS", payload: false });
    }
  };

  const switchToChat = async (chatId: string): Promise<void> => {
    dispatch({ type: "SET_CURRENT_CHAT", payload: chatId });
    await loadChatMessages(chatId);
  };

  const saveApiKey = async (
    provider: string,
    apiKey: string,
  ): Promise<void> => {
    try {
      await modelService.updateApiKey(provider, apiKey);
      dispatch({
        type: "SET_USER_API_KEY",
        payload: { provider, apiKey },
      });

      // Reload available models after updating the API key
      await loadAvailableModels();
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
      const { models } = await modelService.getAvailableModels();
      dispatch({ type: "SET_AVAILABLE_MODELS", payload: models });

      // If user has no model selected or selected model is not available,
      // select the first available model
      if (
        models.length > 0 &&
        (!state.selectedModel ||
          !models.some((m) => m.id === state.selectedModel))
      ) {
        dispatch({ type: "SET_SELECTED_MODEL", payload: models[0].id });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load available models";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
    } finally {
      dispatch({ type: "SET_LOADING_MODELS", payload: false });
    }
  }, [state.selectedModel]);

  // Load user chats and available models on mount
  useEffect(() => {
    loadUserChats();
    loadAvailableModels();
  }, [loadAvailableModels]);

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
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext(): ChatContextType {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
