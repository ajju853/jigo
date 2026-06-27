const bookingService = require('../services/bookingService');

const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.create(req.user.id, req.body);
    res.status(201).json(booking);
  } catch (err) { next(err); }
};

const getBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getByUser(req.user.id, req.user.role, req.query);
    res.status(200).json(bookings);
  } catch (err) { next(err); }
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getById(req.params.id, req.user.id);
    res.status(200).json(booking);
  } catch (err) { next(err); }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;
    const booking = await bookingService.updateStatus(id, req.user.id, req.user.role, status, cancellationReason);
    res.status(200).json(booking);
  } catch (err) { next(err); }
};

module.exports = { createBooking, getBookings, getBookingById, updateBookingStatus };
