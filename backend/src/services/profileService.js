const prisma = require('../config/database');

class ProfileService {
  async getProfiles(filters) {
    const { search, gender, minPrice, maxPrice, ageRange, rating, sortBy, page: p, limit: l } = filters;
    const page = Math.max(1, parseInt(p) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(l) || 20));
    const skip = (page - 1) * limit;

    const where = {
      user: { isActive: true }
    };

    if (gender && gender !== 'All') {
      where.gender = { equals: gender, mode: 'insensitive' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.pricePerHour = {};
      if (minPrice !== undefined) where.pricePerHour.gte = parseFloat(minPrice);
      if (maxPrice !== undefined) where.pricePerHour.lte = parseFloat(maxPrice);
    }

    if (rating !== undefined && parseFloat(rating) > 0) {
      where.rating = { gte: parseFloat(rating) };
    }

    if (ageRange && ageRange !== 'All') {
      if (ageRange === '18-25') {
        where.age = { gte: 18, lte: 25 };
      } else if (ageRange === '26-35') {
        where.age = { gte: 26, lte: 35 };
      } else if (ageRange === '36-45') {
        where.age = { gte: 36, lte: 45 };
      } else if (ageRange === '45+') {
        where.age = { gte: 45 };
      }
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { location: { contains: search, mode: 'insensitive' } } },
        { bio: { contains: search, mode: 'insensitive' } },
        { specialties: { has: search } }
      ];
    }

    let orderBy = {};
    if (sortBy === 'Price: Low-High') {
      orderBy = { pricePerHour: 'asc' };
    } else if (sortBy === 'Price: High-Low') {
      orderBy = { pricePerHour: 'desc' };
    } else if (sortBy === 'Rating') {
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'Newest') {
      orderBy = { createdAt: 'desc' };
    } else {
      orderBy = { rating: 'desc' };
    }

    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where, orderBy, skip, take: limit,
        include: {
          user: { select: { name: true, email: true, phone: true, location: true, profilePhoto: true } }
        }
      }),
      prisma.profile.count({ where })
    ]);

    return { profiles, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getProfile(id) {
    const profile = await prisma.profile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            location: true,
            profilePhoto: true,
            createdAt: true
          }
        }
      }
    });

    if (!profile) {
      const err = new Error('Companion profile not found.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }

    return profile;
  }

  async updateProfile(profileId, userId, data) {
    const profile = await prisma.profile.findUnique({ where: { id: profileId } });

    if (!profile) {
      const err = new Error('Profile not found.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }

    if (profile.userId !== userId) {
      const err = new Error('You can only update your own profile.');
      err.statusCode = 403;
      err.error = 'Forbidden';
      throw err;
    }

    return prisma.profile.update({
      where: { id: profileId },
      data
    });
  }

  async incrementProfileViews(profileId, userId) {
    const profile = await prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) {
      const err = new Error('Profile not found.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }
    if (profile.userId !== userId) {
      await prisma.profile.update({
        where: { id: profileId },
        data: { profileViews: { increment: 1 } }
      });
    }
    return profile;
  }

  async toggleFavorite(profileId, userId) {
    const profile = await prisma.profile.findUnique({ where: { id: profileId } });

    if (!profile) {
      const err = new Error('Profile not found.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }

    const existingFav = await prisma.favorite.findUnique({
      where: {
        userId_profileId: { userId, profileId }
      }
    });

    if (existingFav) {
      await prisma.favorite.delete({ where: { id: existingFav.id } });
      return { message: 'Removed from favorites.', favorited: false };
    }

    await prisma.favorite.create({ data: { userId, profileId } });
    return { message: 'Added to favorites.', favorited: true };
  }
}

module.exports = new ProfileService();
