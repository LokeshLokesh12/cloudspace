const { body, param, query } = require('express-validator');

const createFolderValidator = [
  body('name').trim().notEmpty().withMessage('Folder name is required').isLength({ max: 255 }),
  body('parentFolderId').optional({ nullable: true })
    .custom((v) => !v || /^[a-f\d]{24}$/i.test(v)).withMessage('Invalid parent folder ID'),
];

const renameFolderValidator = [
  param('id').isMongoId().withMessage('Invalid folder ID'),
  body('name').trim().notEmpty().withMessage('Folder name is required').isLength({ max: 255 }),
];

const moveFolderValidator = [
  param('id').isMongoId().withMessage('Invalid folder ID'),
  body('targetFolderId').optional({ nullable: true })
    .custom((v) => v === null || v === undefined || /^[a-f\d]{24}$/i.test(v))
    .withMessage('Invalid target folder ID'),
];

const folderIdParamValidator = [param('id').isMongoId().withMessage('Invalid folder ID')];

const folderQueryValidator = [
  query('folderId').optional({ nullable: true })
    .custom((v) => v === 'null' || v === '' || v === undefined || /^[a-f\d]{24}$/i.test(v))
    .withMessage('Invalid folder ID'),
];

module.exports = {
  createFolderValidator, renameFolderValidator, moveFolderValidator,
  folderIdParamValidator, folderQueryValidator,
};
