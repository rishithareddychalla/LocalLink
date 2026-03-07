import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw, Wrench, X, Info, TriangleAlert } from 'lucide-react';

const ConnectionLost = () => {
    const navigate = useNavigate();
    const [isRetrying, setIsRetrying] = useState(false);
    const [showTroubleshoot, setShowTroubleshoot] = useState(false);
    const [showProTip, setShowProTip] = useState(true);

    const handleRetry = async () => {
        setIsRetrying(true);
        try {
            const response = await fetch(`http://${window.location.hostname}:5000/api/health`);
            if (response.ok) {
                navigate('/dashboard');
            } else {
                throw new Error('Still disconnected');
            }
        } catch (err) {
            // Keep on this page
            setTimeout(() => setIsRetrying(false), 1000);
        }
    };

    const tips = [
        "Check if your WiFi or Ethernet cable is connected.",
        "Ensure you are on the same Local Area Network (LAN) as the host.",
        "Make sure the LocalLink backend server is still running.",
        "Try restarting the application if the issue persists.",
        "Check if a firewall is blocking port 5000."
    ];

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent z-0" />

            {/* Main Error Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-[#0f172a]/90 backdrop-blur-2xl border border-white/5 rounded-[40px] p-10 shadow-2xl relative z-10 flex flex-col items-center text-center"
            >
                {/* Icon Assembly */}
                <div className="relative mb-8">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"
                    />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-3xl flex items-center justify-center overflow-hidden">
                        <WifiOff size={48} className="text-purple-400" />
                        <motion.div
                            initial={{ x: -100, rotate: -45 }}
                            animate={{ x: 100, rotate: -45 }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="absolute inset-0 w-2 h-40 bg-white/10 blur-md pointer-events-none"
                        />
                    </div>
                </div>

                <h1 className="text-3xl font-black text-white mb-4 tracking-tight">
                    Network Connection Lost
                </h1>
                <p className="text-slate-400 text-base mb-10 leading-relaxed">
                    It looks like you've been disconnected from the local network. Please check your WiFi connection.
                </p>

                {/* Buttons */}
                <div className="w-full space-y-4">
                    <button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className="w-full bg-[#00f0ff] hover:bg-[#00d0e0] disabled:bg-[#00f0ff]/50 text-black py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(0,240,255,0.2)] active:scale-95"
                    >
                        <RefreshCw size={20} className={isRetrying ? "animate-spin" : ""} />
                        {isRetrying ? "Reconnecting..." : "Retry Connection"}
                    </button>

                    <button
                        onClick={() => setShowTroubleshoot(true)}
                        className="w-full bg-white/5 hover:bg-white/10 text-slate-300 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-colors active:scale-95 border border-white/5"
                    >
                        <Wrench size={20} />
                        Troubleshoot Network
                    </button>
                </div>

                {/* Footer Info */}
                <div className="mt-10 flex items-center gap-4 text-[10px] font-mono tracking-widest uppercase">
                    <div className="flex items-center gap-2 text-red-500/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        OFFLINE
                    </div>
                    <span className="text-slate-700">•</span>
                    <span className="text-slate-500">ID: LL-4902-NX</span>
                </div>
            </motion.div>

            {/* Navigation Mimic (Requirement) */}
            <div className="mt-8 flex items-center gap-8 opacity-20 pointer-events-none grayscale z-10">
                <div className="flex flex-col items-center gap-1">
                    <div className="w-5 h-5 bg-slate-500 rounded" />
                    <span className="text-[10px] font-bold">RADAR</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="w-5 h-5 bg-slate-500 rounded" />
                    <span className="text-[10px] font-bold">DEVICES</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="w-5 h-5 bg-slate-500 rounded" />
                    <span className="text-[10px] font-bold">HISTORY</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="w-5 h-5 bg-slate-500 rounded" />
                    <span className="text-[10px] font-bold">PROFILE</span>
                </div>
            </div>

            {/* Pro Tip Card */}
            <AnimatePresence>
                {showProTip && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="fixed bottom-10 inset-x-6 mx-auto max-w-md bg-[#1e293b]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-5 flex items-start gap-4 shadow-2xl z-20"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-[#00f0ff]/10 flex items-center justify-center shrink-0">
                            <Info size={20} className="text-[#00f0ff]" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-white">Pro Tip</h4>
                            <p className="text-xs text-slate-400">Try toggling Airplane Mode if your local mesh doesn't appear in the list.</p>
                        </div>
                        <button onClick={() => setShowProTip(false)} className="text-slate-500 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Troubleshoot Modal */}
            <AnimatePresence>
                {showTroubleshoot && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-lg bg-[#1e293b] border border-white/10 rounded-[32px] p-8 relative overflow-hidden"
                        >
                            <button
                                onClick={() => setShowTroubleshoot(false)}
                                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="flex items-center gap-3 mb-8">
                                <TriangleAlert className="text-purple-400" size={28} />
                                <h2 className="text-2xl font-black text-white">Troubleshooting</h2>
                            </div>

                            <div className="space-y-4">
                                {tips.map((tip, idx) => (
                                    <div key={idx} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">
                                            {idx + 1}
                                        </div>
                                        <p className="text-sm text-slate-300 leading-relaxed font-medium">{tip}</p>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowTroubleshoot(false)}
                                className="w-full mt-10 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-colors"
                            >
                                Close Modal
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ConnectionLost;
