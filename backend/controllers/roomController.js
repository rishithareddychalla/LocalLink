const { rooms, files: filesMap } = require('../store/memoryStore');
const generateRoomId = require('../utils/generateRoomId');
const fs = require('fs');
const path = require('path');

const createRoom = (req, res) => {
    const { name, isPrivate, password, approvalRequired, expiryTime } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, error: 'Room name is required' });
    }

    const roomId = generateRoomId();

    // Setup Expiry Timeout
    const expiryTimeout = setTimeout(() => {
        cleanupRoom(roomId, req.app.get('io'));
    }, expiryTime * 60000);

    const room = {
        id: roomId,
        name,
        isPrivate: isPrivate || false,
        password: password || null,
        approvalRequired: approvalRequired || false,
        creatorId: req.user.id,
        expiryTime,
        participants: [], // Participant structure: { userId, nickname, avatarStyle, avatarSeed }
        createdAt: new Date(),
        expiryTimeout
    };

    rooms.set(roomId, room);

    res.json({
        success: true,
        data: room
    });
};

const cleanupRoom = (roomId, io) => {
    const room = rooms.get(roomId);
    if (!room) return;

    console.log(`Cleaning up expired room: ${roomId}`);

    // Delete associated files from storage and memory
    filesMap.forEach((file, fileId) => {
        if (file.roomId === roomId) {
            const filePath = path.join(__dirname, '../uploads', file.id);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            filesMap.delete(fileId);
        }
    });

    // Notify participants
    if (io) {
        io.to(roomId).emit('room_expired', { roomId });
    }

    // Delete room from memory
    rooms.delete(roomId);
};

const joinRoom = (req, res) => {
    const { roomId, password } = req.body;

    const room = rooms.get(roomId);
    if (!room) {
        return res.status(404).json({ success: false, error: 'Room not found' });
    }

    if (room.isPrivate && room.password !== password) {
        return res.status(403).json({ success: false, error: 'Invalid password' });
    }

    if (room.approvalRequired) {
        // Here we just signal the readiness to join, actual logic handled via sockets
        return res.json({
            success: true,
            status: 'pending',
            message: 'Approval required from room creator'
        });
    }

    res.json({
        success: true,
        status: 'joined',
        data: room
    });
};

module.exports = { createRoom, joinRoom, cleanupRoom };
