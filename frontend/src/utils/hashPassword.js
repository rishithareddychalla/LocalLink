/**
 * Simulates password hashing using Base64 encoding.
 * (Frontend-only simulation for LocalLink Radar)
 */
export const hashPassword = (password) => {
    if (!password) return null;
    try {
        return btoa(password);
    } catch (e) {
        console.error('Hashing error:', e);
        return password;
    }
};

export const verifyPassword = (password, hash) => {
    if (!hash) return true; // Public room
    return hashPassword(password) === hash;
};
