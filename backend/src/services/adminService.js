const prisma = require('../config/database');

class AdminService {
  async getUsers(filters = {}) {
    const where = {};
    if (filters.role) where.role = filters.role;
    if (filters.isActive !== undefined) where.isActive = filters.isActive === 'true';
    if (filters.isVerified !== undefined) where.isVerified = filters.isVerified === 'true';
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(filters.limit) || 20));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take: limit, include: { profile: true }, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where })
    ]);

    return {
      users: users.map(u => { const { passwordHash: _, ...rest } = u; return rest; }),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async toggleUserStatus(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }
    return prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive }
    });
  }

  async toggleUserVerification(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }
    return prisma.user.update({
      where: { id: userId },
      data: { isVerified: !user.isVerified }
    });
  }

  async updateUserRole(userId, role) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }
    return prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true, isActive: true, isVerified: true }
    });
  }

  async getStats() {
    const [totalUsers, totalJigolos, totalBookings, totalRevenue, pendingDisputes] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'jigolo' } }),
      prisma.booking.count(),
      prisma.booking.aggregate({
        where: { status: { in: ['confirmed', 'completed'] } },
        _sum: { totalPrice: true }
      }),
      prisma.dispute.count({ where: { status: 'pending' } })
    ]);

    return {
      totalUsers,
      totalJigolos,
      totalBookings,
      totalRevenue: parseFloat(totalRevenue._sum.totalPrice || 0),
      pendingDisputes
    };
  }

  async getAllBookings(filters = {}) {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;

    const page = Math.max(1, parseInt(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(filters.limit) || 20));
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where, skip, take: limit,
        include: {
          customer: { select: { id: true, name: true, email: true } },
          jigolo: { select: { id: true, name: true, email: true } },
          profile: { select: { id: true, tags: true, pricePerHour: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.booking.count({ where })
    ]);
    return { bookings, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async deleteUser(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }
    await prisma.user.delete({ where: { id: userId } });
    return { message: 'User deleted successfully.' };
  }
}

module.exports = new AdminService();
