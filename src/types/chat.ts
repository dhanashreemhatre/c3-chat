// Chat interface types
export interface Message {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
}

export interface ChatModel {
    id: string;
    name: string;
    provider: string;
    description?: string;
}
