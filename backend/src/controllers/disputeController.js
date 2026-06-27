const disputeService = require('../services/disputeService');

const raiseDispute = async (req, res, next) => {
  try {
    const dispute = await disputeService.raise(req.user.id, req.body);
    res.status(201).json(dispute);
  } catch (err) { next(err); }
};

const getDispute = async (req, res, next) => {
  try {
    const dispute = await disputeService.getById(req.params.id, req.user.id);
    res.status(200).json(dispute);
  } catch (err) { next(err); }
};

const getMyDisputes = async (req, res, next) => {
  try {
    const disputes = await disputeService.getByUser(req.user.id, req.query);
    res.status(200).json(disputes);
  } catch (err) { next(err); }
};

const addMessage = async (req, res, next) => {
  try {
    const msg = await disputeService.addMessage(req.params.id, req.user.id, req.body);
    res.status(201).json(msg);
  } catch (err) { next(err); }
};

const addEvidence = async (req, res, next) => {
  try {
    const evidence = await disputeService.addEvidence(req.params.id, req.user.id, req.body);
    res.status(201).json(evidence);
  } catch (err) { next(err); }
};

const resolveDispute = async (req, res, next) => {
  try {
    const dispute = await disputeService.resolve(req.params.id, req.user.id, req.body);
    res.status(200).json(dispute);
  } catch (err) { next(err); }
};

const getAllDisputes = async (req, res, next) => {
  try {
    const disputes = await disputeService.getAll(req.query);
    res.status(200).json(disputes);
  } catch (err) { next(err); }
};

module.exports = { raiseDispute, getDispute, getMyDisputes, addMessage, addEvidence, resolveDispute, getAllDisputes };
