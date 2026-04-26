import { prisma } from '../../../common/lib/prisma';

export class ClassifiedChatService {
  async getConversations(userId: string) {
    return prisma.classifiedConversation.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
        status: { not: 'blocked' },
      },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        ad: { select: { id: true, slug: true, title: true, media: { where: { isCover: true }, take: 1 } } },
        buyer: { select: { id: true, name: true, image: true } },
        sellerUser: { select: { id: true, name: true, image: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      }
    });
  }

  async startConversation(adId: string, buyerId: string) {
    const ad = await prisma.classifiedAd.findUnique({ where: { id: adId }, select: { userId: true } });
    if (!ad) throw new Error('Ad not found');
    if (ad.userId === buyerId) throw new Error('Cannot chat with yourself');

    const existing = await prisma.classifiedConversation.findUnique({
      where: { adId_buyerId: { adId, buyerId } }
    });
    if (existing) return existing;

    const conv = await prisma.classifiedConversation.create({
      data: {
        adId,
        buyerId,
        sellerId: ad.userId,
      }
    });

    await prisma.classifiedAd.update({
      where: { id: adId },
      data: { chatCount: { increment: 1 } }
    }).catch(() => {});

    return conv;
  }

  async getMessages(conversationId: string, userId: string) {
    const conv = await prisma.classifiedConversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ buyerId: userId }, { sellerId: userId }],
      }
    });
    if (!conv) throw new Error('Conversation not found or unauthorized');

    // Mark messages as read
    await prisma.classifiedMessage.updateMany({
      where: { conversationId, senderId: { not: userId }, isRead: false },
      data: { isRead: true }
    });

    return prisma.classifiedMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true, image: true } } }
    });
  }

  async sendMessage(conversationId: string, senderId: string, body: string, messageType = 'text', imageUrl?: string) {
    const conv = await prisma.classifiedConversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ buyerId: senderId }, { sellerId: senderId }],
      }
    });
    if (!conv) throw new Error('Conversation not found or unauthorized');

    const msg = await prisma.classifiedMessage.create({
      data: { conversationId, senderId, body, messageType, imageUrl },
      include: { sender: { select: { id: true, name: true, image: true } } }
    });

    await prisma.classifiedConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    });

    return msg;
  }

  async adminGetReportedChats() {
    return prisma.classifiedConversation.findMany({
      where: { isReported: true },
      include: {
        ad: { select: { title: true, slug: true } },
        buyer: { select: { name: true, email: true } },
        sellerUser: { select: { name: true, email: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 5 },
      }
    });
  }

  async adminBlockConversation(id: string) {
    return prisma.classifiedConversation.update({
      where: { id },
      data: { status: 'blocked' }
    });
  }
}

export default new ClassifiedChatService();
