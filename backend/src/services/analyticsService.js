const prisma = require('../config/database');

class AnalyticsService {
  async generateDailySnapshot(date) {
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 1);

    const [newUsers, completedBookings, cancelledBookings, revenue] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: start, lt: end } } }),
      prisma.booking.count({ where: { status: 'completed', createdAt: { gte: start, lt: end } } }),
      prisma.booking.count({ where: { status: 'cancelled', createdAt: { gte: start, lt: end } } }),
      prisma.booking.aggregate({ where: { status: 'completed', createdAt: { gte: start, lt: end } }, _sum: { totalPrice: true } })
    ]);

    const totalUsers = await prisma.user.count();
    const totalBookings = await prisma.booking.count();
    const activeUsers = await prisma.user.count({ where: { lastLoginAt: { gte: new Date(Date.now() - 86400000) } } });

    return prisma.dailyAnalytic.upsert({
      where: { date: start },
      update: { totalUsers, newUsers, activeUsers, totalBookings, completedBookings, cancelledBookings, totalRevenue: revenue._sum.totalPrice || 0 },
      create: { date: start, totalUsers, newUsers, activeUsers, totalBookings, completedBookings, cancelledBookings, totalRevenue: revenue._sum.totalPrice || 0 }
    });
  }

  async getDashboard() {
    const [totalUsers, activeToday, totalBookings, pendingBookings, revenue, todayBookings] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { lastLoginAt: { gte: new Date(Date.now() - 900000) } } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'pending' } }),
      prisma.booking.aggregate({ where: { paymentStatus: 'paid' }, _sum: { totalPrice: true } }),
      prisma.booking.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } })
    ]);

    return { overview: { totalUsers, activeToday, totalBookings, pendingBookings, totalRevenue: Number(revenue._sum.totalPrice || 0), todayBookings } };
  }

  async getUserAnalytics(days = 30) {
    const since = new Date(Date.now() - days * 86400000);
    const [newUsers, returningUsers, daily] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: since } } }),
      prisma.user.count({ where: { lastLoginAt: { gte: since } } }),
      prisma.dailyAnalytic.findMany({ where: { date: { gte: since } }, orderBy: { date: 'asc' } })
    ]);
    return { period: `${days}d`, newUsers, returningUsers, daily };
  }

  async getBookingAnalytics(days = 30) {
    const since = new Date(Date.now() - days * 86400000);
    const [total, completed, cancelled, packages] = await Promise.all([
      prisma.booking.count({ where: { createdAt: { gte: since } } }),
      prisma.booking.count({ where: { status: 'completed', createdAt: { gte: since } } }),
      prisma.booking.count({ where: { status: 'cancelled', createdAt: { gte: since } } }),
      prisma.booking.groupBy({ by: ['package'], _count: true, where: { createdAt: { gte: since }, package: { not: null } }, orderBy: { _count: { package: 'desc' } }, take: 10 })
    ]);
    return { total, completed, cancelled, completionRate: total ? Math.round(completed / total * 100) : 0, popularPackages: packages };
  }

  async getFinancialAnalytics(days = 30) {
    const since = new Date(Date.now() - days * 86400000);
    const revenue = await prisma.booking.aggregate({ where: { paymentStatus: 'paid', createdAt: { gte: since } }, _sum: { totalPrice: true } });
    const refunds = await prisma.booking.count({ where: { paymentStatus: 'refunded', createdAt: { gte: since } } });
    return { revenue: Number(revenue._sum.totalPrice || 0), refunds, period: `${days}d` };
  }

  async logActivity(userId, action, category, details) {
    return prisma.userActivityLog.create({ data: { userId, action, category, details } });
  }

  async getPlatformMetrics() {
    const [totalUsers, activeToday, totalBookings, completedBookings, revenue, avgRating] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { lastLoginAt: { gte: new Date(Date.now() - 900000) } } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'completed' } }),
      prisma.booking.aggregate({ where: { paymentStatus: 'paid' }, _sum: { totalPrice: true } }),
      prisma.profile.aggregate({ _avg: { rating: true } })
    ]);
    return {
      totalUsers, activeToday, totalBookings, completedBookings,
      totalRevenue: Number(revenue._sum.totalPrice || 0),
      averageRating: avgRating._avg.rating ? parseFloat(avgRating._avg.rating.toFixed(1)) : 0,
      lastUpdated: new Date().toISOString()
    };
  }

  async getReport(reportType) {
    const data = reportType === 'daily' ? await this.getDashboard()
      : reportType === 'users' ? await this.getUserAnalytics()
      : reportType === 'bookings' ? await this.getBookingAnalytics()
      : reportType === 'financial' ? await this.getFinancialAnalytics()
      : await this.getDashboard();

    return prisma.report.create({
      data: { name: `${reportType}_${new Date().toISOString().split('T')[0]}`, type: reportType, data }
    });
  }
}

module.exports = new AnalyticsService();
