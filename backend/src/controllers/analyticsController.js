const analyticsService = require('../services/analyticsService');

const getDashboard = async (req, res, next) => {
  try {
    const data = await analyticsService.getDashboard();
    res.status(200).json(data);
  } catch (err) { next(err); }
};

const getUserAnalytics = async (req, res, next) => {
  try {
    const { days } = req.query;
    const data = await analyticsService.getUserAnalytics(parseInt(days) || 30);
    res.status(200).json(data);
  } catch (err) { next(err); }
};

const getBookingAnalytics = async (req, res, next) => {
  try {
    const { days } = req.query;
    const data = await analyticsService.getBookingAnalytics(parseInt(days) || 30);
    res.status(200).json(data);
  } catch (err) { next(err); }
};

const getFinancialAnalytics = async (req, res, next) => {
  try {
    const { days } = req.query;
    const data = await analyticsService.getFinancialAnalytics(parseInt(days) || 30);
    res.status(200).json(data);
  } catch (err) { next(err); }
};

const generateDailySnapshot = async (req, res, next) => {
  try {
    const data = await analyticsService.generateDailySnapshot(req.query.date || new Date());
    res.status(200).json(data);
  } catch (err) { next(err); }
};

const getReport = async (req, res, next) => {
  try {
    const report = await analyticsService.getReport(req.params.type);
    res.status(201).json(report);
  } catch (err) { next(err); }
};

const logActivity = async (req, res, next) => {
  try {
    const activity = await analyticsService.logActivity(req.user.id, req.body.action, req.body.category, req.body.details);
    res.status(201).json(activity);
  } catch (err) { next(err); }
};

const getPlatformMetrics = async (req, res, next) => {
  try {
    const metrics = await analyticsService.getPlatformMetrics();
    res.status(200).json(metrics);
  } catch (err) { next(err); }
};

module.exports = { getDashboard, getUserAnalytics, getBookingAnalytics, getFinancialAnalytics, generateDailySnapshot, getReport, logActivity, getPlatformMetrics };
