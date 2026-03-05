import { apiRequest } from './api';

export const createRoomAPI = async (roomData) => {
    try {
        const response = await apiRequest('/rooms/create', {
            method: 'POST',
            body: JSON.stringify(roomData)
        });
        return response;
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const joinRoomAPI = async (roomId, userData) => {
    try {
        const response = await apiRequest('/rooms/join', {
            method: 'POST',
            body: JSON.stringify({ roomId, password: userData.password })
        });
        return response;
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getRoomAPI = async (roomId) => {
    try {
        // We'll use the rooms Map on backend directly via sockets mostly, 
        // but keeping this for potential direct fetch
        const response = await apiRequest(`/rooms/${roomId}`);
        return response;
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const leaveRoomAPI = async (roomId) => {
    // Usually handled via socket disconnect or explicit event, 
    // but we can have an endpoint too.
    return { success: true };
};

export const getMockParticipants = () => {
    return [
        { id: 'p1', name: 'Alex Oniel', avatar: 'Alex', theme: '#2563EB', isActive: true, joinedAt: new Date().toISOString() },
        { id: 'p2', name: 'Sarah', avatar: 'Sarah', theme: '#3B82F6', isActive: true, joinedAt: new Date().toISOString() },
        { id: 'p3', name: 'Jordan', avatar: 'Jordan', theme: '#10B981', isActive: false, joinedAt: new Date().toISOString() }
    ];
};
