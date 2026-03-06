const { rooms: roomsMap } = require('./memoryStore');

/**
 * In-memory room store to manage LAN-wide room discovery.
 */
class RoomStore {
    constructor() {
        this.rooms = roomsMap; // Re-use the existing map from memoryStore
    }

    createRoom(roomData) {
        const room = {
            id: roomData.id,
            name: roomData.name,
            creatorId: roomData.creatorId,
            creatorName: roomData.creatorName || 'Anonymous',
            creatorSocketId: roomData.creatorSocketId,
            isPrivate: roomData.isPrivate || false,
            password: roomData.password || null,
            participants: [],
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + (roomData.expiryTime || 30) * 60000)
        };
        this.rooms.set(room.id, room);
        return room;
    }

    getRooms() {
        return Array.from(this.rooms.values()).map(room => {
            const visibility = room.isPrivate ? 'private' : 'public';
            return {
                id: room.id,
                name: room.name,
                creatorId: room.creatorId,
                creatorName: room.creatorName,
                isPrivate: room.isPrivate,
                visibility: visibility,
                type: visibility,
                connectedCount: room.participants.length,
                members: room.participants.length, // For Nearby Discovery card
                ping: '< 1ms', // LAN latency
                participants: room.participants.slice(0, 3).map(p => ({
                    id: p.id,
                    name: p.nickname,
                    avatar: p.avatar
                })),
                createdAt: room.createdAt,
                expiresAt: room.expiresAt
            };
        });
    }

    getRoom(roomId) {
        return this.rooms.get(roomId);
    }

    addParticipant(roomId, user) {
        const room = this.rooms.get(roomId);
        if (!room) return null;

        const alreadyIn = room.participants.some(p => p.id === user.id);
        if (!alreadyIn) {
            room.participants.push(user);
        }
        return room;
    }

    removeParticipant(roomId, userId) {
        const room = this.rooms.get(roomId);
        if (!room) return null;

        room.participants = room.participants.filter(p => p.id !== userId);
        return room;
    }

    removeParticipantBySocket(socketId) {
        const affectedRooms = [];
        this.rooms.forEach((room, roomId) => {
            const hasParticipant = room.participants.some(p => p.socketId === socketId);
            if (hasParticipant) {
                room.participants = room.participants.filter(p => p.socketId !== socketId);
                affectedRooms.push(room);
            }
        });
        return affectedRooms;
    }

    removeRoom(roomId) {
        const room = this.rooms.get(roomId);
        // Clean up timeout if exists (stored cautiously in controller but managed here)
        return this.rooms.delete(roomId);
    }
}

module.exports = new RoomStore();
