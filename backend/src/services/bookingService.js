const prisma = require('../config/database');
const logger = require('../utils/logger');

class BookingService {
  async _triggerFees(booking) {
    try {
      const feeService = require('./feeService');
      await feeService.calculateAndCharge(booking);
    } catch (err) {
      logger.warn(`Fee auto-calc failed for booking ${booking.id}: ${err.message}`);
    }
  }

  async create(customerId, data) {
    const { profileId, date, time, duration, packageId, totalPrice, specialRequests } = data;

    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: { user: true }
    });

    if (!profile) {
      const err = new Error('Companion profile not found.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }

    if (profile.userId === customerId) {
      const err = new Error('You cannot book your own profile.');
      err.statusCode = 400;
      err.error = 'Booking Error';
      throw err;
    }

    const endTime = this.calcEndTime(time, duration);

    const existingConflict = await prisma.booking.findFirst({
      where: {
        profileId,
        date: new Date(date),
        startTime: time,
        status: { in: ['pending', 'confirmed'] }
      }
    });

    if (existingConflict) {
      const err = new Error('This time slot is already reserved. Please select another slot.');
      err.statusCode = 400;
      err.error = 'Conflict Error';
      throw err;
    }

    const bookingNumber = 'JIGO-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    return prisma.booking.create({
      data: {
        customerId,
        jigoloId: profile.userId,
        profileId,
        date: new Date(date),
        startTime: time,
        endTime,
        package: packageId,
        totalPrice: parseFloat(totalPrice),
        specialRequests,
        status: 'pending',
        paymentStatus: 'pending',
        bookingNumber
      },
      include: {
        customer: { select: { name: true, email: true, phone: true, profilePhoto: true } },
        jigolo: { select: { name: true, email: true, profilePhoto: true } },
        profile: { include: { user: { select: { name: true, location: true } } } }
      }
    });
  }

  calcEndTime(startTime, durationHours) {
    const [h, m] = startTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + Math.round(durationHours * 60);
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  }

  async getById(bookingId, userId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true, profilePhoto: true } },
        jigolo: { select: { id: true, name: true, email: true, profilePhoto: true } },
        profile: true,
        reviews: true,
        disputes: true
      }
    });

    if (!booking) {
      const err = new Error('Booking not found.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }

    if (booking.customerId !== userId && booking.jigoloId !== userId) {
      const err = new Error('You do not have access to this booking.');
      err.statusCode = 403;
      err.error = 'Forbidden';
      throw err;
    }

    return booking;
  }

  async getByUser(userId, role, options = {}) {
    const page = Math.max(1, parseInt(options.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(options.limit) || 20));
    const skip = (page - 1) * limit;

    if (role === 'jigolo') {
      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where: { jigoloId: userId }, skip, take: limit,
          include: {
            customer: { select: { name: true, email: true, phone: true, profilePhoto: true } },
            profile: { include: { user: { select: { name: true, location: true } } } }
          },
          orderBy: { date: 'desc' }
        }),
        prisma.booking.count({ where: { jigoloId: userId } })
      ]);
      return { bookings, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { customerId: userId }, skip, take: limit,
        include: {
          jigolo: { select: { name: true, email: true, profilePhoto: true } },
          profile: { include: { user: { select: { name: true, location: true } } } }
        },
        orderBy: { date: 'desc' }
      }),
      prisma.booking.count({ where: { customerId: userId } })
    ]);
    return { bookings, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async updateStatus(bookingId, userId, role, status, cancellationReason) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

    if (!booking) {
      const err = new Error('Booking record not found.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }

    if (role === 'jigolo' && booking.jigoloId !== userId) {
      const err = new Error('You are not authorized to update this booking.');
      err.statusCode = 403;
      err.error = 'Forbidden';
      throw err;
    }

    if (role === 'customer' && booking.customerId !== userId) {
      if (status !== 'cancelled') {
        const err = new Error('Customers can only cancel bookings.');
        err.statusCode = 403;
        err.error = 'Forbidden';
        throw err;
      }
    }

    const updateData = { status };
    if (status === 'cancelled') {
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = cancellationReason || null;
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData
    });

    if (status === 'completed') {
      await this._triggerFees(updated);
    }

    return updated;
  }
}

module.exports = new BookingService();
