const mongoose = require('mongoose');
const { VISIBILITY } = require('../config/constants');

const fileSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null, index: true },
    originalName: { type: String, required: true, trim: true },
    storedName: { type: String, required: true, unique: true },
    mimeType: { type: String, required: true },
    extension: { type: String, default: '' },
    size: { type: Number, required: true, min: 0 },
    deleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    visibility: { type: String, enum: Object.values(VISIBILITY), default: VISIBILITY.PRIVATE },
    shareToken: { type: String, default: null, sparse: true },
  },
  { timestamps: true }
);

fileSchema.index({ owner: 1, folderId: 1, deleted: 1 });

module.exports = mongoose.model('File', fileSchema);
