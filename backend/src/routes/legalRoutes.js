const express = require('express');
const legalController = require('../controllers/legalController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/:type', (req, res) => legalController.getDocument(req, res));
router.post('/accept', authenticate, (req, res) => legalController.acceptPolicy(req, res));

module.exports = router;
