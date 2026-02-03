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
  async create(data: FolderCreationAttributes, options?: any): Promise<Folder> {
    return Folder.create(data, options) as unknown as Promise<Folder>;
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
    const folder = await Folder.findByPk(id, {
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
          model: File,
          as: 'files',
          include: [{ model: User, as: 'uploader', attributes: ['id', 'name'] }],
        },
      ],
    });

    if (!folder) return null;

    // Manually fetch children to ensure they are retrieved correctly
    // This is more reliable for self-referencing associations in some Sequelize versions
    const children = await Folder.findAll({
      where: { parentId: id },
      order: [['name', 'ASC']],
      include: [
        {
          model: File,
          as: 'files',
        },
      ],
    });

    folder.setDataValue('children' as any, children);
    (folder as any).children = children;

    return folder as unknown as FolderWithDetails;
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
    // 1. Get Root
    const rootFolder = await Folder.findOne({ where: { clientId, type: 'root' } });
    if (!rootFolder) return null;

    // 2. Get Level 1 children (Documents, Years)
    const l1Children = await Folder.findAll({
      where: { parentId: rootFolder.id },
      order: [['name', 'ASC']],
      include: [
        {
          model: File,
          as: 'files',
          order: [['createdAt', 'DESC']],
          include: [{ model: User, as: 'uploader', attributes: ['id', 'name'] }],
        },
      ],
    });

    // 3. Get Level 2 children (Subfolders like 2015, 2016)
    const l1Ids = l1Children.map((c) => c.id);
    let l2Children: Folder[] = [];

    if (l1Ids.length > 0) {
      l2Children = await Folder.findAll({
        where: { parentId: l1Ids },
        order: [['name', 'ASC']],
        include: [
          {
            model: File,
            as: 'files',
            order: [['createdAt', 'DESC']],
            include: [{ model: User, as: 'uploader', attributes: ['id', 'name'] }],
          },
        ],
      });
    }

    // 4. Assemble Tree
    // Map L2 children to their parents
    const childrenMap = new Map<string, Folder[]>();
    l2Children.forEach((c) => {
      // Need to cast to any to read parent_id if using raw attributes or parentId via model
      // c.parentId should be populated
      const pId = c.parentId;
      if (pId) {
        if (!childrenMap.has(pId)) childrenMap.set(pId, []);
        childrenMap.get(pId)!.push(c);
      }
    });

    // Attach L2 to L1
    l1Children.forEach((c) => {
      const children = childrenMap.get(c.id) || [];
      c.setDataValue('children' as any, children);
      (c as any).children = children; // Explicit property assignment for some serialization cases
    });

    // Attach L1 to Root
    rootFolder.setDataValue('children' as any, l1Children);
    (rootFolder as any).children = l1Children;

    return rootFolder as unknown as FolderWithDetails;
  },

  /**
   * Count folders by client
   */
  async countByClientId(clientId: string): Promise<number> {
    return Folder.count({ where: { clientId } });
  },
};
