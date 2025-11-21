import { ObjectId } from 'mongodb';
import {
  inspections as inspectionsCollection,
  restaurants as restaurantsCollection
} from '../config/mongoCollections.js';
import {
  checkId,
  checkNonEmptyString,
  checkNumber,
  parseDate,
  validateGrade,
  normalizeViolations
} from './inspectionsValidation.js';

/**
 * Create a new inspection record
 *
 * @param {Object} inspectionData - New inspection data object
 * @returns {Promise<Object>} - Created inspection document
 */
export const createInspection = async (inspectionData) => {
  if (!inspectionData || typeof inspectionData !== 'object') {
    throw new TypeError('inspectionData must be a non-null object');
  }

  const {
    restaurantId,
    camis,
    inspectionDate,
    inspectionType,
    action,
    score,
    grade,
    gradeDate,
    recordDate,
    violations
  } = inspectionData;

  const restaurantIdStr = checkId(restaurantId, 'restaurantId');
  const restaurantObjectId = new ObjectId(restaurantIdStr);

  const camisStr = camis !== undefined ? checkNonEmptyString(camis, 'camis') : null;
  const inspectionTypeStr = checkNonEmptyString(inspectionType, 'inspectionType');
  const actionStr = action !== undefined ? checkNonEmptyString(action, 'action') : null;

  const scoreNum = score !== undefined ? checkNumber(score, 'score') : null;
  if (scoreNum !== null && (scoreNum < 0 || !Number.isFinite(scoreNum))) {
    throw new Error('score must be a non-negative finite number');
  }

  const gradeStr = validateGrade(grade);

  const inspectionDateObj = parseDate(inspectionDate, 'inspectionDate');
  if (!inspectionDateObj) {
    throw new Error('inspectionDate is required');
  }

  const gradeDateObj = gradeStr ? parseDate(gradeDate, 'gradeDate') : null;
  const recordDateObj = parseDate(recordDate, 'recordDate') || new Date();

  const violationsArr = normalizeViolations(violations);

  const inspectionsCol = await inspectionsCollection();
  const restaurantsCol = await restaurantsCollection();

  const restaurant = await restaurantsCol.findOne({ _id: restaurantObjectId });
  if (!restaurant) {
    throw new Error(`Restaurant with id ${restaurantIdStr} not found`);
  }

  const newInspection = {
    restaurantId: restaurantObjectId,
    camis: camisStr,
    inspectionDate: inspectionDateObj,
    inspectionType: inspectionTypeStr,
    action: actionStr,
    score: scoreNum,
    grade: gradeStr,
    gradeDate: gradeDateObj,
    recordDate: recordDateObj,
    violations: violationsArr,
    createdAt: new Date()
  };

  const insertResult = await inspectionsCol.insertOne(newInspection);
  if (!insertResult.acknowledged || !insertResult.insertedId) {
    throw new Error('Failed to create inspection');
  }

  const newId = insertResult.insertedId;

  await restaurantsCol.updateOne(
    { _id: restaurantObjectId },
    {
      $addToSet: { inspectionIds: newId },
      $set: { updatedAt: new Date() }
    }
  );

  const createdInspection = await inspectionsCol.findOne({ _id: newId });
  if (!createdInspection) {
    throw new Error('Inspection was created but could not be retrieved');
  }

  return createdInspection;
};

/**
 * Get all inspections by restaurant id, sorted by inspectionDate descending
 *
 * @param {string} restaurantId - Restaurant ObjectId string
 * @returns {Promise<Array>} - List of inspection documents
 */
export const getByRestaurantId = async (restaurantId) => {
  const restaurantIdStr = checkId(restaurantId, 'restaurantId');
  const restaurantObjectId = new ObjectId(restaurantIdStr);

  const inspectionsCol = await inspectionsCollection();

  const inspectionsList = await inspectionsCol
    .find({ restaurantId: restaurantObjectId })
    .sort({ inspectionDate: -1 })
    .toArray();

  return inspectionsList;
};
