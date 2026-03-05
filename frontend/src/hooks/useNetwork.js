import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useProfile } from '../context/ProfileContext';

const useNetwork = () => {
    const { profile } = useProfile();
    const [lanIp, setLanIp] = useState('');
    const [subnet, setSubnet] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [activeDevices, setActiveDevices] = useState([]);
    const [scannedDevices, setScannedDevices] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const pollingTimerRef = useRef(null);

    // Merge active and scanned devices
    const devices = useMemo(() => {
        const merged = [...activeDevices];

        // Add scanned devices that aren't already in activeDevices (by IP)
        scannedDevices.forEach(scanned => {
            const alreadyExists = merged.find(d => d.ip === scanned.ip);
            if (!alreadyExists) {
                merged.push(scanned);
            }
        });

        // Filter out ourselves if we appear in the lists
        const filtered = merged.filter(d =>
            d.ip !== lanIp &&
            d.name !== (profile.nickname || 'Ghost_User') + ' (You)'
        );

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
    }, [activeDevices, scannedDevices, profile, lanIp]);

    const fetchDevices = useCallback(async (showLoading = false) => {
        if (showLoading) setIsScanning(true);

        try {
            const response = await fetch(`http://${window.location.hostname}:5000/api/network/devices`);
            if (response.ok) {
                const data = await response.json();
                setLanIp(data.localIp || '');
                setSubnet(data.subnetPrefix || '');
                setActiveDevices(data.devices || []);
                setConnectionStatus('connected');
            }
        } catch (error) {
            console.error("Error fetching active LAN devices:", error);
            setConnectionStatus('error');
        } finally {
            if (showLoading) setIsScanning(false);
        }
    }, []);

    useEffect(() => {
        fetchDevices(true);
        pollingTimerRef.current = setInterval(() => {
            fetchDevices(false);
        }, 5000);

        return () => {
            if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
        };
    }, [fetchDevices]);

    const scanSubnet = async () => {
        if (isScanning) return;
        setIsScanning(true);

        try {
            const response = await fetch(`http://${window.location.hostname}:5000/api/network/scan`);
            if (response.ok) {
                const data = await response.json();
                setScannedDevices(data.devices || []);
                setLanIp(data.localIp || '');
                setSubnet(data.subnetPrefix || '');
            }
        } catch (error) {
            console.error("Error during active LAN scan:", error);
        } finally {
            setIsScanning(false);
        }
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

