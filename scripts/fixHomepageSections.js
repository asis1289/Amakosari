const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixHomepageSections() {
  try {
    console.log('Fixing homepage sections...');

    // Get all existing sections
    const sections = await prisma.homepageSection.findMany();
    
    console.log(`Found ${sections.length} sections to update`);

    // Update each section with a slug
    for (const section of sections) {
      const slug = section.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      await prisma.homepageSection.update({
        where: { id: section.id },
        data: { slug }
      });
      
      console.log(`Updated section "${section.title}" with slug: ${slug}`);
    }

    console.log('Homepage sections fixed successfully!');
  } catch (error) {
    console.error('Error fixing homepage sections:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixHomepageSections(); 