const { logs } = require('../store/memoryStore');
const deviceStore = require('../store/deviceStore');
const roomStore = require('../store/roomStore');
const messageStore = require('../store/messageStore');
const strokeStore = require('../store/strokeStore');
const { cleanupRoom } = require('../controllers/roomController');
const crypto = require('crypto');

const addLog = (userId, type, title, description) => {
    if (!logs.has(userId)) {
        logs.set(userId, []);
    }
    const userLogs = logs.get(userId);
    userLogs.unshift({
        id: Date.now(),
        type,
        title,
        description,
        timestamp: new Date()
    });
    // Limit to 50 entries
    if (userLogs.length > 50) {
        userLogs.pop();
    }
};

const socketHandler = (io) => {
    io.on('connection', (socket) => {
        let ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;

        // Normalize IPv6-mapped IPv4 addresses
        if (ip.startsWith('::ffff:')) {
            ip = ip.substring(7);
        }

        console.log('New client connected:', socket.id, 'IP:', ip);

        // Initial device entry (anonymous)
        deviceStore.addDevice(socket.id, {
            id: socket.id,
            ipAddress: ip,
            nickname: 'Anonymous',
            userAgent: socket.handshake.headers['user-agent'],
            status: 'online'
        });

        // Send current rooms list for initial discovery
        socket.emit('rooms_list', roomStore.getRooms());

        socket.on('identify', (userData) => {
            const deviceData = {
                id: userData.id || socket.id,
                nickname: userData.nickname,
                avatar: userData.avatar,
                ipAddress: ip,
                status: 'online'
            };
            deviceStore.updateDevice(socket.id, deviceData);

            // Broadcast to others on the same subnet
            socket.broadcast.emit('device_joined', deviceData);
            console.log(`Device identified: ${userData.nickname} (${ip})`);
        });

        // Update last seen on any event
        socket.use(([event, ...args], next) => {
            deviceStore.updateDevice(socket.id, {});
            next();
        });

        socket.on('join_room', ({ roomId, user }) => {
            console.log(`[Socket: ${socket.id}] Received 'join_room' Payload -> roomId: ${roomId}, user:`, user);
            const room = roomStore.getRoom(roomId);
            if (!room) {
                console.log(`[Socket] join_room failed: Room ${roomId} not found in store.`);
                return;
            }

            // If creator joins, update their socketId in store
            // Use loose equality (==) to handle potential string/number ID mismatches
            if (room.creatorId == user.id) {
                room.creatorSocketId = socket.id;
                console.log(`[Socket] Creator ${user.nickname} identified. Socket ID Registered: ${socket.id}`);
            }

            socket.join(roomId);

            // Add to participants if not already there
            const userData = { ...user, socketId: socket.id };
            const { room: updatedRoom, isNew } = roomStore.addParticipant(roomId, userData);

            if (updatedRoom) {
                // Send message history to the joined user
                socket.emit('room_messages', messageStore.getMessages(roomId));
                socket.emit('room_strokes', strokeStore.getStrokes(roomId));

                if (isNew) {
                    addLog(user.id, 'Network', 'Room Joined', `Joined room: ${updatedRoom.name}`);

                    // Create and store system message
                    const systemMsg = {
                        id: crypto.randomUUID(),
                        roomId,
                        type: 'system',
                        message: `${user.nickname} joined the room`,
                        timestamp: Date.now()
                    };
                    messageStore.addMessage(roomId, systemMsg);

                    // Real-time update for discovery
                    io.emit('room_updated', roomStore.getRooms().find(r => r.id === roomId));

                    io.to(roomId).emit('receive_message', systemMsg);
                }

                io.to(roomId).emit('user_joined', {
                    roomId,
                    user: user,
                    participants: updatedRoom.participants
                });
            }

            console.log(`User ${user.nickname} joined room ${roomId}`);
        });

        socket.on('leave_room', async ({ roomId, userId }) => {
            console.log(`[Socket: ${socket.id}] Received 'leave_room' Payload -> roomId: ${roomId}, userId: ${userId}`);
            const room = roomStore.getRoom(roomId);
            if (!room) {
                console.log(`[Socket] leave_room failed: Room ${roomId} not found in store!`);
                return;
            }

            console.log(`[Socket] Resolving leave_room payload. room.creatorId: ${room.creatorId} | payload userId: ${userId}`);

            // Check if creator is leaving
            if (room.creatorId == userId) {
                console.log(`[Socket] Creator ${userId} left room ${roomId}. Closing room.`);

                // Broadcast closure to all participants
                io.to(roomId).emit('room_closed', {
                    message: "Session ended by room creator"
                });

                // Force all sockets to leave the room
                const sockets = await io.in(roomId).fetchSockets();
                for (const s of sockets) {
                    s.leave(roomId);
                }

                // Cleanup room from backend
                strokeStore.clearStrokes(roomId);
                cleanupRoom(roomId, io, true);
                return;
            }

            socket.leave(roomId);
            const updatedRoom = roomStore.removeParticipant(roomId, userId);

            if (updatedRoom) {
                addLog(userId, 'Network', 'Room Left', `Left room: ${updatedRoom.name}`);

                // Create and store system join/leave message
                const systemMsg = {
                    id: crypto.randomUUID(),
                    roomId,
                    type: 'system',
                    message: `${room.participants.find(p => p.id === userId)?.nickname || 'Someone'} left the room`,
                    timestamp: Date.now()
                };
                messageStore.addMessage(roomId, systemMsg);

                // Real-time update for discovery
                io.emit('room_updated', roomStore.getRooms().find(r => r.id === roomId));

                io.to(roomId).emit('receive_message', systemMsg);

                io.to(roomId).emit('user_left', {
                    roomId,
                    userId,
                    participants: updatedRoom.participants
                });
            }

            console.log(`User ${userId} left room ${roomId}`);
        });

        socket.on('send_message', ({ id, roomId, userId, nickname, avatar, message }) => {
            const newMessage = {
                id: id || crypto.randomUUID(),
                roomId,
                userId,
                nickname,
                avatar,
                message,
                timestamp: Date.now()
            };
            messageStore.addMessage(roomId, newMessage);
            io.to(roomId).emit('receive_message', newMessage);
        });

        socket.on('file_uploaded', ({ roomId, file }) => {
            io.to(roomId).emit('new_file', { roomId, file });
        });

        socket.on('send_stroke', ({ roomId, stroke }) => {
            strokeStore.addStroke(roomId, stroke);
            io.to(roomId).emit('receive_stroke', { roomId, stroke });
        });

        socket.on('typing', ({ roomId, userId, nickname, isTyping }) => {
            socket.to(roomId).emit('typing_update', { userId, nickname, isTyping });
        });

        // WebRTC Signaling Relay
        socket.on('webrtc_offer', ({ target, offer }) => {
            console.log(`[WebRTC] Relay OFFER from ${socket.id} to ${target}`);
            io.to(target).emit('webrtc_offer', {
                from: socket.id,
                offer
            });
        });

        socket.on('webrtc_answer', ({ target, answer }) => {
            console.log(`[WebRTC] Relay ANSWER from ${socket.id} to ${target}`);
            io.to(target).emit('webrtc_answer', {
                from: socket.id,
                answer
            });
        });

        socket.on('webrtc_ice_candidate', ({ target, candidate }) => {
            // console.log(`[WebRTC] Relay ICE from ${socket.id} to ${target}`);
            io.to(target).emit('webrtc_ice_candidate', {
                from: socket.id,
                candidate
            });
        });

        socket.on('disconnect', async () => {
            console.log('Client disconnected:', socket.id);

            const device = deviceStore.getDevices().find(d => d.id === socket.id || d.socketId === socket.id);
            if (device) {
                io.emit('device_left', device.id);
            }
            deviceStore.removeDevice(socket.id);

            // Clean up participants and pending requests in rooms
            const rooms = roomStore.getRooms();
            for (const roomInfo of rooms) {
                const room = roomStore.getRoom(roomInfo.id);
                if (!room) continue;

                // If creator disconnects, trigger room closure
                if (room.creatorSocketId === socket.id) {
                    console.log(`[Socket] Creator disconnected from room ${room.id}. Closing room.`);

                    io.to(room.id).emit('room_closed', {
                        message: "Session ended by room creator"
                    });

                    const sockets = await io.in(room.id).fetchSockets();
                    for (const s of sockets) {
                        s.leave(room.id);
                    }

                    strokeStore.clearStrokes(room.id);
                    cleanupRoom(room.id, io, true);
                }
            }

            const affectedRooms = roomStore.removeParticipantBySocket(socket.id);
            affectedRooms.forEach(room => {
                // Real-time update for discovery
                io.emit('room_updated', roomStore.getRooms().find(r => r.id === room.id));

                io.to(room.id).emit('user_left', {
                    roomId: room.id,
                    participants: room.participants
                });
            });
        });
    });
};

module.exports = socketHandler;
