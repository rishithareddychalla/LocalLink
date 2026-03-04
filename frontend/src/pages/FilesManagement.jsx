import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Bell,
    Upload,
    FileText,
    Image as ImageIcon,
    File,
    Download,
    Eye,
    Trash2,
    Cloud
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import FileTransferModal from '../components/UI/FileTransferModal';
import { useFiles } from '../context/FileContext';
import { useRoom } from '../context/RoomContext';
import { useNotifications } from '../context/NotificationContext';
import { useClickOutside } from '../hooks/useClickOutside';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const FilesManagement = () => {
    const [activeTab, setActiveTab] = useState('All Files');
    const [showFileModal, setShowFileModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    useClickOutside(notificationRef, () => {
        if (showNotifications) setShowNotifications(false);
    });

    const { userFiles, roomFilesMap, trackDownload, isBlocked } = useFiles();
    const { activeRoom } = useRoom();
    const { notifications, unreadCount, markAsRead, clearNotifications } = useNotifications();

    const tabs = ['All Files', 'Downloaded', 'Shared by Me', 'Recent'];

    const getFileIconType = (type) => {
        if (!type) return 'default';
        if (type.includes('image')) return 'image';
        if (type.includes('pdf')) return 'pdf';
        if (type.includes('word') || type.includes('officedocument')) return 'word';
        if (type.includes('text')) return 'text';
        return 'default';
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const filteredFiles = useMemo(() => {
        const currentRoomFiles = activeRoom ? (roomFilesMap[activeRoom.id] || []) : [];
        const allHistory = [...userFiles.downloaded, ...userFiles.sharedByMe];

        // Helper to deduplicate while prioritizing files that have a downloadUrl (current room files)
        const deduplicate = (files) => {
            const map = new Map();
            files.forEach(file => {
                const existing = map.get(file.id);
                // Keep if new, or if current has downloadUrl and existing doesn't
                if (!existing || (file.downloadUrl && !existing.downloadUrl)) {
                    map.set(file.id, file);
                }
            });
            return Array.from(map.values());
        };

        const getTimestamp = (f) => {
            const timeStr = f.uploadedAt || f.downloadedAt || f.sharedAt;
            return timeStr ? new Date(timeStr).getTime() : 0;
        };

        let list = [];

        switch (activeTab) {
            case 'All Files':
                // Union of everything known
                list = deduplicate([...currentRoomFiles, ...allHistory]);
                // Sort by name for "All Files"
                list.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'Downloaded':
                list = userFiles.downloaded;
                break;
            case 'Shared by Me':
                list = userFiles.sharedByMe;
                break;
            case 'Recent':
                // Union of everything, sorted by date
                list = deduplicate([...currentRoomFiles, ...allHistory]);
                list.sort((a, b) => getTimestamp(b) - getTimestamp(a));
                break;
            default:
                list = [];
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(f =>
                f.name.toLowerCase().includes(q) ||
                (f.type && f.type.toLowerCase().includes(q)) ||
                (f.uploadedBy && f.uploadedBy.toLowerCase().includes(q))
            );
        }

        return list;
    }, [activeTab, activeRoom, roomFilesMap, userFiles, searchQuery]);

    const getFileIcon = (type) => {
        const iconType = getFileIconType(type);
        switch (iconType) {
            case 'text':
                return { icon: FileText, bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]' };
            case 'pdf':
                return { icon: File, bg: 'bg-[#EF4444]/10', text: 'text-[#EF4444]' };
            case 'word':
                return { icon: FileText, bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]' };
            case 'image':
                return { icon: ImageIcon, bg: 'bg-[#8B5CF6]/10', text: 'text-[#8B5CF6]' };
            default:
                return { icon: File, bg: 'bg-primary/10', text: 'text-primary' };
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)]">
            {/* Header Area */}
            <div className="flex flex-col gap-6 mb-8 bg-surface border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-text-main">Network Files</h1>

                    <div className="flex items-center gap-4">
                        <div className="relative w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-main-muted" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search files, types, or members..."
                                className="w-full bg-background border border-border focus:border-primary/50 rounded-full py-2 pl-10 pr-4 text-sm text-text-main focus:outline-none transition-colors placeholder:text-text-main-muted"
                            />
                        </div>

                        <div className="relative" ref={notificationRef}>


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
                                                <div className="p-8 text-center text-text-main-muted text-xs">No notifications yet</div>
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

                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-8 border-b border-border pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "text-sm font-bold pb-2 relative transition-colors",
                                activeTab === tab ? "text-primary" : "text-text-main-muted hover:text-text-main/70"
                            )}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-primary"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 bg-surface border border-border rounded-2xl overflow-hidden flex flex-col min-h-0">
                <div className="overflow-x-auto select-none flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border text-[10px] font-bold text-text-main-muted tracking-widest uppercase">
                                <th className="px-6 py-4 font-bold">Name</th>
                                <th className="px-6 py-4 font-bold">Size</th>
                                <th className="px-6 py-4 font-bold">Shared By</th>
                                <th className="px-6 py-4 font-bold">Time</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredFiles.map((file) => {
                                const FileIconData = getFileIcon(file.type);
                                const IconComponent = FileIconData.icon;
                                const isFromRoom = activeRoom && (roomFilesMap[activeRoom.id] || []).some(rf => rf.id === file.id);

                                return (
                                    <tr key={file.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", FileIconData.bg)}>
                                                    <IconComponent className={FileIconData.text} size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-text-main">{file.name}</p>
                                                    <p className="text-[10px] text-text-main-muted">{file.type || 'Unknown Type'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-main-muted">{formatSize(file.size)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-text-main">
                                                <div className="w-6 h-6 rounded-full overflow-hidden bg-background border border-border">
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${file.uploadedBy || 'v0'}`} alt={file.uploadedBy} className="w-full h-full object-cover" />
                                                </div>
                                                {file.uploadedBy || 'System'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-main-muted">
                                            {(() => {
                                                const time = file.uploadedAt || file.sharedAt || file.downloadedAt;
                                                return time ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now';
                                            })()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border",
                                                isBlocked(file.id)
                                                    ? "bg-red-500/10 text-red-500 border-red-500/20"
                                                    : isFromRoom
                                                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                        : "bg-primary/10 text-primary border-primary/20"
                                            )}>
                                                {isBlocked(file.id) ? 'BLOCKED' : isFromRoom ? 'AVAILABLE' : 'HISTORY'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {file.downloadUrl && file.downloadUrl !== '#' && (
                                                    <a
                                                        href={file.downloadUrl}
                                                        download={file.name}
                                                        onClick={() => activeRoom && trackDownload(activeRoom.id, file)}
                                                        className="text-text-main-muted hover:text-text-main transition-colors"
                                                    >
                                                        <Download size={16} />
                                                    </a>
                                                )}
                                                <button className="text-text-main-muted hover:text-text-main transition-colors">
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Drop Zone Footer inside table panel */}
                <div className="p-6 border-t border-border bg-background/50 mt-auto">
                    <div onClick={() => setShowFileModal(true)} className="border border-dashed border-primary/20 rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer group bg-primary/5">
                        <Cloud className="mx-auto mb-3 text-primary group-hover:scale-110 transition-transform duration-300" size={32} />
                        <h4 className="text-base font-bold text-text-main mb-1">Need more files?</h4>
                        <p className="text-xs text-text-main-muted">Drag and drop files here to share with everyone on the radar.</p>
                    </div>
                </div>
            </div>

            <FileTransferModal isOpen={showFileModal} onClose={() => setShowFileModal(false)} />
        </div>
    );
};

export default FilesManagement;
