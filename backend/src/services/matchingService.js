const prisma = require('../config/database');

class MultiDimensionalScoringEngine {
  constructor() {
    this.weights = {
      SKILLS: 0.30,
      LOCATION: 0.20,
      PRICE: 0.15,
      DEMOGRAPHIC: 0.15,
      AVAILABILITY: 0.10,
      LANGUAGE: 0.05,
      REPUTATION: 0.05
    };
  }

  async calculateCompositeScore(user, profile, prefs) {
    const scores = {
      SKILLS: this.skillsMatch(profile.tags, prefs?.preferredTags || []),
      LOCATION: this.locationMatch(user.location, profile.user?.location, prefs?.locationRadius || 50),
      PRICE: this.priceMatch(Number(profile.pricePerHour || 0), prefs?.budgetMin, prefs?.budgetMax),
      DEMOGRAPHIC: this.demographicMatch(profile, prefs),
      AVAILABILITY: this.availabilityMatch(prefs?.availabilityPrefs, profile.availability),
      LANGUAGE: this.languageMatch(prefs?.preferredLanguages || [], profile.languages || []),
      REPUTATION: this.reputationMatch(Number(profile.rating || 0), profile.reviewsCount || 0, profile.verified || false)
    };

    const total = Object.keys(this.weights).reduce(
      (sum, key) => sum + (scores[key] || 0) * this.weights[key], 0
    );

    return {
      total: Math.round(total * 100),
      dimensionScores: scores,
      weights: this.weights,
      confidence: this.calculateConfidence(scores)
    };
  }

  skillsMatch(profileTags, preferredTags) {
    if (!preferredTags?.length) return 0.5;
    if (!profileTags?.length) return 0;
    const matches = preferredTags.filter(t =>
      profileTags.some(pt => pt.toLowerCase().includes(t.toLowerCase()))
    );
    return matches.length / preferredTags.length;
  }

  locationMatch(userLoc, jigoloLoc, radius) {
    if (!userLoc || !jigoloLoc) return 0.5;
    const d = this.haversineDistance(userLoc, jigoloLoc);
    if (d <= radius) return Math.max(0, 1 - (d / radius) * 0.5);
    return Math.max(0, 0.5 - ((d - radius) / radius) * 0.5);
  }

  haversineDistance(loc1, loc2) {
    const parseLoc = (loc) => {
      if (typeof loc === 'object' && loc !== null) return { lat: parseFloat(loc.lat) || 0, lng: parseFloat(loc.lng || loc.lon) || 0 };
      if (typeof loc === 'string') return { lat: 0, lng: 0 };
      return { lat: 0, lng: 0 };
    };
    const a = parseLoc(loc1);
    const b = parseLoc(loc2);
    if (!a.lat && !a.lng && !b.lat && !b.lng) return 50;
    if (!a.lat || !b.lat) return 50;
    const toRad = x => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const sin = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(sin), Math.sqrt(1 - sin));
  }

  priceMatch(price, min, max) {
    if (!price) return 0.5;
    const mn = Number(min) || 0;
    const mx = Number(max) || (mn * 2 || 1000);
    if (price < mn) return Math.max(0, 1 - (mn - price) / Math.max(mn, 1));
    if (price > mx) return Math.max(0, 1 - (price - mx) / Math.max(mx, 1));
    const range = mx - mn;
    const pos = range ? (price - mn) / range : 0.5;
    return 1 - Math.pow((pos - 0.5) * 2, 2) * 0.5;
  }

  demographicMatch(profile, prefs) {
    let score = 0;
    if (prefs?.preferredGenders?.length) {
      if (prefs.preferredGenders.some(g => g.toLowerCase() === profile.gender?.toLowerCase())) score += 0.5;
    } else {
      score += 0.5;
    }
    if (prefs?.ageRangeMin && profile.age && profile.age >= prefs.ageRangeMin) score += 0.25;
    if (prefs?.ageRangeMax && profile.age && profile.age <= prefs.ageRangeMax) score += 0.25;
    return Math.min(score, 1);
  }

  availabilityMatch(userAvail, jigoloAvail) {
    if (!userAvail || !jigoloAvail) return 0.5;
    return 0.8;
  }

  languageMatch(preferred, profileLangs) {
    if (!preferred?.length) return 0.5;
    if (!profileLangs?.length) return 0;
    const matches = preferred.filter(l =>
      profileLangs.some(pl => pl.toLowerCase() === l.toLowerCase())
    );
    return matches.length / preferred.length;
  }

  reputationMatch(rating, reviewsCount, verified) {
    const ratingScore = Math.min(rating / 5, 1);
    const reviewScore = Math.min(reviewsCount / 10, 1) * 0.5;
    const verifiedBonus = verified ? 0.25 : 0;
    return Math.min(ratingScore * 0.5 + reviewScore + verifiedBonus, 1);
  }

  calculateConfidence(scores) {
    const filled = Object.values(scores).filter(s => s !== undefined && s !== null).length;
    return parseFloat((filled / 7).toFixed(2));
  }
}

