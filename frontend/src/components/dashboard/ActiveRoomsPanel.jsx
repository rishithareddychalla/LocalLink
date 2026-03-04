import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertTriangle, Loader2, Search } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const ActiveRoomsPanel = ({ rooms, loading, error }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredRooms = rooms.filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.visibility.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full xl:w-80 flex flex-col pt-2 border-t xl:border-t-0 xl:border-l border-border xl:pl-8 mt-4 xl:mt-0 xl:overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-text-main tracking-tight uppercase italic">Active Nodes</h2>
                {!loading && !error && (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full animate-pulse blur-[0.2px]">
                        {rooms.length} LIVE
                    </span>
                )}
            </div>

            {/* Search Bar */}
            {!loading && !error && rooms.length > 0 && (
                <div className="relative mb-6 group">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-main-muted group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="FILTER NODES..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl py-2.5 pl-9 pr-4 text-[10px] font-bold tracking-widest text-text-main placeholder:text-text-main-muted/30 focus:outline-none focus:border-primary/30 transition-all uppercase"
                    />
                </div>
            )}

            {error ? (
                <div className="flex flex-col items-center justify-center p-8 bg-red-500/5 border border-red-500/10 rounded-2xl text-center">
                    <AlertTriangle className="text-red-500 mb-3" size={32} />
                    <h3 className="text-sm font-bold text-text-main mb-1">Failed to load nodes</h3>
                    <p className="text-[10px] text-text-main-muted mb-4 line-clamp-2">{error.message || 'Check your network connection'}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            ) : loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative mb-6">
                        <div className="w-12 h-12 border-2 border-primary/20 rounded-full" />
                        <Loader2 className="w-12 h-12 text-primary absolute inset-0 animate-spin" />
                    </div>
                    <p className="text-[10px] font-bold text-text-main-muted uppercase tracking-[0.2em] animate-pulse">Fetching active nodes...</p>
                </div>
            ) : filteredRooms.length === 0 ? (
                <div className="text-center py-10 opacity-20 italic text-xs text-text-main">
                    No matching nodes found...
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
                    {filteredRooms.map((room) => (
                        <div key={room.id} className="bg-surface border border-border rounded-2xl p-5 hover:border-text/10 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-xs md:text-sm text-text-main mb-1 group-hover:text-primary transition-colors">{room.name}</h3>
                                    <p className="text-[10px] md:text-xs text-text-main-muted font-medium">{room.connectedCount} connected</p>
                                </div>
                                <span className={cn(
                                    "text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded",
                                    room.visibility === 'public' ? "text-green-500 bg-green-500/10" : "text-primary/70 bg-primary/10"
                                )}>
                                    {room.visibility.toUpperCase()}
                                </span>
                            </div>

                            <div className="flex -space-x-2 mb-5">
                                {room.participants.map((participant) => (
                                    <div key={participant.id} className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-surface bg-background overflow-hidden">
                                        <img src={participant.avatar} alt={participant.name} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => navigate(`/join/${room.id}`)}
                                className={cn(
                                    "w-full py-3 rounded-xl text-[10px] md:text-xs font-bold transition-all flex items-center justify-center gap-2 relative active:scale-[0.98]",
                                    room.visibility === 'private'
                                        ? "bg-text/5 text-text-main-muted hover:bg-text/10 hover:text-text-main border border-border"
                                        : "bg-primary text-black hover:shadow-glow"
                                )}>
                                {room.visibility === 'private' && <Lock size={12} className="opacity-60" />}
                                {room.visibility === 'private' ? 'REQUEST ACCESS' : 'JOIN ROOM'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActiveRoomsPanel;
