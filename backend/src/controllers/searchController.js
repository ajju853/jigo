const prisma = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class SearchController {
    // 1. Advanced Search with Personalization
    async search(req, res) {
        try {
            const userId = req.user?.id; // Optional for public search
            const {
                query,
                filters,
                sortBy = 'relevance',
                page = 1,
                limit = 20,
                usePersonalization = true
            } = req.query; 
            
            const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
            
            // Get user preferences for personalization
            let preferences = null;
            if (userId && (usePersonalization === 'true' || usePersonalization === true)) {
                preferences = await prisma.userPreference.findUnique({
                    where: { userId: userId }
                });
            }
            
            // Build search query
            const searchQuery = this.buildSearchQuery(query, filters ? JSON.parse(filters) : {}, preferences);
            
            // Execute search
            const [results, total] = await Promise.all([
                prisma.profile.findMany({
                    where: searchQuery,
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
                    orderBy: this.buildOrderBy(sortBy, preferences),
                    skip,
                    take: parseInt(limit)
                }),
                prisma.profile.count({ where: searchQuery })
            ]);
            
            // Record search history if logged in
            if (userId) {
                await this.recordSearch(userId, query, filters ? JSON.parse(filters) : {}, total);
            }
            
            let enhancedResults = results;
            if (userId) {
                // Calculate relevance scores
                const scoredResults = await this.calculateRelevanceScores(userId, results);
                
                // Get user interactions for each result
                const profileIds = results.map(p => p.id);
                const interactions = await prisma.profileInteraction.findMany({
                    where: {
                        userId: userId,
                        profileId: { in: profileIds }
                    }
                });
                
                // Enhance results with interactions
                enhancedResults = scoredResults.map(profile => {
                    const userInteractions = interactions.filter(i => i.profileId === profile.id);
                    return {
                        ...profile,
                        is_liked: userInteractions.some(i => i.interactionType === 'like'),
                        is_saved: userInteractions.some(i => i.interactionType === 'save'),
                        is_viewed: userInteractions.some(i => i.interactionType === 'view'),
                        interaction_count: userInteractions.length
                    };
                });
            }
            
            return res.json({
                success: true,
                data: {
                    results: enhancedResults,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / parseInt(limit))
                    },
                    search_id: uuidv4(),
                    personalized: !!preferences
                }
            });
        } catch (error) {
            console.error('Error searching:', error);
            return res.status(500).json({
                success: false,
                error: 'Search failed'
            });
        }
    }
    
    // 2. Build Search Query
    buildSearchQuery(query, filters, preferences) {
        const where = {
            // profileStatus: 'published',
            user: {
                isActive: true,
                isBanned: false
            }
        };
        
        // Text search
        if (query) {
            where.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { bio: { contains: query, mode: 'insensitive' } },
                { tags: { hasSome: [query] } },
                { user: { name: { contains: query, mode: 'insensitive' } } }
            ];
        }
        
        // Apply filters
        if (filters) {
            // Price range
            if (filters.minPrice || filters.maxPrice) {
                where.pricePerHour = {};
                if (filters.minPrice) where.pricePerHour.gte = parseFloat(filters.minPrice);
                if (filters.maxPrice) where.pricePerHour.lte = parseFloat(filters.maxPrice);
            }
            
            // Rating
            if (filters.minRating) {
                where.rating = { gte: parseFloat(filters.minRating) };
            }
            
            // Gender
            if (filters.gender) {
                where.gender = filters.gender;
            }
            
            // Age range
            if (filters.ageMin || filters.ageMax) {
                where.age = {};
                if (filters.ageMin) where.age.gte = parseInt(filters.ageMin);
                if (filters.ageMax) where.age.lte = parseInt(filters.ageMax);
            }
            
            // Tags
            if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
                where.tags = { hasSome: filters.tags };
            }
            
            // Languages
            if (filters.languages && Array.isArray(filters.languages) && filters.languages.length > 0) {
                where.languages = { hasSome: filters.languages };
            }
            
            // Verification level
            if (filters.verifiedOnly) {
                where.verified = true;
            }
        }
        
        // Apply personalization preferences
        if (preferences) {
            if (preferences.preferredGenders && preferences.preferredGenders.length > 0) {
                where.gender = { in: preferences.preferredGenders };
            }
            if (preferences.preferredLanguages && preferences.preferredLanguages.length > 0) {
                where.languages = { hasSome: preferences.preferredLanguages };
            }
            if (preferences.budgetMin || preferences.budgetMax) {
                where.pricePerHour = where.pricePerHour || {};
                if (preferences.budgetMin) where.pricePerHour.gte = preferences.budgetMin;
                if (preferences.budgetMax) where.pricePerHour.lte = preferences.budgetMax;
            }
        }
        
        return where;
    }
    
    // 3. Build Order By
    buildOrderBy(sortBy, preferences) {
        switch (sortBy) {
            case 'price_asc':
                return { pricePerHour: 'asc' };
            case 'price_desc':
                return { pricePerHour: 'desc' };
            case 'rating':
                return { rating: 'desc' };
            case 'newest':
                return { createdAt: 'desc' };
            case 'relevance':
            default:
                return { 
                    rating: 'desc',
                    createdAt: 'desc'
                };
        }
    }
    
    // 4. Record Search
    async recordSearch(userId, query, filters, resultsCount) {
        try {
            await prisma.searchHistory.create({
                data: {
                    userId: userId,
                    searchQuery: query || '',
                    filters: filters || {},
                    resultsCount: resultsCount,
                    searchSource: 'web'
                }
            });
            
            // Update daily analytics
            await prisma.userAnalytics.upsert({
                where: {
                    userId_date: {
                        userId: userId,
                        date: new Date()
                    }
                },
                update: {
                    searchesCount: { increment: 1 },
                    uniqueSearches: { increment: query ? 1 : 0 }
                },
                create: {
                    userId: userId,
                    date: new Date(),
                    searchesCount: 1,
                    uniqueSearches: query ? 1 : 0
                }
            });
        } catch (error) {
            console.error('Error recording search:', error);
        }
    }
    
    // 5. Calculate Relevance Scores
    async calculateRelevanceScores(userId, results) {
        const viewHistory = await prisma.recentlyViewed.findMany({
            where: { userId: userId },
            orderBy: { viewedAt: 'desc' },
            take: 10
        });
        
        const savedProfiles = await prisma.profileInteraction.findMany({
            where: {
                userId: userId,
                interactionType: 'save'
            }
        });
        
        return results.map(profile => {
            let score = 0;
            score += Number(profile.rating || 0);
            
            const viewed = viewHistory.some(v => v.profileId === profile.id);
            if (viewed) score += 0.5;
            
            const saved = savedProfiles.some(s => s.profileId === profile.id);
            if (saved) score += 1;
            
            return {
                ...profile,
                relevance_score: score,
                is_saved: saved,
                is_viewed: viewed
            };
        });
    }
    
    // 6. Get Search Suggestions (Autocomplete)
    async getSuggestions(req, res) {
        try {
            const { q } = req.query;
            
            if (!q || q.length < 2) {
                 return res.json({ success: true, data: { searches: [], tags: [], total_suggestions: 0 } });
            }
            
            const popularSearches = await prisma.searchHistory.groupBy({
                by: ['searchQuery'],
                where: {
                    searchQuery: {
                        contains: q,
                        mode: 'insensitive'
                    }
                },
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 5
            });
            
            const profilesWithTags = await prisma.profile.findMany({
                where: {
                    tags: { hasSome: [q] }
                },
                select: { tags: true },
                take: 10
            });
            
            const matchedTags = new Set();
            profilesWithTags.forEach(p => {
                p.tags.forEach(t => {
                    if (t.toLowerCase().includes(q.toLowerCase())) {
                        matchedTags.add(t);
                    }
                });
            });
            
            const tagSuggestions = Array.from(matchedTags).slice(0, 5);
            
            return res.json({
                success: true,
                data: {
                    searches: popularSearches.map(s => s.searchQuery).filter(Boolean),
                    tags: tagSuggestions,
                    total_suggestions: popularSearches.length + tagSuggestions.length
                }
            });
        } catch (error) {
            console.error('Error getting suggestions:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get suggestions'
            });
        }
    }
}

module.exports = new SearchController();
