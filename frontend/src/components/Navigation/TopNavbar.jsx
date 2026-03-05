import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

const TopNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { profile } = useProfile();

    const handleFeaturesClick = (e) => {
        if (location.pathname === '/') {
            e.preventDefault();
            const element = document.getElementById('features');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                setIsMenuOpen(false);
            }
        }
    };

    const navLinks = [
        { label: 'Features', href: '/#features', onClick: handleFeaturesClick, type: 'link' },
        { label: 'Documentation', href: '/documentation', type: 'link' },
    ];

    return (
        <nav className="absolute top-0 w-full px-4 md:px-8 py-6 flex items-center justify-between z-50">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-background font-bold text-xl">
                        radar
                    </span>
                </div>
                <h2 className="text-text-main text-xl font-bold tracking-tight">
                    LocalLink Radar
                </h2>
            </div>

            {/* Desktop Links - Centered */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-sm font-semibold text-text-main-muted">
                {navLinks.map((link) => (
                    link.type === 'link' ? (
                        <Link key={link.label} to={link.href} onClick={link.onClick} className="hover:text-text-main transition-colors uppercase tracking-widest text-[10px]">{link.label}</Link>
                    ) : (
                        <a key={link.label} href={link.href} className="hover:text-text-main transition-colors uppercase tracking-widest text-[10px]">{link.label}</a>
                    )
                ))}
            </div>

            <div className="flex items-center gap-3 md:gap-6">
                <button
                    onClick={() => navigate('/profile')}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-border/50 overflow-hidden cursor-pointer hover:border-primary transition-all active:scale-95 shadow-lg bg-surface flex shrink-0"
                >
                    <img
                        src={profile?.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </button>
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden p-2 text-text-main-muted hover:text-text-main"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-40 md:hidden flex flex-col items-center justify-center gap-8">
                    {navLinks.map((link) => (
                        link.type === 'link' ? (
                            <Link
                                key={link.label}
                                to={link.href}
                                onClick={(e) => {
                                    if (link.onClick) link.onClick(e);
                                    setIsMenuOpen(false);
                                }}
                                className="text-2xl font-bold text-text-main-muted hover:text-primary transition-colors"
                            >
                                {link.label}
                            </Link>
                        ) : (
                            <a
                                key={link.label}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="text-2xl font-bold text-text-main-muted hover:text-primary transition-colors"
                            >
                                {link.label}
                            </a>
                        )
                    ))}
                </div>
            )}
        </nav>
    );
};

export default TopNavbar;
