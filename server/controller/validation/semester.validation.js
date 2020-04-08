import { check, query } from 'express-validator';

import {
  SEMESTER_TERM_IS_EMPTY,
  SEMESTER_YEAR_IS_EMPTY,
  SEMESTER_COURSES_ARE_EMPTY,
  SEMESTER_ID_IS_EMPTY,
  ID_IS_INVALID,
  YEAR_CONTAINS_FORBIDDEN_CHARACTERS,
} from '../constant';

export const validateCreateOneSemester = [
  check('term')
    .exists()
    .withMessage(SEMESTER_TERM_IS_EMPTY),
  check('year')
    .exists()
    .withMessage(SEMESTER_YEAR_IS_EMPTY)
    .bail()
    .isNumeric()
    .isInt()
    .withMessage(YEAR_CONTAINS_FORBIDDEN_CHARACTERS),
  check('courses')
    .exists()
    .withMessage(SEMESTER_COURSES_ARE_EMPTY),
];

export const validateSemesterId = [
  query('_id')
    .exists()
    .withMessage(SEMESTER_ID_IS_EMPTY)
    .not()
    .isEmpty()
    .isHexadecimal()
    .withMessage(ID_IS_INVALID)
    .bail()
    .isLength({ min: 24, max: 24 })
    .withMessage(ID_IS_INVALID),
];
