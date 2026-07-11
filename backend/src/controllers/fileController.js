const fileService = require('../services/fileService');
const activityLogService = require('../services/activityLogService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const emit = (req, event, data) => {
  const io = req.app.get('io');
  if (io) io.to(`user:${req.user._id}`).emit(event, data);
};

const fileController = {
  upload: asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'No file provided');
    const fileDoc = await fileService.upload(req.user._id, req.file, req.query.folderId || null);
    emit(req, 'file:uploaded', { file: fileDoc });
    res.status(201).json(new ApiResponse(201, { file: fileDoc }, 'File uploaded'));
  }),

  uploadMultiple: asyncHandler(async (req, res) => {
    if (!req.files?.length) throw new ApiError(400, 'No files provided');
    const files = await fileService.uploadMultiple(req.user._id, req.files, req.query.folderId || null);
    emit(req, 'files:uploaded', { files });
    res.status(201).json(new ApiResponse(201, { files, count: files.length }, 'Files uploaded'));
  }),

  list: asyncHandler(async (req, res) => {
    const folderId = req.query.folderId === 'null' || !req.query.folderId ? null : req.query.folderId;
    const files = await fileService.getFiles(req.user._id, folderId);
    res.json(new ApiResponse(200, { files }));
  }),

  getOne: asyncHandler(async (req, res) => {
    const file = await fileService.getFile(req.user._id, req.params.id);
    res.json(new ApiResponse(200, { file }));
  }),

  download: asyncHandler(async (req, res) => {
    const { file, filePath } = await fileService.download(req.user._id, req.params.id);
    res.download(filePath, file.originalName);
  }),

  preview: asyncHandler(async (req, res) => {
    const file = await fileService.getFile(req.user._id, req.params.id);
    const { filePath } = await fileService.download(req.user._id, req.params.id);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
    res.sendFile(filePath);
  }),

  rename: asyncHandler(async (req, res) => {
    const file = await fileService.rename(req.user._id, req.params.id, req.body.originalName);
    emit(req, 'file:renamed', { file });
    res.json(new ApiResponse(200, { file }, 'File renamed'));
  }),

  move: asyncHandler(async (req, res) => {
    const file = await fileService.move(req.user._id, req.params.id, req.body.targetFolderId);
    emit(req, 'file:moved', { file });
    res.json(new ApiResponse(200, { file }, 'File moved'));
  }),

  copy: asyncHandler(async (req, res) => {
    const file = await fileService.copy(req.user._id, req.params.id, req.body.targetFolderId);
    emit(req, 'file:copied', { file });
    res.status(201).json(new ApiResponse(201, { file }, 'File copied'));
  }),

  delete: asyncHandler(async (req, res) => {
    const file = await fileService.softDelete(req.user._id, req.params.id);
    emit(req, 'file:deleted', { fileId: req.params.id });
    res.json(new ApiResponse(200, { file }, 'File moved to trash'));
  }),

  getRecent: asyncHandler(async (req, res) => {
    const files = await fileService.getRecentFiles(req.user._id);
    res.json(new ApiResponse(200, { files }));
  }),

  getStorageInfo: asyncHandler(async (req, res) => {
    const storage = await fileService.getStorageInfo(req.user._id);
    res.json(new ApiResponse(200, { storage }));
  }),

  getDashboard: asyncHandler(async (req, res) => {
    const [storage, recentFiles, recentActivity] = await Promise.all([
      fileService.getStorageInfo(req.user._id),
      fileService.getRecentFiles(req.user._id, 5),
      activityLogService.getRecent(req.user._id, 10),
    ]);
    res.json(new ApiResponse(200, { storage, recentFiles, recentActivity }));
  }),
};

module.exports = fileController;
