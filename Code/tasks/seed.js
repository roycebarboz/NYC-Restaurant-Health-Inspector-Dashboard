import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { ObjectId } from 'mongodb';
import { restaurants } from '../config/mongoCollections.js';
import { closeConnection } from '../config/mongoConnection.js';

// Get current file directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 this function takes in the file path of the csv file which is a string and returns a array of object which represents each row in the csv file
 for example: results = [
    {
        "CAMIS": "1234567890",
        "DBA": "Masala Cafe",
        ...
    },
    {
        "CAMIS": "1234567891",
        "DBA": "Joe's Pizza",
        ..
    },
 ]
 */
const csv_parser = async (file_path_of_csv) => {
    return new Promise((resolve, reject) => {
        const results = [];

        fs.createReadStream(file_path_of_csv)
            .pipe(csv())
            .on('data', (row) => {
                results.push(row);
            })
            .on('end', () => {
                console.log(`CSV parsed: ${results.length} rows`);
                resolve(results);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

/**
 this function takes in the parsed csv rows and returns a map of camis(unique id for each restaurant) to inspection records
 for example: camis_to_inspection_map = {
    "1234567890": [
        {
            "CAMIS": "1234567890",
            "DBA": "Masala Cafe",
            "Grade": "A",
            "Score": 10,
            "Grade Date": "2025-01-01",
            ...
        },
        {
            "CAMIS": "1234567890",
            "DBA": "Masala Cafe",
            "Grade": "B",
            "Score": 9,
            "Grade Date": "2025-01-02",
            ...
        },
    ],
 }
 */
const group_by_camis = (rows) => {
    const camis_to_inspection_map = new Map();

    for (const row of rows) {
        const camis = row['CAMIS'];
        if (!camis || row['INSPECTION DATE'] === '01/01/1900') {
            continue;
        }

        if (!camis_to_inspection_map.has(camis)) {
            camis_to_inspection_map.set(camis, []);
        }

        camis_to_inspection_map.get(camis).push(row);
    }

    console.log(`Grouped into ${camis_to_inspection_map.size} unique restaurants`);
    return camis_to_inspection_map;
};

export default seed;