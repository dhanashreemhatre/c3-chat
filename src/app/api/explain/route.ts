import { auth } from "@/app/auth";
import { NextResponse } from "next/server";
import { AIHandler } from "@/app/lib/ai/ai-handler";
import { getUserApiKeys, getUserByEmail } from "@/app/lib/db/user";
import { prisma } from "@/app/lib/db/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { selectedText, chatContext, model = "models/gemini-2.0-flash", provider = "google" } = body;

  console.log('[Explain API] Incoming model:', model);
  console.log('[Explain API] Incoming provider:', provider);

  if (!selectedText || !chatContext) {
    return NextResponse.json({ error: "Missing selectedText or chatContext" }, { status: 400 });
  }

  const users = await getUserByEmail(session.user.email);
  if (!users) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const userApiKeys = await getUserApiKeys(users.id);
  const userApiKey = userApiKeys.find((key) => key.provider === provider);
  console.log('[Explain API] userApiKey for provider:', provider, userApiKey);

  let useOwnKey = false;
  if (!userApiKey) {
    const user = await prisma.user.findUnique({ where: { id: users.id } });
    if ((user?.freeChatCount ?? 0) >= 10) {
      return NextResponse.json(
        { error: "Free usage limit reached. Please add your own API key." },
        { status: 403 }
      );
    }
    useOwnKey = true;
  }

  if (useOwnKey) {
    try {
      await prisma.user.update({
        where: { id: users.id },
        data: { freeChatCount: { increment: 1 } },
      });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === "P2025") {
        await prisma.user.create({
          data: {
            id: users.id,
            email: session.user.email,
            name: session.user.name,
            freeChatCount: 1,
          },
        });
      } else {
        console.error("Error updating user count:", error);
      }
    }
  }

  // Compose prompt for explanation
  const prompt = [
    {
      role: "system",
      content: "You are an AI assistant. Explain the highlighted text in the context of the chat below. Be concise, clear, and reference the chat context if relevant. Keep your response short and to the point.",
    },
    ...chatContext.map((msg: any) => ({ role: msg.role, content: msg.content })),
    {
      role: "user",
      content: `Explain the following highlighted text: \"${selectedText}\"`,
    },
  ];

  const aiHandler = new AIHandler({
    provider,
    model,
    apiKey: userApiKey?.apiKey,
    streaming: false,
  });

  try {
    const explanation = await aiHandler.chat(prompt);
    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("AI explain error:", error);
    return NextResponse.json({ error: "Failed to generate explanation." }, { status: 500 });
  }
} 