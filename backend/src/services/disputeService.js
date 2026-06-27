const prisma = require('../config/database');

class DisputeService {
  async raise(userId, data) {
    const { bookingId, type, reason, description } = data;
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      const err = new Error('Booking not found.'); err.statusCode = 404; err.error = 'Not Found'; throw err;
    }
    if (booking.customerId !== userId && booking.jigoloId !== userId) {
      const err = new Error('You are not a participant in this booking.'); err.statusCode = 403; err.error = 'Forbidden'; throw err;
    }

    const existing = await prisma.dispute.findFirst({
      where: { bookingId, status: { in: ['pending', 'investigating'] } }
    });
    if (existing) {
      const err = new Error('A dispute is already in progress for this booking.'); err.statusCode = 400; err.error = 'Conflict'; throw err;
    }

    const raisedAgainst = booking.customerId === userId ? booking.jigoloId : booking.customerId;

    return prisma.$transaction(async (tx) => {
      const dispute = await tx.dispute.create({
        data: { bookingId, raisedById: userId, raisedAgainstId: raisedAgainst, type, reason, description, status: 'pending', priority: 'medium' }
      });
      await tx.disputeMessage.create({
        data: { disputeId: dispute.id, senderId: userId, message: `Dispute raised: ${reason}`, isInternal: false }
      });
      await tx.disputeAction.create({
        data: { disputeId: dispute.id, actionType: 'raise', note: 'Dispute initiated by user', performedBy: userId }
      });
      await tx.notification.create({
        data: { userId: raisedAgainst, type: 'system_alert', title: 'Dispute Raised', message: `A dispute has been raised for booking #${booking.bookingNumber || booking.id.slice(0, 8)}` }
      });
      return dispute;
    });
  }

  async getById(disputeId, userId) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { messages: { orderBy: { createdAt: 'asc' } }, evidence: true, actions: { orderBy: { createdAt: 'desc' } }, booking: true }
    });
    if (!dispute) {
      const err = new Error('Dispute not found.'); err.statusCode = 404; err.error = 'Not Found'; throw err;
    }
    if (dispute.raisedById !== userId && dispute.raisedAgainstId !== userId && userId !== 'admin') {
      const err = new Error('Not authorized.'); err.statusCode = 403; err.error = 'Forbidden'; throw err;
    }
    return dispute;
  }

  async getByUser(userId, options = {}) {
    const page = Math.max(1, parseInt(options.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(options.limit) || 20));
    const skip = (page - 1) * limit;

    const where = { OR: [{ raisedById: userId }, { raisedAgainstId: userId }] };
    const [rows, total] = await Promise.all([
      prisma.dispute.findMany({ where, skip, take: limit, include: { booking: { select: { bookingNumber: true, date: true, totalPrice: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.dispute.count({ where })
    ]);
    return { disputes: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async addMessage(disputeId, userId, data) {
    const { message, isInternal } = data;
    const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
    if (!dispute) {
      const err = new Error('Dispute not found.'); err.statusCode = 404; err.error = 'Not Found'; throw err;
    }
    if (dispute.raisedById !== userId && dispute.raisedAgainstId !== userId) {
      const err = new Error('Not authorized.'); err.statusCode = 403; err.error = 'Forbidden'; throw err;
    }
    return prisma.disputeMessage.create({
      data: { disputeId, senderId: userId, message, isInternal: isInternal || false }
    });
  }

  async addEvidence(disputeId, userId, data) {
    const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
    if (!dispute) {
      const err = new Error('Dispute not found.'); err.statusCode = 404; err.error = 'Not Found'; throw err;
    }
    return prisma.disputeEvidence.create({
      data: { disputeId, evidenceType: data.evidenceType, evidenceUrl: data.evidenceUrl, description: data.description, uploadedBy: userId }
    });
  }

  async resolve(disputeId, adminId, resolution) {
    const dispute = await prisma.dispute.findUnique({ where: { id: disputeId }, include: { booking: true } });
    if (!dispute) {
      const err = new Error('Dispute not found.'); err.statusCode = 404; err.error = 'Not Found'; throw err;
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.dispute.update({
        where: { id: disputeId },
        data: { status: 'resolved', resolvedBy: adminId, resolvedAt: new Date(), resolutionNotes: resolution.notes }
      });

      if (resolution.type === 'refund' || resolution.type === 'compensation') {
        await tx.booking.update({
          where: { id: dispute.bookingId },
          data: { paymentStatus: 'refunded', status: 'cancelled' }
        });
      }

      await tx.disputeAction.create({
        data: { disputeId, actionType: 'resolve', note: `Resolved: ${resolution.type} - ${resolution.notes || ''}`, performedBy: adminId }
      });

      await tx.notification.createMany({
        data: [
          { userId: dispute.raisedById, type: 'system_alert', title: 'Dispute Resolved', message: `Dispute #${dispute.id.slice(0, 8)} has been resolved.` },
          { userId: dispute.raisedAgainstId, type: 'system_alert', title: 'Dispute Resolved', message: `Dispute #${dispute.id.slice(0, 8)} has been resolved.` }
        ]
      });
      return updated;
    });
  }

  async getAll(filters = {}) {
    const status = typeof filters === 'string' ? filters : filters.status;
    const where = status ? { status } : {};
    const page = Math.max(1, parseInt(filters.page || 1));
    const limit = Math.min(100, Math.max(1, parseInt(filters.limit || 20)));
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      prisma.dispute.findMany({
        where, skip, take: limit,
        include: { booking: { select: { bookingNumber: true, date: true } }, raisedBy: { select: { name: true } }, raisedAgainst: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.dispute.count({ where })
    ]);
    return { disputes: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}

module.exports = new DisputeService();
