const path = require('path');

const scanFile = (file) => {
    const suspiciousExtensions = ['.exe', '.bat', '.js'];
    const ext = path.extname(file.originalname || file.name).toLowerCase();

    if (suspiciousExtensions.includes(ext)) {
        return {
            safe: false,
            reason: `Suspicious file type detected: ${ext}`
        };
    }

    return { safe: true };
};

module.exports = { scanFile };
