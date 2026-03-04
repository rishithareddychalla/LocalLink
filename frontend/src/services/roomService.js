/**
 * Mock API service for room-related operations
 * Simulates network latency with Promises
 */

// In-memory store to simulate a server registry for this session
const mockServerStore = new Map();

export const createRoomAPI = async (roomData) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const finalId = roomData.id || `LL-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`;
            const finalRoom = {
                ...roomData,
                id: finalId,
                joinedAt: new Date().toISOString(),
                participants: [],
                pendingRequests: [],
                visibility: roomData.password ? 'private' : 'public',
                passwordHash: roomData.passwordHash || null,
                approvalRequired: roomData.approvalRequired || false,
                creatorId: 'me' // Simulation: caller is always the creator for their own room
            };

            // "Publish" to the mock server store (Requirement 2 & 6)
            mockServerStore.set(finalId, finalRoom);

            resolve({
                success: true,
                data: finalRoom
            });
        }, 800);
    });
};

export const joinRoomAPI = async (roomCode, userData) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const existingRoom = mockServerStore.get(roomCode);
            if (!existingRoom) {
                return resolve({ success: false, error: 'Room not found' });
            }

            // 1. Password Validation (Requirement 2 & 6)
            if (existingRoom.visibility === 'private' && existingRoom.passwordHash) {
                if (userData.passwordHash !== existingRoom.passwordHash) {
                    return resolve({ success: false, error: 'Invalid room password' });
                }
            }

            // 2. Approval Logic (Requirement 2 & 6)
            if (existingRoom.approvalRequired) {
                // Check if already in participants (e.g. reconnecting)
                const isParticipant = (existingRoom.participants || []).some(p => p.id === userData.id);
                if (isParticipant) {
                    return resolve({
                        success: true,
                        status: 'joined',
                        data: {
                            id: roomCode,
                            name: existingRoom.name || 'Active Session',
                            joinedAt: new Date().toISOString(),
                            ...userData
                        }
                    });
                }

                // Add to pending if not already there
                const isPending = (existingRoom.pendingRequests || []).some(r => r.id === userData.id);
                if (!isPending) {
                    existingRoom.pendingRequests = [...(existingRoom.pendingRequests || []), { ...userData, id: userData.id || `u-${Date.now()}` }];
                }

                return resolve({
                    success: true,
                    status: 'pending',
                    message: 'Access request sent to creator'
                });
            }

            // 3. Direct Join (Requirement 2 & 6)
            const newUser = { ...userData, id: userData.id || `u-${Date.now()}` };
            existingRoom.participants = [...(existingRoom.participants || []), newUser];

            resolve({
                success: true,
                status: 'joined',
                data: {
                    id: roomCode,
                    name: existingRoom.name || 'Joined Room',
                    joinedAt: new Date().toISOString(),
                    ...userData
                }
            });
        }, 800);
    });
};

export const getRoomAPI = async (roomId) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const room = mockServerStore.get(roomId);
            if (room) {
                resolve({ success: true, data: room });
            } else {
                resolve({ success: false, error: 'Room not found' });
            }
        }, 300);
    });
};

export const leaveRoomAPI = async (roomId) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true });
        }, 500);
    });
};

export const getMockParticipants = () => {
    return [
        { id: 'p1', name: 'Alex Oniel', avatar: 'Alex', theme: '#2563EB', isActive: true, joinedAt: new Date().toISOString() },
        { id: 'p2', name: 'Sarah', avatar: 'Sarah', theme: '#3B82F6', isActive: true, joinedAt: new Date().toISOString() },
        { id: 'p3', name: 'Jordan', avatar: 'Jordan', theme: '#10B981', isActive: false, joinedAt: new Date().toISOString() }
    ];
};
