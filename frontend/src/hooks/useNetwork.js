import { useState, useEffect } from 'react';
import mockDevices from '../mocks/mockDevices';

const useNetwork = () => {
    const [lanIp, setLanIp] = useState('');
    const [subnet, setSubnet] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [devices, setDevices] = useState([]);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        // Simulate fetching LAN info and devices
        const timer = setTimeout(() => {
            setLanIp('192.168.1.15');
            setSubnet('255.255.255.0');
            setConnectionStatus('connected');
            setDevices(mockDevices);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    const scanSubnet = async () => {
        if (isScanning) return;

        setIsScanning(true);
        setConnectionStatus('connecting');
        // Simulate scanning delay
        await new Promise(resolve => setTimeout(resolve, 3000));

        // In a real scenario, this would update devices list
        // For now, we just refresh the mock data
        setDevices([...mockDevices]);
        setIsScanning(false);
        setConnectionStatus('connected');
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
