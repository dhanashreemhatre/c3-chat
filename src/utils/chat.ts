import { CHAT_MODELS } from "../constants/models";
import { Message } from "../types/chat";

// Generate unique ID for messages
export const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Format timestamp for display
export const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
        return "Just now";
    } else if (minutes < 60) {
        return `${minutes}m ago`;
    } else if (hours < 24) {
        return `${hours}h ago`;
    } else if (days < 7) {
        return `${days}d ago`;
    } else {
        return date.toLocaleDateString([], {
            month: "short",
            day: "numeric",
        });
    }
};

// Format full date and time
export const formatDateTime = (date: Date): string => {
    return date.toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

// Generate chat title from first message
export const generateChatTitle = (firstMessage: string): string => {
    // Clean the message
    const cleaned = firstMessage.trim().replace(/\n/g, " ");

    // Take first 50 characters
    if (cleaned.length <= 50) {
        return cleaned;
    }

    // Find a good breaking point
    const truncated = cleaned.substring(0, 50);
    const lastSpace = truncated.lastIndexOf(" ");

    if (lastSpace > 30) {
        return truncated.substring(0, lastSpace) + "...";
    }

    return truncated + "...";
};

// Count tokens (approximate)
export const estimateTokenCount = (text: string): number => {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
};

// Calculate conversation token count
export const calculateConversationTokens = (messages: Message[]): number => {
    return messages.reduce((total, message) => {
        return total + estimateTokenCount(message.content);
    }, 0);
};

// Format file size
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Validate message content
export const validateMessage = (
    content: string,
): { isValid: boolean; error?: string } => {
    if (!content.trim()) {
        return { isValid: false, error: "Message cannot be empty" };
    }

    if (content.length > 32000) {
        return {
            isValid: false,
            error: "Message is too long (max 32,000 characters)",
        };
    }

    return { isValid: true };
};

// Extract code blocks from message
export const extractCodeBlocks = (
    content: string,
): { language: string; code: string }[] => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks: { language: string; code: string }[] = [];
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
        blocks.push({
            language: match[1] || "text",
            code: match[2].trim(),
        });
    }

    return blocks;
};

// Highlight search terms in text
export const highlightSearchTerms = (
    text: string,
    searchTerm: string,
): string => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(
        `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi",
    );
    return text.replace(
        regex,
        '<mark class="bg-yellow-200 text-black">$1</mark>',
    );
};

// Group messages by date
export const groupMessagesByDate = (
    messages: Message[],
): { [date: string]: Message[] } => {
    const groups: { [date: string]: Message[] } = {};

    messages.forEach((message) => {
        const date = message.timestamp.toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
    });

    return groups;
};

// Get model info by ID
export const getModelInfo = (modelId: string) => {
    return CHAT_MODELS.find((model) => model.id === modelId);
};

// Check if message contains sensitive information
export const containsSensitiveInfo = (content: string): boolean => {
    const sensitivePatterns = [
        /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card numbers
        /\b\d{3}-\d{2}-\d{4}\b/, // SSN
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email (basic)
        /\b\d{3}-\d{3}-\d{4}\b/, // Phone numbers
    ];

    return sensitivePatterns.some((pattern) => pattern.test(content));
};

// Clean message content for display
export const cleanMessageContent = (content: string): string => {
    return content
        .trim()
        .replace(/\r\n/g, "\n") // Normalize line endings
        .replace(/\n{3,}/g, "\n\n"); // Limit consecutive line breaks
};

// Generate export data for chat
export const exportChatData = (messages: Message[], chatTitle?: string) => {
    const exportData = {
        title: chatTitle || "Chat Export",
        exportedAt: new Date().toISOString(),
        messageCount: messages.length,
        messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString(),
        })),
    };

    return JSON.stringify(exportData, null, 2);
};

// Parse exported chat data
export const parseExportedChat = (
    jsonData: string,
): { messages: Message[]; title?: string } | null => {
    try {
        const data = JSON.parse(jsonData);

        if (!data.messages || !Array.isArray(data.messages)) {
            return null;
        }

        const messages: Message[] = data.messages.map((msg: any) => ({
            id: generateId(),
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
        }));

        return {
            messages,
            title: data.title,
        };
    } catch (error) {
        return null;
    }
};

// Get conversation summary
export const getConversationSummary = (
    messages: Message[],
): {
    messageCount: number;
    userMessages: number;
    assistantMessages: number;
    totalCharacters: number;
    estimatedTokens: number;
    duration: string;
} => {
    const userMessages = messages.filter((m) => m.role === "user").length;
    const assistantMessages = messages.filter(
        (m) => m.role === "assistant",
    ).length;
    const totalCharacters = messages.reduce(
        (total, msg) => total + msg.content.length,
        0,
    );
    const estimatedTokens = calculateConversationTokens(messages);

    let duration = "Unknown";
    if (messages.length >= 2) {
        const start = messages[0].timestamp;
        const end = messages[messages.length - 1].timestamp;
        const diffMs = end.getTime() - start.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);

        if (diffMinutes < 60) {
            duration = `${diffMinutes} minutes`;
        } else {
            const hours = Math.floor(diffMinutes / 60);
            const remainingMinutes = diffMinutes % 60;
            duration = `${hours}h ${remainingMinutes}m`;
        }
    }

    return {
        messageCount: messages.length,
        userMessages,
        assistantMessages,
        totalCharacters,
        estimatedTokens,
        duration,
    };
};

// Debounce function for search and input
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number,
): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

// Check if running in browser
export const isBrowser = (): boolean => {
    return typeof window !== "undefined";
};

// Safe localStorage operations
export const safeLocalStorage = {
    getItem: (key: string): string | null => {
        if (!isBrowser()) return null;
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    },

    setItem: (key: string, value: string): boolean => {
        if (!isBrowser()) return false;
        try {
            localStorage.setItem(key, value);
            return true;
        } catch {
            return false;
        }
    },

    removeItem: (key: string): boolean => {
        if (!isBrowser()) return false;
        try {
            localStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    },
};

// URL validation
export const isValidUrl = (string: string): boolean => {
    try {
        new URL(string);
        return true;
    } catch {
        return false;
    }
};

// Extract URLs from text
export const extractUrls = (text: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex);
    return matches ? matches.filter(isValidUrl) : [];
};
