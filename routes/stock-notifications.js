const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateUser } = require('../middleware/auth');
const prisma = new PrismaClient();

// Apply authentication middleware to all stock notification routes
router.use(authenticateUser);

// Add stock notification (supports both authenticated and guest users)
router.post('/add/:productId', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product is out of stock
    if (product.stock > 0) {
      return res.status(400).json({ error: 'Product is in stock' });
    }

    if (userId) {
      // Authenticated user - save to database
      // Check if already subscribed
      const existingNotification = await prisma.stockNotification.findUnique({
        where: {
          userId_productId: {
            userId,
            productId
          }
        }
      });

      if (existingNotification) {
        return res.status(400).json({ error: 'Already subscribed to stock notifications for this product' });
      }

      // Add notification
      const notification = await prisma.stockNotification.create({
        data: {
          userId,
          productId,
          email
        },
        include: {
          product: true
        }
      });

      return res.json({ 
        message: 'Stock notification added successfully',
        notification 
      });
    } else {
      // Guest user - save to session
      if (!req.session.guestStockNotifications) {
        req.session.guestStockNotifications = [];
      }

      // Check if already subscribed
      const exists = req.session.guestStockNotifications.some(
        item => item.productId === productId && item.email === email
      );

      if (exists) {
        return res.status(400).json({ error: 'Already subscribed to stock notifications for this product' });
      }

      // Add to guest notifications
      const guestNotification = {
        id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId,
        email
      };

      req.session.guestStockNotifications.push(guestNotification);

      return res.json({ 
        message: 'Stock notification added successfully',
        notification: { id: guestNotification.id, product }
      });
    }
  } catch (error) {
    console.error('Add stock notification error:', error);
    res.status(500).json({ error: 'Failed to add stock notification' });
  }
});

// Remove stock notification (supports both authenticated and guest users)
router.delete('/remove/:productId', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;
    
    if (userId) {
      // Authenticated user - remove from database
      const deletedNotification = await prisma.stockNotification.deleteMany({
        where: {
          userId,
          productId
        }
      });

      if (deletedNotification.count === 0) {
        return res.status(404).json({ error: 'Stock notification not found' });
      }

      return res.json({ message: 'Stock notification removed successfully' });
    } else {
      // Guest user - remove from session
      if (!req.session.guestStockNotifications) {
        return res.status(404).json({ error: 'Stock notification not found' });
      }

      const index = req.session.guestStockNotifications.findIndex(
        item => item.productId === productId
      );

      if (index === -1) {
        return res.status(404).json({ error: 'Stock notification not found' });
      }

      req.session.guestStockNotifications.splice(index, 1);
      return res.json({ message: 'Stock notification removed successfully' });
    }
  } catch (error) {
    console.error('Remove stock notification error:', error);
    res.status(500).json({ error: 'Failed to remove stock notification' });
  }
});

// Check if user is subscribed to stock notifications for a product
router.get('/check/:productId', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;
    
    if (userId) {
      // Authenticated user - check database
      const notification = await prisma.stockNotification.findUnique({
        where: {
          userId_productId: {
            userId,
            productId
          }
        }
      });

      res.json({ isSubscribed: !!notification });
    } else {
      // Guest user - check session
      const isSubscribed = req.session?.guestStockNotifications?.some(
        item => item.productId === productId
      ) || false;

      res.json({ isSubscribed });
    }
  } catch (error) {
    console.error('Check stock notification error:', error);
    res.status(500).json({ error: 'Failed to check stock notification status' });
  }
});

// Get all stock notifications for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (userId) {
      // Authenticated user - get from database
      const notifications = await prisma.stockNotification.findMany({
        where: { userId },
        include: {
          product: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.json({ notifications });
    } else {
      // Guest user - get from session
      const guestNotifications = req.session?.guestStockNotifications || [];
      
      // Fetch product details for guest notifications
      const notificationsWithProducts = await Promise.all(
        guestNotifications.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId }
          });
          
          if (!product) return null;
          
          return {
            id: item.id,
            productId: item.productId,
            email: item.email,
            product
          };
        })
      );

      const validNotifications = notificationsWithProducts.filter(item => item !== null);
      return res.json({ notifications: validNotifications });
    }
  } catch (error) {
    console.error('Get stock notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch stock notifications' });
  }
});

// Admin route to notify users when product comes back in stock
router.post('/notify/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Check if product exists and is in stock
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ error: 'Product is still out of stock' });
    }

    // Get all notifications for this product
    const notifications = await prisma.stockNotification.findMany({
      where: {
        productId,
        isNotified: false
      },
      include: {
        user: true,
        product: true
      }
    });

    // Mark notifications as sent
    await prisma.stockNotification.updateMany({
      where: {
        productId,
        isNotified: false
      },
      data: {
        isNotified: true
      }
    });

    // Here you would typically send emails to users
    // For now, we'll just return the count
    return res.json({ 
      message: `Stock notifications sent to ${notifications.length} users`,
      notificationsCount: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('Notify stock availability error:', error);
    res.status(500).json({ error: 'Failed to send stock notifications' });
  }
});

module.exports = router; 