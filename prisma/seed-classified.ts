import { prisma } from '../src/common/lib/prisma';
import classifiedCategoriesService from '../src/modules/classified/categories/service';
import classifiedLocationsService from '../src/modules/classified/locations/service';
import membershipService from '../src/modules/classified/membership/service';
import promotionsService from '../src/modules/classified/promotions/service';
import settingsService from '../src/modules/classified/settings/service';

async function main() {
  console.log('🚀 Starting AmanaMart Classified Seeding...');

  try {
    // 1. Categories
    console.log('Seeding categories...');
    const catResult = await classifiedCategoriesService.seedCategories();
    console.log(`✅ Categories seeded: ${catResult.count}`);

    // 2. Locations
    console.log('Seeding Bangladesh locations...');
    const locResult = await classifiedLocationsService.seedLocations();
    console.log(`✅ Locations seeded: ${locResult.divisions} divisions, ${locResult.districts} districts, ${locResult.areas} areas`);

    // 3. Membership Plans
    console.log('Seeding membership plans...');
    const planResult = await membershipService.seedDefaultPlans();
    console.log(`✅ Membership plans seeded: ${planResult.created}`);

    // 4. Promotion Packages
    console.log('Seeding promotion packages...');
    const pkgResult = await promotionsService.seedDefaultPackages();
    console.log(`✅ Promotion packages seeded: ${pkgResult.created}`);

    // 5. Settings
    console.log('Seeding default settings...');
    const setResult = await settingsService.seedDefaults();
    console.log(`✅ Default settings seeded: ${setResult.created}`);

    console.log('\n✨ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
