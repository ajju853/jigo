const express = require('express');
const { getNotifications, getUnreadCount, markRead, markAllRead, deleteNotification } = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.put('/:id/read', authenticate, markRead);
router.put('/read-all', authenticate, markAllRead);
router.delete('/:id', authenticate, deleteNotification);

module.exports = router;
