import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('llr_notifications');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('llr_notifications', JSON.stringify(notifications));
    }, [notifications]);

    const addNotification = useCallback((notification) => {
        const newNotification = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            read: false,
            ...notification
        };

        setNotifications(prev => {
            // Check for duplicate recent threat notifications for the same file
            if (notification.type === 'threat') {
                const isDuplicate = prev.some(n =>
                    n.type === 'threat' &&
                    n.fileName === notification.fileName &&
                    Date.now() - n.timestamp < 5000 // 5 second debounce
                );
                if (isDuplicate) return prev;
            }
            return [newNotification, ...prev].slice(0, 50); // Keep last 50
        });
    }, []);

    const markAsRead = useCallback((id) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            addNotification,
            markAsRead,
            clearNotifications,
            unreadCount
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
