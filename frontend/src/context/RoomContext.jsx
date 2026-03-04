import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { createRoomAPI, joinRoomAPI, leaveRoomAPI, getMockParticipants } from '../services/roomService';
import { hashPassword } from '../utils/hashPassword';
import { NEARBY_ROOMS } from '../data/mockData';
import {
    getPreferences,
    savePreferences,
    saveRoomMetadata,
    getRoomMetadata,
    clearRoomMetadata,
    getRoomFiles,
    saveRoomFiles,
    getDrawpadStrokes,
    saveDrawpadStrokes,
    getRoomRegistry,
    saveRoomRegistry,
    saveRoomParticipants,
    getRoomParticipants,
    savePendingRequests,
    getPendingRequests
} from '../utils/persistRoomState';
import { generateUniqueRoomId } from '../utils/generateRoomId';
import { useFiles } from './FileContext';

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
    const [activeRoom, setActiveRoom] = useState(null);
    const [roomHistory, setRoomHistory] = useState([]);
    const [userRoomPreferences, setUserRoomPreferences] = useState(getPreferences());
    const [participants, setParticipants] = useState([]);
    const [roomMetadata, setRoomMetadataState] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [drawpadStrokes, setDrawpadStrokes] = useState([]);
    const [roomRegistry, setRoomRegistry] = useState(getRoomRegistry());
    const [generatedId, setGeneratedId] = useState('');

    const { addRoomFile, revokeRoomFiles, roomFilesMap } = useFiles();

    const timerRef = useRef(null);
    const simulationRef = useRef(null);
    const drawSimulationRef = useRef(null);

    // Initial load: Clean registry and restore state
    useEffect(() => {
        // Safety Check on Load (Requirement 5)
        const currentRegistry = getRoomRegistry();
        const now = Date.now();
        const cleanedRegistry = {};
        let updated = false;

        Object.keys(currentRegistry).forEach(id => {
            if (new Date(currentRegistry[id].expiresAt).getTime() > now) {
                cleanedRegistry[id] = currentRegistry[id];
            } else {
                updated = true;
            }
        });

        if (updated) {
            saveRoomRegistry(cleanedRegistry);
        }
        setRoomRegistry(cleanedRegistry);

        const savedPrefs = getPreferences();
        setUserRoomPreferences(savedPrefs);

        const savedMetadata = getRoomMetadata();
        if (savedMetadata && !activeRoom) {
            const expiry = new Date(savedMetadata.expiresAt).getTime();
            if (expiry > now) {
                setRoomMetadataState(savedMetadata);
                setActiveRoom({
                    id: savedMetadata.roomId,
                    name: savedMetadata.roomName,
                    joinedAt: savedMetadata.createdAt
                });
            } else {
                clearRoomMetadata();
            }
        }

        // Pre-generate an ID for the UI
        setGeneratedId(generateUniqueRoomId(cleanedRegistry));
    }, []);

    // Load files and strokes when activeRoom changes
    useEffect(() => {
        if (activeRoom) {
            const savedFiles = getRoomFiles(activeRoom.id);
            const savedStrokes = getDrawpadStrokes(activeRoom.id);
            const savedParticipants = getRoomParticipants(activeRoom.id);
            const savedPending = getPendingRequests(activeRoom.id);

            setDrawpadStrokes(savedStrokes);
            setParticipants(savedParticipants && savedParticipants.length > 0 ? savedParticipants : getMockParticipants());
            setPendingRequests(savedPending);
        } else {
            setDrawpadStrokes([]);
            setParticipants([]);
            setPendingRequests([]);
        }
    }, [activeRoom]);

    // Persist changes to participants and pending requests (Requirement 7)
    useEffect(() => {
        if (activeRoom && participants.length > 0) {
            saveRoomParticipants(activeRoom.id, participants);
        }
    }, [activeRoom, participants]);

    useEffect(() => {
        if (activeRoom) {
            savePendingRequests(activeRoom.id, pendingRequests);
        }
    }, [activeRoom, pendingRequests]);

    const addFile = useCallback((fileData) => {
        if (!activeRoom) return;
        setRoomFiles(prev => {
            const updated = [...prev, fileData];
            saveRoomFiles(activeRoom.id, updated);
            return updated;
        });
    }, [activeRoom]);

    const addStroke = useCallback((stroke) => {
        if (!activeRoom) return;
        setDrawpadStrokes(prev => {
            const updated = [...prev, stroke];
            saveDrawpadStrokes(activeRoom.id, updated);
            return updated;
        });
    }, [activeRoom]);

    const leaveRoom = useCallback(async () => {
        if (!activeRoom) return;

        try {
            await leaveRoomAPI(activeRoom.id);

            // Clean up files for this room
            revokeRoomFiles(activeRoom.id);

            setActiveRoom(null);
            setParticipants([]);
            setRoomMetadataState(null);
            clearRoomMetadata();
            setTimeLeft(0);
            setDrawpadStrokes([]);
            setPendingRequests([]);

            if (timerRef.current) clearInterval(timerRef.current);
            if (simulationRef.current) clearInterval(simulationRef.current);
            if (drawSimulationRef.current) clearInterval(drawSimulationRef.current);

            // Generate a fresh ID for the next room
            setGeneratedId(generateUniqueRoomId(roomRegistry));
        } catch (error) {
            console.error('Failed to leave room:', error);
        }
    }, [activeRoom, roomRegistry]);

    // Timer Logic
    useEffect(() => {
        if (activeRoom && roomMetadata?.expiresAt) {
            const expiry = new Date(roomMetadata.expiresAt).getTime();

            const updateTimer = () => {
                const now = new Date().getTime();
                const diff = Math.max(0, Math.floor((expiry - now) / 1000));
                setTimeLeft(diff);

                if (diff <= 0) {
                    // Room Expiry Handling (Requirement 4)
                    setRoomRegistry(prev => {
                        const updated = { ...prev };
                        delete updated[activeRoom.id];
                        saveRoomRegistry(updated);
                        return updated;
                    });
                    setPendingRequests([]);
                    leaveRoom();
                }
            };

            updateTimer();
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(updateTimer, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [activeRoom, roomMetadata, leaveRoom]);

    // Activity Simulation & Presence & Auto-File Simulation
    useEffect(() => {
        if (activeRoom) {
            // Initialize participants
            const mockParticipants = getMockParticipants();
            const currentUser = {
                id: 'me',
                name: userRoomPreferences.nickname || 'Me',
                avatar: 'Me',
                theme: userRoomPreferences.selectedTheme,
                isActive: true,
                joinedAt: new Date().toISOString(),
                lastSeen: new Date().toISOString()
            };

            setParticipants([currentUser, ...mockParticipants]);

            // Simulation: every 5s toggle mock users & occasionally "upload" a file
            simulationRef.current = setInterval(() => {
                setParticipants(prev => prev.map(p => {
                    if (p.id === 'me') return p;
                    return {
                        ...p,
                        isActive: Math.random() > 0.3,
                        lastSeen: new Date().toISOString()
                    };
                }));

                // 5% chance of mock user "uploading" a file every 5s
                if (Math.random() < 0.05) {
                    const randomUser = mockParticipants[Math.floor(Math.random() * mockParticipants.length)];
                    const mockFile = {
                        id: `mock-${Date.now()}`,
                        name: `Shared_${Math.floor(Math.random() * 1000)}.pdf`,
                        size: Math.floor(Math.random() * 5000000),
                        type: 'application/pdf',
                        uploadedBy: randomUser.name,
                        uploadedAt: new Date().toISOString(),
                        isSafe: true,
                        downloadUrl: '#' // Simulated
                    };
                    addRoomFile(activeRoom.id, mockFile);
                }
            }, 5000); // 5 seconds as requested (simulating real-time)

            // Visibility Change
            const handleVisibility = () => {
                const isVisible = document.visibilityState === 'visible';
                setParticipants(prev => prev.map(p =>
                    p.id === 'me' ? { ...p, isActive: isVisible } : p
                ));
            };

            document.addEventListener('visibilitychange', handleVisibility);

            // Drawpad Multi-user Simulation
            drawSimulationRef.current = setInterval(() => {
                if (Math.random() < 0.3) { // 30% chance every 8s
                    const mockUsers = mockParticipants;
                    const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];

                    // Generate random mock stroke
                    const startX = Math.random() * 500;
                    const startY = Math.random() * 300;
                    const points = [
                        { x: startX, y: startY },
                        { x: startX + Math.random() * 50, y: startY + Math.random() * 50 },
                        { x: startX + Math.random() * 100, y: startY + Math.random() * 100 }
                    ];

                    const mockStroke = {
                        id: `stroke-${Date.now()}`,
                        userId: randomUser.id,
                        points,
                        color: randomUser.theme || '#3B82F6',
                        size: 2
                    };
                    addStroke(mockStroke);
                }
            }, 8000); // 8 seconds as requested

            return () => {
                if (simulationRef.current) clearInterval(simulationRef.current);
                if (drawSimulationRef.current) clearInterval(drawSimulationRef.current);
                document.removeEventListener('visibilitychange', handleVisibility);
            };
        }
    }, [activeRoom, userRoomPreferences, addFile, addStroke]);

    const createRoom = async (roomData) => {
        if (activeRoom) await leaveRoom();

        try {
            // Use the ID that was shown in the UI (Requirement 3 & 6)
            const roomId = generatedId || generateUniqueRoomId(roomRegistry);

            const parseDuration = (dur) => {
                const unit = dur.includes('min') ? 'min' : 'hr';
                const amount = parseInt(dur) || 1;
                return unit === 'min' ? amount * 60 * 1000 : amount * 60 * 60 * 1000;
            };

            const passwordHash = roomData.password ? hashPassword(roomData.password) : null;
            const visibility = roomData.password ? 'private' : 'public';

            const response = await createRoomAPI({
                ...roomData,
                id: roomId,
                passwordHash,
                visibility,
                approvalRequired: roomData.approvalRequired || false
            });
            if (response.success) {
                const newRoom = response.data;
                const durationMs = parseDuration(roomData.expiry || '1hr');
                const expiresAt = new Date(new Date().getTime() + durationMs).toISOString();

                const metadata = {
                    roomId: newRoom.id,
                    roomName: newRoom.name,
                    createdAt: new Date().toISOString(),
                    expiresAt,
                    duration: roomData.expiry,
                    visibility,
                    approvalRequired: roomData.approvalRequired || false
                };

                // Save to registry (Requirement 2 & 6)
                setRoomRegistry(prev => {
                    const updated = {
                        ...prev,
                        [newRoom.id]: {
                            expiresAt,
                            roomName: newRoom.name,
                            visibility,
                            approvalRequired: roomData.approvalRequired || false
                        }
                    };
                    saveRoomRegistry(updated);
                    return updated;
                });

                setActiveRoom(newRoom);
                setRoomMetadataState(metadata);
                saveRoomMetadata(metadata);
                setRoomHistory(prev => [newRoom, ...prev.filter(r => r.id !== newRoom.id)]);

                const updatedPrefs = {
                    ...userRoomPreferences,
                    lastExpirySelected: roomData.expiry || '1hr'
                };
                setUserRoomPreferences(updatedPrefs);
                savePreferences(updatedPrefs);

                // Refresh the generated ID for next time (in case user leaves)
                setGeneratedId(generateUniqueRoomId(roomRegistry));
            }
            return response;
        } catch (error) {
            console.error('Create room error:', error);
            return { success: false, error };
        }
    };

    const joinRoom = async (roomCode, userData = {}) => {
        if (activeRoom) await leaveRoom();

        try {
            // Find room name from registry or nearby rooms (Requirement 2 & 6)
            const nearbyRoom = NEARBY_ROOMS.find(r => r.id === roomCode);
            const registryRoom = roomRegistry[roomCode];
            const roomName = nearbyRoom?.name || registryRoom?.roomName || userData.roomName || `Session ${roomCode.split('-')[1] || roomCode}`;

            const passwordHash = userData.password ? hashPassword(userData.password) : null;
            const response = await joinRoomAPI(roomCode, { ...userData, roomName, passwordHash });
            if (response.success) {
                const joinedRoom = response.data;

                // If the room is in our registry, use its expiry, otherwise default to 1hr
                let expiresAt = roomRegistry[roomCode]?.expiresAt;
                if (!expiresAt) {
                    const durationMs = 1 * 60 * 60 * 1000; // Default 1hr
                    expiresAt = new Date(new Date().getTime() + durationMs).toISOString();
                }

                const metadata = {
                    roomId: joinedRoom.id,
                    roomName: joinedRoom.name,
                    createdAt: new Date().toISOString(),
                    expiresAt,
                    duration: '1hr'
                };

                setActiveRoom(joinedRoom);
                setRoomMetadataState(metadata);
                saveRoomMetadata(metadata);
                setRoomHistory(prev => [joinedRoom, ...prev.filter(r => r.id !== joinedRoom.id)]);

                const updatedPrefs = {
                    ...userRoomPreferences,
                    nickname: userData.nickname || userRoomPreferences.nickname,
                    selectedTheme: userData.theme || userRoomPreferences.selectedTheme,
                    lastUsedRoomCode: roomCode
                };
                setUserRoomPreferences(updatedPrefs);
                savePreferences(updatedPrefs);
            } else if (response.status === 'pending') {
                // Potential for a notification or state update
                console.log('Room Join Status:', response.message);
            }
            return response;
        } catch (error) {
            console.error('Join room error:', error);
            return { success: false, error };
        }
    };

    const updatePreferences = (newPrefs) => {
        const updated = { ...userRoomPreferences, ...newPrefs };
        setUserRoomPreferences(updated);
        savePreferences(updated);
    };

    const approveJoinRequest = useCallback((userId) => {
        // Logic to move from pending to participants (Requirement 3 & 4)
        setPendingRequests(prev => {
            const request = prev.find(r => r.id === userId);
            if (request) {
                setParticipants(participantsPrev => [...participantsPrev, { ...request, isActive: true, lastSeen: new Date().toISOString() }]);
            }
            return prev.filter(r => r.id !== userId);
        });
    }, []);

    const rejectJoinRequest = useCallback((userId) => {
        // Logic to remove from pending (Requirement 3 & 4)
        setPendingRequests(prev => prev.filter(r => r.id !== userId));
    }, []);

    const refreshGeneratedId = useCallback(() => {
        setGeneratedId(generateUniqueRoomId(roomRegistry));
    }, [roomRegistry]);

    return (
        <RoomContext.Provider value={{
            activeRoom,
            roomHistory,
            userRoomPreferences,
            participants,
            roomMetadata,
            viewingFile: null,
            roomFiles: activeRoom ? (roomFilesMap[activeRoom.id] || []) : [],
            drawpadStrokes,
            timeLeft,
            generatedId,
            roomRegistry,
            NEARBY_ROOMS,
            createRoom,
            joinRoom,
            leaveRoom,
            updatePreferences,
            addFile: (fileData) => activeRoom && addRoomFile(activeRoom.id, fileData, fileData.uploadedBy === (userRoomPreferences.nickname || 'GuestUser_82')),
            addStroke,
            approveJoinRequest,
            rejectJoinRequest,
            pendingRequests,
            refreshGeneratedId
        }}>
            {children}
        </RoomContext.Provider>
    );
};

export const useRoom = () => {
    const context = useContext(RoomContext);
    if (!context) {
        throw new Error('useRoom must be used within a RoomProvider');
    }
    return context;
};
