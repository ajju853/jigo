const prisma = require('../config/database');

class MessageService {
  async getConversations(userId) {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true, profilePhoto: true } },
        receiver: { select: { id: true, name: true, profilePhoto: true } }
      }
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, profilePhoto: true }
    });

    const threads = {};

    messages.forEach(msg => {
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!otherUser) return;
      const otherId = otherUser.id;

      if (!threads[otherId]) {
        threads[otherId] = {
          conversationId: `conv_${[userId, otherId].sort().join('_')}`,
          userIds: [userId, otherId],
          participants: {
            [userId]: { name: user.name, photo: user.profilePhoto, online: true },
            [otherId]: { name: otherUser.name, photo: otherUser.profilePhoto, online: true }
          },
          messages: [],
          unreadCount: 0
        };
      }

      threads[otherId].messages.push({
        id: msg.id,
        senderId: msg.senderId,
        text: msg.content,
        timestamp: msg.createdAt.toISOString()
      });

      threads[otherId].lastMessage = msg.content;
      threads[otherId].lastUpdated = msg.createdAt.toISOString();

      if (msg.receiverId === userId && !msg.isRead) {
        threads[otherId].unreadCount += 1;
      }
    });

    return Object.values(threads).sort(
      (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)
    );
  }

  async markConversationRead(userId, otherUserId) {
    const result = await prisma.message.updateMany({
      where: { senderId: otherUserId, receiverId: userId, isRead: false },
      data: { isRead: true, readAt: new Date() }
    });
    return { markedRead: result.count };
  }

  async send(senderId, receiverId, content) {
    const recipient = await prisma.user.findUnique({ where: { id: receiverId } });

    if (!recipient) {
      const err = new Error('Recipient user not found.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }

    const message = await prisma.message.create({
      data: { senderId, receiverId, content }
    });

    const conversationId = `conv_${[senderId, receiverId].sort().join('_')}`;

    const activeMessages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    const mappedMessages = activeMessages.map(m => ({
      id: m.id,
      senderId: m.senderId,
      text: m.content,
      timestamp: m.createdAt.toISOString()
    }));

    const senderUser = await prisma.user.findUnique({
      where: { id: senderId },
      select: { name: true, profilePhoto: true }
    });

    const conversation = {
      conversationId,
      userIds: [senderId, receiverId],
      participants: {
        [senderId]: { name: senderUser.name, photo: senderUser.profilePhoto, online: true },
        [receiverId]: { name: recipient.name, photo: recipient.profilePhoto, online: true }
      },
      lastMessage: content,
      lastUpdated: message.createdAt.toISOString(),
      messages: mappedMessages,
      unreadCount: 0
    };

    return {
      message: {
        id: message.id,
        senderId,
        text: content,
        timestamp: message.createdAt.toISOString()
      },
      conversation
    };
  }
}

module.exports = new MessageService();
