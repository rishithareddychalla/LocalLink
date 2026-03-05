import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, ArrowRight, Loader2 } from 'lucide-react';
import { useSession } from '../hooks/useSession';
import { useProfile } from '../context/ProfileContext';
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ isOpen, onClose }) => {
    const [nickname, setNickname] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useSession();
    const { profile, updateNickname } = useProfile();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nickname.trim()) return;

        setIsLoading(true);
        try {
            await login({
                nickname,
                avatarStyle: profile.avatarStyle,
                avatarSeed: profile.avatarSeed
            });
            updateNickname(nickname);
            onClose();
            navigate('/dashboard');
        } catch (error) {
            console.error('Session creation failed', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-surface border border-border rounded-[32px] p-8 shadow-2xl overflow-hidden"
                    >
                        {/* Decorative Background Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 pointer-events-none" />

                        <button
                            onClick={onClose}
                            className="absolute right-6 top-6 p-2 text-text-main-muted/20 hover:text-text-main transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="space-y-6">
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                                    <User className="text-primary" size={32} />
                                </div>
                                <h2 className="text-2xl font-black text-text-main italic uppercase tracking-tight">Identity Required</h2>
                                <p className="text-text-main-muted/40 text-xs font-bold uppercase tracking-widest">SUB-NET GUEST PROTOCOL</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-text-main-muted/20 uppercase tracking-[0.4em] pl-1">Choose a Nickname</label>
                                    <div className="relative group">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={nickname}
                                            onChange={(e) => setNickname(e.target.value)}
                                            placeholder="Ex: Ghost_Rider"
                                            className="w-full bg-background/40 border border-border/50 rounded-2xl py-4 px-6 text-sm text-text-main focus:outline-none focus:border-primary/40 focus:bg-background/60 transition-all font-bold tracking-wide"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!nickname.trim() || isLoading}
                                    className="w-full bg-primary hover:bg-primary/90 disabled:bg-text/5 disabled:text-text-main-muted/20 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-glow-sm flex items-center justify-center gap-2 group"
                                >
                                    {isLoading ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <>
                                            Initialize Session
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>

                                <div className="text-center pt-2">
                                    <p className="text-[10px] text-text-main-muted/20 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                        <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                        No sign-up required. Temporary encrypted session.
                                    </p>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
