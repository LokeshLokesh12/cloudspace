const mongoose = require('mongoose');
const { ACTIVITY_TYPES } = require('../config/constants');

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, enum: Object.values(ACTIVITY_TYPES), required: true },
    resourceType: { type: String, enum: ['file', 'folder', 'user'], default: null },
    resourceId: { type: mongoose.Schema.Types.ObjectId, default: null },
    resourceName: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: null },
  },
  { timestamps: true }
);

activityLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
