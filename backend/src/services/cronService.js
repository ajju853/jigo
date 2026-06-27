const prisma = require('../config/database');
const logger = require('../utils/logger');

async function expireSubscriptions() {
  try {
    const result = await prisma.userSubscription.updateMany({
      where: {
        status: 'active',
        endDate: { lte: new Date() }
      },
      data: { status: 'expired' }
    });
    if (result.count > 0) {
      logger.info(`Cron: Expired ${result.count} subscriptions.`);
    }
  } catch (err) {
    logger.error('Cron: Failed to expire subscriptions:', err);
  }
}

async function expirePromotions() {
  try {
    const result = await prisma.promotion.updateMany({
      where: {
        isActive: true,
        endDate: { lte: new Date() }
      },
      data: { isActive: false }
    });
    if (result.count > 0) {
      logger.info(`Cron: Expired ${result.count} promotions.`);
    }
  } catch (err) {
    logger.error('Cron: Failed to expire promotions:', err);
  }
}

async function generateDailyAnalytics() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.dailyAnalytic.findUnique({ where: { date: today } });
    if (existing) return;

    const [totalUsers, newUsers, activeUsers, totalBookings, completedBookings, cancelledBookings] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { lastLoginAt: { gte: today } } }),
      prisma.booking.count({ where: { createdAt: { gte: today } } }),
      prisma.booking.count({ where: { status: 'completed', createdAt: { gte: today } } }),
      prisma.booking.count({ where: { status: 'cancelled', createdAt: { gte: today } } })
    ]);

    const revenueAgg = await prisma.booking.aggregate({
      where: { status: { in: ['confirmed', 'completed'] }, createdAt: { gte: today } },
      _sum: { totalPrice: true }
    });

    await prisma.dailyAnalytic.create({
      data: {
        date: today,
        totalUsers,
        newUsers,
        activeUsers,
        totalBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue: parseFloat(revenueAgg._sum.totalPrice || 0)
      }
    });

    logger.info(`Cron: Daily analytics snapshot generated for ${today.toISOString().split('T')[0]}.`);
  } catch (err) {
    logger.error('Cron: Failed to generate daily analytics:', err);
  }
}

async function runAll() {
  await Promise.all([expireSubscriptions(), expirePromotions()]);
  await generateDailyAnalytics();
}

module.exports = { expireSubscriptions, expirePromotions, generateDailyAnalytics, runAll };
