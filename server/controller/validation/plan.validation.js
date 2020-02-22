import { body, query } from 'express-validator';

import {
  ID_IS_INVALID,
  PLAN_ID_IS_EMPTY,
  USER_ID_IS_EMPTY,
  PARAMETERS_IS_EMPTY,
  INVALID_PARAMETERS,
  USER_ID_IS_REQUIRED,
  PLAN_ID_FIELD_IS_REQUIRED,
} from '../constant';

export const validateSemesters = semesterArr => {
  if (!semesterArr && semesterArr.constructor !== Array) {
    return false;
  } else {
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
        return element2.constructor === String && regExpHexa.test(element2)
          ? true
          : false;
      };

      return element.courses.every(areAllHexadecimalStr);
    };

    return semesterArr.every(hasProperStructure);
  }
};

export const validateUpdatePlan = [
  body('plan_id')
    .if(body('plan_id').exists())
    .not()
    .isEmpty()
    .withMessage(PLAN_ID_IS_EMPTY)
    .bail()
    .isHexadecimal()
    .withMessage(ID_IS_INVALID)
    .bail()
    .unescape()
    .ltrim()
    .rtrim()
    .isLength({ min: 24, max: 24 })
    .withMessage(ID_IS_INVALID),
  body('user_id')
    .if(body('plan_id').exists())
    .not()
    .isEmpty()
    .withMessage(USER_ID_IS_EMPTY)
    .bail()
    .isHexadecimal()
    .withMessage(ID_IS_INVALID)
    .bail()
    .unescape()
    .ltrim()
    .rtrim()
    .isLength({ min: 24, max: 24 })
    .withMessage(ID_IS_INVALID),
];

export const validateFetchPlan = [
  query('plan_id')
    .if(query('plan_id').exists())
    .not()
    .isEmpty()
    .withMessage(PLAN_ID_IS_EMPTY)
    .bail()
    .isHexadecimal()
    .withMessage(ID_IS_INVALID)
    .bail()
    .unescape()
    .ltrim()
    .rtrim()
    .isLength({ min: 24, max: 24 })
    .withMessage(ID_IS_INVALID),
  query('user_id')
    .if(query('plan_id').exists())
    .not()
    .isEmpty()
    .withMessage(USER_ID_IS_EMPTY)
    .bail()
    .isHexadecimal()
    .withMessage(ID_IS_INVALID)
    .bail()
    .unescape()
    .ltrim()
    .rtrim()
    .isLength({ min: 24, max: 24 })
    .withMessage(ID_IS_INVALID),
  query('fetch_data')
    .if(query('fetch_data').exists())
    .not()
    .isEmpty()
    .withMessage(PARAMETERS_IS_EMPTY)
    .bail()
    .unescape()
    .ltrim()
    .rtrim()
    .isBoolean()
    .withMessage(INVALID_PARAMETERS),
];

export const validateDeletePlan = [
  body('plan_id')
    .exists()
    .withMessage(PLAN_ID_FIELD_IS_REQUIRED)
    .bail()
    .not()
    .isEmpty()
    .withMessage(PLAN_ID_IS_EMPTY)
    .bail()
    .isHexadecimal()
    .withMessage(ID_IS_INVALID)
    .bail()
    .unescape()
    .ltrim()
    .rtrim()
    .isLength({ min: 24, max: 24 })
    .withMessage(ID_IS_INVALID),
];
