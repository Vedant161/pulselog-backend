// Import necessary packages
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

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

const productionOrigin = "https://veridianflux.netlify.app";

const corsOptions = {
  origin: function (origin, callback) {
    // THIS IS THE MOST IMPORTANT DEBUGGING LINE
    console.log('--- INCOMING REQUEST ORIGIN:', origin, '---');

    if (process.env.NODE_ENV === 'production') {
      if (origin === productionOrigin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions
});

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

app.get('/', (req, res) => {
  res.send('Veridian Flux API is running...');
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port: ${PORT}`);
});