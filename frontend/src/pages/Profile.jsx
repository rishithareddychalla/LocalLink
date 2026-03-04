import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ChevronRight,
    Shield,
    History,
    Globe,
    Settings2,
    ArrowLeft,
    Check,
    X,
    Plus,
    LayoutGrid,
    Info,
    Coffee,
    Terminal,
    MapPin,
    UserCircle,
    LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';

const Profile = () => {
    const navigate = useNavigate();
    const { user, logout } = useSession();
    const [nickname, setNickname] = useState(user?.nickname || 'Ghost_User');
    const [status, setStatus] = useState('Available');
    const [incognito, setIncognito] = useState(true);
    const [showLog, setShowLog] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(0);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const avatars = [
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.nickname || 'Guest'}`, // Current Dynamic
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200", // Blue blob 3D
        "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=80&w=200", // Pink abstract
        "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=200", // Circular neon
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=200", // Gold abstract
        "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=200", // Silver liquid
        "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=200", // Blue light orb
    ];

    const activities = [
        { id: 1, action: "Session Initialized", time: "Just now", detail: "Encrypted JWT generated", icon: Shield },
        { id: 2, action: "Joined 'Central Perk Cafe'", time: "2 hours ago", detail: "Location shared with 12 others", icon: Coffee },
        { id: 3, action: "Joined 'Tech Meetup 2024'", time: "5 hours ago", detail: "Networking enabled", icon: Terminal },
    ];

    return (
        <div className="min-h-screen bg-background text-text-main p-4 sm:p-6 md:p-8 overflow-x-hidden relative flex flex-col items-center pb-20 md:pb-8">
            {/* Background Glows */}
            <div className="absolute top-0 right-1/4 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-primary/5 blur-[60px] md:blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-blue-500/5 blur-[60px] md:blur-[100px] rounded-full pointer-events-none" />

            <div className="w-full max-w-5xl space-y-6 md:space-y-8 relative z-10">

                {/* Header / Back */}
                <div className="flex items-center justify-between mb-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-text-main-muted hover:text-text-main transition-colors group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em]">NAVIGATE BACK</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-500/60 hover:text-red-500 transition-colors group px-4 py-2 bg-red-500/5 border border-red-500/10 rounded-xl"
                    >
                        <LogOut size={16} />
                        <span className="font-black text-[9px] uppercase tracking-[0.2em]">TERMINATE SESSION</span>
                    </button>
                </div>

                {/* Identity Section */}
                <motion.section
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="glass-panel p-6 sm:p-8 rounded-[28px] md:rounded-[32px] bg-surface/80 border border-border flex flex-col md:flex-row items-center gap-6 md:gap-10 shadow-2xl overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />

                    <div className="relative group shrink-0">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1 border border-primary/20 bg-surface/40 shadow-2xl relative">
                            <div className="w-full h-full rounded-full overflow-hidden relative">
                                <img
                                    src={avatars[selectedAvatar]}
                                    alt="Profile"
                                    className="w-full h-full object-cover transition-all duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-60" />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-6 w-full text-center md:text-left">
                        <div className="space-y-1.5">
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-text-main uppercase italic">Ghost Profile</h2>
                            <p className="text-text-main-muted text-[10px] md:text-xs font-bold uppercase tracking-widest px-4 md:px-0">Identity synchronized via LocalLink Network</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2 text-left">
                                <label className="text-[9px] font-black text-text-main-muted/30 uppercase tracking-[0.4em] pl-1">Nickname</label>
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="w-full bg-surface/40 border border-border rounded-2xl py-3.5 px-5 text-sm text-text-main focus:outline-none focus:border-primary/40 focus:bg-surface/80 transition-all font-bold tracking-wide"
                                />
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-[9px] font-black text-text-main-muted/30 uppercase tracking-[0.4em] pl-1">Visibility Status</label>
                                <div className="relative group cursor-pointer">
                                    <div className="w-full bg-surface/40 border border-border rounded-2xl py-3 px-5 text-sm text-text-main/80 flex items-center justify-between group-hover:border-border transition-all h-[47px]">
                                        <span className="font-bold">{status}</span>
                                        <ChevronRight size={14} className="text-text-main-muted/20 transform rotate-90" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Avatar Selection */}
                <motion.section
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="glass-panel p-6 sm:p-8 rounded-[28px] md:rounded-[32px] bg-surface/80 border border-border space-y-6 shadow-xl"
                >
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <UserCircle className="text-primary/40" size={20} />
                            <h3 className="text-base md:text-lg font-black text-text-main uppercase tracking-tight">Cores</h3>
                        </div>
                    </div>

                    <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar items-center px-1">
                        {avatars.map((url, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedAvatar(i)}
                                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] overflow-hidden border-2 transition-all duration-300 relative shrink-0 ${selectedAvatar === i ? "border-primary scale-110 shadow-glow-sm" : "border-transparent opacity-30 hover:opacity-100 hover:scale-105"
                                    }`}
                            >
                                <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                                {selectedAvatar === i && (
                                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-2xl">
                                            <Check size={12} className="text-black" />
                                        </div>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </motion.section>

                {/* Bottom Row Containers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <motion.section
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="glass-panel p-6 sm:p-7 rounded-[28px] md:rounded-[32px] bg-surface/80 border border-border space-y-6 shadow-xl flex flex-col"
                    >
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <History className="text-primary" size={16} />
                                <h3 className="text-xs md:text-sm font-black text-text-main uppercase tracking-widest">Network Log</h3>
                            </div>
                            <button className="text-[9px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-70 transition-colors">HISTORY</button>
                        </div>

                        <div className="space-y-3 flex-1 overflow-hidden">
                            {activities.map((item) => (
                                <div key={item.id} className="bg-surface/30 p-4 rounded-2xl border border-border flex items-center justify-between group cursor-pointer hover:bg-surface/50 hover:border-border transition-all">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-9 h-9 bg-text/[0.03] border border-border rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-all">
                                            <item.icon className="text-text-main-muted/40 group-hover:text-primary" size={16} />
                                        </div>
                                        <div className="space-y-0.5 truncate">
                                            <h4 className="text-[12px] font-black text-text-main/80 group-hover:text-text-main truncate">{item.action}</h4>
                                            <p className="text-[9px] text-text-main-muted/30 font-bold uppercase tracking-tight truncate">{item.time} • {item.detail}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="text-text-main-muted/10 group-hover:text-text-main transition-colors shrink-0" />
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Privacy Settings */}
                    <motion.section
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="glass-panel p-6 sm:p-7 rounded-[28px] md:rounded-[32px] bg-surface/80 border border-border space-y-8 shadow-xl"
                    >
                        <div className="flex items-center gap-2 px-1">
                            <Shield className="text-green-500/60" size={16} />
                            <h3 className="text-xs md:text-sm font-black text-text-main uppercase tracking-widest">Encryption & Privacy</h3>
                        </div>

                        <div className="space-y-6">
                            {[
                                { id: 'incognito', label: 'Ghost Mode', desc: 'Hide presence from unknown subnet peers', state: incognito, set: setIncognito },
                                { id: 'log', label: 'Telemetry', desc: 'Share activity log within active rooms', state: showLog, set: setShowLog }
                            ].map((opt) => (
                                <div key={opt.id} className="flex items-center justify-between group px-1">
                                    <div className="space-y-1 pr-4">
                                        <h4 className="text-[12px] font-black text-text-main/80 uppercase tracking-wide">{opt.label}</h4>
                                        <p className="text-[10px] text-text-main-muted/30 font-medium leading-tight">{opt.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => opt.set(!opt.state)}
                                        className={`w-11 h-6 rounded-full relative transition-all duration-300 shrink-0 ${opt.state ? "bg-primary shadow-glow-sm" : "bg-text/10"}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${opt.state ? "left-6" : "left-1"}`} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex gap-3">
                            <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                <Info className="text-amber-500/60" size={14} />
                            </div>
                            <p className="text-[9px] text-amber-500/60 leading-normal font-bold uppercase tracking-tight">Identity updates propagate to local peers within 500ms over active WebRTC tunnels.</p>
                        </div>
                    </motion.section>
                </div>

                {/* Footer Buttons */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row justify-center md:justify-end gap-3 pt-4 sm:pt-6"
                >
                    <button
                        onClick={() => navigate('/')}
                        className="order-1 sm:order-2 px-10 py-4 bg-primary text-black rounded-2xl font-black text-[10px] shadow-glow hover:shadow-glow-lg transition-all active:scale-[0.98] uppercase tracking-[0.2em]"
                    >
                        Sync Interface
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
