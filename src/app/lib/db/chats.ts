import { prisma } from "../db/db";
import { randomBytes } from "crypto";

export async function createChat(userId: string, title?: string) {
  return prisma.chat.create({
    data: {
      userId,
      title: title || "New Chat",
    },
  });
}

export async function getChatsByUser(userId: string) {
  return prisma.chat.findMany({
    where: { userId, is_deleted: false },
    orderBy: { createdAt: "desc" },
    include: { messages: true },
  });
}

export async function getChatById(chatId: string) {
  return prisma.chat.findUnique({
    where: { id: chatId },
    include: { messages: true },
  });
}

export async function addMessage(chatId: string, role: string, content: string, modelUsed: string) {
  return prisma.message.create({
    data: {
      chatId,
      role,
      content,
      modelUsed,
    },
  });
}

export async function updateChatTitle(chatId: string, title: string) {
  return prisma.chat.update({
    where: { id: chatId },
    data: { title },
  });
}

export async function deleteChat(chatId: string) {
  return prisma.chat.delete({
    where: { id: chatId },
  });
}

// Soft delete a chat (set deletedAt timestamp)
export async function softDeleteChat(chatId: string) {
  return prisma.chat.update({
    where: { id: chatId },
    data: { updatedAt: new Date(), is_deleted: true },
  });
}

// Soft delete all chats for a particular user
export async function softDeleteAllChatsForUser(userId: string) {
  return prisma.chat.updateMany({
    where: { userId },
    data: { updatedAt: new Date(), is_deleted: true },
  });
}

// Generate and set a share token for a chat
export async function shareChat(chatId: string) {
  const token = randomBytes(16).toString("hex");
  return prisma.chat.update({
    where: { id: chatId },
    data: { shareToken: token },
  });
}

// Fetch chat by share token (for public viewing)
export async function getChatByShareToken(token: string) {
  return prisma.chat.findUnique({
    where: { shareToken: token },
    include: { messages: true },
  });
}
