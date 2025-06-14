import { NextResponse } from "next/server";
import { auth } from "@/app/auth";

// Define model information with their providers
const availableModels = [
    { id: "gpt-4o", name: "GPT-4o", provider: "openai", description: "Latest multimodal model from OpenAI" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "openai", description: "Fast and powerful language model" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "openai", description: "Efficient language model" },
    { id: "claude-3-opus", name: "Claude 3 Opus", provider: "anthropic", description: "Anthropic's most powerful model" },
    { id: "claude-3-sonnet", name: "Claude 3 Sonnet", provider: "anthropic", description: "Balanced performance and speed" },
    { id: "claude-instant", name: "Claude Instant", provider: "anthropic", description: "Fast and efficient responses" },
    { id: "gemini-pro", name: "Gemini Pro", provider: "google", description: "Google's multimodal AI model" },
    { id: "gemini-flash", name: "Gemini Flash", provider: "google", description: "Google's fastest AI model" },
];

export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ models: availableModels });
}