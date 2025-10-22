// Import necessary packages
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path'); // Add path for serving files

// Import local modules
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const logRoutes = require('./routes/logRoutes');

// Load environment variables from .env file
dotenv.config();

// Initialize the Express app
const app = express();

// Connect to MongoDB
connectDB();

// --- CORS CONFIGURATION ---
// Define the allowed origin for requests
const allowedOrigin = process.env.CORS_ORIGIN || "https://veridianflux.netlify.app";

const corsOptions = {
  origin: allowedOrigin,
  methods: ["GET", "POST", "PUT", "DELETE"], // Add any other methods your API uses
};

// Middleware
app.use(cors(corsOptions)); // Use the strict CORS options for security
app.use(express.json());   // Allow the server to accept JSON in the request body

// --- SOCKET.IO & HTTP SERVER SETUP ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigin, // Use the same origin for Socket.IO
    methods: ["GET", "POST"]
  }
});

// Middleware to make `io` accessible from our controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Handle new Socket.IO connections
io.on('connection', (socket) => {
  console.log('🔌 A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// --- API ROUTES ---
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/logs', logRoutes);

// A simple test route to confirm the API is running
app.get('/', (req, res) => {
  res.send('Veridian Flux API is running...');
});

// Define the port the server will run on
const PORT = process.env.PORT || 5001;

// --- START THE SERVER ---
// This MUST be server.listen to run both Express and Socket.IO
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port: ${PORT}`);
});