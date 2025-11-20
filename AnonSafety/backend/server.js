const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Routes
app.use('/api/reports', require('./routes/reports'));
// app.use('/api/auth', require('./routes/auth')); // (Assume Auth route exists similarly)

// Socket.io (Real-time Chat & Feed)
io.on('connection', (socket) => {
  console.log('User connected');
  
  socket.on('newPost', (post) => {
    io.emit('receivePost', post); // Broadcast to all
  });

  socket.on('disconnect', () => console.log('User disconnected'));
});

server.listen(5000, () => console.log("Server running on 5000"));