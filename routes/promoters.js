const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();

// Generate promo code: first 4 letters of firstName + 2 random digits
function generatePromoCode(firstName) {
  const prefix = firstName.substring(0, 4).toUpperCase();
  const randomDigits = Math.floor(Math.random() * 90) + 10; // 10-99
  return `${prefix}${randomDigits}`;
}

// Register new promoter
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate unique promo code
    let promoCode = generatePromoCode(firstName);
    let attempts = 0;
    
    while (attempts < 10) {
      const existingPromoter = await prisma.user.findUnique({
        where: { email }
      });
      
      if (!existingPromoter) {
        break;
      }
      
      promoCode = generatePromoCode(firstName);
      attempts++;
    }

    if (attempts >= 10) {
      return res.status(500).json({ error: 'Unable to generate unique promo code' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and promoter
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: 'PROMOTER'
      }
    });

    const promoter = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        promoCode
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Promoter registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      promoter: {
        id: promoter.id,
        promoCode: promoter.promoCode,
        commission: promoter.commission
      },
      token
    });

  } catch (error) {
    console.error('Promoter registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all promoters (admin only)
router.get('/', async (req, res) => {
  try {
    const promoters = await prisma.user.findMany({
      where: { role: 'PROMOTER' },
      include: {
        promoCodeUsage: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(promoters);
  } catch (error) {
    console.error('Get promoters error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get promoter by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const promoter = await prisma.user.findUnique({
      where: { id, role: 'PROMOTER' },
      include: {
        promoCodeUsage: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!promoter) {
      return res.status(404).json({ error: 'Promoter not found' });
    }

    res.json(promoter);
  } catch (error) {
    console.error('Get promoter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update promoter
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, commission, isActive } = req.body;

    const promoter = await prisma.user.update({
      where: { id, role: 'PROMOTER' },
      data: {
        firstName,
        lastName,
        email,
        phone,
        commission: parseFloat(commission) || 0,
        isActive
      }
    });

    res.json(promoter);
  } catch (error) {
    console.error('Update promoter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete promoter
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id, role: 'PROMOTER' }
    });

    res.json({ message: 'Promoter deleted successfully' });
  } catch (error) {
    console.error('Delete promoter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate promo code
router.post('/validate-promo', async (req, res) => {
  try {
    const { promoCode, userId } = req.body;

    if (!promoCode) {
      return res.status(400).json({ error: 'Promo code is required' });
    }

    const promoter = await prisma.user.findUnique({
      where: { email: promoCode, role: 'PROMOTER' },
      include: {
        promoCodeUsage: {
          where: {
            userId
          }
        }
      }
    });

    if (!promoter) {
      return res.status(404).json({ error: 'Invalid promo code' });
    }

    if (!promoter.isActive) {
      return res.status(400).json({ error: 'Promo code is inactive' });
    }

    // Check if user has already used this promo code
    if (promoter.promoCodeUsage.length > 0) {
      return res.status(400).json({ error: 'You have already used this promo code' });
    }

    // Check if user has placed any orders
    const userOrders = await prisma.order.findMany({
      where: { userId }
    });

    if (userOrders.length > 0) {
      return res.status(400).json({ error: 'Promo code is only valid for new customers' });
    }

    res.json({
      valid: true,
      promoter: {
        firstName: promoter.firstName,
        lastName: promoter.lastName,
        commission: promoter.commission
      }
    });

  } catch (error) {
    console.error('Validate promo code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 