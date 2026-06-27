const express = require('express');
const {
  getConfigurations,
  updateConfiguration,
  getJigoloPreference,
  updateJigoloPreference,
  calculateFees,
  createFeeTransaction,
  getFeeTransactions,
  getFeeTransactionById,
  settleFee,
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  subscribe,
  cancelSubscription,
  getUserSubscription,
  createFeeDispute,
  resolveFeeDispute,
  getFeeDisputes,
  getRevenueReport,
  getJigoloEarnings
} = require('../controllers/feeController');
const { authenticate, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.get('/configurations', authenticate, getConfigurations);
router.put('/configurations/:key', authenticate, restrictTo('admin'), updateConfiguration);

router.get('/preferences/:jigoloId?', authenticate, getJigoloPreference);
router.put('/preferences/:jigoloId?', authenticate, updateJigoloPreference);

router.post('/calculate', authenticate, restrictTo('admin'), calculateFees);
router.post('/transactions', authenticate, restrictTo('admin'), createFeeTransaction);

router.get('/transactions', authenticate, getFeeTransactions);
router.get('/transactions/:id', authenticate, getFeeTransactionById);
router.post('/transactions/:id/settle', authenticate, restrictTo('admin'), settleFee);

router.get('/plans', authenticate, getSubscriptionPlans);
router.post('/plans', authenticate, restrictTo('admin'), createSubscriptionPlan);
router.put('/plans/:id', authenticate, restrictTo('admin'), updateSubscriptionPlan);

router.post('/subscribe', authenticate, subscribe);
router.post('/cancel-subscription', authenticate, cancelSubscription);
router.get('/my-subscription', authenticate, getUserSubscription);

router.get('/disputes', authenticate, getFeeDisputes);
router.post('/disputes', authenticate, createFeeDispute);
router.post('/disputes/:id/resolve', authenticate, restrictTo('admin'), resolveFeeDispute);

router.get('/reports/revenue', authenticate, restrictTo('admin'), getRevenueReport);
router.get('/reports/earnings/:jigoloId?', authenticate, getJigoloEarnings);

module.exports = router;
