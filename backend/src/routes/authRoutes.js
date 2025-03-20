const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    login,
    getProfile,
    updateProfile,
    apply
} = require('../controllers/authController');

// Public routes
router.post('/login', login);
router.post('/apply', apply);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;