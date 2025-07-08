const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken } = require('../middleware/auth');

// Get all homepage sections
router.get('/sections', authenticateToken, async (req, res) => {
  try {
    const sections = await prisma.homepageSection.findMany({
      orderBy: {
        order: "asc"
      }
    });
    
    res.json({ sections });
  } catch (error) {
    console.error('Error fetching homepage sections:', error);
    res.status(500).json({ error: 'Failed to fetch homepage sections' });
  }
});

// Update section status
router.patch('/sections/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const section = await prisma.homepageSection.update({
      where: { id },
      data: { isActive }
    });

    res.json({ section });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ error: 'Failed to update section' });
  }
});

// Reorder sections
router.post('/sections/reorder', authenticateToken, async (req, res) => {
  try {
    const { sections } = req.body;

    // Update each section's order
    for (const section of sections) {
      await prisma.homepageSection.update({
        where: { id: section.id },
        data: { order: section.order }
      });
    }

    res.json({ message: 'Sections reordered successfully' });
  } catch (error) {
    console.error('Error reordering sections:', error);
    res.status(500).json({ error: 'Failed to reorder sections' });
  }
});

// Create homepage section
router.post('/sections', authenticateToken, async (req, res) => {
  try {
    const sectionData = req.body;

    const section = await prisma.homepageSection.create({
      data: sectionData
    });

    res.status(201).json({ section });
  } catch (error) {
    console.error('Error creating homepage section:', error);
    res.status(500).json({ error: 'Failed to create section' });
  }
});

// Delete homepage section
router.delete('/sections/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.homepageSection.delete({
      where: { id }
    });

    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting homepage section:', error);
    res.status(500).json({ error: 'Failed to delete section' });
  }
});

// Get homepage content for a specific section
router.get('/content/:sectionId', async (req, res) => {
  try {
    const { sectionId } = req.params;

    const content = await prisma.homepageContent.findMany({
      where: { sectionId },
      orderBy: { order: 'asc' }
    });

    res.json({ content });
  } catch (error) {
    console.error('Error fetching section content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Get all homepage content
router.get('/content', async (req, res) => {
  try {
    const content = await prisma.homepageContent.findMany({
      orderBy: [
        {
          sectionId: "asc"
        },
        {
          order: "asc"
        }
      ]
    });
    
    res.json({ content });
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    res.status(500).json({ error: 'Failed to fetch homepage content' });
  }
});

// Update section content
router.post('/content', authenticateToken, async (req, res) => {
  try {
    const { sectionId, content } = req.body;

    // Delete existing content for this section
    await prisma.homepageContent.deleteMany({
      where: { sectionId }
    });

    // Add new content
    if (content && content.length > 0) {
      const contentData = content.map((contentId, index) => {
        // Determine content type based on what exists
        let contentType = 'product'; // default
        return {
          sectionId,
          contentType,
          contentId,
          order: index + 1
        };
      });

      await prisma.homepageContent.createMany({
        data: contentData
      });
    }

    res.json({ message: 'Section content updated successfully' });
  } catch (error) {
    console.error('Error updating section content:', error);
    res.status(500).json({ error: 'Failed to update section content' });
  }
});

// Reorder content within a section
router.post('/content/reorder', authenticateToken, async (req, res) => {
  try {
    const { sectionId, content } = req.body;

    // Update each content item's order
    for (const item of content) {
      await prisma.homepageContent.updateMany({
        where: { 
          sectionId,
          contentId: item.id
        },
        data: { order: item.order }
      });
    }

    res.json({ message: 'Content reordered successfully' });
  } catch (error) {
    console.error('Error reordering content:', error);
    res.status(500).json({ error: 'Failed to reorder content' });
  }
});

// Get available pages for offers
router.get('/pages', authenticateToken, async (req, res) => {
  try {
    const pages = [
      { id: 'home', name: 'Homepage', path: '/', sections: ['hero', 'offers', 'collections', 'products'] },
      { id: 'products', name: 'Products', path: '/products', sections: ['filters', 'grid', 'pagination'] },
      { id: 'categories', name: 'Categories', path: '/categories', sections: ['list', 'grid'] },
      { id: 'collections', name: 'Collections', path: '/collections', sections: ['featured', 'all'] },
      { id: 'sale', name: 'Sale', path: '/sale', sections: ['banner', 'products'] },
      { id: 'about', name: 'About', path: '/about', sections: ['content', 'team'] },
      { id: 'contact', name: 'Contact', path: '/contact', sections: ['form', 'info'] },
      { id: 'new-arrivals', name: 'New Arrivals', path: '/new-arrivals', sections: ['products'] },
      { id: 'under-50', name: 'Under $50', path: '/under-50', sections: ['products'] }
    ];

    res.json({ pages });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

// Get offers by display location
router.get('/offers/:location', async (req, res) => {
  try {
    const { location } = req.params;

    const offers = await prisma.offer.findMany({
      where: {
        isActive: true,
        displayLocation: location
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ offers });
  } catch (error) {
    console.error('Error fetching offers by location:', error);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// Get homepage preview data
router.get('/preview', authenticateToken, async (req, res) => {
  try {
    const sections = await prisma.homepageSection.findMany({
      orderBy: { displayOrder: 'asc' }
    });

    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const sales = await prisma.sale.findMany({
      include: {
        collection: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const collections = await prisma.collection.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      sections,
      offers,
      sales,
      collections,
      products
    });
  } catch (error) {
    console.error('Error fetching homepage preview data:', error);
    res.status(500).json({ error: 'Failed to fetch preview data' });
  }
});

module.exports = router; 