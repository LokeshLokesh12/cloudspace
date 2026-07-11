const userRepository = require('../repositories/userRepository');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
const emailVerificationRepository = require('../repositories/emailVerificationRepository');
const folderRepository = require('../repositories/folderRepository');
const activityLogService = require('./activityLogService');
const ApiError = require('../utils/ApiError');
const {
  generateAccessToken, generateRefreshToken, verifyRefreshToken,
  generateRandomToken, hashToken, getRefreshTokenExpiry,
} = require('../utils/tokenUtils');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailUtils');
const { STORAGE_PLANS } = require('../config/constants');

const authService = {
  register: async ({ name, email, password }) => {
    if (await userRepository.findByEmail(email)) throw new ApiError(409, 'Email already registered');

    const user = await userRepository.create({
      name, email, password, plan: 'FREE',
      storageLimit: STORAGE_PLANS.FREE.storageLimit, storageUsed: 0,
    });

    await folderRepository.create({ owner: user._id, name: 'Home', parentFolder: null });

    const verificationToken = generateRandomToken();
    await emailVerificationRepository.create({
      user: user._id, token: verificationToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await sendVerificationEmail(email, verificationToken);

    const tokens = await authService.generateTokens(user._id);
    return { user, ...tokens };
  },

  login: async ({ email, password }, ipAddress) => {
    const user = await userRepository.findByEmail(email, true);
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid email or password');
    }
    const tokens = await authService.generateTokens(user._id, ipAddress);
    await activityLogService.logLogin(user._id, ipAddress);
    return { user, ...tokens };
  },

  generateTokens: async (userId, ipAddress = null) => {
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    await refreshTokenRepository.create({
      user: userId, token: refreshToken,
      expiresAt: getRefreshTokenExpiry(), createdByIp: ipAddress,
    });
    return { accessToken, refreshToken };
  },

  refreshAccessToken: async (refreshToken) => {
    if (!refreshToken) throw new ApiError(401, 'Refresh token required');
    let decoded;
    try { decoded = verifyRefreshToken(refreshToken); } catch {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }
    const stored = await refreshTokenRepository.findByToken(refreshToken);
    if (!stored) throw new ApiError(401, 'Refresh token revoked or not found');

    const user = await userRepository.findById(decoded.sub);
    if (!user) throw new ApiError(401, 'User not found');

    await refreshTokenRepository.revoke(refreshToken);
    const accessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    await refreshTokenRepository.create({
      user: user._id, token: newRefreshToken, expiresAt: getRefreshTokenExpiry(),
    });
    return { accessToken, refreshToken: newRefreshToken, user };
  },

  logout: async (refreshToken) => {
    if (refreshToken) await refreshTokenRepository.revoke(refreshToken);
  },

  logoutAll: async (userId) => refreshTokenRepository.revokeAllForUser(userId),

  verifyEmail: async (token) => {
    const record = await emailVerificationRepository.findByToken(token);
    if (!record) throw new ApiError(400, 'Invalid or expired verification token');
    const user = await userRepository.updateById(record.user, { emailVerified: true });
    await emailVerificationRepository.deleteByUser(record.user);
    return user;
  },

  resendVerification: async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    if (user.emailVerified) throw new ApiError(400, 'Email already verified');
    await emailVerificationRepository.deleteByUser(userId);
    const verificationToken = generateRandomToken();
    await emailVerificationRepository.create({
      user: userId, token: verificationToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await sendVerificationEmail(user.email, verificationToken);
  },

  forgotPassword: async (email) => {
    const user = await userRepository.findByEmail(email);
    if (!user) return;
    const resetToken = generateRandomToken();
    await userRepository.setPasswordReset(user._id, hashToken(resetToken), new Date(Date.now() + 60 * 60 * 1000));
    await sendPasswordResetEmail(email, resetToken);
  },

  resetPassword: async (token, newPassword) => {
    const user = await userRepository.findByResetToken(hashToken(token));
    if (!user) throw new ApiError(400, 'Invalid or expired reset token');
    user.password = newPassword;
    await user.save();
    await userRepository.clearPasswordReset(user._id);
    await refreshTokenRepository.revokeAllForUser(user._id);
    return user;
  },

  changePassword: async (userId, currentPassword, newPassword) => {
    const profile = await userRepository.findById(userId);
    const user = await userRepository.findByEmail(profile.email, true);
    if (!(await user.comparePassword(currentPassword))) {
      throw new ApiError(400, 'Current password is incorrect');
    }
    user.password = newPassword;
    await user.save();
    await refreshTokenRepository.revokeAllForUser(userId);
    return user;
  },

  getProfile: async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    return user;
  },
};

module.exports = authService;
