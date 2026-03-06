import { useState, useEffect } from 'react';
import { getRoomsAPI } from '../services/roomService';
import { io } from 'socket.io-client';

const useRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const socket = io(`http://${window.location.hostname}:5000`);

        const fetchRooms = async () => {
            const response = await getRoomsAPI();
            if (response.success) {
                setRooms(response.rooms);
            } else {
                setError(response.error);
            }
            setLoadingRooms(false);
        };

        fetchRooms();

        // Socket listeners for real-time discovery
        socket.on('rooms_list', (roomsList) => {
            setRooms(roomsList);
            setLoadingRooms(false);
        });

        socket.on('room_created', (newRoom) => {
            setRooms(prev => {
                if (prev.some(r => r.id === newRoom.id)) return prev;
                return [...prev, newRoom];
            });
        });

        socket.on('room_updated', (updatedRoom) => {
            setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
        });

        socket.on('room_removed', (roomId) => {
            setRooms(prev => prev.filter(r => r.id !== roomId));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return {
        rooms,
        loadingRooms,
        error
    };
};

export default useRooms;