class StableMatchingEngine {
  buildRankingMatrix(preferences) {
    return preferences.map(prefList => {
      const rank = {};
      prefList.forEach((id, index) => { rank[id] = index; });
      return rank;
    });
  }

  findStableMatches(customerPreferences, jigoloPreferences) {
    if (!customerPreferences?.length) return [];
    const n = customerPreferences.length;
    const freeCustomers = Array.from({ length: n }, (_, i) => i);
    const jigoloPartners = new Array(n).fill(-1);
    const nextProposal = new Array(n).fill(0);
    const customerRanking = this.buildRankingMatrix(jigoloPreferences);

    while (freeCustomers.length > 0) {
      const customer = freeCustomers.pop();
      if (nextProposal[customer] >= (customerPreferences[customer]?.length || 0)) continue;
      const jigolo = customerPreferences[customer][nextProposal[customer]];
      nextProposal[customer]++;

      if (jigoloPartners[jigolo] === -1) {
        jigoloPartners[jigolo] = customer;
      } else if (customerRanking[jigolo] && customerRanking[jigolo][customer] !== undefined) {
        const currentPartner = jigoloPartners[jigolo];
        if (customerRanking[jigolo][customer] < customerRanking[jigolo][currentPartner]) {
          jigoloPartners[jigolo] = customer;
          freeCustomers.push(currentPartner);
        } else {
          freeCustomers.push(customer);
        }
      } else {
        freeCustomers.push(customer);
      }
    }

    return jigoloPartners.map((customer, jigolo) => ({
      jigoloIndex: jigolo,
      customerIndex: customer
    })).filter(m => m.customerIndex !== -1);
  }
}

class PredicateSearchEngine {
  async findOptimalMatch(requirements, profiles, scorer) {
    let low = 0;
    let high = 100;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const feasible = await this.isFeasible(mid, requirements, profiles, scorer);
      if (feasible) low = mid + 1;
      else high = mid;
    }
    return low;
  }

  async isFeasible(minScore, requirements, profiles, scorer) {
    const scored = [];
    for (const profile of profiles) {
      const result = await scorer.calculateCompositeScore(requirements, profile, {});
      if (result.total >= minScore) scored.push(profile);
      if (scored.length >= 10) return true;
    }
    return scored.length >= 10;
  }
}

class EmbeddingEngine {
  constructor() {
    this.dim = 64;
    this.vocab = {};
    this.nextId = 1;
  }

  _tokenize(text) {
    const tokens = (text || '').toLowerCase().split(/\s+/).filter(Boolean);
    const ngrams = [];
    for (const token of tokens) {
      ngrams.push(token);
      if (token.length > 2) {
        for (let i = 0; i <= token.length - 2; i++) ngrams.push(`_${token.substring(i, i + 2)}_`);
      }
    }
    return ngrams;
  }

  _embed(tokens) {
    const vec = new Array(this.dim).fill(0);
    for (const token of tokens) {
      if (!this.vocab[token]) this.vocab[token] = this.nextId++;
      const id = this.vocab[token];
      for (let i = 0; i < this.dim; i++) {
        vec[i] += Math.sin(id * (i + 1) * 0.1) * Math.cos(id * 0.5 + i * 0.3);
      }
    }
    if (tokens.length) {
      for (let i = 0; i < this.dim; i++) vec[i] /= Math.sqrt(tokens.length);
    }
    const mag = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
    return mag ? vec.map(v => v / mag) : vec;
  }

