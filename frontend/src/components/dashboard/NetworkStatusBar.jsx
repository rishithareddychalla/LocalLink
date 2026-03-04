import React from 'react';
import { Search, Loader2 } from 'lucide-react';

const NetworkStatusBar = ({
    nickname,
    lanIp,
    subnet,
    connectionStatus,
    nodeCount,
    isScanning,
    onScan,
    searchQuery,
    onSearchChange
}) => {
    return (
        <div className="flex flex-col gap-6 mb-8 md:mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1 md:mb-2 text-text-main italic uppercase">
                        Welcome, <span className="text-primary">{nickname || 'Guest'}</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <p className="text-text-main-muted text-xs md:text-sm font-bold tracking-widest uppercase">
                            Sub-net Radar View • <span className="text-text-main">{nodeCount} Active Nodes</span>
                        </p>
                        <div className="w-1 h-1 rounded-full bg-text/20 hidden md:block" />
                        <p className="text-text-main-muted text-xs md:text-sm font-bold tracking-widest uppercase">
                            IP: <span className="text-primary">{lanIp || 'Detecting...'}</span>
                        </p>
                        <div className="w-1 h-1 rounded-full bg-text/20 hidden md:block" />
                        <p className="text-text-main-muted text-xs md:text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                            Status:
                            <span className={
                                connectionStatus === 'connected' ? "text-green-500" :
                                    connectionStatus === 'connecting' ? "text-yellow-500 animate-pulse" : "text-red-500"
                            }>
                                {connectionStatus.toUpperCase()}
                            </span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onScan}
                        disabled={isScanning || connectionStatus !== 'connected'}
                        className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 transition-all active:scale-95 shadow-glow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isScanning && <Loader2 size={12} className="animate-spin" />}
                        {isScanning ? 'Scanning...' : 'Scan Subnet'}
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative group max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-main-muted group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    placeholder="Search devices by name or IP.."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-surface border border-border rounded-2xl py-4 pl-12 pr-6 text-xs font-bold tracking-widest text-text-main placeholder:text-text-main-muted/30 focus:outline-none focus:border-primary/30 focus:shadow-glow-sm transition-all uppercase"
                />
            </div>
        </div>
    );
};

export default NetworkStatusBar;
