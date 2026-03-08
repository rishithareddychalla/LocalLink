import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useProfile } from '../context/ProfileContext';
import { apiRequest } from '../services/api';

const SOCKET_URL = window.location.origin.replace('5173', '5000');

const useNetwork = () => {
    const { profile } = useProfile();
    const [lanIp, setLanIp] = useState('');
    const [subnet, setSubnet] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [activeDevices, setActiveDevices] = useState([]);
    const [isScanning, setIsScanning] = useState(false);

    // Unified devices list (including ourselves)
    const devices = useMemo(() => {
        // Filter out ourselves if we appear in the list (mDNS might broadcast us)
        const others = activeDevices.filter(d =>
            !d.name.includes('(You)')
        );

        const filtered = [...others];

        // Add "My Device" at the top
        if (!profile.ghostMode) {
            filtered.unshift({
                id: 'device-me',
                name: (profile.nickname || 'My Device') + ' (You)',
                ip: lanIp || 'Local',
                type: 'laptop',
                os: 'Windows',
                status: profile.status ? profile.status.toLowerCase() : 'online',
                lastSeen: 'Just now',
                isMe: true
            });
        }

        return filtered;
    }, [activeDevices, profile, lanIp]);

    const fetchDevices = useCallback(async (showLoading = false) => {
        if (showLoading) setIsScanning(true);

        try {
            const response = await apiRequest('/network/devices');
            if (response.success) {
                setLanIp(response.localIp || '');
                window.llr_lan_ip = response.localIp || ''; // Sync for context
                setSubnet(response.subnetPrefix || '');
                setActiveDevices(response.devices || []);
                setConnectionStatus('connected');
            }
        } catch (error) {
            console.error("Error fetching active LAN devices:", error);
            setConnectionStatus('error');
        } finally {
            if (showLoading) setIsScanning(false);
        }
    }, []);

    // Initial fetch and poll
    useEffect(() => {
        fetchDevices(true);
        const timer = setInterval(() => fetchDevices(false), 10000);
        return () => clearInterval(timer);
    }, [fetchDevices]);

    // Socket.io for real-time discovery updates
    useEffect(() => {
        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling']
        });

        socket.on('device_discovered', (device) => {
            setActiveDevices(prev => {
                // Ignore self
                if (device.ip === lanIp && lanIp !== '') return prev;

                const existingIndex = prev.findIndex(d => d.id === device.id || d.ip === device.ip);
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = { ...updated[existingIndex], ...device };
                    return updated;
                }
                return [...prev, device];
            });
        });

        socket.on('device_removed', (deviceId) => {
            setActiveDevices(prev => prev.filter(d => d.id !== deviceId));
        });

        // Socket Client Events (Logged in devices)
        socket.on('device_joined', (deviceData) => {
            if (deviceData.ipAddress === '127.0.0.1' || (deviceData.ipAddress === lanIp && lanIp !== '')) return;

            const device = {
                id: deviceData.id,
                name: deviceData.nickname || 'Anonymous Device',
                ip: deviceData.ipAddress,
                avatar: deviceData.avatar,
                status: deviceData.status || 'online',
                lastSeen: 'Just now',
                type: 'client',
                discoveryMethod: 'Socket'
            };

            setActiveDevices(prev => {
                const existingIndex = prev.findIndex(d => d.id === device.id || d.ip === device.ip);
                if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = { ...updated[existingIndex], ...device };
                    return updated;
                }
                return [...prev, device];
            });
        });

        socket.on('device_left', (deviceId) => {
            setActiveDevices(prev => prev.filter(d => d.id !== deviceId));
        });

        return () => socket.disconnect();
    }, []);

    // Dummy scan function for backward compatibility
    const scanSubnet = async () => {
        setIsScanning(true);
        await fetchDevices(false);
        setTimeout(() => setIsScanning(false), 1500);
    };

    return {
        lanIp,
        subnet,
        connectionStatus,
        devices,
        isScanning,
        scanSubnet
    };
};

export default useNetwork;

