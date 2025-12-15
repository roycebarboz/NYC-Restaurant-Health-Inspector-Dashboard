// to populate the database with the restaurant data from the csv file
// first download the csv file from the link in the assignment specs
// then put the csv file in the tasks folder
// update the csvPath variable to the path of the csv file
// the go the the Code folder and run the command "npm run seed"

import path from 'path';
import { fileURLToPath } from 'url';
import { CreateRestaurant } from '../data/restaurants.js';
import { createInspection } from '../data/inspections.js';
import { closeConnection } from '../config/mongoConnection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seed = async () => {
    // UPDATE THIS PATH TO THE PATH OF THE CSV FILE
    const csvPath = path.join(__dirname, '../../assist/DOHMH_New_York_City_Restaurant_Inspection_Results_20251005.csv');

    try {
        console.log('Seeding the database with the restaurant data from the csv file\n');

        // Importing Restaurants in the database
        console.log('Importing Restaurants...');
        const restaurantResult = await CreateRestaurant(csvPath);
        console.log(`Restaurants Import Complete: ${restaurantResult.insertedCount} restaurants imported\n`);

        // Importing Inspections in the database afte
        console.log('Importing Inspections...');
        const inspectionResult = await createInspection(csvPath);
        console.log(`Inspections Import Complete: ${inspectionResult.insertedCount} inspections imported\n`);

        console.log('All Data Import Complete!');
        console.log(`Total Restaurants: ${restaurantResult.insertedCount}`);
        console.log(`Total Inspections: ${inspectionResult.insertedCount}`);

    } catch (error) {
        console.error('Import failed:', error);
        throw error;
    } finally {
        await closeConnection();
    }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    (async () => {
        try {
            await seed();
            console.log('\nSeed completed successfully');
            process.exit(0);
        } catch (error) {
            console.error('\nSeed failed:', error);
            process.exit(1);
        }
    })();
}

export default seed;