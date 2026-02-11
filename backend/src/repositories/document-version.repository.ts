import { DocumentVersion, DocumentVersionCreationAttributes } from '../models/document-version.model';

export const documentVersionRepository = {
  async create(data: DocumentVersionCreationAttributes, options?: any) {
    return DocumentVersion.create(data, options);
  },

  async findByDocumentId(documentId: string): Promise<DocumentVersion[]> {
    return DocumentVersion.findAll({
      where: { documentId },
      order: [['versionNumber', 'desc']],
    });
  },

  async findSpecificVersion(documentId: string, versionNumber: number): Promise<DocumentVersion | null> {
    return DocumentVersion.findOne({
      where: { documentId, versionNumber },
    });
  },

  async getLatestVersionNumber(documentId: string): Promise<number> {
    const latest = await DocumentVersion.findOne({
      where: { documentId },
      order: [['versionNumber', 'desc']],
    });
    return latest ? latest.versionNumber : 0;
  },
};
