import React from 'react';
import { Users, Search, Bell, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { useNotifications } from '../../context/NotificationContext';
import { useProfile } from '../../context/ProfileContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useClickOutside } from '../../hooks/useClickOutside';

const Navbar = () => {
    const navigate = useNavigate();
    const { toggleSidebar } = useStore();
    const { notifications, unreadCount, markAsRead, clearNotifications } = useNotifications();
    const { profile } = useProfile();
    const [showNotifications, setShowNotifications] = React.useState(false);
    const notificationRef = React.useRef(null);

    useClickOutside(notificationRef, () => {
        if (showNotifications) setShowNotifications(false);
    });

    // Reuse the same cn function if not available globally, or just use strings
    const cn = (...classes) => classes.filter(Boolean).join(' ');

    return (
        <header className="h-20 flex items-center justify-between px-4 md:px-8 bg-surface border-b border-border">
            <div className="flex items-center gap-4 md:gap-6">
                <button
                    onClick={toggleSidebar}
                    className="p-2 text-text-main-muted hover:text-text-main lg:hidden"
                >
                    <Menu size={24} />
                </button>
                <div className="flex items-center gap-2 text-primary text-[10px] md:text-sm font-medium truncate max-w-[150px] md:max-w-none">
                    <Users size={16} className="shrink-0" />
                    <span className="truncate">LAN 192.168.1.104</span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 md:gap-6" ref={notificationRef}>
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors relative"
                        >
                            <Bell size={20} className="text-text-main-muted hover:text-text-main" />
                            {unreadCount > 0 && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-surface animate-pulse" />
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                                >
                                    <div className="p-4 border-b border-border flex items-center justify-between bg-background">
                                        <h3 className="text-sm font-bold text-text-main">Notifications</h3>
                                        {notifications.length > 0 && (
                                            <button onClick={clearNotifications} className="text-[10px] text-text-main-muted hover:text-text-main uppercase font-bold transition-colors">Clear All</button>
                                        )}
                                    </div>
                                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-text-main-muted/40 text-xs">No notifications yet</div>
                                        ) : (
                                            notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => markAsRead(n.id)}
                                                    className={cn(
                                                        "p-4 border-b border-border hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors relative",
                                                        !n.read && "bg-primary/5"
                                                    )}
                                                >
                                                    {!n.read && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />}
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <div className={cn("w-2 h-2 rounded-full", n.type === 'threat' ? "bg-red-500" : "bg-blue-500")} />
                                                        <p className="text-[10px] font-bold text-text-main-muted uppercase tracking-widest">{n.title}</p>
                                                    </div>
                                                    <p className="text-sm text-text-main font-medium mb-1 line-clamp-2">{n.message}</p>
                                                    {n.fileName && <p className="text-[10px] text-primary/60 font-mono italic mb-1">{n.fileName}</p>}
                                                    <p className="text-[9px] text-text-main-muted font-bold uppercase">{new Date(n.timestamp).toLocaleTimeString()}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div
                        onClick={() => navigate('/profile')}
                        className="flex items-center gap-3 cursor-pointer group"
                    >
                        <div className="text-right group-hover:opacity-80 transition-opacity hidden sm:block">
                            <p className="text-sm font-bold text-text-main truncate max-w-[100px]">{profile?.nickname || 'Guest'}</p>
                            <p className="text-[10px] text-text-main-muted font-medium tracking-wide">Guest Session</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-background overflow-hidden border border-border group-hover:border-primary transition-all active:scale-95 shadow-lg">
                            <img src={profile?.avatar} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
