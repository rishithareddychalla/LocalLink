import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isInitializing } = useSession();
    const location = useLocation();

    if (isInitializing) {
        return (
            <div className="min-h-screen bg-[#0A0D11] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="text-[#00f0ff] animate-spin" size={32} />
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.5em]">Initializing Sub-Net Auth</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect them to the landing page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
