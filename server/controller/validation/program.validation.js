import { body, query } from 'express-validator';

import {
  SCHOOL_FIELD_IS_REQUIRED,
  SCHOOL_FIELD_IS_EMPTY,
  SCHOOL_FIELD_CONTAINS_FORBIDDEN_CHARACTERS,
  MAJOR_FIELD_IS_REQUIRED,
  MAJOR_FIELD_IS_EMPTY,
  MAJOR_FIELD_CONTAINS_FORBIDDEN_CHARACTERS,
  CATALOGYEAR_IS_REQUIRED,
  CATALOGYEAR_IS_EMPTY,
  CATALOGYEAR_CONTAINS_FORBIDDEN_CHARACTERS,
  REQUIREMENTOBJECT_IS_REQUIRED,
  REQUIREMENTOBJECT_NOT_AN_OBJECT,
  REQUIREMENTOBJECT_IS_EMPTY,
  REQUIREMENTOBJECT_INCORRECT_STRUCTURE,
  ID_IS_INVALID,
  ID_IS_REQUIRED,
} from '../constant';

/* Utility functions */
const checkIfLettersOnly = str => {
  const regExp = new RegExp(/^([a-z]|[A-Z]|\s)+$/, 'g');
  return regExp.test(str);
};

// VALIDATION FOR CREATE DEGREE PROGRAM
export const validateCreateDegreeProgram = [
  body(['school', 'major', 'catalogYear'])
    .unescape()
    .ltrim()
    .rtrim(),
  body('school')
    .exists()
    .withMessage(SCHOOL_FIELD_IS_REQUIRED)
    .bail()
    .not()
    .isEmpty()
    .withMessage(SCHOOL_FIELD_IS_EMPTY)
    .bail()
    .custom(value => {
      if (checkIfLettersOnly(value) === true) {
        return Promise.resolve();
      }
      return Promise.reject(SCHOOL_FIELD_CONTAINS_FORBIDDEN_CHARACTERS);
    }),
  body('major')
    .exists()
    .withMessage(MAJOR_FIELD_IS_REQUIRED)
    .bail()
    .not()
    .isEmpty()
    .withMessage(MAJOR_FIELD_IS_EMPTY)
    .bail()
    .custom(value => {
      if (checkIfLettersOnly(value) === true) {
        return Promise.resolve();
      }
      return Promise.reject(MAJOR_FIELD_CONTAINS_FORBIDDEN_CHARACTERS);
    }),
  body('catalogYear')
    .exists()
    .withMessage(CATALOGYEAR_IS_REQUIRED)
    .bail()
    .not()
    .isEmpty()
    .withMessage(CATALOGYEAR_IS_EMPTY)
    .bail()
    .isNumeric()
    .isInt()
    .withMessage(CATALOGYEAR_CONTAINS_FORBIDDEN_CHARACTERS),
];

export const validateObjStructure = (obj, errArr, optional) => {
  const errorObjectFactory = msg => {
    return {
      value: obj,
      msg,
      param: '',
      location: 'body',
    };
  };

  if (!obj && optional === true) {
    return;
  } else if (!obj && optional === false) {
    errArr.push(errorObjectFactory(REQUIREMENTOBJECT_IS_REQUIRED));
  } else if (obj.constructor !== Object) {
    errArr.push(errorObjectFactory(REQUIREMENTOBJECT_NOT_AN_OBJECT));
  } else if (Object.keys(obj).length === 0) {
    errArr.push(errorObjectFactory(REQUIREMENTOBJECT_IS_EMPTY));
  } else {
    for (const property in obj) {
      if (obj[property].constructor === Object) {
        for (const innerProperty in obj[property]) {
          if (obj[property][innerProperty].constructor !== Array) {
            errArr.push(
              errorObjectFactory(REQUIREMENTOBJECT_INCORRECT_STRUCTURE)
            );
          }
        }
      } else if (obj[property].constructor !== Array) {
        errArr.push(errorObjectFactory(REQUIREMENTOBJECT_INCORRECT_STRUCTURE));
      }
    }
  }
};

