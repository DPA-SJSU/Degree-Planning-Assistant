import { check, query } from 'express-validator';
import {
  COURSE_SCHOOL_IS_EMPTY,
  COURSE_CODE_IS_EMPTY,
  DOES_NOT_CONTAIN_A_DIGIT,
  COURSE_TITLE_IS_EMPTY,
  COURSE_DESCRIPTION_IS_EMPTY,
  COURSE_TERMS_OFFERED_IS_EMPTY,
  COURSE_ID_IS_EMPTY,
  ID_IS_INVALID,
} from '../constant';

export const validateCourseCreation = [
  check('school')
    .exists()
    .withMessage(COURSE_SCHOOL_IS_EMPTY),
  check('code')
    .exists()
    .withMessage(COURSE_CODE_IS_EMPTY),
  check('title')
    .exists()
    .withMessage(COURSE_TITLE_IS_EMPTY),
  check('description')
    .exists()
    .withMessage(COURSE_DESCRIPTION_IS_EMPTY),
  check('termsOffered')
    .exists()
    .withMessage(COURSE_TERMS_OFFERED_IS_EMPTY),
];

export const validateSingleCourse = [
  check('school')
    .exists()
    .withMessage(COURSE_SCHOOL_IS_EMPTY),
  check('code')
    .exists()
    .withMessage(COURSE_CODE_IS_EMPTY)
    .matches(/\d/)
    .withMessage(DOES_NOT_CONTAIN_A_DIGIT),
];

export const validateSchoolCourses = [
  check('school')
    .exists()
    .withMessage(COURSE_SCHOOL_IS_EMPTY),
];

export const validateCourseId = [
  query('courseId')
    .exists()
    .withMessage(COURSE_ID_IS_EMPTY)
    .not()
    .isEmpty()
    .isHexadecimal()
    .withMessage(ID_IS_INVALID)
    .bail()
    .isLength({ min: 24, max: 24 })
    .withMessage(ID_IS_INVALID),
];
