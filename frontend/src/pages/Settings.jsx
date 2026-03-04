import React, { useState, useEffect } from 'react';
import { Network, SlidersHorizontal, Settings2, Paintbrush, Copy, Check, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSettings } from '../context/SettingsContext';
import { useNotifications } from '../context/NotificationContext';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Settings = () => {
    const {
        settings,
        updateSettings,
        network,
        runBandwidthTest
    } = useSettings();

    const { addNotification } = useNotifications();

    const [draftSettings, setDraftSettings] = useState({ ...settings });
    const [isTestingBandwidth, setIsTestingBandwidth] = useState(false);

    const colors = [
        { id: 'cyan', hex: '#00f0ff' },
        { id: 'purple', hex: '#A020F0' },
        { id: 'pink', hex: '#ff00ff' },
        { id: 'green', hex: '#00ff00' },
        { id: 'yellow', hex: '#ffff00' },
    ];

    const handleSave = () => {
        updateSettings(draftSettings);
        addNotification({
            type: 'info',
            title: 'Settings Saved',
            message: 'Your preferences have been updated successfully.',
            timestamp: new Date().toISOString()
        });
    };

    const handleBandwidthTest = async () => {
        setIsTestingBandwidth(true);
        const speed = await runBandwidthTest();
        setDraftSettings(prev => ({ ...prev, uploadBandwidthLimit: speed }));
        setIsTestingBandwidth(false);
        addNotification({
            type: 'info',
            title: 'Bandwidth Test Complete',
            message: `Estimated upload speed: ${speed} MB/s`,
            timestamp: new Date().toISOString()
        });
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto relative px-4 md:px-0">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold text-text-main mb-2 font-display tracking-tight">App Settings</h1>
                <p className="text-text-main-muted text-[15px]">Configure your connection protocols and interface preferences.</p>
            </div>

            <div className="space-y-12 pb-24">
                {/* Network Configuration */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <Network className="text-primary" size={24} />
                        <h2 className="text-xl font-bold text-text-main">Network Configuration</h2>
                    </div>

                    <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
                            {/* IP Address */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-text-main-muted">Local IP Address</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        readOnly
                                        value={network.localIP}
                                        className="w-full bg-background border border-border rounded-2xl py-4 px-5 text-text-main-muted focus:outline-none font-mono"
                                    />
                                    <button
                                        onClick={() => navigator.clipboard.writeText(network.localIP)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-text-main-muted hover:text-text-main transition-colors"
                                    >
                                        <Copy size={18} />
                                    </button>
                                </div>
                                <p className="text-[11px] text-text-main-muted/40 italic ml-2">WebRTC-based local detection</p>
                            </div>

                            {/* Port */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-text-main-muted">Port Selection</label>
                                <input
                                    type="text"
                                    value={draftSettings.port}
                                    onChange={(e) => setDraftSettings(prev => ({ ...prev, port: e.target.value }))}
                                    className="w-full bg-background border border-border rounded-2xl py-4 px-5 text-text-main focus:outline-none focus:border-primary/50 transition-all font-mono"
                                />
                            </div>
                        </div>

                        {/* Bandwidth Slider */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-text-main-muted">Bandwidth Limit (Upload)</label>
                                    <button
                                        onClick={handleBandwidthTest}
                                        disabled={isTestingBandwidth}
                                        className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-primary transition-colors disabled:opacity-50"
                                        title="Run Speed Test"
                                    >
                                        <RefreshCw size={14} className={cn(isTestingBandwidth && "animate-spin")} />
                                    </button>
                                </div>
                                <span className="text-sm font-bold text-primary">{draftSettings.uploadBandwidthLimit === 100 ? 'Unlimited' : `${draftSettings.uploadBandwidthLimit} MB/s`}</span>
                            </div>

                            <div className="relative h-2 bg-text-muted/10 rounded-full overflow-visible flex items-center">
                                <div
                                    className="absolute left-0 top-0 h-full bg-primary rounded-l-full"
                                    style={{ width: `${draftSettings.uploadBandwidthLimit}%` }}
                                />
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={draftSettings.uploadBandwidthLimit}
                                    onChange={(e) => setDraftSettings(prev => ({ ...prev, uploadBandwidthLimit: parseInt(e.target.value) }))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div
                                    className="absolute w-4 h-4 rounded-full bg-primary shadow-[0_0_10px_var(--accent-color)] z-0 pointer-events-none transition-all"
                                    style={{ left: `calc(${draftSettings.uploadBandwidthLimit}% - 8px)` }}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Appearance */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <Paintbrush className="text-primary" size={24} />
                        <h2 className="text-xl font-bold text-text-main">Appearance</h2>
                    </div>

                    <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 space-y-8">
                        {/* Dark Mode Toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-text-main font-bold tracking-wide mb-1">Dark Mode Interface</h3>
                                <p className="text-sm text-text-main-muted">Switch between light and dark visual styles.</p>
                            </div>
                            <button
                                onClick={() => setDraftSettings(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                                className={cn(
                                    "w-12 h-6 rounded-full transition-colors relative",
                                    draftSettings.darkMode ? "bg-primary" : "bg-black/20 dark:bg-white/20"
                                )}
                            >
                                <div
                                    className="w-5 h-5 bg-white rounded-full absolute top-[2px] transition-all shadow-sm"
                                    style={{ left: draftSettings.darkMode ? "calc(100% - 22px)" : "2px" }}
                                />
                            </button>
                        </div>

                        {/* Accent Color */}
                        <div>
                            <h3 className="text-text-main font-bold tracking-wide mb-4">Accent Color Choice</h3>
                            <div className="flex items-center gap-4 flex-wrap">
                                {colors.map(color => (
                                    <button
                                        key={color.id}
                                        onClick={() => setDraftSettings(prev => ({ ...prev, accentColor: color.hex }))}
                                        className={cn(
                                            "w-10 h-10 rounded-full transition-all relative flex items-center justify-center",
                                            draftSettings.accentColor === color.hex ? "scale-110 shadow-lg" : "hover:scale-105"
                                        )}
                                        style={{
                                            backgroundColor: color.hex,
                                            boxShadow: draftSettings.accentColor === color.hex ? `0 0 15px ${color.hex}60` : 'none'
                                        }}
                                    >
                                        {draftSettings.accentColor === color.hex && (
                                            <div className="absolute -inset-1.5 border-2 rounded-full" style={{ borderColor: color.hex, opacity: 0.5 }} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section >
            </div>

            {/* Action Save Button */}
            <div className="mt-8 mb-20">
                <button
                    onClick={handleSave}
                    className="bg-primary hover:opacity-90 text-background px-10 py-4 rounded-full font-bold text-lg shadow-lg transition-all flex items-center gap-2 transform hover:-translate-y-1"
                >
                    <Check size={20} />
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default Settings;
