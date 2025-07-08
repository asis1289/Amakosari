const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteAdmin() {
  try {
    // Delete admin user
    const deletedAdmin = await prisma.user.deleteMany({
      where: {
        role: 'ADMIN'
      }
    });

    console.log('Admin users deleted:', deletedAdmin.count);
    
    // Also delete any test users
    const deletedTestUsers = await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test'
        }
      }
    });

    console.log('Test users deleted:', deletedTestUsers.count);
    
  } catch (error) {
    console.error('Error deleting admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAdmin(); 