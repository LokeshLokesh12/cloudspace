const { body, param, query } = require('express-validator');

const uploadValidator = [
  query('folderId').optional({ nullable: true })
    .custom((v) => !v || /^[a-f\d]{24}$/i.test(v)).withMessage('Invalid folder ID'),
];

const listFilesValidator = [
  query('folderId').optional({ nullable: true })
    .custom((v) => v === 'null' || v === '' || v === undefined || /^[a-f\d]{24}$/i.test(v))
    .withMessage('Invalid folder ID'),
];

const renameFileValidator = [
  param('id').isMongoId().withMessage('Invalid file ID'),
  body('originalName').trim().notEmpty().withMessage('File name is required').isLength({ max: 255 }),
];

const moveFileValidator = [
  param('id').isMongoId().withMessage('Invalid file ID'),
  body('targetFolderId').optional({ nullable: true })
    .custom((v) => v === null || v === undefined || /^[a-f\d]{24}$/i.test(v))
    .withMessage('Invalid target folder ID'),
];

const copyFileValidator = [
  param('id').isMongoId().withMessage('Invalid file ID'),
  body('targetFolderId').optional({ nullable: true })
    .custom((v) => v === null || v === undefined || /^[a-f\d]{24}$/i.test(v))
    .withMessage('Invalid target folder ID'),
];

const fileIdParamValidator = [param('id').isMongoId().withMessage('Invalid file ID')];

module.exports = {
  uploadValidator, listFilesValidator, renameFileValidator,
  moveFileValidator, copyFileValidator, fileIdParamValidator,
};
