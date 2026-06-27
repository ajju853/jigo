const express = require('express');
const { createReview, getReviews, updateReview, deleteReview, replyToReview, markHelpful } = require('../controllers/reviewController');
const { authenticate, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, restrictTo('customer'), createReview);
router.get('/:profileId', getReviews);
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);
router.post('/:id/reply', authenticate, restrictTo('jigolo'), replyToReview);
router.post('/:id/helpful', authenticate, markHelpful);

module.exports = router;
