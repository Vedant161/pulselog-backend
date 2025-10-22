// Import necessary packages
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const logRoutes = require('./routes/logRoutes');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables from .env file
dotenv.config();

// Initialize the Express app
const app = express();

connectDB();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Allow the server to accept JSON in the request body

const server = http.createServer(app); // 👈 Create an HTTP server from our Express app
const io = new Server(server, { // 👈 Initialize a new Socket.IO server
  cors: {
    origin: "*", // Allow connections from any origin for now
    methods: ["GET", "POST"]
  }
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log('🔌 A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/logs', logRoutes);

// A simple test route to make sure the server is working
app.get('/', (req, res) => {
  res.send('PulseLog API is running...');
});

// Define the port the server will run on
const PORT = process.env.PORT || 5001;

// Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});