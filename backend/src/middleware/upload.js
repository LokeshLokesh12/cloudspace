const multer = require('multer');
const path = require('path');
const env = require('../config/env');
const { UPLOADS_DIR, ensureUploadsDir, generateStoredName } = require('../utils/fileUtils');
const ApiError = require('../utils/ApiError');

ensureUploadsDir();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => cb(null, generateStoredName(file.originalname)),
});

const fileFilter = (_req, file, cb) => {
  const allowed = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
    '.pdf', '.mp4', '.webm', '.mov', '.mp3', '.wav', '.ogg',
    '.txt', '.csv', '.json', '.doc', '.docx', '.xls', '.xlsx', '.zip',
  ];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) return cb(new ApiError(400, `File extension not allowed: ${ext}`), false);
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.maxFileSizeMb * 1024 * 1024 },
});

const handleMulterError = (err, _req, _res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(413, `File too large. Max ${env.maxFileSizeMb}MB per file`));
    }
    return next(new ApiError(400, err.message));
  }
  next(err);
};

module.exports = { upload, handleMulterError };
