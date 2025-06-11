import { auth } from "@/app/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { apiKey, provider } = await req.json();
  if (!apiKey || !provider) {
    return NextResponse.json({ error: "Missing key or provider" }, { status: 400 });
  }
  // Store encrypted in production!
  await prisma.userApiKey.upsert({
    where: { userId: session.user.id },
    update: { apiKey, provider },
    create: { userId: session.user.id, apiKey, provider },
  });
  return NextResponse.json({ success: true });
}