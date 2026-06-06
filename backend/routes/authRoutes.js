const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyAdminToken = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/security');

// Route for admin login
router.post('/login', loginLimiter, authController.login);

// Route to verify active token
router.get('/verify', verifyAdminToken, authController.verifySession);

module.exports = router;
