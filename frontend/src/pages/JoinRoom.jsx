import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ArrowRight, Lock } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useRoom } from '../context/RoomContext';
import { getRoomAPI } from '../services/roomService';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const mockParticipants = [
    { id: 1, name: 'Alex', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
    { id: 2, name: 'Sarah', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { id: 3, name: 'Mike', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
];

const JoinRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const {
        joinRoom,
        userRoomPreferences,
        roomRegistry,
        NEARBY_ROOMS,
        updatePreferences
    } = useRoom();

    const [nickname, setNickname] = useState(userRoomPreferences?.nickname || '');
    const [themeColor, setThemeColor] = useState(userRoomPreferences?.selectedTheme || '#2563EB');
    const [loadingRoom, setLoadingRoom] = useState(false);
    const [roomData, setRoomData] = useState(null);
    const [password, setPassword] = useState('');
    const [joinStatus, setJoinStatus] = useState('idle'); // 'idle', 'pending', 'error'
    const [error, setError] = useState(null);

    const colors = ['#2563EB', '#3B82F6', '#10B981', '#7C3AED'];

    // Fetch room details if not in nearby/registry
    useEffect(() => {
        const fetchRoomDetails = async () => {
            const nearby = NEARBY_ROOMS.find(r => r.id === roomId);
            const registry = roomRegistry[roomId];

            if (nearby) {
                setRoomData(nearby);
                return;
            }
            if (registry) {
                setRoomData({ ...registry, name: registry.roomName });
                return;
            }

            setLoadingRoom(true);
            const response = await getRoomAPI(roomId);
            if (response.success) {
                setRoomData(response.data);
            }
            setLoadingRoom(false);
        };

        fetchRoomDetails();
    }, [roomId, NEARBY_ROOMS, roomRegistry]);

    // Find room details (Requirement 2 & 6)
    const roomName = roomData?.name || (roomId?.startsWith('LL-') ? `Collaborative Session ${roomId.split('-')[1]}` : roomId) || 'Private Room';
    const participantsList = roomData?.participants || [];
    const isPrivate = roomData?.type === 'private' || roomData?.visibility === 'private' || !!roomData?.passwordHash;
    const approvalRequired = roomData?.approvalRequired;

    const handleJoin = async (e) => {
        e.preventDefault();
        setError(null);
        if (nickname.trim()) {
            const userData = {
                id: `u-${Date.now()}`, // Consistent ID for simulation
                nickname,
                password,
                theme: themeColor
            };

            // Persist preferences
            updatePreferences({ nickname, selectedTheme: themeColor });

            const response = await joinRoom(roomId, userData);
            if (response.success) {
                if (response.status === 'pending') {
                    setJoinStatus('pending');
                } else {
                    navigate(`/room/${roomId}`);
                }
            } else {
                setError(response.error || 'Failed to join room');
            }
        }
    };

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
                        style={{ backgroundColor: `${themeColor}10`, borderColor: `${themeColor}20` }}>
                        <span className="w-2 h-2 rounded-full animate-pulse"
                            style={{ backgroundColor: themeColor }} />
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
                                style={{ borderColor: nickname.trim() ? `${themeColor}30` : 'var(--border)' }}
                                onFocus={(e) => e.target.style.borderColor = themeColor}
                                onBlur={(e) => e.target.style.borderColor = nickname.trim() ? `${themeColor}30` : 'var(--border)'}
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
                                style={{ backgroundColor: themeColor, boxShadow: `0 0 30px ${themeColor}30` }}
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

                    {/* Pending Approval Overlay (Requirement 3 & 4) */}
                    <AnimatePresence>
                        {joinStatus === 'pending' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 z-50 bg-surface/95 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center space-y-6"
                            >
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                                    <Lock size={40} className="text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-text-main mb-2">Awaiting Approval</h2>
                                    <p className="text-text-main-muted text-sm">The room creator has been notified. You'll enter automatically once approved.</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
                                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
                                </div>
                                <button
                                    onClick={() => setJoinStatus('idle')}
                                    className="text-[10px] font-black text-text-main-muted/20 uppercase tracking-[0.3em] hover:text-text-main-muted transition-colors"
                                >
                                    Cancel Request
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Participants */}
                <div className="bg-background p-6 text-center border-t border-border flex flex-col items-center justify-center">
                    {
                        participantsList.length > 0 ? (
                            <>
                                <div className="flex -space-x-3 mb-3">
                                    {participantsList.map((p) => (
                                        <div key={p.id} className="w-10 h-10 rounded-full border-2 border-surface overflow-hidden bg-surface relative z-10 hover:z-20 transition-all hover:-translate-y-1">
                                            <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-text-main-muted">
                                    <span className="text-text-main/80 font-medium">
                                        {participantsList.slice(0, 2).map(p => p.name).join(', ')}
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
