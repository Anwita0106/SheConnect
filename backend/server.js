const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { sequelize } = require('./models');
const contactRoutes = require('./routes/contactRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet()); // Sets various HTTP headers for security

// CORS Configuration
/*const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',') 
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'https://she-connect-eight.vercel.app'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or local testing)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); */

app.use(cors({
  origin: true,
  credentials: true
}));

// Body parser
app.use(express.json());

// Main Routes
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Global 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    status: 'error',
    message: err.message || 'An unexpected server error occurred'
  });
});

// Database Synchronization & Server Startup
const startServer = async () => {
  try {
    console.log('Validating database connection...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync models with DB (creates tables if they don't exist)
    await sequelize.sync();
    console.log('Database schemas synced.');

    app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`She Can Foundation API server running on port: ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Local Healthcheck: http://localhost:${PORT}/health`);
      console.log('====================================================');
    });
  } catch (error) {
    console.error('CRITICAL ERROR: Unable to start the backend server:', error);
    process.exit(1);
  }
};

startServer();
