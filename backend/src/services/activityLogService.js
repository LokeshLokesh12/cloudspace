const activityLogRepository = require('../repositories/activityLogRepository');
const { ACTIVITY_TYPES } = require('../config/constants');

const activityLogService = {
  log: (userId, action, options = {}) => {
    const { resourceType, resourceId, resourceName, metadata, ipAddress } = options;
    return activityLogRepository.create({
      user: userId,
      action,
      resourceType: resourceType || null,
      resourceId: resourceId || null,
      resourceName: resourceName || null,
      metadata: metadata || {},
      ipAddress: ipAddress || null,
    });
  },
  logLogin: (userId, ipAddress) =>
    activityLogService.log(userId, ACTIVITY_TYPES.LOGIN, { resourceType: 'user', resourceId: userId, ipAddress }),
  logUpload: (userId, file) =>
    activityLogService.log(userId, ACTIVITY_TYPES.UPLOAD, {
      resourceType: 'file', resourceId: file._id, resourceName: file.originalName,
      metadata: { size: file.size, mimeType: file.mimeType },
    }),
  logDownload: (userId, file) =>
    activityLogService.log(userId, ACTIVITY_TYPES.DOWNLOAD, {
      resourceType: 'file', resourceId: file._id, resourceName: file.originalName,
    }),
  logDelete: (userId, resourceType, resource) =>
    activityLogService.log(userId, ACTIVITY_TYPES.DELETE, {
      resourceType, resourceId: resource._id, resourceName: resource.name || resource.originalName,
    }),
  logRestore: (userId, resourceType, resource) =>
    activityLogService.log(userId, ACTIVITY_TYPES.RESTORE, {
      resourceType, resourceId: resource._id, resourceName: resource.name || resource.originalName,
    }),
  logRename: (userId, resourceType, resource, oldName) =>
    activityLogService.log(userId, ACTIVITY_TYPES.RENAME, {
      resourceType, resourceId: resource._id, resourceName: resource.name || resource.originalName,
      metadata: { oldName },
    }),
  logMove: (userId, resourceType, resource, fromFolderId, toFolderId) =>
    activityLogService.log(userId, ACTIVITY_TYPES.MOVE, {
      resourceType, resourceId: resource._id, resourceName: resource.name || resource.originalName,
      metadata: { fromFolderId, toFolderId },
    }),
  getRecent: (userId, limit) => activityLogRepository.findRecent(userId, limit),
};

module.exports = activityLogService;
