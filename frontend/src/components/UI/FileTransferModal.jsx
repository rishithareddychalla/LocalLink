import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, X, UploadCloud, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useRoomFiles } from '../../hooks/useRoomFiles';

const FileTransferModal = ({ isOpen, onClose }) => {
    const fileInputRef = useRef(null);
    const {
        isDragging,
        uploadProgress,
        onDragOver,
        onDragLeave,
        onDrop,
        handleFileUpload
    } = useRoomFiles();

    if (!isOpen) return null;

    const handleFileInput = (e) => {
        const files = Array.from(e.target.files);
        handleFileUpload(files);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                className="relative w-full max-w-xl bg-background border border-primary/20 rounded-[24px] overflow-hidden shadow-2xl"
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-surface/50">
                    <div className="flex items-center gap-3">
                        <ArrowLeftRight size={20} className="text-primary" />
                        <h3 className="text-xl font-bold text-text-main">File Transfer</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-text/10 rounded-full transition-colors">
                        <X size={20} className="text-text-main-muted hover:text-text-main" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Upload Zone */}
                    <div
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-[24px] p-12 text-center transition-all group cursor-pointer relative overflow-hidden ${isDragging
                            ? "border-primary bg-primary/10 scale-[0.99]"
                            : "border-primary/30 bg-primary/5 hover:border-primary/50"
                            }`}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileInput}
                            className="hidden"
                            multiple
                        />
                        <div className={`absolute inset-0 bg-primary/10 transition-opacity ${isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                        <div className="relative">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors ${isDragging ? "bg-primary/30" : "bg-primary/10 group-hover:bg-primary/20"
                                }`}>
                                <UploadCloud className="text-primary" size={30} />
                            </div>
                            <h4 className="text-xl font-bold text-text-main mb-2">
                                {isDragging ? "Release to upload" : "Drop files here to share"}
                            </h4>
                            <p className="text-sm text-text-main-muted/40 mb-8">or click to browse from your device</p>
                            <button className="bg-primary text-black px-8 py-3 rounded-full font-bold hover:shadow-glow-sm transition-all">
                                Select Files
                            </button>
                        </div>
                    </div>

                    {/* Active Transfer Progress */}
                    <AnimatePresence>
                        {uploadProgress && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3 overflow-hidden"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ArrowLeftRight size={14} className="text-primary" />
                                        <span className="text-sm font-bold text-text-main truncate max-w-[200px]">
                                            Transferring {uploadProgress.name}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-primary">{uploadProgress.progress}%</span>
                                </div>
                                {/* Progress Bar */}
                                <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border">
                                    <div
                                        className="h-full bg-primary rounded-full relative shadow-glow-sm transition-all duration-300"
                                        style={{ width: `${uploadProgress.progress}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/30 w-1/2 rounded-full blur-[2px] right-0" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5 text-primary">
                                        <ShieldCheck size={12} />
                                        <span className="font-bold tracking-widest uppercase">Encryption Active</span>
                                    </div>
                                    <span className="text-text-main-muted/40 tracking-widest uppercase italic">Streaming...</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-border bg-surface/50">
                    <div className="flex items-center justify-center gap-2 text-text-main-muted/40 mb-6">
                        <ShieldCheck size={14} className="text-primary" />
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">PEER-TO-PEER SECURE TRANSFER</span>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={onClose}
                            className="w-1/2 py-3 rounded-xl font-bold text-text-main-muted hover:bg-text/5 hover:text-text-main transition-all border border-transparent shadow-[inset_0_0_0_1px_var(--border)]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onClose}
                            className="w-1/2 py-3 bg-primary text-black rounded-xl font-bold hover:shadow-glow-sm transition-all"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default FileTransferModal;
