const strokes = new Map(); // roomId -> Array of strokes

const addStroke = (roomId, stroke) => {
    if (!strokes.has(roomId)) {
        strokes.set(roomId, []);
    }
    const roomStrokes = strokes.get(roomId);

    // Check if we are updating an existing stroke
    const index = roomStrokes.findIndex(s => s.id === stroke.id);
    if (index !== -1) {
        roomStrokes[index] = stroke;
    } else {
        roomStrokes.push(stroke);
    }

    // Limit to 500 strokes to prevent memory bloat
    if (roomStrokes.length > 500) {
        roomStrokes.shift();
    }
};

const getStrokes = (roomId) => {
    return strokes.get(roomId) || [];
};

const clearStrokes = (roomId) => {
    strokes.delete(roomId);
};

module.exports = {
    addStroke,
    getStrokes,
    clearStrokes
};
