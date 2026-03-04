import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getToken, setToken, removeToken, getNicknameFromToken, generateMockToken } from '../utils/token';

export const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setTokenState] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    // Restore session from localStorage on mount
    useEffect(() => {
        const storedToken = getToken();
        if (storedToken) {
            const nickname = getNicknameFromToken(storedToken);
            if (nickname) {
                setUser({ nickname });
                setTokenState(storedToken);
                setIsAuthenticated(true);
            } else {
                // Token invalid or expired
                removeToken();
            }
        }
        setIsInitializing(false);
    }, []);

    const login = useCallback(async (nickname) => {
        // Simulate backend latency
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockToken = generateMockToken(nickname);
        setToken(mockToken);
        setTokenState(mockToken);
        setUser({ nickname });
        setIsAuthenticated(true);

        return { success: true };
    }, []);

    const logout = useCallback(() => {
        removeToken();
        setUser(null);
        setTokenState(null);
        setIsAuthenticated(false);
    }, []);

    const value = {
        user,
        token,
        isAuthenticated,
        isInitializing,
        login,
        logout
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};
