/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-underscore-dangle */
import express from 'express';
import passport from 'passport';
import lodash from 'lodash';
import { check } from 'express-validator';

import { Course, Requirement } from '../database/models';
import {
  generateServerErrorCode,
  validationHandler,
  checkAllowedKeys,
} from '../store/utils';

import {
  SOME_THING_WENT_WRONG,
  REQUIREMENT_EXISTS_ALREADY,
  REQUIREMENT_TYPE_IS_INVALID,
  REQUIREMENT_AREA_IS_INVALID,
  KEY_IS_INVALID,
  REQUIREMENT_NAME_IS_INVALID,
  REQUIREMENT_SCHOOL_IS_INVALID,
  REQUIREMENT_MAJOR_IS_INVALID,
  REQUIREMENT_REQUIRED_CREDIT_IS_INVALID,
  REQUIREMENT_COURSES_IS_INVALID,
} from './constant';
import courseController from './course.controller';

const requirementController = express.Router();

const requirementValidate = [
  check('body').custom((body, { req }) => {
    const newRequirementInfo = req.body;
    const newRequirementInfoKeys = Object.keys(newRequirementInfo);
    const allowedKeys = [
      'type',
      'area',
      'name',
      'school',
      'major',
      'requiredCredit',
      'courses',
    ];
    if (!checkAllowedKeys(allowedKeys, newRequirementInfoKeys)) {
      throw new Error(KEY_IS_INVALID);
    }

    return Promise.resolve({ req });
  }),

  check('type').custom((type, { req }) => {
    if (type && !lodash.isNumber(type)) {
      throw new Error(REQUIREMENT_TYPE_IS_INVALID);
    }
    return Promise.resolve({ req });
  }),
  check('area').custom((area, { req }) => {
    if (area && !lodash.isString(area)) {
      throw new Error(REQUIREMENT_AREA_IS_INVALID);
    }
    return Promise.resolve({ req });
  }),
  check('name').custom((name, { req }) => {
    if (name && !lodash.isString(name)) {
      throw new Error(REQUIREMENT_NAME_IS_INVALID);
    }
    return Promise.resolve({ req });
  }),
  check('school').custom((school, { req }) => {
    if (school && !lodash.isString(school)) {
      throw new Error(REQUIREMENT_SCHOOL_IS_INVALID);
    }
    return Promise.resolve({ req });
  }),
  check('major').custom((major, { req }) => {
    if (major && !lodash.isString(major)) {
      throw new Error(REQUIREMENT_MAJOR_IS_INVALID);
    }
    return Promise.resolve({ req });
  }),
  check('requiredCredit').custom((requiredCredit, { req }) => {
    if (requiredCredit && !lodash.isNumber(requiredCredit)) {
      throw new Error(REQUIREMENT_REQUIRED_CREDIT_IS_INVALID);
    }
    return Promise.resolve({ req });
  }),
  check('courses').custom((courses, { req }) => {
    if (courses && !lodash.isArray(courses)) {
      throw new Error(REQUIREMENT_COURSES_IS_INVALID);
    }
    return Promise.resolve({ req });
  }),
];

/**
 * ============================================
 * Starting APIs for Requirement
 * ============================================
 */

/**
 * POST/
 * Create a new Requirement if not exist, otherwise update
 */
requirementController.post(
  '/',
  // passport.authenticate('jwt', { session: false }),
  requirementValidate,
  (req, res) => {
    validationHandler(req, res, () => {
      const { school, type, area, courses } = req.body;
      courseController
        .createOrGetAllCourseId({ ...req.body, codes: courses })
        .then(coursesId => {
          Requirement.findOneAndUpdate(
            { school, type, area },
            { ...req.body, courses: coursesId },
            { new: true, upsert: true },
            (err, newRequirement) => {
              if (err)
                generateServerErrorCode(res, 500, err, SOME_THING_WENT_WRONG);
              Requirement.findById(newRequirement._id)
                .populate('courses')
                .then(foundRequirement =>
                  res.status(200).json(foundRequirement)
                );
            }
          );
        })
        .catch(e =>
          generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG)
        );
    });
  }
);

/**
 * POST/
 * Create all new requirements if not exist, otherwise update
 */
requirementController.post('/all', (req, res) => {
  req.body.forEach(requirement => {
    const { school, type, area, courses } = requirement;
    courseController
      .createOrGetAllCourseId({ ...requirement, codes: courses })
      .then(coursesId => {
        Requirement.findOneAndUpdate(
          { school, type, area },
          { ...requirement, courses: coursesId },
          { new: true, upsert: true },
          (err, newRequirement) => {
            if (err)
              generateServerErrorCode(res, 500, err, SOME_THING_WENT_WRONG);
          }
        );
      });
  });

  res
    .status(200)
    .json('successful update all requirements for Software Engineering');
});

/**
 * DELETE/
 * IMPORTANT: Only call this one With ENV=dev
 * Delete all courses
 */
requirementController.delete(
  '/all',
  // passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Requirement.deleteMany({}, (err, result) => {
      if (err) generateServerErrorCode(res, 500, err, SOME_THING_WENT_WRONG);
      else res.status(200).json(result);
    });
  }
);

export default requirementController;
