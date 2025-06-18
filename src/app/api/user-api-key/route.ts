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
    return NextResponse.json(
      { error: "Missing key or provider" },
      { status: 400 },
    );
  }
  // Store encrypted in production!
  await prisma.userApiKey.upsert({
    where: {
      userId_provider: {
        userId: session.user.id,
        provider: provider,
      },
    },
    update: { apiKey },
    create: { userId: session.user.id, apiKey, provider },
  });
  return NextResponse.json({ success: true });
}


export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKeys = await prisma.userApiKey.findMany({
    where: { userId: session.user.id },
    select: { provider: true, apiKey: true },
  });
  apiKeys.forEach((key) => {
    // Optionally, you can mask the API key for security
    key.apiKey = key.apiKey.replace(/.(?=.{4})/g, '*'); // Mask all but last 4 characters
  });
  if (!apiKeys || apiKeys.length === 0) {
    return NextResponse.json({ success: true, apiKeys: [] });
  }

  return NextResponse.json({ success: true, apiKeys });
}
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { provider } = await req.json();
  if (!provider) {
    return NextResponse.json({ error: "Provider is required" }, { status: 400 });
  }

  await prisma.userApiKey.deleteMany({
    where: {
      userId: session.user.id,
      provider: provider,
    },
  });

  return NextResponse.json({ success: true });
}