const MB = 1024 * 1024;

const STORAGE_PLANS = {
  FREE: { name: 'FREE', storageLimit: 100 * MB },
  BASIC: { name: 'BASIC', storageLimit: 5 * 1024 * MB },
  PRO: { name: 'PRO', storageLimit: 50 * 1024 * MB },
  ENTERPRISE: { name: 'ENTERPRISE', storageLimit: 500 * 1024 * MB },
};

const VISIBILITY = {
  PRIVATE: 'private',
  SPECIFIC_USERS: 'specific_users',
  ANYONE_WITH_LINK: 'anyone_with_link',
};

const PERMISSIONS = {
  VIEW_ONLY: 'view_only',
  DOWNLOAD_ONLY: 'download_only',
  EDIT_DOWNLOAD: 'edit_download',
  EDIT_DOWNLOAD_DELETE: 'edit_download_delete',
};

const ACTIVITY_TYPES = {
  LOGIN: 'login',
  UPLOAD: 'upload',
  DOWNLOAD: 'download',
  DELETE: 'delete',
  RESTORE: 'restore',
  SHARE: 'share',
  RENAME: 'rename',
  MOVE: 'move',
};

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'video/mp4', 'video/webm', 'video/quicktime',
  'audio/mpeg', 'audio/wav', 'audio/ogg',
  'text/plain', 'text/csv', 'application/json',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip', 'application/x-zip-compressed',
];

module.exports = {
  MB,
  STORAGE_PLANS,
  VISIBILITY,
  PERMISSIONS,
  ACTIVITY_TYPES,
  ALLOWED_MIME_TYPES,
};
