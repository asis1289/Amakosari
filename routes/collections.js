const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../frontend/public/uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'collection-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all collections
router.get('/', async (req, res) => {
  try {
    const collections = await prisma.collection.findMany({
      where: { isActive: true },
      include: {
        products: {
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
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add product count and ensure imageUrl for each collection
    const collectionsWithCount = collections.map(collection => ({
      ...collection,
      productCount: collection.products.length,
      imageUrl: collection.imageUrl || getDefaultCollectionImage(collection.name)
    }));

    res.json(collectionsWithCount);
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// Get all collections (homepage optimized)
router.get('/homepage', async (req, res) => {
  try {
    const collections = await prisma.collection.findMany({
      where: { isActive: true },
      include: {
        products: true
      },
      orderBy: { createdAt: 'desc' }
    });
    // Map to homepage format
    const homepageCollections = collections.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      imageUrl: c.imageUrl || getDefaultCollectionImage(c.name),
      count: c.products.length
    }));
    res.json(homepageCollections);
  } catch (err) {
    console.error('Get collections error:', err);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// Get collection by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        products: {
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
          }
        }
      }
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    // Ensure collection has an imageUrl
    const collectionWithImage = {
      ...collection,
      imageUrl: collection.imageUrl || getDefaultCollectionImage(collection.name)
    };

    res.json(collectionWithImage);
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
});

// Get collection by id
router.get('/id/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        products: {
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
          }
        }
      }
    });
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    // Ensure collection has an imageUrl
    const collectionWithImage = {
      ...collection,
      imageUrl: collection.imageUrl || getDefaultCollectionImage(collection.name)
    };
    
    res.json(collectionWithImage);
  } catch (error) {
    console.error('Get collection by id error:', error);
    res.status(500).json({ error: 'Failed to fetch collection by id' });
  }
});

// Get collection by slug (alias for /id/:id for frontend compatibility)
router.get('/slug/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        products: {
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
          }
        }
      }
    });
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    // Ensure collection has an imageUrl
    const collectionWithImage = {
      ...collection,
      imageUrl: collection.imageUrl || getDefaultCollectionImage(collection.name)
    };
    
    res.json(collectionWithImage);
  } catch (error) {
    console.error('Get collection by slug error:', error);
    res.status(500).json({ error: 'Failed to fetch collection by slug' });
  }
});

// Helper: Get default icon/image for collection name
function getDefaultCollectionImage(name) {
  const firstLetter = name.charAt(0).toUpperCase();
  const color = `#${((name.charCodeAt(0)*1234567)%0xFFFFFF).toString(16).padStart(6,'0')}`;
  
  // Create SVG content
  const svgContent = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='100%' height='100%' fill='${color}'/><text x='50%' y='55%' font-size='32' font-family='Arial' fill='white' text-anchor='middle' dominant-baseline='middle'>${firstLetter}</text></svg>`;
  
  // Properly encode the SVG for data URL
  const encodedSvg = encodeURIComponent(svgContent);
  return `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
}

// Create new collection (Admin only)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, discountPercent, isActive } = req.body;
    
    let imageUrl = null;
    
    // If a file was uploaded, save it and get the URL
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    const collection = await prisma.collection.create({
      data: {
        name,
        description,
        discountPercent: parseFloat(discountPercent) || 0,
        imageUrl: imageUrl, // Will be null if no file uploaded
        isActive: isActive === 'true' || isActive === true
      }
    });
    
    res.status(201).json(collection);
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

// Update collection (Admin only)
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, discountPercent, isActive, removeImage } = req.body;
    
    // Get the current collection to preserve existing imageUrl
    const currentCollection = await prisma.collection.findUnique({
      where: { id }
    });
    
    if (!currentCollection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    let finalImageUrl = currentCollection.imageUrl; // Keep existing by default
    
    // Handle image update logic
    if (req.file) {
      // New file uploaded - save it and update imageUrl
      finalImageUrl = `/uploads/${req.file.filename}`;
    } else if (removeImage === 'true' || removeImage === true) {
      // Remove image requested - set to null
      finalImageUrl = null;
    }
    // Otherwise keep the existing imageUrl
    
    const collection = await prisma.collection.update({
      where: { id },
      data: {
        name,
        description,
        discountPercent: parseFloat(discountPercent) || 0,
        imageUrl: finalImageUrl,
        isActive: isActive === 'true' || isActive === true
      }
    });
    res.json(collection);
  } catch (error) {
    console.error('Update collection error:', error);
    res.status(500).json({ error: 'Failed to update collection' });
  }
});

// Delete collection (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Fetch collection name before delete
    const collection = await prisma.collection.findUnique({ where: { id } });
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    await prisma.collection.delete({
      where: { id }
    });
    res.json({ message: `Collection '${collection.name}' deleted successfully` });
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
});

// Add product to collection (Admin only)
router.post('/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const { productId } = req.body;

    const productCollection = await prisma.productCollection.create({
      data: {
        productId,
        collectionId: id
      },
      include: {
        product: true,
        collection: true
      }
    });

    res.status(201).json(productCollection);
  } catch (error) {
    console.error('Add product to collection error:', error);
    res.status(500).json({ error: 'Failed to add product to collection' });
  }
});

// Remove product from collection (Admin only)
router.delete('/:id/products/:productId', async (req, res) => {
  try {
    const { id, productId } = req.params;

    await prisma.productCollection.delete({
      where: {
        productId_collectionId: {
          productId,
          collectionId: id
        }
      }
    });

    res.json({ message: 'Product removed from collection successfully' });
  } catch (error) {
    console.error('Remove product from collection error:', error);
    res.status(500).json({ error: 'Failed to remove product from collection' });
  }
});

// Update products in collection (Admin only) - Bulk update
router.put('/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const { productIds } = req.body;

    if (!Array.isArray(productIds)) {
      return res.status(400).json({ error: 'productIds must be an array' });
    }

    // First, remove all existing products from the collection
    await prisma.productCollection.deleteMany({
      where: { collectionId: id }
    });

    // Then add the new products
    if (productIds.length > 0) {
      const productCollections = productIds.map(productId => ({
        productId,
        collectionId: id
      }));

      await prisma.productCollection.createMany({
        data: productCollections
      });
    }

    res.json({ message: 'Collection products updated successfully' });
  } catch (error) {
    console.error('Update collection products error:', error);
    res.status(500).json({ error: 'Failed to update collection products' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
  }
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ error: 'Only image files are allowed!' });
  }
  res.status(500).json({ error: 'Upload failed' });
});

module.exports = router; 