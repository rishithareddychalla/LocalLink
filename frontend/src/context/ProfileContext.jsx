import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNetworkLog } from './NetworkLogContext';
import { apiRequest } from '../services/api';
import { getUUID } from '../utils/uuid';

const ProfileContext = createContext();

const defaultProfile = {
    id: getUUID(),
    nickname: '',
    avatarStyle: 'bottts-neutral',
    avatarSeed: getUUID(),
    ghostMode: false,
    telemetryEnabled: false,
};

export const ProfileProvider = ({ children }) => {
    const { addLogEvent } = useNetworkLog();

    const [profileState, setProfileState] = useState(() => {
        const savedProfile = localStorage.getItem('llr_profile');
        if (savedProfile) {
            try {
                const parsed = JSON.parse(savedProfile);
                if (!parsed.avatarSeed) {
                    parsed.avatarSeed = parsed.nickname || getUUID();
                }
                if (!parsed.avatarStyle) {
                    parsed.avatarStyle = 'bottts-neutral';
                }
                const { status, ...rest } = parsed;
                return { ...defaultProfile, ...rest };
            } catch (e) {
                console.error("Failed to parse saved profile", e);
                return defaultProfile;
            }
        }
        return defaultProfile;
    });

    const profile = {
        ...profileState,
        avatar: `https://api.dicebear.com/7.x/${profileState.avatarStyle}/svg?seed=${profileState.avatarSeed}`,
        nickname: profileState.nickname || 'Ghost_User'
    };

    const syncWithBackend = useCallback(async (newProfile) => {
        try {
            await apiRequest('/profile/update', {
                method: 'POST',
                body: JSON.stringify({
                    nickname: newProfile.nickname,
                    avatarStyle: newProfile.avatarStyle,
                    avatarSeed: newProfile.avatarSeed,
                    ghostMode: newProfile.ghostMode
                })
            });
        } catch (error) {
            console.error('Failed to sync profile with backend:', error);
        }
    }, []);

    const setProfile = useCallback((updater) => {
        setProfileState(prev => {
            const newProfile = typeof updater === 'function' ? updater(prev) : updater;
            localStorage.setItem('llr_profile', JSON.stringify(newProfile));
            syncWithBackend(newProfile);
            return newProfile;
        });
    }, [syncWithBackend]);

    const broadcastIdentityUpdate = useCallback((newProfile) => {
        if (newProfile.telemetryEnabled) {
            // Emulate broadcasting logic if needed
        }
    }, []);

    const updateAvatarStyle = useCallback((style) => {
        setProfile(prev => {
            const next = { ...prev, avatarStyle: style };
            broadcastIdentityUpdate(next);
            return next;
        });
    }, [setProfile, broadcastIdentityUpdate]);

    const updateNickname = useCallback((name) => {
        setProfile(prev => {
            const next = { ...prev, nickname: name, avatarSeed: name || getUUID() };
            broadcastIdentityUpdate(next);
            return next;
        });
    }, [setProfile, broadcastIdentityUpdate]);

    const toggleGhostMode = useCallback(() => {
        setProfile(prev => {
            const next = { ...prev, ghostMode: !prev.ghostMode };
            broadcastIdentityUpdate(next);
            return next;
        });
    }, [setProfile, broadcastIdentityUpdate]);

    const refreshProfile = useCallback(() => {
        addLogEvent("System", "Identity Synced", "Manual network synchronization triggered.");
        syncWithBackend(profileState);
    }, [addLogEvent, profileState, syncWithBackend]);

    const value = {
        profile,
        updateAvatarStyle,
        updateNickname,
        toggleGhostMode,
        refreshProfile,
        broadcastIdentityUpdate
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};
