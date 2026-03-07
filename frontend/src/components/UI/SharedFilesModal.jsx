import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, AlertTriangle, ShieldCheck, UploadCloud, Download } from 'lucide-react';
import { useRoom } from '../../context/RoomContext';
import { useFiles } from '../../context/FileContext';
import { useProfile } from '../../context/ProfileContext';

const SharedFilesModal = ({ isOpen, onClose, activeTheme }) => {
    const { activeRoom, roomFiles } = useRoom();
    const { trackDownload } = useFiles();
    const { profile } = useProfile();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                className="relative w-full max-w-2xl bg-background border border-border rounded-[24px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-surface/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${activeTheme}10` }}
                        >
                            <UploadCloud size={20} style={{ color: activeTheme }} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-text-main">All Shared Assets</h3>
                            <p className="text-[10px] text-text-main-muted/40 uppercase tracking-[0.2em] font-black">Secure Repository • {roomFiles.length} Files</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-text/10 rounded-full transition-colors text-text-main-muted hover:text-text-main">
                        <X size={20} />
                    </button>
                </div>

                {/* Files List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                    {roomFiles.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center opacity-20">
                            <FileText size={60} className="mb-4" />
                            <p className="text-sm font-bold uppercase tracking-widest text-center">No assets have been shared in this session yet.</p>
                        </div>
                    ) : (
                        [...roomFiles].reverse().map((file) => (
                            <div key={file.id} className="bg-surface/50 rounded-2xl p-4 flex items-center gap-4 border border-border hover:border-primary/20 transition-all group">
                                <div
                                    className="p-3 rounded-xl shrink-0"
                                    style={file.isSafe ? { backgroundColor: `${activeTheme}10` } : { backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                                >
                                    {file.isSafe ? (
                                        <FileText size={20} style={{ color: activeTheme }} />
                                    ) : (
                                        <AlertTriangle size={20} className="text-red-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className={`text-sm font-bold truncate ${file.isSafe ? "text-text-main" : "text-red-500"}`}>
                                            {file.name}
                                        </p>
                                        {!file.isSafe && (
                                            <span className="text-[8px] bg-red-500 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Threat Detected</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-text-main-muted/30">
                                        <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                        <span className="w-1 h-1 rounded-full bg-text/10" />
                                        <span>Uploaded by {file.uploadedBy === profile.id ? 'You' : file.uploadedBy}</span>
                                    </div>
                                </div>

                                {file.isSafe && (
                                    <a
                                        href={file.downloadUrl}
                                        download={file.name}
                                        onClick={() => activeRoom && trackDownload(activeRoom.id, file)}
                                        className="w-10 h-10 rounded-xl bg-text/5 hover:bg-text/10 flex items-center justify-center text-text-main-muted/40 transition-all active:scale-95"
                                        onMouseEnter={(e) => e.currentTarget.style.color = activeTheme}
                                        onMouseLeave={(e) => e.currentTarget.style.color = ''}
                                    >
                                        <Download size={18} />
                                    </a>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-border bg-surface/50 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={14} style={{ color: activeTheme }} />
                            <span className="text-[9px] font-black text-text-main-muted/30 uppercase tracking-[0.2em]">End-to-End Encrypted Storage</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="px-8 py-2.5 bg-text/5 hover:bg-text/10 text-text-main text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-border"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SharedFilesModal;
