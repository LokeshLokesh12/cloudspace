const EmailVerification = require('../models/EmailVerification');

const emailVerificationRepository = {
  create: (data) => EmailVerification.create(data),
  findByToken: (token) => EmailVerification.findOne({ token, expiresAt: { $gt: Date.now() } }),
  deleteByUser: (userId) => EmailVerification.deleteMany({ user: userId }),
};

module.exports = emailVerificationRepository;
