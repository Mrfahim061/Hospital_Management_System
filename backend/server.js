const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins (for development purposes)
        methods: ['GET', 'POST'],
    },
});

const path = require('path');
app.use('/uploads', express.static('uploads'));

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/hospital', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err));

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// WebSocket for Video Call & Chat
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle joining a room
    socket.on('join-room', (roomId, userId) => {
        console.log(`${userId} joined room: ${roomId}`);
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);

        // Handle WebRTC signaling
        socket.on('offer', (data) => {
            console.log('Offer received:', data);
            socket.to(roomId).emit('offer', data);
        });

        socket.on('answer', (data) => {
            console.log('Answer received:', data);
            socket.to(roomId).emit('answer', data);
        });

        socket.on('ice-candidate', (data) => {
            console.log('ICE Candidate received:', data);
            socket.to(roomId).emit('ice-candidate', data);
        });

        // Handle user disconnection
        socket.on('disconnect', () => {
            console.log(`${userId} disconnected`);
            socket.to(roomId).emit('user-disconnected', userId);
        });
    });

    // Handle real-time chat messages
    socket.on('chat-message', ({ roomId, userId, message }) => {
        console.log(`Chat Message from ${userId} in ${roomId}: ${message}`);
        io.to(roomId).emit('chat-message', { userId, message });
    });
});

// Start Server
const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
