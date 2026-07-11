const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { ALLOWED_MIME_TYPES } = require('../config/constants');
const ApiError = require('./ApiError');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

const ensureUploadsDir = () => {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
};

const getExtension = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return ext.startsWith('.') ? ext.slice(1) : ext;
};

const generateStoredName = (originalName) => {
  const ext = getExtension(originalName);
  const uuid = uuidv4().replace(/-/g, '').slice(0, 8);
  return ext ? `${uuid}.${ext}` : uuid;
};

const getFilePath = (storedName) => path.join(UPLOADS_DIR, storedName);

const validateMimeType = (mimeType) => {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new ApiError(400, `File type not allowed: ${mimeType}`);
  }
};

const deletePhysicalFile = async (storedName) => {
  const filePath = getFilePath(storedName);
  if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
};

const copyPhysicalFile = async (storedName, newStoredName) => {
  const source = getFilePath(storedName);
  const dest = getFilePath(newStoredName);
  if (!fs.existsSync(source)) throw new ApiError(404, 'Source file not found on server');
  await fs.promises.copyFile(source, dest);
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

module.exports = {
  UPLOADS_DIR,
  ensureUploadsDir,
  getExtension,
  generateStoredName,
  getFilePath,
  validateMimeType,
  deletePhysicalFile,
  copyPhysicalFile,
  formatBytes,
};
