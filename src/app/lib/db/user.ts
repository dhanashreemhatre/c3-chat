import { prisma } from "./db";

export async function getUserApiKeys(userId: string) {
  return prisma.userApiKey.findMany({
    where: { userId },
    select: { apiKey: true, provider: true },
  });
}

export async function getUserApiKeyByProvider(
  userId: string,
  provider: string,
) {
  return prisma.userApiKey.findUnique({
    where: {
      userId_provider: {
        userId,
        provider,
      },
    },
    select: { apiKey: true, provider: true },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      freeChatCount: true,
      createdAt: true,
    },
  });
}
