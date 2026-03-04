import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../../context/RoomContext';

const ActiveSessionBanner = () => {
    const navigate = useNavigate();
    const { activeRoom } = useRoom();

    if (!activeRoom) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-glow mb-8"
        >
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                    <Users size={16} className="text-primary" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-text-main uppercase tracking-tight">Active Session: {activeRoom.name}</h3>
                    <p className="text-[10px] text-text-main-muted uppercase tracking-widest font-bold">You are currently in a room. Join another or return to the active one.</p>
                </div>
            </div>
            <button
                onClick={() => navigate(`/room/${activeRoom.id}`)}
                className="bg-primary text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-glow transition-all active:scale-95"
            >
                Return to Room
            </button>
        </motion.div>
    );
};

export default ActiveSessionBanner;
