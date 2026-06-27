const express = require('express');
const { getProfiles, getProfile, updateProfile, recordView, toggleFavorite } = require('../controllers/profileController');
const { updateProfileSchema } = require('../validators/profileValidator');
const validate = require('../middleware/validation');
const { authenticate, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getProfiles);
router.get('/:id', getProfile);
router.put('/:id', authenticate, restrictTo('jigolo'), validate(updateProfileSchema), updateProfile);
router.post('/:id/view', recordView);
router.post('/:id/favorite', authenticate, toggleFavorite);
router.post('/:id/images', authenticate, restrictTo('jigolo'), upload.array('images', 5), (req, res) => {
  const files = req.files.map(f => `/uploads/${f.filename}`);
  res.status(200).json({ files });
});

module.exports = router;
