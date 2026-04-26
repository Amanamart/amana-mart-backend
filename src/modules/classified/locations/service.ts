import { prisma } from '../../../common/lib/prisma';

const BANGLADESH_LOCATIONS = [
  {
    name: 'Dhaka Division', slug: 'dhaka-division', type: 'division',
    children: [
      { name: 'Dhaka', slug: 'dhaka', type: 'district', children: [
        { name: 'Gulshan', slug: 'gulshan', type: 'area' },
        { name: 'Banani', slug: 'banani', type: 'area' },
        { name: 'Dhanmondi', slug: 'dhanmondi', type: 'area' },
        { name: 'Mirpur', slug: 'mirpur', type: 'area' },
        { name: 'Uttara', slug: 'uttara', type: 'area' },
        { name: 'Motijheel', slug: 'motijheel', type: 'area' },
        { name: 'Old Dhaka', slug: 'old-dhaka', type: 'area' },
        { name: 'Mohammadpur', slug: 'mohammadpur', type: 'area' },
        { name: 'Rampura', slug: 'rampura', type: 'area' },
        { name: 'Badda', slug: 'badda', type: 'area' },
      ]},
      { name: 'Gazipur', slug: 'gazipur', type: 'district' },
      { name: 'Narayanganj', slug: 'narayanganj', type: 'district' },
      { name: 'Manikganj', slug: 'manikganj', type: 'district' },
      { name: 'Munshiganj', slug: 'munshiganj', type: 'district' },
      { name: 'Narsingdi', slug: 'narsingdi', type: 'district' },
    ]
  },
  {
    name: 'Chattogram Division', slug: 'chattogram-division', type: 'division',
    children: [
      { name: 'Chattogram', slug: 'chattogram', type: 'district', children: [
        { name: 'Agrabad', slug: 'agrabad', type: 'area' },
        { name: 'Nasirabad', slug: 'nasirabad', type: 'area' },
        { name: 'Halishahar', slug: 'halishahar', type: 'area' },
        { name: 'GEC Circle', slug: 'gec-circle', type: 'area' },
      ]},
      { name: 'Cox\'s Bazar', slug: 'coxs-bazar', type: 'district' },
      { name: 'Comilla', slug: 'comilla', type: 'district' },
      { name: 'Feni', slug: 'feni', type: 'district' },
      { name: 'Noakhali', slug: 'noakhali', type: 'district' },
    ]
  },
  {
    name: 'Sylhet Division', slug: 'sylhet-division', type: 'division',
    children: [
      { name: 'Sylhet', slug: 'sylhet', type: 'district', children: [
        { name: 'Zindabazar', slug: 'zindabazar', type: 'area' },
        { name: 'Ambarkhana', slug: 'ambarkhana', type: 'area' },
      ]},
      { name: 'Moulvibazar', slug: 'moulvibazar', type: 'district' },
      { name: 'Habiganj', slug: 'habiganj', type: 'district' },
      { name: 'Sunamganj', slug: 'sunamganj', type: 'district' },
    ]
  },
  {
    name: 'Rajshahi Division', slug: 'rajshahi-division', type: 'division',
    children: [
      { name: 'Rajshahi', slug: 'rajshahi', type: 'district' },
      { name: 'Bogura', slug: 'bogura', type: 'district' },
      { name: 'Chapainawabganj', slug: 'chapainawabganj', type: 'district' },
      { name: 'Naogaon', slug: 'naogaon', type: 'district' },
    ]
  },
  {
    name: 'Khulna Division', slug: 'khulna-division', type: 'division',
    children: [
      { name: 'Khulna', slug: 'khulna', type: 'district' },
      { name: 'Jessore', slug: 'jessore', type: 'district' },
      { name: 'Satkhira', slug: 'satkhira', type: 'district' },
    ]
  },
  {
    name: 'Barishal Division', slug: 'barishal-division', type: 'division',
    children: [
      { name: 'Barishal', slug: 'barishal', type: 'district' },
      { name: 'Patuakhali', slug: 'patuakhali', type: 'district' },
    ]
  },
  {
    name: 'Rangpur Division', slug: 'rangpur-division', type: 'division',
    children: [
      { name: 'Rangpur', slug: 'rangpur', type: 'district' },
      { name: 'Dinajpur', slug: 'dinajpur', type: 'district' },
      { name: 'Kurigram', slug: 'kurigram', type: 'district' },
    ]
  },
  {
    name: 'Mymensingh Division', slug: 'mymensingh-division', type: 'division',
    children: [
      { name: 'Mymensingh', slug: 'mymensingh', type: 'district' },
      { name: 'Jamalpur', slug: 'jamalpur', type: 'district' },
      { name: 'Netrokona', slug: 'netrokona', type: 'district' },
    ]
  },
];

export class ClassifiedLocationsService {
  async getLocations() {
    return prisma.classifiedLocation.findMany({
      where: { type: 'division', status: 'active' },
      orderBy: { name: 'asc' },
      include: {
        children: {
          where: { status: 'active' },
          orderBy: { name: 'asc' },
          include: {
            children: {
              where: { status: 'active' },
              orderBy: { name: 'asc' },
            }
          }
        }
      }
    });
  }

  async getLocationBySlug(slug: string) {
    return prisma.classifiedLocation.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: { where: { status: 'active' }, orderBy: { name: 'asc' } },
      }
    });
  }

  async adminGetLocations() {
    return prisma.classifiedLocation.findMany({
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
  }

  async createLocation(data: any) {
    return prisma.classifiedLocation.create({ data });
  }

  async updateLocation(id: string, data: any) {
    return prisma.classifiedLocation.update({ where: { id }, data });
  }

  async seedLocations() {
    let created = 0;

    async function createRecursive(loc: any, parentId?: string) {
      const existing = await prisma.classifiedLocation.findUnique({ where: { slug: loc.slug } });
      let id: string;
      if (!existing) {
        const created_loc = await prisma.classifiedLocation.create({
          data: {
            name: loc.name,
            slug: loc.slug,
            type: loc.type,
            parentId: parentId || null,
          }
        });
        id = created_loc.id;
        created++;
      } else {
        id = existing.id;
      }

      if (loc.children) {
        for (const child of loc.children) {
          await createRecursive(child, id);
        }
      }
    }

    for (const loc of BANGLADESH_LOCATIONS) {
      await createRecursive(loc);
    }

    return { created, message: `Seeded ${created} locations` };
  }
}

export default new ClassifiedLocationsService();
