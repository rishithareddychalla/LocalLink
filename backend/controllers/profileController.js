const { users } = require('../store/memoryStore');

const getProfile = (req, res) => {
    try {
        const user = users.get(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({
            success: true,
            data: {
                nickname: user.nickname,
                avatarStyle: user.avatarStyle,
                avatarSeed: user.avatarSeed
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

const updateProfile = (req, res) => {
    const { nickname, avatarStyle, avatarSeed } = req.body;

    try {
        const user = users.get(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const updatedUser = {
            ...user,
            nickname: nickname || user.nickname,
            avatarStyle: avatarStyle || user.avatarStyle,
            avatarSeed: avatarSeed || user.avatarSeed
        };

        users.set(req.user.id, updatedUser);

        res.json({
            success: true,
            data: {
                nickname: updatedUser.nickname,
                avatarStyle: updatedUser.avatarStyle,
                avatarSeed: updatedUser.avatarSeed
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

module.exports = { getProfile, updateProfile };
