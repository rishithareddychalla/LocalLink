const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(`[Auth] Attempting access to ${req.originalUrl}. Auth Header: ${authHeader ? 'found' : 'missing'}`);

    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.query.token) {
        token = req.query.token;
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'locallink_secret_k3y');
        req.user = decoded;
        next();
    } catch (error) {
        console.error(`[Auth] JWT verification failed for ${req.originalUrl}:`, error.message);
        return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
    }
};

module.exports = authMiddleware;
