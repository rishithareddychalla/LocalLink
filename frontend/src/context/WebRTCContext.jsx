import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import WebRTCPeer from '../utils/webrtcManager';
import { getUUID } from '../utils/uuid';
import { useRoom } from './RoomContext';

const WebRTCContext = createContext();

export const WebRTCProvider = ({ children }) => {
    const { socketRef, activeRoom, participants, profile } = useRoom();
    const [peers, setPeers] = useState({}); // { socketId: status }
    const peerConnections = useRef(new Map()); // { socketId: WebRTCPeer }
    const [p2pEnabled, setP2pEnabled] = useState(false);

    // Incoming P2P Data Handler
    const fileBuffers = useRef(new Map()); // { fileId: { metadata, chunks, receivedSize } }

    const handleP2PMessage = useCallback((fromSocketId, data) => {
        // console.log(`[WebRTC] Received P2P data from ${fromSocketId}:`, data.type);

        if (data.type === 'file_start') {
            const { fileId, metadata } = data.payload;
            fileBuffers.current.set(fileId, {
                metadata,
                chunks: [],
                receivedSize: 0
            });
            console.log(`[WebRTC] Receiving file: ${metadata.name} (${metadata.size} bytes)`);
        } else if (data.type === 'file_chunk') {
            const { fileId, chunk } = data.payload;
            const bufferInfo = fileBuffers.current.get(fileId);
            if (bufferInfo) {
                // Convert base64 back to Uint8Array if sent as string
                const arrayBuffer = typeof chunk === 'string' ? Uint8Array.from(atob(chunk), c => c.charCodeAt(0)) : chunk;
                bufferInfo.chunks.push(arrayBuffer);
                bufferInfo.receivedSize += arrayBuffer.byteLength;

                // Optional: Update progress UI
            }
        } else if (data.type === 'file_end') {
            const { fileId } = data.payload;
            const bufferInfo = fileBuffers.current.get(fileId);
            if (bufferInfo) {
                const { metadata, chunks } = bufferInfo;
                const blob = new Blob(chunks, { type: metadata.type });
                const downloadUrl = URL.createObjectURL(blob);

                const completeFile = {
                    ...metadata,
                    downloadUrl,
                    isP2P: true,
                    blob // Keep blob for easy access
                };

                // Dispatch event
                window.dispatchEvent(new CustomEvent('webrtc_file_complete', {
                    detail: { from: fromSocketId, file: completeFile }
                }));

                fileBuffers.current.delete(fileId);
                console.log(`[WebRTC] File complete: ${metadata.name}`);
            }
        } else {
            // General data (chat, whiteboard)
            const event = new CustomEvent('webrtc_data', {
                detail: { from: fromSocketId, data }
            });
            window.dispatchEvent(event);
        }
    }, []);

    const sendP2P = useCallback((data) => {
        let sentCount = 0;
        peerConnections.current.forEach(peer => {
            if (peer.send(data)) {
                sentCount++;
            }
        });
        return sentCount > 0;
    }, []);

    const sendFile = useCallback(async (file, metadata) => {
        const fileId = metadata.id || getUUID();
        const CHUNK_SIZE = 16384; // 16KB chunks
        const reader = new FileReader();

        // Notify peers of start
        const startMsg = {
            type: 'file_start',
            payload: { fileId, metadata: { ...metadata, id: fileId } }
        };
        sendP2P(startMsg);

        let offset = 0;
        const readSlice = (o) => {
            const slice = file.slice(o, o + CHUNK_SIZE);
            reader.readAsArrayBuffer(slice);
        };

        reader.onload = (e) => {
            const buffer = e.target.result;
            // Send chunk as base64 for JSON compatibility
            const base64Chunk = btoa(
                new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
            );

            sendP2P({
                type: 'file_chunk',
                payload: { fileId, chunk: base64Chunk }
            });

            offset += CHUNK_SIZE;
            if (offset < file.size) {
                readSlice(offset);
            } else {
                // Done
                sendP2P({ type: 'file_end', payload: { fileId } });
                console.log(`[WebRTC] Finished sending file: ${file.name}`);
            }
        };

        readSlice(0);
        return fileId;
    }, [sendP2P]);

    const updatePeerStatus = useCallback((socketId, status) => {
        setPeers(prev => ({ ...prev, [socketId]: status }));
        if (status === 'connected') setP2pEnabled(true);
    }, []);

    const createPeer = useCallback((targetSocketId, isInitiator) => {
        if (peerConnections.current.has(targetSocketId)) return;

        console.log(`[WebRTC] Creating peer for ${targetSocketId}, initiator: ${isInitiator}`);
        const peer = new WebRTCPeer(
            socketRef.current,
            targetSocketId,
            handleP2PMessage,
            (status) => updatePeerStatus(targetSocketId, status)
        );

        peerConnections.current.set(targetSocketId, peer);

        if (isInitiator) {
            peer.createOffer().catch(err => console.error('[WebRTC] Offer error:', err));
        }
    }, [socketRef, handleP2PMessage, updatePeerStatus]);

    // Handle Signaling
    useEffect(() => {
        const socket = socketRef.current;
        if (!socket || !activeRoom) return;

        const onOffer = async ({ from, offer }) => {
            console.log(`[WebRTC] Incoming offer from ${from}`);
            if (!peerConnections.current.has(from)) {
                createPeer(from, false);
            }
            const peer = peerConnections.current.get(from);
            await peer.handleOffer(offer);
        };

        const onAnswer = async ({ from, answer }) => {
            console.log(`[WebRTC] Incoming answer from ${from}`);
            const peer = peerConnections.current.get(from);
            if (peer) await peer.handleAnswer(answer);
        };

        const onCandidate = async ({ from, candidate }) => {
            const peer = peerConnections.current.get(from);
            if (peer) await peer.handleCandidate(candidate);
        };

        socket.on('webrtc_offer', onOffer);
        socket.on('webrtc_answer', onAnswer);
        socket.on('webrtc_ice_candidate', onCandidate);

        return () => {
            socket.off('webrtc_offer', onOffer);
            socket.off('webrtc_answer', onAnswer);
            socket.off('webrtc_ice_candidate', onCandidate);
        };
    }, [socketRef, activeRoom, createPeer]);

    // Manage mesh based on room participants
    useEffect(() => {
        if (!activeRoom || !participants) return;

        const currentParticipantIds = participants
            .filter(p => p.id !== profile?.id && p.socketId)
            .map(p => p.socketId);

        // Remove stale connections
        peerConnections.current.forEach((peer, socketId) => {
            if (!currentParticipantIds.includes(socketId)) {
                console.log(`[WebRTC] Closing peer connection for ${socketId}`);
                peer.close();
                peerConnections.current.delete(socketId);
                setPeers(prev => {
                    const next = { ...prev };
                    delete next[socketId];
                    return next;
                });
            }
        });

        // Initialize new connections
        participants.forEach(participant => {
            if (participant.socketId && participant.id !== profile?.id) {
                if (!peerConnections.current.has(participant.socketId)) {
                    // Rule: Initiator is the one with the "higher" socket ID lexicographically
                    // Wait for both socket IDs to be available
                    if (socketRef.current?.id && participant.socketId) {
                        const isInitiator = socketRef.current.id > participant.socketId;
                        createPeer(participant.socketId, isInitiator);
                    }
                }
            }
        });

    }, [participants, activeRoom, profile, createPeer, socketRef]);

    return (
        <WebRTCContext.Provider value={{ peers, sendP2P, sendFile, p2pEnabled }}>
            {children}
        </WebRTCContext.Provider>
    );
};

export const useWebRTC = () => useContext(WebRTCContext);
