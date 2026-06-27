const express = require('express');
const { createPaymentIntent, confirmPayment, processRefund, handleWebhook } = require('../controllers/paymentController');
const { authenticate, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);
router.post('/create-intent', authenticate, createPaymentIntent);
router.post('/:bookingId/confirm', authenticate, confirmPayment);
router.post('/:bookingId/refund', authenticate, restrictTo('admin'), processRefund);

module.exports = router;
