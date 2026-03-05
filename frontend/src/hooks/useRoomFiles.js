import { useState, useCallback } from 'react';
import { useRoom } from '../context/RoomContext';
import { useFiles } from '../context/FileContext';

export const useRoomFiles = () => {
    const { activeRoom } = useRoom();
    const { uploadFile, roomFilesMap } = useFiles();
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(null);

    const roomFiles = activeRoom ? (roomFilesMap[activeRoom.id] || []) : [];

    const handleFileUpload = useCallback(async (files) => {
        if (!files || files.length === 0 || !activeRoom) return;

        for (const file of files) {
            setUploadProgress({ name: file.name, progress: 10 });

            // Call the real upload API
            const response = await uploadFile(activeRoom.id, file);

            if (response.success) {
                setUploadProgress({ name: file.name, progress: 100 });
                // Small delay to show 100%
                await new Promise(r => setTimeout(r, 500));
            } else {
                console.error('File upload failed', response.error);
            }

            setUploadProgress(null);
        }
    }, [activeRoom, uploadFile]);

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
