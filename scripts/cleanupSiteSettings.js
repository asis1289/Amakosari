const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function cleanupSiteSettings() {
  try {
    console.log('🔄 Cleaning up site settings table...\n');

    // First, let's see what's currently in the table
    const currentSettings = await prisma.siteSetting.findMany();
    console.log('Current site settings:');
    currentSettings.forEach(setting => {
      console.log(`- ${setting.key}: ${setting.value}`);
    });
    console.log('');

    // Delete all existing settings except admin_access_key
    const settingsToDelete = currentSettings.filter(setting => setting.key !== 'admin_access_key');
    
    if (settingsToDelete.length > 0) {
      console.log('🗑️  Deleting unwanted settings:');
      for (const setting of settingsToDelete) {
        console.log(`  - Deleting: ${setting.key}`);
        await prisma.siteSetting.delete({
          where: { id: setting.id }
        });
      }
      console.log('');
    }

    // Check if admin_access_key exists
    const existingAccessKey = await prisma.siteSetting.findUnique({
      where: { key: 'admin_access_key' }
    });

    if (existingAccessKey) {
      console.log('🔑 Current admin access key found:');
      console.log(`  - Key: ${existingAccessKey.key}`);
      console.log(`  - Value: ${existingAccessKey.value}`);
      console.log('');
      
      // Ask if user wants to update it
      console.log('⚠️  The admin access key exists. If you want to change it, please provide a new password.');
      console.log('   (Press Ctrl+C to keep the current one, or the script will continue)');
    } else {
      console.log('🔑 No admin access key found. Creating new one...');
      
      // Create a default admin access key (you should change this)
      const defaultPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 12);
      
      await prisma.siteSetting.create({
        data: {
          key: 'admin_access_key',
          value: hashedPassword
        }
      });
      
      console.log('✅ Created new admin access key with default password: admin123');
      console.log('⚠️  IMPORTANT: Please change this password immediately!');
    }

    // Verify the cleanup
    const remainingSettings = await prisma.siteSetting.findMany();
    console.log('\n✅ Cleanup completed! Remaining settings:');
    remainingSettings.forEach(setting => {
      if (setting.key === 'admin_access_key') {
        console.log(`  - ${setting.key}: [HASHED PASSWORD]`);
      } else {
        console.log(`  - ${setting.key}: ${setting.value}`);
      }
    });

    console.log('\n🎉 Site settings cleanup completed successfully!');
    console.log('📝 Only admin_access_key remains in the table.');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupSiteSettings(); 