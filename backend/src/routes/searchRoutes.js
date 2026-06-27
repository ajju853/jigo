const express = require('express');
const searchController = require('../controllers/searchController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const optionalAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        authenticate(req, res, (err) => {
            if (err) req.user = null;
            next();
        });
    } else {
        next();
    }
};

router.get('/profiles', optionalAuth, (req, res) => searchController.search(req, res));
router.get('/suggestions', optionalAuth, (req, res) => searchController.getSuggestions(req, res));

module.exports = router;
