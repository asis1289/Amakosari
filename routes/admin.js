const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'frontend/public/uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'hero-bg-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed!'), false)
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

// Apply admin middleware to all routes
router.use(authenticateToken);

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // Test each query individually to find the issue
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const orderCount = await prisma.order.count();
    const categoryCount = await prisma.category.count();
    const collectionCount = await prisma.collection.count();
    const promoterCount = await prisma.user.count({ where: { role: 'PROMOTER' } });
    const inquiryCount = await prisma.contact.count();
    
    // Test total sales aggregation
    const totalSales = await prisma.order.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        status: "DELIVERED"
      }
    });

    // Test active sales count
    const activeSales = await prisma.sale.count({
      where: {
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() }
      }
    });

    // Test active offers count
    const activeOffers = await prisma.offer.count({
      where: {
        isActive: true,
        OR: [
          {
            startDate: null,
            endDate: null
          },
          {
            AND: [
              { startDate: { lte: new Date() } },
              { endDate: { gte: new Date() } }
            ]
          }
        ]
      }
    });

    // Test pending and completed orders
    const pendingOrders = await prisma.order.count({
      where: {
        status: "PENDING"
      }
    });

    const completedOrders = await prisma.order.count({
      where: {
        status: "DELIVERED"
      }
    });

    res.json({
      totalUsers: userCount,
      totalProducts: productCount,
      totalOrders: orderCount,
      totalRevenue: totalSales._sum.totalAmount || 0,
      activeSales: activeSales,
      activeOffers: activeOffers,
      totalCategories: categoryCount,
      totalCollections: collectionCount,
      totalPromoters: promoterCount,
      totalInquiries: inquiryCount,
      pendingOrders: pendingOrders,
      completedOrders: completedOrders
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get contact inquiries
router.get('/inquiries', async (req, res) => {
  try {
    const { limit } = req.query;
    const take = limit ? parseInt(limit) : undefined;
    
    const inquiries = await prisma.contact.findMany({
      take,
      orderBy: { createdAt: 'desc' }
    });

    // Count unread inquiries
    const unreadCount = await prisma.contact.count({ where: { isRead: false } });

    res.json({ inquiries, unreadCount });

  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        role,
        isActive
      }
    });

    res.json(user);

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await prisma.user.delete({ where: { id } });
    res.json({ message: `User '${user.firstName} ${user.lastName}' deleted successfully` });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all products with admin details
router.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
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
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(products);

  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create product
router.post('/products', async (req, res) => {
  try {
    const productData = req.body;
    const product = await prisma.product.create({
      data: productData
    });

    res.json(product);

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });

    res.json(product);

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await prisma.product.delete({ where: { id } });
    res.json({ message: `Product '${product.name}' deleted successfully` });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get color variants
router.get('/color-variants', async (req, res) => {
  try {
    const colorVariants = await prisma.colorVariant.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(colorVariants);

  } catch (error) {
    console.error('Get color variants error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all orders with admin details
router.get('/orders', async (req, res) => {
  try {
    const { limit } = req.query;
    const take = limit ? parseInt(limit) : undefined;
    
    const orders = await prisma.order.findMany({
      take,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        products: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ orders });

  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });

    res.json(order);

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all sales
router.get('/sales', async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(sales);

  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create sale
router.post('/sales', async (req, res) => {
  try {
    const saleData = req.body;
    const sale = await prisma.sale.create({
      data: saleData
    });

    res.json(sale);

  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update sale
router.put('/sales/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const sale = await prisma.sale.update({
      where: { id },
      data: updateData
    });

    res.json(sale);

  } catch (error) {
    console.error('Update sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete sale
router.delete('/sales/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await prisma.sale.findUnique({ where: { id } });
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    await prisma.sale.delete({ where: { id } });
    res.json({ message: `Sale '${sale.name}' deleted successfully` });
  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all offers
router.get('/offers', async (req, res) => {
  try {
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(offers);

  } catch (error) {
    console.error('Get offers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create offer
router.post('/offers', async (req, res) => {
  try {
    const offerData = req.body;
    const offer = await prisma.offer.create({
      data: offerData
    });

    res.json(offer);

  } catch (error) {
    console.error('Create offer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update offer
router.put('/offers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const offer = await prisma.offer.update({
      where: { id },
      data: updateData
    });

    res.json(offer);

  } catch (error) {
    console.error('Update offer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete offer
router.delete('/offers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await prisma.offer.findUnique({ where: { id } });
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    await prisma.offer.delete({ where: { id } });
    res.json({ message: `Offer '${offer.title}' deleted successfully` });
  } catch (error) {
    console.error('Delete offer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single offer by ID
router.get('/offers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await prisma.offer.findUnique({
      where: { id }
    });
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    res.json(offer);
  } catch (error) {
    console.error('Get offer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all promoters
router.get('/promoters', async (req, res) => {
  try {
    const promoters = await prisma.promoter.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(promoters);

  } catch (error) {
    console.error('Get promoters error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create promoter
router.post('/promoters', async (req, res) => {
  try {
    const promoterData = req.body;
    const promoter = await prisma.promoter.create({
      data: promoterData
    });

    res.json(promoter);

  } catch (error) {
    console.error('Create promoter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update promoter
router.put('/promoters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const promoter = await prisma.promoter.update({
      where: { id },
      data: updateData
    });

    res.json(promoter);

  } catch (error) {
    console.error('Update promoter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete promoter
router.delete('/promoters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const promoter = await prisma.promoter.findUnique({ where: { id } });
    if (!promoter) {
      return res.status(404).json({ error: 'Promoter not found' });
    }
    await prisma.promoter.delete({ where: { id } });
    res.json({ message: `Promoter '${promoter.name}' deleted successfully` });
  } catch (error) {
    console.error('Delete promoter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Hero Background Management
router.get('/hero-background', async (req, res) => {
  try {
    const heroBackground = await prisma.heroBackground.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })
    
    res.json({ heroBackground })
  } catch (error) {
    console.error('Get hero background error:', error)
    res.status(500).json({ error: 'Failed to get hero background' })
  }
})

router.post('/hero-background', upload.single('image'), async (req, res) => {
  try {
    let { isDefault, overlayOpacity } = req.body

    // Deactivate all existing backgrounds
    await prisma.heroBackground.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    })

    let imageUrl = null
    let finalIsDefault = false
    if (req.file) {
      // If an image is uploaded, always set isDefault to false
      imageUrl = `/uploads/${req.file.filename}`
      finalIsDefault = false
    } else {
      // If no image, use isDefault from request (default to true if not provided)
      finalIsDefault = isDefault === 'true' || isDefault === true
    }

    const heroBackground = await prisma.heroBackground.create({
      data: {
        imageUrl,
        isDefault: finalIsDefault,
        overlayOpacity: parseFloat(overlayOpacity) || 0.2,
        isActive: true
      }
    })

    res.json({ heroBackground, message: 'Hero background updated successfully' })
  } catch (error) {
    console.error('Update hero background error:', error)
    res.status(500).json({ error: 'Failed to update hero background' })
  }
})

router.post('/hero-background/reset', async (req, res) => {
  try {
    // Deactivate all existing backgrounds
    await prisma.heroBackground.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    })
    
    // Create default background
    const heroBackground = await prisma.heroBackground.create({
      data: {
        imageUrl: null,
        isDefault: true,
        overlayOpacity: 0.2,
        isActive: true
      }
    })
    
    res.json({ heroBackground, message: 'Hero background reset to default' })
  } catch (error) {
    console.error('Reset hero background error:', error)
    res.status(500).json({ error: 'Failed to reset hero background' })
  }
})

// Update admin access key (admin only)
router.put('/access-key', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newAccessKey } = req.body;
    
    if (!currentPassword || !newAccessKey) {
      return res.status(400).json({ error: 'Current password and new access key are required.' });
    }
    
    if (typeof newAccessKey !== 'string' || newAccessKey.length < 8) {
      return res.status(400).json({ error: 'New access key must be at least 8 characters.' });
    }
    
    // Verify current password
    const bcrypt = require('bcryptjs');
    const admin = await prisma.user.findFirst({
      where: { 
        id: req.user.id,
        role: 'ADMIN'
      }
    });
    
    if (!admin || !admin.password) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }
    
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }
    
    // Validate password strength
    const hasUppercase = /[A-Z]/.test(newAccessKey);
    const hasLowercase = /[a-z]/.test(newAccessKey);
    const hasNumber = /\d/.test(newAccessKey);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newAccessKey);
    
    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({ 
        error: 'Access key must contain at least one uppercase letter, one lowercase letter, one number, and one special character.' 
      });
    }
    
    // Update the access key
    await prisma.siteSetting.upsert({
      where: { key: 'admin_access_key' },
      update: { value: newAccessKey },
      create: { key: 'admin_access_key', value: newAccessKey }
    });
    
    res.json({ message: 'Admin access key updated successfully.' });
  } catch (error) {
    console.error('Update access key error:', error);
    res.status(500).json({ error: 'Failed to update access key.' });
  }
});

// Standard color list for product color picker
const STANDARD_COLORS = [
  { name: 'Red', color: '#FF0000' },
  { name: 'Blue', color: '#0000FF' },
  { name: 'Green', color: '#008000' },
  { name: 'Black', color: '#000000' },
  { name: 'White', color: '#FFFFFF' },
  { name: 'Gold', color: '#FFD700' },
  { name: 'Pink', color: '#FFC0CB' },
  { name: 'Purple', color: '#800080' },
  { name: 'Orange', color: '#FFA500' },
  { name: 'Yellow', color: '#FFFF00' },
  { name: 'Brown', color: '#A52A2A' },
  { name: 'Silver', color: '#C0C0C0' },
  { name: 'Maroon', color: '#800000' },
  { name: 'Navy', color: '#000080' },
  { name: 'Teal', color: '#008080' },
  { name: 'Beige', color: '#F5F5DC' },
  { name: 'Grey', color: '#808080' },
  { name: 'Multicolor', color: 'linear-gradient(90deg, #FF0000, #FFFF00, #00FF00, #0000FF, #800080)' },
  { name: 'Cream', color: '#FFFDD0' },
  { name: 'Sky Blue', color: '#87CEEB' },
  { name: 'Magenta', color: '#FF00FF' },
  { name: 'Cyan', color: '#00FFFF' },
  { name: 'Olive', color: '#808000' },
  { name: 'Lime', color: '#00FF00' },
  { name: 'Indigo', color: '#4B0082' },
  { name: 'Violet', color: '#EE82EE' },
  { name: 'Turquoise', color: '#40E0D0' },
  { name: 'Peach', color: '#FFDAB9' },
  { name: 'Coral', color: '#FF7F50' },
  { name: 'Mint', color: '#98FF98' },
  { name: 'Lavender', color: '#E6E6FA' },
  { name: 'Mustard', color: '#FFDB58' },
  { name: 'Charcoal', color: '#36454F' },
  { name: 'Tan', color: '#D2B48C' },
  { name: 'Rose', color: '#FF007F' },
  { name: 'Wine', color: '#722F37' },
  { name: 'Khaki', color: '#F0E68C' },
  { name: 'Plum', color: '#8E4585' },
  { name: 'Ivory', color: '#FFFFF0' },
  { name: 'Chocolate', color: '#7B3F00' },
  { name: 'Copper', color: '#B87333' },
  { name: 'Bronze', color: '#CD7F32' },
  { name: 'Azure', color: '#007FFF' },
  { name: 'Sea Green', color: '#2E8B57' },
  { name: 'Forest Green', color: '#228B22' },
  { name: 'Lemon', color: '#FFF700' },
  { name: 'Sand', color: '#C2B280' },
  { name: 'Pearl', color: '#EAE0C8' },
  { name: 'Ruby', color: '#E0115F' },
  { name: 'Sapphire', color: '#0F52BA' },
  { name: 'Emerald', color: '#50C878' },
  { name: 'Amber', color: '#FFBF00' },
  { name: 'Jade', color: '#00A86B' },
  { name: 'Onyx', color: '#353839' },
  { name: 'Slate', color: '#708090' },
  { name: 'Steel', color: '#4682B4' },
  { name: 'Blush', color: '#DE5D83' },
  { name: 'Lilac', color: '#C8A2C8' },
  { name: 'Eggplant', color: '#614051' },
  { name: 'Mint Green', color: '#98FF98' },
  { name: 'Apricot', color: '#FBCEB1' },
  { name: 'Floral White', color: '#FFFAF0' },
  { name: 'Honey', color: '#FFC30B' },
  { name: 'Mauve', color: '#E0B0FF' },
  { name: 'Periwinkle', color: '#CCCCFF' },
  { name: 'Powder Blue', color: '#B0E0E6' },
  { name: 'Rust', color: '#B7410E' },
  { name: 'Salmon', color: '#FA8072' },
  { name: 'Sunflower', color: '#FFDA03' },
  { name: 'Tangerine', color: '#F28500' },
  { name: 'Teal Blue', color: '#367588' },
  { name: 'Topaz', color: '#FFC87C' },
  { name: 'Zinc', color: '#7E7F9A' },
];

// GET /api/admin/colors - return standard color list
router.get('/colors', (req, res) => {
  res.json(STANDARD_COLORS);
});

// Create user
router.post('/users', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, dateOfBirth, role, isActive, invite } = req.body;
    if (!firstName || !lastName || !email || (!invite && !password)) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    // Hash password if provided
    let hashedPassword = undefined;
    if (password) {
      const bcrypt = require('bcryptjs');
      hashedPassword = await bcrypt.hash(password, 10);
    }
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        role: role || 'CUSTOMER',
        isActive: isActive !== undefined ? isActive : true,
      }
    });
    res.status(201).json(user);
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Email already exists.' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Access Key Management
router.get('/access-keys', authenticateToken, async (req, res) => {
  try {
    const accessKeys = await prisma.accessKey.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ accessKeys });
  } catch (error) {
    console.error('Error fetching access keys:', error);
    res.status(500).json({ error: 'Failed to fetch access keys' });
  }
});

router.post('/access-keys', authenticateToken, async (req, res) => {
  try {
    const { key } = req.body;

    if (!key || key.trim().length === 0) {
      return res.status(400).json({ error: 'Access key is required' });
    }

    // Check if key already exists
    const existingKey = await prisma.accessKey.findFirst({
      where: { key: key.trim() }
    });

    if (existingKey) {
      return res.status(400).json({ error: 'Access key already exists' });
    }

    const accessKey = await prisma.accessKey.create({
      data: {
        key: key.trim(),
        isActive: true
      }
    });

    res.status(201).json({ accessKey });
  } catch (error) {
    console.error('Error creating access key:', error);
    res.status(500).json({ error: 'Failed to create access key' });
  }
});

router.patch('/access-keys/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const accessKey = await prisma.accessKey.update({
      where: { id },
      data: { isActive }
    });

    res.json({ accessKey });
  } catch (error) {
    console.error('Error updating access key:', error);
    res.status(500).json({ error: 'Failed to update access key' });
  }
});

router.delete('/access-keys/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.accessKey.delete({
      where: { id }
    });

    res.json({ message: 'Access key deleted successfully' });
  } catch (error) {
    console.error('Error deleting access key:', error);
    res.status(500).json({ error: 'Failed to delete access key' });
  }
});

module.exports = router; 