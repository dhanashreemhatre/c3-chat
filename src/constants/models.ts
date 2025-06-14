import { ChatModel } from "../types/chat";

export const CHAT_MODELS: ChatModel[] = [
    {
        id: "gemini-2-flash",
        name: "Gemini 2.0 Flash",
        provider: "Google",
        description: "Fast and efficient AI model with multimodal capabilities",
    },
    {
        id: "gemini-1.5-flash", // Updated to match Google's naming
        name: "Gemini 1.5 Flash",
        provider: "Google",
        description: "Fast and efficient AI model",
    },
    {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        provider: "OpenAI",
        description: "Most capable GPT-4 model with 128k context window",
    },
    {
        id: "gpt-4",
        name: "GPT-4",
        provider: "OpenAI",
        description: "Advanced language model with superior reasoning",
    },
    {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        provider: "OpenAI",
        description: "Fast and cost-effective model for most tasks",
    },
    {
        id: "claude-3-opus",
        name: "Claude 3 Opus",
        provider: "Anthropic",
        description: "Most capable Claude model for complex tasks",
    },
    {
        id: "claude-3-sonnet",
        name: "Claude 3 Sonnet",
        provider: "Anthropic",
        description: "Balanced performance and speed for everyday use",
    },
    {
        id: "claude-3-haiku",
        name: "Claude 3 Haiku",
        provider: "Anthropic",
        description: "Fastest Claude model for quick responses",
    },
    {
        id: "gemini-pro",
        name: "Gemini Pro",
        provider: "Google",
        description: "Powerful model for text and code generation",
    },
];

export const MODEL_CAPABILITIES = {
    "gemini-2-flash": {
        maxTokens: 1048576,
        supportedModes: ["text", "image", "video"],
        pricing: {
            input: 0.075,
            output: 0.3,
            unit: "per 1M tokens",
        },
        features: ["web-search", "code-execution", "multimodal"],
    },
    "gpt-4-turbo": {
        maxTokens: 128000,
        supportedModes: ["text", "image"],
        pricing: {
            input: 10.0,
            output: 30.0,
            unit: "per 1M tokens",
        },
        features: ["advanced-reasoning", "json-mode", "function-calling"],
    },
    "gpt-4": {
        maxTokens: 8192,
        supportedModes: ["text"],
        pricing: {
            input: 30.0,
            output: 60.0,
            unit: "per 1M tokens",
        },
        features: ["advanced-reasoning", "function-calling"],
    },
    "gpt-3.5-turbo": {
        maxTokens: 16385,
        supportedModes: ["text"],
        pricing: {
            input: 0.5,
            output: 1.5,
            unit: "per 1M tokens",
        },
        features: ["fast-response", "function-calling", "json-mode"],
    },
    "claude-3-opus": {
        maxTokens: 200000,
        supportedModes: ["text", "image"],
        pricing: {
            input: 15.0,
            output: 75.0,
            unit: "per 1M tokens",
        },
        features: ["advanced-reasoning", "long-context", "multimodal"],
    },
    "claude-3-sonnet": {
        maxTokens: 200000,
        supportedModes: ["text", "image"],
        pricing: {
            input: 3.0,
            output: 15.0,
            unit: "per 1M tokens",
        },
        features: ["balanced-performance", "long-context", "multimodal"],
    },
    "claude-3-haiku": {
        maxTokens: 200000,
        supportedModes: ["text", "image"],
        pricing: {
            input: 0.25,
            output: 1.25,
            unit: "per 1M tokens",
        },
        features: ["fast-response", "long-context", "multimodal"],
    },
    "gemini-pro": {
        maxTokens: 32768,
        supportedModes: ["text"],
        pricing: {
            input: 0.5,
            output: 1.5,
            unit: "per 1M tokens",
        },
        features: ["code-generation", "reasoning"],
    },
};

export const PROVIDER_INFO = {
    OpenAI: {
        color: "from-green-400 to-green-600",
        website: "https://openai.com",
        apiDocsUrl: "https://platform.openai.com/docs",
        apiKeyUrl: "https://platform.openai.com/api-keys",
        logo: "/logos/openai.svg",
    },
    Anthropic: {
        color: "from-orange-400 to-orange-600",
        website: "https://anthropic.com",
        apiDocsUrl: "https://docs.anthropic.com",
        apiKeyUrl: "https://console.anthropic.com/settings/keys",
        logo: "/logos/anthropic.svg",
    },
    Google: {
        color: "from-blue-400 to-blue-600",
        website: "https://cloud.google.com/vertex-ai",
        apiDocsUrl: "https://cloud.google.com/vertex-ai/docs",
        apiKeyUrl: "https://aistudio.google.com/app/apikey",
        logo: "/logos/google.svg",
    },
};

export const DEFAULT_MODEL = "gemini-2-flash";

// Model selection preferences
export const MODEL_RECOMMENDATIONS = {
    "creative-writing": ["claude-3-opus", "gpt-4-turbo"],
    "code-generation": ["gpt-4-turbo", "claude-3-sonnet", "gemini-pro"],
    analysis: ["claude-3-opus", "gpt-4-turbo"],
    "quick-questions": ["gpt-3.5-turbo", "claude-3-haiku", "gemini-2-flash"],
    "complex-reasoning": ["claude-3-opus", "gpt-4-turbo"],
    "cost-effective": ["gpt-3.5-turbo", "claude-3-haiku", "gemini-2-flash"],
    multimodal: ["gpt-4-turbo", "claude-3-opus", "gemini-2-flash"],
};

// Rate limits (requests per minute)
export const RATE_LIMITS = {
    "gemini-2-flash": 300,
    "gpt-4-turbo": 500,
    "gpt-4": 200,
    "gpt-3.5-turbo": 3500,
    "claude-3-opus": 50,
    "claude-3-sonnet": 50,
    "claude-3-haiku": 50,
    "gemini-pro": 60,
};

// Model status
export const MODEL_STATUS = {
    "gemini-2-flash": "stable",
    "gpt-4-turbo": "stable",
    "gpt-4": "stable",
    "gpt-3.5-turbo": "stable",
    "claude-3-opus": "stable",
    "claude-3-sonnet": "stable",
    "claude-3-haiku": "stable",
    "gemini-pro": "stable",
} as const;

export type ModelStatus = (typeof MODEL_STATUS)[keyof typeof MODEL_STATUS];
