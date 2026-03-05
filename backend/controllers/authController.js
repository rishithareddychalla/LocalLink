const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { users } = require('../store/memoryStore');

const login = (req, res) => {
    const { nickname, avatarStyle, avatarSeed } = req.body;

    if (!nickname) {
        return res.status(400).json({ success: false, error: 'Nickname is required' });
    }

    const userId = uuidv4();
    const sessionToken = jwt.sign(
        { nickname, id: userId },
        process.env.JWT_SECRET || 'locallink_secret_k3y',
        { expiresIn: '24h' }
    );

    const user = {
        id: userId,
        nickname,
        avatarStyle: avatarStyle || 'bottts-neutral',
        avatarSeed: avatarSeed || nickname,
        sessionToken,
        createdAt: new Date()
    };

    users.set(userId, user);

    res.json({
        success: true,
        data: {
            id: user.id,
            nickname: user.nickname,
            avatarStyle: user.avatarStyle,
            avatarSeed: user.avatarSeed,
            token: sessionToken
        }
    });
};

module.exports = { login };
