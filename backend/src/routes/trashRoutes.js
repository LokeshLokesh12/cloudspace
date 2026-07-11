const express = require('express');
const trashController = require('../controllers/trashController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { fileIdParamValidator } = require('../validators/fileValidators');
const { folderIdParamValidator } = require('../validators/folderValidators');

const router = express.Router();
router.use(authenticate);

router.get('/', trashController.list);
router.delete('/empty', trashController.emptyTrash);
router.post('/files/:id/restore', fileIdParamValidator, validate, trashController.restoreFile);
router.post('/folders/:id/restore', folderIdParamValidator, validate, trashController.restoreFolder);
router.delete('/files/:id', fileIdParamValidator, validate, trashController.permanentDeleteFile);
router.delete('/folders/:id', folderIdParamValidator, validate, trashController.permanentDeleteFolder);

module.exports = router;
