import { useState, useCallback } from 'react';
import { useRoom } from '../context/RoomContext';
import { useFiles } from '../context/FileContext';

export const useRoomFiles = () => {
    const { activeRoom, userRoomPreferences } = useRoom();
    const { addRoomFile, roomFilesMap } = useFiles();
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(null);

    const roomFiles = activeRoom ? (roomFilesMap[activeRoom.id] || []) : [];

    const simulateThreatCheck = (fileName) => {
        const unsafeExtensions = ['.exe', '.bat', '.sh'];
        return !unsafeExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
    };

    const handleFileUpload = useCallback(async (files) => {
        if (!files || files.length === 0 || !activeRoom) return;

        for (const file of files) {
            setUploadProgress({ name: file.name, progress: 0 });

            // Simulate upload progress
            for (let p = 0; p <= 100; p += 20) {
                await new Promise(r => setTimeout(r, 100));
                setUploadProgress({ name: file.name, progress: p });
            }

            const isSafe = simulateThreatCheck(file.name);
            const downloadUrl = isSafe ? URL.createObjectURL(file) : null;

            const fileData = {
                id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: file.name,
                size: file.size,
                type: file.type,
                uploadedBy: userRoomPreferences.nickname || 'Me',
                uploadedAt: new Date().toISOString(),
                isSafe,
                downloadUrl // This is the blobUrl
            };

            // Add to room files and persist to history if uploaded by currentUser
            addRoomFile(activeRoom.id, fileData, true);
            setUploadProgress(null);
        }
    }, [activeRoom, addRoomFile, userRoomPreferences.nickname]);

    const onDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        handleFileUpload(files);
    }, [handleFileUpload]);

    return {
        roomFiles,
        isDragging,
        uploadProgress,
        onDragOver,
        onDragLeave,
        onDrop,
        handleFileUpload
    };
};