  async encodeUser(user) {
    const text = `${user.name || ''} ${user.email || ''} ${user.location || ''}`;
    return this._embed(this._tokenize(text));
  }

  async encodeJigolo(profile) {
    const text = `${(profile.tags || []).join(' ')} ${(profile.specialties || []).join(' ')} ${profile.bio || ''} ${(profile.languages || []).join(' ')}`;
    return this._embed(this._tokenize(text));
  }

  cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    const dot = a.reduce((s, v, i) => s + v * (b[i] || 0), 0);
    return dot;
  }

  findNearestNeighbors(userEmbedding, profileEmbeddings, topK = 100) {
    const results = profileEmbeddings.map((e, i) => ({
      index: i,
      profileId: e.jigoloId || e.profileId || i,
      similarity: this.cosineSimilarity(userEmbedding, e.embedding || e)
    }));
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, topK);
  }
}

class SkillsClusteringEngine {
  async buildSkillGraph(profiles) {
    const graph = {};
    for (const profile of profiles) {
      const tags = profile.tags || [];
      for (let i = 0; i < tags.length; i++) {
        if (!graph[tags[i]]) graph[tags[i]] = {};
        for (let j = 0; j < tags.length; j++) {
          if (i !== j) {
            graph[tags[i]][tags[j]] = (graph[tags[i]][tags[j]] || 0) + 1;
          }
        }
      }
    }

    for (const [skill, connections] of Object.entries(graph)) {
      await prisma.skillsGraph.upsert({
        where: { skillName: skill },
        update: { coOccurringSkills: connections, frequency: Object.values(connections).reduce((s, v) => s + v, 0) },
        create: { skillName: skill, coOccurringSkills: connections, frequency: Object.values(connections).reduce((s, v) => s + v, 0) }
      });
    }

    return graph;
  }

  async detectClusters(minClusterSize = 3) {
    const entries = await prisma.skillsGraph.findMany();
    const graph = {};
    for (const e of entries) {
      graph[e.skillName] = e.coOccurringSkills || {};
    }

    const visited = new Set();
    const clusters = [];
    for (const skill of Object.keys(graph)) {
      if (visited.has(skill)) continue;
      const cluster = this.expandCluster(skill, graph, visited);
      if (cluster.length >= minClusterSize) {
        const centrality = cluster.length > 1
          ? parseFloat((cluster.reduce((s, sk) => {
              const conns = graph[sk] || {};
              return s + Object.keys(conns).length;
            }, 0) / cluster.length / Math.max(...cluster.map(sk => Object.keys(graph[sk] || {}).length || 1))).toFixed(2))
          : 1;

        const saved = await prisma.skillCluster.create({
          data: {
            clusterName: `Cluster_${clusters.length + 1}`,
            skills: cluster,
            clusterCentrality: centrality
          }
        });

        for (const skill of cluster) {
          await prisma.skillsGraph.update({
            where: { skillName: skill },
            data: { clusterId: saved.id }
          });
        }

        clusters.push({ id: saved.id, name: saved.clusterName, skills: cluster, centrality });
      }
    }
    return clusters;
  }

  expandCluster(startSkill, graph, visited) {
    const queue = [startSkill];
    const cluster = [];
    while (queue.length > 0) {
      const skill = queue.shift();
      if (visited.has(skill)) continue;
      visited.add(skill);
      cluster.push(skill);
      const connections = graph[skill] || {};
      for (const [connectedSkill, weight] of Object.entries(connections)) {
        if (weight > 2 && !visited.has(connectedSkill)) {
          queue.push(connectedSkill);
        }
      }
    }
    return cluster;
  }
}

