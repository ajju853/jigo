const express = require('express');
const { raiseDispute, getDispute, getMyDisputes, addMessage, addEvidence, resolveDispute, getAllDisputes } = require('../controllers/disputeController');
const { authenticate, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', authenticate, getMyDisputes);
router.post('/', authenticate, raiseDispute);
router.get('/all', authenticate, restrictTo('admin'), getAllDisputes);
router.get('/:id', authenticate, getDispute);
router.post('/:id/messages', authenticate, addMessage);
router.post('/:id/evidence', authenticate, upload.single('evidence'), addEvidence);
router.put('/:id/resolve', authenticate, restrictTo('admin'), resolveDispute);

module.exports = router;