// VALIDATION FOR FETCHING DEGREE PROGRAM
export const validateFetchDegreeProgram = [
  query('school')
    .if(query('school').exists())
    .not()
    .isEmpty()
    .withMessage(SCHOOL_FIELD_IS_EMPTY)
    .bail()
    .custom(value => {
      if (checkIfLettersOnly(value) === true) {
        return Promise.resolve();
      }
      return Promise.reject(SCHOOL_FIELD_CONTAINS_FORBIDDEN_CHARACTERS);
    })
    .unescape()
    .ltrim()
    .rtrim(),
  query('major')
    .if(query('major').exists())
    .not()
    .isEmpty()
    .withMessage(MAJOR_FIELD_IS_EMPTY)
    .bail()
    .custom(value => {
      if (checkIfLettersOnly(value) === true) {
        return Promise.resolve();
      }
      return Promise.reject(MAJOR_FIELD_CONTAINS_FORBIDDEN_CHARACTERS);
    })
    .unescape()
    .ltrim()
    .rtrim(),
  query('catalogYear')
    .if(query('catalogYear').exists())
    .not()
    .isEmpty()
    .withMessage(CATALOGYEAR_IS_EMPTY)
    .bail()
    .isNumeric()
    .isInt()
    .withMessage(CATALOGYEAR_CONTAINS_FORBIDDEN_CHARACTERS)
    .unescape()
    .ltrim()
    .rtrim(),
  query('id')
    .if(query('id').exists())
    .not()
    .isEmpty()
    .isHexadecimal()
    .withMessage(ID_IS_INVALID)
    .bail()
    .isLength({ min: 24, max: 24 })
    .withMessage(ID_IS_INVALID)
    .unescape()
    .ltrim()
    .rtrim(),
];

// VALIDATION FOR EDITING DEGREE PROGRAM BY PARAMETERS
export const validateUpdateDegreeProgramByParam = [
  body([
    'school',
    'major',
    'catalogYear',
    'id',
    'newSchool',
    'newMajor',
    'newCatalogYear',
  ])
    .unescape()
    .ltrim()
    .rtrim(),
  body('school')
    .if(
      body('id')
        .not()
        .exists()
    )
    .exists()
    .withMessage(SCHOOL_FIELD_IS_REQUIRED)
    .bail()
    .not()
    .isEmpty()
    .withMessage(SCHOOL_FIELD_IS_EMPTY)
    .bail()
    .custom(value => {
      if (checkIfLettersOnly(value) === true) {
        return Promise.resolve();
      }
      return Promise.reject(SCHOOL_FIELD_CONTAINS_FORBIDDEN_CHARACTERS);
    }),
  body('major')
    .if(
      body('id')
        .not()
        .exists()
    )
    .exists()
    .withMessage(MAJOR_FIELD_IS_REQUIRED)
    .bail()
    .not()
    .isEmpty()
    .withMessage(MAJOR_FIELD_IS_EMPTY)
    .bail()
    .custom(value => {
      if (checkIfLettersOnly(value) === true) {
        return Promise.resolve();
      }
      return Promise.reject(MAJOR_FIELD_CONTAINS_FORBIDDEN_CHARACTERS);
    }),
  body('catalogYear')
    .if(
      body('id')
        .not()
        .exists()
    )
    .exists()
    .withMessage(CATALOGYEAR_IS_REQUIRED)
    .bail()
    .not()
    .isEmpty()
    .withMessage(CATALOGYEAR_IS_EMPTY)
    .bail()
    .isNumeric()
    .isInt()
    .withMessage(CATALOGYEAR_CONTAINS_FORBIDDEN_CHARACTERS),
  body('newSchool')
    .if(body('newSchool').exists())
    .not()
    .isEmpty()
    .withMessage(SCHOOL_FIELD_IS_EMPTY)
    .bail()
    .custom(value => {
      if (checkIfLettersOnly(value) === true) {
        return Promise.resolve();
      }
      return Promise.reject(SCHOOL_FIELD_CONTAINS_FORBIDDEN_CHARACTERS);
    }),
  body('newMajor')
    .if(body('newMajor').exists())
    .not()
    .isEmpty()
    .withMessage(MAJOR_FIELD_IS_EMPTY)
    .bail()
    .custom(value => {
      if (checkIfLettersOnly(value) === true) {
        return Promise.resolve();
      }
      return Promise.reject(MAJOR_FIELD_CONTAINS_FORBIDDEN_CHARACTERS);
    }),
  body('newCatalogYear')
    .if(body('newCatalogYear').exists())
    .not()
    .isEmpty()
    .withMessage(CATALOGYEAR_IS_EMPTY)
    .bail()
    .isNumeric()
    .isInt()
    .withMessage(CATALOGYEAR_CONTAINS_FORBIDDEN_CHARACTERS),
];

