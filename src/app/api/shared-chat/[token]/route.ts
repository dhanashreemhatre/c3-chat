import { NextRequest, NextResponse } from "next/server";
import { getChatByShareToken } from "@/app/lib/db/chats";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const chat = await getChatByShareToken(params.token);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }
    return NextResponse.json({ chat });
  } catch (e) {
    return NextResponse.json({ error: `Unable to fetch chat ${e}` }, { status: 500 });
  }
}