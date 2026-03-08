const bonjour = require('bonjour')();
const os = require('os');
const { v4: uuidv4 } = require('uuid');

const SERVICE_TYPE = 'locallink'; // Will result in _locallink._tcp
const SERVICE_PROTOCOL = 'tcp';
const SERVICE_NAME_PREFIX = 'LocalLink-';
const CLEANUP_INTERVAL = 20000; // 20 seconds

class MdnsService {
    constructor() {
        this.devices = new Map();
        this.io = null;
        this.localService = null;
        this.deviceId = uuidv4();
        this.deviceName = os.hostname();
    }

    init(io) {
        this.io = io;
        this.publishService();
        this.discoverDevices();
        this.startCleanupInterval();
        console.log(`mDNS Service initialized with Device ID: ${this.deviceId}`);
    }

    publishService() {
        const port = parseInt(process.env.PORT) || 5000;

        // Add a short unique suffix to the service name to prevent name collisions
        const uniqueName = `${SERVICE_NAME_PREFIX}${this.deviceName}-${this.deviceId.substring(0, 4)}`;

        this.localService = bonjour.publish({
            name: uniqueName,
            type: SERVICE_TYPE,
            port: port,
            txt: {
                deviceName: this.deviceName,
                deviceId: this.deviceId
            }
        });

        this.localService.on('up', () => {
            console.log(`mDNS Service published: ${this.localService.name} on port ${port}`);
        });

        this.localService.on('error', (err) => {
            console.error('mDNS Publish Error:', err);
        });
    }

    discoverDevices() {
        const browser = bonjour.find({ type: SERVICE_TYPE });

        browser.on('up', (service) => {
            console.log(`[mDNS] Found potential service: ${service.name} at ${service.referer.address}`);

            // Ignore self
            if (service.txt && service.txt.deviceId === this.deviceId) {
                return;
            }

            // Extract IPv4 address
            let deviceIp = service.referer.address;
            if (service.addresses && service.addresses.length > 0) {
                // Prefer IPv4
                const ipv4 = service.addresses.find(addr => !addr.includes(':') && addr !== '127.0.0.1');
                if (ipv4) deviceIp = ipv4;
            }

            const deviceId = service.txt ? service.txt.deviceId : service.name;
            const deviceName = service.txt ? service.txt.deviceName : service.name;

            const device = {
                id: deviceId,
                name: deviceName,
                ip: deviceIp,
                port: service.port,
                lastSeen: Date.now()
            };

            const isNew = !this.devices.has(deviceId);
            this.devices.set(deviceId, device);

            if (isNew) {
                console.log(`[mDNS] ✅ NEW DEVICE: ${deviceName} at ${deviceIp}:${service.port}`);
                if (this.io) {
                    this.io.emit('device_discovered', device);
                }
            } else {
                this.devices.set(deviceId, { ...device, ip: deviceIp });
            }
        });

        browser.on('down', (service) => {
            const deviceId = service.txt ? service.txt.deviceId : service.name;
            if (this.devices.has(deviceId)) {
                this.devices.delete(deviceId);
                if (this.io) {
                    this.io.emit('device_removed', deviceId);
                }
                console.log(`Device went down: ${service.name}`);
            }
        });
    }

    startCleanupInterval() {
        setInterval(() => {
            const now = Date.now();
            for (const [id, device] of this.devices.entries()) {
                if (now - device.lastSeen > CLEANUP_INTERVAL) {
                    this.devices.delete(id);
                    if (this.io) {
                        this.io.emit('device_removed', id);
                    }
                    console.log(`Device timed out: ${device.name}`);
                }
            }
        }, 5000); // Check every 5 seconds
    }

    getDiscoveredDevices() {
        return Array.from(this.devices.values());
    }
}

module.exports = new MdnsService();
