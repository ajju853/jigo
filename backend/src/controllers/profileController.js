const profileService = require('../services/profileService');

const getProfiles = async (req, res, next) => {
  try {
    const profiles = await profileService.getProfiles(req.query);
    res.status(200).json(profiles);
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.params.id);
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const updated = await profileService.updateProfile(req.params.id, req.user.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

const recordView = async (req, res, next) => {
  try {
    await profileService.incrementProfileViews(req.params.id, req.user?.id);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

const toggleFavorite = async (req, res, next) => {
  try {
    const result = await profileService.toggleFavorite(req.params.id, req.user.id);
    res.status(result.favorited ? 201 : 200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfiles, getProfile, updateProfile, recordView, toggleFavorite };
