import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRoom } from '../context/RoomContext';
import { useProfile } from '../context/ProfileContext';
import useNetwork from '../hooks/useNetwork';
import useRooms from '../hooks/useRooms';
import NetworkStatusBar from '../components/dashboard/NetworkStatusBar';
import DeviceGrid from '../components/dashboard/DeviceGrid';
import ActiveRoomsPanel from '../components/dashboard/ActiveRoomsPanel';
import ActiveSessionBanner from '../components/dashboard/ActiveSessionBanner';
import InviteQRModal from '../components/InviteQRModal';


const Dashboard = () => {
    const { profile } = useProfile();
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
    const location = useLocation();

    // Local State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    // Auto-scan trigger from 404 page
    useEffect(() => {
        if (location.state?.autoScan && !isScanning) {
            scanSubnet();
        }
    }, [location.state, isScanning, scanSubnet]);

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
                    nickname={profile.nickname}
                    lanIp={lanIp}
                    subnet={subnet}
                    connectionStatus={connectionStatus}
                    nodeCount={devices.length}
                    isScanning={isScanning}
                    onScan={scanSubnet}
                    onInvite={() => setIsInviteOpen(true)}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                {/* Device Grid Section */}
                <DeviceGrid
                    devices={filteredDevices}
                    isScanning={isScanning}
                    onScan={scanSubnet}
                    onInvite={() => setIsInviteOpen(true)}
                />
            </div>

            {/* Right Sidebar - Active Rooms */}
            <ActiveRoomsPanel
                rooms={rooms}
                loading={loadingRooms}
                error={roomsError}
                onInvite={() => setIsInviteOpen(true)}
            />

            {/* Invitation QR Modal */}
            <InviteQRModal
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                lanIp={lanIp}
            />

        </div>
    );
};

export default Dashboard;
