const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/database');

const connectedUsers = new Map();

function setupSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user || !user.isActive) return next(new Error('User not found or inactive'));
      socket.userId = user.id;
      socket.userName = user.name;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    connectedUsers.set(socket.userId, socket.id);
    io.emit('users:online', Array.from(connectedUsers.keys()));

    socket.join(`user:${socket.userId}`);

    socket.on('messages:send', async (data, callback) => {
      try {
        const { receiverId, content } = data;
        const message = await prisma.message.create({
          data: { senderId: socket.userId, receiverId, content }
        });

        const messageData = {
          id: message.id,
          senderId: socket.userId,
          text: content,
          timestamp: message.createdAt.toISOString()
        };

        io.to(`user:${receiverId}`).emit('messages:received', messageData);
        socket.emit('messages:sent', messageData);
        if (callback) callback({ success: true, message: messageData });
      } catch (err) {
        if (callback) callback({ success: false, error: err.message });
      }
    });

    socket.on('messages:mark-read', async (data) => {
      const { senderId } = data;
      await prisma.message.updateMany({
        where: { senderId, receiverId: socket.userId, isRead: false },
        data: { isRead: true, readAt: new Date() }
      });
      io.to(`user:${senderId}`).emit('messages:read', { readBy: socket.userId });
    });

    socket.on('messages:typing', (data) => {
      const { receiverId, isTyping } = data;
      io.to(`user:${receiverId}`).emit('messages:typing', {
        userId: socket.userId,
        name: socket.userName,
        isTyping
      });
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(socket.userId);
      io.emit('users:offline', socket.userId);
    });
  });
}

function getOnlineUsers() {
  return Array.from(connectedUsers.keys());
}

module.exports = { setupSocket, getOnlineUsers };
