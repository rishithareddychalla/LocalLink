/**
 * Generates a random alphanumeric string of a given length.
 * @param {number} length - The length of the string to generate.
 * @returns {string} The generated string.
 */
const generateRandomSegment = (length) => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
};

/**
 * Generates a unique room ID in the format LL-XXXX-XX.
 * @param {Object} registry - The current active room ID registry.
 * @returns {string} A unique room ID.
 */
export const generateUniqueRoomId = (registry = {}) => {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
        const id = `LL-${generateRandomSegment(4)}-${generateRandomSegment(2)}`;

        // If ID doesn't exist or is expired, it's valid to use/reuse
        if (!registry[id] || new Date(registry[id].expiresAt).getTime() < Date.now()) {
            return id;
        }

        attempts++;
    }

    // If collision persists after maxAttempts, generate a higher entropy ID
    // Format: LL-XXXXXX-XXX
    return `LL-${generateRandomSegment(6)}-${generateRandomSegment(3)}`;
};
