const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');

const generateAccessToken = (userId) =>
  jwt.sign({ sub: userId }, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiresIn });

const generateRefreshToken = (userId) =>
  jwt.sign({ sub: userId }, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn });

const verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret);
const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);

const generateRandomToken = () => crypto.randomBytes(32).toString('hex');
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const getRefreshTokenExpiry = () => {
  const match = env.jwt.refreshExpiresIn.match(/^(\d+)([dhms])$/);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const [, amount, unit] = match;
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return new Date(Date.now() + parseInt(amount, 10) * multipliers[unit]);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateRandomToken,
  hashToken,
  getRefreshTokenExpiry,
};
