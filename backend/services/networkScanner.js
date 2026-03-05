const { exec } = require('child_process');
const os = require('os');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Detects the local IPv4 address of the server.
 */
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return null;
}

/**
 * Pings a single IP address and returns status.
 */
async function pingDevice(ip) {
    const isWindows = process.platform === 'win32';
    const command = isWindows ? `ping -n 1 -w 1000 ${ip}` : `ping -c 1 -W 1 ${ip}`;

    try {
        await execPromise(command);
        return { ip, status: 'online', lastSeen: Date.now() };
    } catch (error) {
        // Ping failed, device is likely offline or unreachable
        return null;
    }
}

/**
 * Performs a ping sweep across the local subnet.
 */
async function scanSubnet() {
    const localIp = getLocalIP();
    if (!localIp) {
        throw new Error('Could not detect local IP address.');
    }

    const subnetParts = localIp.split('.');
    const subnetPrefix = `${subnetParts[0]}.${subnetParts[1]}.${subnetParts[2]}.`;

    console.log(`Starting scan on subnet: ${subnetPrefix}0/24`);

    const scanPromises = [];
    // We scan 1 to 254
    for (let i = 1; i <= 254; i++) {
        const ip = `${subnetPrefix}${i}`;
        scanPromises.push(pingDevice(ip));
    }

    // Run in chunks to avoid overloading process/network
    const chunkSize = 50;
    let results = [];

    for (let i = 0; i < scanPromises.length; i += chunkSize) {
        const chunk = scanPromises.slice(i, i + chunkSize);
        const chunkResults = await Promise.all(chunk);
        results = results.concat(chunkResults.filter(device => device !== null));
    }

    console.log(`Scan complete. Found ${results.length} active devices.`);
    return {
        localIp,
        subnetPrefix,
        devices: results
    };
}

module.exports = {
    getLocalIP,
    scanSubnet
};
