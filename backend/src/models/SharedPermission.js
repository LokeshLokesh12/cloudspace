const mongoose = require('mongoose');
const { PERMISSIONS } = require('../config/constants');

const sharedPermissionSchema = new mongoose.Schema(
  {
    resourceType: { type: String, enum: ['file', 'folder'], required: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'resourceType' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sharedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    permission: { type: String, enum: Object.values(PERMISSIONS), default: PERMISSIONS.VIEW_ONLY },
    shareToken: { type: String, default: null, sparse: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

sharedPermissionSchema.index({ resourceType: 1, resourceId: 1 });
sharedPermissionSchema.index({ sharedWith: 1 });

module.exports = mongoose.model('SharedPermission', sharedPermissionSchema);
