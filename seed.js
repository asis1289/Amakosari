const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  await prisma.promoCodeUsage.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.review.deleteMany()
  await prisma.order.deleteMany()
  await prisma.offer.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.productCollection.deleteMany()
  await prisma.collection.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️  Cleared existing data')

  // Seed admin access key in SiteSetting
  await prisma.siteSetting.upsert({
    where: { key: 'admin_access_key' },
    update: { value: 'asis123' },
    create: { key: 'admin_access_key', value: 'asis123' }
  })

  console.log('🗝️  Seeded admin access key')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aamakosari.com' },
    update: {},
    create: {
      email: 'admin@aamakosari.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      phone: '+977-1-2345678'
    }
  })

  // Create sample customer
  const customerPassword = await bcrypt.hash('customer123', 10)
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'CUSTOMER',
      phone: '+977-98-7654321'
    }
  })

  // Create sample promoter
  const promoterPassword = await bcrypt.hash('promoter123', 10)
  const promoter = await prisma.user.upsert({
    where: { email: 'promoter@example.com' },
    update: {},
    create: {
      email: 'promoter@example.com',
      password: promoterPassword,
      firstName: 'Sarah',
      lastName: 'Promoter',
      role: 'PROMOTER',
      phone: '+977-97-1234567'
    }
  })

  // Create categories
  const categories = [
    // Women categories
    { name: 'Gunyu Cholo', slug: 'gunyu-cholo', parentCategory: 'women', description: 'Traditional Nepali women\'s dress' },
    { name: 'Haku Patasi', slug: 'haku-patasi', parentCategory: 'women', description: 'Newari traditional dress' },
    { name: 'Dhimal Dress', slug: 'dhimal-dress', parentCategory: 'women', description: 'Dhimal ethnic dress' },
    { name: 'Tharu Dress', slug: 'tharu-dress', parentCategory: 'women', description: 'Tharu ethnic dress' },
    { name: 'Magar Dress', slug: 'magar-dress', parentCategory: 'women', description: 'Magar ethnic dress' },
    { name: 'Gurung Dress', slug: 'gurung-dress', parentCategory: 'women', description: 'Gurung ethnic dress' },
    { name: 'Tamang Dress', slug: 'tamang-dress', parentCategory: 'women', description: 'Tamang ethnic dress' },
    { name: 'Sherpa Dress', slug: 'sherpa-dress', parentCategory: 'women', description: 'Sherpa ethnic dress' },
    { name: 'Mekhli', slug: 'mekhli', parentCategory: 'women', description: 'Rai/Limbu traditional dress' },
    { name: 'Meka', slug: 'meka', parentCategory: 'women', description: 'Traditional Meka dress' },
    { name: 'Taglung', slug: 'taglung', parentCategory: 'women', description: 'Traditional Taglung dress' },
    { name: 'Rajbanshi Dress', slug: 'rajbanshi-dress', parentCategory: 'women', description: 'Rajbanshi ethnic dress' },
    { name: 'Madhesi Dress', slug: 'madhesi-dress', parentCategory: 'women', description: 'Madhesi traditional dress' },
    { name: 'Saari', slug: 'saari', parentCategory: 'women', description: 'Traditional Saari' },
    { name: 'Kutha', slug: 'kutha', parentCategory: 'women', description: 'Traditional Kutha' },
    { name: 'Lehenga', slug: 'lehenga', parentCategory: 'women', description: 'Traditional Lehenga' },

    // Men categories
    { name: 'Daura Suruwal', slug: 'daura-suruwal', parentCategory: 'men', description: 'Traditional Nepali men\'s dress' },
    { name: 'Bhangra Suruwal', slug: 'bhangra-suruwal', parentCategory: 'men', description: 'Traditional Bhangra dress' },
    { name: 'Haku Patasi Set', slug: 'haku-patasi-set', parentCategory: 'men', description: 'Newari men\'s traditional set' },
    { name: 'Gunyo Bhoto', slug: 'gunyo-bhoto', parentCategory: 'men', description: 'Traditional Gunyo Bhoto' },
    { name: 'Dhaka Topi', slug: 'dhaka-topi', parentCategory: 'men', description: 'Traditional Dhaka Topi' },
    { name: 'Tamang Dress', slug: 'tamang-dress-men', parentCategory: 'men', description: 'Tamang men\'s dress' },
    { name: 'Magar Dress', slug: 'magar-dress-men', parentCategory: 'men', description: 'Magar men\'s dress' },
    { name: 'Gurung Dress', slug: 'gurung-dress-men', parentCategory: 'men', description: 'Gurung men\'s dress' },
    { name: 'Tharu Dress', slug: 'tharu-dress-men', parentCategory: 'men', description: 'Tharu men\'s dress' },
    { name: 'Sherpa Chuba', slug: 'sherpa-chuba', parentCategory: 'men', description: 'Sherpa traditional Chuba' },
    { name: 'Rai Mekhli', slug: 'rai-mekhli', parentCategory: 'men', description: 'Rai men\'s Mekhli' },
    { name: 'Limbu Mekhli', slug: 'limbu-mekhli', parentCategory: 'men', description: 'Limbu men\'s Mekhli' },
    { name: 'Madhesi Kurta Suruwal', slug: 'madhesi-kurta-suruwal', parentCategory: 'men', description: 'Madhesi traditional Kurta Suruwal' },
    { name: 'Boys Pajama Kurtha', slug: 'boys-pajama-kurtha', parentCategory: 'men', description: 'Boys traditional Pajama Kurtha' },

    // Kids categories
    { name: 'Kurta Pajama', slug: 'kurta-pajama', parentCategory: 'kids', description: 'Kids traditional Kurta Pajama' },
    { name: 'Waistcoats', slug: 'waistcoats', parentCategory: 'kids', description: 'Kids traditional Waistcoats' },
    { name: 'Daura Suruwal', slug: 'daura-suruwal-kids', parentCategory: 'kids', description: 'Kids Daura Suruwal' },
    { name: 'Pasni/First Birthday', slug: 'pasni-first-birthday', parentCategory: 'kids', description: 'Pasni and First Birthday dresses' },
    { name: 'Kurtis', slug: 'kurtis', parentCategory: 'kids', description: 'Kids traditional Kurtis' },
    { name: 'Lehengas', slug: 'lehengas-kids', parentCategory: 'kids', description: 'Kids traditional Lehengas' },
    { name: 'Gunyo Cholo', slug: 'gunyo-cholo-kids', parentCategory: 'kids', description: 'Kids Gunyo Cholo' },
    { name: 'Pasni Accessories', slug: 'pasni-accessories', parentCategory: 'kids', description: 'Pasni ceremony accessories' },
    { name: 'Bhoto Set', slug: 'bhoto-set', parentCategory: 'kids', description: 'Kids traditional Bhoto Set' },
    { name: 'Krishna Dresses', slug: 'krishna-dresses', parentCategory: 'kids', description: 'Krishna Janmashtami dresses' },

    // Jewellery categories
    { name: 'Ethnic Jewellery', slug: 'ethnic-jewellery', parentCategory: 'jewellery', description: 'Traditional ethnic jewellery' },
    { name: 'Temple Jewellery', slug: 'temple-jewellery', parentCategory: 'jewellery', description: 'Traditional temple jewellery' },
    { name: 'Necklaces', slug: 'necklaces', parentCategory: 'jewellery', description: 'Traditional necklaces' },
    { name: 'Mangalsutra', slug: 'mangalsutra', parentCategory: 'jewellery', description: 'Traditional Mangalsutra' },
    { name: 'Gold Imitation Chain', slug: 'gold-imitation-chain', parentCategory: 'jewellery', description: 'Gold imitation chains' },
    { name: 'Gold Imitation Hair', slug: 'gold-imitation-hair', parentCategory: 'jewellery', description: 'Gold imitation hair accessories' },
    { name: 'Tilhari Pote Naugedi', slug: 'tilhari-pote-naugedi', parentCategory: 'jewellery', description: 'Traditional Tilhari Pote Naugedi' },
    { name: 'Bangles', slug: 'bangles', parentCategory: 'jewellery', description: 'Traditional bangles' },
    { name: 'Bindi', slug: 'bindi', parentCategory: 'jewellery', description: 'Traditional Bindi' },
    { name: 'Brooch', slug: 'brooch', parentCategory: 'jewellery', description: 'Traditional brooches' },
    { name: 'Earrings', slug: 'earrings', parentCategory: 'jewellery', description: 'Traditional earrings' },
    { name: 'Anklets', slug: 'anklets', parentCategory: 'jewellery', description: 'Traditional anklets' },

    // Accessories categories
    { name: 'Kids Accessories', slug: 'kids-accessories', parentCategory: 'accessories', description: 'Kids traditional accessories' },
    { name: 'Men\'s Accessories', slug: 'mens-accessories', parentCategory: 'accessories', description: 'Men\'s traditional accessories' },
    { name: 'Women\'s Accessories', slug: 'womens-accessories', parentCategory: 'accessories', description: 'Women\'s traditional accessories' },
    { name: 'Ritual Accessories', slug: 'ritual-accessories', parentCategory: 'accessories', description: 'Ritual and ceremonial accessories' }
  ]

  for (const categoryData of categories) {
    await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {},
      create: categoryData
    })
  }

  // Create sample products (including some under $50)
  const products = [
    {
      name: 'Traditional Gunyu Cholo Set',
      description: 'Beautiful traditional Nepali Gunyu Cholo set with intricate designs',
      price: 89.99,
      originalPrice: 120.00,
      imageUrl: '/images/womensdefault.png',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Red', 'Blue', 'Green'],
      stock: 25,
      category: 'Gunyu Cholo',
      categorySlug: 'gunyu-cholo',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: true,
      tags: ['traditional', 'women', 'gunyu-cholo']
    },
    {
      name: 'Haku Patasi Traditional Dress',
      description: 'Elegant Newari Haku Patasi dress for special occasions',
      price: 129.99,
      originalPrice: 150.00,
      imageUrl: '/images/womensdefault.png',
      sizes: ['S', 'M', 'L'],
      colors: ['Black', 'Red'],
      stock: 15,
      category: 'Haku Patasi',
      categorySlug: 'haku-patasi',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: true,
      tags: ['newari', 'traditional', 'haku-patasi']
    },
    {
      name: 'Daura Suruwal Set',
      description: 'Classic Nepali Daura Suruwal set for men',
      price: 79.99,
      originalPrice: 100.00,
      imageUrl: '/images/mensdefault.jpg',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['White', 'Cream'],
      stock: 30,
      category: 'Daura Suruwal',
      categorySlug: 'daura-suruwal',
      isOnSale: false,
      isNewArrival: true,
      isFeatured: true,
      tags: ['traditional', 'men', 'daura-suruwal']
    },
    {
      name: 'Kids Kurta Pajama Set',
      description: 'Adorable traditional Kurta Pajama set for kids',
      price: 29.99,
      originalPrice: 45.00,
      imageUrl: '/images/kidsdefault.png',
      sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
      colors: ['Blue', 'Green', 'Red'],
      stock: 40,
      category: 'Kurta Pajama',
      categorySlug: 'kurta-pajama',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['kids', 'traditional', 'kurta-pajama']
    },
    {
      name: 'Traditional Bindi Set',
      description: 'Beautiful traditional Bindi set with various designs',
      price: 12.99,
      originalPrice: 18.00,
      imageUrl: '/images/jewellerydefault.png',
      sizes: ['One Size'],
      colors: ['Red', 'Gold', 'Silver'],
      stock: 100,
      category: 'Bindi',
      categorySlug: 'bindi',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['jewellery', 'bindi', 'traditional']
    },
    {
      name: 'Traditional Earrings',
      description: 'Elegant traditional earrings for special occasions',
      price: 24.99,
      originalPrice: 35.00,
      imageUrl: '/images/jewellerydefault.png',
      sizes: ['One Size'],
      colors: ['Gold', 'Silver'],
      stock: 50,
      category: 'Earrings',
      categorySlug: 'earrings',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['jewellery', 'earrings', 'traditional']
    },
    {
      name: 'Kids Waistcoat',
      description: 'Adorable traditional waistcoat for kids',
      price: 19.99,
      originalPrice: 28.00,
      imageUrl: '/images/kidsdefault.png',
      sizes: ['2-3Y', '4-5Y', '6-7Y'],
      colors: ['Blue', 'Red', 'Green'],
      stock: 35,
      category: 'Waistcoats',
      categorySlug: 'waistcoats',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['kids', 'waistcoat', 'traditional']
    },
    {
      name: 'Traditional Bangles Set',
      description: 'Beautiful set of traditional bangles',
      price: 15.99,
      originalPrice: 22.00,
      imageUrl: '/images/jewellerydefault.png',
      sizes: ['Small', 'Medium', 'Large'],
      colors: ['Gold', 'Silver', 'Red'],
      stock: 75,
      category: 'Bangles',
      categorySlug: 'bangles',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['jewellery', 'bangles', 'traditional']
    },
    {
      name: 'Wedding Gunyu Cholo',
      description: 'Exquisite wedding Gunyu Cholo with gold embroidery',
      price: 299.99,
      originalPrice: 399.00,
      imageUrl: '/images/womensdefault.png',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Red', 'Maroon', 'Burgundy', 'Gold'],
      stock: 10,
      category: 'Gunyu Cholo',
      categorySlug: 'gunyu-cholo',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: true,
      tags: ['wedding', 'traditional', 'women', 'gunyu-cholo']
    },
    {
      name: 'Festival Haku Patasi',
      description: 'Vibrant festival Haku Patasi for celebrations',
      price: 159.99,
      originalPrice: 200.00,
      imageUrl: '/images/womensdefault.png',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Red', 'Green', 'Blue', 'Purple'],
      stock: 20,
      category: 'Haku Patasi',
      categorySlug: 'haku-patasi',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: true,
      tags: ['festival', 'newari', 'traditional', 'haku-patasi']
    },
    {
      name: 'Engagement Daura Suruwal',
      description: 'Elegant engagement Daura Suruwal for men',
      price: 189.99,
      originalPrice: 250.00,
      imageUrl: '/images/mensdefault.jpg',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['White', 'Cream', 'Light Blue'],
      stock: 15,
      category: 'Daura Suruwal',
      categorySlug: 'daura-suruwal',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: true,
      tags: ['engagement', 'traditional', 'men', 'daura-suruwal']
    },
    {
      name: 'Pasni Kids Kurta',
      description: 'Adorable Pasni ceremony Kurta for kids',
      price: 39.99,
      originalPrice: 55.00,
      imageUrl: '/images/kidsdefault.png',
      sizes: ['1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y'],
      colors: ['Pink', 'Blue', 'Yellow', 'Green'],
      stock: 30,
      category: 'Kurta Pajama',
      categorySlug: 'kurta-pajama',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['pasni', 'kids', 'traditional', 'kurta-pajama']
    },
    {
      name: 'Bridesmaid Lehenga',
      description: 'Stunning bridesmaid Lehenga for wedding parties',
      price: 199.99,
      originalPrice: 280.00,
      imageUrl: '/images/womensdefault.png',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Pink', 'Purple', 'Mint', 'Peach'],
      stock: 12,
      category: 'Lehenga',
      categorySlug: 'lehenga',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: true,
      tags: ['bridesmaid', 'wedding', 'traditional', 'lehenga']
    },
    {
      name: 'New Arrival Dhimal Dress',
      description: 'Latest Dhimal ethnic dress with modern touch',
      price: 89.99,
      originalPrice: 120.00,
      imageUrl: '/images/womensdefault.png',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Red', 'Blue', 'Green', 'Orange'],
      stock: 18,
      category: 'Dhimal Dress',
      categorySlug: 'dhimal-dress',
      isOnSale: false,
      isNewArrival: true,
      isFeatured: true,
      tags: ['new-arrival', 'dhimal', 'ethnic', 'traditional']
    },
    {
      name: 'Traditional Anklets',
      description: 'Beautiful traditional anklets with bells',
      price: 18.99,
      originalPrice: 25.00,
      imageUrl: '/images/jewellerydefault.png',
      sizes: ['Small', 'Medium', 'Large'],
      colors: ['Silver', 'Gold', 'Rose Gold'],
      stock: 60,
      category: 'Anklets',
      categorySlug: 'anklets',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['jewellery', 'anklets', 'traditional']
    },
    // Additional products for more categories
    {
      name: 'Bhangra Suruwal Set',
      description: 'Traditional Bhangra dress for men',
      price: 95.99,
      originalPrice: 120.00,
      imageUrl: '/images/mensdefault.jpg',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['White', 'Cream', 'Blue'],
      stock: 20,
      category: 'Bhangra Suruwal',
      categorySlug: 'bhangra-suruwal',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['traditional', 'men', 'bhangra']
    },
    {
      name: 'Tharu Traditional Dress',
      description: 'Beautiful Tharu ethnic dress for women',
      price: 75.99,
      originalPrice: 95.00,
      imageUrl: '/images/womensdefault.png',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Red', 'Blue', 'Green'],
      stock: 25,
      category: 'Tharu Dress',
      categorySlug: 'tharu-dress',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['tharu', 'ethnic', 'traditional']
    },
    {
      name: 'Magar Traditional Dress',
      description: 'Elegant Magar ethnic dress',
      price: 85.99,
      originalPrice: 110.00,
      imageUrl: '/images/womensdefault.png',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Red', 'Black', 'Blue'],
      stock: 18,
      category: 'Magar Dress',
      categorySlug: 'magar-dress',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['magar', 'ethnic', 'traditional']
    },
    {
      name: 'Gurung Traditional Dress',
      description: 'Beautiful Gurung ethnic dress',
      price: 92.99,
      originalPrice: 115.00,
      imageUrl: '/images/womensdefault.png',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Red', 'Green', 'Blue'],
      stock: 22,
      category: 'Gurung Dress',
      categorySlug: 'gurung-dress',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['gurung', 'ethnic', 'traditional']
    },
    {
      name: 'Tamang Traditional Dress',
      description: 'Elegant Tamang ethnic dress',
      price: 78.99,
      originalPrice: 98.00,
      imageUrl: '/images/womensdefault.png',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Red', 'Blue', 'Green'],
      stock: 20,
      category: 'Tamang Dress',
      categorySlug: 'tamang-dress',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['tamang', 'ethnic', 'traditional']
    },
    {
      name: 'Sherpa Traditional Dress',
      description: 'Beautiful Sherpa ethnic dress',
      price: 88.99,
      originalPrice: 112.00,
      imageUrl: '/images/womensdefault.png',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Red', 'Blue', 'Green'],
      stock: 16,
      category: 'Sherpa Dress',
      categorySlug: 'sherpa-dress',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['sherpa', 'ethnic', 'traditional']
    },
    {
      name: 'Mekhli Traditional Dress',
      description: 'Elegant Mekhli dress for Rai/Limbu',
      price: 82.99,
      originalPrice: 105.00,
      imageUrl: '/images/womensdefault.png',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Red', 'Blue', 'Green'],
      stock: 19,
      category: 'Mekhli',
      categorySlug: 'mekhli',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['mekhli', 'rai', 'limbu', 'traditional']
    },
    {
      name: 'Traditional Saari',
      description: 'Beautiful traditional Saari',
      price: 65.99,
      originalPrice: 85.00,
      imageUrl: '/images/womensdefault.png',
      sizes: ['One Size'],
      colors: ['Red', 'Blue', 'Green', 'Purple'],
      stock: 30,
      category: 'Saari',
      categorySlug: 'saari',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['saari', 'traditional']
    },
    {
      name: 'Traditional Kutha',
      description: 'Elegant traditional Kutha',
      price: 45.99,
      originalPrice: 60.00,
      imageUrl: '/images/womensdefault.png',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Red', 'Blue', 'Green'],
      stock: 35,
      category: 'Kutha',
      categorySlug: 'kutha',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['kutha', 'traditional']
    },
    {
      name: 'Haku Patasi Set for Men',
      description: 'Traditional Newari men\'s Haku Patasi set',
      price: 105.99,
      originalPrice: 130.00,
      imageUrl: '/images/mensdefault.jpg',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'Blue'],
      stock: 15,
      category: 'Haku Patasi Set',
      categorySlug: 'haku-patasi-set',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['newari', 'men', 'traditional']
    },
    {
      name: 'Traditional Gunyo Bhoto',
      description: 'Classic Gunyo Bhoto for men',
      price: 55.99,
      originalPrice: 70.00,
      imageUrl: '/images/mensdefault.jpg',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['White', 'Cream'],
      stock: 40,
      category: 'Gunyo Bhoto',
      categorySlug: 'gunyo-bhoto',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['gunyo-bhoto', 'traditional']
    },
    {
      name: 'Traditional Dhaka Topi',
      description: 'Classic Nepali Dhaka Topi',
      price: 8.99,
      originalPrice: 12.00,
      imageUrl: '/images/mensdefault.jpg',
      sizes: ['One Size'],
      colors: ['Black', 'White', 'Red'],
      stock: 100,
      category: 'Dhaka Topi',
      categorySlug: 'dhaka-topi',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['dhaka-topi', 'traditional']
    },
    {
      name: 'Kids Daura Suruwal',
      description: 'Adorable kids Daura Suruwal set',
      price: 35.99,
      originalPrice: 45.00,
      imageUrl: '/images/kidsdefault.png',
      sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
      colors: ['White', 'Cream', 'Blue'],
      stock: 45,
      category: 'Daura Suruwal',
      categorySlug: 'daura-suruwal-kids',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['kids', 'daura-suruwal', 'traditional']
    },
    {
      name: 'Pasni First Birthday Dress',
      description: 'Beautiful Pasni dress for first birthday',
      price: 42.99,
      originalPrice: 55.00,
      imageUrl: '/images/kidsdefault.png',
      sizes: ['1-2Y', '2-3Y', '3-4Y'],
      colors: ['Pink', 'Blue', 'Yellow'],
      stock: 25,
      category: 'Pasni/First Birthday',
      categorySlug: 'pasni-first-birthday',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['pasni', 'first-birthday', 'kids']
    },
    {
      name: 'Kids Traditional Kurtis',
      description: 'Adorable traditional Kurtis for kids',
      price: 28.99,
      originalPrice: 38.00,
      imageUrl: '/images/kidsdefault.png',
      sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
      colors: ['Pink', 'Blue', 'Green', 'Yellow'],
      stock: 50,
      category: 'Kurtis',
      categorySlug: 'kurtis',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['kids', 'kurtis', 'traditional']
    },
    {
      name: 'Kids Traditional Lehengas',
      description: 'Beautiful kids Lehengas for special occasions',
      price: 48.99,
      originalPrice: 65.00,
      imageUrl: '/images/kidsdefault.png',
      sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
      colors: ['Pink', 'Purple', 'Red', 'Blue'],
      stock: 30,
      category: 'Lehenga',
      categorySlug: 'lehenga',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['kids', 'lehengas', 'traditional']
    },
    {
      name: 'Kids Gunyo Cholo',
      description: 'Adorable kids Gunyo Cholo set',
      price: 32.99,
      originalPrice: 42.00,
      imageUrl: '/images/kidsdefault.png',
      sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
      colors: ['Red', 'Blue', 'Green'],
      stock: 35,
      category: 'Gunyo Cholo',
      categorySlug: 'gunyo-cholo-kids',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['kids', 'gunyo-cholo', 'traditional']
    },
    {
      name: 'Pasni Accessories Set',
      description: 'Complete Pasni ceremony accessories',
      price: 22.99,
      originalPrice: 30.00,
      imageUrl: '/images/accessoriesdefault.png',
      sizes: ['One Size'],
      colors: ['Gold', 'Silver'],
      stock: 60,
      category: 'Pasni Accessories',
      categorySlug: 'pasni-accessories',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['pasni', 'accessories', 'kids']
    },
    {
      name: 'Kids Bhoto Set',
      description: 'Traditional kids Bhoto set',
      price: 38.99,
      originalPrice: 50.00,
      imageUrl: '/images/kidsdefault.png',
      sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
      colors: ['White', 'Cream', 'Blue'],
      stock: 25,
      category: 'Bhoto Set',
      categorySlug: 'bhoto-set',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['kids', 'bhoto', 'traditional']
    },
    {
      name: 'Krishna Janmashtami Dress',
      description: 'Beautiful Krishna dress for Janmashtami',
      price: 25.99,
      originalPrice: 35.00,
      imageUrl: '/images/kidsdefault.png',
      sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
      colors: ['Blue', 'Yellow', 'Green'],
      stock: 40,
      category: 'Krishna Dresses',
      categorySlug: 'krishna-dresses',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['krishna', 'janmashtami', 'kids']
    },
    {
      name: 'Ethnic Jewellery Set',
      description: 'Beautiful traditional ethnic jewellery set',
      price: 45.99,
      originalPrice: 60.00,
      imageUrl: '/images/jewellerydefault.png',
      sizes: ['One Size'],
      colors: ['Gold', 'Silver'],
      stock: 30,
      category: 'Ethnic Jewellery',
      categorySlug: 'ethnic-jewellery',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['ethnic', 'jewellery', 'traditional']
    },
    {
      name: 'Temple Jewellery Set',
      description: 'Elegant temple jewellery for special occasions',
      price: 65.99,
      originalPrice: 85.00,
      imageUrl: '/images/jewellerydefault.png',
      sizes: ['One Size'],
      colors: ['Gold', 'Silver'],
      stock: 20,
      category: 'Temple Jewellery',
      categorySlug: 'temple-jewellery',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['temple', 'jewellery', 'traditional']
    },
    {
      name: 'Traditional Necklace',
      description: 'Beautiful traditional necklace',
      price: 35.99,
      originalPrice: 48.00,
      imageUrl: '/images/jewellerydefault.png',
      sizes: ['One Size'],
      colors: ['Gold', 'Silver'],
      stock: 45,
      category: 'Necklaces',
      categorySlug: 'necklaces',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['necklace', 'jewellery', 'traditional']
    },
    {
      name: 'Traditional Mangalsutra',
      description: 'Sacred Mangalsutra for married women',
      price: 28.99,
      originalPrice: 38.00,
      imageUrl: '/images/jewellerydefault.png',
      sizes: ['One Size'],
      colors: ['Gold', 'Black'],
      stock: 55,
      category: 'Mangalsutra',
      categorySlug: 'mangalsutra',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['mangalsutra', 'jewellery', 'traditional']
    },
    {
      name: 'Gold Imitation Chain',
      description: 'Beautiful gold imitation chain',
      price: 18.99,
      originalPrice: 25.00,
      imageUrl: '/images/jewellerydefault.png',
      sizes: ['One Size'],
      colors: ['Gold', 'Rose Gold'],
      stock: 80,
      category: 'Gold Imitation Chain',
      categorySlug: 'gold-imitation-chain',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['gold-imitation', 'chain', 'jewellery']
    },
    {
      name: 'Gold Imitation Hair Accessories',
      description: 'Beautiful gold imitation hair accessories',
      price: 15.99,
      originalPrice: 22.00,
      imageUrl: '/images/jewellerydefault.png',
      sizes: ['One Size'],
      colors: ['Gold', 'Silver'],
      stock: 70,
      category: 'Gold Imitation Hair',
      categorySlug: 'gold-imitation-hair',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['gold-imitation', 'hair', 'accessories']
    },
    {
      name: 'Tilhari Pote Naugedi Set',
      description: 'Traditional Tilhari Pote Naugedi set',
      price: 32.99,
      originalPrice: 42.00,
      imageUrl: '/images/jewellerydefault.png',
      sizes: ['One Size'],
      colors: ['Gold', 'Silver'],
      stock: 40,
      category: 'Tilhari Pote Naugedi',
      categorySlug: 'tilhari-pote-naugedi',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['tilhari', 'pote', 'naugedi', 'traditional']
    },
    {
      name: 'Traditional Brooch',
      description: 'Elegant traditional brooch',
      price: 12.99,
      originalPrice: 18.00,
      imageUrl: '/images/jewellerydefault.png',
      sizes: ['One Size'],
      colors: ['Gold', 'Silver', 'Pearl'],
      stock: 90,
      category: 'Brooch',
      categorySlug: 'brooch',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['brooch', 'jewellery', 'traditional']
    },
    {
      name: 'Kids Accessories Set',
      description: 'Complete kids traditional accessories set',
      price: 25.99,
      originalPrice: 35.00,
      imageUrl: '/images/accessoriesdefault.png',
      sizes: ['One Size'],
      colors: ['Gold', 'Silver'],
      stock: 50,
      category: 'Kids Accessories',
      categorySlug: 'kids-accessories',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['kids', 'accessories', 'traditional']
    },
    {
      name: 'Men\'s Traditional Accessories',
      description: 'Complete men\'s traditional accessories set',
      price: 35.99,
      originalPrice: 45.00,
      imageUrl: '/images/accessoriesdefault.png',
      sizes: ['One Size'],
      colors: ['Gold', 'Silver'],
      stock: 30,
      category: 'Men\'s Accessories',
      categorySlug: 'mens-accessories',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['men', 'accessories', 'traditional']
    },
    {
      name: 'Women\'s Traditional Accessories',
      description: 'Complete women\'s traditional accessories set',
      price: 42.99,
      originalPrice: 55.00,
      imageUrl: '/images/accessoriesdefault.png',
      sizes: ['One Size'],
      colors: ['Gold', 'Silver'],
      stock: 35,
      category: 'Women\'s Accessories',
      categorySlug: 'womens-accessories',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['women', 'accessories', 'traditional']
    },
    {
      name: 'Ritual Accessories Set',
      description: 'Complete ritual and ceremonial accessories',
      price: 55.99,
      originalPrice: 70.00,
      imageUrl: '/images/accessoriesdefault.png',
      sizes: ['One Size'],
      colors: ['Gold', 'Silver'],
      stock: 25,
      category: 'Ritual Accessories',
      categorySlug: 'ritual-accessories',
      isOnSale: true,
      isNewArrival: false,
      isFeatured: false,
      tags: ['ritual', 'ceremonial', 'accessories']
    }
  ]

  for (const productData of products) {
    // Find the category by slug to get the categoryId
    const category = await prisma.category.findUnique({
      where: { slug: productData.categorySlug }
    });

    if (category) {
      // Create product with proper categoryId link
      await prisma.product.create({
        data: {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          originalPrice: productData.originalPrice,
          imageUrl: productData.imageUrl,
          sizes: productData.sizes,
          colors: productData.colors,
          stock: productData.stock,
          category: productData.category,
          categoryId: category.id, // Link to category
          isOnSale: productData.isOnSale,
          isNewArrival: productData.isNewArrival,
          isFeatured: productData.isFeatured,
          tags: productData.tags
        }
      });
    } else {
      console.log(`Category not found for slug: ${productData.categorySlug}`);
    }
  }

  // Create sample collections first
  const collections = [
    {
      name: 'Wedding Collection',
      description: 'Exclusive wedding dresses and accessories',
      discountPercent: 30,
      imageUrl: null, // Admin can upload image, otherwise use fallback
      isActive: true
    },
    {
      name: 'Festival Special',
      description: 'Special festival dresses and traditional wear',
      discountPercent: 25,
      imageUrl: null, // Admin can upload image, otherwise use fallback
      isActive: true
    },
    {
      name: 'Engagement Collection',
      description: 'Perfect engagement dresses and accessories',
      discountPercent: 20,
      imageUrl: null, // Admin can upload image, otherwise use fallback
      isActive: true
    }
  ]

  const createdCollections = []
  for (const collectionData of collections) {
    const collection = await prisma.collection.create({
      data: collectionData
    })
    createdCollections.push(collection)
  }

  console.log('✅ Collections created');

  // Create sample sales
  const sales = [
    {
      name: 'Wedding Collection',
      description: 'Exclusive wedding collection with stunning designs',
      discountPercent: 30,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-07-20'),
      isActive: true,
      collectionId: createdCollections[0].id, // Wedding Collection
      tag: 'wedding'
    },
    {
      name: 'Festival Special',
      description: 'Special discounts for festival season',
      discountPercent: 25,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-07-20'),
      isActive: true,
      collectionId: createdCollections[1].id, // Festival Special
      tag: 'festival'
    },
    {
      name: 'Engagement Collection',
      description: 'Perfect engagement dresses for your special day',
      discountPercent: 20,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-07-20'),
      isActive: true,
      collectionId: createdCollections[2].id, // Engagement Collection
      tag: 'engagement'
    }
  ]

  // Map sale tags to product tags
  const saleTagToProductTag = {
    wedding: 'wedding',
    festival: 'festival',
    engagement: 'engagement'
  }

  for (const saleData of sales) {
    // Create the sale
    const { tag, ...saleFields } = saleData
    const sale = await prisma.sale.create({ data: saleFields })
    // Find products matching the tag
    const products = await prisma.product.findMany({
      where: {
        tags: { has: saleTagToProductTag[tag] }
      }
    })
    // Create saleItems for each product
    for (const product of products) {
      await prisma.saleItem.create({
        data: {
          saleId: sale.id,
          productId: product.id
        }
      })
      // Mark product as on sale
      await prisma.product.update({
        where: { id: product.id },
        data: { isOnSale: true }
      })
    }
  }

  // Create sample offers
  const offers = [
    {
      title: 'Free Shipping on Orders Over $100',
      description: 'Enjoy free shipping on all orders above $100',
      imageUrl: '/images/offers/free-shipping.jpg',
      link: '/products',
      isActive: true
    },
    {
      title: 'New Customer Discount',
      description: 'Get 10% off on your first order',
      imageUrl: '/images/offers/new-customer.jpg',
      link: '/register',
      isActive: true
    }
  ]

  for (const offerData of offers) {
    await prisma.offer.create({
      data: offerData
    })
  }

  // Create sample promo codes
  const promoCodes = [
    {
      code: 'FESTIVAL25',
      description: '25% off for festival season',
      discountType: 'PERCENTAGE',
      discountValue: 25,
      minOrderAmount: 75,
      maxUses: 200,
      usedCount: 0,
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-31'),
      isActive: true
    },
    {
      code: 'FREESHIP',
      description: 'Free shipping on any order',
      discountType: 'FREE_SHIPPING',
      discountValue: 0,
      minOrderAmount: 50,
      maxUses: 100,
      usedCount: 0,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      isActive: true
    }
  ]

  for (const promoCodeData of promoCodes) {
    await prisma.promoCode.upsert({
      where: { code: promoCodeData.code },
      update: {},
      create: promoCodeData
    })
  }

  // Create sample reviews
  const reviews = [
    {
      productId: (await prisma.product.findFirst({ where: { name: 'Traditional Gunyu Cholo Set' } })).id,
      userId: customer.id,
      rating: 5,
      comment: 'Beautiful traditional dress, perfect fit and excellent quality!'
    },
    {
      productId: (await prisma.product.findFirst({ where: { name: 'Daura Suruwal Set' } })).id,
      userId: customer.id,
      rating: 4,
      comment: 'Great traditional wear, very comfortable and well-made.'
    },
    {
      productId: (await prisma.product.findFirst({ where: { name: 'Kids Kurta Pajama Set' } })).id,
      userId: customer.id,
      rating: 5,
      comment: 'Perfect for my child, adorable design and good quality fabric.'
    }
  ]

  for (const reviewData of reviews) {
    await prisma.review.create({
      data: reviewData
    })
  }

  // Create default hero background
  await prisma.heroBackground.create({
    data: {
      imageUrl: null,
      isDefault: true,
      overlayOpacity: 0.2,
      isActive: true
    }
  });

  // Seed demo offers for admin/offers page
  const demoOffers = [
    {
      title: '5% Off on All Orders',
      description: 'Get 5% off on every order, no minimum required!',
      imageUrl: '',
      link: '/homepage',
      isActive: true,
      minimumOrderAmount: 0,
      discountValue: 5,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: '10% Off Shop Page',
      description: 'Shop now and save 10% on all products!',
      imageUrl: '',
      link: '/shop',
      isActive: true,
      minimumOrderAmount: 50,
      discountValue: 10,
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Sale Special',
      description: 'Special offer for sale page visitors.',
      imageUrl: '',
      link: '/sale',
      isActive: true,
      minimumOrderAmount: 100,
      discountValue: 15,
      startDate: new Date(),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Collections Discount',
      description: 'Exclusive discount for collections.',
      imageUrl: '',
      link: '/collections',
      isActive: true,
      minimumOrderAmount: 30,
      discountValue: 7,
      startDate: new Date(),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Cart Page Bonus',
      description: 'Get a bonus discount on the cart page.',
      imageUrl: '',
      link: '/cart',
      isActive: true,
      minimumOrderAmount: 20,
      discountValue: 3,
      startDate: new Date(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Checkout Surprise',
      description: 'Surprise discount at checkout!',
      imageUrl: '',
      link: '/checkout',
      isActive: true,
      minimumOrderAmount: 10,
      discountValue: 2,
      startDate: new Date(),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Special Custom Offer',
      description: 'Custom offer for special events.',
      imageUrl: '',
      link: '/special-offer',
      isActive: true,
      minimumOrderAmount: 0,
      discountValue: 20,
      startDate: new Date(),
      endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
  ];
  for (const offer of demoOffers) {
    await prisma.offer.create({ data: offer });
  }
  console.log('🎁 Seeded demo offers');

  console.log('✅ Database seeded successfully!')
  console.log('👤 Admin user: admin@aamakosari.com / admin123')
  console.log('👤 Customer user: customer@example.com / customer123')
  console.log('👤 Promoter user: promoter@example.com / promoter123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 