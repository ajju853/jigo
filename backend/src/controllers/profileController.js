const prisma = require('../config/database');

class ProfileController {
    // =============================================
    // 1. CREATE PROFILE (Jigolo Onboarding)
    // =============================================
    
    async createProfile(req, res) {
        try {
            const userId = req.user.id;
            const profileData = req.body;
            
            // Check if user already has profile
            const existingProfile = await prisma.profile.findUnique({
                where: { userId }
            });
            
            if (existingProfile) {
                return res.status(409).json({
                    success: false,
                    error: 'Profile already exists',
                    message: 'You already have a profile'
                });
            }
            
            // Validate required fields
            if (!profileData.title) throw new Error('Title is required');
            if (!profileData.bio) throw new Error('Bio is required');
            if (!profileData.price_per_hour) throw new Error('Price is required');
            
            // Create profile with transaction
            const profile = await prisma.$transaction(async (tx) => {
                // Create profile
                const newProfile = await tx.profile.create({
                    data: {
                        userId,
                        title: profileData.title,
                        headline: profileData.headline,
                        bio: profileData.bio,
                        about: profileData.about,
                        age: parseInt(profileData.age) || null,
                        gender: profileData.gender,
                        tags: profileData.tags || [],
                        specialties: profileData.specialties || [],
                        languages: profileData.languages || [],
                        pricePerHour: parseFloat(profileData.price_per_hour),
                        packages: profileData.packages || [],
                        extras: profileData.extras || [],
                        images: profileData.images || [],
                        availability: profileData.availability || {},
                        profileStatus: 'pending_review',
                    }
                });
                
                // Create analytics record
                await tx.userAnalytics.create({
                    data: {
                        userId,
                        date: new Date(),
                        engagementScore: 0,
                        activityScore: 0,
                        socialScore: 0
                    }
                });
                
                // Log activity
                await tx.userActivityLog.create({
                    data: {
                        userId,
                        action: 'created_profile',
                        category: 'profile',
                        entityType: 'profile',
                        entityId: newProfile.id,
                        details: { title: newProfile.title }
                    }
                });
                
                return newProfile;
            });
            
            return res.status(201).json({
                success: true,
                message: 'Profile created successfully',
                data: profile
            });
        } catch (error) {
            console.error('Error creating profile:', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'Failed to create profile'
            });
        }
    }

    // =============================================
    // 2. BROWSE PROFILES (Advanced Search)
    // =============================================
    
    async browse(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                search,
                minPrice,
                maxPrice,
                minRating,
                gender,
                ageMin,
                ageMax,
                tags,
                languages,
                sortBy = 'relevance',
                lat,
                lng,
                radius = 50,
                availability
            } = req.query;
            
            const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
            
            // Build where clause
            const where = {
                // profileStatus: 'published', // Commented out for dev so we can see draft profiles
                user: {
                    isActive: true,
                    isBanned: false
                }
            };
            
            // Price filter
            if (minPrice || maxPrice) {
                where.pricePerHour = {};
                if (minPrice) where.pricePerHour.gte = parseFloat(minPrice);
                if (maxPrice) where.pricePerHour.lte = parseFloat(maxPrice);
            }
            
            // Rating filter
            if (minRating) {
                where.rating = { gte: parseFloat(minRating) };
            }
            
            // Gender filter
            if (gender && gender !== 'All') {
                where.gender = { equals: gender, mode: 'insensitive' };
            }
            
            // Age filter
            if (ageMin || ageMax) {
                where.age = {};
                if (ageMin && ageMin !== 'All') where.age.gte = parseInt(ageMin);
                if (ageMax && ageMax !== 'All') where.age.lte = parseInt(ageMax);
            }
            
            // Tags filter
            if (tags && tags !== 'All') {
                const tagArray = tags.split(',').map(t => t.trim());
                where.tags = { hasSome: tagArray };
            }
            
            // Search
            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { bio: { contains: search, mode: 'insensitive' } },
                    { tags: { hasSome: [search] } },
                    { user: { name: { contains: search, mode: 'insensitive' } } }
                ];
            }
            
            // Build order by
            let orderBy = {};
            switch (sortBy) {
                case 'price_asc':
                case 'Price: Low-High':
                    orderBy = { pricePerHour: 'asc' };
                    break;
                case 'price_desc':
                case 'Price: High-Low':
                    orderBy = { pricePerHour: 'desc' };
                    break;
                case 'rating':
                case 'Rating':
                    orderBy = { rating: 'desc' };
                    break;
                case 'newest':
                case 'Newest':
                    orderBy = { createdAt: 'desc' };
                    break;
                case 'relevance':
                default:
                    orderBy = { rating: 'desc' };
                    break;
            }
            
            // Get profiles
            const [profiles, total] = await Promise.all([
                prisma.profile.findMany({
                    where,
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                profilePhoto: true,
                                isVerified: true,
                                lastOnlineAt: true
                            }
                        }
                    },
                    orderBy,
                    skip,
                    take: parseInt(limit)
                }),
                prisma.profile.count({ where })
            ]);
            
            // Record search if user logged in
            if (req.user) {
                try {
                    await prisma.searchHistory.create({
                        data: {
                            userId: req.user.id,
                            searchQuery: search || '',
                            filters: req.query,
                            resultsCount: total,
                            searchSource: 'web'
                        }
                    });
                } catch (e) {
                    console.warn("Search history failed", e);
                }
            }
            
            return res.json({
                success: true,
                data: {
                    profiles,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        totalPages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Error browsing profiles:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to browse profiles'
            });
        }
    }

    // =============================================
    // 3. GET PROFILE (With Activity)
    // =============================================
    
    async getProfile(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            
            // Get profile with all details
            const profile = await prisma.profile.findUnique({
                where: { id },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            profilePhoto: true,
                            bannerPhoto: true,
                            location: true,
                            isVerified: true,
                            createdAt: true,
                            lastOnlineAt: true,
                            reviewsReceived: {
                                where: { isPublic: true },
                                include: {
                                    reviewer: {
                                        select: {
                                            id: true,
                                            name: true,
                                            profilePhoto: true
                                        }
                                    }
                                },
                                orderBy: { createdAt: 'desc' },
                                take: 5
                            }
                        }
                    }
                }
            });
            
            if (!profile) {
                return res.status(404).json({
                    success: false,
                    error: 'Profile not found'
                });
            }
            
            let isFav = false;
            if (userId) {
                const fav = await prisma.favorite.findUnique({
                    where: { userId_profileId: { userId, profileId: id } }
                });
                isFav = !!fav;
            }
            
            return res.json({
                success: true,
                data: {
                    ...profile,
                    isFavorited: isFav,
                    isOnline: profile.user.lastOnlineAt ? (new Date() - profile.user.lastOnlineAt < 5 * 60 * 1000) : false
                }
            });
        } catch (error) {
            console.error('Error getting profile:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get profile'
            });
        }
    }

    // =============================================
    // 4. UPDATE PROFILE
    // =============================================
    
    async updateProfile(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const updateData = req.body;
            
            // Check ownership
            const profile = await prisma.profile.findUnique({
                where: { id }
            });
            
            if (!profile) {
                return res.status(404).json({
                    success: false,
                    error: 'Profile not found'
                });
            }
            
            if (profile.userId !== userId && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: 'Unauthorized to update this profile'
                });
            }
            
            // Update profile
            const updated = await prisma.profile.update({
                where: { id },
                data: {
                    ...updateData,
                    pricePerHour: updateData.pricePerHour ? parseFloat(updateData.pricePerHour) : undefined,
                    age: updateData.age ? parseInt(updateData.age) : undefined,
                }
            });
            
            // Log activity
            await prisma.userActivityLog.create({
                data: {
                    userId,
                    action: 'updated_profile',
                    category: 'profile',
                    entityType: 'profile',
                    entityId: id,
                    details: { changes: Object.keys(updateData) }
                }
            });
            
            return res.json({
                success: true,
                message: 'Profile updated successfully',
                data: updated
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to update profile'
            });
        }
    }

    // =============================================
    // 5. RECORD PROFILE VIEW
    // =============================================
    
    async recordView(req, res) {
        try {
            const profileId = req.params.id;
            const userId = req.user?.id;
            const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
            
            await prisma.$transaction(async (tx) => {
                await tx.profileView.create({
                    data: {
                        profileId: profileId,
                        viewerId: userId,
                        viewerIp: ip,
                        source: req.query.source || 'direct'
                    }
                });
                
                if (userId) {
                    const existing = await tx.recentlyViewed.findUnique({
                        where: { userId_profileId: { userId, profileId } }
                    });
                    
                    if (existing) {
                        await tx.recentlyViewed.update({
                            where: { id: existing.id },
                            data: {
                                viewCount: { increment: 1 },
                                lastViewedAt: new Date()
                            }
                        });
                    } else {
                        await tx.recentlyViewed.create({
                            data: { userId, profileId }
                        });
                    }
                }
                
                await tx.profile.update({
                    where: { id: profileId },
                    data: { profileViews: { increment: 1 } }
                });
            });
            
            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error recording view:', error);
            res.status(500).json({ success: false });
        }
    }

    // =============================================
    // 6. TOGGLE FAVORITE
    // =============================================
    
    async toggleFavorite(req, res) {
        try {
            const profileId = req.params.id;
            const userId = req.user.id;
            
            const existingFav = await prisma.favorite.findUnique({
                where: { userId_profileId: { userId, profileId } }
            });
            
            if (existingFav) {
                await prisma.favorite.delete({ where: { id: existingFav.id } });
                
                await prisma.profileInteraction.deleteMany({
                    where: { profileId, userId, interactionType: 'like' }
                });
                
                return res.status(200).json({ success: true, message: 'Removed from favorites', favorited: false });
            }
            
            await prisma.favorite.create({ data: { userId, profileId } });
            
            await prisma.profileInteraction.create({
                data: { profileId, userId, interactionType: 'like' }
            });
            
            return res.status(201).json({ success: true, message: 'Added to favorites', favorited: true });
        } catch (error) {
            console.error('Error toggling favorite:', error);
            return res.status(500).json({ success: false });
        }
    }
    
    // =============================================
    // 7. GET RECENTLY VIEWED
    // =============================================
    
    async getRecentlyViewed(req, res) {
        try {
            const userId = req.user.id;
            const recentlyViewed = await prisma.recentlyViewed.findMany({
                where: { userId },
                include: {
                    profile: {
                        include: {
                            user: {
                                select: { id: true, name: true, profilePhoto: true }
                            }
                        }
                    }
                },
                orderBy: { lastViewedAt: 'desc' },
                take: 20
            });
            
            return res.json({
                success: true,
                data: recentlyViewed.map(rv => ({
                    ...rv.profile,
                    viewedAt: rv.lastViewedAt,
                    viewCount: rv.viewCount
                }))
            });
        } catch (error) {
            console.error('Error getting recently viewed:', error);
            return res.status(500).json({ success: false });
        }
    }
}

module.exports = new ProfileController();
