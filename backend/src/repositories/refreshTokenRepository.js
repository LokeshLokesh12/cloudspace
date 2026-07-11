const RefreshToken = require('../models/RefreshToken');

const refreshTokenRepository = {
  create: (data) => RefreshToken.create(data),
  findByToken: (token) => RefreshToken.findOne({ token, revokedAt: null }),
  revoke: (token, replacedByToken = null) =>
    RefreshToken.findOneAndUpdate({ token }, { revokedAt: new Date(), replacedByToken }),
  revokeAllForUser: (userId) =>
    RefreshToken.updateMany({ user: userId, revokedAt: null }, { revokedAt: new Date() }),
};

module.exports = refreshTokenRepository;
