const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// Rate Limiter for general public contact form (max 10 submissions per IP in 1 hour)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // Limit each IP to 10 submissions per window
  message: {
    status: 'error',
    message: 'Too many requests from this IP. Please try again after an hour.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Rate Limiter for secure admin login (max 5 login attempts per IP in 15 minutes)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message: {
    status: 'error',
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation rules for contact submission
const validateContactForm = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters')
    .escape(), // Escapes HTML tags to prevent XSS
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(), // Normalizes email, e.g., converts to lowercase
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 2000 }).withMessage('Message cannot exceed 2000 characters')
    .escape() // Escapes HTML tags to prevent XSS
];

// Middleware to capture and process validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    return res.status(400).json({
      status: 'error',
      errors: formattedErrors
    });
  }
  next();
};

module.exports = {
  contactLimiter,
  loginLimiter,
  validateContactForm,
  handleValidationErrors
};
