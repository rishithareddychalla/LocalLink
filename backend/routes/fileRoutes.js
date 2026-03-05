const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', authMiddleware, upload.single('file'), fileController.uploadFile);
router.get('/download/:fileId', authMiddleware, fileController.downloadFile);

module.exports = router;
