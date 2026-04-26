import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
} as any);

async function main() {
  console.log('🌱 Seeding Amana Mart database...');

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@amanamart.com' },
    update: {},
    create: {
      email: 'admin@amanamart.com',
      password: adminPassword,
      name: 'Super Admin',
      role: 'ADMIN',
      status: 'active',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // 2. Create Default Business Modules
  const modules = [
    { name: 'Grocery', type: 'grocery', icon: 'shopping-basket' },
    { name: 'Food', type: 'food', icon: 'utensils' },
    { name: 'Pharmacy', type: 'pharmacy', icon: 'pill' },
    { name: 'Ecommerce', type: 'ecommerce', icon: 'shopping-bag' },
  ];

  for (const mod of modules) {
    await prisma.module.upsert({
      where: { type: mod.type },
      update: {},
      create: {
        name: mod.name,
        type: mod.type,
        slug: mod.type,
        status: 'active',
      },
    });
  }
  console.log('✅ Business modules created');

  // 3. Create Default Zone
  const zone = await prisma.zone.upsert({
    where: { id: 'zone-dhaka-central' },
    update: {},
    create: {
      id: 'zone-dhaka-central',
      name: 'Dhaka Central',
      status: 'active',
      area: JSON.stringify([
        { lat: 23.8103, lng: 90.4125 },
        { lat: 23.7949, lng: 90.4043 },
        { lat: 23.7745, lng: 90.4219 },
      ]),
    },
  });
  console.log('✅ Default zone created:', zone.name);

  // 4. Create Top Categories
  const categories = [
    { name: 'Fresh Vegetables', type: 'grocery', slug: 'fresh-vegetables' },
    { name: 'Rice & Grains', type: 'grocery', slug: 'rice-and-grains' },
    { name: 'Burgers', type: 'food', slug: 'burgers' },
    { name: 'OTC Medicines', type: 'pharmacy', slug: 'otc-medicines' },
  ];

  for (const cat of categories) {
    const mod = await prisma.module.findFirst({ where: { type: cat.type } });
    if (mod) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: {
          name: cat.name,
          slug: cat.slug,
          status: 'active',
          moduleId: mod.id,
          order: 0,
        },
      });
    }
  }
  console.log('✅ Top categories created');

  console.log('✨ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
