/**
 * Persistence helper for Room Preferences
 */

const PREFS_KEY = 'locallink_room_prefs';
const METADATA_KEY = 'locallink_room_metadata';
const FILES_KEY_PREFIX = 'locallink_room_files_';
const STROKES_KEY_PREFIX = 'locallink_room_strokes_';
const REGISTRY_KEY = "llr_active_room_ids";
const PARTICIPANTS_KEY_PREFIX = 'locallink_room_participants_';
const PENDING_KEY_PREFIX = 'locallink_room_pending_';

export const savePreferences = (prefs) => {
    try {
        const currentPrefs = getPreferences();
        const newPrefs = { ...currentPrefs, ...prefs };
        localStorage.setItem(PREFS_KEY, JSON.stringify(newPrefs));
    } catch (error) {
        console.error('Error saving room preferences:', error);
    }
};

export const getPreferences = () => {
    try {
        const saved = localStorage.getItem(PREFS_KEY);
        return saved ? JSON.parse(saved) : {
            nickname: '',
            selectedTheme: '#2563EB',
            lastUsedRoomCode: '',
            lastExpirySelected: '1hr'
        };
    } catch (error) {
        console.error('Error getting room preferences:', error);
        return {};
    }
};

export const clearPreferences = () => {
    localStorage.removeItem(PREFS_KEY);
};

export const saveRoomMetadata = (data) => {
    try {
        localStorage.setItem(METADATA_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving room metadata:', error);
    }
};

export const getRoomMetadata = () => {
    try {
        const saved = localStorage.getItem(METADATA_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('Error getting room metadata:', error);
        return null;
    }
};

export const clearRoomMetadata = () => {
    localStorage.removeItem(METADATA_KEY);
};

export const saveRoomFiles = (roomId, files) => {
    try {
        localStorage.setItem(`${FILES_KEY_PREFIX}${roomId}`, JSON.stringify(files));
    } catch (error) {
        console.error('Error saving room files:', error);
    }
};

export const getRoomFiles = (roomId) => {
    try {
        const saved = localStorage.getItem(`${FILES_KEY_PREFIX}${roomId}`);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Error getting room files:', error);
        return [];
    }
};

export const saveDrawpadStrokes = (roomId, strokes) => {
    try {
        localStorage.setItem(`${STROKES_KEY_PREFIX}${roomId}`, JSON.stringify(strokes));
    } catch (error) {
        console.error('Error saving drawpad strokes:', error);
    }
};

export const getDrawpadStrokes = (roomId) => {
    try {
        const saved = localStorage.getItem(`${STROKES_KEY_PREFIX}${roomId}`);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Error getting drawpad strokes:', error);
        return [];
    }
};

export const getRoomRegistry = () => {
    try {
        const saved = localStorage.getItem(REGISTRY_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch (error) {
        console.error('Error getting room registry:', error);
        return {};
    }
};

export const saveRoomRegistry = (registry) => {
    try {
        localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
    } catch (error) {
        console.error('Error saving room registry:', error);
    }
};

export const saveRoomParticipants = (roomId, participants) => {
    try {
        localStorage.setItem(`${PARTICIPANTS_KEY_PREFIX}${roomId}`, JSON.stringify(participants));
    } catch (error) {
        console.error('Error saving participants:', error);
    }
};

export const getRoomParticipants = (roomId) => {
    try {
        const saved = localStorage.getItem(`${PARTICIPANTS_KEY_PREFIX}${roomId}`);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        console.error('Error getting participants:', error);
        return null;
    }
};

export const savePendingRequests = (roomId, requests) => {
    try {
        localStorage.setItem(`${PENDING_KEY_PREFIX}${roomId}`, JSON.stringify(requests));
    } catch (error) {
        console.error('Error saving pending requests:', error);
    }
};

export const getPendingRequests = (roomId) => {
    try {
        const saved = localStorage.getItem(`${PENDING_KEY_PREFIX}${roomId}`);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Error getting pending requests:', error);
        return [];
    }
};
