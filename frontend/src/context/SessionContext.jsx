import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getToken, setToken, removeToken, getNicknameFromToken } from '../utils/token';
import { apiRequest } from '../services/api';

export const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setTokenState] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    // Restore session from localStorage on mount
    useEffect(() => {
        // Cleanup old token key if present
        if (localStorage.getItem('llr_token')) {
            localStorage.removeItem('llr_token');
        }

        const storedToken = getToken();
        if (storedToken) {
            const nickname = getNicknameFromToken(storedToken);
            if (nickname) {
                // In a real app we might fetch the full user profile here
                setUser({ nickname });
                setTokenState(storedToken);
                setIsAuthenticated(true);
            } else {
                removeToken();
            }
        }
        setIsInitializing(false);
    }, []);

    const login = useCallback(async (profileData) => {
        try {
            const response = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    id: profileData.id,
                    nickname: profileData.nickname,
                    avatarStyle: profileData.avatarStyle,
                    avatarSeed: profileData.avatarSeed
                })
            });

            if (response.success) {
                const { token: newToken, ...userData } = response.data;
                setToken(newToken);
                setTokenState(newToken);
                setUser(userData);
                setIsAuthenticated(true);
                return { success: true };
            }
            return { success: false, error: response.error };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }, []);

    const logout = useCallback(() => {
        removeToken();
        setUser(null);
        setTokenState(null);
        setIsAuthenticated(false);
    }, []);

    // Listen for global unauthorized events (e.g., expired JWT)
    useEffect(() => {
        const handleUnauthorized = () => {
            console.warn('[Session] Unauthorized signal received. Logging out.');
            logout();
        };
        window.addEventListener('llr_unauthorized', handleUnauthorized);
        return () => window.removeEventListener('llr_unauthorized', handleUnauthorized);
    }, [logout]);

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
