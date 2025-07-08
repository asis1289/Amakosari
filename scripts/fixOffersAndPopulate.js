const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Placeholder image URL (should be a valid image in your public/uploads or a CDN)
const PLACEHOLDER_IMAGE = '/frontend/public/uploads/placeholder.png';

async function fixOffers() {
  try {
    const offers = await prisma.offer.findMany();
    for (const offer of offers) {
      const updates = {};
      if (!offer.title) updates.title = 'Default Offer Title';
      if (!offer.description) updates.description = 'Default offer description.';
      if (offer.discount == null) updates.discount = Math.floor(Math.random() * 21) + 5;
      if (!offer.startDate) updates.startDate = new Date();
      if (!offer.endDate) updates.endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week later
      if (offer.minimumOrderAmount == null) updates.minimumOrderAmount = Math.floor(Math.random() * 100) + 10;
      if (offer.variant == null) updates.variant = Math.floor(Math.random() * 8);
      if (!offer.imageUrl) {
        // Set a placeholder image (or you could generate and upload a PNG here)
        updates.imageUrl = PLACEHOLDER_IMAGE;
      }
      if (Object.keys(updates).length > 0) {
        await prisma.offer.update({
          where: { id: offer.id },
          data: updates,
        });
      }
    }
    console.log('All offers fixed and populated with default values.');
  } catch (error) {
    console.error('Error fixing offers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixOffers(); 