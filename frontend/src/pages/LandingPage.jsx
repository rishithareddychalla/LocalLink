import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Globe, Cpu, Users, Layers, Laptop, Tablet, Smartphone, SmartphoneNfc } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopNavbar from '../components/Navigation/TopNavbar';
import AuthModal from '../components/AuthModal';
import { useSession } from '../hooks/useSession';

const LandingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useSession();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const handleEnterRadar = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        } else {
            setIsAuthModalOpen(true);
        }
    };

    const handleGetStarted = () => {
        setIsAuthModalOpen(true);
    };

    const features = [
        { icon: Zap, title: "Real-time chat", desc: "Instant messages across the local network, with consistency and end-to-end encryption." },
        { icon: Globe, title: "Peer-to-peer file sharing", desc: "Sharing fast file transfers. Drop and share any file size without touching external servers." },
        { icon: Layers, title: "Shared whiteboard", desc: "Brainstorm ideas together. Low latency drawing tools for visual collaboration in real-time." },
        { icon: Cpu, title: "Temporary rooms", desc: "Create auto-expiring rooms. Once everyone leaves, all data is purged from memory instantly." },
        { icon: Users, title: "Offline mode", desc: "Works perfectly even when the internet is down. As long as your router is up, you're connected." },
        { icon: null, title: "And More...", desc: "Dark mode, live status, and core editor syncing coming soon.", isMore: true },
    ];

    return (
        <div className="min-h-screen bg-background text-text-main overflow-hidden relative">
            <TopNavbar />

            {/* Hero Section */}
            <section className="relative pt-32 md:pt-48 pb-10 md:pb-20 px-6 md:px-8 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-8 relative z-10"
                >
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] md:text-sm font-medium text-primary uppercase tracking-widest">Version 1.0 Now Live</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 mt-4 md:mt-8 relative z-10 leading-[1.1] text-text-main"
                >
                    Instant collaboration for<br className="hidden sm:block" />
                    anyone on the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">same WiFi.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-base md:text-lg text-text-main-muted max-w-2xl mb-12 relative z-10 px-4"
                >
                    Experience seamless device discovery and real-time connectivity
                    without the cloud. Your data stays on your local network.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 relative z-10 w-full sm:w-auto px-6 sm:px-0"
                >
                    <button
                        onClick={handleEnterRadar}
                        className="bg-primary text-black px-8 py-4 rounded-full font-bold hover:shadow-hero transition-all flex items-center justify-center gap-2 group w-full sm:w-48"
                    >
                        <span className="material-symbols-outlined font-bold text-xl">
                            wifi_tethering
                        </span>
                        Enter Radar
                    </button>
                    <button
                        onClick={handleGetStarted}
                        className="glass-panel px-8 py-4 rounded-full font-bold hover:bg-text/5 transition-all text-text-main flex items-center justify-center gap-2 w-full sm:w-48 border border-border"
                    >
                        <Zap size={18} className="text-text-main-muted/60" />
                        Get Started
                    </button>
                </motion.div>
            </section>

            {/* Radar Animation Section */}
            <section className="w-full flex justify-center items-center py-10 md:py-20 pointer-events-none z-0 overflow-hidden">
                <div className="relative w-[320px] sm:w-[500px] md:w-[800px] aspect-square flex justify-center items-center flex-shrink-0 scale-75 md:scale-100">
                    {/* Concentric Circles */}
                    <div className="absolute inset-0 border border-primary/20 rounded-full scale-[0.4]" />
                    <div className="absolute inset-0 border border-primary/20 rounded-full scale-[0.6]" />
                    <div className="absolute inset-0 border border-primary/20 rounded-full scale-[0.8]" />
                    <div className="absolute inset-0 border border-primary/20 rounded-full scale-100" />
                    <div className="absolute inset-0 border border-primary/20 rounded-full scale-[1.2]" />

                    {/* Animated Pulse */}
                    <div className="absolute inset-x-0 inset-y-0 m-auto w-24 h-24 md:w-32 md:h-32 border-2 border-primary/30 rounded-full animate-radar-pulse" />

                    {/* Central Node */}
                    <div className="absolute inset-x-0 inset-y-0 m-auto w-16 h-16 md:w-24 md:h-24 bg-background rounded-full border border-primary/40 flex items-center justify-center shadow-glow-sm">
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-primary/20 rounded-full flex items-center justify-center">
                            <div className="w-4 h-4 md:w-6 md:h-6 rounded-full border-2 border-primary flex items-center justify-center">
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary" />
                            </div>
                        </div>
                    </div>

                    {/* Floating Devices */}
                    {[
                        { icon: Smartphone, label: 'iPhone', orbit: 'inset-[0%]', duration: 60, pos: 'top-[50%] left-[100%]' },
                        { icon: Laptop, label: 'MacBook', orbit: 'inset-[10%]', duration: 45, pos: 'top-[50%] left-[0%]' },
                        { icon: Tablet, label: 'iPad', orbit: 'inset-[20%]', duration: 30, pos: 'top-[0%] left-[50%]' },
                        { icon: Smartphone, label: 'Android', orbit: 'inset-[30%]', duration: 20, pos: 'top-[100%] left-[50%]' }
                    ].map((device, i) => (
                        <div key={i} className={`absolute ${device.orbit} pointer-events-none`}>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: device.duration, repeat: Infinity, ease: "linear" }}
                                className="w-full h-full relative"
                            >
                                <div className={`absolute ${device.pos} -translate-x-1/2 -translate-y-1/2 pointer-events-auto`}>
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: device.duration, repeat: Infinity, ease: "linear" }}
                                        className="flex flex-col items-center gap-2"
                                    >
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-surface/80 backdrop-blur-md rounded-full border border-border/50 flex items-center justify-center shadow-lg">
                                            <device.icon size={device.label === 'MacBook' ? 18 : 20} className="text-text-main" />
                                        </div>
                                        <span className="text-[8px] md:text-[10px] font-bold tracking-widest text-text-main-muted uppercase whitespace-nowrap">{device.label}</span>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="max-w-6xl mx-auto px-6 md:px-8 py-20 md:py-32">
                <div className="mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 text-text-main">Powerful tools, zero latency</h2>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <p className="text-text-main-muted max-w-xl text-sm leading-relaxed">
                            Everything you need for teamwork, operating directly over your local access point for
                            ultimate privacy and speed.
                        </p>
                        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full shrink-0">
                            <Zap size={14} className="text-primary" />
                            <span className="text-[10px] md:text-xs font-bold text-primary shrink-0">Up to 1.2 Gbps Transfer</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={f.isMore
                                ? "glass-panel p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center text-center group min-h-[160px] bg-surface/50 border border-border"
                                : "glass-panel p-6 md:p-8 rounded-2xl hover:border-primary/30 transition-all group bg-surface/50 border border-border"}
                        >
                            {!f.isMore && (
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                    <f.icon className="text-primary" size={20} />
                                </div>
                            )}

                            <h3 className={f.isMore ? "text-base md:text-lg font-bold mb-3 text-primary italic" : "text-base md:text-lg font-bold mb-3 text-text-main"}>{f.title}</h3>
                            <p className="text-text-main-muted text-sm leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Bottom CTA Section */}
            <section className="max-w-6xl mx-auto px-6 md:px-8 pb-32">
                <div className="glass-panel p-10 md:p-16 rounded-[32px] md:rounded-[40px] text-center flex flex-col items-center bg-surface/50 border border-border">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-text-main">Ready to sync up?</h2>
                    <p className="text-text-main-muted mb-8 max-w-sm text-sm md:text-base">
                        Join your local network and start collaborating instantly. No account required to try.
                    </p>
                    <button
                        onClick={handleEnterRadar}
                        className="bg-primary text-black px-10 py-4 rounded-full font-bold hover:shadow-hero transition-all w-full sm:w-auto"
                    >
                        Launch Radar Now
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border py-12 px-8 flex flex-col items-center text-center gap-8 md:flex-row md:justify-between md:text-left text-text-main-muted">
                <div className="flex items-center gap-2 font-bold text-text-main">
                    <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-background font-bold text-xl">
                            wifi_tethering
                        </span>
                    </div>
                    LocalLink Radar
                </div>
                <div className="flex flex-wrap justify-center gap-6 md:gap-8 uppercase tracking-widest font-bold text-[10px]">
                    <a href="#" className="hover:text-primary transition-colors">Twitter</a>
                    <a href="#" className="hover:text-primary transition-colors">Github</a>
                    <a href="#" className="hover:text-primary transition-colors">Discord</a>
                    <a href="#" className="hover:text-primary transition-colors">Instagram</a>
                </div>
                <p className="text-[10px]">&copy; 2026 LocalLink Radar. Privacy First.</p>
            </footer>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
    );
};

export default LandingPage;
