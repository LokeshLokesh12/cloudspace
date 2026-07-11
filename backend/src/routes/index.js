const express = require('express');
const authRoutes = require('./authRoutes');
const fileRoutes = require('./fileRoutes');
const folderRoutes = require('./folderRoutes');
const trashRoutes = require('./trashRoutes');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Cloud Storage API is running' });
});

router.use('/auth', authRoutes);
router.use('/files', fileRoutes);
router.use('/folders', folderRoutes);
router.use('/trash', trashRoutes);

module.exports = router;
