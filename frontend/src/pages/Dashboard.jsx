import React, { useState, useMemo } from 'react';
import { useSession } from '../hooks/useSession';
import { useRoom } from '../context/RoomContext';
import useNetwork from '../hooks/useNetwork';
import useRooms from '../hooks/useRooms';
import NetworkStatusBar from '../components/dashboard/NetworkStatusBar';
import DeviceGrid from '../components/dashboard/DeviceGrid';
import ActiveRoomsPanel from '../components/dashboard/ActiveRoomsPanel';
import ActiveSessionBanner from '../components/dashboard/ActiveSessionBanner';

const Dashboard = () => {
    const { user } = useSession();
    const { activeRoom } = useRoom();
    const {
        lanIp,
        subnet,
        connectionStatus,
        devices,
        isScanning,
        scanSubnet
    } = useNetwork();

    const { rooms, loadingRooms, error: roomsError } = useRooms();

    // Local State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);

    // Derived State: Filtering devices (Implementation of requirement 4)
    const filteredDevices = useMemo(() => {
        if (!searchQuery.trim()) return devices;

        const query = searchQuery.toLowerCase();
        return devices.filter(device =>
            device.name.toLowerCase().includes(query) ||
            device.ip.toLowerCase().includes(query)
        );
    }, [devices, searchQuery]);

    return (
        <div className="flex flex-col xl:flex-row xl:h-[calc(100vh-144px)] gap-8 pb-10 xl:pb-0 overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 xl:overflow-y-auto xl:pr-4 custom-scrollbar">
                {/* Active Session Banner */}
                <ActiveSessionBanner />

                {/* Header & Status */}
                <NetworkStatusBar
                    nickname={user?.nickname}
                    lanIp={lanIp}
                    subnet={subnet}
                    connectionStatus={connectionStatus}
                    nodeCount={devices.length}
                    isScanning={isScanning}
                    onScan={scanSubnet}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                {/* Device Grid Section */}
                <DeviceGrid
                    devices={filteredDevices}
                    isScanning={isScanning}
                    onScan={scanSubnet}
                />
            </div>

            {/* Right Sidebar - Active Rooms */}
            <ActiveRoomsPanel
                rooms={rooms}
                loading={loadingRooms}
                error={roomsError}
            />
        </div>
    );
};

export default Dashboard;
