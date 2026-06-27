const express = require('express');
const profileController = require('../controllers/profileController');
const { updateProfileSchema } = require('../validators/profileValidator');
const validate = require('../middleware/validation');
const { authenticate, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', profileController.browse);
router.get('/:id', profileController.getProfile);
router.post('/:id/view', profileController.recordView);

// Protected routes
router.use(authenticate);

// Profile interactions
router.post('/:id/favorite', profileController.toggleFavorite);
router.get('/me/recently-viewed', profileController.getRecentlyViewed);

// Jigolo only routes
router.post('/', restrictTo('jigolo'), profileController.createProfile);
router.put('/:id', restrictTo('jigolo'), validate(updateProfileSchema), profileController.updateProfile);

// Media upload
router.post('/:id/images', restrictTo('jigolo'), upload.array('images', 5), (req, res) => {
  const files = req.files.map(f => `/uploads/${f.filename}`);
  res.status(200).json({ files });
});

module.exports = router;
