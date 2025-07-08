const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupHomepageSections() {
  try {
    console.log('Setting up homepage sections...');

    // Check if sections already exist
    const existingSections = await prisma.homepageSection.findMany();
    
    if (existingSections.length > 0) {
      console.log('Homepage sections already exist, skipping setup.');
      return;
    }

    // Create default sections
    const sections = [
      {
        name: 'Featured Products',
        slug: 'featured-products',
        description: 'Showcase your best products',
        isActive: true,
        displayOrder: 1
      },
      {
        name: 'New Arrivals',
        slug: 'new-arrivals',
        description: 'Latest products added to your store',
        isActive: true,
        displayOrder: 2
      },
      {
        name: 'Special Offers',
        slug: 'special-offers',
        description: 'Current promotions and deals',
        isActive: true,
        displayOrder: 3
      },
      {
        name: 'Collections',
        slug: 'collections',
        description: 'Curated product collections',
        isActive: true,
        displayOrder: 4
      },
      {
        name: 'Sale Items',
        slug: 'sale-items',
        description: 'Products on sale',
        isActive: true,
        displayOrder: 5
      }
    ];

    for (const section of sections) {
      await prisma.homepageSection.create({
        data: section
      });
      console.log(`Created section: ${section.name}`);
    }

    console.log('Homepage sections setup completed successfully!');
  } catch (error) {
    console.error('Error setting up homepage sections:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupHomepageSections(); 