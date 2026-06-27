const express = require('express');
const { getConversations, sendMessage, autoReply, markConversationRead } = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, getConversations);
router.post('/', authenticate, sendMessage);
router.post('/auto-reply', authenticate, autoReply);
router.put('/read', authenticate, markConversationRead);

module.exports = router;
