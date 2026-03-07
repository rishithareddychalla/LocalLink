import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { createRoomAPI, joinRoomAPI, leaveRoomAPI } from '../services/roomService';
import { useProfile } from './ProfileContext';
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
    const [roomAccentColor, setRoomAccentColor] = useState('#22d3ee');
    const [typingParticipants, setTypingParticipants] = useState({}); // { userId: nickname }

    useEffect(() => {
        setGeneratedId(generateUniqueRoomId(roomRegistry));
    }, [roomRegistry]);

    const { addRoomFile, revokeRoomFiles, roomFilesMap } = useFiles();

    const socketRef = useRef(null);
    const timerRef = useRef(null);

    const { profile } = useProfile();
    const { addLogEvent } = useNetworkLog();
    const { addNotification } = useNotifications();

    const [chatMessages, setChatMessages] = useState([]);

    const sendMessage = useCallback((text) => {
        if (!activeRoom || !text.trim()) return;

        const messageData = {
            roomId: activeRoom.id,
            userId: profile.id,
            nickname: profile.nickname,
            avatar: profile.avatar,
            message: text
        };

        if (socketRef.current) {
            socketRef.current.emit('send_message', {
                roomId: activeRoom.id,
                userId: profile.id,
                nickname: profile.nickname,
                avatar: profile.avatar,
                message: text
            });
        }
    }, [activeRoom, profile]);

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
            setRoomAccentColor('#22d3ee');
            setTypingParticipants({});
            clearRoomMetadata();
            setTimeLeft(0);

            if (timerRef.current) clearInterval(timerRef.current);
            await leaveRoomAPI(activeRoom.id);
            addLogEvent("Activity", "Room Left", `Left ${activeRoom.name}`);
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

        socket.on('disconnect', () => {
            console.log('[RoomContext] Socket disconnected');
            addLogEvent("Network", "Disconnected", "Real-time bridge lost");
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
            setChatMessages(prev => [...prev, message]);
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

        socket.on('receive_stroke', ({ stroke }) => {
            setDrawpadStrokes(prev => [...prev, stroke]);
        });

        socket.on('file_uploaded', (file) => {
            if (activeRoom) {
                addRoomFile(activeRoom.id, file);

                // Add notification for everyone in the room
                addNotification({
                    type: "upload",
                    title: "New File Shared",
                    message: `${file.uploadedBy === profile.id ? 'You' : file.uploadedBy} uploaded ${file.name}`,
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
                accentColor: roomData.accentColor,
                creatorSocketId: socketRef.current?.id
            });

            if (response.success) {
                const newRoom = response.data;
                setActiveRoom(newRoom);
                setRoomMetadataState({
                    expiresAt: newRoom.expiresAt
                });
                setRoomAccentColor(newRoom.accentColor || '#22d3ee');
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
                setRoomAccentColor(joinedRoom.accentColor || '#22d3ee');
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
            roomAccentColor,
            typingParticipants,
            setRoomClosureReason,
            setTyping,
            createRoom,
            joinRoom,
            leaveRoom,
            sendMessage,
            updatePreferences,
            refreshGeneratedId,
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
