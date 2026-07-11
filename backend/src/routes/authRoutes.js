const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerValidator, loginValidator, forgotPasswordValidator,
  resetPasswordValidator, changePasswordValidator, verifyEmailValidator,
} = require('../validators/authValidators');

const router = express.Router();

router.post('/register', authLimiter, registerValidator, validate, authController.register);
router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/verify-email', verifyEmailValidator, validate, authController.verifyEmail);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidator, validate, authController.resetPassword);

router.use(authenticate);
router.get('/profile', authController.getProfile);
router.post('/logout-all', authController.logoutAll);
router.post('/resend-verification', authController.resendVerification);
router.post('/change-password', changePasswordValidator, validate, authController.changePassword);

module.exports = router;
