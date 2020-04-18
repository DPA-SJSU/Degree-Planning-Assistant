import express from 'express';
import passport from 'passport';
import { Course } from '../database/models';

import {
  generateServerErrorCode,
  removeUndefinedObjectProps,
  isObjectEmpty,
  validationHandler,
  createOrGetOneCourse,
  getPopulatedCourse,
} from '../store/utils';

import {
  COURSE_EXISTS_ALREADY,
  COURSE_DOES_NOT_EXIST,
  SOME_THING_WENT_WRONG,
  NO_DATA_TO_UPDATE,
  FAILED_TO_CREATE_COURSE,
} from './constant';

import {
  validateCourseCreation,
  validateSingleCourse,
  validateSchoolCourses,
  validateCourseQuery,
  validateCourseId,
} from './validation/course.validation';

const courseController = express.Router();

/**
 * POST/
 * Create a new course, requires authentication of user
 */
courseController.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  validateCourseCreation,
  (req, res) => {
    validationHandler(req, res, () => {
      const { school, code } = req.body;
      Course.findOne({ school, code })
        .then(foundCourse => {
          if (!foundCourse)
            createOrGetOneCourse({ school, code }, 'NONE_EMPTY')
              .then(createdCourse => res.status(200).json(createdCourse))
              .catch(e =>
                generateServerErrorCode(
                  res,
                  403,
                  e,
                  FAILED_TO_CREATE_COURSE,
                  'course'
                )
              );
        })
        .catch(e =>
          generateServerErrorCode(res, 403, e, COURSE_EXISTS_ALREADY, 'course')
        );
    });
  }
);

/**
 * GET/
 * Get a course using ObjectId through query
 */
courseController.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  validateCourseQuery,
  (req, res) => {
    validationHandler(req, res, () => {
      const { _id, school, department, code } = req.query;
      getPopulatedCourse(
        {
          ...(_id && { _id }),
          ...(school && { school: school.toUpperCase() }),
          ...(department && { department: department.toUpperCase() }),
          ...(code && { code }),
        },
        res
      );
    });
  }
);

/**
 * PUT/
 * Update a course using ObjectId through query
 */
courseController.put(
  '/',
  passport.authenticate('jwt', { session: false }),
  validateCourseId,
  (req, res) => {
    validationHandler(req, res, async () => {
      const { _id } = req.query;
      const updateData = removeUndefinedObjectProps(req.body);

      if (isObjectEmpty(updateData))
        res.status(400).json({ error: NO_DATA_TO_UPDATE });
      else {
        Course.findByIdAndUpdate(
          { _id },
          updateData,
          { useFindAndModify: false, new: true },
          (err, updatedCourse) => {
            if (err)
              generateServerErrorCode(
                res,
                403,
                'update course error',
                COURSE_DOES_NOT_EXIST,
                'course'
              );
            else res.status(200).json(updatedCourse);
          }
        );
      }
    });
  }
);

/**
 * DELETE/
 * Delete a course using ObjectId through query
 * IMPORTANT: calling this might affect other courses, which include the deleted courses as a pre/corequisite.
 */
courseController.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  validateCourseId,
  async (req, res) => {
    try {
      const { _id } = req.query;

      await Course.findByIdAndDelete({ _id }, (err, result) => {
        if (err)
          generateServerErrorCode(
            res,
            403,
            'delete course error',
            COURSE_DOES_NOT_EXIST,
            'course'
          );
        else res.status(200).json({ message: 'deleted a course', result });
      });
    } catch (e) {
      generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
    }
  }
);

/**
 * DELETE/
 * IMPORTANT: Only call this one With ENV=dev
 * Delete all courses
 */
courseController.delete(
  '/all',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Course.deleteMany({}, (err, result) => {
      if (err) generateServerErrorCode(res, 500, err, SOME_THING_WENT_WRONG);
      else res.status(200).json(result);
    });
  }
);

export default courseController;
