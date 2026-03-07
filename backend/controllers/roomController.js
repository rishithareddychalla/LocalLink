const roomStore = require('../store/roomStore');
const filesMap = require('../store/fileStore');
const messageStore = require('../store/messageStore');
const generateRoomId = require('../utils/generateRoomId');
const fs = require('fs');
const path = require('path');

const createRoom = (req, res) => {
    const { name, isPrivate, password, expiryTime: expiryInput, expiry, id, creatorSocketId, accentColor } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, error: 'Room name is required' });
    }

    // Parse expiryTime (e.g., "1min", "5min" or direct number)
    const finalExpiryInput = expiryInput || expiry;
    let expiryTime = 30; // Default 30 mins
    if (finalExpiryInput) {
        if (typeof finalExpiryInput === 'string') {
            expiryTime = parseInt(finalExpiryInput.replace('min', '')) || 30;
        } else {
            expiryTime = finalExpiryInput;
        }
    }

    const roomId = id || generateRoomId();
    const io = req.app.get('io');

    // Setup Expiry Timeout
    const expiryTimeout = setTimeout(() => {
        cleanupRoom(roomId, io);
    }, expiryTime * 60000);

    const roomData = {
        id: roomId,
        name,
        isPrivate: Boolean(isPrivate),
        password: isPrivate ? (password || null) : null,
        creatorId: req.user.id,
        creatorName: req.user.nickname,
        creatorSocketId,
        expiryTime,
        expiryTimeout,
        accentColor: accentColor || '#22d3ee'
    };

    try {
        const room = roomStore.createRoom(roomData);

        // Broadcast room creation to everyone for discovery
        if (io) {
            io.emit('room_created', roomStore.getRooms().find(r => r.id === roomId));
        }

        res.json({
            success: true,
            data: {
                id: room.id,
                name: room.name,
                creatorId: room.creatorId,
                creatorName: room.creatorName,
                isPrivate: room.isPrivate,
                createdAt: room.createdAt,
                expiresAt: room.expiresAt,
                accentColor: room.accentColor
            }
        });
    } catch (error) {
        console.error('Room creation failed:', error);
        res.status(500).json({ success: false, error: 'Internal server error during room creation' });
    }
};

const cleanupRoom = (roomId, io, suppressNotify = false) => {
    console.log(`Cleaning up expired room: ${roomId}`);

    // Delete associated files from storage and memory
    filesMap.forEach((file, fileId) => {
        if (file.roomId === roomId) {
            const filePath = file.path;
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            filesMap.delete(fileId);
        }
    });

    // Clear messages from store
    messageStore.clearMessages(roomId);

    // Notify participants and broadast removal
    if (io) {
        if (!suppressNotify) {
            io.to(roomId).emit('room_expired', { roomId });
        }
        io.emit('room_removed', roomId);
    }

    // Delete room from memory
    roomStore.removeRoom(roomId);
};

const joinRoom = (req, res) => {
    let { roomId, password } = req.body;
    if (roomId) roomId = roomId.toUpperCase();
    const userId = req.user.id;

    const room = roomStore.getRoom(roomId);
    if (!room) {
        return res.status(404).json({ success: false, error: 'Room not found' });
    }

    // Creator always has access
    if (room.creatorId === userId) {
        return res.json({
            success: true,
            status: 'joined',
            data: room
        });
    }

    // Handle Private Rooms
    if (room.isPrivate === true) {
        if (password !== room.password) {
            return res.status(403).json({
                success: false,
                error: 'Incorrect room password'
            });
        }
    }

    // Public Rooms (isPrivate === false) skip password check above and proceed here

    // Filter password from room object before sending to client [SECURITY]
    const { password: _, ...roomWithoutPassword } = room;

    res.json({
        success: true,
        status: 'joined',
        data: roomWithoutPassword
    });
};

const getRooms = (req, res) => {
    res.json({
        success: true,
        rooms: roomStore.getRooms()
    });
};

const getRoom = (req, res) => {
    let { roomId } = req.params;
    if (roomId) roomId = roomId.toUpperCase();
    const room = roomStore.getRoom(roomId);

    if (!room) {
        return res.status(404).json({ success: false, error: 'Room not found' });
    }

    // Filter password from room object before sending to client [SECURITY]
    const { password: _, ...roomWithoutPassword } = room;

    res.json({
        success: true,
        data: roomWithoutPassword
    });
};

module.exports = { createRoom, joinRoom, getRooms, getRoom, cleanupRoom };
