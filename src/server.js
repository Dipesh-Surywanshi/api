const express = require('express');
require('dotenv').config();


const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');
const walletRoutes = require('./routes/walletRoutes');


const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');


const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});


app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/admin/wallet', adminRoutes);
app.use('/orders', orderRoutes);
app.use('/wallet', walletRoutes);


app.use(notFoundHandler);


app.use(errorHandler);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} `);
});


process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

module.exports = app;