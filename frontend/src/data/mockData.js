export const MOCK_DEVICES = [
    {
        id: '1',
        name: 'MacBook Pro',
        subtext: 'Apple Computer Inc.',
        type: 'laptop',
        status: 'online',
        actions: ['Details', 'Block']
    },
    {
        id: '2',
        name: 'iPhone 15',
        subtext: 'iOS Device',
        type: 'mobile',
        status: 'online',
        actions: ['Details', 'Block']
    },
    {
        id: '3',
        name: 'Linux Server',
        subtext: 'Ubuntu Node 01',
        type: 'server',
        status: 'online',
        actions: ['Details', 'Block']
    },
    {
        id: '4',
        name: 'Smart TV',
        subtext: 'Living Room Entertainment',
        type: 'tv',
        status: 'offline',
        actions: ['History', 'Forget']
    },
];

export const MOCK_ROOMS = [
    {
        id: 'r1',
        name: 'Dev Team Alpha',
        badge: 'PUBLIC',
        participants: 6,
        action: 'Join Room',
        isPrivate: false
    },
    {
        id: 'r2',
        name: 'Security Audit',
        badge: 'PRIVATE',
        participants: 2,
        action: 'Request Access',
        isPrivate: true
    },
    {
        id: 'r3',
        name: 'General Chat',
        badge: 'PUBLIC',
        participants: 18,
        action: 'Join Room',
        isPrivate: false
    },
];

export const MOCK_CHATS = [
    { id: 1, user: 'Alex', message: 'Hey, did you see the new update?', time: '10:05 AM' },
    { id: 2, user: 'Me', message: 'Yeah, looks amazing!', time: '10:06 AM' },
    { id: 3, user: 'Sarah', message: 'I can help with the testing.', time: '10:10 AM' },
];

export const MOCK_QUIZ = {
    questions: [
        {
            id: 1,
            question: "What does MERN stay for?",
            options: ["MongoDB, Express, React, Node", "MySQL, Express, React, Node", "MongoDB, Ember, React, Node", "MongoDB, Express, Ruby, Node"],
            correct: 0
        }
    ],
    leaderboard: [
        { name: 'Rishitha', score: 1200, streak: true },
        { name: 'Alex', score: 950, streak: false },
        { name: 'Sarah', score: 800, streak: false },
    ]
};

export const NEARBY_ROOMS = [
    {
        id: 'r1',
        name: 'Studio Session A',
        members: 3,
        ping: '12ms',
        type: 'public',
        participants: [
            { id: 'p1', name: 'Alex', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
            { id: 'p2', name: 'Jordan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan' },
            { id: 'p3', name: 'Taylor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor' }
        ]
    },
    {
        id: 'r2',
        name: 'Private Lobby',
        members: 1,
        ping: '8ms',
        type: 'private',
        participants: [
            { id: 'p4', name: 'Morgan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan' }
        ]
    },
    {
        id: 'r3',
        name: 'Gaming Zone',
        members: 5,
        ping: '15ms',
        type: 'public',
        participants: [
            { id: 'p5', name: 'Casey', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey' },
            { id: 'p6', name: 'Riley', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Riley' },
            { id: 'p7', name: 'Blake', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Blake' }
        ]
    }
];
