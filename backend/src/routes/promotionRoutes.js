const express = require('express');
const { applyPromotion, createPromotion, getLoyalty, redeemPoints, getLeaderboard, generateReferral, processReferral, getReferralAnalytics, completeReferral } = require('../controllers/promotionController');
const { authenticate, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.post('/apply', authenticate, applyPromotion);
router.post('/', authenticate, restrictTo('admin'), createPromotion);
router.get('/loyalty', authenticate, getLoyalty);
router.post('/loyalty/redeem', authenticate, redeemPoints);
router.get('/leaderboard', getLeaderboard);
router.post('/referral/generate', authenticate, generateReferral);
router.post('/referral/use', authenticate, processReferral);
router.get('/referral/analytics', authenticate, getReferralAnalytics);
router.post('/referral/:referralId/complete', authenticate, completeReferral);

module.exports = router;
