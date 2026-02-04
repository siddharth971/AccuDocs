
import { sequelize } from '../src/config/database.config';
import { File, User, Folder } from '../src/models';

const inspectDb = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');

    const fileId = 'ca87515d-0ea3-435f-965e-d09994198aef';
    const file = await File.findByPk(fileId);
    if (file) {
      console.log(`Found File: ${file.id}`);
      console.log(`  Uploader: ${file.uploadedBy}`);
      console.log(`  FolderID: ${file.folderId}`);
      const folder = await Folder.findByPk(file.folderId);
      console.log(`  Folder: ${folder ? folder.name : 'MISSING'}`);
    } else {
      console.log('File NOT found in simple query');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
};

inspectDb();
