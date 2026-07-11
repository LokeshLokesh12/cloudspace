const express = require('express');
const folderController = require('../controllers/folderController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createFolderValidator, renameFolderValidator, moveFolderValidator,
  folderIdParamValidator, folderQueryValidator,
} = require('../validators/folderValidators');

const router = express.Router();
router.use(authenticate);

router.get('/tree', folderController.getTree);
router.get('/breadcrumb', folderQueryValidator, validate, folderController.getBreadcrumb);
router.get('/contents', folderQueryValidator, validate, folderController.getContents);
router.get('/:id', folderIdParamValidator, validate, folderController.getOne);

router.post('/', createFolderValidator, validate, folderController.create);
router.patch('/:id/rename', renameFolderValidator, validate, folderController.rename);
router.patch('/:id/move', moveFolderValidator, validate, folderController.move);
router.delete('/:id', folderIdParamValidator, validate, folderController.delete);

module.exports = router;
