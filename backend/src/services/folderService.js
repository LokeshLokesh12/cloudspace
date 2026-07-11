const folderRepository = require('../repositories/folderRepository');
const fileRepository = require('../repositories/fileRepository');
const userRepository = require('../repositories/userRepository');
const activityLogService = require('./activityLogService');
const ApiError = require('../utils/ApiError');

const folderService = {
  getHomeFolder: async (userId) => {
    const home = await folderRepository.findRootFolder(userId);
    if (!home) throw new ApiError(404, 'Home folder not found');
    return home;
  },

  resolveFolderId: async (userId, folderId) => {
    if (!folderId) return (await folderService.getHomeFolder(userId))._id;
    return folderId;
  },

  getFolder: async (userId, folderId) => {
    const folder = await folderRepository.findById(folderId);
    if (!folder || folder.owner.toString() !== userId.toString()) {
      throw new ApiError(404, 'Folder not found');
    }
    return folder;
  },

  validateFolder: async (userId, folderId) => {
    const folder = await folderService.getFolder(userId, folderId);
    if (folder.deleted) throw new ApiError(400, 'Folder is in trash');
    return folder;
  },

  getContents: async (userId, folderId = null) => {
    const resolvedId = await folderService.resolveFolderId(userId, folderId);
    await folderService.validateFolder(userId, resolvedId);
    const [folders, files] = await Promise.all([
      folderRepository.findByOwner(userId, resolvedId, false),
      fileRepository.findByOwner(userId, resolvedId, false),
    ]);
    return { folders, files, currentFolderId: resolvedId };
  },

  getBreadcrumb: async (userId, folderId = null) => {
    const resolvedId = await folderService.resolveFolderId(userId, folderId);
    const breadcrumb = [];
    let current = await folderService.getFolder(userId, resolvedId);
    while (current) {
      breadcrumb.unshift({ _id: current._id, name: current.name });
      if (!current.parentFolder) break;
      current = await folderRepository.findById(current.parentFolder);
      if (!current || current.owner.toString() !== userId.toString()) break;
    }
    return breadcrumb;
  },

  create: async (userId, name, parentFolderId = null) => {
    const parentId = await folderService.resolveFolderId(userId, parentFolderId);
    await folderService.validateFolder(userId, parentId);
    if (await folderRepository.countByName(userId, name, parentId)) {
      throw new ApiError(409, 'A folder with this name already exists');
    }
    return folderRepository.create({ owner: userId, name, parentFolder: parentId });
  },

  rename: async (userId, folderId, name) => {
    const folder = await folderService.validateFolder(userId, folderId);
    const oldName = folder.name;
    if (await folderRepository.countByName(userId, name, folder.parentFolder, folderId)) {
      throw new ApiError(409, 'A folder with this name already exists');
    }
    const updated = await folderRepository.updateById(folderId, { name });
    await activityLogService.logRename(userId, 'folder', updated, oldName);
    return updated;
  },

  isDescendant: async (ancestorId, folderId) => {
    let current = await folderRepository.findById(folderId);
    while (current?.parentFolder) {
      if (current.parentFolder.toString() === ancestorId.toString()) return true;
      current = await folderRepository.findById(current.parentFolder);
    }
    return false;
  },

  move: async (userId, folderId, targetFolderId) => {
    const folder = await folderService.validateFolder(userId, folderId);
    const targetId = await folderService.resolveFolderId(userId, targetFolderId);
    await folderService.validateFolder(userId, targetId);
    if (folderId.toString() === targetId.toString()) throw new ApiError(400, 'Cannot move folder into itself');
    if (await folderService.isDescendant(folderId, targetId)) {
      throw new ApiError(400, 'Cannot move folder into its own subfolder');
    }
    if (await folderRepository.countByName(userId, folder.name, targetId, folderId)) {
      throw new ApiError(409, 'A folder with this name already exists in destination');
    }
    const updated = await folderRepository.updateById(folderId, { parentFolder: targetId });
    await activityLogService.logMove(userId, 'folder', updated, folder.parentFolder, targetId);
    return updated;
  },

  collectSubtreeIds: async (folderId, includeAll = false) => {
    const folderIds = [folderId];
    const descendants = includeAll
      ? await folderRepository.findAllDescendants(folderId)
      : await folderRepository.findDescendants(folderId, false);
    folderIds.push(...descendants.map((f) => f._id));
    return folderIds;
  },

  softDelete: async (userId, folderId) => {
    const folder = await folderService.getFolder(userId, folderId);
    if (folder.deleted) throw new ApiError(400, 'Folder is already in trash');
    const home = await folderService.getHomeFolder(userId);
    if (folder._id.toString() === home._id.toString()) {
      throw new ApiError(400, 'Cannot delete the Home folder');
    }
    const subtreeIds = await folderService.collectSubtreeIds(folderId);
    const files = await fileRepository.findByFolderIds(userId, subtreeIds, false);
    const fileIds = files.map((f) => f._id);
    const freedSize = files.reduce((sum, f) => sum + f.size, 0);
    await folderRepository.softDeleteMany(subtreeIds);
    if (fileIds.length) await fileRepository.softDeleteMany(fileIds);
    if (freedSize > 0) await userRepository.updateStorageUsed(userId, -freedSize);
    await activityLogService.logDelete(userId, 'folder', folder);
    return { folder, deletedFolders: subtreeIds.length, deletedFiles: fileIds.length };
  },

  restore: async (userId, folderId) => {
    const folder = await folderService.getFolder(userId, folderId);
    if (!folder.deleted) throw new ApiError(400, 'Folder is not in trash');
    if (folder.parentFolder) {
      const parent = await folderRepository.findById(folder.parentFolder);
      if (!parent || parent.deleted) throw new ApiError(400, 'Restore the parent folder first');
    }
    const subtreeIds = await folderService.collectSubtreeIds(folderId, true);
    const files = await fileRepository.findByFolderIds(userId, subtreeIds, true);
    const fileIds = files.map((f) => f._id);
    const restoreSize = files.reduce((sum, f) => sum + f.size, 0);
    const fileService = require('./fileService');
    if (restoreSize > 0) await fileService.validateStorage(userId, restoreSize);
    await folderRepository.restoreMany(subtreeIds);
    if (fileIds.length) await fileRepository.restoreMany(fileIds);
    if (restoreSize > 0) await userRepository.updateStorageUsed(userId, restoreSize);
    const restored = await folderRepository.findById(folderId);
    await activityLogService.logRestore(userId, 'folder', restored);
    return restored;
  },

  getTree: async (userId) => {
    const Folder = require('../models/Folder');
    const home = await folderService.getHomeFolder(userId);
    const allFolders = await Folder.find({ owner: userId, deleted: false });
    const buildTree = (parentId) =>
      allFolders
        .filter((f) => {
          const pf = f.parentFolder?.toString() || null;
          const pid = parentId?.toString() || null;
          return pf === pid && f._id.toString() !== home._id.toString();
        })
        .map((f) => ({
          _id: f._id, name: f.name, parentFolder: f.parentFolder, children: buildTree(f._id),
        }));
    return { _id: home._id, name: home.name, children: buildTree(home._id) };
  },
};

module.exports = folderService;
