const matchingService = require('../services/matchingService');

const savePreferences = async (req, res, next) => {
  try {
    const prefs = await matchingService.savePreferences(req.user.id, req.body);
    res.status(200).json(prefs);
  } catch (err) { next(err); }
};

const getPreferences = async (req, res, next) => {
  try {
    const prefs = await matchingService.getPreferences(req.user.id);
    res.status(200).json(prefs);
  } catch (err) { next(err); }
};

const getRecommendations = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const minScore = parseInt(req.query.minScore) || 30;
    const results = await matchingService.getRecommendations(req.user.id, limit, minScore);
    res.status(200).json(results);
  } catch (err) { next(err); }
};

const calculateScore = async (req, res, next) => {
  try {
    const result = await matchingService.calculateScore(req.user.id, req.params.profileId);
    if (!result) return res.status(404).json({ error: 'Not Found', message: 'Profile not found.' });
    res.status(200).json(result);
  } catch (err) { next(err); }
};

const dismissRecommendation = async (req, res, next) => {
  try {
    const result = await matchingService.dismissRecommendation(req.user.id, req.params.profileId);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

const findStableMatches = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const matches = await matchingService.findStableMatches(req.user.id, limit);
    res.status(200).json(matches);
  } catch (err) { next(err); }
};

const trackInteraction = async (req, res, next) => {
  try {
    const { profileId, action, metadata } = req.body;
    await matchingService.trackInteraction(req.user.id, profileId, action, metadata);
    res.status(200).json({ success: true });
  } catch (err) { next(err); }
};

const getInteractionHistory = async (req, res, next) => {
  try {
    const history = await matchingService.getInteractionHistory(req.user.id, req.params.profileId);
    res.status(200).json(history);
  } catch (err) { next(err); }
};

const storeEmbedding = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.body;
    const result = await matchingService.storeEmbedding(entityType, entityId);
    if (!result) return res.status(400).json({ error: 'Bad Request', message: 'Invalid entity type or ID.' });
    res.status(201).json(result);
  } catch (err) { next(err); }
};

const getEmbedding = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;
    const embedding = await matchingService.getEmbedding(entityType, entityId);
    if (!embedding) return res.status(404).json({ error: 'Not Found', message: 'Embedding not found.' });
    res.status(200).json(embedding);
  } catch (err) { next(err); }
};

const buildSkillGraph = async (req, res, next) => {
  try {
    const graph = await matchingService.buildSkillGraph();
    res.status(200).json({ success: true, nodeCount: Object.keys(graph).length });
  } catch (err) { next(err); }
};

const detectClusters = async (req, res, next) => {
  try {
    const minSize = parseInt(req.query.minSize) || 3;
    const clusters = await matchingService.detectClusters(minSize);
    res.status(200).json(clusters);
  } catch (err) { next(err); }
};

const getSkillClusters = async (req, res, next) => {
  try {
    const clusters = await matchingService.getSkillClusters();
    res.status(200).json(clusters);
  } catch (err) { next(err); }
};

const assignVariant = async (req, res, next) => {
  try {
    const variant = await matchingService.assignVariant(req.user.id);
    res.status(200).json({ variant });
  } catch (err) { next(err); }
};

const evaluateABTest = async (req, res, next) => {
  try {
    const result = await matchingService.evaluateABTest();
    res.status(200).json(result);
  } catch (err) { next(err); }
};

const evaluateModel = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const result = await matchingService.evaluateModel(limit);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

const getMatchingMetrics = async (req, res, next) => {
  try {
    const metrics = await matchingService.getMatchingMetrics();
    res.status(200).json(metrics);
  } catch (err) { next(err); }
};

const invalidateCache = async (req, res, next) => {
  try {
    matchingService.invalidateCache(req.user.id);
    res.status(200).json({ success: true });
  } catch (err) { next(err); }
};

module.exports = {
  savePreferences,
  getPreferences,
  getRecommendations,
  calculateScore,
  dismissRecommendation,
  findStableMatches,
  trackInteraction,
  getInteractionHistory,
  storeEmbedding,
  getEmbedding,
  buildSkillGraph,
  detectClusters,
  getSkillClusters,
  assignVariant,
  evaluateABTest,
  evaluateModel,
  getMatchingMetrics,
  invalidateCache
};
