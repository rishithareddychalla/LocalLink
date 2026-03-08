const express = require('express');
const router = express.Router();
const os = require('os');
const mdnsService = require('../services/mdnsService');
const deviceStore = require('../store/deviceStore');

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
        // 1. Get nodes discovered via mDNS (other servers)
        const mdnsNodes = mdnsService.getDiscoveredDevices().map(d => ({
            ...d,
            type: 'node',
            discoveryMethod: 'mDNS'
        }));

        // 2. Get active socket clients (logged in devices)
        const socketClients = deviceStore.getDevices()
            .filter(d => d.ipAddress !== '127.0.0.1') // Hide loopback
            .map(d => ({
                id: d.id,
                name: d.nickname || 'Anonymous Device',
                ip: d.ipAddress,
                avatar: d.avatar,
                status: d.status || 'online',
                connectedAt: d.connectedAt,
                lastSeen: d.lastSeen,
                type: 'client',
                discoveryMethod: 'Socket'
            }));

        console.log(`[Discovery] mDNS Nodes: ${mdnsNodes.length}, Socket Clients: ${socketClients.length}`);

        // 3. Merge and deduplicate
        // One card per unique identity (ID) and IP combination
        const deviceMap = new Map();

        // Add mDNS nodes first
        mdnsNodes.forEach(node => {
            if (node.ip !== '127.0.0.1' && node.ip !== localIp) {
                deviceMap.set(node.id, node);
            }
        });

        // Add socket clients, merging with existing mDNS nodes if they share IP or ID
        socketClients.forEach(client => {
            // Ignore self in socket list to avoid duplicates with "device-me"
            if (client.ip === localIp) return;

            // Try to find matching mDNS node by ID or IP
            let match = deviceMap.get(client.id);
            if (!match) {
                match = Array.from(deviceMap.values()).find(n => n.ip === client.ip);
            }

            if (match) {
                // Merge info, preferring socket client details (nick/avatar)
                deviceMap.set(match.id, { ...match, ...client });
            } else {
                deviceMap.set(client.id, client);
            }
        });

        const devices = Array.from(deviceMap.values());
        console.log(`[Discovery] Final device count (excluding self): ${devices.length}`);

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

// Deprecated: mDNS handles discovery automatically now
router.get('/scan', async (req, res) => {
    res.json({
        success: true,
        message: 'Active scanning is deprecated. mDNS discovery is automatic.',
        devices: []
    });
});

module.exports = router;

