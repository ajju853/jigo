const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ message: 'Registration successful', ...result });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json({ message: 'Login successful', ...result });
  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    const result = await authService.getMe(req.user.id);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

const refreshToken = async (req, res, next) => {
  try {
    const result = await authService.refreshToken(req.body.refreshToken);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    const result = await authService.logout(req.token);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const result = await authService.resetPassword(token, password);
    res.status(200).json(result);
  } catch (err) { next(err); }
};

module.exports = { register, login, getMe, refreshToken, logout, forgotPassword, resetPassword };
