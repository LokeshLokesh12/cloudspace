const User = require('../models/User');

const userRepository = {
  create: (data) => User.create(data),
  findByEmail: (email, includePassword = false) => {
    const query = User.findOne({ email });
    if (includePassword) query.select('+password');
    return query;
  },
  findById: (id) => User.findById(id),
  updateById: (id, data) => User.findByIdAndUpdate(id, data, { new: true, runValidators: true }),
  updateStorageUsed: (userId, delta) =>
    User.findByIdAndUpdate(userId, { $inc: { storageUsed: delta } }, { new: true }),
  setPasswordReset: (id, token, expires) =>
    User.findByIdAndUpdate(id, { passwordResetToken: token, passwordResetExpires: expires }),
  clearPasswordReset: (id) =>
    User.findByIdAndUpdate(id, { passwordResetToken: null, passwordResetExpires: null }),
  findByResetToken: (hashedToken) =>
    User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } }).select('+password'),
};

module.exports = userRepository;
