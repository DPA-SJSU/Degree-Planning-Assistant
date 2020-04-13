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
 * Create a new Requirement if not exist, otherwise update
 */
requirementController.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  requirementValidate,
  (req, res) => {
    validationHandler(req, res, () => {
      const { school, type, area, courses } = req.body;
      createOrGetAllCourse({ ...req.body, codes: courses })
        .then(foundCourses => {
          Requirement.findOneAndUpdate(
            { school, type, area },
            { ...req.body, courses: foundCourses.map(course => course._id) },
            { new: true, upsert: true },
            (err, newRequirement) => {
              if (err)
                generateServerErrorCode(
                  res,
                  500,
                  err,
                  FAILED_TO_UPDATE_REQUIREMENT
                );
              Requirement.findById(newRequirement._id)
                .populate('courses')
                .then(foundRequirement =>
                  res.status(200).json(foundRequirement)
                );
            }
          );
        })
        .catch(e =>
          generateServerErrorCode(res, 500, e, FAILED_TO_CREATE_COURSE)
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
    const courseObject = courses.map(course => {
      return { code: course, school, type, area };
    });
    createOrGetAllCourse(courseObject)
      .then(foundCourses => {
        Requirement.findOneAndUpdate(
          { school, type, area },
          { ...requirement, courses: foundCourses.map(course => course._id) },
          { new: true, upsert: true },
          (err, newRequirement) => {
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
  });
  Requirement.find({}).then(result => {
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
