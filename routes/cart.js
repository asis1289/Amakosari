const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateUser } = require('../middleware/auth');
const prisma = new PrismaClient();

// Apply authentication middleware to all cart routes
router.use(authenticateUser);

// Get user's cart (supports both authenticated and guest users)
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (userId) {
      // Authenticated user - get from database
      const cartItems = await prisma.cartItem.findMany({
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

      // Calculate totals
      let subtotal = 0;
      let totalItems = 0;

      cartItems.forEach(item => {
        const price = item.product.originalPrice || item.product.price;
        subtotal += price * item.quantity;
        totalItems += item.quantity;
      });

      res.json({ 
        cartItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        totalItems
      });
    } else {
      // Guest user - get from session
      const guestCart = req.session?.guestCart || [];
      
      // Fetch product details for guest cart items
      const cartItemsWithProducts = await Promise.all(
        guestCart.map(async (item) => {
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
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            product
          };
        })
      );

      const validCartItems = cartItemsWithProducts.filter(item => item !== null);
      
      // Calculate totals
      let subtotal = 0;
      let totalItems = 0;

      validCartItems.forEach(item => {
        const price = item.product.originalPrice || item.product.price;
        subtotal += price * item.quantity;
        totalItems += item.quantity;
      });

      res.json({ 
        cartItems: validCartItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        totalItems
      });
    }
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart (supports both authenticated and guest users)
router.post('/add', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId, quantity = 1, size, color } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product is in stock
    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    if (userId) {
      // Authenticated user - save to database
      // Check if item already exists in cart
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          userId,
          productId,
          size: size || null,
          color: color || null
        }
      });

      let cartItem;

      if (existingItem) {
        // Update quantity
        cartItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { 
            quantity: existingItem.quantity + quantity,
            updatedAt: new Date()
          },
          include: {
            product: true
          }
        });
      } else {
        // Add new item
        cartItem = await prisma.cartItem.create({
          data: {
            userId,
            productId,
            quantity,
            size: size || null,
            color: color || null
          },
          include: {
            product: true
          }
        });
      }

      res.json({ 
        message: 'Product added to cart',
        cartItem 
      });
    } else {
      // Guest user - save to session
      if (!req.session.guestCart) {
        req.session.guestCart = [];
      }

      const existingItemIndex = req.session.guestCart.findIndex(
        item => item.productId === productId && 
                item.size === (size || null) && 
                item.color === (color || null)
      );

      if (existingItemIndex >= 0) {
        // Update quantity
        req.session.guestCart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        req.session.guestCart.push({
          id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          productId,
          quantity,
          size: size || null,
          color: color || null
        });
      }

      res.json({ 
        message: 'Product added to cart',
        cartItem: {
          id: req.session.guestCart[existingItemIndex >= 0 ? existingItemIndex : req.session.guestCart.length - 1].id,
          productId,
          quantity: existingItemIndex >= 0 ? req.session.guestCart[existingItemIndex].quantity : quantity,
          size: size || null,
          color: color || null,
          product
        }
      });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Update cart item quantity (supports both authenticated and guest users)
router.put('/update/:itemId', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    if (userId) {
      // Authenticated user - update in database
      // Check if item exists and belongs to user
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          id: itemId,
          userId
        },
        include: {
          product: true
        }
      });

      if (!existingItem) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      // Check stock
      if (existingItem.product.stock < quantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }

      // Update quantity
      const cartItem = await prisma.cartItem.update({
        where: { id: itemId },
        data: { 
          quantity,
          updatedAt: new Date()
        },
        include: {
          product: true
        }
      });

      res.json({ 
        message: 'Cart item updated',
        cartItem 
      });
    } else {
      // Guest user - update in session
      if (!req.session.guestCart) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      const itemIndex = req.session.guestCart.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      // Check stock
      const product = await prisma.product.findUnique({
        where: { id: req.session.guestCart[itemIndex].productId }
      });

      if (!product || product.stock < quantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }

      // Update quantity
      req.session.guestCart[itemIndex].quantity = quantity;

      res.json({ 
        message: 'Cart item updated',
        cartItem: {
          ...req.session.guestCart[itemIndex],
          product
        }
      });
    }
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Remove item from cart (supports both authenticated and guest users)
router.delete('/remove/:itemId', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.params;
    
    if (userId) {
      // Authenticated user - remove from database
      const deletedItem = await prisma.cartItem.deleteMany({
        where: {
          id: itemId,
          userId
        }
      });

      if (deletedItem.count === 0) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      res.json({ message: 'Item removed from cart' });
    } else {
      // Guest user - remove from session
      if (!req.session.guestCart) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      const itemIndex = req.session.guestCart.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      req.session.guestCart.splice(itemIndex, 1);
      res.json({ message: 'Item removed from cart' });
    }
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

// Get cart count (supports both authenticated and guest users)
router.get('/count', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (userId) {
      // Authenticated user - count from database
      const count = await prisma.cartItem.count({
        where: { userId }
      });

      res.json({ count });
    } else {
      // Guest user - count from session
      const count = req.session?.guestCart?.length || 0;
      res.json({ count });
    }
  } catch (error) {
    console.error('Error getting cart count:', error);
    res.status(500).json({ error: 'Failed to get cart count' });
  }
});

// Clear cart (supports both authenticated and guest users)
router.delete('/clear', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (userId) {
      // Authenticated user - clear from database
      await prisma.cartItem.deleteMany({
        where: { userId }
      });
    } else {
      // Guest user - clear from session
      req.session.guestCart = [];
    }

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router; 