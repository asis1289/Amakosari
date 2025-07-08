const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateDiscountValue() {
  try {
    const offers = await prisma.offer.findMany();
    for (const offer of offers) {
      if ((offer.discount == null || offer.discount === undefined) && offer.discountValue != null) {
        await prisma.offer.update({
          where: { id: offer.id },
          data: {
            discount: offer.discountValue,
            discountValue: null,
          },
        });
      }
    }
    console.log('Migration complete: discountValue moved to discount.');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateDiscountValue(); 