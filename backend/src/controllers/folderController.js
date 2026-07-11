const folderService = require('../services/folderService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const emit = (req, event, data) => {
  const io = req.app.get('io');
  if (io) io.to(`user:${req.user._id}`).emit(event, data);
};

const folderController = {
  getContents: asyncHandler(async (req, res) => {
    const folderId = req.query.folderId === 'null' || !req.query.folderId ? null : req.query.folderId;
    const contents = await folderService.getContents(req.user._id, folderId);
    res.json(new ApiResponse(200, contents));
  }),

  getBreadcrumb: asyncHandler(async (req, res) => {
    const folderId = req.query.folderId === 'null' || !req.query.folderId ? null : req.query.folderId;
    const breadcrumb = await folderService.getBreadcrumb(req.user._id, folderId);
    res.json(new ApiResponse(200, { breadcrumb }));
  }),

  getTree: asyncHandler(async (req, res) => {
    const tree = await folderService.getTree(req.user._id);
    res.json(new ApiResponse(200, { tree }));
  }),

  getOne: asyncHandler(async (req, res) => {
    const folder = await folderService.getFolder(req.user._id, req.params.id);
    res.json(new ApiResponse(200, { folder }));
  }),

  create: asyncHandler(async (req, res) => {
    const folder = await folderService.create(req.user._id, req.body.name, req.body.parentFolderId || null);
    emit(req, 'folder:created', { folder });
    res.status(201).json(new ApiResponse(201, { folder }, 'Folder created'));
  }),

  rename: asyncHandler(async (req, res) => {
    const folder = await folderService.rename(req.user._id, req.params.id, req.body.name);
    emit(req, 'folder:renamed', { folder });
    res.json(new ApiResponse(200, { folder }, 'Folder renamed'));
  }),

  move: asyncHandler(async (req, res) => {
    const folder = await folderService.move(req.user._id, req.params.id, req.body.targetFolderId);
    emit(req, 'folder:moved', { folder });
    res.json(new ApiResponse(200, { folder }, 'Folder moved'));
  }),

  delete: asyncHandler(async (req, res) => {
    const result = await folderService.softDelete(req.user._id, req.params.id);
    emit(req, 'folder:deleted', { folderId: req.params.id });
    res.json(new ApiResponse(200, result, 'Folder moved to trash'));
  }),
};

module.exports = folderController;
