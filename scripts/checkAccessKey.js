const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAccessKey() {
  try {
    console.log('🔍 Checking admin access key in database...\n');

    // Get the admin access key
    const adminAccessKeySetting = await prisma.siteSetting.findUnique({
      where: { key: 'admin_access_key' }
    });

    if (!adminAccessKeySetting) {
      console.log('❌ No admin access key found in database!');
      return;
    }

    console.log('✅ Admin access key found:');
    console.log(`  - Key: ${adminAccessKeySetting.key}`);
    console.log(`  - Value: ${adminAccessKeySetting.value}`);
    console.log(`  - Is hashed: ${adminAccessKeySetting.value.startsWith('$2') ? 'Yes' : 'No'}`);
    console.log('');

    // Test with the password you mentioned
    const bcrypt = require('bcryptjs');
    const testPassword = 'Vita_89129';
    
    console.log(`🧪 Testing with password: ${testPassword}`);
    
    try {
      const isValid = await bcrypt.compare(testPassword, adminAccessKeySetting.value);
      console.log(`  - Password match: ${isValid ? '✅ YES' : '❌ NO'}`);
    } catch (error) {
      console.log(`  - Error testing password: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error checking access key:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAccessKey(); 