class CachingStrategy {
  constructor() {
    this.localCache = new Map();
    this.ttl = 60000;
    this.redisClient = null;
    this.redisEnabled = false;
    if (process.env.REDIS_URL) {
      try {
        const Redis = require('ioredis');
        this.redisClient = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 1, lazyConnect: true });
        this.redisClient.connect().then(() => { this.redisEnabled = true; }).catch(() => {});
      } catch {}
    }
  }

  _localGet(userId) {
    if (this.localCache.has(userId)) {
      const entry = this.localCache.get(userId);
      if (Date.now() - entry.timestamp < this.ttl) return entry.data;
    }
    return null;
  }

  _localSet(userId, data) {
    this.localCache.set(userId, { data, timestamp: Date.now() });
    if (this.localCache.size > 1000) {
      const oldest = [...this.localCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      if (oldest) this.localCache.delete(oldest[0]);
    }
  }

  async getCachedRecommendations(userId) {
    const local = this._localGet(userId);
    if (local) return local;
    if (this.redisEnabled) {
      try {
        const data = await this.redisClient.get(`rec:${userId}`);
        if (data) {
          const parsed = JSON.parse(data);
          this._localSet(userId, parsed);
          return parsed;
        }
      } catch {}
    }
    return null;
  }

  async cacheRecommendations(userId, data) {
    this._localSet(userId, data);
    if (this.redisEnabled) {
      try {
        await this.redisClient.setex(`rec:${userId}`, 60, JSON.stringify(data));
      } catch {}
    }
  }

  invalidate(userId) {
    this.localCache.delete(userId);
    if (this.redisEnabled) {
      this.redisClient.del(`rec:${userId}`).catch(() => {});
    }
  }
}

class FeedbackLoop {
  async trackInteraction(userId, profileId, action, metadata = {}) {
    await prisma.matchingFeedback.create({
      data: { userId, profileId, action, metadata }
    });

    if (action === 'liked' || action === 'booked') {
      await this.adjustScore(userId, profileId, 5);
    } else if (action === 'dismissed') {
      await this.adjustScore(userId, profileId, -10);
    }
  }

  async adjustScore(userId, profileId, delta) {
    const existing = await prisma.matchingScore.findUnique({
      where: { userId_profileId: { userId, profileId } }
    });
    if (!existing) return;

    const newScore = Math.max(0, Math.min(100, Number(existing.score) + delta));
    await prisma.matchingScore.update({
      where: { userId_profileId: { userId, profileId } },
      data: { score: newScore, lastCalculated: new Date() }
    });
  }

  async getInteractionHistory(userId, profileId) {
    return prisma.matchingFeedback.findMany({
      where: { userId, profileId },
      orderBy: { createdAt: 'desc' }
    });
  }
}

class ABTesting {
  async assignVariant(userId) {
    const userIndex = userId.charCodeAt(0) + (userId.charCodeAt(1) || 0);
    const variant = userIndex % 2 === 0 ? 'A' : 'B';
    await prisma.experimentData.create({
      data: { userId, variant, metrics: { assignedAt: new Date().toISOString() } }
    });
    return variant;
  }

  async recordMetrics(userId, variant, metrics) {
    await prisma.experimentData.create({
      data: { userId, variant, metrics }
    });
  }

  async evaluateSignificance() {
    const data = await prisma.experimentData.findMany();
    const groupA = data.filter(d => d.variant === 'A');
    const groupB = data.filter(d => d.variant === 'B');

    if (groupA.length < 2 || groupB.length < 2) {
      return { significant: false, winner: null, message: 'Insufficient data' };
    }

    const avgA = groupA.reduce((s, d) => s + (d.metrics?.conversion || 0), 0) / groupA.length;
    const avgB = groupB.reduce((s, d) => s + (d.metrics?.conversion || 0), 0) / groupB.length;

    return {
      significant: Math.abs(avgA - avgB) > 0.05,
      winner: avgA > avgB ? 'A' : 'B',
      avgA: parseFloat(avgA.toFixed(4)),
      avgB: parseFloat(avgB.toFixed(4)),
      sampleA: groupA.length,
      sampleB: groupB.length
    };
  }
}

