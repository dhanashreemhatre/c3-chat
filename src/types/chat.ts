// Chat interface types
export interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: Date;
    isStreaming?: boolean; // Add this field
}

export interface ChatModel {
    id: string;
    name: string;
    provider: string;
    description?: string;
}
