import prisma from '../../services/db.service';

export const listMedicines = async (query: { search?: string; limit?: number; page?: number }) => {
  const { search, limit = 50, page = 1 } = query;
  const skip = (page - 1) * limit;

  const where = search ? {
    name: {
      contains: search,
      mode: 'insensitive' as const,
    },
  } : {};

  const [total, medicines] = await Promise.all([
    (prisma as any).medicine.count({ where }),
    (prisma as any).medicine.findMany({
      where,
      take: limit,
      skip,
      orderBy: { name: 'asc' },
    }),
  ]);

  return {
    total,
    medicines,
    pages: Math.ceil(total / limit),
  };
};

export const createMedicine = async (data: { name: string }) => {
  return (prisma as any).medicine.upsert({
    where: { name: data.name },
    update: {}, // No updates if already exists
    create: {
      name: data.name,
    },
  });
};

export const deleteMedicine = async (id: string) => {
  return (prisma as any).medicine.delete({
    where: { id },
  });
};
