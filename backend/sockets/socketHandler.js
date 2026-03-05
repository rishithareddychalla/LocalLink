const { rooms, logs } = require('../store/memoryStore');
const deviceStore = require('../store/deviceStore');

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

        socket.on('identify', (userData) => {
            const deviceData = {
                id: userData.id || socket.id,
                nickname: userData.nickname,
                avatar: userData.avatar,
                ipAddress: ip,
                status: 'online'
            };
            deviceStore.updateDevice(socket.id, deviceData);

            // Broadcast to others on the same subnet (or just everyone for now, filtered by frontend)
            socket.broadcast.emit('device_joined', deviceData);
            console.log(`Device identified: ${userData.nickname} (${ip})`);
        });

        // Update last seen on any event
        socket.use(([event, ...args], next) => {
            deviceStore.updateDevice(socket.id, {});
            next();
        });

        socket.on('join_room', ({ roomId, user }) => {
            const room = rooms.get(roomId);
            if (!room) return;

            socket.join(roomId);

            // Add to participants if not already there
            const isAlreadyIn = room.participants.some(p => p.id === user.id);
            if (!isAlreadyIn) {
                const userData = { ...user, socketId: socket.id };
                room.participants.push(userData);
                addLog(user.id, 'Network', 'Room Joined', `Joined room: ${room.name}`);
            }

            io.to(roomId).emit('user_joined', {
                roomId,
                user: user,
                participants: room.participants
            });

            console.log(`User ${user.nickname} joined room ${roomId}`);
        });

        socket.on('leave_room', ({ roomId, userId }) => {
            const room = rooms.get(roomId);
            if (!room) return;

            socket.leave(roomId);
            room.participants = room.participants.filter(p => p.id !== userId);

            addLog(userId, 'Network', 'Room Left', `Left room: ${room.name}`);

            io.to(roomId).emit('user_left', {
                roomId,
                userId,
                participants: room.participants
            });

            console.log(`User ${userId} left room ${roomId}`);
        });

        socket.on('send_message', ({ roomId, message }) => {
            io.to(roomId).emit('receive_message', message);
        });

        socket.on('join_request', ({ roomId, user }) => {
            io.to(roomId).emit('approval_request', { roomId, user });
        });

        socket.on('join_approved', ({ roomId, userId, approved }) => {
            io.to(roomId).emit('approval_response', { roomId, userId, approved });
        });

        socket.on('file_uploaded', ({ roomId, file }) => {
            io.to(roomId).emit('new_file', { roomId, file });
        });

        socket.on('send_stroke', ({ roomId, stroke }) => {
            io.to(roomId).emit('receive_stroke', { roomId, stroke });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);

            const device = deviceStore.getDevices().find(d => d.id === socket.id || d.socketId === socket.id);
            if (device) {
                io.emit('device_left', device.id);
            }
            deviceStore.removeDevice(socket.id);

            rooms.forEach((room, roomId) => {
                const userToRemove = room.participants.find(p => p.socketId === socket.id);
                if (userToRemove) {
                    room.participants = room.participants.filter(p => p.socketId !== socket.id);
                    io.to(roomId).emit('user_left', {
                        roomId,
                        userId: userToRemove.id,
                        participants: room.participants
                    });
                }
            });
        });
    });
};

module.exports = socketHandler;
