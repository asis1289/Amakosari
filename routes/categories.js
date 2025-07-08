const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });

    // Add caching headers
    res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.json({ categories });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get categories by parent category
router.get('/parent/:parentCategory', async (req, res) => {
  try {
    const { parentCategory } = req.params;

    const categories = await prisma.category.findMany({
      where: {
        parentCategory: parentCategory
      },
      orderBy: { name: 'asc' }
    });

    res.json({ categories });

  } catch (error) {
    console.error('Get categories by parent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single category by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
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
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category });

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new category (Admin only)
router.post('/', async (req, res) => {
  try {
    const { name, slug, description, parentCategory, imageUrl } = req.body;

    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return res.status(400).json({ error: 'Category with this slug already exists' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        parentCategory,
        imageUrl
      }
    });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update category (Admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Category updated successfully',
      category
    });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete category (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const productsCount = await prisma.product.count({
      where: { categoryId: id }
    });

    if (productsCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with existing products' 
      });
    }

    // Fetch category name before delete
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    await prisma.category.delete({
      where: { id }
    });
    res.json({ message: `Category '${category.name}' deleted successfully` });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all products for a parent category (all subcategories)
router.get('/:parentCategory/products', async (req, res) => {
  try {
    const { parentCategory } = req.params;

    // Find all categories with this parentCategory
    const categories = await prisma.category.findMany({
      where: { parentCategory },
      select: { id: true }
    });
    const categoryIds = categories.map(c => c.id);

    // Find all products in these categories
    const products = await prisma.product.findMany({
      where: {
        categoryId: { in: categoryIds }
      },
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
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      products,
      count: products.length
    });
  } catch (error) {
    console.error('Get parent category products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

module.exports = router; 