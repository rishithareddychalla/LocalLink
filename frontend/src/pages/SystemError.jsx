import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircleAlert, RefreshCcw, Send, Globe, Wifi } from 'lucide-react';

const SystemError = ({ title: propTitle, message: propMessage, errorCode: propErrorCode, trace: propTrace }) => {
    let location = {};
    try {
        location = useLocation();
    } catch (e) {
        // Fallback for rendering outside of a Router (e.g. via Error Boundary)
        location = { state: {} };
    }

    // Fallback error details if not provided via navigation state or props
    const state = location.state || {};
    const errorDetails = {
        errorCode: propErrorCode || state.errorCode || '500 INTERNAL SERVER ERROR',
        timestamp: new Date().toISOString(),
        trace: propTrace || state.trace || 'locator_service_timeout_node_04'
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    const handleReport = () => {
        window.location.href = "mailto:support@locallink.app";
    };

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Header */}
            <header className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#00f0ff]/20 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full border-2 border-[#00f0ff] animate-pulse" />
                    </div>
                    <span className="text-xl font-black text-white tracking-tighter">LocalLink Radar</span>
                </div>

                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]" />
                    <span className="text-[10px] font-bold text-red-500 tracking-widest uppercase">SYSTEM DOWN</span>
                </div>
            </header>

            {/* Background Grain/Grid */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '30px 30px'
                }}>
            </div>

            {/* Main Content Card */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl bg-[#0f172a]/95 backdrop-blur-3xl border border-white/5 rounded-[48px] p-12 md:p-16 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative z-10 flex flex-col items-center text-center"
            >
                {/* Glow behind card */}
                <div className="absolute inset-0 bg-[#00f0ff]/5 blur-[80px] rounded-full -z-10" />

                {/* Error Icon & Badge */}
                <div className="relative mb-8">
                    <div className="w-24 h-24 rounded-full border border-red-500/30 bg-[#ef4444]/5 flex items-center justify-center">
                        <CircleAlert size={48} className="text-red-500" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg border-2 border-[#0f172a]">
                        500
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                    Something went wrong
                </h1>
                <p className="text-slate-400 text-lg mb-10 font-medium">
                    Our radar hit a glitch. We're working on it.
                </p>

                {/* Terminal Log Box */}
                <div className="w-full bg-black/60 rounded-3xl border border-white/5 p-6 mb-12 flex flex-col items-start gap-4 text-left font-mono text-sm relative group overflow-hidden">
                    <div className="flex gap-1.5 mb-2">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                        <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                        <span className="ml-2 text-slate-700 text-[10px] uppercase font-black tracking-widest">Error Logs</span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className="text-[#3b82f6]">
                            <span className="text-slate-500">Error Code:</span> {errorDetails.errorCode}
                        </p>
                        <p className="text-[#3b82f6]">
                            <span className="text-slate-500">Timestamp:</span> {errorDetails.timestamp}
                        </p>
                        <p className="text-[#3b82f6]">
                            <span className="text-slate-500">Trace:</span> {errorDetails.trace}
                        </p>
                    </div>

                    {/* Scanlight effect on terminal */}
                    <motion.div
                        initial={{ top: '-100%' }}
                        animate={{ top: '200%' }}
                        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        className="absolute h-1 w-full bg-[#00f0ff]/5 blur-sm pointer-events-none"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center justify-center gap-3 bg-[#00f0ff] hover:bg-[#00d0e0] text-black px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-[0_0_30px_rgba(0,240,255,0.3)] active:scale-95"
                    >
                        <RefreshCcw size={22} />
                        Refresh App
                    </button>
                    <button
                        onClick={handleReport}
                        className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-slate-300 px-8 py-4 rounded-2xl font-black text-lg transition-all border border-white/5 active:scale-95"
                    >
                        <Send size={22} />
                        Report Issue
                    </button>
                </div>

                <button className="mt-8 text-[11px] font-bold text-[#00f0ff]/60 hover:text-[#00f0ff] uppercase tracking-widest transition-colors">
                    If this persists, check our status page &rarr;
                </button>
            </motion.div>

            {/* Footer */}
            <footer className="absolute bottom-0 w-full p-10 flex flex-col items-center gap-6 z-10">
                <div className="flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Globe size={14} className="text-slate-400" />
                        Global Nodes: <span className="text-[#27c93f]">Online</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                        <Wifi size={14} className="text-red-500/60" />
                        Local Radar: <span className="text-red-500">Offline</span>
                    </div>
                </div>
                <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">
                    &copy; 2026 LocalLink Technologies. All systems logged.
                </p>
            </footer>
        </div>
    );
};

export default SystemError;
