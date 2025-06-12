import { ChatModel } from "../types/chat";

export const CHAT_MODELS: ChatModel[] = [
    {
        id: "gemini-2-flash",
        name: "Gemini 2.0 Flash",
        provider: "Google",
        description: "Fast and efficient AI model",
    },
    {
        id: "gpt-4",
        name: "GPT-4",
        provider: "OpenAI",
        description: "Advanced language model",
    },
    {
        id: "claude-4-sonnet",
        name: "Claude 4 Sonnet",
        provider: "Anthropic",
        description: "Balanced performance and speed",
    },
    {
        id: "claude-4-opus",
        name: "Claude 4 Opus",
        provider: "Anthropic",
        description: "Most capable model",
    },
];
