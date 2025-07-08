const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function maybe(val) {
  return Math.random() > 0.5 ? val : null;
}

async function populateOffers() {
  try {
    const offers = await prisma.offer.findMany();
    for (const offer of offers) {
      const discount = Math.floor(Math.random() * 21) + 5; // 5-25%
      const minOrder = maybe((Math.random() * 100).toFixed(2));
      const now = new Date();
      const startDate = maybe(randomDate(new Date(now.getFullYear(), 0, 1), now));
      const endDate = maybe(randomDate(now, new Date(now.getFullYear() + 1, 0, 1)));
      const types = ['ALL', 'NEW_USER', 'PRODUCT', 'COLLECTION', 'CART'];
      const type = types[Math.floor(Math.random() * types.length)];
      const isActive = Math.random() > 0.2;
      const isForNewUser = Math.random() > 0.7;
      await prisma.offer.update({
        where: { id: offer.id },
        data: {
          discount,
          minimumOrderAmount: minOrder ? parseFloat(minOrder) : null,
          startDate,
          endDate,
          type,
          isActive,
          isForNewUser,
        },
      });
    }
    console.log('All offers populated with random values.');
  } catch (error) {
    console.error('Populate error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateOffers(); 