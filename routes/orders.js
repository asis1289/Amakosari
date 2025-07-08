const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Create new order (supports both authenticated and guest users)
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { 
      products, 
      total, 
      shippingAddress, 
      billingAddress, 
      paymentMethod,
      guestInfo // For guest checkout: { firstName, lastName, email, phone }
    } = req.body;

    // Validate input
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Invalid order data' });
    }

    if (!shippingAddress || !billingAddress || !paymentMethod) {
      return res.status(400).json({ error: 'Shipping address, billing address, and payment method are required' });
    }

    // For guest users, validate guest info
    if (!userId && (!guestInfo || !guestInfo.firstName || !guestInfo.lastName || !guestInfo.email)) {
      return res.status(400).json({ error: 'Guest information is required for guest checkout' });
    }

    // Check product availability and stock
    for (const item of products) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }
    }

    // Create order
    const orderData = {
      totalAmount: parseFloat(total),
      shippingAddress: JSON.stringify(shippingAddress),
      billingAddress: JSON.stringify(billingAddress),
      paymentMethod,
      products: {
        create: products.map(item => ({
          productId: item.productId,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
          size: item.size,
          color: item.color
        }))
      }
    };

    // Add user info based on authentication status
    if (userId) {
      orderData.userId = userId;
    } else {
      // For guest orders, store guest info in notes field
      orderData.notes = JSON.stringify({
        guestInfo,
        orderType: 'guest'
      });
    }

    const order = await prisma.order.create({
      data: orderData,
      include: {
        products: {
          include: {
            product: true
          }
        },
        user: userId ? {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        } : false
      }
    });

    // Update product stock
    for (const item of products) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    // Clear cart after successful order
    if (userId) {
      // Clear authenticated user's cart
      await prisma.cartItem.deleteMany({
        where: { userId }
      });
    } else {
      // Clear guest user's cart from session
      if (req.session.guestCart) {
        req.session.guestCart = [];
      }
    }

    // Emit new-order event
    const io = req.app.get('io');
    if (io) {
      io.emit('new-order', order);
    }

    res.status(201).json({
      message: 'Order created successfully',
      order
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's orders
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        products: {
          include: {
            product: true
          }
        }
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.order.count({ where: { userId } });

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all orders (Admin)
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        products: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.order.count({ where });

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single order
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order status (Admin)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        products: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({ 
      message: 'Order status updated successfully',
      order 
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update payment status (Admin)
router.patch('/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({ error: 'Payment status is required' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { paymentStatus },
      include: {
        products: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({ 
      message: 'Payment status updated successfully',
      order 
    });

  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add tracking number (Admin)
router.patch('/:id/tracking', async (req, res) => {
  try {
    const { id } = req.params;
    const { trackingNumber } = req.body;

    if (!trackingNumber) {
      return res.status(400).json({ error: 'Tracking number is required' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { trackingNumber },
      include: {
        products: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({ 
      message: 'Tracking number added successfully',
      order 
    });

  } catch (error) {
    console.error('Add tracking number error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel order
router.patch('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        products: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user can cancel this order
    if (userId && order.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to cancel this order' });
    }

    // Check if order can be cancelled
    if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
      return res.status(400).json({ error: 'Order cannot be cancelled at this stage' });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    // Restore product stock
    for (const item of order.products) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      });
    }

    res.json({ 
      message: 'Order cancelled successfully',
      order: updatedOrder 
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Guest checkout endpoint
router.post('/guest', async (req, res) => {
  try {
    const {
      guestInfo, // { firstName, lastName, email, phone }
      shippingAddress,
      billingAddress,
      paymentMethod,
      cartItems,
      total
    } = req.body;

    // Validate guest info
    if (!guestInfo || !guestInfo.firstName || !guestInfo.lastName || !guestInfo.email) {
      return res.status(400).json({ message: 'Guest information is required' });
    }
    if (!shippingAddress || !billingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Shipping, billing address, and payment method are required' });
    }
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Check product stock
    for (const item of cartItems) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
    }

    // Generate tracking token
    const { v4: uuidv4 } = require('uuid');
    const trackingToken = uuidv4();

    // Create order
    const order = await prisma.order.create({
      data: {
        totalAmount: parseFloat(total),
        shippingAddress: JSON.stringify(shippingAddress),
        billingAddress: JSON.stringify(billingAddress),
        paymentMethod,
        guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
        guestEmail: guestInfo.email,
        guestPhone: guestInfo.phone,
        guestAddress: JSON.stringify(shippingAddress),
        orderTrackingToken: trackingToken,
        products: {
          create: cartItems.map(item => ({
            productId: item.productId,
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price),
            size: item.size,
            color: item.color
          }))
        }
      }
    });

    // Decrement product stock
    for (const item of cartItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
    }

    // Optionally: clear guest cart from session (if using session)
    if (req.session && req.session.guestCart) {
      req.session.guestCart = [];
    }

    // Optionally: emit new-order event
    const io = req.app.get('io');
    if (io) {
      io.emit('new-order', order);
    }

    res.status(201).json({ trackingToken });
  } catch (error) {
    console.error('Guest order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get guest order by tracking token
router.get('/guest/:trackingToken', async (req, res) => {
  try {
    const { trackingToken } = req.params;
    const order = await prisma.order.findUnique({
      where: { orderTrackingToken: trackingToken },
      include: {
        products: {
          include: {
            product: true
          }
        }
      }
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ order });
  } catch (error) {
    console.error('Fetch guest order error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 