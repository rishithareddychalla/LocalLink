import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ArrowRight, Lock } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRoom } from '../context/RoomContext';
import { useProfile } from '../context/ProfileContext';
import { useSettings } from '../context/SettingsContext';
import { useNetworkLog } from '../context/NetworkLogContext';
import { getRoomAPI } from '../services/roomService';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const JoinRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const {
        joinRoom,
        updatePreferences,
        setLocalRoomTheme
    } = useRoom();
    const { profile, updateNickname } = useProfile();
    const { settings } = useSettings();
    const { addLogEvent } = useNetworkLog();

    const [nickname, setNickname] = useState(profile.nickname || 'Guest');
    const [themeColor, setThemeColor] = useState('#00f0ff');
    const [loadingRoom, setLoadingRoom] = useState(false);
    const [roomData, setRoomData] = useState(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const colors = ['#2563EB', '#3B82F6', '#10B981', '#7C3AED'];

    // Find room details (Requirement 2 & 6)
    const roomName = roomData?.name || (roomId?.startsWith('LL-') ? `Collaborative Session ${roomId.split('-')[1]}` : roomId) || 'Private Room';
    const participantsList = roomData?.participants || [];

    // Explicit check for privacy
    const isPrivate = roomData?.isPrivate === true;
    const isDataLoaded = !!roomData;
    const errorPrefix = error === 'Incorrect room password' ? '❌ ' : '';




    // Fetch room details if not in nearby/registry
    useEffect(() => {
        const fetchRoomDetails = async () => {
            setLoadingRoom(true);
            const response = await getRoomAPI(roomId);
            if (response.success) {
                setRoomData(response.data);
                setError(null);
            } else {
                const errMsg = response.error || 'Room not found';
                if (errMsg === 'Room not found' || errMsg.toLowerCase().includes('expired') || errMsg.toLowerCase().includes('closed')) {
                    navigate('/404', {
                        state: {
                            title: 'Room Not Found',
                            message: "The room you are trying to join doesn't exist, has been closed, or has expired."
                        }
                    });
                    return;
                }
                setError(errMsg);
            }
            setLoadingRoom(false);
        };

        fetchRoomDetails();
    }, [roomId]);

    const handleJoin = async (e) => {
        if (e) e.preventDefault();
        setError(null);
        if (nickname.trim()) {
            const userData = {
                id: profile.id,
                nickname,
                password,
                avatarStyle: profile.avatarStyle,
                avatarSeed: profile.avatarSeed
            };

            // Persist nickname
            updatePreferences({ nickname });
            updateNickname(nickname);
            setLocalRoomTheme(themeColor);

            const response = await joinRoom(roomId, userData);
            if (response.success) {
                if (response.status === 'joined') {
                    addLogEvent(`Joined '${roomName}'`, `Networking enabled • ID: ${roomId}`);
                    navigate(`/room/${roomId}`);
                }
            } else {
                setError(response.error || 'Failed to join room');
            }
        }
    };

    // Removed auto-join for Public Rooms - Join only on button click

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Blurred Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-lg bg-surface/80 backdrop-blur-xl border border-border rounded-[32px] overflow-hidden shadow-2xl relative z-10"
            >
                {/* Header */}
                <div className="p-10 pb-8 text-center border-b border-border">
                    <h1 className="text-3xl font-bold text-text-main mb-4">Ready to collaborate?</h1>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
                        style={{ backgroundColor: `${settings.accentColor}10`, borderColor: `${settings.accentColor}20` }}>
                        <span className="w-2 h-2 rounded-full animate-pulse"
                            style={{ backgroundColor: settings.accentColor }} />
                        <span className="text-sm font-bold"
                            style={{ color: themeColor }}>
                            {isPrivate ? <Lock size={12} className="inline mr-1 mb-0.5" /> : null}
                            {loadingRoom ? "Probing Room..." : `Joining: ${roomName}`}
                        </span>
                    </div>
                </div>

                <div className="p-10 space-y-8">
                    {/* Nickname Input */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-text-main-muted">Choose your nickname</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="text-text-main-muted transition-colors"
                                    style={{ color: nickname.trim() ? themeColor : 'var(--text-muted)' }}
                                    size={20} />
                            </div>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="e.g. Alex_Dev"
                                className="w-full bg-background border border-border rounded-2xl py-4 pl-12 pr-4 text-text-main placeholder:text-text-main-muted/20 focus:outline-none transition-all"
                                style={{ borderColor: nickname.trim() ? `${settings.accentColor}30` : 'var(--border)' }}
                                onFocus={(e) => e.target.style.borderColor = settings.accentColor}
                                onBlur={(e) => e.target.style.borderColor = nickname.trim() ? `${settings.accentColor}30` : 'var(--border)'}
                            />
                        </div>
                    </div>

                    {/* Password Input (Requirement 2 & 6) */}
                    {isPrivate && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-3"
                        >
                            <label className="text-sm font-medium text-text-main-muted">Room Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="text-text-main-muted group-focus-within:text-primary transition-colors" size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-background border border-border rounded-2xl py-4 pl-12 pr-4 text-text-main placeholder:text-text-main-muted/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                                />
                            </div>
                        </motion.div>
                    )}

                    {error && (
                        <p className="text-red-500 text-xs font-bold uppercase tracking-widest text-center">{error}</p>
                    )}

                    <div className="pt-4 space-y-8">
                        {/* Theme Picker */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-text-main-muted uppercase tracking-widest pl-1">Choose Theme</label>
                            <div className="flex items-center justify-center gap-4">
                                {colors.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setThemeColor(c)}
                                        className={cn(
                                            "w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 shrink-0",
                                            themeColor === c ? "scale-110" : "border-transparent"
                                        )}
                                        style={{
                                            backgroundColor: c,
                                            borderColor: themeColor === c ? 'var(--text)' : 'transparent',
                                            boxShadow: themeColor === c ? `0 0 15px ${c}` : 'none'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 text-center">
                            <button
                                onClick={handleJoin}
                                disabled={!nickname.trim()}
                                className="w-full text-black py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                style={{ backgroundColor: settings.accentColor, boxShadow: `0 0 30px ${settings.accentColor}30` }}
                                onMouseEnter={(e) => !e.target.disabled && (e.target.style.filter = 'brightness(1.1)')}
                                onMouseLeave={(e) => e.target.style.filter = 'none'}
                            >
                                Enter Room
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button onClick={() => navigate('/dashboard')} className="text-text-main-muted hover:text-text-main transition-colors text-sm font-medium">
                                Cancel
                            </button>
                        </div>
                    </div>


                </div>

                {/* Footer Participants */}
                <div className="bg-background p-6 text-center border-t border-border flex flex-col items-center justify-center">
                    {
                        participantsList.length > 0 ? (
                            <>
                                <div className="flex -space-x-3 mb-3">
                                    {participantsList.map((p, idx) => (
                                        <div key={p.id || idx} className="w-10 h-10 rounded-full border-2 border-surface overflow-hidden bg-surface relative z-10 hover:z-20 transition-all hover:-translate-y-1">
                                            <img src={`https://api.dicebear.com/7.x/${p.avatarStyle || 'avataaars'}/svg?seed=${p.avatarSeed || p.nickname}`} alt={p.nickname} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-text-main-muted">
                                    <span className="text-text-main/80 font-medium">
                                        {participantsList.slice(0, 2).map(p => p.nickname).join(', ')}
                                        {participantsList.length > 2 ? ` and ${participantsList.length - 2} others` : ''}
                                    </span> are already in the room
                                </p>
                            </>
                        ) : (
                            <p className="text-xs text-text-main-muted/20 italic uppercase tracking-widest font-bold">
                                Waiting for the first participant...
                            </p>
                        )
                    }
                </div>
            </motion.div>
        </div>
    );
};

export default JoinRoom;
