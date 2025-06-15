import { NextResponse } from "next/server";
import { getUserApiKeys } from "@/services/userService";
import { auth } from "@/app/auth";
import { getUserByEmail } from "@/app/lib/db/user";
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

  // Filter out embedding, audio, image, and other non-chat models
  const chatModels = data.data.filter((model: OpenAIModel) => {
    const modelId = model.id.toLowerCase();
    return !modelId.includes('embedding') &&
      !modelId.includes('whisper') &&
      !modelId.includes('tts') &&
      !modelId.includes('dall-e') &&
      !modelId.includes('davinci-002') &&
      !modelId.includes('babbage-002') &&
      (modelId.includes('gpt') || modelId.includes('o1'));
  });

  return chatModels.map((model: OpenAIModel) => ({
    provider: "openai",
    id: model.id,
    name: model.id,
    description: `Owned by: ${model.owned_by || "unknown"}`,
    keySource: "server" as const, // Will be updated later
  }));
}

function getAnthropicModels(): ModelInfo[] {
  const models = [
    {
      id: "claude-3-5-sonnet-20241022",
      name: "Claude 3.5 Sonnet",
      description: "Most intelligent model, combining top-tier performance with improved speed",
    },
    {
      id: "claude-3-5-haiku-20241022",
      name: "Claude 3.5 Haiku",
      description: "Fast and cost-effective model for quick responses",
    },
    {
      id: "claude-3-opus-20240229",
      name: "Claude 3 Opus",
      description: "Highest quality Claude 3 model for complex tasks",
    },
    {
      id: "claude-3-sonnet-20240229",
      name: "Claude 3 Sonnet",
      description: "Balanced Claude 3 model for most use cases",
    },
    {
      id: "claude-3-haiku-20240307",
      name: "Claude 3 Haiku",
      description: "Fastest Claude 3 model for simple tasks",
    },
  ];

  return models.map((m) => ({
    provider: "anthropic",
    ...m,
    keySource: "server" as const, // Will be updated later
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
    keySource: "server" as const, // Will be updated later
  }));
}

async function fetchGoogleGeminiModels(apiKey: string): Promise<ModelInfo[]> {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models",
    {
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
    },
  );

  if (!res.ok) throw new Error("Failed to fetch Gemini models");
  const data = await res.json();

  // Filter out embedding models, image generation models, and deprecated models
  const chatModels = data.models.filter((model: GoogleGeminiModel) => {
    const modelName = model.name.toLowerCase();
    const displayName = model.displayName?.toLowerCase() || '';
    const description = model.description?.toLowerCase() || '';

    // Exclude embedding models
    if (modelName.includes('embedding') || displayName.includes('embedding')) {
      return false;
    }

    // Exclude image generation models
    if (modelName.includes('image-generation') ||
      displayName.includes('image generation') ||
      description.includes('image generation')) {
      return false;
    }

    // Exclude deprecated models (like the old pro-vision models)
    if (description.includes('deprecated')) {
      return false;
    }

    // Include only Gemini chat/text generation models
    return modelName.includes('gemini');
  });

  console.log("Filtered Google Gemini models:", chatModels.length);
  return chatModels.map((model: GoogleGeminiModel) => ({
    provider: "google",
    id: model.name,
    name: model.displayName || model.name,
    description: model.description || "",
    keySource: "server" as const,
  }));
}

async function fetchAllAvailableModels(
  userApiKeys: Record<string, string>,
): Promise<ModelInfo[]> {
  const providers = ["openai", "anthropic", "mistral", "google"];
  const allModels: ModelInfo[] = [];

  for (const provider of providers) {
    const userKey = userApiKeys[provider];
    const serverKey = process.env[`${provider.toUpperCase()}_API_KEY`];

    try {
      if (provider === "openai" && (userKey || serverKey)) {
        const key = userKey || serverKey;
        if (key) {
          const models = await fetchOpenAIModels(key);
          allModels.push(
            ...models.map((m) => ({
              ...m,
              keySource: (userKey ? "user" : "server") as "user" | "server",
            })),
          );
        }
      }

      if (provider === "anthropic" && (userKey || serverKey)) {
        const models = getAnthropicModels();
        allModels.push(
          ...models.map((m) => ({
            ...m,
            keySource: (userKey ? "user" : "server") as "user" | "server",
          })),
        );
      }

      if (provider === "mistral" && (userKey || serverKey)) {
        const key = userKey || serverKey;
        if (key) {
          const models = await fetchMistralModels(key);
          allModels.push(
            ...models.map((m) => ({
              ...m,
              keySource: (userKey ? "user" : "server") as "user" | "server",
            })),
          );
        }
      }

      if (provider === "google" && (userKey || serverKey)) {
        const key = userKey || serverKey;
        console.log("userkey :", userKey, "serverkey: ", serverKey,);
        if (key) {
          const models = await fetchGoogleGeminiModels(key);
          allModels.push(
            ...models.map((m) => ({
              ...m,
              keySource: (userKey ? "user" : "server") as "user" | "server",
            })),
          );
        }
      }
    } catch (err) {
      console.error(`Error fetching models from ${provider}:`, err);
    }
  }

  return allModels;
}

export async function GET() {
  try {
    console.log("=== MODELS API ROUTE START ===");

    const session = await auth();
    console.log("Session user:", session?.user?.email);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database using email from session
    const user = await getUserByEmail(session.user.email);
    if (!user) {
      console.log("User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Fetching models for userId:", user.id);
    const userApiKeys = await getUserApiKeys(user.id);
    console.log("userApiKeys:", userApiKeys);

    const models = await fetchAllAvailableModels(userApiKeys);
    // console.log("models:", models);

    return NextResponse.json({ models });
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 },
    );
  }
}
