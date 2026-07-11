const trashService = require('../services/trashService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const emit = (req, event, data) => {
  const io = req.app.get('io');
  if (io) io.to(`user:${req.user._id}`).emit(event, data);
};

const trashController = {
  list: asyncHandler(async (req, res) => {
    const trash = await trashService.list(req.user._id);
    res.json(new ApiResponse(200, trash));
  }),

  restoreFile: asyncHandler(async (req, res) => {
    const file = await trashService.restoreFile(req.user._id, req.params.id);
    emit(req, 'file:restored', { file });
    res.json(new ApiResponse(200, { file }, 'File restored'));
  }),

  restoreFolder: asyncHandler(async (req, res) => {
    const folder = await trashService.restoreFolder(req.user._id, req.params.id);
    emit(req, 'folder:restored', { folder });
    res.json(new ApiResponse(200, { folder }, 'Folder restored'));
  }),

  permanentDeleteFile: asyncHandler(async (req, res) => {
    const file = await trashService.permanentDeleteFile(req.user._id, req.params.id);
    emit(req, 'file:permanently-deleted', { fileId: req.params.id });
    res.json(new ApiResponse(200, { file }, 'File permanently deleted'));
  }),

  permanentDeleteFolder: asyncHandler(async (req, res) => {
    const result = await trashService.permanentDeleteFolder(req.user._id, req.params.id);
    emit(req, 'folder:permanently-deleted', { folderId: req.params.id });
    res.json(new ApiResponse(200, result, 'Folder permanently deleted'));
  }),

  emptyTrash: asyncHandler(async (req, res) => {
    const result = await trashService.emptyTrash(req.user._id);
    emit(req, 'trash:emptied', result);
    res.json(new ApiResponse(200, result, 'Trash emptied'));
  }),
};

module.exports = trashController;
