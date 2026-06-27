const express = require('express');
const { createBooking, getBookings, getBookingById, updateBookingStatus } = require('../controllers/bookingController');
const { createBookingSchema, updateBookingStatusSchema } = require('../validators/bookingValidator');
const validate = require('../middleware/validation');
const { authenticate, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, restrictTo('customer'), validate(createBookingSchema), createBooking);
router.get('/', authenticate, getBookings);
router.get('/:id', authenticate, getBookingById);
router.put('/:id', authenticate, validate(updateBookingStatusSchema), updateBookingStatus);

module.exports = router;
