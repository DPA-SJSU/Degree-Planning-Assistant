/* eslint-disable import/prefer-default-export */
import { body, param, query } from 'express-validator';

import {
  ID_IS_INVALID,
  PLAN_ID_IS_EMPTY,
  USER_ID_IS_EMPTY,
  USER_ID_IS_REQUIRED,
  USER_ID_IS_INVALID,
  COURSE_NAMES_ONLY_MUST_BE_BOOLEAN,
  COURSE_NAMES_ONLY_FIELD_IS_EMPTY,
  PLAN_ID_FIELD_IS_REQUIRED,
} from '../constant';

// export const validateSemesters = [
//   check('email')
//     .exists()
//     .withMessage(EMAIL_IS_EMPTY)
//     .isEmail()
//     .withMessage(EMAIL_IS_IN_WRONG_FORMAT),
//   check('password')
//     .exists()
//     .withMessage(PASSWORD_IS_EMPTY)
//     .isLength({ min: 8 })
//     .withMessage(PASSWORD_LENGTH_MUST_BE_MORE_THAN_8),
// ];

export const validateSemesters = semesterArr => {
  if (!semesterArr && semesterArr.constructor !== Array) {
    return false;
  }
  const hasProperStructure = element => {
    if (Object.keys(element).length !== 4) {
      return false;
    }
    if (
      !element.term ||
      element.term.constructor !== String ||
      (element.term.toLowerCase() !== 'fall' &&
        element.term.toLowerCase() !== 'spring' &&
        element.term.toLowerCase() !== 'winter' &&
        element.term.toLowerCase() !== 'summer')
    ) {
      return false;
    }
    if (
      !element.year ||
      element.year.constructor !== String ||
      (element.year.toLowerCase() !== 'freshman' &&
        element.year.toLowerCase() !== 'sophomore' &&
        element.year.toLowerCase() !== 'junior' &&
        element.year.toLowerCase() !== 'senior')
    ) {
      return false;
    }
    if (!element.difficulty || element.difficulty.constructor !== Number) {
      return false;
    }
    if (!element.courses || element.courses.constructor !== Array) {
      return false;
    }

    const areAllHexadecimalStr = element2 => {
      const regExpHexa = /^([a-fA-F0-9]){24}$/;
      return !!(element2.constructor === String && regExpHexa.test(element2));
    };

    return element.courses.every(areAllHexadecimalStr);
  };

  return semesterArr.every(hasProperStructure);
};
