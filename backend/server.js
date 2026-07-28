const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Import modules
const pool = require('./config/database');
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

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: [
            process.env.FRONTEND_URL,
            process.env.ADMIN_URL,
            process.env.SUPER_ADMIN_URL,
            process.env.MAIN_ADMIN_URL
        ],
        credentials: true
    }
});

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api', limiter);

// CORS configuration
const corsOptions = {
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        process.env.ADMIN_URL || 'http://localhost:3001',
        process.env.SUPER_ADMIN_URL || 'http://localhost:3002',
        process.env.MAIN_ADMIN_URL || 'http://localhost:3003'
    ],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
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

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
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

// Error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error',
        code: err.code || '500'
    });
});

// Socket.IO for real-time chat
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
            
            // Save message to database
            const [result] = await pool.query(
                `INSERT INTO chat_messages (user_id, admin_id, message, is_from_user) 
                 VALUES (?, ?, ?, ?)`,
                [userId, adminId, message, fromUser]
            );

            const [newMessage] = await pool.query(
                'SELECT * FROM chat_messages WHERE id = ?',
                [result.insertId]
            );

            // Emit to user and admin rooms
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

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`🔗 Admin: ${process.env.ADMIN_URL || 'http://localhost:3001'}`);
});

module.exports = { app, io, httpServer };