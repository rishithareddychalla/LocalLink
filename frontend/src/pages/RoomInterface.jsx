import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    LogOut,
    User,
    Wifi,
    Paperclip,
    MoreVertical,
    Clock,
    FileText,
    MousePointer2,
    Pencil,
    Square,
    Circle,
    Type,
    Eraser,
    Image as ImageIcon,
    ArrowLeftRight,
    UploadCloud,
    ShieldCheck,
    Check,
    X,
    MessageSquare,
    Monitor,
    Users as UsersIcon,
    Info,
    AlertTriangle,
    Download,
    Bell
} from 'lucide-react';
import { MOCK_CHATS } from '../data/mockData';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import FileTransferModal from '../components/UI/FileTransferModal';
import SharedFilesModal from '../components/UI/SharedFilesModal';
import { useRoom } from '../context/RoomContext';
import { useFiles } from '../context/FileContext';
import { useNotifications } from '../context/NotificationContext';
import { useProfile } from '../context/ProfileContext';
import { useNetworkLog } from '../context/NetworkLogContext';
import { useNavigate } from 'react-router-dom';
import { useDrawpad } from '../hooks/useDrawpad';
import { useClickOutside } from '../hooks/useClickOutside';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const RoomInterface = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const {
        activeRoom,
        leaveRoom,
        participants,
        roomMetadata,
        roomFiles,
        chatMessages,
        sendMessage,
        timeLeft,
        userRoomPreferences,
        pendingRequests,
        approveJoinRequest,
        rejectJoinRequest
    } = useRoom();

    const { trackDownload, isBlocked } = useFiles();
    const { profile } = useProfile();
    const { addLogEvent } = useNetworkLog();
    const { notifications, unreadCount, markAsRead, clearNotifications } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    useClickOutside(notificationRef, () => {
        if (showNotifications) setShowNotifications(false);
    });

    const {
        brushColor,
        setBrushColor,
        brushSize,
        setBrushSize,
        activeTool,
        setActiveTool,
        startDrawing,
        draw,
        stopDrawing,
        exportToImage
    } = useDrawpad(canvasRef);

    const [message, setMessage] = useState('');
    const [showFileModal, setShowFileModal] = useState(false);
    const [showAllFilesModal, setShowAllFilesModal] = useState(false);
    const [activeTab, setActiveTab] = useState('board'); // 'chat', 'board', 'info'
    const [isMobile, setIsMobile] = useState(false);

    // Current Room Theme
    const activeTheme = userRoomPreferences?.selectedTheme || '#2563EB';

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Auto-terminate redirection
    useEffect(() => {
        // Only redirect if timeLeft is exactly 0 AND we have metadata (timer initialized)
        if (timeLeft === 0 && activeRoom && roomMetadata) {
            navigate('/rooms');
        }
    }, [timeLeft, activeRoom, navigate, roomMetadata]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const getUserTheme = (userName) => {
        if (userName === 'Me') return activeTheme;
        const p = participants.find(part =>
            part.nickname === userName || part.nickname?.split(' ')[0] === userName
        );
        return p?.accentColor || '#3B82F6';
    };

    const handleSendMessage = (e) => {
        if (e && e.key && e.key !== 'Enter') return;
        if (!message.trim()) return;
        sendMessage(message);
        setMessage('');
    };

    const ChatPanel = () => (
        <div className="flex flex-col h-full bg-surface lg:border border-border lg:rounded-2xl overflow-hidden shrink-0 w-full lg:w-80">
            <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-bold text-text-main leading-none mb-1">Room Chat</h2>
                    <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: activeTheme }}>128-bit Encrypted</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
                {chatMessages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-8">
                        <MessageSquare size={32} className="mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">No messages yet</p>
                    </div>
                )}
                {chatMessages.map((chat) => {
                    const isMe = chat.userId === profile.id;
                    const userTheme = getUserTheme(chat.user);
                    return (
                        <div key={chat.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                            <div className="flex items-center gap-1.5 mb-1 awareness-indicator">
                                <span className="text-[10px] font-bold text-text-main-muted">{chat.user}</span>
                                {!isMe && <div className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: userTheme }} />}
                            </div>
                            <div
                                className={cn(
                                    "px-4 py-2.5 text-sm max-w-[85%] shadow-lg transition-all hover:scale-[1.02]",
                                    isMe
                                        ? "text-black font-semibold rounded-2xl rounded-tr-sm"
                                        : "text-text-main/90 rounded-2xl rounded-tl-sm border border-border"
                                )}
                                style={{
                                    backgroundColor: isMe ? activeTheme : `${userTheme}15`,
                                    borderColor: isMe ? 'transparent' : `${userTheme}30`,
                                    boxShadow: isMe ? `0 10px 15px -3px ${activeTheme}40` : 'none'
                                }}
                            >
                                {chat.message}
                            </div>
                        </div>
                    );
                })}
                <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-background border-t border-border relative">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleSendMessage}
                    placeholder="Message..."
                    className="w-full bg-surface border border-border/50 rounded-full py-3.5 pl-5 pr-12 text-sm text-text-main focus:outline-none transition-colors placeholder:text-text-main-muted/20"
                    style={{ borderColor: `${activeTheme}20` }}
                    onFocus={(e) => e.target.style.borderColor = activeTheme}
                    onBlur={(e) => e.target.style.borderColor = ''}
                />
                <button
                    onClick={() => handleSendMessage()}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 text-black rounded-full flex items-center justify-center hover:opacity-90 active:scale-90 transition-all"
                    style={{ backgroundColor: activeTheme }}
                >
                    <Send size={14} />
                </button>
            </div>
        </div>
    );

    const InfoPanel = () => (
        <div className="flex flex-col gap-6 shrink-0 w-full lg:w-96">
            <div className="bg-surface border border-border rounded-2xl p-5 lg:flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-6 shrink-0">
                    <h2 className="text-xs font-bold text-text-main uppercase tracking-widest">Secure Transfer</h2>
                    {roomFiles.length > 3 && (
                        <button
                            onClick={() => setShowAllFilesModal(true)}
                            className="text-[10px] font-black uppercase tracking-tighter hover:underline"
                            style={{ color: activeTheme }}
                        >
                            View All ({roomFiles.length})
                        </button>
                    )}
                </div>
                <div
                    className="border-2 border-dashed border-border/50 rounded-2xl p-6 text-center transition-all cursor-pointer group mb-6 active:scale-[0.98] shrink-0"
                    onClick={() => setShowFileModal(true)}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = `${activeTheme}40`}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}
                >
                    <UploadCloud size={28} className="mx-auto mb-3 text-text-main-muted/20 transition-all"
                        style={{ color: 'rgba(255,255,255,0.2)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = activeTheme} />
                    <p className="text-[10px] font-bold text-text-main-muted uppercase tracking-widest group-hover:text-text-main transition-colors">Beam Assets</p>
                </div>

                <div className="space-y-3 overflow-y-auto no-scrollbar flex-1">
                    {roomFiles.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 py-8">
                            <FileText size={40} className="mb-2" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">No assets shared</p>
                        </div>
                    ) : (
                        [...roomFiles].reverse().slice(0, 3).map((file) => (
                            <div key={file.id} className={cn(
                                "bg-background/60 rounded-xl p-3 flex items-center gap-3 border transition-all",
                                file.isSafe ? "border-border" : "border-red-500/20 bg-red-500/5"
                            )}>
                                <div className={cn(
                                    "p-2 rounded-lg shrink-0",
                                    file.isSafe ? "bg-primary/10" : "bg-red-500/10"
                                )}>
                                    {file.isSafe ? (
                                        <FileText size={16} className="text-primary" />
                                    ) : (
                                        <AlertTriangle size={16} className="text-red-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className={cn(
                                            "text-[11px] font-bold truncate",
                                            file.isSafe ? "text-text-main" : "text-red-500/80"
                                        )}>
                                            {file.name}
                                        </p>
                                        {!file.isSafe && (
                                            <span className="text-[8px] bg-red-500 text-white font-black px-1 rounded">THREAT</span>
                                        )}
                                    </div>
                                    <p className="text-[9px] text-text-main-muted font-bold uppercase">
                                        {(file.size / 1024 / 1024).toFixed(1)} MB • {file.uploadedBy === 'Me' ? 'Local' : 'Peer'}
                                    </p>
                                </div>
                                {file.isSafe && file.downloadUrl !== '#' ? (
                                    <a
                                        href={file.downloadUrl}
                                        download={file.name}
                                        onClick={() => activeRoom && trackDownload(activeRoom.id, file)}
                                        className="p-1.5 hover:bg-text/5 rounded-md text-text-main-muted transition-colors"
                                        onMouseEnter={(e) => e.currentTarget.style.color = activeTheme}
                                        onMouseLeave={(e) => e.currentTarget.style.color = ''}
                                    >
                                        <Download size={14} className="rotate-180" />
                                    </a>
                                ) : (
                                    <div className="p-1.5 flex items-center justify-center">
                                        <div className={cn("w-2 h-2 rounded-full", isBlocked(file.id) ? "bg-red-500 animate-pulse" : "bg-text/10")} />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xs font-bold text-text-main uppercase tracking-widest">Participants</h2>
                    <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded"
                        style={{ color: activeTheme, backgroundColor: `${activeTheme}10` }}
                    >
                        {participants.filter(p => p.isActive).length} ACTIVE
                    </span>
                </div>
                <div className="flex flex-row items-start gap-4 overflow-x-auto no-scrollbar pb-2">
                    {/* Active Participants */}
                    {participants.map((p, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 group shrink-0">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-surface border border-border">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.avatar || p.name}`} alt={p.name} className="w-full h-full object-cover" />
                                </div>
                                <div className={cn(
                                    "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface",
                                    p.isActive ? "bg-green-500" : "bg-text/10"
                                )} />
                            </div>
                            <span className="text-[10px] font-bold text-text-main-muted group-hover:text-text-main transition-colors truncate max-w-[64px] text-center">{p.name}</span>
                        </div>
                    ))}

                    {/* Pending Requests (Creator Only) */}
                    {activeRoom?.type === 'owner' && pendingRequests.map((p, i) => (
                        <div key={`pending-${i}`} className="flex flex-col items-center gap-2 group shrink-0 relative">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-surface border border-primary/30 opacity-60 grayscale">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.nickname || p.name}`} alt={p.nickname} className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -top-1 -right-1 flex gap-0.5">
                                    <button
                                        onClick={() => approveJoinRequest(p.id)}
                                        className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-black border-2 border-surface hover:scale-110 transition-transform"
                                    >
                                        <Check size={10} strokeWidth={4} />
                                    </button>
                                    <button
                                        onClick={() => rejectJoinRequest(p.id)}
                                        className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white border-2 border-surface hover:scale-110 transition-transform"
                                    >
                                        <X size={10} strokeWidth={4} />
                                    </button>
                                </div>
                            </div>
                            <span className="text-[9px] font-black text-primary uppercase tracking-tighter">Pending</span>
                        </div>
                    ))}

                    <button className="w-10 h-10 rounded-full bg-text/[0.03] hover:bg-text/[0.08] text-text-main flex items-center justify-center shrink-0 border border-border transition-all">
                        <UsersIcon size={14} style={{ color: activeTheme }} />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col min-h-[calc(100vh-120px)] lg:min-h-[calc(100vh-140px)] bg-background overflow-y-auto custom-scrollbar pb-8">
            {/* Header */}
            <header className="flex flex-col sm:flex-row items-center justify-between mb-4 md:mb-6 gap-4 shrink-0">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${activeTheme}10` }}
                    >
                        <Wifi style={{ color: activeTheme }} size={20} />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-lg md:text-xl font-black text-text-main tracking-tight uppercase truncate">
                            {roomMetadata?.roomName || 'Active Room'}
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black tracking-widest" style={{ color: activeTheme }}>ENCRYPTED TUNNEL</span>
                            <div className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: activeTheme }} />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2 bg-surface border border-border pl-2.5 pr-4 py-1.5 rounded-full">
                        <div
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: activeTheme }}
                        >
                            <Clock size={10} className="text-background stroke-[3]" />
                        </div>
                        <span className="text-xs md:text-sm font-black text-text-main/90 tracking-widest">{formatTime(timeLeft)}</span>
                    </div>

                    {/* Notifications Bell */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="w-10 h-10 rounded-full bg-text/[0.03] hover:bg-text/[0.08] text-text-main flex items-center justify-center shrink-0 border border-border transition-all relative"
                        >
                            <Bell size={16} style={{ color: activeTheme }} />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                                >
                                    <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
                                        <h3 className="text-sm font-bold text-text-main">Notifications</h3>
                                        {notifications.length > 0 && (
                                            <button onClick={clearNotifications} className="text-[10px] text-text-main-muted hover:text-text-main uppercase font-bold transition-colors">Clear All</button>
                                        )}
                                    </div>
                                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-text-main-muted/20 text-xs">No notifications yet</div>
                                        ) : (
                                            notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => markAsRead(n.id)}
                                                    className={cn(
                                                        "p-4 border-b border-border hover:bg-text/5 cursor-pointer transition-colors relative",
                                                        !n.read && "bg-primary/5"
                                                    )}
                                                >
                                                    {!n.read && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />}
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <div className={cn("w-2 h-2 rounded-full", n.type === 'threat' ? "bg-red-500" : "bg-blue-500")} />
                                                        <p className="text-[10px] font-bold text-text-main-muted/60 uppercase tracking-widest">{n.title}</p>
                                                    </div>
                                                    <p className="text-sm text-text-main font-medium mb-1 line-clamp-2">{n.message}</p>
                                                    {n.fileName && <p className="text-[10px] text-primary/60 font-mono italic mb-1">{n.fileName}</p>}
                                                    <p className="text-[9px] text-text-main-muted/20 font-bold uppercase">{new Date(n.timestamp).toLocaleTimeString()}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={async () => {
                            await leaveRoom();
                            navigate('/rooms');
                        }}
                        className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 border border-red-500/20"
                    >
                        <LogOut size={14} className="inline mr-2" />
                        <span className="hidden xs:inline">Leave</span>
                    </button>
                </div>
            </header>

            {/* Mobile Tab Navigation */}
            <div className="lg:hidden flex border-b border-border mb-4 shrink-0">
                {[
                    { id: 'chat', label: 'Chat', icon: MessageSquare },
                    { id: 'board', label: 'Board', icon: Monitor },
                    { id: 'info', label: 'Info', icon: Info }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex-1 py-4 flex flex-col items-center gap-1.5 transition-all relative",
                            activeTab === tab.id ? "" : "text-text-main-muted"
                        )}
                        style={activeTab === tab.id ? { color: activeTheme } : {}}
                    >
                        <tab.icon size={18} />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabDoc"
                                className="absolute bottom-0 left-0 right-0 h-0.5"
                                style={{ backgroundColor: activeTheme }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex gap-6 min-h-0 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {(!isMobile || activeTab === 'chat') && (
                        <motion.div
                            key="chat"
                            initial={isMobile ? { opacity: 0, x: -20 } : {}}
                            animate={{ opacity: 1, x: 0 }}
                            exit={isMobile ? { opacity: 0, x: -20 } : {}}
                            className={cn(isMobile ? "absolute inset-0 z-10" : "flex h-full")}
                        >
                            <ChatPanel />
                        </motion.div>
                    )}

                    {(!isMobile || activeTab === 'board') && (
                        <motion.div
                            key="board"
                            initial={isMobile ? { opacity: 0, scale: 0.95 } : {}}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={isMobile ? { opacity: 0, scale: 0.95 } : {}}
                            className={cn(
                                "flex-1 rounded-2xl border-2 border-dashed bg-surface/30 flex flex-col items-center justify-center relative overflow-hidden group",
                                isMobile ? "m-0" : ""
                            )}
                            style={{ borderColor: `${activeTheme}20` }}
                        >
                            {/* Canvas Implementation */}
                            <canvas
                                ref={canvasRef}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                className="absolute inset-0 w-full h-full cursor-crosshair z-10"
                            />

                            <div className="text-center relative z-0 p-6 pointer-events-none opacity-20">
                                <div
                                    className="w-16 h-1 w-1 rounded-full mx-auto mb-4 animate-pulse"
                                    style={{ backgroundColor: `${activeTheme}40` }}
                                />
                                <p className="text-[10px] md:text-xs text-text-main-muted font-black tracking-[0.3em] uppercase">Shared Workspace</p>
                                <h3 className="text-text-main/20 text-xs mt-2 italic font-medium">Vector Engine v.2 Active</h3>
                            </div>

                            {/* Tools - Adjusted for mobile */}
                            <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 md:gap-2 bg-surface/80 backdrop-blur-xl border border-border p-1.5 rounded-2xl shadow-2xl z-20 max-w-[90vw] overflow-x-auto no-scrollbar">
                                <button
                                    onClick={() => setActiveTool('select')}
                                    className={cn(
                                        "w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-xl flex items-center justify-center transition-all",
                                        activeTool === 'select' ? "" : "text-text-main-muted/30 hover:bg-text/5"
                                    )}
                                    style={activeTool === 'select' ? { backgroundColor: `${activeTheme}10`, color: activeTheme } : {}}
                                >
                                    <MousePointer2 size={16} />
                                </button>
                                <button
                                    onClick={() => setActiveTool('pencil')}
                                    className={cn(
                                        "w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-xl flex items-center justify-center transition-all",
                                        activeTool === 'pencil' ? "text-text-main" : "text-text-main-muted/30 hover:bg-text/5"
                                    )}
                                    style={activeTool === 'pencil' ? { color: activeTheme, backgroundColor: `${activeTheme}10` } : {}}
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => setActiveTool('square')}
                                    className={cn(
                                        "w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-xl flex items-center justify-center transition-all",
                                        activeTool === 'square' ? "text-text-main" : "text-text-main-muted/30 hover:bg-text/5"
                                    )}
                                    style={activeTool === 'square' ? { color: activeTheme, backgroundColor: `${activeTheme}10` } : {}}
                                >
                                    <Square size={14} />
                                </button>
                                <button
                                    onClick={() => setActiveTool('circle')}
                                    className={cn(
                                        "w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-xl flex items-center justify-center transition-all",
                                        activeTool === 'circle' ? "text-text-main" : "text-text-main-muted/30 hover:bg-text/5"
                                    )}
                                    style={activeTool === 'circle' ? { color: activeTheme, backgroundColor: `${activeTheme}10` } : {}}
                                >
                                    <Circle size={16} />
                                </button>
                                <div className="h-6 w-px bg-border/50 mx-0.5" />
                                <button
                                    onClick={() => setActiveTool('eraser')}
                                    className={cn(
                                        "w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-xl flex items-center justify-center transition-all",
                                        activeTool === 'eraser' ? "text-text-main" : "text-text-main-muted/30 hover:bg-text/5"
                                    )}
                                    style={activeTool === 'eraser' ? { color: activeTheme, backgroundColor: `${activeTheme}10` } : {}}
                                >
                                    <Eraser size={16} className="transform -rotate-45" />
                                </button>
                                <button
                                    onClick={() => {
                                        const data = exportToImage();
                                        if (data) {
                                            const link = document.createElement('a');
                                            link.download = `locallink-draw-${Date.now()}.png`;
                                            link.href = data;
                                            link.click();
                                        }
                                    }}
                                    className="w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-xl hover:bg-text/5 flex items-center justify-center text-text-main-muted/30 transition-all"
                                >
                                    <Download size={16} />
                                </button>
                            </div>

                            {/* Mobile specific zoom indicator */}
                            <div className="absolute bottom-4 right-4 text-[8px] font-black text-text-main-muted/20 uppercase tracking-widest bg-background/40 px-3 py-1.5 rounded-full border border-border">
                                Vector Engine v.2 • Active
                            </div>
                        </motion.div>
                    )}

                    {(!isMobile || activeTab === 'info') && (
                        <motion.div
                            key="info"
                            initial={isMobile ? { opacity: 0, x: 20 } : {}}
                            animate={{ opacity: 1, x: 0 }}
                            exit={isMobile ? { opacity: 0, x: 20 } : {}}
                            className={cn(isMobile ? "absolute inset-0 z-10 overflow-y-auto no-scrollbar" : "flex flex-col")}
                        >
                            <InfoPanel />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <FileTransferModal isOpen={showFileModal} onClose={() => setShowFileModal(false)} />
            <SharedFilesModal
                isOpen={showAllFilesModal}
                onClose={() => setShowAllFilesModal(false)}
                activeTheme={activeTheme}
            />
        </div>
    );
};

export default RoomInterface;
