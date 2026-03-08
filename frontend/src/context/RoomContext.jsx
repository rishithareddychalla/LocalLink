import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { createRoomAPI, joinRoomAPI, leaveRoomAPI } from '../services/roomService';
import { getUUID } from '../utils/uuid';
import { useNetworkLog } from './NetworkLogContext';
import {
    getPreferences,
    savePreferences,
    saveRoomMetadata,
    clearRoomMetadata,
    getRoomRegistry,
    saveRoomRegistry
} from '../utils/persistRoomState';
import { generateUniqueRoomId } from '../utils/generateRoomId';
import { useFiles } from './FileContext';
import { useNotifications } from './NotificationContext';
import { useProfile } from './ProfileContext';

import { useWebRTC } from './WebRTCContext';


const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
    const [activeRoom, setActiveRoom] = useState(null);
    const [roomHistory, setRoomHistory] = useState([]);
    const [userRoomPreferences, setUserRoomPreferences] = useState(getPreferences());
    const [participants, setParticipants] = useState([]);
    const [roomMetadata, setRoomMetadataState] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [drawpadStrokes, setDrawpadStrokes] = useState([]);
    const [roomRegistry, setRoomRegistry] = useState(getRoomRegistry());
    const [generatedId, setGeneratedId] = useState('');
    const [roomClosureReason, setRoomClosureReason] = useState(null);
    const [localRoomTheme, setLocalRoomTheme] = useState('#22d3ee');
    const [typingParticipants, setTypingParticipants] = useState({}); // { userId: nickname }
    const [chatMessages, setChatMessages] = useState([]);

    const { sendP2P } = useWebRTC() || {};
    const { addRoomFile, revokeRoomFiles, roomFilesMap } = useFiles();
    const { profile } = useProfile();
    const { addLogEvent } = useNetworkLog();
    const { addNotification } = useNotifications();

    const socketRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        setGeneratedId(generateUniqueRoomId(roomRegistry));
    }, [roomRegistry]);

    // Unified Upsert Helpers
    const upsertMessage = useCallback((message) => {
        setChatMessages(prev => {
            const index = prev.findIndex(m => m.id === message.id);
            if (index !== -1) {
                // Bail out if no change (avoid redundant updates from P2P/Socket duplicates)
                if (prev[index].message === message.message) return prev;

                const next = [...prev];
                next[index] = { ...next[index], ...message };
                return next;
            }
            return [...prev, message];
        });
    }, []);

    const upsertStroke = useCallback((stroke) => {
        setDrawpadStrokes(prev => {
            const index = prev.findIndex(s => s.id === stroke.id);
            if (index !== -1) {
                // Bail out if no change (avoid redundant updates from P2P/Socket duplicates)
                // Using points length as a quick proxy for stroke updates
                if (prev[index].points.length === stroke.points.length && prev[index].type === stroke.type) {
                    return prev;
                }

                const next = [...prev];
                next[index] = { ...stroke, points: [...stroke.points] };
                return next;
            }
            return [...prev, { ...stroke, points: [...stroke.points] }];
        });
    }, []);

    // Listen for P2P Data
    useEffect(() => {
        const handleP2PData = (event) => {
            const { from, data } = event.detail;
            if (data.type === 'chat') {
                upsertMessage(data.payload);
            } else if (data.type === 'whiteboard') {
                upsertStroke(data.payload);
            }
        };

        window.addEventListener('webrtc_data', handleP2PData);
        return () => window.removeEventListener('webrtc_data', handleP2PData);
    }, [upsertMessage, upsertStroke]);

    const sendMessage = useCallback((text) => {
        if (!activeRoom || !text.trim()) return;

        const messageData = {
            id: getUUID(),
            roomId: activeRoom.id,
            userId: profile.id,
            nickname: profile.nickname,
            avatar: profile.avatar,
            message: text,
            timestamp: Date.now(),
            p2p: true
        };

        // Dual-Delivery: Send via P2P for speed AND Socket for history/fallback
        if (sendP2P) sendP2P({ type: 'chat', payload: messageData });

        if (socketRef.current) {
            socketRef.current.emit('send_message', {
                ...messageData,
                p2p: false // Mark as non-P2P when sent to server
            });
        }

        // Local Update
        upsertMessage(messageData);
    }, [activeRoom, profile, sendP2P, upsertMessage]);

    const addStroke = useCallback((stroke) => {
        if (!activeRoom) return;

        // Clone to decouple from active drawing reference
        const strokeClone = { ...stroke, points: [...stroke.points] };

        // Dual-Delivery: P2P (Speed) + Socket (History)
        if (sendP2P) sendP2P({ type: 'whiteboard', payload: strokeClone });

        if (socketRef.current) {
            socketRef.current.emit('send_stroke', {
                roomId: activeRoom.id,
                stroke: strokeClone
            });
        }

        // Local Update
        upsertStroke(strokeClone);
    }, [activeRoom, sendP2P, upsertStroke]);

    const leaveRoom = useCallback(async (reason) => {
        if (!activeRoom) return;

        try {
            if (socketRef.current) {
                // If closing due to server/creator, don't emit leave_room again
                if (reason !== 'server_closed') {
                    socketRef.current.emit('leave_room', {
                        roomId: activeRoom.id,
                        userId: profile.id
                    });
                }

                // Allow time for the emit to reach the server before disconnecting
                setTimeout(() => {
                    if (socketRef.current) {
                        socketRef.current.disconnect();
                    }
                }, 500);
            }

            revokeRoomFiles(activeRoom.id);
            setActiveRoom(null);
            setParticipants([]);
            setChatMessages([]);
            setDrawpadStrokes([]);
            setRoomMetadataState(null);
            setLocalRoomTheme('#22d3ee');
            setTypingParticipants({});
            clearRoomMetadata();
            setTimeLeft(0);

            if (timerRef.current) clearInterval(timerRef.current);
            await leaveRoomAPI(activeRoom.id);
            addLogEvent("Activity", "Room Left", `Left ${activeRoom.name} `);
        } catch (error) {
            console.error('Leave room error:', error);
        }
    }, [activeRoom, profile, revokeRoomFiles, addLogEvent]);

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io(window.location.origin.replace('5173', '5000'), {
                autoConnect: false,
                transports: ['websocket', 'polling']
            });
        }

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('[RoomContext] Socket connected:', socket.id);
            addLogEvent("Network", "Connected", "Real-time bridge established");

            if (profile?.id) {
                socket.emit('identify', {
                    id: profile.id,
                    nickname: profile.nickname,
                    avatar: profile.avatar,
                    status: profile.status
                });

                // Re-join active room on reconnect
                if (activeRoom?.id) {
                    console.log('[RoomContext] Re-joining room on connect:', activeRoom.id);
                    socket.emit('join_room', {
                        roomId: activeRoom.id,
                        user: profile
                    });
                }
            }
        });

        socket.on('disconnect', (reason) => {
            console.log('[RoomContext] Socket disconnected:', reason);
            addLogEvent("Network", "Disconnected", "Real-time bridge lost");

            // Trigger connection lost page if it's an unexpected disconnect
            if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'transport error') {
                window.dispatchEvent(new CustomEvent('llr_network_offline'));
            }
        });

        socket.on('error', (err) => {
            console.error('[RoomContext] Socket Critical Error:', err);
            window.dispatchEvent(new CustomEvent('llr_system_error', {
                detail: {
                    errorCode: 'SOCKET_ERROR',
                    trace: err.message || 'Real-time bridge failure'
                }
            }));
        });

        socket.on('user_joined', ({ participants }) => {
            setParticipants(participants);
        });

        socket.on('user_left', ({ participants }) => {
            setParticipants(participants);
        });

        socket.on('room_messages', (messages) => {
            setChatMessages(messages);
        });

        socket.on('receive_message', (message) => {
            upsertMessage(message);
        });

        socket.on('typing_update', ({ userId, nickname, isTyping }) => {
            setTypingParticipants(prev => {
                const next = { ...prev };
                if (isTyping) {
                    next[userId] = nickname;
                } else {
                    delete next[userId];
                }
                return next;
            });
        });

        socket.on('room_expired', () => {
            setRoomClosureReason("Room session expired");
            leaveRoom('server_closed');
            addLogEvent("Network", "Room Expired", "The current room session has reached its expiry limit.");
        });

        socket.on('room_closed', ({ message }) => {
            setRoomClosureReason(message);
            leaveRoom('server_closed');
            addLogEvent("Network", "Room Closed", message);
        });

        socket.on('room_strokes', (strokes) => {
            setDrawpadStrokes(strokes);
        });

        socket.on('receive_stroke', ({ stroke }) => {
            upsertStroke(stroke);
        });

        socket.on('file_uploaded', (file) => {
            if (activeRoom) {
                addRoomFile(activeRoom.id, file);

                // Add notification for everyone in the room
                addNotification({
                    type: "upload",
                    title: "New File Shared",
                    message: `${file.uploadedBy === profile.id ? 'You' : file.uploadedBy} uploaded ${file.name} `,
                    fileName: file.name,
                    timestamp: Date.now()
                });
            }
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('user_joined');
            socket.off('user_left');
            socket.off('room_messages');
            socket.off('receive_message');
            socket.off('room_expired');
            socket.off('room_closed');
            socket.off('send_stroke');
            socket.off('new_file');
        };
    }, [profile, leaveRoom, addLogEvent, activeRoom, addRoomFile]);

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
        setRoomClosureReason(null);
        const roomId = roomData.id || generatedId;

        try {
            const response = await createRoomAPI({
                id: roomId,
                name: roomData.name,
                isPrivate: roomData.isPrivate,
                password: roomData.password,
                expiry: roomData.expiry,
                creatorSocketId: socketRef.current?.id
            });

            if (response.success) {
                const newRoom = response.data;
                setActiveRoom(newRoom);
                setRoomMetadataState({
                    expiresAt: newRoom.expiresAt
                });
                setParticipants(newRoom.participants || []);

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
        setRoomClosureReason(null);

        try {
            const response = await joinRoomAPI(roomCode, userData);
            if (response.success && response.status === 'joined') {
                const joinedRoom = response.data;
                setActiveRoom(joinedRoom);
                setRoomMetadataState({
                    expiresAt: joinedRoom.expiresAt
                });
                setParticipants(joinedRoom.participants || []);

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


    const refreshGeneratedId = useCallback(() => {
        setGeneratedId(generateUniqueRoomId(roomRegistry));
    }, [roomRegistry]);

    const setTyping = (isTyping) => {
        if (socketRef.current && activeRoom) {
            socketRef.current.emit('typing', {
                roomId: activeRoom.id,
                userId: profile.id,
                nickname: profile.nickname,
                isTyping
            });
        }
    };

    return (
        <RoomContext.Provider value={{
            activeRoom,
            roomHistory,
            userRoomPreferences,
            participants,
            roomMetadata,
            chatMessages,
            roomFiles: activeRoom ? (roomFilesMap[activeRoom.id] || []) : [],
            drawpadStrokes,
            timeLeft,
            generatedId,
            roomRegistry,
            roomClosureReason,
            setRoomClosureReason,
            localRoomTheme,
            setLocalRoomTheme,
            typingParticipants,
            setTyping,
            createRoom,
            joinRoom,
            leaveRoom,
            sendMessage,
            updatePreferences,
            refreshGeneratedId,
            addStroke,
            socketRef,
            profile
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
