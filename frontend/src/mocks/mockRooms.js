const mockRooms = [
    {
        id: 'r1',
        name: 'Dev Team Alpha',
        visibility: 'public',
        connectedCount: 6,
        participants: [
            { id: 'u1', name: 'Alex', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
            { id: 'u2', name: 'Jordan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan' },
            { id: 'u3', name: 'Taylor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor' }
        ]
    },
    {
        id: 'r2',
        name: 'Security Audit',
        visibility: 'private',
        connectedCount: 2,
        participants: [
            { id: 'u4', name: 'Sam', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam' },
            { id: 'u5', name: 'Casey', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey' }
        ]
    },
    {
        id: 'r3',
        name: 'General Chat',
        visibility: 'public',
        connectedCount: 18,
        participants: [
            { id: 'u6', name: 'Riley', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Riley' },
            { id: 'u7', name: 'Morgan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan' },
            { id: 'u8', name: 'Quinn', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Quinn' }
        ]
    }
];

export default mockRooms;
