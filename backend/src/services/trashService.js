const fileRepository = require('../repositories/fileRepository');
const folderRepository = require('../repositories/folderRepository');
const folderService = require('./folderService');
const { deletePhysicalFile } = require('../utils/fileUtils');
const ApiError = require('../utils/ApiError');

const trashService = {
  list: async (userId) => {
    const [files, folders] = await Promise.all([
      fileRepository.findDeletedByOwner(userId),
      folderRepository.findDeletedByOwner(userId),
    ]);
    const home = await folderService.getHomeFolder(userId);
    return {
      files,
      folders: folders.filter((f) => f._id.toString() !== home._id.toString()),
    };
  },

  restoreFile: async (userId, fileId) => {
    const fileService = require('./fileService');
    return fileService.restore(userId, fileId);
  },

  restoreFolder: async (userId, folderId) => folderService.restore(userId, folderId),

  permanentDeleteFile: async (userId, fileId) => {
    const fileService = require('./fileService');
    return fileService.permanentDelete(userId, fileId);
  },

  permanentDeleteFolder: async (userId, folderId) => {
    const folder = await folderService.getFolder(userId, folderId);
    if (!folder.deleted) throw new ApiError(400, 'Folder must be in trash before permanent delete');
    const home = await folderService.getHomeFolder(userId);
    if (folder._id.toString() === home._id.toString()) {
      throw new ApiError(400, 'Cannot permanently delete the Home folder');
    }
    const subtreeIds = await folderService.collectSubtreeIds(folderId, true);
    const files = await fileRepository.findByFolderIds(userId, subtreeIds, true);
    const fileIds = files.map((f) => f._id);
    for (const file of files) await deletePhysicalFile(file.storedName);
    if (fileIds.length) await fileRepository.permanentDeleteMany(fileIds);
    await folderRepository.permanentDeleteMany(subtreeIds);
    return { deletedFolders: subtreeIds.length, deletedFiles: fileIds.length };
  },

  emptyTrash: async (userId) => {
    const { files, folders } = await trashService.list(userId);
    for (const file of files) await deletePhysicalFile(file.storedName);
    const fileIds = files.map((f) => f._id);
    const folderIds = folders.map((f) => f._id);
    if (fileIds.length) await fileRepository.permanentDeleteMany(fileIds);
    if (folderIds.length) await folderRepository.permanentDeleteMany(folderIds);
    return { deletedFiles: fileIds.length, deletedFolders: folderIds.length };
  },
};

module.exports = trashService;
