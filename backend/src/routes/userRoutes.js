const express = require('express');
const { updateMe } = require('../controllers/userController');
const { updateUserSchema } = require('../validators/profileValidator');
const validate = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.put('/me', authenticate, validate(updateUserSchema), updateMe);

module.exports = router;
