const TOKEN_KEY = 'llr_session_token';

/**
 * Generates a mock JWT-like string for the session.
 * @param {string} nickname 
 * @returns {string}
 */
export const generateMockToken = (nickname) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
        nickname,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
        sub: nickname + '_' + Math.random().toString(36).substring(7)
    }));
    const signature = 'mock_signature_' + Math.random().toString(36).substring(7);
    return `${header}.${payload}.${signature}`;
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * Parses the nickname from the mock JWT payload.
 * @param {string} token 
 * @returns {string|null}
 */
export const getNicknameFromToken = (token) => {
    try {
        if (!token) return null;
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        return decoded.nickname;
    } catch (e) {
        return null;
    }
};
