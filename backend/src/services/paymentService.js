const prisma = require('../config/database');
const logger = require('../utils/logger');

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

class PaymentService {
  async createPaymentIntent(bookingId, amount) {
    if (!bookingId && !amount) {
      const err = new Error('Either bookingId or amount is required.');
      err.statusCode = 400;
      err.error = 'Validation Error';
      throw err;
    }

    let totalAmount = amount;

    if (bookingId) {
      const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
      if (!booking) {
        const err = new Error('Booking not found.');
        err.statusCode = 404;
        err.error = 'Not Found';
        throw err;
      }
      totalAmount = parseFloat(booking.totalPrice) * 100;

      if (!stripe) {
        logger.info(`[MOCK PAYMENT] Booking ${bookingId}: amount ₹${booking.totalPrice}`);
        await prisma.booking.update({
          where: { id: bookingId },
          data: { paymentStatus: 'paid' }
        });
        return { mock: true, status: 'paid', bookingId };
      }
    }

    if (!stripe) {
      return { mock: true, status: 'pending', amount: totalAmount, clientSecret: 'mock_secret' };
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(totalAmount)),
      currency: 'inr',
      metadata: bookingId ? { bookingId, bookingNumber: '' } : {}
    });

    return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id };
  }

  async confirmPayment(bookingId) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      const err = new Error('Booking not found.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }

    return prisma.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: 'paid' }
    });
  }

  async processRefund(bookingId) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      const err = new Error('Booking not found.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }

    if (!stripe) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { paymentStatus: 'refunded' }
      });
      return { mock: true, status: 'refunded', bookingId };
    }

    return prisma.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: 'refunded' }
    });
  }

  async handleWebhook(event) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await this.confirmPayment(paymentIntent.metadata.bookingId);
        break;
      case 'payment_intent.payment_failed':
        logger.error(`Payment failed for intent: ${event.data.object.id}`);
        break;
    }
  }
}

module.exports = new PaymentService();
