import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { createRoomAPI, joinRoomAPI, leaveRoomAPI } from '../services/roomService';
import { useProfile } from './ProfileContext';
import { useNetworkLog } from './NetworkLogContext';
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

    const socketRef = useRef(null);
    const timerRef = useRef(null);

    const { profile } = useProfile();
    const { addLogEvent } = useNetworkLog();

    const [chatMessages, setChatMessages] = useState([]);
    const [joinRequestStatus, setJoinRequestStatus] = useState('idle'); // 'idle', 'pending', 'approved', 'rejected'

    const sendMessage = useCallback((text) => {
        if (!activeRoom || !text.trim()) return;

        const messageData = {
            id: `msg-${Date.now()}`,
            user: profile.nickname,
            userId: profile.id,
            message: text,
            timestamp: new Date().toISOString()
        };

        if (socketRef.current) {
            socketRef.current.emit('send_message', {
                roomId: activeRoom.id,
                message: messageData
            });
        }
    }, [activeRoom, profile]);

    const leaveRoom = useCallback(async () => {
        if (!activeRoom) return;

        try {
            if (socketRef.current) {
                socketRef.current.emit('leave_room', {
                    roomId: activeRoom.id,
                    userId: profile.id
                });
                socketRef.current.disconnect();
            }

            revokeRoomFiles(activeRoom.id);
            setActiveRoom(null);
            setParticipants([]);
            setChatMessages([]);
            setDrawpadStrokes([]);
            setRoomMetadataState(null);
            setJoinRequestStatus('idle');
            clearRoomMetadata();
            setTimeLeft(0);

            if (timerRef.current) clearInterval(timerRef.current);
            setGeneratedId(generateUniqueRoomId(roomRegistry));

            addLogEvent("Activity", "Room Left", `Left ${activeRoom.name}`);
        } catch (error) {
            console.error('Failed to leave room:', error);
        }
    }, [activeRoom, profile.id, roomRegistry, addLogEvent, revokeRoomFiles]);

    // Socket Initialization
    useEffect(() => {
        socketRef.current = io(`http://${window.location.hostname}:5000`, {
            autoConnect: false,
            reconnectionAttempts: 5
        });
        socketRef.current.on('connect', () => {
            console.log('Connected to signaling server');
            if (profile.id) {
                socketRef.current.emit('identify', {
                    id: profile.id,
                    nickname: profile.nickname,
                    avatar: profile.avatar,
                    status: profile.status
                });
            }
        });

        socketRef.current.on('device_joined', (device) => {
            console.log('New device discovered:', device.nickname);
            // Optionally add a notification here
        });

        socketRef.current.on('device_left', (deviceId) => {
            console.log('Device left:', deviceId);
        });

        socketRef.current.on('user_joined', ({ participants }) => {
            setParticipants(participants);
        });

        socketRef.current.on('user_left', ({ participants }) => {
            setParticipants(participants);
        });

        socketRef.current.on('receive_message', (message) => {
            setChatMessages(prev => [...prev, message]);
        });

        socketRef.current.on('approval_request', ({ user }) => {
            setPendingRequests(prev => {
                if (prev.some(p => p.id === user.id)) return prev;
                return [...prev, user];
            });
        });

        socketRef.current.on('approval_response', ({ roomId, userId, approved }) => {
            if (profile.id === userId) {
                if (approved) {
                    setJoinRequestStatus('approved');
                    addLogEvent("Network", "Access Granted", "Your request to join has been approved.");
                } else {
                    setJoinRequestStatus('rejected');
                    addLogEvent("Network", "Access Denied", "Your request to join was rejected.");
                }
            }
        });

        socketRef.current.on('room_expired', () => {
            leaveRoom();
            addLogEvent("Network", "Room Expired", "The current room session has reached its expiry limit.");
        });

        socketRef.current.on('receive_stroke', ({ stroke }) => {
            setDrawpadStrokes(prev => [...prev, stroke]);
        });

        socketRef.current.on('new_file', ({ file }) => {
            if (activeRoom) {
                addRoomFile(activeRoom.id, file);
            }
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [addRoomFile, addLogEvent, activeRoom, profile.id, leaveRoom]);

    // Timer Logic
    useEffect(() => {
        if (activeRoom && roomMetadata?.expiresAt) {
            const expiry = new Date(roomMetadata.expiresAt).getTime();

            const updateTimer = () => {
                const now = new Date().getTime();
                const diff = Math.max(0, Math.floor((expiry - now) / 1000));
                setTimeLeft(diff);

                if (diff <= 0) {
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

    const createRoom = async (roomData) => {
        if (activeRoom) await leaveRoom();

        try {
            const roomId = generatedId || generateUniqueRoomId(roomRegistry);
            const response = await createRoomAPI({
                ...roomData,
                id: roomId,
                creatorId: profile.id
            });

            if (response.success) {
                const newRoom = response.data;
                const expiresAt = newRoom.expiresAt;

                const metadata = {
                    roomId: newRoom.id,
                    roomName: newRoom.name,
                    createdAt: newRoom.createdAt,
                    expiresAt,
                    duration: roomData.expiry,
                };

                setActiveRoom(newRoom);
                setRoomMetadataState(metadata);
                saveRoomMetadata(metadata);

                if (socketRef.current) {
                    socketRef.current.connect();
                    socketRef.current.emit('identify', {
                        id: profile.id,
                        nickname: profile.nickname,
                        avatar: profile.avatar,
                        status: profile.status
                    });
                    socketRef.current.emit('join_room', {
                        roomId: newRoom.id,
                        user: profile
                    });
                }

                addLogEvent("Activity", "Room Created", `Created ${newRoom.name} (${roomId})`);
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
            const response = await joinRoomAPI(roomCode, userData);
            if (response.success && response.status === 'joined') {
                const joinedRoom = response.data;

                setActiveRoom(joinedRoom);
                setRoomMetadataState({
                    roomId: joinedRoom.id,
                    roomName: joinedRoom.name,
                    expiresAt: joinedRoom.expiresAt
                });

                if (socketRef.current) {
                    socketRef.current.connect();
                    socketRef.current.emit('identify', {
                        id: profile.id,
                        nickname: profile.nickname,
                        avatar: profile.avatar,
                        status: profile.status
                    });
                    socketRef.current.emit('join_room', {
                        roomId: joinedRoom.id,
                        user: profile
                    });
                }

                addLogEvent("Activity", "Room Joined", `Joined ${joinedRoom.name} (${roomCode})`);
                setJoinRequestStatus('idle');
            } else if (response.status === 'pending') {
                setJoinRequestStatus('pending');
                if (socketRef.current) {
                    socketRef.current.connect();
                    socketRef.current.emit('join_room', {
                        roomId: roomCode,
                        user: profile,
                        status: 'pending'
                    });
                }
                addLogEvent("Activity", "Request Sent", `Join request sent for room ${roomCode}`);
            }
            return response;
        } catch (error) {
            console.error('Join room error:', error);
            setJoinRequestStatus('idle');
            return { success: false, error };
        }
    };

    const updatePreferences = (newPrefs) => {
        const updated = { ...userRoomPreferences, ...newPrefs };
        setUserRoomPreferences(updated);
        savePreferences(updated);
    };

    const approveJoinRequest = useCallback((userId) => {
        if (socketRef.current && activeRoom) {
            socketRef.current.emit('join_approved', {
                roomId: activeRoom.id,
                userId,
                approved: true
            });
            setPendingRequests(prev => prev.filter(r => r.id !== userId));
            addLogEvent("Activity", "Request Approved", `Approved user ${userId}`);
        }
    }, [activeRoom]);

    const rejectJoinRequest = useCallback((userId) => {
        if (socketRef.current && activeRoom) {
            socketRef.current.emit('join_approved', {
                roomId: activeRoom.id,
                userId,
                approved: false
            });
            setPendingRequests(prev => prev.filter(r => r.id !== userId));
            addLogEvent("Activity", "Request Rejected", `Rejected user ${userId}`);
        }
    }, [activeRoom]);

    const addStroke = useCallback((stroke) => {
        if (!activeRoom) return;

        setDrawpadStrokes(prev => [...prev, stroke]);

        if (socketRef.current) {
            socketRef.current.emit('send_stroke', {
                roomId: activeRoom.id,
                stroke
            });
        }
    }, [activeRoom]);

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
            chatMessages,
            joinRequestStatus,
            roomFiles: activeRoom ? (roomFilesMap[activeRoom.id] || []) : [],
            drawpadStrokes,
            timeLeft,
            generatedId,
            roomRegistry,
            NEARBY_ROOMS,
            createRoom,
            joinRoom,
            leaveRoom,
            sendMessage,
            updatePreferences,
            approveJoinRequest,
            rejectJoinRequest,
            pendingRequests,
            refreshGeneratedId,
            setJoinRequestStatus,
            addStroke
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
