import { check, body, param, query } from 'express-validator';

import {
  AVATAR_URL_IS_EMPTY,
  AVATAR_TYPE_IS_EMPTY,
  FIRST_NAME_IS_EMPTY,
  LAST_NAME_IS_EMPTY,
  BIO_IS_EMPTY,
  MAJOR_IS_EMPTY,
  MINOR_IS_EMPTY,
  CATALOG_YEAR_IS_EMPTY,
  AVATAR_TYPE_IS_INVALID,
  LAST_NAME_IS_INVALID,
  BIO_IS_TOO_LONG,
  MAJOR_IS_INVALID,
  MINOR_IS_INVALID,
  CATALOG_YEAR_IS_INVALID,
  AVATAR_URL_IS_INVALID,
  USER_ID_IS_REQUIRED,
  USER_ID_IS_EMPTY,
  USER_ID_IS_INVALID,
  PASSWORD_IS_EMPTY,
  PASSWORD_LENGTH_MUST_BE_MORE_THAN_8,
  EMAIL_IS_EMPTY,
  EMAIL_IS_IN_WRONG_FORMAT,
  ID_IS_INVALID,
  BOOLEAN_VALUES_ONLY,
  FIRST_NAME_IS_INVALID,
  TOKEN_IS_EMPTY,
} from '../constant';

const checkIfLettersOnly = str => {
  const regExp = new RegExp(/^([a-z]|[A-Z]|\s)+$/, 'g');
  return regExp.test(str);
};

export const validateToken = [
  check('token')
    .exists()
    .withMessage(TOKEN_IS_EMPTY),
];

// Check if the proper object structure for grad date was inputted
export const checkIfCorrectGradDate = obj => {
  if (obj.constructor === Object) {
    if (
      !obj.year ||
      obj.year.constructor !== Number ||
      obj.year < new Date().getFullYear() ||
      obj.year >= Number.MAX_SAFE_INTEGER
    ) {
      return false;
    }
    if (
      !obj.term ||
      obj.term.constructor !== String ||
      (obj.term.toLowerCase() !== 'fall' &&
        obj.term.toLowerCase() !== 'spring' &&
        obj.term.toLowerCase() !== 'winter' &&
        obj.term.toLowerCase() !== 'summer')
    ) {
      return false;
    }
    if (Object.keys(obj).length !== 2) {
      return false;
    }
    return true;
  }
  return false;
};

export const validateRegisterUser = [
  check('email')
    .exists()
    .withMessage(EMAIL_IS_EMPTY)
    .isEmail()
    .withMessage(EMAIL_IS_IN_WRONG_FORMAT),
  check('password')
    .exists()
    .withMessage(PASSWORD_IS_EMPTY)
    .isLength({ min: 8 })
    .withMessage(PASSWORD_LENGTH_MUST_BE_MORE_THAN_8),
];

export const validateLoginUser = [
  check('email')
    .exists()
    .withMessage(EMAIL_IS_EMPTY)
    .isEmail()
    .withMessage(EMAIL_IS_IN_WRONG_FORMAT),
  check('password')
    .exists()
    .withMessage(PASSWORD_IS_EMPTY)
    .isLength({ min: 8 })
    .withMessage(PASSWORD_LENGTH_MUST_BE_MORE_THAN_8),
];

export const validateEditProfile = [
  body('avatarUrl') // Optional
    .if(body('avatarUrl').exists()) // IF the client included avatar_url, then validate it
    .not()
    .isEmpty()
    .withMessage(AVATAR_URL_IS_EMPTY)
    .bail()
    .escape()
    .ltrim()
    .rtrim()
    .isURL()
    .withMessage(AVATAR_URL_IS_INVALID),
  body('avatarType') // Optional
    .if(body('avatarType').exists()) // IF the client included avatar_type, then validate it
    .not()
    .isEmpty()
    .withMessage(AVATAR_TYPE_IS_EMPTY)
    .bail()
    .escape()
    .ltrim()
    .rtrim()
    .custom(value => {
      if (checkIfLettersOnly(value) === true) {
        return Promise.resolve();
      }
      return Promise.reject(AVATAR_TYPE_IS_INVALID);
    }),
  body('firstName') // Optional
    .if(body('firstName').exists()) // IF the client included first_name, then validate it
    .not()
    .isEmpty()
    .withMessage(FIRST_NAME_IS_EMPTY)
    .bail()
    .escape()
    .ltrim()
    .rtrim()
    .custom(value => {
      if (checkIfLettersOnly(value) === true) {
        return Promise.resolve();
      }
      return Promise.reject(FIRST_NAME_IS_INVALID);
    }),
  body('lastName') // Optional
    .if(body('lastName').exists()) // IF the client included lastName, then validate it
    .not()
    .isEmpty()
    .withMessage(LAST_NAME_IS_EMPTY)
    .bail()
    .escape()
    .ltrim()
    .rtrim()
    .custom(value => {
      if (checkIfLettersOnly(value) === true) {
        return Promise.resolve();
      }
      return Promise.reject(LAST_NAME_IS_INVALID);
    }),
  body('bio') // Optional
    .if(body('bio').exists()) // IF the client included bio, then validate it
    .escape()
    .ltrim()
    .rtrim()
    .isLength({ max: 160 })
    .withMessage(BIO_IS_TOO_LONG),
  body('major') // Optional
    .if(body('major').exists()) // IF the client included major, then validate it
    .not()
    .isEmpty()
    .withMessage(MAJOR_IS_EMPTY)
    .bail()
    .escape()
    .ltrim()
    .rtrim()
    .custom(value => {
      if (checkIfLettersOnly(value) === true) {
        return Promise.resolve();
      }
      return Promise.reject(MAJOR_IS_INVALID);
    }),
  body('minor') // Optional
    .if(body('minor').exists()) // IF the client included minor, then validate it
    .not()
    .isEmpty()
    .withMessage(MINOR_IS_EMPTY)
    .bail()
    .escape()
    .ltrim()
    .rtrim(),
  body('catalogYear') // Optional
    .if(body('catalogYear').exists()) // IF the client included catalog_year, then validate it
    .not()
    .isEmpty()
    .withMessage(CATALOG_YEAR_IS_EMPTY)
    .bail()
    .escape()
    .ltrim()
    .rtrim()
    .isNumeric()
    .withMessage(CATALOG_YEAR_IS_INVALID),
];