class MatchingEvaluator {
  async evaluate(limit = 100) {
    const feedback = await prisma.matchingFeedback.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: true, profile: true }
    });

    if (!feedback.length) return { precision: 0, recall: 0, ndcg: 0, samples: 0 };

    const positiveActions = feedback.filter(f => ['liked', 'booked'].includes(f.action));
    const precision = parseFloat((positiveActions.length / feedback.length).toFixed(4));

    const recommendations = await prisma.recommendedMatch.findMany({
      where: { userId: { in: [...new Set(feedback.map(f => f.userId))] } }
    });
    const recall = recommendations.length
      ? parseFloat((positiveActions.length / Math.max(recommendations.length, 1)).toFixed(4))
      : 0;

    return { precision, recall, ndcg: parseFloat(((precision + recall) / 2).toFixed(4)), samples: feedback.length };
  }
}

class MatchingService {
  constructor() {
    this.scoring = new MultiDimensionalScoringEngine();
    this.galeShapley = new StableMatchingEngine();
    this.predicateSearch = new PredicateSearchEngine();
    this.embedding = new EmbeddingEngine();
    this.skillsCluster = new SkillsClusteringEngine();
    this.cache = new CachingStrategy();
    this.feedback = new FeedbackLoop();
    this.abTesting = new ABTesting();
    this.evaluator = new MatchingEvaluator();
  }

  async savePreferences(userId, prefs) {
    return prisma.matchingPreference.upsert({
      where: { userId },
      update: {
        preferredGenders: prefs.preferredGenders || [],
        ageRangeMin: prefs.ageRangeMin,
        ageRangeMax: prefs.ageRangeMax,
        preferredLanguages: prefs.preferredLanguages || [],
        preferredTags: prefs.preferredTags || [],
        budgetMin: prefs.budgetMin,
        budgetMax: prefs.budgetMax,
        locationRadius: prefs.locationRadius || 50,
        availabilityPrefs: prefs.availabilityPrefs
      },
      create: {
        userId,
        preferredGenders: prefs.preferredGenders || [],
        ageRangeMin: prefs.ageRangeMin,
        ageRangeMax: prefs.ageRangeMax,
        preferredLanguages: prefs.preferredLanguages || [],
        preferredTags: prefs.preferredTags || [],
        budgetMin: prefs.budgetMin,
        budgetMax: prefs.budgetMax,
        locationRadius: prefs.locationRadius || 50,
        availabilityPrefs: prefs.availabilityPrefs
      }
    });
  }

  async getPreferences(userId) {
    return prisma.matchingPreference.findUnique({ where: { userId } });
  }

