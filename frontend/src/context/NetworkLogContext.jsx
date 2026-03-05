import React, { createContext, useContext, useState, useEffect } from 'react';

const NetworkLogContext = createContext();

export const NetworkLogProvider = ({ children }) => {
    const [logs, setLogs] = useState(() => {
        const savedLogs = localStorage.getItem('llr_network_logs');
        if (savedLogs) {
            try {
                return JSON.parse(savedLogs);
            } catch (e) {
                console.error("Failed to parse saved logs", e);
                return [];
            }
        }
        return [
            {
                id: `log-${Date.now().toString()}`,
                type: 'System',
                title: 'Session Initialized',
                description: 'Encrypted JWT generated',
                timestamp: new Date().toISOString()
            }
        ];
    });

    useEffect(() => {
        localStorage.setItem('llr_network_logs', JSON.stringify(logs));
    }, [logs]);

    const addLogEvent = (type, title, description = '') => {
        setLogs(prevLogs => {
            const newLog = {
                id: `log-${Date.now().toString()}-${Math.random().toString(36).substring(2, 9)}`,
                type,
                title,
                description,
                timestamp: new Date().toISOString()
            };

            // Deduplication Check
            if (prevLogs.length > 0) {
                const head = prevLogs[0];
                const timeDiff = new Date(newLog.timestamp).getTime() - new Date(head.timestamp).getTime();

                // If same title & description within 2 seconds, ignore to prevent spam
                if (head.title === newLog.title && head.description === newLog.description && timeDiff < 2000) {
                    return prevLogs;
                }
            }

            // Keep only the latest 50 logs directly mapped to rule #4
            const updatedLogs = [newLog, ...prevLogs].slice(0, 50);
            return updatedLogs;
        });
    };

    const clearLogs = () => {
        setLogs([]);
        localStorage.removeItem('llr_network_logs');
    };

    const value = {
        logs,
        addLogEvent,
        clearLogs
    };

    return (
        <NetworkLogContext.Provider value={value}>
            {children}
        </NetworkLogContext.Provider>
    );
};

export const useNetworkLog = () => {
    const context = useContext(NetworkLogContext);
    if (context === undefined) {
        throw new Error('useNetworkLog must be used within a NetworkLogProvider');
    }
    return context;
};

