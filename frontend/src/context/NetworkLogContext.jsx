import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { apiRequest } from '../services/api';

const NetworkLogContext = createContext();

const SOCKET_URL = window.location.origin.replace('5173', '5000');

export const NetworkLogProvider = ({ children }) => {
    const [lanDevices, setLanDevices] = useState([]);
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

    // Fetch initial LAN devices
    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await apiRequest('/network/devices');
                if (response.success) {
                    setLanDevices(response.devices);
                }
            } catch (error) {
                console.error('Failed to fetch LAN devices:', error);
            }
        };
        fetchDevices();
    }, []);

    // Socket.io for real-time discovery
    useEffect(() => {
        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling']
        });

        socket.on('device_discovered', (device) => {
            setLanDevices(prev => {
                // Ignore self-logs (initial devices might have us)
                if (device.ip === (window.llr_lan_ip || '')) return prev;

                const existingIndex = prev.findIndex(d => d.id === device.id || d.ip === device.ip);
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = { ...updated[existingIndex], ...device };
                    return updated;
                }
                addLogEvent('System', 'Device Discovered', `${device.name} (${device.ip})`);
                return [...prev, device];
            });
        });

        // Add socket listeners for consistency with useNetwork
        socket.on('device_joined', (deviceData) => {
            if (deviceData.ipAddress === '127.0.0.1' || deviceData.ipAddress === (window.llr_lan_ip || '')) return;

            const device = {
                id: deviceData.id,
                name: deviceData.nickname || 'Anonymous Device',
                ip: deviceData.ipAddress,
                avatar: deviceData.avatar,
                status: deviceData.status || 'online',
                type: 'client',
                discoveryMethod: 'Socket'
            };

            setLanDevices(prev => {
                const existingIndex = prev.findIndex(d => d.id === device.id || d.ip === device.ip);
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = { ...updated[existingIndex], ...device };
                    return updated;
                }
                addLogEvent('System', 'User Joined', `${device.name} connected`);
                return [...prev, device];
            });
        });

        socket.on('device_removed', (deviceId) => {
            setLanDevices(prev => {
                const device = prev.find(d => d.id === deviceId);
                if (device) {
                    addLogEvent('System', 'Device Lost', `${device.name} disconnected`);
                }
                return prev.filter(d => d.id !== deviceId);
            });
        });

        return () => {
            socket.disconnect();
        };
    }, []);

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
        lanDevices,
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

