const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('Checking current data...\n');

    // Check offers
    const offers = await prisma.offer.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        description: true,
        discount: true,
        isActive: true
      }
    });

    console.log('Active Offers:', offers.length);
    offers.forEach(offer => {
      console.log(`- ${offer.title} (${offer.discount}% OFF): ${offer.description}`);
    });

    console.log('\n');

    // Check sales
    const sales = await prisma.sale.findMany({
      where: { isActive: true },
      include: {
        collection: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('Active Sales:', sales.length);
    sales.forEach(sale => {
      console.log(`- ${sale.name} (${sale.discountPercent}% OFF): ${sale.description || 'No description'}`);
      if (sale.collection) {
        console.log(`  Collection: ${sale.collection.name}`);
      }
    });

    console.log('\n');

    // Check settings
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: ['homepage_offers', 'homepage_sales']
        }
      }
    });

    console.log('Current Settings:');
    settings.forEach(setting => {
      console.log(`- ${setting.key}: ${setting.value}`);
    });

  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData(); 