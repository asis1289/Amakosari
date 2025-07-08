const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get hero background (public access)
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

module.exports = router; 