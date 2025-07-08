const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all products (no pagination)
router.get('/all', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        reviews: {
          include: {
            user: {
              select: { 
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        collections: {
          include: {
            collection: true
          }
        },
        categoryRef: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(products);

  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all products with filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, sort = 'newest' } = req.query;
    const skip = (page - 1) * limit;

    const where = { isActive: true };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const orderBy = {};
    switch (sort) {
      case 'price-low':
        orderBy.price = 'asc';
        break;
      case 'price-high':
        orderBy.price = 'desc';
        break;
      case 'oldest':
        orderBy.createdAt = 'asc';
        break;
      default:
        orderBy.createdAt = 'desc';
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        reviews: {
          include: {
            user: {
              select: { 
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        collections: {
          include: {
            collection: true
          }
        }
      },
      orderBy,
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const total = await prisma.product.count({ where });

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get products under $50
router.get('/under-50', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        price: {
          lt: 50
        }
      },
      include: {
        reviews: {
          include: {
            user: {
              select: { 
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        collections: {
          include: {
            collection: true
          }
        }
      },
      orderBy: { price: 'asc' },
      take: 20 // Limit to 20 products for performance
    });

    // Add caching headers
    res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.json(products);

  } catch (error) {
    console.error('Get products under $50 error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get products on sale
router.get('/sale', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { isOnSale: true },
          {
            discounts: {
              some: {
                startDate: { lte: new Date() },
                endDate: { gte: new Date() }
              }
            }
          }
        ]
      },
      include: {
        reviews: {
          include: {
            user: {
              select: { 
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        collections: {
          include: {
            collection: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.set('Cache-Control', 'public, max-age=300');
    res.json(products);

  } catch (error) {
    console.error('Get sale products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get new arrivals
router.get('/new-arrivals', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { isNewArrival: true },
          {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        ]
      },
      include: {
        reviews: {
          include: {
            user: {
              select: { 
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        collections: {
          include: {
            collection: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.set('Cache-Control', 'public, max-age=300');
    res.json(products);

  } catch (error) {
    console.error('Get new arrivals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: { 
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        collections: {
          include: {
            collection: true
          }
        },
        categoryRef: true,
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new product (Admin only)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      price,
      categoryId,
      description,
      imageUrl,
      model3DUrl,
      sizes,
      colors,
      stock,
      originalPrice
    } = req.body;

    // Only require starred fields
    if (!name || !price || !categoryId) {
      return res.status(400).json({ error: 'Name, price, and category are required.' });
    }

    // Fetch the category name from the categoryId
    let categoryName = undefined;
    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      categoryName = category?.name;
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        categoryId,
        category: categoryName,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        model3DUrl: model3DUrl || undefined,
        sizes: Array.isArray(sizes) ? sizes : (sizes ? [sizes] : []),
        colors: Array.isArray(colors) ? colors : (colors ? [colors] : []),
        stock: stock !== undefined ? parseInt(stock) : 0,
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined
      }
    });

    // Emit real-time update event
    req.app.get('io').emit('product-updated', { productId: product.id });

    res.status(201).json({
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert arrays if needed
    if (updateData.sizes && !Array.isArray(updateData.sizes)) {
      updateData.sizes = [updateData.sizes];
    }
    if (updateData.colors && !Array.isArray(updateData.colors)) {
      updateData.colors = [updateData.colors];
    }
    if (updateData.price !== undefined && updateData.price !== null && updateData.price !== '') {
      updateData.price = parseFloat(updateData.price);
    }
    if (updateData.originalPrice !== undefined && updateData.originalPrice !== null && updateData.originalPrice !== '') {
      updateData.originalPrice = parseFloat(updateData.originalPrice);
    }
    if (updateData.stock !== undefined && updateData.stock !== null && updateData.stock !== '') {
      updateData.stock = parseInt(updateData.stock);
    }
    // Remove empty string fields for optional fields
    [
      'description', 'imageUrl', 'model3DUrl', 'category', 'categoryId', 'weight', 'dimensions', 'material', 'careInstructions', 'tags'
    ].forEach(field => {
      if (updateData[field] === '') {
        updateData[field] = undefined;
      }
    });
    // Convert tags to array if comma separated string
    if (typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    // Only allow scalar/updatable fields
    const allowedFields = [
      'name', 'description', 'price', 'originalPrice', 'imageUrl', 'model3DUrl',
      'sizes', 'colors', 'stock', 'category', 'categoryId', 'isOnSale', 'isNewArrival',
      'isFeatured', 'tags', 'weight', 'dimensions', 'material', 'careInstructions', 'isActive'
    ];
    const cleanUpdateData = {};
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) cleanUpdateData[key] = updateData[key];
    }

    const product = await prisma.product.update({
      where: { id },
      data: cleanUpdateData
    });

    // Emit real-time update event
    req.app.get('io').emit('product-updated', { productId: product.id });

    res.json({
      message: 'Product updated successfully',
      product
    });

  } catch (error) {
    console.error('Update product error:', error, error?.meta);
    res.status(500).json({ error: error.message, meta: error?.meta });
  }
});

// Delete product (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Fetch product name before soft delete
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    // Soft delete: set isActive to false
    await prisma.product.update({
      where: { id },
      data: { isActive: false }
    });
    res.json({ message: `Product '${product.name}' deleted successfully`, product });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category']
    });

    const categoryList = categories.map(cat => cat.category);

    res.json({ categories: categoryList });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 