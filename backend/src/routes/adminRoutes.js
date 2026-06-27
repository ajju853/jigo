const express = require('express');
const { getUsers, getUserById, toggleUserStatus, toggleUserVerification, updateUserRole, getStats, getAllBookings, deleteUser } = require('../controllers/adminController');
const { authenticate, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, restrictTo('admin'));

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.put('/users/:id/toggle-verification', toggleUserVerification);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/bookings', getAllBookings);
router.get('/stats', getStats);

module.exports = router;
