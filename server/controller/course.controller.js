/* eslint-disable no-underscore-dangle */
import express from 'express';
import passport from 'passport';
import { Course } from '../database/models';

import {
  generateServerErrorCode,
  removeUndefinedObjectProps,
  isObjectEmpty,
  validationHandler,
} from '../store/utils';

import {
  COURSE_EXISTS_ALREADY,
  COURSE_DOES_NOT_EXIST,
  SOME_THING_WENT_WRONG,
  NO_DATA_TO_UPDATE,
  SCHOOL_DOES_NOT_EXIST,
} from './constant';

import {
  validateCourseCreation,
  validateSingleCourse,
  validateSchoolCourses,
  validateCourseId,
} from './validation/course.validation';

const courseController = express.Router();
const { ObjectId } = require('mongoose').Types;

/**
 * POST/
 * Create a new course, requires authentication of user
 */
courseController.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  validateCourseCreation,
  async (req, res) => {
    validationHandler(req, res, async () => {
      try {
        const { school, code } = req.body;
        await Course.findOne({ school, code }, (err, foundCourse) => {
          if (!foundCourse)
            courseController
              .createCourse({ school, code }, 'NEW_COURSE')
              .then(createdCourse => {
                return res.status(200).json(createdCourse);
              });
          return generateServerErrorCode(
            res,
            403,
            'course creation error',
            COURSE_EXISTS_ALREADY,
            'school, code'
          );
        });
      } catch (e) {
        generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
      }
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
  validateCourseId,
  async (req, res) => {
    validationHandler(req, res, () => {
      const { _id } = req.query;
      courseController.retrieveCourseWithOption({ _id });
    });
  }
);

/**
 * GET/
 * Get a course using school and code through params
 */
courseController.get(
  '/:school/:code',
  passport.authenticate('jwt', { session: false }),
  validateSingleCourse,
  async (req, res) => {
    return validationHandler(req, res, () => {
      const { code } = req.params;
      const school = req.params.school.toUpperCase();

      courseController.retrieveCourseWithOption({ school, code }, res);
    });
  }
);

/**
 * GET/
 * Get all courses using school through params
 */
courseController.get(
  '/:school',
  passport.authenticate('jwt', { session: false }),
  validateSchoolCourses,
  (req, res) => {
    return validationHandler(
      req,
      res,
      courseController.retrieveCourseWithOption(
        { school: req.params.school.toUpperCase() },
        res
      )
    );
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
        return res.status(400).json({ error: NO_DATA_TO_UPDATE });

      return Course.findByIdAndUpdate(
        { _id },
        updateData,
        { useFindAndModify: false, new: true },
        (err, updatedCourse) => {
          if (err) {
            return generateServerErrorCode(
              res,
              403,
              'update course error',
              COURSE_DOES_NOT_EXIST,
              'course_id'
            );
          }
          return res.status(200).json(updatedCourse);
        }
      );
    });
  }
);

/**
 * DELETE/
 * Delete a course using ObjectId through query
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
          return generateServerErrorCode(
            res,
            403,
            'delete course error',
            COURSE_DOES_NOT_EXIST,
            'courseId'
          );
        return res.status(200).json({ message: 'deleted a course', result });
      });
    } catch (e) {
      generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
    }
  }
);

/**
 * DELETE/
 * Delete everything!
 */
courseController.delete(
  '/all',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    Course.deleteMany({}, (err, result) => {
      if (err) {
        return res.status(500).json({ err });
      }
      return res.status(200).json({ message: `deleted all courses ${result}` });
    });
  }
);

/**
 * Get the ObjectId of a course based on school (schl) and course code
 * Or initialize a new course and retrieve the ObjectId
 * @param {String} school
 * @param {String} code
 * @returns {ObjectId} ObjectId
 */
courseController.getObjectId = async (school, code) => {
  try {
    const course = await Course.findOne({
      school,
      code,
    });

    if (!course) {
      const createdCourse = await courseController.createCourse(school, code);
      return new ObjectId(createdCourse._id);
    }
    return new ObjectId(course._id);
  } catch (e) {
    console.log('getObjectId() Error: ', e);
    return e;
  }
};

/**
 * Loop though an array of Courses to get the ObjectId of each
 * @param {String} school
 * @param {[String]} codes
 * @returns {[ObjectId]} [ObjectId]
 */
courseController.getAllCourseId = (school, codes) => {
  try {
    const coursesWithIds = [];
    codes.forEach(async code => {
      const objId = await courseController.getObjectId(school, code);
      coursesWithIds.push(objId);
    });
    return coursesWithIds;
  } catch (e) {
    console.log('getAllCourseId() Error: ', e);
    return e;
  }
};

/**
 * Creates a new Course with correct reference to ObjectId of prerequisites and corequisites
 * @param {} data
 * @returns {Course} Course
 */
courseController.createCourse = async (data, option = 'EMPTY') => {
  try {
    let course = data;
    if (option === 'EMPTY') {
      course = {
        school: data.school,
        code: data.code,
      };
    } else {
      course.prerequisites = await courseController.getAllCourseId(
        data.school,
        data.prerequisites
      );
      course.corequisites = await courseController.getAllCourseId(
        data.school,
        data.corequisites
      );
    }

    return new Course(course).save();
  } catch (e) {
    return e;
  }
};

courseController.retrieveCourseWithOption = (options, res) => {
  try {
    return Course.find(options)
      .populate('prerequisites corequisites')
      .then(foundCourse => {
        if (foundCourse) return res.status(200).json(foundCourse);
        return generateServerErrorCode(
          res,
          403,
          'school courses retrieval error',
          SCHOOL_DOES_NOT_EXIST,
          'school, code'
        );
      });
  } catch (e) {
    return generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
  }
};

export default courseController;
