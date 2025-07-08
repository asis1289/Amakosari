const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const { PrismaClient } = require('@prisma/client');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const promoterRoutes = require('./routes/promoters');
const salesRoutes = require('./routes/sales');
const offersRoutes = require('./routes/offers');
const contactRoutes = require('./routes/contact');
const categoryRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admin');
const collectionRoutes = require('./routes/collections');
const uploadRoutes = require('./routes/upload');
const wishlistRoutes = require('./routes/wishlist');
const stockNotificationRoutes = require('./routes/stock-notifications');
const cartRoutes = require('./routes/cart');
const heroRoutes = require('./routes/hero');
const settingsRoutes = require('./routes/settings');
const homepageRoutes = require('./routes/homepage');

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Add socket.io
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for guest cart
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/promoters', promoterRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/stock-notifications', stockNotificationRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api', heroRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin/homepage', homepageRoutes);
app.use('/api/homepage', homepageRoutes);

// Additional admin routes
app.use('/api/users', (req, res, next) => {
  req.url = req.url.replace('/api/users', '/admin/users');
  next();
}, adminRoutes);

app.use('/api/stats', (req, res, next) => {
  req.url = req.url.replace('/api/stats', '/admin/stats');
  next();
}, adminRoutes);

app.use('/api/inquiries', (req, res, next) => {
  req.url = req.url.replace('/api/inquiries', '/admin/inquiries');
  next();
}, adminRoutes);

// Frontend routes (redirect to API)
app.get('/orders', (req, res) => {
  res.redirect('/api/orders');
});

app.get('/categories/:category', (req, res) => {
  res.redirect(`/api/categories/${req.params.category}`);
});

app.get('/products/under-50', (req, res) => {
  res.redirect('/api/products/under-50');
});

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'आमाको Saaरी API is running!',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      reviews: '/api/reviews',
      promoters: '/api/promoters',
      sales: '/api/sales',
      offers: '/api/offers',
      contact: '/api/contact'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database connected successfully`);
  console.log(`🔗 API available at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;