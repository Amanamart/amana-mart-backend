import { prisma } from '../common/lib/prisma';

export const getConversations = async (userId: string) => {
  return prisma.conversation.findMany({
    where: {
      members: { some: { userId } },
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, role: true, image: true } } },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { sender: { select: { name: true } } },
      },
      _count: {
        select: { messages: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
};

export const createConversation = async (data: {
  title?: string;
  type?: string;
  memberIds: string[];
}) => {
  const { memberIds, ...rest } = data;
  return prisma.conversation.create({
    data: {
      ...rest,
      members: {
        create: memberIds.map((userId) => ({ userId })),
      },
    },
    include: { members: { include: { user: true } } },
  });
};

export const getMessages = async (conversationId: string, page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
    include: {
      sender: { select: { id: true, name: true, role: true, image: true } },
      attachments: true,
      reads: true,
    },
  });
};

export const sendMessage = async (data: {
  conversationId: string;
  senderId: string;
  body?: string;
  type?: string;
}) => {
  const message = await prisma.message.create({
    data: {
      conversationId: data.conversationId,
      senderId: data.senderId,
      body: data.body,
      type: data.type || 'text',
    },
    include: {
      sender: { select: { id: true, name: true, role: true, image: true } },
      attachments: true,
    },
  });

  // Update conversation updatedAt
  await prisma.conversation.update({
    where: { id: data.conversationId },
    data: { updatedAt: new Date() },
  });

  return message;
};

export const markMessageRead = async (messageId: string, userId: string) => {
  return prisma.messageRead.upsert({
    where: { messageId_userId: { messageId, userId } },
    create: { messageId, userId },
    update: { readAt: new Date() },
  });
};

export const getUnreadCount = async (userId: string) => {
  const conversations = await prisma.conversation.findMany({
    where: { members: { some: { userId } } },
    include: {
      messages: {
        where: {
          senderId: { not: userId },
          reads: { none: { userId } },
        },
      },
    },
  });

  return conversations.reduce((total, c) => total + c.messages.length, 0);
};


