const express = require('express');
const { getDashboard, getUserAnalytics, getBookingAnalytics, getFinancialAnalytics, generateDailySnapshot, getReport, logActivity, getPlatformMetrics } = require('../controllers/analyticsController');
const { authenticate, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.post('/log-activity', authenticate, logActivity);
router.get('/platform-metrics', getPlatformMetrics);

router.use(authenticate, restrictTo('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUserAnalytics);
router.get('/bookings', getBookingAnalytics);
router.get('/financial', getFinancialAnalytics);
router.post('/daily-snapshot', generateDailySnapshot);
router.get('/reports/:type', getReport);

module.exports = router;
