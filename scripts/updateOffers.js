const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateOffers() {
  try {
    const offers = await prisma.offer.findMany();
    for (const offer of offers) {
      const randomDiscount = Math.floor(Math.random() * 6) + 10; // 10-15
      await prisma.offer.update({
        where: { id: offer.id },
        data: {
          imageUrl: null,
          discount: randomDiscount,
        },
      });
    }
    console.log('All offers updated: imageUrl set to null, discount set to 10-15%.');
  } catch (error) {
    console.error('Error updating offers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateOffers(); 