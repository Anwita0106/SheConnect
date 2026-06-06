const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const verifyAdminToken = require('../middleware/authMiddleware');
const { 
  contactLimiter, 
  validateContactForm, 
  handleValidationErrors 
} = require('../middleware/security');

// Public route to submit contact form
router.post('/', contactLimiter, validateContactForm, handleValidationErrors, contactController.createSubmission);

// Protected routes (Admin only)
router.get('/', verifyAdminToken, contactController.getSubmissions);
router.delete('/:id', verifyAdminToken, contactController.deleteSubmission);

module.exports = router;
