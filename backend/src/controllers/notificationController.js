const notificationService = require('../services/notificationService');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getByUser(req.user.id, req.query);
    res.status(200).json(notifications);
  } catch (err) { next(err); }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const result = await notificationService.getUnreadCount(req.user.id);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

const markRead = async (req, res, next) => {
  try {
    const result = await notificationService.markRead(req.params.id, req.user.id);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

const markAllRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllRead(req.user.id);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

const deleteNotification = async (req, res, next) => {
  try {
    const result = await notificationService.remove(req.params.id, req.user.id);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

module.exports = { getNotifications, getUnreadCount, markRead, markAllRead, deleteNotification };
