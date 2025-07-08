const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Create new offer
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      imageUrl,
      startDate,
      endDate,
      discount,
      minimumOrderAmount,
      type,
      targetProductId,
      targetCollectionId,
      isForNewUser,
      isActive,
      variant,
      targetPage,
      targetSection,
      displayLocation
    } = req.body;

    if (!title || !description || !discount || !type) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const offer = await prisma.offer.create({
      data: {
        title,
        description,
        imageUrl,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        discount: parseFloat(discount),
        minimumOrderAmount: minimumOrderAmount ? parseFloat(minimumOrderAmount) : null,
        type,
        targetProductId: targetProductId || null,
        targetCollectionId: targetCollectionId || null,
        isForNewUser: !!isForNewUser,
        isActive: isActive !== undefined ? isActive : true,
        variant: typeof variant === 'number' ? variant : 0,
        targetPage: targetPage || null,
        targetSection: targetSection || null,
        displayLocation: displayLocation || null
      }
    });

    res.status(201).json(offer);
  } catch (error) {
    console.error('Create offer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all offers
router.get('/', async (req, res) => {
  try {
    const offers = await prisma.offer.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(offers);
  } catch (error) {
    console.error('Get offers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active offers
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const activeOffers = await prisma.offer.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
        OR: [
          { usageLimit: null },
          { usedCount: { lt: { usageLimit: true } } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(activeOffers);
  } catch (error) {
    console.error('Get active offers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get offer by ID
router.get('/:id', async (req, res) => {
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

// Update offer
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      imageUrl,
      startDate,
      endDate,
      discount,
      minimumOrderAmount,
      type,
      targetProductId,
      targetCollectionId,
      isForNewUser,
      isActive,
      variant,
      targetPage,
      targetSection,
      displayLocation
    } = req.body;

    const offer = await prisma.offer.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        discount: discount ? parseFloat(discount) : undefined,
        minimumOrderAmount: minimumOrderAmount ? parseFloat(minimumOrderAmount) : null,
        type,
        targetProductId: targetProductId || null,
        targetCollectionId: targetCollectionId || null,
        isForNewUser: !!isForNewUser,
        isActive: isActive !== undefined ? isActive : undefined,
        variant: typeof variant === 'number' ? variant : 0
      }
    });

    res.json(offer);
  } catch (error) {
    console.error('Update offer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete offer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch offer title before delete
    const offer = await prisma.offer.findUnique({ where: { id } });
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    await prisma.offer.delete({
      where: { id }
    });
    res.json({ message: `Offer '${offer.title}' deleted successfully` });
  } catch (error) {
    console.error('Delete offer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Apply offer to order
router.post('/apply', async (req, res) => {
  try {
    const { offerId, orderTotal } = req.body;

    const offer = await prisma.offer.findUnique({
      where: { id: offerId }
    });

    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    const now = new Date();
    if (!offer.isActive || now < offer.startDate || now > offer.endDate) {
      return res.status(400).json({ error: 'Offer is not active' });
    }

    if (offer.usageLimit && offer.usedCount >= offer.usageLimit) {
      return res.status(400).json({ error: 'Offer usage limit reached' });
    }

    if (offer.minimumOrderAmount && orderTotal < offer.minimumOrderAmount) {
      return res.status(400).json({ 
        error: `Minimum order amount of $${offer.minimumOrderAmount} required` 
      });
    }

    let discountAmount = 0;

    discountAmount = offer.discount;

    // Increment usage count
    await prisma.offer.update({
      where: { id: offerId },
      data: {
        usedCount: {
          increment: 1
        }
      }
    });

    res.json({
      offer,
      discountAmount,
      finalTotal: orderTotal - discountAmount
    });

  } catch (error) {
    console.error('Apply offer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 