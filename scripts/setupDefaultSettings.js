const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupDefaultSettings() {
  try {
    console.log('Setting up default settings...');

    // Get all active offers
    const activeOffers = await prisma.offer.findMany({
      where: { isActive: true },
      select: { id: true }
    });

    // Get all active sales
    const activeSales = await prisma.sale.findMany({
      where: { isActive: true },
      select: { id: true }
    });

    // Set default homepage offers (first 3 active offers)
    const defaultOffers = activeOffers.slice(0, 3).map(offer => offer.id);
    await prisma.siteSetting.upsert({
      where: { key: 'homepage_offers' },
      update: { value: JSON.stringify(defaultOffers) },
      create: {
        key: 'homepage_offers',
        value: JSON.stringify(defaultOffers)
      }
    });

    // Set default homepage sales (all active sales)
    const defaultSales = activeSales.map(sale => sale.id);
    await prisma.siteSetting.upsert({
      where: { key: 'homepage_sales' },
      update: { value: JSON.stringify(defaultSales) },
      create: {
        key: 'homepage_sales',
        value: JSON.stringify(defaultSales)
      }
    });

    console.log('Default settings configured:');
    console.log('- Homepage offers:', defaultOffers.length, 'offers');
    console.log('- Homepage sales:', defaultSales.length, 'sales');
    console.log('Settings are now ready for the admin panel!');

  } catch (error) {
    console.error('Error setting up default settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupDefaultSettings(); 