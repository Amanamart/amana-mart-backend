import { prisma } from '../../../common/lib/prisma';

export class ClassifiedCategoriesService {
  // ────────────────────────────────────────────────
  // Get all top-level categories with subcategories
  // ────────────────────────────────────────────────
  async getCategories() {
    return prisma.classifiedCategory.findMany({
      where: { parentId: null, status: 'active' },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          where: { status: 'active' },
          orderBy: { sortOrder: 'asc' },
          include: {
            children: {
              where: { status: 'active' },
              orderBy: { sortOrder: 'asc' },
            }
          }
        }
      }
    });
  }

  // ────────────────────────────────────────────────
  // Get category by slug with its fields
  // ────────────────────────────────────────────────
  async getCategoryBySlug(slug: string) {
    return prisma.classifiedCategory.findUnique({
      where: { slug },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          where: { status: 'active' },
          orderBy: { sortOrder: 'asc' },
        },
        fields: { orderBy: { sortOrder: 'asc' } },
      }
    });
  }

  // ────────────────────────────────────────────────
  // ADMIN: Create category
  // ────────────────────────────────────────────────
  async createCategory(data: {
    name: string;
    slug: string;
    icon?: string;
    description?: string;
    parentId?: string;
    sortOrder?: number;
    seoTitle?: string;
    seoDescription?: string;
    freePostLimit?: number;
  }) {
    return prisma.classifiedCategory.create({ data });
  }

  // ────────────────────────────────────────────────
  // ADMIN: Update category
  // ────────────────────────────────────────────────
  async updateCategory(id: string, data: any) {
    return prisma.classifiedCategory.update({ where: { id }, data });
  }

  // ────────────────────────────────────────────────
  // ADMIN: Delete category
  // ────────────────────────────────────────────────
  async deleteCategory(id: string) {
    const adCount = await prisma.classifiedAd.count({ where: { classifiedCategoryId: id } });
    if (adCount > 0) throw new Error(`Cannot delete category with ${adCount} active ads`);
    return prisma.classifiedCategory.delete({ where: { id } });
  }

  // ────────────────────────────────────────────────
  // ADMIN: Manage category fields
  // ────────────────────────────────────────────────
  async getFields(categoryId: string) {
    return prisma.classifiedCategoryField.findMany({
      where: { categoryId },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async createField(data: {
    categoryId: string;
    name: string;
    label: string;
    fieldType: string;
    options?: string[];
    isRequired?: boolean;
    isSearchable?: boolean;
    isFilterable?: boolean;
    showInCard?: boolean;
    sortOrder?: number;
  }) {
    return prisma.classifiedCategoryField.create({ data });
  }

  async updateField(id: string, data: any) {
    return prisma.classifiedCategoryField.update({ where: { id }, data });
  }

  async deleteField(id: string) {
    return prisma.classifiedCategoryField.delete({ where: { id } });
  }

  // ────────────────────────────────────────────────
  // ADMIN: Seed default categories
  // ────────────────────────────────────────────────
  async seedCategories() {
    const categories = getDefaultCategories();
    let created = 0;

    for (const cat of categories) {
      const existing = await prisma.classifiedCategory.findUnique({ where: { slug: cat.slug } });
      if (!existing) {
        const created_cat = await prisma.classifiedCategory.create({
          data: {
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            sortOrder: cat.sortOrder || 0,
          }
        });
        created++;

        if (cat.children) {
          for (const child of cat.children) {
            const childExisting = await prisma.classifiedCategory.findUnique({ where: { slug: child.slug } });
            if (!childExisting) {
              await prisma.classifiedCategory.create({
                data: {
                  name: child.name,
                  slug: child.slug,
                  icon: child.icon,
                  parentId: created_cat.id,
                  sortOrder: child.sortOrder || 0,
                }
              });
              created++;
            }
          }
        }
      }
    }

    return { created, message: `Seeded ${created} categories` };
  }
}

function getDefaultCategories() {
  return [
    {
      name: 'Mobiles', slug: 'mobiles', icon: '📱', sortOrder: 1,
      children: [
        { name: 'Mobile Phones', slug: 'mobile-phones', icon: '📱', sortOrder: 1 },
        { name: 'Mobile Accessories', slug: 'mobile-accessories', icon: '🔌', sortOrder: 2 },
        { name: 'SIM Cards', slug: 'sim-cards', icon: '📶', sortOrder: 3 },
        { name: 'Smart Watches', slug: 'smart-watches', icon: '⌚', sortOrder: 4 },
        { name: 'Tablets', slug: 'tablets', icon: '📟', sortOrder: 5 },
      ]
    },
    {
      name: 'Electronics', slug: 'electronics', icon: '💻', sortOrder: 2,
      children: [
        { name: 'Laptops & Computers', slug: 'laptops', icon: '💻', sortOrder: 1 },
        { name: 'Desktop Computers', slug: 'desktops', icon: '🖥️', sortOrder: 2 },
        { name: 'Cameras & Photography', slug: 'cameras', icon: '📷', sortOrder: 3 },
        { name: 'TVs & Monitors', slug: 'tvs', icon: '📺', sortOrder: 4 },
        { name: 'Audio & Speakers', slug: 'audio', icon: '🔊', sortOrder: 5 },
        { name: 'Gaming Consoles', slug: 'gaming', icon: '🎮', sortOrder: 6 },
        { name: 'Computer Accessories', slug: 'computer-accessories', icon: '🖱️', sortOrder: 7 },
      ]
    },
    {
      name: 'Vehicles', slug: 'vehicles', icon: '🚗', sortOrder: 3,
      children: [
        { name: 'Cars', slug: 'cars', icon: '🚗', sortOrder: 1 },
        { name: 'Motorbikes', slug: 'motorbikes', icon: '🏍️', sortOrder: 2 },
        { name: 'Bicycles', slug: 'bicycles', icon: '🚲', sortOrder: 3 },
        { name: 'Trucks & Commercial', slug: 'trucks', icon: '🚚', sortOrder: 4 },
        { name: 'Auto Parts', slug: 'auto-parts', icon: '⚙️', sortOrder: 5 },
        { name: 'Vehicle Rentals', slug: 'vehicle-rentals', icon: '🔑', sortOrder: 6 },
      ]
    },
    {
      name: 'Property', slug: 'property', icon: '🏠', sortOrder: 4,
      children: [
        { name: 'Apartments for Sale', slug: 'apartments-sale', icon: '🏢', sortOrder: 1 },
        { name: 'Apartments for Rent', slug: 'apartments-rent', icon: '🏠', sortOrder: 2 },
        { name: 'Land for Sale', slug: 'land-sale', icon: '🌍', sortOrder: 3 },
        { name: 'Commercial Property', slug: 'commercial-property', icon: '🏪', sortOrder: 4 },
        { name: 'Roommates', slug: 'roommates', icon: '🤝', sortOrder: 5 },
        { name: 'Short Term Rentals', slug: 'short-term-rentals', icon: '📅', sortOrder: 6 },
      ]
    },
    {
      name: 'Jobs', slug: 'jobs', icon: '💼', sortOrder: 5,
      children: [
        { name: 'Accounting & Finance', slug: 'accounting', icon: '💰', sortOrder: 1 },
        { name: 'IT & Software', slug: 'it-software', icon: '💻', sortOrder: 2 },
        { name: 'Sales & Marketing', slug: 'sales', icon: '📊', sortOrder: 3 },
        { name: 'Customer Service', slug: 'customer-service', icon: '🎧', sortOrder: 4 },
        { name: 'Delivery & Logistics', slug: 'delivery-jobs', icon: '🚚', sortOrder: 5 },
        { name: 'Healthcare', slug: 'healthcare-jobs', icon: '🏥', sortOrder: 6 },
        { name: 'Part-Time', slug: 'part-time', icon: '⏰', sortOrder: 7 },
        { name: 'Remote Jobs', slug: 'remote-jobs', icon: '🏡', sortOrder: 8 },
        { name: 'Government', slug: 'government-jobs', icon: '🏛️', sortOrder: 9 },
      ]
    },
    {
      name: 'Home & Living', slug: 'home-living', icon: '🛋️', sortOrder: 6,
      children: [
        { name: 'Furniture', slug: 'furniture', icon: '🛋️', sortOrder: 1 },
        { name: 'Kitchen Appliances', slug: 'kitchen', icon: '🍳', sortOrder: 2 },
        { name: 'Home Decor', slug: 'home-decor', icon: '🪴', sortOrder: 3 },
        { name: 'Garden & Tools', slug: 'garden', icon: '🌱', sortOrder: 4 },
        { name: 'Home Improvement', slug: 'home-improvement', icon: '🔨', sortOrder: 5 },
      ]
    },
    {
      name: 'Fashion & Beauty', slug: 'fashion-beauty', icon: '👗', sortOrder: 7,
      children: [
        { name: "Men's Clothing", slug: 'mens-clothing', icon: '👔', sortOrder: 1 },
        { name: "Women's Clothing", slug: 'womens-clothing', icon: '👗', sortOrder: 2 },
        { name: 'Shoes & Footwear', slug: 'shoes', icon: '👟', sortOrder: 3 },
        { name: 'Watches & Jewelry', slug: 'watches', icon: '⌚', sortOrder: 4 },
        { name: 'Bags & Accessories', slug: 'bags', icon: '👜', sortOrder: 5 },
        { name: 'Beauty Products', slug: 'beauty', icon: '💄', sortOrder: 6 },
      ]
    },
    {
      name: 'Pets & Animals', slug: 'pets', icon: '🐾', sortOrder: 8,
      children: [
        { name: 'Cats', slug: 'cats', icon: '🐱', sortOrder: 1 },
        { name: 'Dogs', slug: 'dogs', icon: '🐶', sortOrder: 2 },
        { name: 'Birds', slug: 'birds', icon: '🐦', sortOrder: 3 },
        { name: 'Fish & Aquarium', slug: 'fish', icon: '🐟', sortOrder: 4 },
        { name: 'Pet Food & Supplies', slug: 'pet-food', icon: '🦴', sortOrder: 5 },
        { name: 'Livestock', slug: 'livestock', icon: '🐄', sortOrder: 6 },
      ]
    },
    {
      name: 'Services', slug: 'services', icon: '🔧', sortOrder: 9,
      children: [
        { name: 'Home Repair & Renovation', slug: 'home-repair', icon: '🔧', sortOrder: 1 },
        { name: 'Cleaning Services', slug: 'cleaning', icon: '🧹', sortOrder: 2 },
        { name: 'Tuition & Education', slug: 'tuition', icon: '📚', sortOrder: 3 },
        { name: 'Photography & Video', slug: 'photography', icon: '📷', sortOrder: 4 },
        { name: 'Event & Wedding', slug: 'events', icon: '🎉', sortOrder: 5 },
        { name: 'Computer & IT Repair', slug: 'computer-repair', icon: '💻', sortOrder: 6 },
      ]
    },
    {
      name: 'Agriculture', slug: 'agriculture', icon: '🌾', sortOrder: 10,
      children: [
        { name: 'Farm Machinery', slug: 'farm-machinery', icon: '🚜', sortOrder: 1 },
        { name: 'Seeds & Plants', slug: 'seeds', icon: '🌱', sortOrder: 2 },
        { name: 'Fertilizer & Pesticide', slug: 'fertilizer', icon: '🧪', sortOrder: 3 },
        { name: 'Cattle & Poultry', slug: 'cattle', icon: '🐄', sortOrder: 4 },
        { name: 'Fish Farming', slug: 'fish-farming', icon: '🐟', sortOrder: 5 },
      ]
    },
    {
      name: 'Business & Industry', slug: 'business', icon: '🏭', sortOrder: 11,
      children: [
        { name: 'Office Equipment', slug: 'office', icon: '🖨️', sortOrder: 1 },
        { name: 'Industrial Machinery', slug: 'machinery', icon: '⚙️', sortOrder: 2 },
        { name: 'Wholesale & Trade', slug: 'wholesale', icon: '📦', sortOrder: 3 },
        { name: 'Raw Materials', slug: 'raw-materials', icon: '🧱', sortOrder: 4 },
      ]
    },
    {
      name: 'Education', slug: 'education', icon: '📚', sortOrder: 12,
      children: [
        { name: 'Books & Magazines', slug: 'books', icon: '📚', sortOrder: 1 },
        { name: 'Online Courses', slug: 'courses', icon: '🎓', sortOrder: 2 },
        { name: 'Private Tutors', slug: 'tutors', icon: '👨‍🏫', sortOrder: 3 },
        { name: 'Training & Certification', slug: 'training', icon: '🏆', sortOrder: 4 },
      ]
    },
    {
      name: 'Sports & Hobbies', slug: 'sports', icon: '⚽', sortOrder: 13,
      children: [
        { name: 'Gym & Fitness', slug: 'gym', icon: '💪', sortOrder: 1 },
        { name: 'Musical Instruments', slug: 'music', icon: '🎸', sortOrder: 2 },
        { name: 'Sports Equipment', slug: 'sports-equipment', icon: '⚽', sortOrder: 3 },
        { name: 'Collectibles & Antiques', slug: 'collectibles', icon: '🏺', sortOrder: 4 },
      ]
    },
    {
      name: 'Others', slug: 'others', icon: '📦', sortOrder: 14,
      children: [
        { name: 'Baby & Kids', slug: 'baby-kids', icon: '👶', sortOrder: 1 },
        { name: 'Gifts & Crafts', slug: 'gifts', icon: '🎁', sortOrder: 2 },
        { name: 'Miscellaneous', slug: 'misc', icon: '📦', sortOrder: 3 },
      ]
    },
  ];
}

export default new ClassifiedCategoriesService();
