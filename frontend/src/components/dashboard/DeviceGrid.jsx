import React from 'react';
import DeviceCard from './DeviceCard';
import RadarScanner from './RadarScanner';

const DeviceGrid = ({ devices, isScanning, onScan, onInvite }) => {
    if (devices.length === 0 || isScanning) {
        return <RadarScanner onScan={onScan} onInvite={onInvite} />;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
            {devices.map((device) => (
                <DeviceCard key={device.id} device={device} />
            ))}
        </div>
    );
};

export default DeviceGrid;
