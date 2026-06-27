const reviewService = require('../services/reviewService');

const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.create(req.user.id, req.body);
    res.status(201).json(review);
  } catch (err) { next(err); }
};

const getReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getByProfile(req.params.profileId, req.query);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

const updateReview = async (req, res, next) => {
  try {
    const review = await reviewService.update(req.params.id, req.user.id, req.body);
    res.status(200).json(review);
  } catch (err) { next(err); }
};

const deleteReview = async (req, res, next) => {
  try {
    const result = await reviewService.delete(req.params.id, req.user.id);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

const replyToReview = async (req, res, next) => {
  try {
    const review = await reviewService.jigoloReply(req.params.id, req.user.id, req.body.reply);
    res.status(200).json(review);
  } catch (err) { next(err); }
};

const markHelpful = async (req, res, next) => {
  try {
    const result = await reviewService.toggleHelpful(req.params.id, req.user.id);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

module.exports = { createReview, getReviews, updateReview, deleteReview, replyToReview, markHelpful };
