const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Import routes from backend folder
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const categoryRoutes = require('./routes/categories');
const analyticsRoutes = require('./routes/analytics');

// Import middleware from backend folder
const { authenticateToken } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use('/static', express.static(frontendDir));

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const frontendDir = path.resolve(__dirname, '..', 'frontend');

// Serve static files (frontend)
app.use(express.static(frontendDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', authenticateToken, transactionRoutes);
app.use('/api/categories', authenticateToken, categoryRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Serve frontend for any non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDir, 'index.html'));
});

// Error handling middleware
app.use(errorHandler);

// Database connection (MongoDB)
const connectDB = require('./config/database');
connectDB();

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log('📱 Frontend:*');
    console.log('🔗 API: http://3.111.33.216:3000/api');
});

module.exports = app;