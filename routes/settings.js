const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const prisma = new PrismaClient();

// Get homepage offers setting (public endpoint for homepage)
router.get('/homepage-offers', async (req, res) => {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'homepage_offers' }
    });

    const selectedOffers = setting ? JSON.parse(setting.value) : [];
    
    res.json({ selectedOffers });
  } catch (error) {
    console.error('Error fetching homepage offers setting:', error);
    res.status(500).json({ error: 'Failed to fetch homepage offers setting' });
  }
});

// Get homepage offers setting (admin endpoint)
router.get('/admin/homepage-offers', authenticateToken, async (req, res) => {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'homepage_offers' }
    });

    const selectedOffers = setting ? JSON.parse(setting.value) : [];
    
    res.json({ selectedOffers });
  } catch (error) {
    console.error('Error fetching homepage offers setting:', error);
    res.status(500).json({ error: 'Failed to fetch homepage offers setting' });
  }
});

// Update homepage offers setting
router.post('/homepage-offers', authenticateToken, async (req, res) => {
  try {
    const { selectedOffers } = req.body;

    if (!Array.isArray(selectedOffers)) {
      return res.status(400).json({ error: 'selectedOffers must be an array' });
    }

    // Validate that all selected offers exist
    if (selectedOffers.length > 0) {
      const existingOffers = await prisma.offer.findMany({
        where: { id: { in: selectedOffers } }
      });

      if (existingOffers.length !== selectedOffers.length) {
        return res.status(400).json({ error: 'Some selected offers do not exist' });
      }
    }

    // Upsert the setting
    await prisma.siteSetting.upsert({
      where: { key: 'homepage_offers' },
      update: { value: JSON.stringify(selectedOffers) },
      create: {
        key: 'homepage_offers',
        value: JSON.stringify(selectedOffers)
      }
    });

    res.json({ 
      message: 'Homepage offers updated successfully',
      selectedOffers 
    });
  } catch (error) {
    console.error('Error updating homepage offers setting:', error);
    res.status(500).json({ error: 'Failed to update homepage offers setting' });
  }
});

// Get homepage sales setting (public endpoint for homepage)
router.get('/homepage-sales', async (req, res) => {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'homepage_sales' }
    });

    const selectedSales = setting ? JSON.parse(setting.value) : [];
    
    res.json({ selectedSales });
  } catch (error) {
    console.error('Error fetching homepage sales setting:', error);
    res.status(500).json({ error: 'Failed to fetch homepage sales setting' });
  }
});

// Get homepage sales setting (admin endpoint)
router.get('/admin/homepage-sales', authenticateToken, async (req, res) => {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'homepage_sales' }
    });

    const selectedSales = setting ? JSON.parse(setting.value) : [];
    
    res.json({ selectedSales });
  } catch (error) {
    console.error('Error fetching homepage sales setting:', error);
    res.status(500).json({ error: 'Failed to fetch homepage sales setting' });
  }
});

// Update homepage sales setting
router.post('/homepage-sales', authenticateToken, async (req, res) => {
  try {
    const { selectedSales } = req.body;

    if (!Array.isArray(selectedSales)) {
      return res.status(400).json({ error: 'selectedSales must be an array' });
    }

    // Validate that all selected sales exist
    if (selectedSales.length > 0) {
      const existingSales = await prisma.sale.findMany({
        where: { id: { in: selectedSales } }
      });

      if (existingSales.length !== selectedSales.length) {
        return res.status(400).json({ error: 'Some selected sales do not exist' });
      }
    }

    // Upsert the setting
    await prisma.siteSetting.upsert({
      where: { key: 'homepage_sales' },
      update: { value: JSON.stringify(selectedSales) },
      create: {
        key: 'homepage_sales',
        value: JSON.stringify(selectedSales)
      }
    });

    res.json({ 
      message: 'Homepage sales updated successfully',
      selectedSales 
    });
  } catch (error) {
    console.error('Error updating homepage sales setting:', error);
    res.status(500).json({ error: 'Failed to update homepage sales setting' });
  }
});

// Get consent status
router.get('/consent', authenticateToken, async (req, res) => {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'admin_consent' }
    });

    if (setting) {
      const consentData = JSON.parse(setting.value);
      res.json({
        consentGiven: true,
        message: consentData.message || '',
        timestamp: consentData.timestamp
      });
    } else {
      res.json({
        consentGiven: false,
        message: '',
        timestamp: null
      });
    }
  } catch (error) {
    console.error('Error fetching consent status:', error);
    res.status(500).json({ error: 'Failed to fetch consent status' });
  }
});

// Record consent
router.post('/consent', authenticateToken, async (req, res) => {
  try {
    const { consentGiven, message } = req.body;

    if (!consentGiven) {
      return res.status(400).json({ error: 'Consent must be given' });
    }

    const consentData = {
      consentGiven: true,
      message: message || '',
      timestamp: new Date().toISOString(),
      adminId: req.user.id
    };

    // Upsert the setting
    await prisma.siteSetting.upsert({
      where: { key: 'admin_consent' },
      update: { value: JSON.stringify(consentData) },
      create: {
        key: 'admin_consent',
        value: JSON.stringify(consentData)
      }
    });

    res.json({ 
      message: 'Consent recorded successfully',
      consentData 
    });
  } catch (error) {
    console.error('Error recording consent:', error);
    res.status(500).json({ error: 'Failed to record consent' });
  }
});

// Reset all settings to default
router.post('/reset', authenticateToken, async (req, res) => {
  try {
    // Reset hero background to default
    await prisma.heroBackground.updateMany({
      where: { isActive: true },
      data: {
        imageUrl: null,
        isDefault: true,
        overlayOpacity: 0.2
      }
    });

    // Clear homepage offers setting
    await prisma.siteSetting.deleteMany({
      where: { key: 'homepage_offers' }
    });

    // Clear homepage sales setting
    await prisma.siteSetting.deleteMany({
      where: { key: 'homepage_sales' }
    });

    // Clear consent setting
    await prisma.siteSetting.deleteMany({
      where: { key: 'admin_consent' }
    });

    res.json({ 
      message: 'All settings have been reset to default values successfully' 
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ error: 'Failed to reset settings' });
  }
});

module.exports = router; 