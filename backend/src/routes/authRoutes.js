const express = require('express');
const { register, login, getMe, refreshToken, logout, forgotPassword, resetPassword } = require('../controllers/authController');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const validate = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, getMe);
router.post('/refresh-token', refreshToken);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
