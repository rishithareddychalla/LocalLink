const filesMap = require('../store/fileStore');
const { scanFile } = require('../utils/threatScanner');
const path = require('path');
const fs = require('fs');

const uploadFile = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { roomId, userId } = req.body;
    const io = req.app.get('io');

    const scanResult = scanFile(req.file);
    const fileId = req.file.filename;

    const fileMetadata = {
        id: fileId,
        roomId,
        name: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        uploadedBy: userId || req.user.id,
        uploadedAt: Date.now(),
        isSafe: scanResult.safe,
        isThreat: !scanResult.safe,
        threatReason: scanResult.safe ? null : scanResult.reason
    };

    filesMap.set(fileId, fileMetadata);

    // Broadcast file upload event
    if (io) {
        io.to(roomId).emit('file_uploaded', {
            id: fileMetadata.id,
            name: fileMetadata.name,
            size: fileMetadata.size,
            uploadedBy: fileMetadata.uploadedBy,
            uploadedAt: fileMetadata.uploadedAt,
            isSafe: fileMetadata.isSafe,
            isThreat: fileMetadata.isThreat
        });
    }

    res.json({
        success: true,
        data: fileMetadata
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

    if (!fs.existsSync(file.path)) {
        return res.status(404).json({ success: false, error: 'Physical file not found' });
    }

    res.download(file.path, file.name);
};

module.exports = { uploadFile, downloadFile };
