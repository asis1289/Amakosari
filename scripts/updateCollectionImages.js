const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper: Get default icon/image for collection name (updated version)
function getDefaultCollectionImage(name) {
  const firstLetter = name.charAt(0).toUpperCase();
  const color = `#${((name.charCodeAt(0)*1234567)%0xFFFFFF).toString(16).padStart(6,'0')}`;
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='100%' height='100%' fill='${color}'/><text x='50%' y='55%' font-size='32' font-family='Arial' fill='white' text-anchor='middle' dominant-baseline='middle'>${firstLetter}</text></svg>`;
}

async function updateCollectionImages() {
  try {
    console.log('Starting collection image updates...');
    
    // Get all collections
    const collections = await prisma.collection.findMany();
    console.log(`Found ${collections.length} collections to update`);
    
    // Update each collection
    for (const collection of collections) {
      const newImageUrl = getDefaultCollectionImage(collection.name);
      
      await prisma.collection.update({
        where: { id: collection.id },
        data: { imageUrl: newImageUrl }
      });
      
      console.log(`Updated "${collection.name}" - new image: ${collection.name.charAt(0).toUpperCase()}`);
    }
    
    console.log('All collection images updated successfully!');
  } catch (error) {
    console.error('Error updating collection images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCollectionImages(); 