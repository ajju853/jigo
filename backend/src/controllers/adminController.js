const adminService = require('../services/adminService');

const getUsers = async (req, res, next) => {
  try {
    const users = await adminService.getUsers(req.query);
    res.status(200).json(users);
  } catch (err) { next(err); }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await adminService.getUserById(req.params.id);
    res.status(200).json(user);
  } catch (err) { next(err); }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await adminService.toggleUserStatus(req.params.id);
    res.status(200).json(user);
  } catch (err) { next(err); }
};

const toggleUserVerification = async (req, res, next) => {
  try {
    const user = await adminService.toggleUserVerification(req.params.id);
    res.status(200).json(user);
  } catch (err) { next(err); }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await adminService.updateUserRole(req.params.id, role);
    res.status(200).json(user);
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getStats();
    res.status(200).json(stats);
  } catch (err) { next(err); }
};

const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await adminService.getAllBookings(req.query);
    res.status(200).json(bookings);
  } catch (err) { next(err); }
};

const deleteUser = async (req, res, next) => {
  try {
    const result = await adminService.deleteUser(req.params.id);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

module.exports = { getUsers, getUserById, toggleUserStatus, toggleUserVerification, updateUserRole, getStats, getAllBookings, deleteUser };
