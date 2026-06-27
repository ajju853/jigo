const prisma = require('../config/database');

class FeeService {
  async getConfigurations() {
    return prisma.feeConfiguration.findMany({
      where: { isActive: true },
      orderBy: { key: 'asc' }
    });
  }

  async updateConfiguration(key, value, adminId, reason) {
    const config = await prisma.feeConfiguration.findUnique({ where: { key } });
    if (!config) {
      const err = new Error(`Fee configuration '${key}' not found.`);
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }

    const oldValue = config.value.toString();

    const updated = await prisma.feeConfiguration.update({
      where: { key },
      data: { value: parseFloat(value) }
    });

    await prisma.feeHistory.create({
      data: {
        entityType: 'fee_configuration',
        entityId: config.id,
        fieldName: key,
        oldValue,
        newValue: value.toString(),
        changedBy: adminId,
        reason
      }
    });

    return updated;
  }

  async getJigoloPreference(jigoloId) {
    let pref = await prisma.jigoloFeePreference.findUnique({
      where: { jigoloId }
    });

    if (!pref) {
      pref = await prisma.jigoloFeePreference.create({
        data: { jigoloId }
      });
    }

    return pref;
  }

  async updateJigoloPreference(jigoloId, data) {
    const allowed = ['customRate', 'feeCap', 'preferredPayoutMethod', 'autoDeduct', 'payoutSchedule'];
    const updateData = {};
    for (const key of allowed) {
      if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    }

    return prisma.jigoloFeePreference.upsert({
      where: { jigoloId },
      update: updateData,
      create: { jigoloId, ...updateData }
    });
  }

