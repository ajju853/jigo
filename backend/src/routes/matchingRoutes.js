const express = require('express');
const {
  savePreferences, getPreferences, getRecommendations, calculateScore,
  dismissRecommendation, findStableMatches, trackInteraction, getInteractionHistory,
  storeEmbedding, getEmbedding, buildSkillGraph, detectClusters, getSkillClusters,
  assignVariant, evaluateABTest, evaluateModel, getMatchingMetrics, invalidateCache
} = require('../controllers/matchingController');
const { authenticate, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.get('/preferences', authenticate, getPreferences);
router.put('/preferences', authenticate, savePreferences);

router.get('/recommendations', authenticate, getRecommendations);
router.get('/stable-matches', authenticate, findStableMatches);

router.get('/score/:profileId', authenticate, calculateScore);
router.post('/score', authenticate, storeEmbedding);
router.get('/embedding/:entityType/:entityId', authenticate, getEmbedding);

router.post('/:profileId/dismiss', authenticate, dismissRecommendation);
router.post('/feedback', authenticate, trackInteraction);
router.get('/feedback/:profileId', authenticate, getInteractionHistory);

router.get('/skills/graph', authenticate, restrictTo('admin'), buildSkillGraph);
router.get('/skills/clusters', authenticate, getSkillClusters);
router.post('/skills/clusters/detect', authenticate, restrictTo('admin'), detectClusters);

router.get('/experiment/assign', authenticate, assignVariant);
router.get('/experiment/evaluate', authenticate, restrictTo('admin'), evaluateABTest);

router.get('/evaluate', authenticate, restrictTo('admin'), evaluateModel);
router.get('/metrics', authenticate, getMatchingMetrics);
router.post('/cache/invalidate', authenticate, invalidateCache);

module.exports = router;