export const validateFetchProfile = [
  query('email') // Optional
    .if(query('email').exists()) // IF the client included email, then validate it
    .escape()
    .ltrim()
    .rtrim()
    .isBoolean()
    .withMessage(BOOLEAN_VALUES_ONLY)
    .bail()
    .toBoolean(),
  query('avatarUrl') // Optional
    .if(query('avatarUrl').exists()) // IF the client included avatarUrl, then validate it
    .escape()
    .ltrim()
    .rtrim()
    .isBoolean()
    .withMessage(BOOLEAN_VALUES_ONLY)
    .bail()
    .toBoolean(),
  query('avatarType') // Optional
    .if(query('avatarType').exists()) // IF the client included avatarType, then validate it
    .escape()
    .ltrim()
    .rtrim()
    .isBoolean()
    .withMessage(BOOLEAN_VALUES_ONLY)
    .bail()
    .toBoolean(),
  query('firstName') // Optional
    .if(query('firstName').exists()) // IF the client included firstName, then validate it
    .escape()
    .ltrim()
    .rtrim()
    .isBoolean()
    .withMessage(BOOLEAN_VALUES_ONLY)
    .bail()
    .toBoolean(),
  query('lastName') // Optional
    .if(query('lastName').exists()) // IF the client included lastName, then validate it
    .escape()
    .ltrim()
    .rtrim()
    .isBoolean()
    .withMessage(BOOLEAN_VALUES_ONLY)
    .bail()
    .toBoolean(),
  query('bio') // Optional
    .if(query('bio').exists()) // IF the client included bio, then validate it
    .escape()
    .ltrim()
    .rtrim()
    .isBoolean()
    .withMessage(BOOLEAN_VALUES_ONLY)
    .bail()
    .toBoolean(),
  query('major') // Optional
    .if(query('major').exists()) // IF the client included major, then validate it
    .escape()
    .ltrim()
    .rtrim()
    .isBoolean()
    .withMessage(BOOLEAN_VALUES_ONLY)
    .bail()
    .toBoolean(),
  query('minor') // Optional
    .if(query('minor').exists()) // IF the client included minor, then validate it
    .escape()
    .ltrim()
    .rtrim()
    .isBoolean()
    .withMessage(BOOLEAN_VALUES_ONLY)
    .bail()
    .toBoolean(),
  query('catalogYear') // Optional
    .if(query('catalogYear').exists()) // IF the client included catalogYear, then validate it
    .escape()
    .ltrim()
    .rtrim()
    .isBoolean()
    .withMessage(BOOLEAN_VALUES_ONLY)
    .bail()
    .toBoolean(),
  query('coursesTaken')
    .if(query('coursesTaken').exists())
    .escape()
    .ltrim()
    .rtrim()
    .isBoolean()
    .withMessage(BOOLEAN_VALUES_ONLY)
    .bail()
    .toBoolean(),
  query('gradDate')
    .if(query('gradDate').exists())
    .escape()
    .ltrim()
    .rtrim()
    .isBoolean()
    .withMessage(BOOLEAN_VALUES_ONLY)
    .bail()
    .toBoolean(),
];

export const validateFetchCoursesTaken = [
  query('_id')
    .exists()
    .withMessage(USER_ID_IS_EMPTY)
    .not()
    .isEmpty()
    .isHexadecimal()
    .withMessage(ID_IS_INVALID)
    .bail()
    .isLength({ min: 24, max: 24 })
    .withMessage(ID_IS_INVALID),
];
