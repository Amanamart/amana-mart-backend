const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Classified Marketplace data...');

  // 1. Locations
  const divisions = [
    { name: 'Dhaka', slug: 'dhaka', type: 'division' },
    { name: 'Chattogram', slug: 'chattogram', type: 'division' },
    { name: 'Sylhet', slug: 'sylhet', type: 'division' },
    { name: 'Rajshahi', slug: 'rajshahi', type: 'division' },
    { name: 'Khulna', slug: 'khulna', type: 'division' },
    { name: 'Barishal', slug: 'barishal', type: 'division' },
    { name: 'Rangpur', slug: 'rangpur', type: 'division' },
    { name: 'Mymensingh', slug: 'mymensingh', type: 'division' },
  ];

  for (const div of divisions) {
    await prisma.classifiedLocation.upsert({
      where: { slug: div.slug },
      update: {},
      create: div,
    });
  }

  // 2. Categories
  const categories = [
    { name: 'Mobiles', slug: 'mobiles', icon: '📱' },
    { name: 'Electronics', slug: 'electronics', icon: '💻' },
    { name: 'Vehicles', slug: 'vehicles', icon: '🚗' },
    { name: 'Property', slug: 'property', icon: '🏠' },
    { name: 'Jobs', slug: 'jobs', icon: '💼' },
    { name: 'Home & Living', slug: 'home-living', icon: '🛋️' },
    { name: 'Fashion', slug: 'fashion-beauty', icon: '👗' },
    { name: 'Pets', slug: 'pets', icon: '🐾' },
    { name: 'Services', slug: 'services', icon: '🔧' },
  ];

  for (const cat of categories) {
    await prisma.classifiedCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // 3. Membership Plans
  const plans = [
    { name: 'Free', slug: 'free', price: 0, adLimit: 5, imageLimit: 4, hasShopPage: false, isActive: true },
    { name: 'Member', slug: 'member', price: 499, adLimit: 20, imageLimit: 10, hasShopPage: true, isActive: true },
    { name: 'Verified Business', slug: 'verified-business', price: 1499, adLimit: 100, imageLimit: 20, hasShopPage: true, hasVerifiedBadge: true, isActive: true },
  ];

  for (const plan of plans) {
    await prisma.classifiedMembershipPlan.upsert({
      where: { slug: plan.slug },
      update: {},
      create: plan,
    });
  }

  // 4. Promotion Packages
  const packages = [
    { name: 'Top Ad', slug: 'top-ad', type: 'top_ad', price: 299, durationDays: 7 },
    { name: 'Urgent', slug: 'urgent', type: 'urgent', price: 199, durationDays: 3 },
    { name: 'Featured', slug: 'featured', type: 'featured', price: 599, durationDays: 15 },
    { name: 'Homepage Featured', slug: 'homepage-featured', type: 'homepage_featured', price: 999, durationDays: 7 },
  ];

  for (const pkg of packages) {
    await prisma.classifiedPromotionPackage.upsert({
      where: { slug: pkg.slug },
      update: {},
      create: pkg,
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
