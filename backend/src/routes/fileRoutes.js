const express = require('express');
const fileController = require('../controllers/fileController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { upload, handleMulterError } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');
const {
  uploadValidator, listFilesValidator, renameFileValidator,
  moveFileValidator, copyFileValidator, fileIdParamValidator,
} = require('../validators/fileValidators');

const router = express.Router();
router.use(authenticate);

router.get('/dashboard', fileController.getDashboard);
router.get('/storage', fileController.getStorageInfo);
router.get('/recent', fileController.getRecent);
router.get('/', listFilesValidator, validate, fileController.list);

router.post('/upload', uploadLimiter, uploadValidator, validate, upload.single('file'), handleMulterError, fileController.upload);
router.post('/upload/multiple', uploadLimiter, uploadValidator, validate, upload.array('files', 20), handleMulterError, fileController.uploadMultiple);

router.get('/:id/download', fileIdParamValidator, validate, fileController.download);
router.get('/:id/preview', fileIdParamValidator, validate, fileController.preview);
router.patch('/:id/rename', renameFileValidator, validate, fileController.rename);
router.patch('/:id/move', moveFileValidator, validate, fileController.move);
router.post('/:id/copy', copyFileValidator, validate, fileController.copy);
router.delete('/:id', fileIdParamValidator, validate, fileController.delete);
router.get('/:id', fileIdParamValidator, validate, fileController.getOne);

module.exports = router;
