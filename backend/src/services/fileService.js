const fs = require('fs');
const fileRepository = require('../repositories/fileRepository');
const folderRepository = require('../repositories/folderRepository');
const userRepository = require('../repositories/userRepository');
const folderService = require('./folderService');
const activityLogService = require('./activityLogService');
const ApiError = require('../utils/ApiError');
const {
  getFilePath, validateMimeType, deletePhysicalFile, copyPhysicalFile,
  generateStoredName, getExtension,
} = require('../utils/fileUtils');

const fileService = {
  validateStorage: async (userId, fileSize) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    if (user.storageUsed + fileSize > user.storageLimit) {
      throw new ApiError(413, `Storage limit exceeded. Used: ${user.storageUsed}, Limit: ${user.storageLimit}`);
    }
    return user;
  },

  upload: async (userId, file, folderId = null) => {
    validateMimeType(file.mimetype);
    await fileService.validateStorage(userId, file.size);
    const resolvedFolderId = await folderService.resolveFolderId(userId, folderId);
    await folderService.validateFolder(userId, resolvedFolderId);

    const fileDoc = await fileRepository.create({
      owner: userId,
      folderId: resolvedFolderId,
      originalName: file.originalname,
      storedName: file.filename,
      mimeType: file.mimetype,
      extension: getExtension(file.originalname),
      size: file.size,
    });
    await userRepository.updateStorageUsed(userId, file.size);
    await activityLogService.logUpload(userId, fileDoc);
    return fileDoc;
  },

  uploadMultiple: async (userId, files, folderId = null) => {
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    await fileService.validateStorage(userId, totalSize);
    const resolvedFolderId = await folderService.resolveFolderId(userId, folderId);
    await folderService.validateFolder(userId, resolvedFolderId);

    const uploaded = [];
    for (const file of files) {
      validateMimeType(file.mimetype);
      const fileDoc = await fileRepository.create({
        owner: userId,
        folderId: resolvedFolderId,
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        extension: getExtension(file.originalname),
        size: file.size,
      });
      await activityLogService.logUpload(userId, fileDoc);
      uploaded.push(fileDoc);
    }
    await userRepository.updateStorageUsed(userId, totalSize);
    return uploaded;
  },

  getFiles: async (userId, folderId = null) => {
    const resolvedId = await folderService.resolveFolderId(userId, folderId);
    return fileRepository.findByOwner(userId, resolvedId, false);
  },

  getFile: async (userId, fileId, includeDeleted = false) => {
    const file = await fileRepository.findById(fileId);
    if (!file || file.owner.toString() !== userId.toString()) throw new ApiError(404, 'File not found');
    if (!includeDeleted && file.deleted) throw new ApiError(404, 'File not found');
    return file;
  },

  download: async (userId, fileId) => {
    const file = await fileService.getFile(userId, fileId);
    const filePath = getFilePath(file.storedName);
    if (!fs.existsSync(filePath)) throw new ApiError(404, 'Physical file not found on server');
    await activityLogService.logDownload(userId, file);
    return { file, filePath };
  },

  rename: async (userId, fileId, originalName) => {
    const file = await fileService.getFile(userId, fileId);
    const oldName = file.originalName;
    if (await fileRepository.countByName(userId, originalName, file.folderId, fileId)) {
      throw new ApiError(409, 'A file with this name already exists');
    }
    const updated = await fileRepository.updateById(fileId, { originalName });
    await activityLogService.logRename(userId, 'file', updated, oldName);
    return updated;
  },

  move: async (userId, fileId, targetFolderId) => {
    const file = await fileService.getFile(userId, fileId);
    const targetId = await folderService.resolveFolderId(userId, targetFolderId);
    await folderService.validateFolder(userId, targetId);
    if (await fileRepository.countByName(userId, file.originalName, targetId, fileId)) {
      throw new ApiError(409, 'A file with this name already exists in destination');
    }
    const updated = await fileRepository.updateById(fileId, { folderId: targetId });
    await activityLogService.logMove(userId, 'file', updated, file.folderId, targetId);
    return updated;
  },

  copy: async (userId, fileId, targetFolderId = null) => {
    const file = await fileService.getFile(userId, fileId);
    const targetId = await folderService.resolveFolderId(userId, targetFolderId || file.folderId);
    await folderService.validateFolder(userId, targetId);
    await fileService.validateStorage(userId, file.size);

    let copyName = file.originalName;
    let counter = 1;
    while (await fileRepository.countByName(userId, copyName, targetId)) {
      const ext = getExtension(file.originalName);
      const base = ext ? file.originalName.slice(0, -(ext.length + 1)) : file.originalName;
      copyName = ext ? `${base} (${counter}).${ext}` : `${base} (${counter})`;
      counter += 1;
    }

    const newStoredName = generateStoredName(copyName);
    await copyPhysicalFile(file.storedName, newStoredName);
    const copy = await fileRepository.create({
      owner: userId, folderId: targetId, originalName: copyName,
      storedName: newStoredName, mimeType: file.mimeType,
      extension: file.extension, size: file.size,
    });
    await userRepository.updateStorageUsed(userId, file.size);
    await activityLogService.logUpload(userId, copy);
    return copy;
  },

  softDelete: async (userId, fileId) => {
    const file = await fileService.getFile(userId, fileId);
    if (file.deleted) throw new ApiError(400, 'File is already in trash');
    const deleted = await fileRepository.softDelete(fileId);
    await userRepository.updateStorageUsed(userId, -file.size);
    await activityLogService.logDelete(userId, 'file', deleted);
    return deleted;
  },

  restore: async (userId, fileId) => {
    const file = await fileService.getFile(userId, fileId, true);
    if (!file.deleted) throw new ApiError(400, 'File is not in trash');
    if (file.folderId) {
      const folder = await folderRepository.findById(file.folderId);
      if (!folder || folder.deleted) throw new ApiError(400, 'Restore the parent folder first');
    }
    await fileService.validateStorage(userId, file.size);
    const restored = await fileRepository.restore(fileId);
    await userRepository.updateStorageUsed(userId, file.size);
    await activityLogService.logRestore(userId, 'file', restored);
    return restored;
  },

  permanentDelete: async (userId, fileId) => {
    const file = await fileService.getFile(userId, fileId, true);
    if (!file.deleted) throw new ApiError(400, 'File must be in trash before permanent delete');
    await deletePhysicalFile(file.storedName);
    await fileRepository.permanentDelete(fileId);
    return file;
  },

  getRecentFiles: (userId, limit = 10) => fileRepository.findRecent(userId, limit),

  getStorageInfo: async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    return {
      plan: user.plan,
      storageLimit: user.storageLimit,
      storageUsed: user.storageUsed,
      storageRemaining: user.storageLimit - user.storageUsed,
      usagePercent: Math.round((user.storageUsed / user.storageLimit) * 100),
    };
  },
};

module.exports = fileService;
