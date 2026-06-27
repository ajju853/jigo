const prisma = require('../config/database');

class PromotionService {
  async validateAndApply(code, userId, bookingAmount) {
    const prom = await prisma.promotion.findUnique({ where: { code } });
    if (!prom || !prom.isActive) {
      const err = new Error('Invalid or inactive promotion code.');
      err.statusCode = 400; err.error = 'Promotion Error'; throw err;
    }
    const now = new Date();
    if (now < prom.startDate || now > prom.endDate) {
      const err = new Error('Promotion has expired or not yet started.');
      err.statusCode = 400; err.error = 'Promotion Error'; throw err;
    }
    if (prom.usageLimit > 0 && prom.usageCount >= prom.usageLimit) {
      const err = new Error('Promotion usage limit reached.');
      err.statusCode = 400; err.error = 'Promotion Error'; throw err;
    }

    const userUsage = await prisma.promotionUsage.count({
      where: { promotionId: prom.id, userId }
    });
    if (userUsage >= prom.userLimitPerPerson) {
      const err = new Error('You have already used this promotion.');
      err.statusCode = 400; err.error = 'Promotion Error'; throw err;
    }
    if (Number(bookingAmount) < Number(prom.minBookingValue)) {
      const err = new Error(`Minimum booking value is $${prom.minBookingValue}.`);
      err.statusCode = 400; err.error = 'Promotion Error'; throw err;
    }

    let discount = 0;
    if (prom.type === 'percentage') {
      discount = (Number(bookingAmount) * Number(prom.value)) / 100;
      if (prom.maxDiscount && discount > Number(prom.maxDiscount)) discount = Number(prom.maxDiscount);
    } else if (prom.type === 'fixed') {
      discount = Math.min(Number(prom.value), Number(bookingAmount));
    } else if (prom.type === 'free_booking') {
      discount = Number(bookingAmount);
    }

    discount = Math.round(discount * 100) / 100;

    await prisma.promotion.update({
      where: { id: prom.id },
      data: { usageCount: { increment: 1 } }
    });

    await this.recordUsage(prom.id, userId, null, discount);

    return { promotion: prom, discount, newTotal: Number(bookingAmount) - discount };
  }

  async create(data) {
    const existing = await prisma.promotion.findUnique({ where: { code: data.code } });
    if (existing) {
      const err = new Error('Promotion code already exists.');
      err.statusCode = 400; err.error = 'Promotion Error'; throw err;
    }
    return prisma.promotion.create({ data });
  }

  async recordUsage(promotionId, userId, bookingNumber, discountAmount) {
    return prisma.promotionUsage.create({
      data: { promotionId, userId, bookingNumber, discountAmount }
    });
  }

  async getLoyalty(userId) {
    return prisma.loyaltyPoint.findUnique({ where: { userId } });
  }

  async earnPoints(userId, points, source, referenceId) {
    if (points <= 0) return;
    await prisma.$transaction(async (tx) => {
      const loyalty = await tx.loyaltyPoint.upsert({
        where: { userId },
        update: { points: { increment: points }, totalEarned: { increment: points }, lastActivityAt: new Date() },
        create: { userId, points, totalEarned: points, tier: 'bronze', lastActivityAt: new Date() }
      });
      await tx.loyaltyTransaction.create({
        data: { userId, points, type: 'earned', source, referenceId, description: `Earned ${points} from ${source}` }
      });
      await this.checkTierUpgrade(tx, userId, loyalty.totalEarned + points);
    });
  }

  async redeemPoints(userId, points) {
    const loyalty = await prisma.loyaltyPoint.findUnique({ where: { userId } });
    if (!loyalty || loyalty.points < points) {
      const err = new Error('Insufficient loyalty points.');
      err.statusCode = 400; err.error = 'Loyalty Error'; throw err;
    }
    const value = points * 0.01;
    await prisma.$transaction(async (tx) => {
      await tx.loyaltyPoint.update({
        where: { userId },
        data: { points: { decrement: points }, totalRedeemed: { increment: points } }
      });
      await tx.loyaltyTransaction.create({
        data: { userId, points: -points, type: 'redeemed', source: 'loyalty', description: `Redeemed ${points} points` }
      });
    });
    return { pointsRedeemed: points, value };
  }

