import fs from 'fs';
import csv from 'csv-parser';
import { ObjectId } from 'mongodb';
import { restaurants as restaurantsCollection } from '../config/mongoCollections.js';

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
    // first we open the csv file as a stream to read the file line by line
    // then we pipe the stream to the csv parser to parse the file line by line
    // then we push the parsed rows to the results array
    // then we return the results array
    const results = [];
    const stream = fs.createReadStream(file_path_of_csv).pipe(csv());

    for await (const row of stream) {
        results.push(row);
    }

    console.log(`CSV parsed: ${results.length} rows`);
    return results;
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
    // we create a map to group the inspection records by camis
    // then we iterate through the rows
    // if the camis is not in the map, we add it to the map
    // if the camis is in the map, we push the row to the array of inspection records
    // then we return the map
    // we skip the rows where the inspection date is 01/01/1900 and if the camis is not present
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

// latest_inspection_grade function takes in the array of inspection records for a restaurant and returns the latest inspection grade, score and date
// we keep the fields null for no data available
// for example: latest_inspection_grade(inspections) returns {
//    "currentGrade": "A",
//    "currentScore": 10,
//    "grade_date": "2025-01-01"
// }

const latest_inspection_grade = (inspections) => {
    //first we initialize the variables to null
    // then we iterate through the inspections
    // if the grade date is not present or is empty, we skip the inspection
    // if the grade date is present, we parse the date and convert it to a date object with the year, month and day format
    // if the date is invalid, we skip the inspection
    // if the date is valid, we compare it to the latest date and update the latest grade, score and date if it is newer
    // then we return the latest grade, score and date
    let latest_grade = null;
    let latest_score = null;
    let latest_date = null;

    for (const inspection of inspections) {
        const grade_date = inspection['GRADE DATE'];
        const grade = inspection['GRADE'];
        const score = inspection['SCORE'];

        // Skip if no grade date
        if (!grade_date || grade_date.trim() === '') continue;

        // Parse date (format: MM/DD/YYYY)
        const dateParts = grade_date.split('/');
        if (dateParts.length !== 3) continue;

        const currentDate = new Date(
            parseInt(dateParts[2], 10),  // year
            parseInt(dateParts[0], 10) - 1,  // month (January is 0, December is 11)
            parseInt(dateParts[1], 10)   // day
        );

        if (isNaN(currentDate.getTime())) continue;

        if (!latest_date || currentDate > latest_date) {
            latest_date = currentDate;
            latest_grade = grade && grade.trim() !== '' ? grade.trim() : null;
            latest_score = score && score.trim() !== '' ? parseInt(score, 10) : null;
        }
    }

    return {
        currentGrade: latest_grade,
        currentScore: latest_score,
        grade_date: latest_date ? latest_date.toISOString().split('T')[0] : null
    };
};

// CreateRestaurant takes in the csv file path, parses the csv, groups by camis, and creates new restaurant documents in the mongodb database
//we keep the feilds blank or "Unknown" for no data available
// for example: CreateRestaurant(csvFilePath) = {
//    "camis": "1234567890",
//    "name": "Masala Cafe",
//    "address": "123 Main St, Anytown, USA",
//    "city": "Anytown",
//    "state": "CA",
//    "zip": "12345",
//    "grade": "A",
//    "score": 10,
//    "date": "2025-01-01"
//    ...
//}

// we first call the function to parse the csv file and return the rows
// then we group them by camis and get the inspection records for each restaurant and get the latest grade information
// then we parse the location coordinates
// then we create a new restaurant document
// then we push the restaurant document to the array of restaurant documents
// then we insert the restaurant documents into the database
// then we create indexes for better query performance so for example we can query by camis, borough, etc in a more efficient way

const CreateRestaurant = async (csvFilePath) => {

    console.log('Step 1: Parsing CSV file...');
    const csvRows = await csv_parser(csvFilePath);

    console.log('\nStep 2: Grouping restaurants by CAMIS...');
    const camis_to_inspection_map = group_by_camis(csvRows);

    console.log('\nStep 3: Creating and inserting restaurant documents...');
    const restaurantDocs = [];

    for (const [camis, inspectionRecords] of camis_to_inspection_map.entries()) {
        const firstRecord = inspectionRecords[0];

        const { currentGrade, currentScore, grade_date } = latest_inspection_grade(inspectionRecords);

        const latitude = parseFloat(firstRecord['Latitude']) || 0;
        const longitude = parseFloat(firstRecord['Longitude']) || 0;

        const restaurant = {
            _id: new ObjectId().toString(),
            camis: camis,
            name: firstRecord['DBA'] || 'Unknown',
            borough: firstRecord['BORO'] || '',
            building: firstRecord['BUILDING'] || '',
            street: firstRecord['STREET'] || '',
            zipcode: firstRecord['ZIPCODE'] || '',
            phone: firstRecord['PHONE'] || '',
            cuisineType: firstRecord['CUISINE DESCRIPTION'] || 'Unknown',
            currentGrade: currentGrade,
            currentScore: currentScore,
            grade_date: grade_date,
            location: {
                latitude: latitude,
                longitude: longitude
            },
            communityBoard: firstRecord['Community Board'] || '',
            councilDistrict: firstRecord['Council District'] || '',
            censusTract: firstRecord['Census Tract'] || '',
            bin: firstRecord['BIN'] || '',
            bbl: firstRecord['BBL'] || '',
            nta: firstRecord['NTA'] || '',
            // will be populated by inspections.js
            inspectionIds: [],
            // will be populated by frontend code-------
            reviewIds: [],
            averageUserRating: 0,
            totalReviews: 0,
            //--------------------------------
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };

        restaurantDocs.push(restaurant);
    }

    console.log(`Created ${restaurantDocs.length} restaurant documents`);

    const restaurants_collection = await restaurantsCollection();

    // this deletes the previous collection to avoid duplicates
    await restaurants_collection.deleteMany({});
    console.log('Previous collection deleted');

    // this inserts all restaurants in batche of 1000
    const batchSize = 1000;
    let inserted = 0;

    for (let i = 0; i < restaurantDocs.length; i += batchSize) {
        const batch = restaurantDocs.slice(i, i + batchSize);
        await restaurants_collection.insertMany(batch);
        inserted += batch.length;
        console.log(`  Progress: ${inserted}/${restaurantDocs.length} restaurants`);
    }

    console.log(`Inserted ${inserted} restaurants into MongoDB`);

    // indexes to improve query performance
    await restaurants_collection.createIndex({ camis: 1 }, { unique: true });
    await restaurants_collection.createIndex({ borough: 1 });
    await restaurants_collection.createIndex({ cuisineType: 1 });
    await restaurants_collection.createIndex({ currentGrade: 1 });
    await restaurants_collection.createIndex({ zipcode: 1 });
    await restaurants_collection.createIndex({ 'location.latitude': 1, 'location.longitude': 1 });
    console.log('Created indexes on restaurants collection');

    return { insertedCount: inserted };
};

export default CreateRestaurant;