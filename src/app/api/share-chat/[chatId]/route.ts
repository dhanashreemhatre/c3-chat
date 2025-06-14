import { NextRequest, NextResponse } from "next/server";
import { shareChat } from "@/app/lib/db/chats";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const { chatId } = await params;
    const chat = await shareChat(chatId);
    return NextResponse.json({ shareToken: chat.shareToken });
  } catch (error) {
    console.error("Error sharing chat:", error);
    return NextResponse.json(
      { error: "Unable to share chat" },
      { status: 500 },
    );
  }
}