  async checkTierUpgrade(tx, userId, totalEarned) {
    const tiers = [
      { name: 'bronze', threshold: 0 }, { name: 'silver', threshold: 100 },
      { name: 'gold', threshold: 500 }, { name: 'platinum', threshold: 1000 },
      { name: 'diamond', threshold: 2000 }
    ];
    const current = [...tiers].reverse().find(t => totalEarned >= t.threshold);
    if (current) {
      await tx.loyaltyPoint.update({ where: { userId }, data: { tier: current.name } });
    }
  }

  async getLeaderboard(limit = 100) {
    return prisma.loyaltyPoint.findMany({
      where: { totalEarned: { gt: 0 } },
      orderBy: { totalEarned: 'desc' },
      take: limit,
      include: { user: { select: { id: true, name: true, profilePhoto: true } } }
    });
  }

  async generateReferralCode(userId) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code;
    do {
      code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    } while (await prisma.referralCode.findUnique({ where: { code } }));

    return prisma.referralCode.create({
      data: { userId, code, maxUses: 10, expiresAt: new Date(Date.now() + 365 * 86400000) }
    });
  }

  async processReferral(code, refereeId) {
    const refCode = await prisma.referralCode.findUnique({ where: { code } });
    if (!refCode) {
      const err = new Error('Invalid referral code.');
      err.statusCode = 400; err.error = 'Referral Error'; throw err;
    }
    if (refCode.usageCount >= refCode.maxUses) {
      const err = new Error('Referral code usage limit reached.');
      err.statusCode = 400; err.error = 'Referral Error'; throw err;
    }
    if (refCode.expiresAt && new Date() > refCode.expiresAt) {
      const err = new Error('Referral code has expired.');
      err.statusCode = 400; err.error = 'Referral Error'; throw err;
    }

    const existing = await prisma.referral.findUnique({
      where: { referrerId_refereeId: { referrerId: refCode.userId, refereeId } }
    });
    if (existing) {
      const err = new Error('User has already been referred.');
      err.statusCode = 400; err.error = 'Referral Error'; throw err;
    }

    return prisma.$transaction(async (tx) => {
      const referral = await tx.referral.create({
        data: { referrerId: refCode.userId, refereeId, referralCodeId: refCode.id, status: 'pending' }
      });
      await tx.referralCode.update({ where: { id: refCode.id }, data: { usageCount: { increment: 1 } } });
      return referral;
    });
  }

  async completeReferral(referralId, userId) {
    const referral = await prisma.referral.findUnique({ where: { id: referralId } });
    if (!referral) {
      const err = new Error('Referral not found.');
      err.statusCode = 404; err.error = 'Not Found'; throw err;
    }
    if (referral.refereeId !== userId && referral.referrerId !== userId) {
      const err = new Error('Not authorized to complete this referral.');
      err.statusCode = 403; err.error = 'Forbidden'; throw err;
    }
    const bookings = await prisma.booking.count({
      where: { customerId: referral.refereeId, status: 'completed' }
    });
    if (bookings === 0) {
      const err = new Error('Referee must complete at least one booking.');
      err.statusCode = 400; err.error = 'Referral Error'; throw err;
    }

    const referrerReward = 10;
    const refereeReward = 5;

    await prisma.referral.update({
      where: { id: referralId },
      data: { status: 'completed', rewardEarned: referrerReward, rewardClaimed: false }
    });

    await this.earnPoints(referral.referrerId, 50, 'referral', referralId);
    await this.earnPoints(referral.refereeId, 25, 'referral', referralId);

    return { referrerReward, refereeReward };
  }

  async getReferralAnalytics(userId) {
    const [total, completed, pending] = await Promise.all([
      prisma.referral.count({ where: { referrerId: userId } }),
      prisma.referral.count({ where: { referrerId: userId, status: 'completed' } }),
      prisma.referral.count({ where: { referrerId: userId, status: 'pending' } })
    ]);
    return { totalReferrals: total, completedReferrals: completed, pendingReferrals: pending };
  }
}

module.exports = new PromotionService();
