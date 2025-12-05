// tasks/seedInspections.js

import path from 'path';
import { fileURLToPath } from 'url';
import { createInspection } from '../data/inspections.js';
import { closeConnection } from '../config/mongoConnection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedInspections = async () => {
  // ⚠️ 这里路径要指向你那份 DOHMH CSV 文件
  // 通常和 restaurants 用的是同一个文件，只是路径可能不一样
  const csvPath = path.join(
    __dirname,
    'DOHMH_New_York_City_Restaurant_Inspection_Results_20251005.csv'
  );

  try {
    console.log('NYC Inspection Data Import');

    const result = await createInspection(csvPath);

    console.log('Inspection Import Complete!');
    console.log(`Total Inspections Imported: ${result.insertedCount}`);
  } catch (error) {
    console.error('Inspection Import failed:', error);
    throw error;
  } finally {
    await closeConnection();
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedInspections()
    .then(() => {
      console.log('\nInspection seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nInspection seed failed:', error);
      process.exit(1);
    });
}

export default seedInspections;
