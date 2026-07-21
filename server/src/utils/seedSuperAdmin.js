require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { SuperAdmin } = require('../models/AdminModels');
const { hashPassword, generateAccessCode } = require('./authUtils');

// Run once: `npm run seed:superadmin`
// Safe to re-run — it will not create a second Super Admin if one already exists.
const run = async () => {
  await connectDB();

  const existing = await SuperAdmin.findOne();
  if (existing) {
    console.log('A Super Admin already exists:', existing.email);
    console.log('Refusing to create a second one. Use the change-password flow to update it.');
    await mongoose.disconnect();
    return;
  }

  const email = process.env.SUPER_ADMIN_EMAIL;
  const tempPassword = process.env.SUPER_ADMIN_TEMP_PASSWORD;
  if (!email || !tempPassword) {
    console.error('Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_TEMP_PASSWORD in .env before seeding.');
    process.exit(1);
  }

  const superAdmin = await SuperAdmin.create({
    name: 'Super Admin',
    email,
    accessCode: generateAccessCode('SA'),
    passwordHash: await hashPassword(tempPassword),
    mustChangePassword: true,
  });

  console.log('Super Admin created.');
  console.log('Access code:', superAdmin.accessCode);
  console.log('Temporary password:', tempPassword);
  console.log('You must log in and change this password immediately.');

  await mongoose.disconnect();
};

run();
