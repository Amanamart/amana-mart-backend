import { prisma } from '../../../common/lib/prisma';

export class ClassifiedReportsService {
  async getReports(filters: any) {
    const { page = '1', limit = '20', status } = filters;
    const pageNum = parseInt(page), limitNum = parseInt(limit);
    const where: any = {};
    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      prisma.classifiedAdReport.findMany({
        where, skip: (pageNum - 1) * limitNum, take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          ad: { select: { id: true, title: true, slug: true, status: true } },
          reporter: { select: { name: true, email: true } },
        }
      }),
      prisma.classifiedAdReport.count({ where }),
    ]);
    return { reports, total };
  }

  async updateReport(id: string, data: { status: string; adminNote?: string }) {
    return prisma.classifiedAdReport.update({ where: { id }, data });
  }
}

export default new ClassifiedReportsService();
