const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// 1. Config
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// 2. Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Socket.io
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"]
  }
});

// Pass 'io' to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 4. Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// 5. Chatbot Socket Logic (Echoing frontend steps)
io.on('connection', (socket) => {
  console.log(`🔌 User Connected: ${socket.id}`);

  // We only log here. The logic is handled by frontend state, 
  // but we can listen for logs or analytics here.
  socket.on('send_message', (data) => {
    console.log(`Msg from ${data.username}: ${data.message}`);
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🛡️  AnonSafety Server running on port ${PORT}`));