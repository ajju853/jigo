const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Route imports
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const matchingRoutes = require('./routes/matchingRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const disputeRoutes = require('./routes/disputeRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const feeRoutes = require('./routes/feeRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const onboardingRoutes = require('./routes/onboardingRoutes');
const searchRoutes = require('./routes/searchRoutes');
const legalRoutes = require('./routes/legalRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Global Middleware
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));

// Rate limiting to prevent API abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too Many Requests', message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api', limiter);

// Logging
app.use(morgan('dev'));

// Parse incoming request payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mounting API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/legal', legalRoutes);

// Root health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Fallback 404 Route handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found', message: 'The requested API route does not exist.' });
});

// Error handling middleware (must be registered last)
app.use(errorHandler);

module.exports = app;
