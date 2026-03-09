import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Users,
    Link as LinkIcon,
    Shield,
    Clock,
    Wifi,
    ChevronRight,
    Copy,
    Check,
    ArrowRight,
    Lock,
    UserCircle,
    Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRoom } from '../context/RoomContext';
import { useProfile } from '../context/ProfileContext';
import { useSettings } from '../context/SettingsContext';
import { useNotifications } from '../context/NotificationContext';
import { useNetworkLog } from '../context/NetworkLogContext';
import RoomInterface from './RoomInterface';
import useRooms from '../hooks/useRooms';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Rooms = () => {
    const navigate = useNavigate();
    const {
        activeRoom,
        createRoom,
        joinRoom, // Added joinRoom
        userRoomPreferences,
        updatePreferences,
        generatedId,
        setLocalRoomTheme
    } = useRoom();

    const { rooms } = useRooms();
    const { profile } = useProfile();
    const { settings } = useSettings();
    const { addNotification } = useNotifications();
    const { lanDevices } = useNetworkLog();

    // Create Room State
    const [roomName, setRoomName] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState('');
    const [expiry, setExpiry] = useState(userRoomPreferences.lastExpirySelected || '1min');

    // Join Room State
    const [roomCode, setRoomCode] = useState(userRoomPreferences.lastUsedRoomCode || '');
    const [nickname, setNickname] = useState(userRoomPreferences.nickname || 'GuestUser_82');
    const [createThemeColor, setCreateThemeColor] = useState(userRoomPreferences.selectedTheme || settings.accentColor);
    const [joinThemeColor, setJoinThemeColor] = useState(userRoomPreferences.selectedTheme || settings.accentColor);
    const [searchTermNearby, setSearchTermNearby] = useState('');
    const [copied, setCopied] = useState(false);

    // Default to a safe color if settings hasn't loaded
    useEffect(() => {
        setCreateThemeColor(settings.accentColor || '#00f0ff');
        setJoinThemeColor(settings.accentColor || '#00f0ff');
    }, [settings.accentColor]);

    const colors = ['#00f0ff', '#A020F0', '#ff00ff', '#00ff00', '#ffff00'];

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (!roomName.trim()) return;

        // Store personal preference in RoomContext (but NOT global settings)
        updatePreferences({ nickname });

        const roomData = {
            id: generatedId,
            name: roomName,
            isPrivate,
            password: isPrivate ? password : '',
            expiry,
            type: 'owner'
        };

        setLocalRoomTheme(createThemeColor);
        const response = await createRoom(roomData);
        if (response.success) {
            addNotification({
                type: 'info',
                title: 'Room Created',
                message: `Successfully created room: ${roomName}`,
                timestamp: new Date().toISOString()
            });
            navigate(`/room/${response.data.id}`);
        }
    };

    const handleJoinRoom = (e) => {
        e.preventDefault();
        if (roomCode.trim()) {
            updatePreferences({ nickname });
            navigate(`/join/${roomCode.trim().toUpperCase()}`);
        }
    };
    const handleCopyId = () => {
        if (!generatedId) return;
        navigator.clipboard.writeText(generatedId);
        setCopied(true);
        addNotification({
            type: 'info',
            title: 'Copied',
            message: 'Room ID copied to clipboard',
            timestamp: new Date().toISOString()
        });
        setTimeout(() => setCopied(false), 2000);
    };

    const handleJoinDirectly = (room) => {
        // Go to JoinRoom page for nickname and theme setup (Requirement: consistent join flow)
        navigate(`/join/${room.id}`);
    };

    const filteredNearbyRooms = (rooms || []).filter(room =>
        room.name.toLowerCase().includes(searchTermNearby.toLowerCase())
    );



    return (
        <div className="min-h-full bg-background p-4 sm:p-6 md:p-0.5 pb-12 overflow-x-hidden">
            <div className="max-w-none space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
                    {/* Create Room Column */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-panel p-6 sm:p-8 md:p-10 rounded-[28px] md:rounded-[32px] space-y-8 md:space-y-10"
                    >
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                <Plus className="text-primary" size={20} />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-text-main tracking-tight">Create Room</h2>
                        </div>

                        <form onSubmit={handleCreateRoom} className="space-y-7 md:space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-text-main-muted uppercase tracking-widest pl-1">Room Name</label>
                                <input
                                    type="text"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    placeholder="e.g. Creative Session"
                                    className="w-full bg-background border border-border rounded-2xl py-3.5 md:py-4 px-5 md:px-6 text-text-main placeholder:text-text-main-muted focus:outline-none focus:border-primary/50 transition-all font-medium text-sm md:text-base"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-text-main-muted uppercase tracking-widest pl-1">Room Access</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsPrivate(false);
                                            setPassword('');
                                        }}
                                        className={cn(
                                            "py-3 rounded-xl text-xs font-bold transition-all border",
                                            !isPrivate
                                                ? "text-background border-transparent shadow-lg"
                                                : "bg-surface text-text-main-muted border-border hover:border-text-muted/20"
                                        )}
                                        style={!isPrivate ? { backgroundColor: settings.accentColor, boxShadow: `0 0 20px ${settings.accentColor}2a` } : {}}
                                    >
                                        Public
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsPrivate(true)}
                                        className={cn(
                                            "py-3 rounded-xl text-xs font-bold transition-all border",
                                            isPrivate
                                                ? "text-background border-transparent shadow-lg"
                                                : "bg-surface text-text-main-muted border-border hover:border-text-muted/20"
                                        )}
                                        style={isPrivate ? { backgroundColor: settings.accentColor, boxShadow: `0 0 20px ${settings.accentColor}2a` } : {}}
                                    >
                                        Private
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {isPrivate && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                        className="space-y-2 overflow-hidden"
                                    >
                                        <label className="text-[10px] font-bold text-text-main-muted uppercase tracking-widest pl-1">Room Password</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required={isPrivate}
                                            className="w-full bg-background border border-border rounded-2xl py-3.5 md:py-4 px-5 md:px-6 text-text-main placeholder:text-text-main-muted focus:outline-none transition-all font-medium text-sm md:text-base"
                                            style={{ borderColor: isPrivate ? `${settings.accentColor}14` : 'var(--border-color)' }}
                                            onFocus={(e) => e.target.style.borderColor = settings.accentColor}
                                            onBlur={(e) => e.target.style.borderColor = `${settings.accentColor}14`}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-text-main-muted uppercase tracking-widest pl-1">Expiry Timer</label>
                                <div className="grid grid-cols-3 gap-2 md:gap-3">
                                    {['1min', '2min', '5min'].map((time) => (
                                        <button
                                            key={time}
                                            type="button"
                                            onClick={() => setExpiry(time)}
                                            className={cn(
                                                "py-3 rounded-xl text-xs md:text-sm font-bold transition-all border",
                                                expiry === time
                                                    ? "text-background border-transparent shadow-lg"
                                                    : "bg-surface text-text-main-muted border-border hover:border-text-muted/20"
                                            )}
                                            style={expiry === time ? { backgroundColor: settings.accentColor, boxShadow: `0 0 20px ${settings.accentColor}2a` } : {}}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-5 pt-3 pb-3">
                                <label className="text-[10px] font-bold text-text-main-muted uppercase tracking-widest pl-1">Theme Override</label>
                                <div className="flex items-center gap-5 p-3 px-2 overflow-x-auto no-scrollbar">
                                    {colors.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setCreateThemeColor(c)}
                                            className={cn(
                                                "w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 shrink-0",
                                                createThemeColor === c ? "scale-110" : "border-transparent"
                                            )}
                                            style={{
                                                backgroundColor: c,
                                                borderColor: createThemeColor === c ? 'var(--text-primary)' : 'transparent',
                                                boxShadow: createThemeColor === c ? `0 0 10px ${c}` : 'none'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 relative">
                                <label className="text-[10px] font-bold uppercase tracking-widest pl-1" style={{ color: `${settings.accentColor}99` }}>Auto-generated ID</label>
                                <div className="w-full bg-background border rounded-2xl py-3.5 md:py-4 px-5 md:px-6 font-bold tracking-[0.2em] flex items-center justify-between text-xs md:text-sm transition-colors"
                                    style={{ color: settings.accentColor, borderColor: `${settings.accentColor}20` }}>
                                    <span>{generatedId}</span>
                                    <button
                                        type="button"
                                        onClick={handleCopyId}
                                        className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full text-background py-3.5 md:py-4.5 rounded-2xl font-bold text-base md:text-lg transition-all active:scale-[0.98] shadow-lg"
                                style={{ backgroundColor: settings.accentColor, boxShadow: `0 0 30px ${settings.accentColor}20` }}
                                onMouseEnter={(e) => e.target.style.filter = 'brightness(1.1)'}
                                onMouseLeave={(e) => e.target.style.filter = 'none'}
                            >
                                Create Room
                            </button>
                        </form>
                    </motion.div>

                    {/* Join Room Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-panel p-6 rounded-[28px] md:rounded-[32px] space-y-6"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${settings.accentColor}0d` }}>
                                <Users style={{ color: settings.accentColor }} size={20} />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-text-main tracking-tight">Join Room</h2>
                        </div>

                        {/* Room ID Input Row */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative group">
                                <input
                                    type="text"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value)}
                                    placeholder="ENTER CODE"
                                    className="w-full bg-background border border-border rounded-2xl py-4 px-5 md:px-6 text-text-main placeholder:text-text-main-muted focus:outline-none transition-all font-bold tracking-[0.3em] text-xs md:text-sm uppercase"
                                    style={{ borderColor: `${joinThemeColor}14` }}
                                    onFocus={(e) => e.target.style.borderColor = settings.accentColor}
                                    onBlur={(e) => e.target.style.borderColor = `${joinThemeColor}14`}
                                />
                            </div>
                            <button
                                onClick={handleJoinRoom}
                                className="w-full sm:w-16 h-14 text-background rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-lg group shrink-0"
                                style={{ backgroundColor: settings.accentColor }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.filter = 'brightness(1.1)';
                                    const svg = e.currentTarget.querySelector('svg');
                                    if (svg) svg.style.transform = 'translateX(2px) scale(1.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.filter = 'none';
                                    const svg = e.currentTarget.querySelector('svg');
                                    if (svg) svg.style.transform = 'none';
                                }}
                            >
                                <ArrowRight size={24} className="transition-transform duration-300" />
                            </button>
                        </div>

                        {/* Nickname Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-text-main-muted uppercase tracking-widest pl-1">Your Nickname</label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full bg-background border border-border rounded-2xl py-4 px-5 text-sm text-text-main focus:outline-none transition-all"
                                style={{ borderColor: 'var(--border-color)' }}
                                onFocus={(e) => e.target.style.borderColor = settings.accentColor}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                        </div>

                        {/* Theme Override Section */}
                        <div className="space-y-5 pt-4 pb-4">
                            <label className="text-[10px] font-bold text-text-main-muted uppercase tracking-widest pl-1">Theme Override</label>
                            <div className="flex items-center gap-5 p-3 px-2 overflow-x-auto no-scrollbar">
                                {colors.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setJoinThemeColor(c)}
                                        className={cn(
                                            "w-9 h-9 rounded-full border-2 transition-transform hover:scale-110 shrink-0",
                                            joinThemeColor === c ? "scale-110" : "border-transparent"
                                        )}
                                        style={{
                                            backgroundColor: c,
                                            borderColor: joinThemeColor === c ? 'var(--text-primary)' : 'transparent',
                                            boxShadow: joinThemeColor === c ? `0 0 15px ${c}` : 'none'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Nearby Rooms Card - Horizontal Layout */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-6 sm:p-8 rounded-[28px] md:rounded-[32px] space-y-6"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Wifi className="text-primary" size={18} />
                            <h3 className="text-lg font-black text-text-main italic uppercase tracking-wider">Nearby Discovery</h3>
                        </div>

                        <div className="flex items-center gap-6">
                            {/* Search Bar */}
                            <div className="relative group w-full md:w-64">
                                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-main-muted transition-colors" />
                                <input
                                    type="text"
                                    placeholder="SCANNING NETWORK..."
                                    value={searchTermNearby}
                                    onChange={(e) => setSearchTermNearby(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-bold tracking-[0.2em] text-text-main placeholder:text-text-main-muted focus:outline-none transition-all uppercase"
                                    onFocus={(e) => {
                                        e.target.style.borderColor = settings.accentColor;
                                        if (e.target.previousSibling) e.target.previousSibling.style.color = settings.accentColor;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'var(--border-color)';
                                        if (e.target.previousSibling) e.target.previousSibling.style.color = 'var(--text-secondary)';
                                    }}
                                />
                            </div>

                            <div className="hidden md:flex items-center gap-2">
                                <span className="text-[9px] font-bold text-primary tracking-widest uppercase">RADAR ACTIVE</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {/* LAN Discovered Devices */}
                        {lanDevices.map((device) => (
                            <div key={device.id} className="bg-surface border border-border rounded-2xl p-5 hover:border-primary/20 transition-all group flex flex-col gap-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-12 translate-x-12 blur-2xl" />

                                <div className="flex items-start justify-between relative z-10">
                                    <div className="truncate pr-2">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-black text-text-main group-hover:text-primary transition-colors truncate uppercase tracking-tight">{device.name}</h4>
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                        </div>
                                        <p className="text-[10px] text-text-main-muted font-bold uppercase tracking-widest mt-1">
                                            {device.ip}:{device.port}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <Wifi size={14} />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-auto relative z-10">
                                    <span className="text-[8px] font-black tracking-[0.2em] text-primary uppercase bg-primary/5 px-2 py-1 rounded">DEVICE ACTIVE</span>
                                    <span className="text-[8px] font-black tracking-[0.2em] text-text-main-muted uppercase ml-auto">LocalLink NODE</span>
                                </div>
                            </div>
                        ))}

                        {/* Existing Rooms */}
                        {filteredNearbyRooms.length === 0 && lanDevices.length === 0 ? (
                            <div className="col-span-full text-center py-12 opacity-20 italic text-[10px] text-text-main uppercase tracking-[0.4em] font-black">
                                No nodes detected in proximity
                            </div>
                        ) : filteredNearbyRooms.map((room) => (
                            <div key={room.id} className="bg-background border border-border rounded-2xl p-5 hover:border-primary/20 transition-all group flex flex-col gap-5">
                                <div className="flex items-start justify-between">
                                    <div className="truncate pr-2">
                                        <h4 className="text-sm font-black text-text-main group-hover:text-primary transition-colors truncate uppercase tracking-tight">{room.name}</h4>
                                        <p className="text-[10px] text-text-main-muted font-bold uppercase tracking-widest mt-0.5">
                                            {room.members} connected • {room.ping}
                                        </p>
                                    </div>
                                    <span className={cn(
                                        "text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded shrink-0",
                                        room.type === 'public' ? "text-green-500 bg-green-500/10" : "text-primary bg-primary/10"
                                    )}>
                                        {room.type}
                                    </span>
                                </div>

                                <div className="flex -space-x-2">
                                    {(room.participants || []).map((participant) => (
                                        <div key={participant.id} className="w-7 h-7 rounded-full border-2 border-background bg-surface overflow-hidden">
                                            <img src={participant.avatar} alt={participant.name} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                    {room.members > 3 && (
                                        <div className="w-7 h-7 rounded-full border-2 border-background bg-surface flex items-center justify-center text-[8px] font-bold text-text-main-muted">
                                            +{room.members - 3}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleJoinDirectly(room)}
                                    className={cn(
                                        "w-full py-3 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2 relative active:scale-[0.98] uppercase tracking-widest",
                                        room.type === 'private'
                                            ? "bg-black/5 dark:bg-white/5 text-text-main-muted hover:text-text-main border border-border"
                                            : "bg-primary text-background hover:shadow-neon shadow-lg"
                                    )}
                                >
                                    {room.type === 'private' ? <Lock size={12} className="opacity-60" /> : <ChevronRight size={14} />}
                                    {room.type === 'private' ? 'Enter Password' : 'Join Room'}
                                </button>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <div className="mt-12 text-center">
                <p className="text-[9px] font-bold text-primary/20 uppercase tracking-[0.5em] px-6">Secure Local Subnet P2P Gateway Active</p>
            </div>
        </div >
    );
};

export default Rooms;
