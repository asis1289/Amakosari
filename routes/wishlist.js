const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateUser } = require('../middleware/auth');
const prisma = new PrismaClient();

// Apply authentication middleware to all wishlist routes
router.use(authenticateUser);

// Get user's wishlist (supports both authenticated and guest users)
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (userId) {
      // Authenticated user - get from database
      const wishlistItems = await prisma.wishlistItem.findMany({
        where: { userId },
        include: {
          product: {
            include: {
              reviews: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.json({ wishlistItems });
    } else {
      // Guest user - get from session
      const guestWishlist = req.session?.guestWishlist || [];
      // Fetch product details for guest wishlist items
      const wishlistItemsWithProducts = await Promise.all(
        guestWishlist.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            include: {
              reviews: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true
                    }
                  }
                }
              }
            }
          });
          if (!product) return null;
          return {
            id: item.id,
            product: product
          };
        })
      );
      const validWishlistItems = wishlistItemsWithProducts.filter(item => item !== null);
      return res.json({ wishlistItems: validWishlistItems });
    }
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Add item to wishlist (supports both authenticated and guest users)
router.post('/add/:productId', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;
    if (userId) {
      // Authenticated user - save to database
      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      // Check if already in wishlist
      const existingItem = await prisma.wishlistItem.findUnique({
        where: {
          userId_productId: {
            userId,
            productId
          }
        }
      });
      if (existingItem) {
        return res.status(400).json({ error: 'Product already in wishlist' });
      }
      // Add to wishlist
      const wishlistItem = await prisma.wishlistItem.create({
        data: {
          userId,
          productId
        },
        include: {
          product: true
        }
      });
      return res.json({ 
        message: 'Product added to wishlist',
        wishlistItem 
      });
    } else {
      // Guest user - save to session
      if (!req.session.guestWishlist) {
        req.session.guestWishlist = [];
      }
      // Check if already in wishlist
      const exists = req.session.guestWishlist.some(item => item.productId === productId);
      if (exists) {
        return res.status(400).json({ error: 'Product already in wishlist' });
      }
      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      // Add to guest wishlist
      const guestItem = {
        id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId
      };
      req.session.guestWishlist.push(guestItem);
      return res.json({ 
        message: 'Product added to wishlist',
        wishlistItem: { id: guestItem.id, product }
      });
    }
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// Remove item from wishlist (supports both authenticated and guest users)
router.delete('/remove/:productId', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;
    if (userId) {
      // Authenticated user - remove from database
      const deletedItem = await prisma.wishlistItem.deleteMany({
        where: {
          userId,
          productId
        }
      });
      if (deletedItem.count === 0) {
        return res.status(404).json({ error: 'Item not found in wishlist' });
      }
      return res.json({ message: 'Product removed from wishlist' });
    } else {
      // Guest user - remove from session
      if (!req.session.guestWishlist) {
        return res.status(404).json({ error: 'Item not found in wishlist' });
      }
      const index = req.session.guestWishlist.findIndex(item => item.productId === productId);
      if (index === -1) {
        return res.status(404).json({ error: 'Item not found in wishlist' });
      }
      req.session.guestWishlist.splice(index, 1);
      return res.json({ message: 'Product removed from wishlist' });
    }
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// Check if product is in wishlist
router.get('/check/:productId', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;
    
    if (!userId) {
      return res.json({ inWishlist: false });
    }

    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    res.json({ inWishlist: !!wishlistItem });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ error: 'Failed to check wishlist status' });
  }
});

// Clear wishlist (supports both authenticated and guest users)
router.delete('/clear', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (userId) {
      // Authenticated user - clear from database
      await prisma.wishlistItem.deleteMany({
        where: { userId }
      });
      return res.json({ message: 'Wishlist cleared' });
    } else {
      // Guest user - clear from session
      req.session.guestWishlist = [];
      return res.json({ message: 'Wishlist cleared' });
    }
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ error: 'Failed to clear wishlist' });
  }
});

module.exports = router; 