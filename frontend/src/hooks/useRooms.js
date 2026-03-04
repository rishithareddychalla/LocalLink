import { useState, useEffect } from 'react';
import mockRooms from '../mocks/mockRooms';

const useRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Simulate fetching room list
        const timer = setTimeout(() => {
            setRooms(mockRooms);
            setLoadingRooms(false);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    return {
        rooms,
        loadingRooms,
        error
    };
};

export default useRooms;
