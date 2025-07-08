const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearCollectionImages() {
  try {
    console.log('Starting to clear collection image URLs...');
    
    // Get all collections
    const collections = await prisma.collection.findMany();
    console.log(`Found ${collections.length} collections to clear`);
    
    // Clear imageUrl for each collection (set to null)
    for (const collection of collections) {
      await prisma.collection.update({
        where: { id: collection.id },
        data: { imageUrl: null }
      });
      
      console.log(`Cleared image URL for "${collection.name}"`);
    }
    
    console.log('All collection image URLs cleared successfully!');
    console.log('The backend will now generate fresh default images with first letters.');
  } catch (error) {
    console.error('Error clearing collection images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearCollectionImages(); 