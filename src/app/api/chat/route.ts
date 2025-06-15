import { auth } from "@/app/auth";
import { NextResponse } from "next/server";
import { AIHandler } from "../../lib/ai/ai-handler";
import {
  addMessage,
  createChat,
  getChatById,
  getChatsByUser,
  softDeleteAllChatsForUser,
} from "../../lib/db/chats";
import { getMessagesByChatId } from "@/app/lib/db/message";
import { getUserApiKeys, getUserByEmail } from "@/app/lib/db/user";
import { prisma } from "@/app/lib/db/db";
// import { webSearch } from "@/app/lib/websearch";
import { searchGoogle } from "@/app/lib/websearch";

export async function POST(req: Request) {
  console.log("=== API ROUTE START ===");

  const session = await auth();
  console.log("Session user:", session?.user?.email);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  console.log("Request body:", JSON.stringify(body, null, 2));

  const {
    messages,
    model,
    provider,
    chatId,
    title,
    search = false,
    stream = true, // Enable streaming by default
  } = body;

  const users = await getUserByEmail(session.user.email);
  if (!users) {
    console.log("User not found");
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  console.log("Found user:", users.id);

  const userApiKeys = await getUserApiKeys(users.id);
  const userApiKey = userApiKeys.find((key) => key.provider === provider);

  let useOwnKey = false;
  if (!userApiKey) {
    const user = await prisma.user.findUnique({ where: { id: users.id } });
    if ((user?.freeChatCount ?? 0) >= 10) {
      return NextResponse.json(
        {
          error: "Free usage limit reached. Please add your own API key.",
        },
        { status: 403 },
      );
    }
    useOwnKey = true;
  }

  let currentChatId = chatId;
  if (!currentChatId) {
    console.log("Creating new chat");
    const chat = await createChat(users.id, title);
    currentChatId = chat.id;
    console.log("Created chat with ID:", currentChatId);
  }

  const userMessage = messages[messages.length - 1];
  console.log("Saving user message:", userMessage.content);
  await addMessage(currentChatId, "user", userMessage.content, provider);

  let searchResults = null;
  if (search) {
    try {
      console.log("Performing web search for:", userMessage.content);
      searchResults = await searchGoogle(userMessage.content);

      if (searchResults.error) {
        console.log("Search completed with error:", searchResults.error);
        // Continue without search results
        searchResults = null;
      } else {
        console.log("Search completed successfully");
      }
    } catch (error) {
      console.error("Search failed, continuing without web results:", error);
      searchResults = null;
    }
  }

  let messagesForLLM = messages;
  if (searchResults) {
    // Format search results with full content
    const formattedResults = searchResults.items
      .filter(item => item.scrapedContent && item.scrapedContent.length > 100) // Only include results with substantial content
      .slice(0, 3) // Limit to top 3 results with content
      .map((item, index) =>
        `${index + 1}. **${item.title}**
   URL: ${item.link}
   Summary: ${item.snippet}
   
   Full Content:
   ${item.scrapedContent}
   
   ---`
      ).join('\n\n');

    if (formattedResults) {
      const searchContext = `You are an AI assistant tasked with answering the user's question using information from web search results.

USER QUESTION: "${userMessage.content}"

WEB SEARCH RESULTS:
${formattedResults}

INSTRUCTIONS:
1. ANSWER REQUIREMENTS:
   - Provide a direct, comprehensive answer to the user's question
   - Use ONLY information found in the provided web search results
   - If the search results don't contain enough information to answer the question, clearly state this limitation
   - Synthesize information from multiple sources when relevant

2. CITATION REQUIREMENTS:
   - Always cite your sources using [ Source: URL or Title ] format
   - Include citations immediately after each claim or piece of information
   - If multiple sources support the same point, cite all relevant sources
   - Never make claims without proper citations to the search results

3. HANDLING CONFLICTING INFORMATION:
   - If sources contradict each other, explicitly mention the contradiction
   - Present different viewpoints with their respective sources
   - Do not choose sides unless there's overwhelming evidence from more authoritative sources

4. QUALITY GUIDELINES:
   - Structure your answer logically with clear sections if the topic is complex
   - Use specific details, numbers, dates, and examples from the sources
   - Avoid generic statements - be specific and factual
   - If information is outdated, mention the publication date

5. LIMITATIONS:
   - If the search results are insufficient or off-topic, say: "The provided search results do not contain enough relevant information to fully answer your question about [topic]."
   - Don't speculate or add information not found in the search results
   - If you need more recent information, suggest the user perform a new search

Please provide your answer now, following all the above guidelines.`;

      // Put system message FIRST, then other messages
      messagesForLLM = [
        {
          role: "system",
          content: searchContext,
        },
        ...messages // Add all original messages after the system message
      ];
    }
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

  const aiHandler = new AIHandler({
    provider,
    model,
    apiKey: userApiKey?.apiKey,
  });

  try {
    // If streaming is requested, return a streaming response
    if (stream) {
      console.log("Starting streaming response");
      const encoder = new TextEncoder();
      let fullResponse = "";

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            // Send initial metadata
            const initialData = {
              type: "metadata",
              chatId: currentChatId,
              searchResults,
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`)
            );

            // Get streaming response from AI
            console.log("Getting streaming response from AI handler");
            const stream = aiHandler.chatStream(messagesForLLM);

            for await (const chunk of stream) {
              console.log("Received chunk:", chunk);
              fullResponse += chunk;
              const data = {
                type: "content",
                content: chunk,
                fullContent: fullResponse,
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
              );
            }

            // Save the complete response to database
            console.log("Saving complete response to database");
            await addMessage(currentChatId, "assistant", fullResponse, provider);

            // Send completion signal
            const completionData = {
              type: "done",
              fullContent: fullResponse,
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(completionData)}\n\n`)
            );

            console.log("Streaming completed successfully");
            controller.close();
          } catch (error) {
            console.error("Streaming error:", error);
            const errorData = {
              type: "error",
              error: "Failed to get AI response.",
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`)
            );
            controller.close();
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    } else {
      // Non-streaming response (fallback)
      console.log("Using non-streaming response");
      const reply = await aiHandler.chat(messagesForLLM);
      await addMessage(currentChatId, "assistant", reply, provider);

      return NextResponse.json({
        reply,
        chatId: currentChatId,
        searchResults,
      });
    }
  } catch (error) {
    console.error("=== API ROUTE ERROR ===", error);
    return NextResponse.json(
      { error: "Failed to get AI response." },
      { status: 500 },
    );
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
      return NextResponse.json(
        { error: "Not found or access denied" },
        { status: 404 },
      );
    }
    const messages = await getMessagesByChatId(chatId);
    // console.log("Fetched messages:", messages);
    return NextResponse.json({ messages });
  } else {
    // Fetch all chats for the user
    try {
      // console.log("Fetching chats for user:", session.user.id);
      const chats = await getChatsByUser(session.user.id);
      // console.log("Fetched chats:", chats);
      return NextResponse.json({ chats });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to fetch chat sessions." },
        { status: 500 },
      );
    }
  }
}

// Delete all chats for the logged-in user
export async function DELETE() {
  // req: Request
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await softDeleteAllChatsForUser(session.user.id);
  return NextResponse.json({ success: true });
}
