import { ObjectId } from 'mongodb';

export const checkNonEmptyString = (str, varName) => {
  if (typeof str !== 'string') {
    throw new TypeError(`${varName} must be a string`);
  }
  const trimmed = str.trim();
  if (trimmed.length === 0) {
    throw new Error(`${varName} cannot be empty or just spaces`);
  }
  return trimmed;
};

export const checkId = (id, varName = 'id') => {
  const strId = checkNonEmptyString(id, varName);
  if (!ObjectId.isValid(strId)) {
    throw new Error(`${varName} is not a valid ObjectId`);
  }
  return strId;
};

export const checkNumber = (num, varName) => {
  if (typeof num !== 'number' || Number.isNaN(num)) {
    throw new TypeError(`${varName} must be a valid number`);
  }
  return num;
};

export const parseDate = (value, varName) => {
  if (value === undefined || value === null) {
    return null;
  }

  let date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    date = new Date(trimmed);
  } else {
    throw new TypeError(`${varName} must be a Date object or a date string`);
  }

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${varName} is not a valid date`);
  }

  const now = new Date();
  if (date.getTime() > now.getTime()) {
    throw new Error(`${varName} cannot be in the future`);
  }

  return date;
};

const allowedGrades = ['A', 'B', 'C', 'Z', 'Not Yet Graded'];

export const validateGrade = (grade) => {
  if (grade === undefined || grade === null) {
    return null;
  }
  const gradeStr = checkNonEmptyString(grade, 'grade');
  if (!allowedGrades.includes(gradeStr)) {
    throw new Error(
      `grade must be one of: ${allowedGrades.join(', ')}`
    );
  }
  return gradeStr;
};

export const normalizeViolations = (violations) => {
  if (violations === undefined || violations === null) {
    return [];
  }
  if (!Array.isArray(violations)) {
    throw new TypeError('violations must be an array');
  }

  return violations.map((v, index) => {
    if (typeof v !== 'object' || v === null) {
      throw new TypeError(`violations[${index}] must be an object`);
    }

    const normalized = {};

    if ('violationCode' in v) {
      normalized.violationCode = checkNonEmptyString(
        v.violationCode,
        `violations[${index}].violationCode`
      );
    }

    if ('violationDescription' in v) {
      normalized.violationDescription = checkNonEmptyString(
        v.violationDescription,
        `violations[${index}].violationDescription`
      );
    }

    if ('criticalFlag' in v) {
      normalized.criticalFlag = checkNonEmptyString(
        v.criticalFlag,
        `violations[${index}].criticalFlag`
      );
    }

    return normalized;
  });
};
