const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

const hashPassword = async (plain) =>
  bcrypt.hash(plain, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);

const comparePassword = async (plain, hash) => bcrypt.compare(plain, hash);

// Generates a human-readable, hard-to-guess access code, e.g. "LB-HJ-REST-A7F2"
const generateAccessCode = (prefix) => {
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${random}`;
};

// Generates a temporary password the staff member must change on first login.
const generateTempPassword = () => crypto.randomBytes(6).toString('base64url');

module.exports = {
  signToken,
  verifyToken,
  hashPassword,
  comparePassword,
  generateAccessCode,
  generateTempPassword,
};
