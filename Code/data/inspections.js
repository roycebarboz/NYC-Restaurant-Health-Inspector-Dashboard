import fs from 'fs';
import csv from 'csv-parser';
import { ObjectId } from 'mongodb';
import {
  inspections as inspectionsCollection,
  restaurants as restaurantsCollection
} from '../config/mongoCollections.js';

const csv_parser = async (file_path_of_csv) => {
  const results = [];
  const stream = fs.createReadStream(file_path_of_csv).pipe(csv());

  for await (const row of stream) {
    results.push(row);
  }

  console.log(`CSV parsed for inspections: ${results.length} rows`);
  return results;
};

/**
 * date transform
 */
const parseDateToISO = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;

  const trimmed = dateStr.trim();
  if (!trimmed) return null;
  if (trimmed === '01/01/1900') return null;

  const parts = trimmed.split('/');
  if (parts.length !== 3) return null;

  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  const d = new Date(year, month - 1, day);
  if (Number.isNaN(d.getTime())) return null;

  return d.toISOString().split('T')[0];
};

const parseScore = (scoreStr) => {
  if (scoreStr === undefined || scoreStr === null) return null;
  const trimmed = String(scoreStr).trim();
  if (!trimmed) return null;

  const num = parseInt(trimmed, 10);
  if (Number.isNaN(num) || num < 0) return null;

  return num;
};

const parseGrade = (gradeStr) => {
  if (gradeStr === undefined || gradeStr === null) return null;
  const trimmed = String(gradeStr).trim().toUpperCase();
  if (!trimmed) return null;

  const allowed = ['A', 'B', 'C', 'P', 'Z'];
  return allowed.includes(trimmed) ? trimmed : null;
};

const group_inspections = (rows) => {
  const map = new Map();

  for (const row of rows) {
    const camis = row['CAMIS'];
    const inspectionDate = row['INSPECTION DATE'];
    const inspectionType = row['INSPECTION TYPE'];
    const action = row['ACTION'] || '';
    const score = row['SCORE'] || '';
    const grade = row['GRADE'] || '';
    const gradeDate = row['GRADE DATE'] || '';
    const recordDate = row['RECORD DATE'] || '';

    if (!camis || inspectionDate === '01/01/1900') {
      continue;
    }

    const key = [
      camis,
      inspectionDate,
      inspectionType,
      action,
      score,
      grade,
      gradeDate,
      recordDate
    ].join('|');

    if (!map.has(key)) {
      map.set(key, {
        camis,
        inspectionDate,
        inspectionType,
        action,
        score,
        grade,
        gradeDate,
        recordDate,
        rows: []
      });
    }

    map.get(key).rows.push(row);
  }

  console.log(`Grouped into ${map.size} unique inspections (by CAMIS + dates + type + action + score/grade)`);
  return map;
};

/**
 *
 * @param {string} csvFilePath - CSV file path
 * @returns {{ insertedCount: number }} - inspections inserted count
 */
