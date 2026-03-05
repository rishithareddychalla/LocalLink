const generateRoomId = () => {
    return `LL-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`;
};

module.exports = generateRoomId;
