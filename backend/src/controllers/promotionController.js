const promotionService = require('../services/promotionService');

const applyPromotion = async (req, res, next) => {
  try {
    const { code } = req.body;
    const result = await promotionService.validateAndApply(code, req.user.id, req.body.amount);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

const createPromotion = async (req, res, next) => {
  try {
    const prom = await promotionService.create(req.body);
    res.status(201).json(prom);
  } catch (err) { next(err); }
};

const getLoyalty = async (req, res, next) => {
  try {
    const loyalty = await promotionService.getLoyalty(req.user.id);
    res.status(200).json(loyalty);
  } catch (err) { next(err); }
};

const redeemPoints = async (req, res, next) => {
  try {
    const result = await promotionService.redeemPoints(req.user.id, req.body.points);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

const getLeaderboard = async (req, res, next) => {
  try {
    const board = await promotionService.getLeaderboard();
    res.status(200).json(board);
  } catch (err) { next(err); }
};

const generateReferral = async (req, res, next) => {
  try {
    const refCode = await promotionService.generateReferralCode(req.user.id);
    res.status(201).json(refCode);
  } catch (err) { next(err); }
};

const processReferral = async (req, res, next) => {
  try {
    const { code } = req.body;
    const referral = await promotionService.processReferral(code, req.user.id);
    res.status(200).json(referral);
  } catch (err) { next(err); }
};

const getReferralAnalytics = async (req, res, next) => {
  try {
    const analytics = await promotionService.getReferralAnalytics(req.user.id);
    res.status(200).json(analytics);
  } catch (err) { next(err); }
};

const completeReferral = async (req, res, next) => {
  try {
    const { referralId } = req.params;
    const result = await promotionService.completeReferral(referralId, req.user.id);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

module.exports = { applyPromotion, createPromotion, getLoyalty, redeemPoints, getLeaderboard, generateReferral, processReferral, getReferralAnalytics, completeReferral };
