import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSavedSettings, saveSettings, applyTheme } from '../utils/themeUtils';
import { getLocalIP, getNetworkInfo, estimateUploadSpeed } from '../utils/networkUtils';

const SettingsContext = createContext();

const DEFAULT_SETTINGS = {
    darkMode: true,
    accentColor: "#00f0ff",
    uploadBandwidthLimit: 50,
    port: '8080'
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        return getSavedSettings() || DEFAULT_SETTINGS;
    });

    const [network, setNetwork] = useState({ localIP: 'Detecting...', info: {} });

    // Apply theme on load and whenever settings change
    useEffect(() => {
        applyTheme(settings);
    }, [settings]);

    // Initial hardware and network detection
    useEffect(() => {
        const detectAll = async () => {

            const ip = await getLocalIP();
            const netInfo = getNetworkInfo();
            setNetwork({ localIP: ip, info: netInfo });
        };
        detectAll();
    }, []);

    const updateSettings = useCallback((newSettings) => {
        setSettings(prev => {
            const updated = { ...prev, ...newSettings };
            saveSettings(updated);
            return updated;
        });
    }, []);

    const runBandwidthTest = useCallback(async () => {
        const speed = await estimateUploadSpeed();
        return speed;
    }, []);

    return (
        <SettingsContext.Provider value={{
            settings,
            updateSettings,
            network,
            runBandwidthTest
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
