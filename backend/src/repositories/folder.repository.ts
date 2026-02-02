import { Folder, FolderCreationAttributes, FolderType, Client, User, File } from '../models';
import { Op } from 'sequelize';

interface FolderFilters {
  clientId?: string;
  parentId?: string | null;
  type?: FolderType;
  search?: string;
}

interface FolderWithDetails extends Folder {
  client?: Client;
  parent?: Folder;
  children?: Folder[];
  files?: File[];
}

export const folderRepository = {
  /**
   * Create a new folder
   */
  async create(data: FolderCreationAttributes): Promise<Folder> {
    return Folder.create(data);
  },

  /**
   * Create multiple folders at once
   */
  async createMany(folders: FolderCreationAttributes[]): Promise<Folder[]> {
    return Folder.bulkCreate(folders);
  },

  /**
   * Find folder by ID
   */
  async findById(id: string): Promise<FolderWithDetails | null> {
    return Folder.findByPk(id, {
      include: [
        {
          model: Client,
          as: 'client',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'mobile'] }],
        },
        {
          model: Folder,
          as: 'parent',
        },
        {
          model: Folder,
          as: 'children',
          include: [
            {
              model: File,
              as: 'files',
            },
          ],
        },
        {
          model: File,
          as: 'files',
          include: [{ model: User, as: 'uploader', attributes: ['id', 'name'] }],
        },
      ],
    }) as Promise<FolderWithDetails | null>;
  },

  /**
   * Find folders by client ID
   */
  async findByClientId(clientId: string): Promise<Folder[]> {
    return Folder.findAll({
      where: { clientId },
      include: [
        {
          model: File,
          as: 'files',
        },
      ],
      order: [['name', 'ASC']],
    });
  },

  /**
   * Find root folder for a client
   */
  async findRootByClientId(clientId: string): Promise<FolderWithDetails | null> {
    return Folder.findOne({
      where: { clientId, type: 'root' },
      include: [
        {
          model: Folder,
          as: 'children',
          include: [
            {
              model: Folder,
              as: 'children',
              include: [
                {
                  model: File,
                  as: 'files',
                  include: [{ model: User, as: 'uploader', attributes: ['id', 'name'] }],
                },
              ],
            },
            {
              model: File,
              as: 'files',
              include: [{ model: User, as: 'uploader', attributes: ['id', 'name'] }],
            },
          ],
        },
        {
          model: File,
          as: 'files',
          include: [{ model: User, as: 'uploader', attributes: ['id', 'name'] }],
        },
      ],
    }) as Promise<FolderWithDetails | null>;
  },

  /**
   * Find folders by parent ID
   */
  async findByParentId(parentId: string): Promise<Folder[]> {
    return Folder.findAll({
      where: { parentId },
      include: [
        {
          model: File,
          as: 'files',
        },
        {
          model: Folder,
          as: 'children',
        },
      ],
      order: [['name', 'ASC']],
    });
  },

  /**
   * Find folder by slug and client ID
   */
  async findBySlugAndClientId(slug: string, clientId: string): Promise<Folder | null> {
    return Folder.findOne({
      where: { slug, clientId },
    });
  },

  /**
   * Find folders by type for a client
   */
  async findByTypeAndClientId(type: FolderType, clientId: string): Promise<Folder[]> {
    return Folder.findAll({
      where: { type, clientId },
      include: [
        {
          model: File,
          as: 'files',
        },
      ],
      order: [['name', 'ASC']],
    });
  },

  /**
   * Update a folder
   */
  async update(id: string, data: Partial<FolderCreationAttributes>): Promise<void> {
    await Folder.update(data, { where: { id } });
  },

  /**
   * Delete a folder
   */
  async delete(id: string): Promise<void> {
    await Folder.destroy({ where: { id } });
  },

  /**
   * Delete all folders for a client
   */
  async deleteByClientId(clientId: string): Promise<void> {
    await Folder.destroy({ where: { clientId } });
  },

  /**
   * Check if folder exists with same name in parent
   */
  async existsByNameInParent(name: string, parentId: string | null, clientId: string, excludeId?: string): Promise<boolean> {
    const where: any = { name, clientId };
    if (parentId) {
      where.parentId = parentId;
    } else {
      where.parentId = { [Op.is]: null };
    }
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    const count = await Folder.count({ where });
    return count > 0;
  },

  /**
   * Get folder tree for a client (full hierarchy)
   */
  async getClientFolderTree(clientId: string): Promise<FolderWithDetails | null> {
    // Get root folder with 3 levels of nesting (root -> documents/years -> year folders)
    const rootFolder = await Folder.findOne({
      where: { clientId, type: 'root' },
      include: [
        {
          model: Folder,
          as: 'children',
          separate: true,
          order: [['name', 'ASC']],
          include: [
            {
              model: Folder,
              as: 'children',
              separate: true,
              order: [['name', 'ASC']],
              include: [
                {
                  model: File,
                  as: 'files',
                  separate: true,
                  order: [['createdAt', 'DESC']],
                  include: [{ model: User, as: 'uploader', attributes: ['id', 'name'] }],
                },
              ],
            },
            {
              model: File,
              as: 'files',
              separate: true,
              order: [['createdAt', 'DESC']],
              include: [{ model: User, as: 'uploader', attributes: ['id', 'name'] }],
            },
          ],
        },
      ],
    });

    return rootFolder as FolderWithDetails | null;
  },

  /**
   * Count folders by client
   */
  async countByClientId(clientId: string): Promise<number> {
    return Folder.count({ where: { clientId } });
  },
};
