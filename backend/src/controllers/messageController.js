const prisma = require('../config/database');
const messageService = require('../services/messageService');

const getConversations = async (req, res, next) => {
  try {
    const conversations = await messageService.getConversations(req.user.id);
    res.status(200).json(conversations);
  } catch (err) {
    next(err);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;
    const result = await messageService.send(req.user.id, receiverId, content);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const AUTO_REPLIES = [
  { keywords: ['hello', 'hi', 'hey', 'free'], reply: "Hey! I'm doing great. Let me check my schedule and get back to you shortly!" },
  { keywords: ['book', 'booking', 'request', 'schedule'], reply: "I've received your booking request. Let me review it and confirm soon!" },
  { keywords: ['thank', 'thanks', 'great', 'perfect'], reply: "You're most welcome! I'm really looking forward to our time together. It's going to be wonderful!" },
  { keywords: ['price', 'cost', 'rate', 'package'], reply: "You can view all my packages and prices on my profile page. Let me know if you have any special requests!" },
  { keywords: ['time', 'when', 'tomorrow', 'today'], reply: "I'll be there on time! Looking forward to meeting you. Let me know if you need me to prepare anything special." },
  { keywords: ['special', 'custom', 'request', 'want'], reply: "I always prioritize my clients' comfort and preferences. Feel free to share any special requests you have in mind!" },
  { keywords: ['place', 'meet', 'location', 'where'], reply: "I'm flexible with the meeting location. We can decide on a nice place that works for both of us!" },
  { keywords: ['dress', 'code', 'outfit', 'wear'], reply: "I'll dress to impress! Let me know the dress code and I'll make sure to match the occasion perfectly." },
];
const autoReply = async (req, res, next) => {
  try {
    const { receiverId, lastMessage } = req.body;
    const senderId = req.user.id;

    const lower = (lastMessage || '').toLowerCase();
    let reply = AUTO_REPLIES.find(r => r.keywords.some(k => lower.includes(k)));
    if (!reply) reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];

    const message = await prisma.message.create({
      data: { senderId, receiverId, content: reply.reply }
    });

    res.status(201).json({
      id: message.id,
      senderId,
      text: reply.reply,
      timestamp: message.createdAt.toISOString()
    });
  } catch (err) {
    next(err);
  }
};

const markConversationRead = async (req, res, next) => {
  try {
    const { otherUserId } = req.body;
    const result = await messageService.markConversationRead(req.user.id, otherUserId);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

module.exports = { getConversations, sendMessage, autoReply, markConversationRead };
