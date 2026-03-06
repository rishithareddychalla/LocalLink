const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const socketHandler = require('./sockets/socketHandler');
const getLocalIP = require('./utils/getLocalIP');

// Routes
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const fileRoutes = require('./routes/fileRoutes');
const profileRoutes = require('./routes/profileRoutes');
const networkRoutes = require('./routes/networkRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Inject IO into app for use in controllers
app.set('io', io);

// Socket Handler
socketHandler(io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/network', networkRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({ success: true, message: 'LocalLink In-Memory Backend API' });
});

server.listen(PORT, '0.0.0.0', () => {
    const lanIP = getLocalIP();
    console.log(`\x1b[32m%s\x1b[0m`, `LocalLink Backend running!`);
    console.log(`- Local:   http://localhost:${PORT}`);
    console.log(`- Network: http://${lanIP}:${PORT}`);
});
