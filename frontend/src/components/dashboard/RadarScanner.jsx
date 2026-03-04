import React from 'react';
import { RefreshCw, UserPlus, HelpCircle, CheckCircle2, Circle } from 'lucide-react';

const RadarScanner = ({ onScan }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 max-w-2xl mx-auto">
            {/* Radar Animation */}
            <div className="relative w-64 h-64 mb-12">
                {/* Concentric Circles */}
                <div className="absolute inset-0 rounded-full border border-primary/20" />
                <div className="absolute inset-4 rounded-full border border-primary/10" />
                <div className="absolute inset-12 rounded-full border border-primary/5" />

                {/* Radar Sweep */}
                <div className="absolute inset-0 animate-radar-spin">
                    <div className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-gradient-to-t from-primary/50 to-transparent origin-bottom" />
                </div>

                {/* Center Pulse */}
                <div className="absolute inset-[110px] bg-primary/20 rounded-full animate-radar-pulse flex items-center justify-center">
                    <div className="w-4 h-4 bg-primary rounded-full shadow-glow" />
                </div>
            </div>

            {/* Content */}
            <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl font-bold text-text-main tracking-tight">Searching for nearby devices...</h2>
                <p className="text-lg text-text-main-muted font-medium">No one on your network is visible right now.</p>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
                <button
                    onClick={onScan}
                    className="flex items-center gap-3 bg-primary hover:bg-primary/90 text-black px-8 py-3.5 rounded-full font-bold transition-all shadow-glow active:scale-95"
                >
                    <RefreshCw size={20} className="animate-spin-slow" />
                    Refresh Radar
                </button>
                <button className="flex items-center gap-3 bg-text/5 hover:bg-text/10 text-text-main-muted hover:text-text-main border border-border px-8 py-3.5 rounded-full font-bold transition-all active:scale-95">
                    <UserPlus size={20} className="text-primary" />
                    Invite Others
                </button>
            </div>

            {/* Troubleshooting Section */}
            <div className="w-full bg-surface/40 border border-border rounded-[32px] p-8 md:p-10">
                <div className="flex items-center gap-3 mb-8">
                    <HelpCircle className="text-primary" size={24} />
                    <h3 className="text-xl font-bold text-primary tracking-tight">Troubleshooting</h3>
                </div>

                <div className="space-y-8">
                    <div className="flex items-start gap-4">
                        <div className="mt-1">
                            <CheckCircle2 className="text-primary" size={20} />
                        </div>
                        <div>
                            <p className="text-base font-bold text-text-main mb-1">Ensure you are connected to the same WiFi.</p>
                            <p className="text-xs text-text-main-muted font-medium leading-relaxed">Radar only works across local area networks for security.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="mt-1">
                            <CheckCircle2 className="text-primary" size={20} />
                        </div>
                        <div>
                            <p className="text-base font-bold text-text-main mb-1">Check if your device's visibility is turned on.</p>
                            <p className="text-xs text-text-main-muted font-medium leading-relaxed">Go to Settings &gt; Discovery to enable public visibility.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="mt-1">
                            <CheckCircle2 className="text-primary" size={20} />
                        </div>
                        <div>
                            <p className="text-base font-bold text-text-main mb-1">Refresh the radar.</p>
                            <p className="text-xs text-text-main-muted font-medium leading-relaxed">A fresh scan may take up to 10 seconds to detect all nodes.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RadarScanner;
