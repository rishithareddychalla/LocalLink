import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Navigation/Sidebar';
import Navbar from '../components/Navigation/Navbar';
import useStore from '../store/useStore';
import { Menu, X } from 'lucide-react';

const MainLayout = () => {
    const { isSidebarOpen, toggleSidebar } = useStore();

    return (
        <div className="flex h-screen bg-background text-text-main overflow-hidden font-inter relative">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar with responsive positioning */}
            <div className={`fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col min-w-0 bg-background">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