export const createInspection = async (csvFilePath) => {
  console.log('Step 1: Parsing CSV file for inspections...');
  const csvRows = await csv_parser(csvFilePath);

  console.log('\nStep 2: Grouping inspection rows into inspection records...');
  const grouped = group_inspections(csvRows);

  console.log('\nStep 3: Loading restaurants (for CAMIS -> restaurantId mapping)...');
  const restaurantsCol = await restaurantsCollection();
  const restaurants = await restaurantsCol
    .find({}, { projection: { _id: 1, camis: 1 } })
    .toArray();

  const camisToRestaurantId = new Map();
  for (const r of restaurants) {
    if (r.camis) {
      camisToRestaurantId.set(String(r.camis).trim(), r._id);
    }
  }
  console.log(`Loaded ${restaurants.length} restaurants; CAMIS -> restaurantId map size: ${camisToRestaurantId.size}`);

  console.log('\nStep 4: Building inspection documents (and skipping rows with no matching restaurant)...');
  const inspectionDocs = [];
  const restaurantToInspectionIds = new Map();
  let skippedNoRestaurant = 0;

  for (const [, group] of grouped.entries()) {
    const {
      camis,
      inspectionDate,
      inspectionType,
      action,
      score,
      grade,
      gradeDate,
      recordDate,
      rows
    } = group;

    const camisStr = String(camis).trim();
    const restaurantId = camisToRestaurantId.get(camisStr);

    if (!restaurantId) {
      skippedNoRestaurant += 1;
      continue;
    }

    const inspectionDateISO = parseDateToISO(inspectionDate);
    if (!inspectionDateISO) {
      continue;
    }

    const inspectionTypeStr = (inspectionType || '').trim() || 'Unknown';
    const actionStr = (action || '').trim() || 'Unknown';
    const scoreNum = parseScore(score);
    const gradeStr = parseGrade(grade);
    const gradeDateISO = parseDateToISO(gradeDate);
    const recordDateISO = parseDateToISO(recordDate);

    const violations = [];
    for (const row of rows) {
      const code = (row['VIOLATION CODE'] || '').trim();
      const desc = (row['VIOLATION DESCRIPTION'] || '').trim();
      const flagRaw = (row['CRITICAL FLAG'] || '').trim();

      if (!code || !desc) continue;

      let flag = flagRaw;
      const allowedFlags = ['Critical', 'Not Critical', 'Not Applicable'];
      if (!allowedFlags.includes(flag)) {
        flag = 'Not Applicable';
      }

      violations.push({
        violationCode: code,
        violationDescription: desc,
        criticalFlag: flag
      });
    }

    const inspectionDoc = {
      _id: new ObjectId().toString(),
      restaurantId,
      camis: camisStr,
      inspectionDate: inspectionDateISO,
      inspectionType: inspectionTypeStr,
      action: actionStr,
      score: scoreNum,
      grade: gradeStr,
      gradeDate: gradeDateISO,
      recordDate: recordDateISO,
      violations,
      createdAt: inspectionDateISO
    };

    inspectionDocs.push(inspectionDoc);

    if (!restaurantToInspectionIds.has(restaurantId)) {
      restaurantToInspectionIds.set(restaurantId, []);
    }
    restaurantToInspectionIds.get(restaurantId).push(inspectionDoc._id);
  }

  console.log(`Built ${inspectionDocs.length} inspection documents`);
  console.log(`Skipped ${skippedNoRestaurant} grouped inspections because restaurant (CAMIS) not found in DB`);

  const inspectionsCol = await inspectionsCollection();

  console.log('\nStep 5: Deleting previous inspections collection (to avoid duplicates)...');
  await inspectionsCol.deleteMany({});
  console.log('Previous inspections collection deleted');

  console.log('\nStep 6: Inserting inspection documents in batches...');
  const batchSize = 1000;
  let inserted = 0;

  for (let i = 0; i < inspectionDocs.length; i += batchSize) {
    const batch = inspectionDocs.slice(i, i + batchSize);
    if (batch.length === 0) continue;
    await inspectionsCol.insertMany(batch);
    inserted += batch.length;
    console.log(`  Progress: ${inserted}/${inspectionDocs.length} inspections`);
  }

  console.log(`Inserted ${inserted} inspections into MongoDB`);

  console.log('\nStep 7: Updating restaurants.inspectionIds ...');
  for (const [restaurantId, inspectionIds] of restaurantToInspectionIds.entries()) {
    await restaurantsCol.updateOne(
      { _id: restaurantId },
      { $set: { inspectionIds: inspectionIds } }
    );
  }
  console.log('restaurants.inspectionIds updated');

  console.log('\nStep 8: Creating indexes on inspections collection...');
  await inspectionsCol.createIndex({ restaurantId: 1 });
  await inspectionsCol.createIndex({ camis: 1 });
  await inspectionsCol.createIndex({ inspectionDate: 1 });
  await inspectionsCol.createIndex({ grade: 1 });
  await inspectionsCol.createIndex({ score: 1 });
  console.log('Created indexes on inspections collection');

  return { insertedCount: inserted };
};


const validateRestaurantId = (id) => {
  if (typeof id !== 'string') {
    throw new Error('restaurantId must be a string');
  }
  const trimmed = id.trim();
  if (!trimmed) {
    throw new Error('restaurantId cannot be an empty string or just spaces');
  }

  return trimmed;
};

export const getByRestaurantId = async (restaurantId) => {
  const restaurantIdStr = validateRestaurantId(restaurantId);

  const restaurantsCol = await restaurantsCollection();
  const restaurant = await restaurantsCol.findOne({ _id: restaurantIdStr });

  if (!restaurant) {
    throw new Error(`Restaurant with id ${restaurantIdStr} not found`);
  }

  const inspectionsCol = await inspectionsCollection();

  const inspectionList = await inspectionsCol
    .find({ restaurantId: restaurantIdStr })
    .sort({ inspectionDate: -1, createdAt: -1 })
    .toArray();

  return inspectionList;
};
