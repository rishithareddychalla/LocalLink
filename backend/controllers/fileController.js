const { files: filesMap } = require('../store/memoryStore');
const { scanFile } = require('../utils/threatScanner');
const path = require('path');
const fs = require('fs');

const uploadFile = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { roomId } = req.body;
    const scanResult = scanFile(req.file);

    const file = {
        id: req.file.filename,
        roomId,
        fileName: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        uploadedBy: req.user.id,
        uploadedAt: new Date(),
        isThreat: !scanResult.safe,
        threatReason: scanResult.safe ? null : scanResult.reason
    };

    filesMap.set(file.id, file);

    res.json({
        success: true,
        data: file
    });
};

const downloadFile = (req, res) => {
    const { fileId } = req.params;

    const file = filesMap.get(fileId);
    if (!file) {
        return res.status(404).json({ success: false, error: 'File not found' });
    }

    if (file.isThreat) {
        return res.status(403).json({ success: false, error: `Download blocked: ${file.threatReason}` });
    }

    const filePath = path.join(__dirname, '../uploads', file.id);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, error: 'Physical file not found' });
    }

    res.download(filePath, file.fileName);
};

module.exports = { uploadFile, downloadFile };
