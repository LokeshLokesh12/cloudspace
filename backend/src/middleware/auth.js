const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userRepository = require('../repositories/userRepository');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) throw new ApiError(401, 'Access token required');

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.jwt.accessSecret);
    const user = await userRepository.findById(decoded.sub);
    if (!user) throw new ApiError(401, 'User not found');
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Invalid or expired access token');
  }
});

module.exports = { authenticate };
