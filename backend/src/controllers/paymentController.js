const paymentService = require('../services/paymentService');

const createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId, amount } = req.body;
    const result = await paymentService.createPaymentIntent(bookingId, amount);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

const confirmPayment = async (req, res, next) => {
  try {
    const result = await paymentService.confirmPayment(req.params.bookingId);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

const processRefund = async (req, res, next) => {
  try {
    const result = await paymentService.processRefund(req.params.bookingId);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

const handleWebhook = async (req, res, next) => {
  try {
    const event = req.body;
    await paymentService.handleWebhook(event);
    res.status(200).json({ received: true });
  } catch (err) { next(err); }
};

module.exports = { createPaymentIntent, confirmPayment, processRefund, handleWebhook };
