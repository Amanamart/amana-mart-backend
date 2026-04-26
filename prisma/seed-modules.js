const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const modules = [
    { name: 'Shop', slug: 'shop', type: 'shop', icon: '🛍️', themeColor: '#3b82f6', status: 'active', sortOrder: 0, description: 'General shopping' },
    { name: 'Grocery', slug: 'store/category/grocery', type: 'grocery', icon: '🛒', themeColor: '#1aab50', status: 'active', sortOrder: 1, description: 'Fresh groceries' },
    { name: 'Pharmacy', slug: 'store/category/pharmacy', type: 'pharmacy', icon: '💊', themeColor: '#ef4444', status: 'active', sortOrder: 2, description: 'Medicines' },
    { name: 'Food', slug: 'store/category/food', type: 'food', icon: '🍕', themeColor: '#f59e0b', status: 'active', sortOrder: 3, description: 'Restaurant food' },
    { name: 'Courier', slug: 'parcel', type: 'parcel', icon: '📦', themeColor: '#f97316', status: 'active', sortOrder: 4, description: 'Parcel delivery' },
    { name: 'Ride + Rental', slug: 'ride', type: 'ride', icon: '🚗', themeColor: '#005555', status: 'active', sortOrder: 5, description: 'Ride sharing' },
    { name: 'Service', slug: 'service', type: 'service', icon: '🛠️', themeColor: '#8b5cf6', status: 'active', sortOrder: 6, description: 'Home services' },
    { name: 'Classified', slug: 'classified', type: 'classified', icon: '📢', themeColor: '#0891b2', status: 'active', sortOrder: 7, description: 'Buy & Sell' },
  ];

  for (const mod of modules) {
    await prisma.module.upsert({
      where: { type: mod.type },
      update: mod,
      create: mod,
    });
  }

  console.log('Modules seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
