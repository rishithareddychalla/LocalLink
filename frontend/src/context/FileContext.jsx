import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getUserFiles, addFileToHistory } from '../utils/filePersistence';
import { scanFileBeforeDownload } from '../utils/securityScan';
import { getUUID } from '../utils/uuid';
import { useNotifications } from './NotificationContext';
import { useNetworkLog } from './NetworkLogContext';
import { useProfile } from './ProfileContext';
import { SessionContext } from './SessionContext';
import { apiUpload } from '../services/api';

import { useWebRTC } from './WebRTCContext';


const FileContext = createContext();

export const FileProvider = ({ children }) => {
    // Room Files: { [roomId]: [fileObject, ...] }
    const [roomFilesMap, setRoomFilesMap] = useState({});
    const [userFiles, setUserFiles] = useState(getUserFiles());
    const [blockedFiles, setBlockedFiles] = useState(new Set());

    const { sendFile, p2pEnabled } = useWebRTC() || {};
    const { addNotification } = useNotifications();
    const { addLogEvent } = useNetworkLog();
    const { profile } = useProfile();
    const { token } = useContext(SessionContext);

    const addRoomFile = useCallback((roomId, fileData) => {
        setRoomFilesMap(prev => {
            const currentRoomFiles = prev[roomId] || [];
            if (currentRoomFiles.some(f => f.id === fileData.id)) return prev;

            // Ensure downloadUrl is present for the UI
            const apiBase = window.location.origin.replace('5173', '5000');
            const downloadUrl = fileData.downloadUrl || `${apiBase}/api/files/download/${fileData.id}`;
            const fileWithUrl = {
                ...fileData,
                downloadUrl: token ? `${downloadUrl}?token=${token}` : downloadUrl
            };

            return {
                ...prev,
                [roomId]: [fileWithUrl, ...currentRoomFiles]
            };
        });
    }, [token]);

    const revokeRoomFiles = useCallback((roomId) => {
        setRoomFilesMap(prev => {
            const updated = { ...prev };
            delete updated[roomId];
            return updated;
        });
    }, []);

    // ... useEffect for P2P File Completion ...
    useEffect(() => {
        const handleP2PFile = (event) => {
            const { from, file } = event.detail;
            console.log(`[FileContext] Received P2P file from ${from}:`, file.name);

            // Add to room files map (needs roomId)
            if (file.roomId) {
                addRoomFile(file.roomId, file);

                addNotification({
                    type: "download",
                    title: "File Received (P2P)",
                    message: `Received ${file.name} directly from a peer.`,
                    fileName: file.name,
                    timestamp: Date.now()
                });
            }
        };

        window.addEventListener('webrtc_file_complete', handleP2PFile);
        return () => window.removeEventListener('webrtc_file_complete', handleP2PFile);
    }, [addRoomFile, addNotification]);

    const uploadFile = async (roomId, file) => {
        const metadata = {
            id: getUUID(),
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedBy: profile.id,
            roomId: roomId,
            sharedAt: new Date().toISOString(),
            isP2P: p2pEnabled
        };

        if (p2pEnabled && sendFile) {
            console.log(`[FileContext] Starting P2P upload for ${file.name}`);
            try {
                await sendFile(file, metadata);
                addLogEvent("Transfer", "File Shared (P2P)", `Shared ${file.name} via WebRTC`);

                // Add to local UI immediately
                addRoomFile(roomId, metadata);

                // Add to persistent history
                addFileToHistory('sharedByMe', metadata);
                setUserFiles(getUserFiles());

                return { success: true, data: metadata };
            } catch (err) {
                console.error('[FileContext] P2P Upload failed, falling back to API', err);
            }
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('roomId', roomId);
            formData.append('userId', profile.id);

            const response = await apiUpload('/files/upload', formData);
            if (response.success) {
                addLogEvent("Transfer", "File Uploaded", `Uploaded ${file.name}`);

                const sharedMetadata = {
                    ...metadata,
                    id: response.data.id,
                    isP2P: false
                };

                addFileToHistory('sharedByMe', sharedMetadata);
                setUserFiles(getUserFiles());
            }
            return response;
        } catch (error) {
            console.error('Upload failed:', error);
            addLogEvent("Transfer", "Upload Failed", `Failed to upload ${file.name}`);
            return { success: false, error: error.message };
        }
    };


    const trackDownload = useCallback((roomId, file) => {
        // Security Scan before allowing download
        const scanResult = scanFileBeforeDownload(file);

        if (!scanResult.safe) {
            setBlockedFiles(prev => new Set(prev).add(file.id));
            addNotification({
                type: "threat",
                title: "Download Blocked",
                message: scanResult.reason,
                fileName: file.name,
                timestamp: Date.now()
            });
            addLogEvent("Security", "Threat Blocked", `Blocked ${file.name} - ${scanResult.reason}`);
            return false;
        }

        const metadata = {
            id: file.id,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedBy: file.uploadedBy,
            roomId: roomId,
            downloadedAt: new Date().toISOString()
        };
        addFileToHistory('downloaded', metadata);
        setUserFiles(getUserFiles());
        addLogEvent("Transfer", "File Downloaded", `Downloaded ${metadata.name}`);

        addNotification({
            type: "download",
            title: "File Downloaded",
            message: `You downloaded ${metadata.name}`,
            fileName: metadata.name,
            timestamp: Date.now()
        });

        // Open the real download URL from the backend using a hidden anchor tag
        const apiBase = window.location.origin.replace('5173', '5000');
        const downloadUrl = `${apiBase}/api/files/download/${file.id}`;
        const finalUrl = token ? `${downloadUrl}?token=${token}` : downloadUrl;

        const link = document.createElement('a');
        link.href = finalUrl;
        link.setAttribute('download', file.name); // Suggest the filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return true;
    }, [addNotification, addLogEvent, token]);

    return (
        <FileContext.Provider value={{
            roomFilesMap,
            userFiles,
            addRoomFile,
            uploadFile,
            trackDownload,
            revokeRoomFiles,
            blockedFiles,
            isBlocked: (fileId) => blockedFiles.has(fileId)
        }}>
            {children}
        </FileContext.Provider>
    );
};

export const useFiles = () => {
    const context = useContext(FileContext);
    if (!context) {
        throw new Error('useFiles must be used within a FileProvider');
    }
    return context;
};
