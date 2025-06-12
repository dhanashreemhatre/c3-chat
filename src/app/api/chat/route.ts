import { auth } from "@/app/auth";
import { NextResponse } from "next/server";
import { AIHandler, SupportedModels } from "../../lib/ai/ai-handler";
import { addMessage, createChat, getChatById, getChatsByUser, softDeleteAllChatsForUser } from "../../lib/db/chats";
import { getMessagesByChatId } from "@/app/lib/db/message";
import { getUserApiKey, getUserByEmail } from "@/app/lib/db/user";
import { prisma } from "@/app/lib/db/db";
import { webSearch } from "@/app/lib/websearch"; // We'll define this helper
import { get } from "http";

export async function POST(req: Request) {
  const session = await auth();
  console.log("Session:", session);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages, provider, chatId, title, search = false } = await req.json();
  const users = await getUserByEmail(session.user.email);
  // Check for user API key
  if (!users) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const userApiKey = await getUserApiKey(users.id, provider);

  let useOwnKey = false;
  if (!userApiKey) {
    // Check free usage
    const user = await prisma.user.findUnique({ where: { id: users.id } });
    if ((user?.freeChatCount ?? 0) >= 10) {
      return NextResponse.json({ error: "Free usage limit reached. Please add your own API key." }, { status: 403 });
    }
    useOwnKey = true;
  }

  let currentChatId = chatId;
  // If no chatId, create a new chat
  if (!currentChatId) {
    const chat = await createChat(users.id, title);
    currentChatId = chat.id;
  }

  // Save user message
  const userMessage = messages[messages.length - 1];
  await addMessage(currentChatId, "user", userMessage.content, provider); // <-- Add this line

  let searchResults = null;
  if (search) {
    // Use the last user message as the search query
    searchResults = await webSearch(userMessage.content);
  }

  // Optionally, prepend or append search results to the messages for the LLM
  let messagesForLLM = messages;
  if (searchResults) {
    messagesForLLM = [
      ...messages,
      {
        role: "system",
        content: `Web search results:\n${JSON.stringify(searchResults)}`,
      },
    ];
  }

  // If using own key, increment freeChatCount
  if (useOwnKey) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { freeChatCount: { increment: 1 } },
    });
  }

  // Pass userApiKey?.apiKey to your AIHandler if present
  const aiHandler = new AIHandler({
    provider: provider as SupportedModels,
    apiKey: userApiKey?.apiKey, // Use user's key if present
  });

  try {
    const reply = await aiHandler.chat(messagesForLLM);

    // Save AI reply
    await addMessage(currentChatId, "assistant", reply, provider);

    return NextResponse.json({ reply, chatId: currentChatId, searchResults });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to get AI response." }, { status: 500 });
  }
}

// Fetch messages for a chatId for the logged-in user
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get("chatId");

  if (chatId) {
    // Fetch messages for a chat
    const chat = await getChatById(chatId);
    if (!chat || chat.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or access denied" }, { status: 404 });
    }
    const messages = await getMessagesByChatId(chatId);
    console.log("Fetched messages:", messages);
    return NextResponse.json({ messages });
  } else {
    // Fetch all chats for the user
    try {
      const chats = await getChatsByUser(session.user.id);
      return NextResponse.json({ chats });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed to fetch chat sessions." }, { status: 500 });
    }
  }
}

// Delete all chats for the logged-in user
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await softDeleteAllChatsForUser(session.user.id);
  return NextResponse.json({ success: true });
}
