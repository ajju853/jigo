const feeService = require('../services/feeService');

const getConfigurations = async (req, res, next) => {
  try {
    const configs = await feeService.getConfigurations();
    res.status(200).json(configs);
  } catch (err) { next(err); }
};

const updateConfiguration = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value, reason } = req.body;
    const config = await feeService.updateConfiguration(key, value, req.user.id, reason);
    res.status(200).json(config);
  } catch (err) { next(err); }
};

const getJigoloPreference = async (req, res, next) => {
  try {
    const jigoloId = req.params.jigoloId || req.user.id;
    const pref = await feeService.getJigoloPreference(jigoloId);
    res.status(200).json(pref);
  } catch (err) { next(err); }
};

const updateJigoloPreference = async (req, res, next) => {
  try {
    const jigoloId = req.params.jigoloId || req.user.id;
    const pref = await feeService.updateJigoloPreference(jigoloId, req.body);
    res.status(200).json(pref);
  } catch (err) { next(err); }
};

const calculateFees = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const calculation = await feeService.calculateFees(bookingId);
    res.status(200).json(calculation);
  } catch (err) { next(err); }
};

const createFeeTransaction = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const tx = await feeService.createFeeTransaction(bookingId);
    res.status(201).json(tx);
  } catch (err) { next(err); }
};

const getFeeTransactions = async (req, res, next) => {
  try {
    const filters = {};

    if (req.user.role === 'jigolo') {
      filters.jigoloId = req.user.id;
    } else if (req.user.role === 'customer') {
      filters.customerId = req.user.id;
    }

    if (req.query.status) filters.status = req.query.status;
    if (req.query.bookingId) filters.bookingId = req.query.bookingId;
    if (req.query.page) filters.page = req.query.page;
    if (req.query.limit) filters.limit = req.query.limit;

    const transactions = await feeService.getFeeTransactions(filters);
    res.status(200).json(transactions);
  } catch (err) { next(err); }
};

const getFeeTransactionById = async (req, res, next) => {
  try {
    const tx = await feeService.getFeeTransactionById(req.params.id);
    res.status(200).json(tx);
  } catch (err) { next(err); }
};

const settleFee = async (req, res, next) => {
  try {
    const tx = await feeService.settleFee(req.params.id, req.user.id);
    res.status(200).json(tx);
  } catch (err) { next(err); }
};

const getSubscriptionPlans = async (req, res, next) => {
  try {
    const plans = await feeService.getSubscriptionPlans();
    res.status(200).json(plans);
  } catch (err) { next(err); }
};

const createSubscriptionPlan = async (req, res, next) => {
  try {
    const plan = await feeService.createSubscriptionPlan(req.body, req.user.id);
    res.status(201).json(plan);
  } catch (err) { next(err); }
};

const updateSubscriptionPlan = async (req, res, next) => {
  try {
    const plan = await feeService.updateSubscriptionPlan(req.params.id, req.body, req.user.id);
    res.status(200).json(plan);
  } catch (err) { next(err); }
};

const subscribe = async (req, res, next) => {
  try {
    const { planId } = req.body;
    const subscription = await feeService.subscribe(req.user.id, planId);
    res.status(201).json(subscription);
  } catch (err) { next(err); }
};

const cancelSubscription = async (req, res, next) => {
  try {
    const result = await feeService.cancelSubscription(req.user.id);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

const getUserSubscription = async (req, res, next) => {
  try {
    const subscription = await feeService.getUserSubscription(req.user.id);
    res.status(200).json(subscription || { message: 'No active subscription' });
  } catch (err) { next(err); }
};

const createFeeDispute = async (req, res, next) => {
  try {
    const dispute = await feeService.createFeeDispute({
      ...req.body,
      raisedById: req.user.id
    });
    res.status(201).json(dispute);
  } catch (err) { next(err); }
};

const resolveFeeDispute = async (req, res, next) => {
  try {
    const dispute = await feeService.resolveFeeDispute(req.params.id, req.body, req.user.id);
    res.status(200).json(dispute);
  } catch (err) { next(err); }
};

const getFeeDisputes = async (req, res, next) => {
  try {
    const filters = {};
    if (req.user.role !== 'admin') {
      filters.raisedById = req.user.id;
    }
    if (req.query.status) filters.status = req.query.status;
    if (req.query.page) filters.page = req.query.page;
    if (req.query.limit) filters.limit = req.query.limit;

    const disputes = await feeService.getFeeDisputes(filters);
    res.status(200).json(disputes);
  } catch (err) { next(err); }
};

const getRevenueReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await feeService.getRevenueReport(startDate, endDate);
    res.status(200).json(report);
  } catch (err) { next(err); }
};

const getJigoloEarnings = async (req, res, next) => {
  try {
    const jigoloId = req.params.jigoloId || req.user.id;
    const { startDate, endDate, page, limit } = req.query;
    const report = await feeService.getJigoloEarningsReport(jigoloId, startDate, endDate, { page, limit });
    res.status(200).json(report);
  } catch (err) { next(err); }
};

module.exports = {
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
};
