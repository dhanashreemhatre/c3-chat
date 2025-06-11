import { prisma } from "../db/db";

export async function getUserApiKey(userId: string, provider: string) {
  return prisma.userApiKey.findUnique({
    where: { userId },
    select: { apiKey: true, provider: true },
  });
}