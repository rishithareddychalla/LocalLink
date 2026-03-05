import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Radio, FolderOpen, Settings, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import useStore from '../../store/useStore';
import { useRoom } from '../../context/RoomContext';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Sidebar = () => {
    const location = useLocation();
    const { toggleSidebar } = useStore();
    const { activeRoom } = useRoom();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        {
            icon: Radio,
            label: 'Rooms',
            path: activeRoom ? `/room/${activeRoom.id}` : '/rooms',
            activePaths: ['/rooms', '/room']
        },
        { icon: FolderOpen, label: 'Files', path: '/files' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className="w-64 h-screen bg-background border-r border-white/[0.02] flex flex-col transition-all duration-300">
            {/* Header */}
            <div className="p-8 pb-4 relative">
                <button
                    onClick={toggleSidebar}
                    className="absolute right-4 top-8 p-1 text-text-main-muted hover:text-text-main lg:hidden"
                >
                    <X size={20} />
                </button>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-background font-bold text-xl leading-none">
                                radar
                            </span>
                        </div>
                        <h2 className="text-text-main text-xl font-bold tracking-tight">
                            LocalLink
                        </h2>
                    </div>
                    <p className="text-[10px] text-text-main-muted tracking-[0.3em] font-black uppercase">Sub-net • v1.0.2</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.activePaths
                        ? item.activePaths.some(p => location.pathname.startsWith(p))
                        : location.pathname.startsWith(item.path);

                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            onClick={() => {
                                if (window.innerWidth < 1024) toggleSidebar();
                            }}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold",
                                isActive
                                    ? "bg-primary/10 text-primary border border-primary/20 shadow-neon"
                                    : "text-text-main-muted hover:text-text-main hover:bg-text/5 border border-transparent"
                            )}
                        >
                            <Icon size={20} className={isActive ? "text-primary" : "text-text-main-muted"} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

        </aside>
    );
};

export default Sidebar;
