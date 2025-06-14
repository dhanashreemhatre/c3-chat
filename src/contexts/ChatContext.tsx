"use client";

import React, {
    createContext,
    useContext,
    useReducer,
    useEffect,
    ReactNode,
} from "react";
import { Message } from "../types/chat";
import { chatService, Chat } from "../services/chatService";
import { modelService } from "../services/modelService";
import { stat } from "fs";

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
    | { type: "SET_MESSAGES"; payload: Message[] }
    | { type: "ADD_MESSAGE"; payload: Message }
    | { type: "SET_LOADING"; payload: boolean }
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
    | { type: "SET_LOADING_MODELS"; payload: boolean };

const initialState: ChatState = {
    currentChatId: null,
    messages: [],
    isLoading: false,
    chats: [],
    isLoadingChats: false,
    selectedModel: "gemini-2-flash",
    searchEnabled: false,
    error: null,
    userApiKeys: {},
    availableModels: [],
    isLoadingModels: false,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
    switch (action.type) {
        case "SET_CURRENT_CHAT":
            return {
                ...state,
                currentChatId: action.payload,
                messages: [], // Clear messages when switching chats
                error: null,
            };

        case "SET_MESSAGES":
            return {
                ...state,
                messages: action.payload,
            };

        case "ADD_MESSAGE":
            return {
                ...state,
                messages: [...state.messages, action.payload],
            };

        case "SET_LOADING":
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
                    state.currentChatId === action.payload
                        ? null
                        : state.currentChatId,
                messages:
                    state.currentChatId === action.payload
                        ? []
                        : state.messages,
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

        case "SET_AVAILABLE_MODELS":
            return {
                ...state,
                availableModels: action.payload,
            };

        case "SET_LOADING_MODELS":
            return {
                ...state,
                isLoadingModels: action.payload,
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
        const userMessage: Message = {
            id: generateId(),
            content,
            role: "user",
            timestamp: new Date(),
        };

        dispatch({ type: "ADD_MESSAGE", payload: userMessage });
        dispatch({ type: "SET_LOADING", payload: true });
        dispatch({ type: "SET_ERROR", payload: null });

        try {
            console.log("Sending message:", state.selectedModel, content);
            const cleanedModelId = state.selectedModel.replace("models/", "");
            const params = modelService.getModelRequestParams(state.selectedModel);
            console.log("Sending message with params:", params);
            const response = await chatService.sendMessage({
                messages: [...state.messages, userMessage],
                modelId: cleanedModelId,
                provider: (await params).normalizedProvider,
                chatId: state.currentChatId || undefined,
                title: title || undefined,
                search: state.searchEnabled,
            });

            const assistantMessage: Message = {
                id: generateId(),
                content: response.reply,
                role: "assistant",
                timestamp: new Date(),
            };

            dispatch({ type: "ADD_MESSAGE", payload: assistantMessage });

            // Update current chat ID if it was a new chat
            if (!state.currentChatId && response.chatId) {
                dispatch({
                    type: "SET_CURRENT_CHAT",
                    payload: response.chatId,
                });
                // Reload chats to include the new one
                loadUserChats();
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to send message";
            dispatch({ type: "SET_ERROR", payload: errorMessage });
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
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
                error instanceof Error
                    ? error.message
                    : "Failed to load messages";
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
                error instanceof Error
                    ? error.message
                    : "Failed to delete chat";
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
                error instanceof Error
                    ? error.message
                    : "Failed to delete all chats";
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
                error instanceof Error
                    ? error.message
                    : "Failed to save API key";
            dispatch({ type: "SET_ERROR", payload: errorMessage });
            throw error;
        }
    };

    const loadAvailableModels = async (): Promise<void> => {
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
    };

    // Load user chats and available models on mount
    useEffect(() => {
        loadUserChats();
        loadAvailableModels();
    }, []);

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

    return (
        <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
    );
}

export function useChatContext(): ChatContextType {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error("useChatContext must be used within a ChatProvider");
    }
    return context;
}
