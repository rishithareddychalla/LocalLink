const STORAGE_KEY = 'llr_user_files';

export const getUserFiles = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : { downloaded: [], sharedByMe: [] };
    } catch (error) {
        console.error('Failed to parse user files from localStorage:', error);
        return { downloaded: [], sharedByMe: [] };
    }
};

export const saveUserFiles = (files) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    } catch (error) {
        console.error('Failed to save user files to localStorage:', error);
    }
};

export const addFileToHistory = (type, fileMetadata) => {
    const history = getUserFiles();
    const list = history[type] || [];

    // Check for duplicates based on ID or Name+Room (since IDs might be generated per-session)
    const exists = list.some(f => f.id === fileMetadata.id || (f.name === fileMetadata.name && f.roomId === fileMetadata.roomId));

    if (!exists) {
        list.unshift(fileMetadata);
        saveUserFiles({ ...history, [type]: list });
    }
};
