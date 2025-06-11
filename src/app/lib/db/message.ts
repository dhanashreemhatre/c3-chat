import { prisma } from "../db/db";


/**
 * Fetch all messages for a given chatId, ordered by creation time (ascending).
 */
export async function getMessagesByChatId(chatId: string) {
  return prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Create a new message for a chat.
 */
export async function createMessage(chatId: string, role: string, content: string, modelUsed: string) {
  return prisma.message.create({
    data: {
      chatId,
      role,
      content,
      modelUsed,
    },
  });
}
