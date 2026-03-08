import React from 'react';
import { Laptop, Smartphone, Tv, Server } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const getIcon = (type) => {
    switch (type) {
        case 'laptop': return <Laptop size={24} className="text-white" />;
        case 'mobile': return <Smartphone size={24} className="text-white" />;
        case 'server': return <Server size={24} className="text-white" />;
        case 'tv': return <Tv size={24} className="text-white" />;
        default: return <Laptop size={24} className="text-white" />;
    }
};

const DeviceCard = ({ device }) => {
    return (
        <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col items-center text-center hover:border-primary/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[40px] rounded-full -mr-12 -mt-12 pointer-events-none group-hover:bg-primary/10 transition-all" />

            {/* Radar Icon Assembly */}
            <div className="relative w-20 h-20 md:w-24 md:h-24 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 border-[0.5px] border-primary/5 rounded-full group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-2 border-[0.5px] border-primary/10 rounded-full group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-4 border-[0.5px] border-primary/15 rounded-full" />
                <div className="absolute inset-6 bg-primary/5 rounded-full animate-pulse" />

                <div className="relative z-10 w-10 h-10 md:w-12 md:h-12 bg-text border border-white/[0.02] rounded-xl md:rounded-full flex items-center justify-center shadow-lg text-background transform group-hover:rotate-12 transition-transform">
                    {getIcon(device.type)}
                </div>

                <div className={cn(
                    "absolute bottom-4 right-4 w-3 h-3 rounded-full border-2 border-surface z-20",
                    device.status === 'online' ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-text/20"
                )} />
            </div>

            <h3 className="text-sm md:text-base font-bold text-text-main mt-4 group-hover:text-primary transition-colors">{device.name}</h3>
            <p className="text-[10px] md:text-xs text-text-main-muted mb-4 font-medium uppercase tracking-tight">{device.ip}</p>
        </div>
    );
};

export default DeviceCard;
