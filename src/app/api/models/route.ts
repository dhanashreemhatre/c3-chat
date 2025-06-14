import { NextRequest, NextResponse } from "next/server";
import { getUserApiKeys } from "@/services/userService";

type ModelInfo = {
    provider: string;
    id: string;
    name: string;
    description: string;
    keySource: "user" | "server";
};

// Add these interface definitions at the top
interface OpenAIModel {
    id: string;
    owned_by?: string;
}

interface MistralModel {
    id: string;
    description?: string;
}

interface GoogleGeminiModel {
    name: string;
    displayName?: string;
    description?: string;
}

async function fetchOpenAIModels(apiKey: string): Promise<ModelInfo[]> {
    const res = await fetch("https://api.openai.com/v1/models", {
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
    });

    if (!res.ok) throw new Error("Failed to fetch OpenAI models");
    const data = await res.json();

    return data.data.map((model: OpenAIModel) => ({
        provider: "openai",
        id: model.id,
        name: model.id,
        description: `Owned by: ${model.owned_by || "unknown"}`,
        keySource: "server", // Will be updated later
    }));
}

function getAnthropicModels(): ModelInfo[] {
    const models = [
        {
            id: "claude-3-opus-20240229",
            name: "Claude 3 Opus",
            description: "Highest quality Claude model",
        },
        {
            id: "claude-3-sonnet-20240229",
            name: "Claude 3 Sonnet",
            description: "Fast and balanced Claude model",
        },
        {
            id: "claude-3-haiku-20240307",
            name: "Claude 3 Haiku",
            description: "Smallest, fastest Claude model",
        },
    ];

    return models.map((m) => ({
        provider: "anthropic",
        ...m,
        keySource: "server", // Will be updated later
    }));
}

async function fetchMistralModels(apiKey: string): Promise<ModelInfo[]> {
    const res = await fetch("https://api.mistral.ai/v1/models", {
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
    });

    if (!res.ok) throw new Error("Failed to fetch Mistral models");
    const data = await res.json();

    return data.data.map((model: MistralModel) => ({
        provider: "mistral",
        id: model.id,
        name: model.id,
        description: model.description || "",
        keySource: "server", // Will be updated later
    }));
}

async function fetchGoogleGeminiModels(apiKey: string): Promise<ModelInfo[]> {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
        headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
        },
    });

    if (!res.ok) throw new Error("Failed to fetch Gemini models");
    const data = await res.json();

    return data.models.map((model: GoogleGeminiModel) => ({
        provider: "google",
        id: model.name,
        name: model.displayName || model.name,
        description: model.description || "",
        keySource: "server", // Will be updated later
    }));
}

async function fetchAllAvailableModels(userApiKeys: Record<string, string>): Promise<ModelInfo[]> {
    const providers = ["openai", "anthropic", "mistral", "google"];
    const allModels: ModelInfo[] = [];

    for (const provider of providers) {
        const userKey = userApiKeys[provider];
        const serverKey = process.env[`${provider.toUpperCase()}_API_KEY`];

        try {
            if (provider === "openai" && (userKey || serverKey)) {
                const models = await fetchOpenAIModels(userKey || serverKey);
                allModels.push(...models.map(m => ({ ...m, keySource: userKey ? "user" : "server" })));
            }

            if (provider === "anthropic" && (userKey || serverKey)) {
                const models = getAnthropicModels();
                allModels.push(...models.map(m => ({ ...m, keySource: userKey ? "user" : "server" })));
            }

            if (provider === "mistral" && (userKey || serverKey)) {
                const models = await fetchMistralModels(userKey || serverKey);
                allModels.push(...models.map(m => ({ ...m, keySource: userKey ? "user" : "server" })));
            }

            if (provider === "google" && (userKey || serverKey)) {
                const models = await fetchGoogleGeminiModels(userKey || serverKey);
                allModels.push(...models.map(m => ({ ...m, keySource: userKey ? "user" : "server" })));
            }
        } catch (err) {
            console.error(`Error fetching models from ${provider}:`, err);
        }
    }

    return allModels;
}

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("user-id") || null;
        const userApiKeys = userId ? await getUserApiKeys(userId) : {};

        const models = await fetchAllAvailableModels(userApiKeys);

        return NextResponse.json({ models });
    } catch (error) {
        console.error("Error fetching models:", error);
        return NextResponse.json(
            { error: "Failed to fetch models" },
            { status: 500 }
        );
    }
}
