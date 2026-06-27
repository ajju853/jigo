const express = require('express');
const onboardingController = require('../controllers/onboardingController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/status', (req, res) => onboardingController.getStatus(req, res));
router.post('/step', (req, res) => onboardingController.completeStep(req, res));
router.post('/complete', (req, res) => onboardingController.completeOnboarding(req, res));

module.exports = router;
