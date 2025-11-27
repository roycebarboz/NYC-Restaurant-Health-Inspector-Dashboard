// to populate the database with the restaurant data from the csv file
// first download the csv file from the link in the assignment specs
// then put the csv file in the tasks folder
// update the csvPath variable to the path of the csv file
// the go the the Code folder and run the command "npm run seed"

import path from 'path';
import { fileURLToPath } from 'url';
import CreateRestaurant from '../data/restaurants.js';
import { closeConnection } from '../config/mongoConnection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seed = async () => {
    // UPDATE THIS PATH TO THE PATH OF THE CSV FILE
    const csvPath = path.join(__dirname, '../../assist/DOHMH_New_York_City_Restaurant_Inspection_Results_20251005.csv');

    try {
        console.log('NYC Restaurant Data Import');

        // this calls the CreateRestaurant function to parse CSV, group by CAMIS, and insert into MongoDB
        const result = await CreateRestaurant(csvPath);

        console.log('Import Complete!');
        console.log(`Total Restaurants Imported: ${result.insertedCount}`);

    } catch (error) {
        console.error('Import failed:', error);
        throw error;
    } finally {
        await closeConnection();
    }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    seed()
        .then(() => {
            console.log('\nSeed completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\nSeed failed:', error);
            process.exit(1);
        });
}

export default seed;