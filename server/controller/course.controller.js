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
  createOrGetAllCourse,
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
 * Create/Update a course/ a list of courses
 */
courseController.post(
  '/',
  // passport.authenticate('jwt', { session: false }),
  // validateCourseCreation,
  (req, res) => {
    validationHandler(req, res, async () => {
      for (const course of req.body) {
        const { _id, fullCourseCode, prerequisites, corequisites } = course;

        const splitCourseString = fullCourseCode.split(' ');
        const department = splitCourseString[0];
        const code = splitCourseString[1].replace(/^0+/, '');

        if (prerequisites && corequisites) {
          [course.prerequisites, course.corequisites] = await Promise.all([
            createOrGetAllCourse(prerequisites),
            createOrGetAllCourse(corequisites),
          ]);
          course.prerequisites = course.prerequisites.map(el => el._id);
          course.corequisites = course.corequisites.map(el => el._id);
        }

        await Course.findOneAndUpdate(
          {
            ...(_id && { _id }),
            ...(department && { department: department.toUpperCase() }),
            ...(code && { code }),
          },
          course,
          { new: true, upsert: true }
        )
          .then(updatedCourse => {
            console.log(updatedCourse.department + updatedCourse.code);
          })
          .catch(e =>
            generateServerErrorCode(
              res,
              403,
              e,
              FAILED_TO_CREATE_COURSE,
              'course'
            )
          );
      }
    });
    res.status(200).json('DONE');
  }
);

/**
 * GET/
 * Get a course using ObjectId through query
 */
courseController.get(
  '/',
  // passport.authenticate('jwt', { session: false }),
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
