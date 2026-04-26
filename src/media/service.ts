import { prisma } from '../common/lib/prisma';

export const listFiles = async (filters: {
  mimeType?: string;
  sourceModule?: string;
  folder?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const { mimeType, sourceModule, folder, search, page = 1, limit = 50 } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (mimeType) where.mimeType = { contains: mimeType };
  if (sourceModule) where.sourceModule = sourceModule;
  if (folder) where.folder = folder;
  if (search) where.fileName = { contains: search, mode: 'insensitive' };

  const [files, total] = await Promise.all([
    prisma.mediaFile.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: { select: { name: true, role: true } },
      },
    }),
    prisma.mediaFile.count({ where }),
  ]);

  return { files, total, page, limit };
};

export const createFileRecord = async (data: {
  bucket: string;
  path: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedByRole: string;
  sourceModule?: string;
  linkedEntityType?: string;
  linkedEntityId?: string;
  visibility?: string;
  folder?: string;
}) => {
  return prisma.mediaFile.create({ data });
};

export const getFileById = async (id: string) => {
  return prisma.mediaFile.findUnique({ where: { id } });
};

export const deleteFile = async (id: string) => {
  return prisma.mediaFile.delete({ where: { id } });
};

export const getMediaStats = async () => {
  const [totalFiles, totalSize, byType] = await Promise.all([
    prisma.mediaFile.count(),
    prisma.mediaFile.aggregate({ _sum: { size: true } }),
    prisma.mediaFile.groupBy({
      by: ['mimeType'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
  ]);

  return {
    totalFiles,
    totalSize: totalSize._sum.size || 0,
    byType,
  };
};


