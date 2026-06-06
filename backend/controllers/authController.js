const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin } = require('../models');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'she_can_foundation_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// POST /api/auth/login - Admin Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Username and password are required'
      });
    }

    // Find admin by username
    const admin = await Admin.findOne({ where: { username: username.toLowerCase().trim() } });
    if (!admin) {
      // Return a generic error message for security reasons
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error. Failed to authenticate.'
    });
  }
};

// GET /api/auth/verify - Verify active session token
exports.verifySession = async (req, res) => {
  try {
    // req.admin is already set by verifyAdminToken middleware
    return res.status(200).json({
      status: 'success',
      message: 'Session is active',
      admin: req.admin
    });
  } catch (error) {
    console.error('Error during session verification:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};
