const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Create new sale
router.post('/', async (req, res) => {
  try {
    const { name, description, startDate, endDate, discountPercent, isActive, collectionId } = req.body;
    if (!name || !description || !startDate || !endDate || !discountPercent) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const sale = await prisma.sale.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        discountPercent: parseFloat(discountPercent),
        isActive: isActive !== undefined ? isActive : true,
        collectionId: collectionId || null
      }
    });
    
    const createdSale = await prisma.sale.findUnique({ 
      where: { id: sale.id }, 
      include: { 
        saleItems: { include: { product: true } },
        collection: true
      } 
    });
    res.status(201).json(createdSale);
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all sales
router.get('/', async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        saleItems: {
          include: {
            product: true
          }
        },
        collection: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(sales);
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active sales
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const activeSales = await prisma.sale.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      include: {
        saleItems: {
          include: {
            product: true
          }
        },
        collection: true
      }
    });

    res.json(activeSales);
  } catch (error) {
    console.error('Get active sales error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get sale by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        saleItems: {
          include: {
            product: true
          }
        },
        collection: true
      }
    });

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json(sale);
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update sale
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, discountPercent, isActive, collectionId } = req.body;
    
    const sale = await prisma.sale.update({
      where: { id },
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        discountPercent: discountPercent ? parseFloat(discountPercent) : undefined,
        isActive,
        collectionId: collectionId || null
      }
    });
    
    const updatedSale = await prisma.sale.findUnique({ 
      where: { id }, 
      include: { 
        saleItems: { include: { product: true } },
        collection: true
      } 
    });
    res.json(updatedSale);
  } catch (error) {
    console.error('Update sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete sale
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get product IDs from this sale
    const saleItems = await prisma.saleItem.findMany({
      where: { saleId: id },
      select: { productId: true }
    });

    const productIds = saleItems.map(item => item.productId);

    // Delete sale items
    await prisma.saleItem.deleteMany({
      where: { saleId: id }
    });

    // Fetch sale name before delete
    const sale = await prisma.sale.findUnique({ where: { id } });
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    // Delete sale
    await prisma.sale.delete({
      where: { id }
    });

    // Update products to remove sale status if they're not in other sales
    if (productIds.length > 0) {
      await prisma.product.updateMany({
        where: {
          id: { in: productIds },
          NOT: { saleItems: { some: { saleId: id } } }
        },
        data: {
          isOnSale: false
        }
      });
    }

    res.json({ message: `Sale '${sale.name}' deleted successfully` });
  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 