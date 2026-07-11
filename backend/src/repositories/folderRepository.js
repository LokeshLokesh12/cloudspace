const Folder = require('../models/Folder');

const folderRepository = {
  create: (data) => Folder.create(data),
  findById: (id) => Folder.findById(id),
  findByOwner: (ownerId, parentFolder = null, deleted = false) =>
    Folder.find({ owner: ownerId, parentFolder, deleted }).sort({ name: 1 }),
  findRootFolder: (ownerId) =>
    Folder.findOne({ owner: ownerId, parentFolder: null, deleted: false }),
  findDeletedByOwner: (ownerId) =>
    Folder.find({ owner: ownerId, deleted: true }).sort({ deletedAt: -1 }),
  findDescendants: async (folderId, deleted = false) => {
    const descendants = [];
    const queue = [folderId];
    while (queue.length) {
      const currentId = queue.shift();
      const children = await Folder.find({ parentFolder: currentId, deleted });
      for (const child of children) {
        descendants.push(child);
        queue.push(child._id);
      }
    }
    return descendants;
  },
  findAllDescendants: async (folderId) => {
    const descendants = [];
    const queue = [folderId];
    while (queue.length) {
      const currentId = queue.shift();
      const children = await Folder.find({ parentFolder: currentId });
      for (const child of children) {
        descendants.push(child);
        queue.push(child._id);
      }
    }
    return descendants;
  },
  updateById: (id, data) => Folder.findByIdAndUpdate(id, data, { new: true, runValidators: true }),
  softDelete: (id) => Folder.findByIdAndUpdate(id, { deleted: true, deletedAt: new Date() }, { new: true }),
  softDeleteMany: (ids) => Folder.updateMany({ _id: { $in: ids } }, { deleted: true, deletedAt: new Date() }),
  restore: (id) => Folder.findByIdAndUpdate(id, { deleted: false, deletedAt: null }, { new: true }),
  restoreMany: (ids) => Folder.updateMany({ _id: { $in: ids } }, { deleted: false, deletedAt: null }),
  permanentDelete: (id) => Folder.findByIdAndDelete(id),
  permanentDeleteMany: (ids) => Folder.deleteMany({ _id: { $in: ids } }),
  countByName: (ownerId, name, parentFolder, excludeId = null) => {
    const query = { owner: ownerId, name, parentFolder, deleted: false };
    if (excludeId) query._id = { $ne: excludeId };
    return Folder.countDocuments(query);
  },
};

module.exports = folderRepository;
