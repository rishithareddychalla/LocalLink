import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = ({ title: propTitle, message: propMessage }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Use props if provided, otherwise check route state, otherwise fallback to defaults
    const state = location.state || {};
    const title = propTitle || state.title || "404";
    const subtitle = state.subtitle || "Lost in Space?";
    const message = propMessage || state.message || "We couldn't find the page you're looking for. It might have been moved or doesn't exist.";

    const handleDashboard = () => {
        navigate('/dashboard');
    };

    const handleRadarScan = () => {
        navigate('/dashboard', { state: { autoScan: true } });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Grid Background Effect */}
            <div className="absolute inset-0 z-0 bg-transparent"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}>
            </div>

            {/* Glowing orbs */}
            <div className="absolute top-[20%] left-[20%] w-[30vw] h-[30vw] bg-primary/10 blur-[100px] rounded-full z-0 pointer-events-none" />
            <div className="absolute bottom-[20%] right-[20%] w-[30vw] h-[30vw] bg-secondary/10 blur-[100px] rounded-full z-0 pointer-events-none" />

            {/* Main Content Card */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-xl bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden shadow-2xl relative z-10 flex flex-col items-center p-12 text-center"
                style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 240, 255, 0.05)'
                }}
            >
                {/* 404 Title */}
                <motion.h1
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
                    className="text-8xl md:text-9xl font-black mb-6 tracking-tighter"
                    style={{
                        color: 'transparent',
                        WebkitTextStroke: '1px rgba(0, 240, 255, 0.8)',
                        textShadow: '0 0 20px rgba(0, 240, 255, 0.4), 0 0 40px rgba(0, 240, 255, 0.2)',
                        background: 'linear-gradient(180deg, #00f0ff 0%, #00f0ff 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: '#00f0ff',
                    }}
                >
                    {title}
                </motion.h1>

                {/* Subtitle */}
                {title === "404" && (
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        {subtitle}
                    </h2>
                )}

                {/* Description */}
                <p className="text-gray-400 text-base md:text-lg mb-10 max-w-md mx-auto leading-relaxed">
                    {message}
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <button
                        onClick={handleDashboard}
                        className="flex items-center justify-center gap-2 bg-[#00f0ff] hover:bg-[#00d0e0] text-black px-6 py-3.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
                        Back to Dashboard
                    </button>
                    <button
                        onClick={handleRadarScan}
                        className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3.5 rounded-xl font-bold transition-all active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#00f0ff]"><circle cx="12" cy="12" r="10" /><path d="M12 12A6 6 0 0 0 6.13 8.35" /><path d="M12 12A6 6 0 0 1 17.87 8.35" /><path d="M12 12a10 10 0 0 0 9.54-3.11" /><path d="M12 12a10 10 0 0 1-9.54-3.11" /></svg>
                        Run Radar Scan
                    </button>
                </div>
            </motion.div>

            {/* Footer Status */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute bottom-10 flex flex-col items-center gap-3 z-10 text-center"
            >
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse shadow-[0_0_10px_#00f0ff]" />
                    <span className="text-[10px] sm:text-xs font-bold text-[#00f0ff] tracking-widest uppercase">System Operational</span>
                </div>
                <p className="text-[10px] text-gray-500 font-mono">
                    Error ID: LL-RADAR-{title === "404" ? "404-NOT-FOUND" : "ROOM-ERROR"}
                </p>
            </motion.div>
        </div>
    );
};

export default NotFound;
