import { Year, YearAttributes, YearCreationAttributes, Client, Document } from '../models';
import { Op } from 'sequelize';

export const yearRepository = {
  async findById(id: string): Promise<Year | null> {
    return Year.findByPk(id, {
      include: [
        { model: Client, as: 'client' },
        { model: Document, as: 'documents' },
      ],
    });
  },

  async findByClientId(clientId: string): Promise<Year[]> {
    return Year.findAll({
      where: { clientId },
      include: [{ model: Document, as: 'documents' }],
      order: [['year', 'desc']],
    });
  },

  async findByClientAndYear(clientId: string, year: string): Promise<Year | null> {
    return Year.findOne({
      where: { clientId, year },
      include: [{ model: Document, as: 'documents' }],
    });
  },

  async create(data: YearCreationAttributes): Promise<Year> {
    return Year.create(data);
  },

  async createMany(clientId: string, years: string[]): Promise<Year[]> {
    const createData = years.map((year) => ({ clientId, year }));
    return Year.bulkCreate(createData, { ignoreDuplicates: true });
  },

  async delete(id: string): Promise<boolean> {
    const deleted = await Year.destroy({ where: { id } });
    return deleted > 0;
  },

  async existsByClientAndYear(clientId: string, year: string): Promise<boolean> {
    const count = await Year.count({ where: { clientId, year } });
    return count > 0;
  },

  async getAvailableYears(): Promise<string[]> {
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    for (let year = 2021; year <= Math.min(currentYear + 1, 2030); year++) {
      years.push(String(year));
    }
    return years;
  },

  async findAllWithDocumentCount(clientId: string): Promise<any[]> {
    const years = await Year.findAll({
      where: { clientId },
      include: [{ model: Document, as: 'documents', attributes: ['id'] }],
      order: [['year', 'desc']],
    });

    return years.map((year) => ({
      id: year.id,
      year: year.year,
      clientId: year.clientId,
      documentCount: year.documents?.length || 0,
      createdAt: year.createdAt,
    }));
  },
};
