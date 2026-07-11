const ActivityLog = require('../models/ActivityLog');

const activityLogRepository = {
  create: (data) => ActivityLog.create(data),
  findRecent: (userId, limit = 20) =>
    ActivityLog.find({ user: userId }).sort({ createdAt: -1 }).limit(limit),
};

module.exports = activityLogRepository;
