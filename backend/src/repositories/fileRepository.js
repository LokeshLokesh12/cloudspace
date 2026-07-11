const File = require('../models/File');

const fileRepository = {
  create: (data) => File.create(data),
  findById: (id) => File.findById(id),
  findByStoredName: (storedName) => File.findOne({ storedName }),
  findByOwner: (ownerId, folderId = null, deleted = false) => {
    const query = { owner: ownerId, deleted };
    query.folderId = folderId === null ? null : folderId;
    return File.find(query).sort({ createdAt: -1 });
  },
  findByFolderIds: (ownerId, folderIds, deleted = false) =>
    File.find({ owner: ownerId, folderId: { $in: folderIds }, deleted }).sort({ createdAt: -1 }),
  findDeletedByOwner: (ownerId) =>
    File.find({ owner: ownerId, deleted: true }).sort({ deletedAt: -1 }),
  findRecent: (ownerId, limit = 10) =>
    File.find({ owner: ownerId, deleted: false }).sort({ createdAt: -1 }).limit(limit),
  updateById: (id, data) => File.findByIdAndUpdate(id, data, { new: true, runValidators: true }),
  softDelete: (id) => File.findByIdAndUpdate(id, { deleted: true, deletedAt: new Date() }, { new: true }),
  softDeleteMany: (ids) => File.updateMany({ _id: { $in: ids } }, { deleted: true, deletedAt: new Date() }),
  restore: (id) => File.findByIdAndUpdate(id, { deleted: false, deletedAt: null }, { new: true }),
  restoreMany: (ids) => File.updateMany({ _id: { $in: ids } }, { deleted: false, deletedAt: null }),
  permanentDelete: (id) => File.findByIdAndDelete(id),
  permanentDeleteMany: (ids) => File.deleteMany({ _id: { $in: ids } }),
  countByName: (ownerId, originalName, folderId, excludeId = null) => {
    const query = { owner: ownerId, originalName, folderId, deleted: false };
    if (excludeId) query._id = { $ne: excludeId };
    return File.countDocuments(query);
  },
};

module.exports = fileRepository;
