const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 255 },
    parentFolder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null, index: true },
    deleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

folderSchema.index({ owner: 1, parentFolder: 1, name: 1, deleted: 1 });

module.exports = mongoose.model('Folder', folderSchema);
