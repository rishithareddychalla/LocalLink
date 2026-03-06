const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, roomController.getRooms);
router.get('/:roomId', authMiddleware, roomController.getRoom);
router.post('/create', authMiddleware, roomController.createRoom);
router.post('/join', authMiddleware, roomController.joinRoom);

module.exports = router;
