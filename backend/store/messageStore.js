const messages = new Map();

const addMessage = (roomId, message) => {
    if (!messages.has(roomId)) {
        messages.set(roomId, []);
    }
    messages.get(roomId).push(message);

    // Limit history to 100 messages per room
    if (messages.get(roomId).length > 100) {
        messages.get(roomId).shift();
    }
};

const getMessages = (roomId) => {
    return messages.get(roomId) || [];
};

const clearMessages = (roomId) => {
    messages.delete(roomId);
};

module.exports = {
    addMessage,
    getMessages,
    clearMessages
};
