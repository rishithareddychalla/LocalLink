const express = require('express');
const router = express.Router();
const os = require('os');
const deviceStore = require('../store/deviceStore');
const networkScanner = require('../services/networkScanner');

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '0.0.0.0';
}

function getSubnetPrefix(ip) {
    if (!ip || ip === '0.0.0.0') return '';
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.${parts[2]}.`;
}

router.get('/devices', async (req, res) => {
    const localIp = getLocalIp();
    const subnetPrefix = getSubnetPrefix(localIp);

    try {
        // Get devices from our active tracking store
        const trackedDevices = deviceStore.getDevices();

        // Filter by same subnet if we have a valid local IP
        const filteredDevices = subnetPrefix
            ? trackedDevices.filter(d => d.ipAddress && d.ipAddress.startsWith(subnetPrefix))
            : trackedDevices;

        // Map to safe public format for frontend
        const devices = filteredDevices.map(d => ({
            id: d.id,
            name: d.nickname || 'Unknown Device',
            ip: d.ipAddress,
            avatar: d.avatar,
            status: d.status || 'online',
            connectedAt: d.connectedAt,
            lastSeen: d.lastSeen
        }));

        res.json({
            success: true,
            localIp,
            subnetPrefix,
            devices
        });
    } catch (error) {
        console.error("Failed to retrieve LAN devices:", error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

router.get('/scan', async (req, res) => {
    try {
        console.log("Active LAN scan requested...");
        const results = await networkScanner.scanSubnet();

        // Map to expected frontend format
        const devices = results.devices.map((d, index) => ({
            id: `discovered-${index}-${d.ip}`,
            name: `Discovered Device (${d.ip})`,
            ip: d.ip,
            status: 'online',
            type: 'terminal', // Use generic type for discovered pings
            lastSeen: 'Just now'
        }));

        res.json({
            success: true,
            localIp: results.localIp,
            subnetPrefix: results.subnetPrefix,
            devices
        });
    } catch (error) {
        console.error("LAN scan failed:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