  async calculateScore(userId, profileId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { matchingPreference: true }
    });
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: { user: true }
    });
    if (!user || !profile) return null;

    const prefs = user.matchingPreference || {};
    const result = await this.scoring.calculateCompositeScore(user, profile, prefs);

    await prisma.matchingScore.upsert({
      where: { userId_profileId: { userId, profileId } },
      update: {
        score: result.total / 100,
        skillsScore: result.dimensionScores.SKILLS,
        locationScore: result.dimensionScores.LOCATION,
        priceScore: result.dimensionScores.PRICE,
        demographicScore: result.dimensionScores.DEMOGRAPHIC,
        availabilityScore: result.dimensionScores.AVAILABILITY,
        languageScore: result.dimensionScores.LANGUAGE,
        reputationScore: result.dimensionScores.REPUTATION,
        confidence: result.confidence,
        factors: result,
        lastCalculated: new Date()
      },
      create: {
        userId, profileId,
        score: result.total / 100,
        skillsScore: result.dimensionScores.SKILLS,
        locationScore: result.dimensionScores.LOCATION,
        priceScore: result.dimensionScores.PRICE,
        demographicScore: result.dimensionScores.DEMOGRAPHIC,
        availabilityScore: result.dimensionScores.AVAILABILITY,
        languageScore: result.dimensionScores.LANGUAGE,
        reputationScore: result.dimensionScores.REPUTATION,
        confidence: result.confidence,
        factors: result
      }
    });

    return result;
  }

  async getRecommendations(userId, limit = 20, minScore = 30) {
    const cached = await this.cache.getCachedRecommendations(userId);
    if (cached) return cached;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { matchingPreference: true }
    });
    if (!user) return [];

    const prefs = user.matchingPreference || {};
    const where = {
      userId: { not: userId },
      user: { isActive: true },
      ...(prefs.preferredGenders?.length ? { gender: { in: prefs.preferredGenders } } : {})
    };

    const potential = await prisma.profile.findMany({
      where,
      include: { user: { select: { name: true, profilePhoto: true, location: true, phone: true } } },
      take: limit * 3
    });

    const scored = [];
    for (const profile of potential) {
      const result = await this.scoring.calculateCompositeScore(user, profile, prefs);
      if (result.total >= minScore) {
        scored.push({ profile, score: result.total, factors: result });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, limit);

    for (const r of top) {
      await prisma.recommendedMatch.upsert({
        where: { userId_profileId: { userId, profileId: r.profile.id } },
        update: { matchScore: r.score / 100, reason: this.generateReason(r) },
        create: { userId, profileId: r.profile.id, matchScore: r.score / 100, reason: this.generateReason(r) }
      });
    }

    const results = top.map(r => ({
      profile: {
        ...r.profile,
        matchScore: r.score,
        matchFactors: r.factors
      },
      score: r.score,
      explanation: this.generateExplanation(r)
    }));

    await this.cache.cacheRecommendations(userId, results);
    return results;
  }

  generateReason(match) {
    const parts = [];
    const dims = match.factors?.dimensionScores || {};
    if (dims.SKILLS >= 0.7) parts.push('Shared interests');
    if (dims.LOCATION >= 0.7) parts.push('Nearby');
    if (dims.PRICE >= 0.7) parts.push('Budget-friendly');
    if (dims.REPUTATION >= 0.7) parts.push('Highly rated');
    if (dims.LANGUAGE >= 0.7) parts.push('Same language');
    return parts.length ? parts.slice(0, 2).join(', ') : `Match score: ${match.score}%`;
  }

  generateExplanation(match) {
    const reasons = [];
    const dims = match.factors?.dimensionScores || {};
    if (dims.SKILLS >= 0.7) reasons.push('You share many common interests');
    if (dims.LOCATION >= 0.7) reasons.push('Located near you');
    if (dims.PRICE >= 0.7) reasons.push('Within your budget range');
    if (dims.REPUTATION >= 0.7) reasons.push('Highly rated by other users');
    if (dims.LANGUAGE >= 0.7) reasons.push('Speaks your language');
    return {
      reasons: reasons.slice(0, 3),
      summary: `Score: ${match.score}% — ${reasons.join(', ') || 'Good match'}`
    };
  }

  async findStableMatches(userId, limit = 20) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { matchingPreference: true }
    });
    if (!user) return [];

    const prefs = user.matchingPreference || {};
    const profiles = await prisma.profile.findMany({
      where: {
        userId: { not: userId },
        user: { isActive: true },
        ...(prefs.preferredGenders?.length ? { gender: { in: prefs.preferredGenders } } : {})
      },
      take: 50
    });

    if (!profiles.length) return [];

    const profileIds = profiles.map(p => p.id);
    const idToIndex = {};
    profileIds.forEach((id, i) => { idToIndex[id] = i; });

    const scoreCache = {};
    const getScore = async (uid, pid) => {
      const key = `${uid}_${pid}`;
      if (scoreCache[key]) return scoreCache[key];
      if (uid === pid) { scoreCache[key] = 0; return 0; }
      const p = profiles.find(pr => pr.id === pid);
      if (!p) { scoreCache[key] = 0; return 0; }
      const result = await this.scoring.calculateCompositeScore(user, p, prefs);
      scoreCache[key] = result.total;
      return result.total;
    };

    const customerPrefs = [];
    for (const profile of profiles) {
      const scored = [];
      for (const pid of profileIds) {
        const s = await getScore(profile.id, pid);
        scored.push({ id: pid, score: s });
      }
      scored.sort((a, b) => b.score - a.score);
      customerPrefs.push(scored.map(x => idToIndex[x.id]));
    }

    const jigoloPrefs = [];
    for (let j = 0; j < profiles.length; j++) {
      const scored = [];
      for (let u = 0; u < profiles.length; u++) {
        const s = customerPrefs[u]?.[j] !== undefined ? 100 - customerPrefs[u][j] : 50;
        scored.push({ id: u, score: s });
      }
      scored.sort((a, b) => b.score - a.score);
      jigoloPrefs.push(scored.map(x => x.id));
    }

    const stableMatches = this.galeShapley.findStableMatches(customerPrefs, jigoloPrefs);

    return stableMatches
      .filter(m => m.jigoloIndex >= 0 && m.jigoloIndex < profiles.length)
      .map(m => ({
        profile: profiles[m.jigoloIndex],
        score: customerPrefs[m.customerIndex]?.[m.jigoloIndex] !== undefined
          ? Math.round(customerPrefs[m.customerIndex][m.jigoloIndex] * 100 / profiles.length)
          : 50
      }))
      .slice(0, limit);
  }

  async dismissRecommendation(userId, profileId) {
    return prisma.recommendedMatch.upsert({
      where: { userId_profileId: { userId, profileId } },
      update: { isDismissed: true, dismissedAt: new Date() },
      create: { userId, profileId, matchScore: 0, isDismissed: true, dismissedAt: new Date() }
    });
  }

  async trackInteraction(userId, profileId, action, metadata = {}) {
    await this.feedback.trackInteraction(userId, profileId, action, metadata);
  }

  async getInteractionHistory(userId, profileId) {
    return this.feedback.getInteractionHistory(userId, profileId);
  }

  async storeEmbedding(entityType, entityId) {
    if (entityType === 'user') {
      const user = await prisma.user.findUnique({ where: { id: entityId } });
      if (!user) return null;
      const embedding = await this.embedding.encodeUser(user);
      return prisma.userEmbedding.upsert({
        where: { userId: entityId },
        update: { embedding, modelVersion: 'v1', lastComputed: new Date() },
        create: { userId: entityId, embedding, modelVersion: 'v1' }
      });
    }
    if (entityType !== 'profile') return null;

    const profile = await prisma.profile.findUnique({
      where: { id: entityId },
      include: { user: true }
    });
    if (!profile) return null;
    const embedding = await this.embedding.encodeJigolo(profile);
    return prisma.jigoloEmbedding.upsert({
      where: { jigoloId: entityId },
      update: { embedding, modelVersion: 'v1', lastComputed: new Date() },
      create: { jigoloId: entityId, embedding, modelVersion: 'v1' }
    });
  }

  async getEmbedding(entityType, entityId) {
    if (entityType === 'user') {
      return prisma.userEmbedding.findUnique({ where: { userId: entityId } });
    }
    return prisma.jigoloEmbedding.findUnique({ where: { jigoloId: entityId } });
  }

  async buildSkillGraph() {
    const profiles = await prisma.profile.findMany({
      where: { tags: { isEmpty: false } },
      select: { tags: true }
    });
    return this.skillsCluster.buildSkillGraph(profiles);
  }

  async detectClusters(minClusterSize = 3) {
    return this.skillsCluster.detectClusters(minClusterSize);
  }

  async getSkillClusters() {
    return prisma.skillCluster.findMany({
      orderBy: { clusterCentrality: 'desc' }
    });
  }

  async assignVariant(userId) {
    return this.abTesting.assignVariant(userId);
  }

  async evaluateABTest() {
    return this.abTesting.evaluateSignificance();
  }

  async evaluateModel(limit = 100) {
    return this.evaluator.evaluate(limit);
  }

  async getMatchingMetrics() {
    const [totalScores, totalRecs, totalFeedback, totalClusters, avgScore] = await Promise.all([
      prisma.matchingScore.count(),
      prisma.recommendedMatch.count({ where: { isDismissed: false } }),
      prisma.matchingFeedback.count(),
      prisma.skillCluster.count(),
      prisma.matchingScore.aggregate({ _avg: { score: true } })
    ]);

    return {
      totalScores,
      totalRecommendations: totalRecs,
      totalFeedback,
      totalSkillClusters: totalClusters,
      averageMatchScore: parseFloat((avgScore._avg.score || 0).toFixed(2)),
      cacheSize: this.cache.localCache.size
    };
  }

  invalidateCache(userId) {
    this.cache.invalidate(userId);
  }
}

module.exports = new MatchingService();
