const devices = new Map();

const addDevice = (socketId, deviceData) => {
    devices.set(socketId, {
        ...deviceData,
        connectedAt: Date.now(),
        lastSeen: Date.now()
    });
};

const removeDevice = (socketId) => {
    devices.delete(socketId);
};

const updateDevice = (socketId, data) => {
    const device = devices.get(socketId);
    if (device) {
        devices.set(socketId, { ...device, ...data, lastSeen: Date.now() });
    }
};

const getDevices = () => {
    return Array.from(devices.values());
};

const getDevicesBySubnet = (subnetPrefix) => {
    return Array.from(devices.values()).filter(device =>
        device.ipAddress && device.ipAddress.startsWith(subnetPrefix)
    );
};

module.exports = {
    addDevice,
    removeDevice,
    updateDevice,
    getDevices,
    getDevicesBySubnet
};
