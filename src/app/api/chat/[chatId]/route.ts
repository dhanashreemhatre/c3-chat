import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { softDeleteChat, getChatById } from "@/app/lib/db/chats";

export async function DELETE(
  // req: Request,
  { params }: { params: { chatId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const chatId = params.chatId;
  if (!chatId) {
    return NextResponse.json({ error: "chatId is required" }, { status: 400 });
  }

  // Ensure the chat belongs to the user
  const chat = await getChatById(chatId);
  if (!chat || chat.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found or access denied" }, { status: 404 });
  }

  await softDeleteChat(chatId);
  return NextResponse.json({ success: true });
}