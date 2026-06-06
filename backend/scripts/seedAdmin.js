const bcrypt = require('bcryptjs');
const { sequelize, Admin } = require('../models');
require('dotenv').config();

const DEFAULT_ADMIN_USER = process.env.DEFAULT_ADMIN_USER || 'admin';
const DEFAULT_ADMIN_PASS = process.env.DEFAULT_ADMIN_PASS || 'admin123';

const seedAdmin = async () => {
  try {
    console.log('Synchronizing database models...');
    // Sync database (creates tables if they don't exist)
    await sequelize.sync();
    console.log('Database synced successfully.');

    // Check if admin user already exists
    const existingAdmin = await Admin.findOne({ 
      where: { username: DEFAULT_ADMIN_USER.toLowerCase().trim() } 
    });

    if (existingAdmin) {
      console.log(`Admin user "${DEFAULT_ADMIN_USER}" already exists. Seeding skipped.`);
      return;
    }

    console.log(`Creating default admin user: "${DEFAULT_ADMIN_USER}"...`);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASS, salt);

    await Admin.create({
      username: DEFAULT_ADMIN_USER.toLowerCase().trim(),
      passwordHash
    });

    console.log('----------------------------------------------------');
    console.log('Seed completed successfully!');
    console.log(`Username: ${DEFAULT_ADMIN_USER}`);
    console.log(`Password: ${DEFAULT_ADMIN_PASS}`);
    console.log('IMPORTANT: Please change this default password in production!');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('Seeding database failed:', error);
  } finally {
    await sequelize.close();
  }
};

seedAdmin();
