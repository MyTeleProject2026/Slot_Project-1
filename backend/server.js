const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

dotenv.config();

// Database connection
const pool = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const gameRoutes = require('./routes/games');
const walletRoutes = require('./routes/wallet');
const adminRoutes = require('./routes/admin');
const superAdminRoutes = require('./routes/superAdmin');
const mainAdminRoutes = require('./routes/mainAdmin');
const employeeRoutes = require('./routes/employee');
const chatRoutes = require('./routes/chat');
const promotionRoutes = require('./routes/promotions');
const settingsRoutes = require('./routes/settings');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000', 'https://testing-frontend-deploy.onrender.com',
      process.env.ADMIN_URL || 'http://localhost:3001',
      process.env.SUPER_ADMIN_URL || 'http://localhost:3002', 'https://frontend-super-admin-panel.onrender.com',
      process.env.MAIN_ADMIN_URL || 'http://localhost:3003'
    ],
    credentials: true
  }
});

// ============ TRUST PROXY (Required for Render) ============
app.set('trust proxy', true);

// ============ MIDDLEWARE ============

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000', 'https://testing-frontend-deploy.onrender.com',
    process.env.ADMIN_URL || 'http://localhost:3001',
    process.env.SUPER_ADMIN_URL || 'http://localhost:3002', 'https://frontend-super-admin-panel.onrender.com',
    process.env.MAIN_ADMIN_URL || 'http://localhost:3003'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Compression
app.use(compression());

// JSON and URL-encoded body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============ ROUTES ============

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/main-admin', mainAdminRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    code: '404'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    code: err.code || '500'
  });
});

// ============ SOCKET.IO ============

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-chat', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined chat`);
  });

  socket.on('join-admin', (adminId) => {
    socket.join(`admin-${adminId}`);
    console.log(`Admin ${adminId} joined chat`);
  });

  socket.on('send-message', async (data) => {
    try {
      const { userId, adminId, message, fromUser } = data;
      const [result] = await pool.query(
        `INSERT INTO chat_messages (user_id, admin_id, message, is_from_user) 
         VALUES (?, ?, ?, ?)`,
        [userId, adminId, message, fromUser]
      );
      const [newMessage] = await pool.query(
        'SELECT * FROM chat_messages WHERE id = ?',
        [result.insertId]
      );
      if (fromUser) {
        io.to(`admin-${adminId}`).emit('new-message', newMessage[0]);
      } else {
        io.to(`user-${userId}`).emit('new-message', newMessage[0]);
      }
      socket.emit('message-sent', newMessage[0]);
    } catch (error) {
      console.error('Chat error:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ============ START SERVER ============

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

// ============================================================
// ✅ Initialize GameMetadata table (wrapped in async IIFE)
// ============================================================
(async () => {
  try {
    const GameMetadata = require('./models/GameMetadata');
    await GameMetadata.initTable();
    console.log('✅ GameMetadata table initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize GameMetadata table:', error.message);
    // Don't crash the server – it will still work
  }
})();

module.exports = { app, io, httpServer };
