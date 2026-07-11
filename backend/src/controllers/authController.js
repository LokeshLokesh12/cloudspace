const authService = require('../services/authService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const authController = {
  register: asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    setRefreshTokenCookie(res, result.refreshToken);
    res.status(201).json(new ApiResponse(201, {
      user: result.user, accessToken: result.accessToken,
    }, 'Registration successful. Please verify your email.'));
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body, req.ip);
    setRefreshTokenCookie(res, result.refreshToken);
    res.json(new ApiResponse(200, { user: result.user, accessToken: result.accessToken }, 'Login successful'));
  }),

  refreshToken: asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    const result = await authService.refreshAccessToken(token);
    setRefreshTokenCookie(res, result.refreshToken);
    res.json(new ApiResponse(200, { user: result.user, accessToken: result.accessToken }, 'Token refreshed'));
  }),

  logout: asyncHandler(async (req, res) => {
    await authService.logout(req.cookies.refreshToken || req.body.refreshToken);
    res.clearCookie('refreshToken');
    res.json(new ApiResponse(200, null, 'Logged out successfully'));
  }),

  logoutAll: asyncHandler(async (req, res) => {
    await authService.logoutAll(req.user._id);
    res.clearCookie('refreshToken');
    res.json(new ApiResponse(200, null, 'Logged out from all devices'));
  }),

  verifyEmail: asyncHandler(async (req, res) => {
    const user = await authService.verifyEmail(req.body.token);
    res.json(new ApiResponse(200, { user }, 'Email verified successfully'));
  }),

  resendVerification: asyncHandler(async (req, res) => {
    await authService.resendVerification(req.user._id);
    res.json(new ApiResponse(200, null, 'Verification email sent'));
  }),

  forgotPassword: asyncHandler(async (req, res) => {
    await authService.forgotPassword(req.body.email);
    res.json(new ApiResponse(200, null, 'If that email exists, a reset link has been sent'));
  }),

  resetPassword: asyncHandler(async (req, res) => {
    const user = await authService.resetPassword(req.body.token, req.body.password);
    res.json(new ApiResponse(200, { user }, 'Password reset successful'));
  }),

  changePassword: asyncHandler(async (req, res) => {
    const user = await authService.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword);
    res.json(new ApiResponse(200, { user }, 'Password changed successfully'));
  }),

  getProfile: asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user._id);
    res.json(new ApiResponse(200, { user }));
  }),
};

module.exports = authController;
