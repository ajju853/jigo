const prisma = require('../config/database');
const logger = require('../utils/logger');

const createNotification = async ({ userId, type, title, message, link }) => {
  try {
    const notification = await prisma.notification.create({
      data: { userId, type, title, message, link }
    });
    logger.info(`Notification created for User: ${userId} | Title: ${title}`);
    return notification;
  } catch (err) {
    logger.error(`Failed to create notification:`, err);
  }
};

const getByUser = async (userId, options = {}) => {
  try {
    const page = Math.max(1, parseInt(options.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(options.limit) || 20));
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId }, skip, take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where: { userId } })
    ]);
    return { notifications, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  } catch (err) {
    logger.error(`Failed to get notifications:`, err);
    throw err;
  }
};

const getUnreadCount = async (userId) => {
  const count = await prisma.notification.count({
    where: { userId, isRead: false }
  });
  return { unreadCount: count };
};

const markRead = async (notificationId, userId) => {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification) {
    const err = new Error('Notification not found.');
    err.statusCode = 404;
    err.error = 'Not Found';
    throw err;
  }
  if (notification.userId !== userId) {
    const err = new Error('Not authorized.');
    err.statusCode = 403;
    err.error = 'Forbidden';
    throw err;
  }
  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true, readAt: new Date() }
  });
};

const markAllRead = async (userId) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() }
  });
  return { message: 'All notifications marked as read.' };
};

const remove = async (notificationId, userId) => {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification) {
    const err = new Error('Notification not found.');
    err.statusCode = 404;
    err.error = 'Not Found';
    throw err;
  }
  if (notification.userId !== userId) {
    const err = new Error('Not authorized.');
    err.statusCode = 403;
    err.error = 'Forbidden';
    throw err;
  }
  await prisma.notification.delete({ where: { id: notificationId } });
  return { message: 'Notification deleted.' };
};

module.exports = { createNotification, getByUser, getUnreadCount, markRead, markAllRead, remove };
