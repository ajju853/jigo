const prisma = require('../config/database');

class ReviewService {
  async create(reviewerId, data) {
    let { bookingId, profileId, rating, comment, isAnonymous } = data;

    if (!bookingId && profileId) {
      const booking = await prisma.booking.findFirst({
        where: {
          customerId: reviewerId,
          profileId,
          status: 'completed'
        },
        orderBy: { date: 'desc' }
      });
      if (booking) bookingId = booking.id;
    }

    if (!bookingId) {
      const err = new Error('No completed booking found to review. Complete a booking first.');
      err.statusCode = 400;
      err.error = 'Validation Error';
      throw err;
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

    if (!booking) {
      const err = new Error('Booking not found.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }

    if (booking.customerId !== reviewerId) {
      const err = new Error('You can only review companions you booked.');
      err.statusCode = 403;
      err.error = 'Forbidden';
      throw err;
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        bookingId_reviewerId: { bookingId, reviewerId }
      }
    });

    if (existingReview) {
      const err = new Error('You have already reviewed this booking.');
      err.statusCode = 400;
      err.error = 'Conflict Error';
      throw err;
    }

    return prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          bookingId,
          reviewerId,
          jigoloId: booking.jigoloId,
          rating: parseInt(rating),
          comment,
          isAnonymous: Boolean(isAnonymous)
        }
      });

      const allReviews = await tx.review.findMany({
        where: { jigoloId: booking.jigoloId }
      });

      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const avg = totalRating / allReviews.length;

      await tx.profile.update({
        where: { id: booking.profileId },
        data: {
          rating: parseFloat(avg.toFixed(1)),
          reviewsCount: allReviews.length
        }
      });

      return review;
    });
  }

  async getByProfile(profileId, options = {}) {
    const profile = await prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) {
      const err = new Error('Profile not found.');
      err.statusCode = 404; err.error = 'Not Found'; throw err;
    }

    const page = Math.max(1, parseInt(options.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(options.limit) || 20));
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { jigoloId: profile.userId },
        include: {
          reviewer: { select: { name: true, profilePhoto: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip, take: limit
      }),
      prisma.review.count({ where: { jigoloId: profile.userId } })
    ]);

    return {
      reviews: reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        reviewerName: r.isAnonymous ? 'Anonymous' : (r.reviewer?.name || 'Anonymous'),
        reviewerPhoto: r.isAnonymous ? null : (r.reviewer?.profilePhoto || null),
        date: r.createdAt.toISOString().split('T')[0],
        text: r.comment,
        response: r.response,
        helpfulCount: r.helpfulCount || 0,
        isAnonymous: r.isAnonymous
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }

  async update(reviewId, userId, data) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      const err = new Error('Review not found.');
      err.statusCode = 404; err.error = 'Not Found'; throw err;
    }
    if (review.reviewerId !== userId) {
      const err = new Error('Not authorized to edit this review.');
      err.statusCode = 403; err.error = 'Forbidden'; throw err;
    }
    return prisma.review.update({ where: { id: reviewId }, data: { rating: parseInt(data.rating) || review.rating, comment: data.comment ?? review.comment, isAnonymous: data.isAnonymous !== undefined ? Boolean(data.isAnonymous) : review.isAnonymous } });
  }

  async delete(reviewId, userId) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      const err = new Error('Review not found.');
      err.statusCode = 404; err.error = 'Not Found'; throw err;
    }
    if (review.reviewerId !== userId) {
      const err = new Error('Not authorized to delete this review.');
      err.statusCode = 403; err.error = 'Forbidden'; throw err;
    }
    await prisma.review.delete({ where: { id: reviewId } });
    return { success: true };
  }

  async jigoloReply(reviewId, jigoloId, reply) {
    const review = await prisma.review.findUnique({ where: { id: reviewId }, include: { booking: true } });
    if (!review) {
      const err = new Error('Review not found.');
      err.statusCode = 404; err.error = 'Not Found'; throw err;
    }
    if (review.jigoloId !== jigoloId) {
      const err = new Error('Not authorized to reply to this review.');
      err.statusCode = 403; err.error = 'Forbidden'; throw err;
    }
    return prisma.review.update({ where: { id: reviewId }, data: { response: reply, responseAt: new Date() } });
  }

  async toggleHelpful(reviewId, userId) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      const err = new Error('Review not found.');
      err.statusCode = 404; err.error = 'Not Found'; throw err;
    }
    const existing = await prisma.reviewHelpful.findUnique({
      where: { reviewId_userId: { reviewId, userId } }
    });
    if (existing) {
      await prisma.reviewHelpful.delete({ where: { id: existing.id } });
      await prisma.review.update({ where: { id: reviewId }, data: { helpfulCount: { decrement: 1 } } });
      return { helpful: false };
    }
    await prisma.reviewHelpful.create({ data: { reviewId, userId } });
    await prisma.review.update({ where: { id: reviewId }, data: { helpfulCount: { increment: 1 } } });
    return { helpful: true };
  }
}

module.exports = new ReviewService();