  async calculateFees(bookingId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { jigolo: true, profile: true }
    });

    if (!booking) {
      const err = new Error('Booking not found.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }

    const baseAmount = parseFloat(booking.totalPrice);
    const isCancelled = booking.status === 'cancelled';

    const configs = await prisma.feeConfiguration.findMany({ where: { isActive: true } });
    const configMap = {};
    for (const c of configs) {
      configMap[c.key] = parseFloat(c.value);
    }

    const platformRate = configMap['platform_fee_percent'] || 10;
    const jigoloBaseRate = configMap['jigolo_fee_percent'] || 8;
    const transactionRate = configMap['transaction_fee_percent'] || 2.9;
    const transactionFlat = configMap['transaction_fee_flat'] || 0.30;
    const cancellationRate = configMap['cancellation_fee_percent'] || 25;

    const jigoloPref = await prisma.jigoloFeePreference.findUnique({
      where: { jigoloId: booking.jigoloId }
    });

    const effectiveJigoloRate = jigoloPref?.customRate
      ? Math.min(parseFloat(jigoloPref.customRate), jigoloBaseRate)
      : jigoloBaseRate;

    const jigoloCap = jigoloPref?.feeCap ? parseFloat(jigoloPref.feeCap) : null;

    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: booking.customerId,
        status: 'active',
        endDate: { gte: new Date() }
      },
      include: { plan: true }
    });

    const subscriptionDiscountPercent = subscription
      ? parseFloat(subscription.plan.feeDiscountPercent)
      : 0;

    let platformFee = baseAmount * (platformRate / 100);
    let jigoloFee = baseAmount * (effectiveJigoloRate / 100);
    if (jigoloCap && jigoloFee > jigoloCap) {
      jigoloFee = jigoloCap;
    }

    let transactionFee = baseAmount * (transactionRate / 100) + transactionFlat;
    let cancellationFee = 0;

    if (isCancelled) {
      cancellationFee = baseAmount * (cancellationRate / 100);
    }

    const discountAmount = baseAmount * (subscriptionDiscountPercent / 100);
    let totalFee = platformFee + jigoloFee + transactionFee + cancellationFee - discountAmount;
    if (totalFee < 0) totalFee = 0;

    const netAmount = baseAmount - totalFee;

    const breakdown = {
      baseAmount,
      platformFee: { rate: platformRate, amount: parseFloat(platformFee.toFixed(2)) },
      jigoloFee: { rate: effectiveJigoloRate, amount: parseFloat(jigoloFee.toFixed(2)), cap: jigoloCap },
      transactionFee: { rate: transactionRate, flat: transactionFlat, amount: parseFloat(transactionFee.toFixed(2)) },
      cancellationFee: { rate: isCancelled ? cancellationRate : 0, amount: parseFloat(cancellationFee.toFixed(2)) },
      subscriptionDiscount: { percent: subscriptionDiscountPercent, amount: parseFloat(discountAmount.toFixed(2)) },
      totalFee: parseFloat(totalFee.toFixed(2)),
      netAmount: parseFloat(netAmount.toFixed(2))
    };

    return prisma.feeCalculation.create({
      data: {
        bookingId,
        baseAmount,
        platformRate,
        jigoloRate: effectiveJigoloRate,
        transactionRate,
        platformFee: parseFloat(platformFee.toFixed(2)),
        jigoloFee: parseFloat(jigoloFee.toFixed(2)),
        transactionFee: parseFloat(transactionFee.toFixed(2)),
        cancellationFee: parseFloat(cancellationFee.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        discountType: subscription ? 'subscription' : null,
        totalFee: parseFloat(totalFee.toFixed(2)),
        netAmount: parseFloat(netAmount.toFixed(2)),
        breakdown
      }
    });
  }

  async createFeeTransaction(bookingId) {
    const existing = await prisma.feeTransaction.findUnique({ where: { bookingId } });
    if (existing) {
      const err = new Error('Fee transaction already exists for this booking.');
      err.statusCode = 409;
      err.error = 'Conflict';
      throw err;
    }

    const calculation = await this.calculateFees(bookingId);
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

    return prisma.feeTransaction.create({
      data: {
        bookingId,
        jigoloId: booking.jigoloId,
        customerId: booking.customerId,
        platformFee: calculation.platformFee,
        jigoloFee: calculation.jigoloFee,
        transactionFee: calculation.transactionFee,
        cancellationFee: calculation.cancellationFee,
        subscriptionDiscount: calculation.discountAmount,
        totalFee: calculation.totalFee,
        netAmount: calculation.netAmount,
        bookingAmount: calculation.baseAmount,
        status: 'pending'
      }
    });
  }

  async calculateAndCharge(booking) {
    try {
      const existing = await prisma.feeTransaction.findUnique({ where: { bookingId: booking.id } });
      if (existing) return existing;

      const calculation = await this.calculateFees(booking.id);
      const tx = await prisma.feeTransaction.create({
        data: {
          bookingId: booking.id,
          jigoloId: booking.jigoloId,
          customerId: booking.customerId,
          platformFee: calculation.platformFee,
          jigoloFee: calculation.jigoloFee,
          transactionFee: calculation.transactionFee,
          cancellationFee: calculation.cancellationFee,
          subscriptionDiscount: calculation.discountAmount,
          totalFee: calculation.totalFee,
          netAmount: calculation.netAmount,
          bookingAmount: calculation.baseAmount,
          status: 'pending'
        }
      });
      return tx;
    } catch (err) {
      const logger = require('../utils/logger');
      logger.error(`calculateAndCharge failed for booking ${booking.id}: ${err.message}`);
      throw err;
    }
  }

  async getFeeTransactions(filters = {}) {
    const where = {};
    if (filters.jigoloId) where.jigoloId = filters.jigoloId;
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.status) where.status = filters.status;
    if (filters.bookingId) where.bookingId = filters.bookingId;

    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(filters.limit) || 20));
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      prisma.feeTransaction.findMany({
        where, skip, take: limit,
        include: {
          booking: { select: { bookingNumber: true, date: true, status: true } },
          jigolo: { select: { name: true, email: true } },
          customer: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.feeTransaction.count({ where })
    ]);
    return { transactions: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getFeeTransactionById(id) {
    const tx = await prisma.feeTransaction.findUnique({
      where: { id },
      include: {
        booking: true,
        jigolo: { select: { name: true, email: true } },
        customer: { select: { name: true, email: true } },
        feeDisputes: true
      }
    });

    if (!tx) {
      const err = new Error('Fee transaction not found.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }

    return tx;
  }

  async settleFee(id, adminId) {
    const tx = await prisma.feeTransaction.findUnique({ where: { id } });
    if (!tx) {
      const err = new Error('Fee transaction not found.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }

    if (tx.status === 'settled') {
      const err = new Error('Fee transaction already settled.');
      err.statusCode = 400;
      err.error = 'Bad Request';
      throw err;
    }

    return prisma.feeTransaction.update({
      where: { id },
      data: { status: 'settled', settledAt: new Date() }
    });
  }

  async getSubscriptionPlans() {
    return prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });
  }

  async createSubscriptionPlan(data, adminId) {
    const existing = await prisma.subscriptionPlan.findUnique({
      where: { code: data.code }
    });

    if (existing) {
      const err = new Error('Subscription plan with this code already exists.');
      err.statusCode = 409;
      err.error = 'Conflict';
      throw err;
    }

    return prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        price: parseFloat(data.price),
        duration: parseInt(data.duration, 10),
        features: data.features || {},
        feeDiscountPercent: parseFloat(data.feeDiscountPercent || 0)
      }
    });
  }

  async updateSubscriptionPlan(id, data, adminId) {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) {
      const err = new Error('Subscription plan not found.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }

    const allowed = ['name', 'description', 'price', 'duration', 'features', 'feeDiscountPercent', 'isActive'];
    const updateData = {};
    for (const key of allowed) {
      if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    }

    return prisma.subscriptionPlan.update({
      where: { id },
      data: updateData
    });
  }

  async subscribe(userId, planId) {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan || !plan.isActive) {
      const err = new Error('Subscription plan not found or inactive.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }

    const existing = await prisma.userSubscription.findFirst({
      where: { userId, status: 'active' }
    });
    if (existing) {
      const err = new Error('You already have an active subscription.');
      err.statusCode = 400;
      err.error = 'Bad Request';
      throw err;
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.duration);

    return prisma.userSubscription.create({
      data: {
        userId,
        planId,
        startDate,
        endDate,
        status: 'active'
      },
      include: { plan: true }
    });
  }

  async cancelSubscription(userId) {
    const subscription = await prisma.userSubscription.findFirst({
      where: { userId, status: 'active' }
    });

    if (!subscription) {
      const err = new Error('No active subscription found.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }

    return prisma.userSubscription.update({
      where: { id: subscription.id },
      data: { status: 'cancelled', cancelledAt: new Date() }
    });
  }

  async getUserSubscription(userId) {
    return prisma.userSubscription.findFirst({
      where: {
        userId,
        status: 'active',
        endDate: { gte: new Date() }
      },
      include: { plan: true }
    });
  }

  async createFeeDispute(data) {
    const tx = await prisma.feeTransaction.findUnique({
      where: { id: data.feeTransactionId }
    });
    if (!tx) {
      const err = new Error('Fee transaction not found.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }

    return prisma.feeDispute.create({
      data: {
        feeTransactionId: data.feeTransactionId,
        raisedById: data.raisedById,
        reason: data.reason,
        description: data.description
      }
    });
  }

  async resolveFeeDispute(id, resolution, adminId) {
    const dispute = await prisma.feeDispute.findUnique({ where: { id } });
    if (!dispute) {
      const err = new Error('Fee dispute not found.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }

    if (dispute.status !== 'pending') {
      const err = new Error('Fee dispute is already resolved.');
      err.statusCode = 400;
      err.error = 'Bad Request';
      throw err;
    }

    return prisma.feeDispute.update({
      where: { id },
      data: {
        status: resolution.outcome || 'resolved',
        resolvedBy: adminId,
        resolvedAt: new Date(),
        resolutionNotes: resolution.notes
      }
    });
  }

  async getFeeDisputes(filters = {}) {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.raisedById) where.raisedById = filters.raisedById;

    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(filters.limit) || 20));
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      prisma.feeDispute.findMany({
        where, skip, take: limit,
        include: {
          feeTransaction: { include: { booking: { select: { bookingNumber: true } } } },
          raisedBy: { select: { name: true, email: true } },
          resolvedByUser: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.feeDispute.count({ where })
    ]);
    return { disputes: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getRevenueReport(startDate, endDate) {
    const where = {};
    if (startDate || endDate) {
      where.calculatedAt = {};
      if (startDate) where.calculatedAt.gte = new Date(startDate);
      if (endDate) where.calculatedAt.lte = new Date(endDate);
    }

    const [aggregate, byStatus, allTransactions] = await Promise.all([
      prisma.feeTransaction.aggregate({
        where,
        _sum: {
          platformFee: true,
          jigoloFee: true,
          transactionFee: true,
          cancellationFee: true,
          subscriptionDiscount: true,
          totalFee: true,
          netAmount: true,
          bookingAmount: true
        },
        _count: { id: true }
      }),
      prisma.feeTransaction.groupBy({
        by: ['status'],
        where,
        _sum: { totalFee: true, netAmount: true },
        _count: { id: true }
      }),
      prisma.feeTransaction.findMany({
        where,
        select: { createdAt: true, totalFee: true, netAmount: true },
        orderBy: { createdAt: 'desc' },
        take: 500
      })
    ]);

    const dailyMap = {};
    for (const tx of allTransactions) {
      const dateKey = tx.createdAt.toISOString().split('T')[0];
      if (!dailyMap[dateKey]) dailyMap[dateKey] = { transactions: 0, total_fee: 0, net_amount: 0 };
      dailyMap[dateKey].transactions++;
      dailyMap[dateKey].total_fee += parseFloat(tx.totalFee || 0);
      dailyMap[dateKey].net_amount += parseFloat(tx.netAmount || 0);
    }
    const daily = Object.entries(dailyMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30);

    return {
      summary: {
        totalTransactions: aggregate._count.id,
        totalBookingAmount: parseFloat(aggregate._sum.bookingAmount || 0),
        totalPlatformFees: parseFloat(aggregate._sum.platformFee || 0),
        totalJigoloFees: parseFloat(aggregate._sum.jigoloFee || 0),
        totalTransactionFees: parseFloat(aggregate._sum.transactionFee || 0),
        totalCancellationFees: parseFloat(aggregate._sum.cancellationFee || 0),
        totalSubscriptionDiscounts: parseFloat(aggregate._sum.subscriptionDiscount || 0),
        totalFees: parseFloat(aggregate._sum.totalFee || 0),
        totalNetAmount: parseFloat(aggregate._sum.netAmount || 0)
      },
      byStatus,
      dailyTrend: daily
    };
  }

  async getJigoloEarningsReport(jigoloId, startDate, endDate, filters = {}) {
    const where = { jigoloId };
    if (startDate || endDate) {
      where.calculatedAt = {};
      if (startDate) where.calculatedAt.gte = new Date(startDate);
      if (endDate) where.calculatedAt.lte = new Date(endDate);
    }

    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(filters.limit) || 20));
    const skip = (page - 1) * limit;

    const [transactions, aggregate] = await Promise.all([
      prisma.feeTransaction.findMany({
        where, skip, take: limit,
        include: {
          booking: { select: { bookingNumber: true, date: true, status: true } },
          customer: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.feeTransaction.aggregate({
        where,
        _sum: {
          bookingAmount: true,
          jigoloFee: true,
          subscriptionDiscount: true,
          totalFee: true,
          netAmount: true
        },
        _count: { id: true }
      })
    ]);

    return {
      earnings: transactions,
      summary: {
        totalBookings: aggregate._count.id,
        grossEarnings: parseFloat(aggregate._sum.bookingAmount || 0),
        totalFeesDeducted: parseFloat(aggregate._sum.jigoloFee || 0) +
          parseFloat(aggregate._sum.subscriptionDiscount || 0),
        netEarnings: parseFloat(aggregate._sum.netAmount || 0)
      }
    };
  }
}

module.exports = new FeeService();
