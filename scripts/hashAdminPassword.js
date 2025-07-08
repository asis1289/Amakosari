const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function hashAdminPassword() {
  try {
    console.log('🔐 Hashing admin access key...\n');

    // Get the current admin access key
    const currentSetting = await prisma.siteSetting.findUnique({
      where: { key: 'admin_access_key' }
    });

    if (!currentSetting) {
      console.log('❌ No admin access key found. Please run the cleanup script first.');
      return;
    }

    console.log('Current admin access key (plain text):', currentSetting.value);
    console.log('');

    // Hash the password
    const hashedPassword = await bcrypt.hash(currentSetting.value, 12);
    
    // Update the setting with the hashed password
    await prisma.siteSetting.update({
      where: { key: 'admin_access_key' },
      data: { value: hashedPassword }
    });

    console.log('✅ Admin access key has been hashed successfully!');
    console.log('🔑 You can now use the original password to access admin-register.');
    console.log('');
    console.log('📝 Original password:', currentSetting.value);
    console.log('🔒 Password is now securely hashed in the database.');

  } catch (error) {
    console.error('❌ Error hashing admin password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the hashing
hashAdminPassword(); 