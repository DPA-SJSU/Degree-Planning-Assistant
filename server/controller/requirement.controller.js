/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
import express from 'express';
import passport from 'passport';

import { Requirement } from '../database/models';

import {
  generateServerErrorCode,
  validationHandler,
  createOrGetAllCourse,
} from '../store/utils';

import {
  FAILED_TO_CREATE_COURSE,
  FAILED_TO_UPDATE_REQUIREMENT,
  FAILED_TO_DELETE_REQUIREMENT,
} from './constant';

import requirementValidate from './validation/requirement.validation';

const requirementController = express.Router();

/**
 * POST/
 * Create all new requirements if not exist, otherwise update
 */
requirementController.post('/', async (req, res) => {
  for (const requirement of req.body) {
    const { school, type, area, courses, requiredCredit } = requirement;
    const courseObject = courses.map(course => {
      return { code: course, school, type, area };
    });
    await createOrGetAllCourse(courseObject)
      .then(foundCourses => {
        Requirement.findOneAndUpdate(
          { school, type, area },
          {
            school,
            type,
            area,
            requiredCredit,
            courses: foundCourses.map(course => course._id),
          },
          { upsert: true },
          (err, requirement) => {
            // console.log(requirement);
            if (err)
              generateServerErrorCode(
                res,
                500,
                err,
                FAILED_TO_UPDATE_REQUIREMENT
              );
          }
        );
      })
      .catch(e =>
        generateServerErrorCode(res, 500, e, FAILED_TO_CREATE_COURSE)
      );
  }

  await Requirement.find({}).then(result => {
    res.status(200).json({ ...result });
  });
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
      if (err)
        generateServerErrorCode(res, 500, err, FAILED_TO_DELETE_REQUIREMENT);
      else res.status(200).json(result);
    });
  }
);

export default requirementController;
