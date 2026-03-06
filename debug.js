const roomController = require('./backend/controllers/roomController');
const roomStore = require('./backend/store/roomStore');

// Mock req and res
const req = {};
const res = {
    json: (data) => console.log('Response JSON:', JSON.stringify(data, null, 2)),
    status: (code) => ({
        json: (data) => console.log(`Response status ${code} JSON:`, JSON.stringify(data, null, 2))
    })
};

console.log('Testing getRooms...');
try {
    roomController.getRooms(req, res);
} catch (error) {
    console.error('getRooms error:', error);
}

console.log('Testing cleanupRoom...');
try {
    // roomId, io, suppressNotify
    roomController.cleanupRoom('TEST_ROOM', null, false);
} catch (error) {
    console.error('cleanupRoom error:', error);
}
