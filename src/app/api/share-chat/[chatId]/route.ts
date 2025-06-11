import { NextRequest, NextResponse } from "next/server";
import { shareChat } from "@/app/lib/db/chats";

export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chat = await shareChat(params.chatId);
    return NextResponse.json({ shareToken: chat.shareToken });
  } catch (e) {
    return NextResponse.json({ error: "Unable to share chat" }, { status: 500 });
  }
}