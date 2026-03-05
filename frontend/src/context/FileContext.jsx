import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserFiles, addFileToHistory } from '../utils/filePersistence';
import { scanFileBeforeDownload } from '../utils/securityScan';
import { useNotifications } from './NotificationContext';
import { useNetworkLog } from './NetworkLogContext';
import { apiUpload } from '../services/api';

const FileContext = createContext();

export const FileProvider = ({ children }) => {
    // Room Files: { [roomId]: [fileObject, ...] }
    const [roomFilesMap, setRoomFilesMap] = useState({});

    // User Persistent Files Metadata
    const [userFiles, setUserFiles] = useState(getUserFiles());
    const [blockedFiles, setBlockedFiles] = useState(new Set());
    const { addNotification } = useNotifications();
    const { addLogEvent } = useNetworkLog();

    // Revoke Blob URLs (Legacy, but kept for cleanup)
    const revokeRoomFiles = useCallback((roomId) => {
        setRoomFilesMap(prev => {
            const updated = { ...prev };
            delete updated[roomId];
            return updated;
        });
    }, []);

    const uploadFile = async (roomId, file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('roomId', roomId);

            const response = await apiUpload('/files/upload', formData);
            if (response.success) {
                // The backend returns the file metadata
                // We'll let the socket event 'new_file' handle adding it to the UI for everyone,
                // but we can add it here for immediate feedback if needed.
                addLogEvent("Transfer", "File Uploaded", `Uploaded ${file.name}`);

                // Add to persistent history
                const metadata = {
                    id: response.data.id,
                    name: response.data.fileName,
                    size: response.data.size,
                    type: file.type,
                    uploadedBy: 'me',
                    roomId: roomId,
                    sharedAt: new Date().toISOString()
                };
                addFileToHistory('sharedByMe', metadata);
                setUserFiles(getUserFiles());
            }
            return response;
        } catch (error) {
            console.error('Upload failed:', error);
            addLogEvent("Transfer", "Upload Failed", `Failed to upload ${file.name}`);
            return { success: false, error: error.message };
        }
    };

    const addRoomFile = useCallback((roomId, fileData) => {
        setRoomFilesMap(prev => {
            const currentRoomFiles = prev[roomId] || [];
            // Check for duplicates
            if (currentRoomFiles.some(f => f.id === fileData.id)) return prev;

            return {
                ...prev,
                [roomId]: [fileData, ...currentRoomFiles]
            };
        });
    }, []);

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
            return false; // Prevent download
        }

        const metadata = {
            id: file.id,
            name: file.name || file.fileName,
            size: file.size,
            type: file.type,
            uploadedBy: file.uploadedBy,
            roomId: roomId,
            downloadedAt: new Date().toISOString()
        };
        addFileToHistory('downloaded', metadata);
        setUserFiles(getUserFiles()); // Refresh state
        addLogEvent("Transfer", "File Downloaded", `Downloaded ${metadata.name}`);

        // Open the real download URL from the backend
        window.open(`http://localhost:5000/api/files/download/${file.id}`, '_blank');
        return true;
    }, [addNotification, addLogEvent]);

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