// VALIDATING UPDATING DEGREE PROGRAMS BY ID
export const validateUpdateDegreeProgramById = [
  body(['id', 'school', 'major', 'catalogYear'])
    .unescape()
    .ltrim()
    .rtrim(),
  body('id')
    .exists()
    .withMessage(ID_IS_REQUIRED)
    .bail()
    .not()
    .isEmpty()
    .isHexadecimal()
    .withMessage(ID_IS_INVALID)
    .bail()
    .isLength({ min: 24, max: 24 })
    .withMessage(ID_IS_INVALID),
  body('school')
    .if(body('school').exists())
    .not()
    .isEmpty()
    .withMessage(SCHOOL_FIELD_IS_EMPTY)
    .bail()
    .custom(value => {
      if (checkIfLettersOnly(value) === true) {
        return Promise.resolve();
      }
      return Promise.reject(SCHOOL_FIELD_CONTAINS_FORBIDDEN_CHARACTERS);
    }),
  body('major')
    .if(body('major').exists())
    .not()
    .isEmpty()
    .withMessage(MAJOR_FIELD_IS_EMPTY)
    .bail()
    .custom(value => {
      if (checkIfLettersOnly(value) === true) {
        return Promise.resolve();
      }
      return Promise.reject(MAJOR_FIELD_CONTAINS_FORBIDDEN_CHARACTERS);
    }),
  body('catalogYear')
    .if(body('catalogYear').exists())
    .not()
    .isEmpty()
    .withMessage(CATALOGYEAR_IS_EMPTY)
    .bail()
    .isNumeric()
    .isInt()
    .withMessage(CATALOGYEAR_CONTAINS_FORBIDDEN_CHARACTERS),
];

// VALIDATING DELETING DEGREE PROGRAMS
export const validateDeleteDegreeProgram = [
  body(['id', 'school', 'major', 'catalogYear'])
    .unescape()
    .ltrim()
    .rtrim(),
  body('id')
    .if(
      body('school')
        .not()
        .exists()
    )
    .if(
      body('major')
        .not()
        .exists()
    )
    .if(
      body('catalogYear')
        .not()
        .exists()
    )
    .not()
    .isEmpty()
    .isHexadecimal()
    .withMessage(ID_IS_INVALID)
    .bail()
    .isLength({ min: 24, max: 24 })
    .withMessage(ID_IS_INVALID),
  body('school')
    .if(
      body('id')
        .not()
        .exists()
    )
    .not()
    .isEmpty()
    .withMessage(SCHOOL_FIELD_IS_EMPTY)
    .bail()
    .custom(value => {
      if (checkIfLettersOnly(value) === true) {
        return Promise.resolve();
      }
      return Promise.reject(SCHOOL_FIELD_CONTAINS_FORBIDDEN_CHARACTERS);
    }),
  body('major')
    .if(
      body('id')
        .not()
        .exists()
    )
    .not()
    .isEmpty()
    .withMessage(MAJOR_FIELD_IS_EMPTY)
    .bail()
    .custom(value => {
      if (checkIfLettersOnly(value) === true) {
        return Promise.resolve();
      }
      return Promise.reject(MAJOR_FIELD_CONTAINS_FORBIDDEN_CHARACTERS);
    }),
  body('catalogYear')
    .if(
      body('id')
        .not()
        .exists()
    )
    .not()
    .isEmpty()
    .withMessage(CATALOGYEAR_IS_EMPTY)
    .bail()
    .isNumeric()
    .isInt()
    .withMessage(CATALOGYEAR_CONTAINS_FORBIDDEN_CHARACTERS),
];
