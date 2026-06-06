const sequelize = require('../config/database');
const Submission = require('./submission');
const Admin = require('./admin');

// Export db object containing models and helper function to sync the DB
const db = {
  sequelize,
  Submission,
  Admin
};

module.exports = db;
