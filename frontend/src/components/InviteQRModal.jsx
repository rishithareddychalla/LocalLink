import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Wifi, ExternalLink } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const InviteQRModal = ({ isOpen, onClose, lanIp }) => {
    const [copied, setCopied] = useState(false);

    // Use the provided lanIp if available and not local/empty, otherwise fallback to current hostname
    const displayHostname = (lanIp && lanIp !== '0.0.0.0' && lanIp !== '127.0.0.1')
        ? lanIp
        : window.location.hostname;

    const lanUrl = `http://${displayHostname}:5173`;

    const handleCopy = () => {
        navigator.clipboard.writeText(lanUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/85 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-sm bg-[#0b0f14] border border-border/50 rounded-[32px] p-8 shadow-2xl overflow-hidden text-center"
                    >
                        {/* Decorative Glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[100px] pointer-events-none" />

                        <button
                            onClick={onClose}
                            className="absolute right-6 top-6 p-2 text-text-main-muted/30 hover:text-text-main transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-text-main italic uppercase tracking-tight">Invite Devices</h2>
                                <p className="text-text-main-muted/50 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                    <Wifi size={12} className="text-primary animate-pulse" />
                                    Sub-net Guest Access
                                </p>
                            </div>

                            {/* QR Code Section */}
                            <div className="relative inline-block p-4 rounded-3xl bg-black/40 border border-primary/20 shadow-glow-sm">
                                <div className="absolute inset-0 rounded-3xl border border-primary/20 animate-pulse pointer-events-none" />
                                <QRCodeCanvas
                                    value={lanUrl}
                                    size={200}
                                    bgColor="#0b0f14"
                                    fgColor="#00e5ff"
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>

                            <div className="space-y-4">
                                <p className="text-[11px] text-text-main-muted font-bold leading-relaxed px-4">
                                    Scan this QR code from another device connected to the same WiFi network.
                                </p>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 bg-surface/50 border border-border/50 rounded-xl px-4 py-3 group">
                                        <a
                                            href={lanUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 hover:bg-primary/10 rounded-md text-text-main-muted/50 hover:text-primary transition-all active:scale-90"
                                            title="Open link in new tab"
                                        >
                                            <ExternalLink size={14} />
                                        </a>
                                        <span className="flex-1 text-[11px] font-bold text-text-main truncate">
                                            {lanUrl}
                                        </span>
                                        <button
                                            onClick={handleCopy}
                                            className="p-2 hover:bg-white/5 rounded-lg transition-colors group-active:scale-90"
                                        >
                                            {copied ? (
                                                <Check size={16} className="text-green-500" />
                                            ) : (
                                                <Copy size={16} className="text-primary/70" />
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-[10px] font-bold text-primary italic">
                                        {copied ? 'Link copied!' : 'Click to copy direct link'}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border/30">
                                <p className="text-[9px] font-black text-text-main-muted/30 uppercase tracking-[0.2em]">
                                    Devices must be on same local network
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default InviteQRModal;
