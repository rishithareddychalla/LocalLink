import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Shield,
    Zap,
    Globe,
    Cpu,
    Users,
    Layers,
    ArrowRight,
    FileText,
    Terminal,
    MessageSquare,
    Download,
    ExternalLink,
    ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopNavbar from '../components/Navigation/TopNavbar';

const Documentation = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Technology Overview');

    const tabs = [
        "Technology Overview",
        "Local Discovery (mDNS)",
        "P2P Architecture",
        "Security Protocol"
    ];

    const sidebarLinks = [
        "Local Discovery (mDNS)",
        "P2P Architecture",
        "Security Protocols",
        "Developer API"
    ];

    const resources = [
        { name: "Whitepaper.pdf", size: "2.4 MB", date: "2024", icon: FileText },
        { name: "CLI-Reference.md", size: "1.1 MB", date: "2024", icon: Terminal }
    ];

    return (
        <div className="min-h-screen bg-background text-white overflow-x-hidden">
            <TopNavbar />

            {/* Hero Section */}
            <section className="pt-32 md:pt-48 pb-10 md:pb-16 px-6 md:px-8 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full mb-6"
                >
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Documentation</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]"
                >
                    The technology behind<br className="hidden sm:block" />
                    <span className="text-primary">seamless local sharing.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/60 max-w-2xl text-base md:text-lg mb-12"
                >
                    Discover how LocalLink Radar leverages peer-to-peer networking, multicast
                    DNS discovery, and military-grade encryption to make file transfers instant
                    and secure.
                </motion.p>

                {/* Protocol Infrastructure Image Mockup */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 group"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                    <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCb1A0aVnTOAnuUOOYOeQqV2q6uV8_kzX9AsQwCM2vwo1UlngX0ipN9h-D79_4QoYT2YRg0FCwcBJ2FsDNgxucj8rn5lERvsvn51W_fDQwu6a4YbKfTdepJronXtgDQT1k0Qz4bfLCiDIpZu7vgP6i30BJHfj858gJvY_eYS6yKUvUtTNg8A48p2eYthhFYV28Fgj8JprOdX5XvQWerBYKoyxuuVbm00wfkXwrLsy2qgMAIRuqJIyb2b__y0XuVPIdv6KXiaGA2n5g"
                        alt="Protocol Infrastructure"
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                    />
                    <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 z-20">
                        <h3 className="text-sm md:text-xl font-bold tracking-tight">Protocol Infrastructure v2.4</h3>
                    </div>
                </motion.div>
            </section>

            {/* Main Content & Navigation Tabs */}
            <div className="border-y border-white/5 bg-white/[0.02] sticky top-0 md:relative z-30 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 md:px-8 flex gap-8 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-5 md:py-6 text-xs md:text-sm font-bold whitespace-nowrap transition-all relative border-b-2 ${activeTab === tab ? "text-white border-primary" : "text-white/40 border-transparent hover:text-white/60"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <section className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-20 flex flex-col lg:flex-row gap-12 lg:gap-16">
                {/* Left Content Area */}
                <div className="flex-1 space-y-16 md:space-y-24">
                    {/* Local Discovery Section */}
                    <div id="local-discovery-(mdns)" className="space-y-6 md:space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                                <Globe className="text-primary" size={20} md={24} />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight uppercase tracking-[0.05em]">Local Discovery</h2>
                        </div>

                        <p className="text-white/60 text-base md:text-lg leading-relaxed">
                            LocalLink Radar uses <span className="text-primary font-semibold">Multicast DNS (mDNS)</span> to allow devices on the
                            same local network to find each other without requiring a central server.
                        </p>

                        <div className="glass-panel p-6 md:p-8 rounded-2xl bg-white/[0.03] space-y-6">
                            <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Protocol Workflow</h4>
                            <div className="space-y-6">
                                {[
                                    "Your device multicasts a DNS query to the local subnet.",
                                    "Other LocalLink instances listen and reply with their IP and capabilities.",
                                    "The \"Radar\" UI updates in real-time with available peers."
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                                        </div>
                                        <p className="text-white/70 text-sm leading-relaxed">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* P2P Architecture Section */}
                    <div id="p2p-architecture" className="space-y-6 md:space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                                <Zap className="text-primary" size={20} md={24} />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight uppercase tracking-[0.05em]">True P2P Logic</h2>
                        </div>

                        <p className="text-white/60 text-base md:text-lg leading-relaxed">
                            Unlike traditional cloud storage, files never touch our servers. We
                            establish a direct socket between devices.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="glass-panel p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                                <h4 className="font-bold mb-2 text-sm">Zero Latency</h4>
                                <p className="text-white/50 text-[11px] leading-relaxed">Transfers are limited only by your router speed, not your ISP's upload cap.</p>
                            </div>
                            <div className="glass-panel p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                                <h4 className="font-bold mb-2 text-sm">Resilient Sockets</h4>
                                <p className="text-white/50 text-[11px] leading-relaxed">TCP stream with automatic packet retry ensures 100% file integrity.</p>
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div id="security-protocols" className="space-y-6 md:space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                                <Shield className="text-primary" size={20} md={24} />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight uppercase tracking-[0.05em]">E2E Encryption</h2>
                        </div>

                        <div className="glass-panel p-6 md:p-8 rounded-2xl md:rounded-3xl bg-white/[0.02] space-y-6 border border-white/10">
                            <p className="text-white/60 text-sm md:text-base leading-relaxed">
                                Every transfer is secured via TLS 1.3 with Perfect Forward Secrecy. We use an ECDSA-based handshake to verify peer identities.
                            </p>

                            <div className="bg-black/60 rounded-xl md:rounded-2xl p-4 md:p-6 font-mono text-[10px] md:text-xs leading-relaxed border border-white/5 overflow-x-auto">
                                <div className="space-y-1 whitespace-nowrap md:whitespace-normal">
                                    <p className="text-primary/60"># Handshake Log</p>
                                    <p className="text-white/80">$ radar-cli handshake --peer-id=node_7721</p>
                                    <p className="text-primary">&gt; X25519 Handshake Initiate...</p>
                                    <p className="text-primary">&gt; Exchange keys (SHA-256: a8:b2:...)</p>
                                    <p className="text-primary">&gt; AES-256-GCM Established.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Area */}
                <aside className="w-full lg:w-80 space-y-10 lg:space-y-12">
                    <div className="hidden lg:block space-y-6">
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">On this page</h4>
                        <div className="space-y-3">
                            {sidebarLinks.map((link) => (
                                <a
                                    key={link}
                                    href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="block text-sm font-medium text-white/40 hover:text-primary transition-colors"
                                >
                                    {link}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Discord CTA */}
                    <div className="glass-panel p-6 md:p-8 rounded-[28px] md:rounded-3xl bg-white/[0.03] border border-white/10 space-y-5">
                        <div className="space-y-2">
                            <h4 className="font-bold text-lg md:text-xl leading-tight">Need technical support?</h4>
                            <p className="text-white/40 text-[11px] md:text-xs leading-relaxed">
                                Our engineers are active on Discord to help with custom implementations.
                            </p>
                        </div>
                        <button className="w-full bg-white text-black py-4 rounded-full text-xs font-bold hover:bg-white/90 transition-all shadow-xl active:scale-95">
                            Join Community
                        </button>
                    </div>

                    {/* Resources */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        {resources.map((res, i) => (
                            <div key={i} className="flex items-center gap-4 bg-white/[0.03] p-4 rounded-2xl border border-white/5 group hover:border-white/10 transition-colors">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                                    <res.icon className="text-white/40 group-hover:text-primary transition-colors" size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="text-[11px] md:text-xs font-bold truncate tracking-wide">{res.name}</h5>
                                    <p className="text-[9px] md:text-[10px] text-white/30 uppercase tracking-tighter">{res.size} • {res.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </section>

            {/* Bottom CTA Section */}
            <section className="py-20 md:py-32 px-6 md:px-8 text-center bg-white/[0.01] border-t border-white/5">
                <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight px-4 leading-tight">Ready to boost your workflow?</h2>
                    <p className="text-white/60 max-w-lg mx-auto leading-relaxed text-sm md:text-base px-4">
                        Download the radar client for your platform and start collaborating locally with zero setup.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6 md:px-0">
                        <button className="bg-primary text-black px-10 py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:shadow-hero transition-all w-full sm:w-auto active:scale-95">
                            <Download size={18} />
                            Download App
                        </button>
                        <button className="bg-surface border border-white/10 px-10 py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-all w-full sm:w-auto active:scale-95">
                            <MessageSquare size={18} />
                            API Reference
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 px-8 bg-black/20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full border-2 border-background flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-background" />
                            </div>
                        </div>
                        <span className="font-bold text-lg tracking-tight">LocalLink Radar</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors">GitHub</a>
                        <a href="#" className="hover:text-white transition-colors">Status</a>
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                    </div>

                    <p className="text-[9px] text-white/20 uppercase tracking-[0.1em] text-center md:text-right">
                        &copy; 2024 LocalLink Tech Inc. Built for Speed.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Documentation;
