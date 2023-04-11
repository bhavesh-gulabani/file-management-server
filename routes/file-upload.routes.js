import express from 'express';

import {
  getAllFiles,
  getFileDetail,
  uploadFile,
} from '../controllers/file.controller.js';

const router = express.Router();

router.route('/user/:userId').get(getAllFiles);
router.route('/user/:userId/upload').post(uploadFile);
router.route('/:id').get(getFileDetail);

export default router;
