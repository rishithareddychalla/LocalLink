/**
 * Generates a UUID v4 string.
 * Uses crypto.randomUUID() if available (secure contexts like HTTPS/localhost).
 * Falls back to a Math.random() based generator for non-secure contexts (LAN access).
 */
export const getUUID = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    // Fallback for non-secure contexts (HTTP/LAN)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
