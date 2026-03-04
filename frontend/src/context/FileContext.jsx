import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserFiles, addFileToHistory } from '../utils/filePersistence';
import { scanFileBeforeDownload } from '../utils/securityScan';
import { useNotifications } from './NotificationContext';

const FileContext = createContext();

export const FileProvider = ({ children }) => {
    // Room Files: { [roomId]: [fileObject, ...] }
    const [roomFilesMap, setRoomFilesMap] = useState({});

    // User Persistent Files Metadata
    const [userFiles, setUserFiles] = useState(getUserFiles());
    const [blockedFiles, setBlockedFiles] = useState(new Set());
    const { addNotification } = useNotifications();

    // Revoke Blob URLs for a specific room
    const revokeRoomFiles = useCallback((roomId) => {
        const files = roomFilesMap[roomId] || [];
        files.forEach(file => {
            if (file.blobUrl) {
                URL.revokeObjectURL(file.blobUrl);
            }
        });

        setRoomFilesMap(prev => {
            const updated = { ...prev };
            delete updated[roomId];
            return updated;
        });
    }, [roomFilesMap]);

    const addRoomFile = useCallback((roomId, fileData, persistToHistory = false) => {
        setRoomFilesMap(prev => {
            const currentRoomFiles = prev[roomId] || [];
            return {
                ...prev,
                [roomId]: [fileData, ...currentRoomFiles]
            };
        });

        if (persistToHistory) {
            const metadata = {
                id: fileData.id,
                name: fileData.name,
                size: fileData.size,
                type: fileData.type,
                uploadedBy: fileData.uploadedBy,
                roomId: roomId,
                sharedAt: new Date().toISOString()
            };
            addFileToHistory('sharedByMe', metadata);
            setUserFiles(getUserFiles()); // Refresh state
        }
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
            return false; // Prevent download
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
        setUserFiles(getUserFiles()); // Refresh state
    }, []);

    return (
        <FileContext.Provider value={{
            roomFilesMap,
            userFiles,
            addRoomFile,
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
