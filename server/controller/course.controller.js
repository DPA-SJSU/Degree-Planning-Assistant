/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
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
  FAILED_TO_CREATE_COURSE,
} from './constant';

import {
  validateCourseCreation,
  validateSingleCourse,
  validateSchoolCourses,
  validateCourseId,
} from './validation/course.validation';

const courseController = express.Router();

/**
 * Loop though an array of Courses to get the ObjectId of each
 * @param {[String]} codes Array of codes
 * @returns {ObjectId}
 */
courseController.createOrGetAllCourseId = courseList => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const coursesWithIds = [];
    const { codes, school, type, area } = courseList;

    const createOrGetOneCourse = codes.map(code => {
      return courseController.createOrGetOneCourse({
        school,
        type,
        code,
        area,
        title: code.title || ' ',
      });
    });

    const results = await Promise.all(createOrGetOneCourse);
    results.forEach(course => coursesWithIds.push(course._id));
    resolve(coursesWithIds);
  });
};

/**
 * Creates a new Course with correct reference to ObjectId of prerequisites and corequisites
 * @param {courseInfo} data
 * @returns {Course} Course
 */
courseController.createOrGetOneCourse = async (data, option = 'EMPTY') => {
  return new Promise((resolve, reject) => {
    let course = data;

    const { school = 'SJSU', code, type, area } = course;

    const splitCourseString = code.split(' ');
    const department = splitCourseString[0];
    const courseCode = splitCourseString[1].replace(/^0+/, '');

    Course.findOne({ school, department, code: courseCode })
      .then(async foundCourse => {
        if (foundCourse) return resolve(foundCourse);

        console.log(
          'course not found',
          school,
          department,
          courseCode,
          type,
          area
        );
        if (option === 'EMPTY')
          course = {
            ...data,
            department,
            code: courseCode,
            requirementType: type,
          };
        else {
          const tasks = [
            courseController.createOrGetAllCourseId({
              ...course,
              codes: data.prerequisites,
            }),
            courseController.createOrGetAllCourseId({
              ...course,
              codes: data.corequisites,
            }),
          ];
          const [preList, coList] = await Promise.all(tasks);
          course.prerequisites = preList;
          course.corequisites = coList;
        }
        return resolve(new Course(course).save());
      })
      .catch(e => reject(e));
  });
};

/**
 * @param {Object} options
 */
courseController.getPopulatedCourse = (options, res) => {
  Course.find(options)
    .populate('prerequisites corequisites')
    .then(foundCourse => {
      if (foundCourse) res.status(200).json(foundCourse);
      else
        generateServerErrorCode(
          res,
          403,
          `school doesn't exist`,
          SCHOOL_DOES_NOT_EXIST,
          'school'
        );
    });
};

/**
 * ============================================
 * Starting APIs for Course
 * ============================================
 */

/**
 * Loop though an array of Courses to get the ObjectId of each
 * @param {String} school
 * @param {[String]} codes
 * @returns {[ObjectId]} [ObjectId]
 */
courseController.getAllCourseId = async (school, codes) => {
  try {
    const coursesWithIds = [];
    await codes.forEach(code => {
      Course.findOne({ school, code }, async foundCourse => {
        let id;
        if (!foundCourse) {
          const createdCourse = await courseController.createCourse({
            school,
            code,
          });
          id = new ObjectId(createdCourse._id);
        } else id = new ObjectId(foundCourse._id);
        coursesWithIds.push(id);
      });
    });
    return coursesWithIds;
  } catch (e) {
    return e;
  }
};

/**
 * Creates a new Course with correct reference to ObjectId of prerequisites and corequisites
 * Option default = 'EMPTY' means to create a course with only required data: {school, code, title}
 * Create a course with data that has specific prereq and coreq with option = 'NONE_EMPTY'. Ex: createCourse({school, code, title}, 'NONE_EMPTY')
 * @param {courseInfo} data
 * @returns {Course} Course
 */
courseController.createCourse = async (data, option = 'EMPTY') => {
  try {
    let course = data;
    if (option === 'EMPTY') {
      course = {
        school: data.school,
        code: data.code,
        title: data.title,
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

/**
 * @param {Object} options
 */
courseController.getPopulatedCourse = (options, res) => {
  try {
    Course.find(options)
      .populate('prerequisites corequisites')
      .then(foundCourse => {
        if (foundCourse) res.status(200).json(foundCourse);
        else
          generateServerErrorCode(
            res,
            403,
            'school courses retrieval error',
            SCHOOL_DOES_NOT_EXIST,
            'school, code'
          );
      });
  } catch (e) {
    generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
  }
};

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
      Course.findOne({ school, code }, foundCourse => {
        if (!foundCourse)
          courseController
            .createOrGetOneCourse({ school, code }, 'NONE_EMPTY')
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
        else
          generateServerErrorCode(
            res,
            403,
            'course creation error',
            COURSE_EXISTS_ALREADY,
            'course'
          );
      });
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
  (req, res) => {
    validationHandler(req, res, () => {
      const { _id } = req.query;
      courseController.getPopulatedCourse({ _id }, res);
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
  (req, res) => {
    validationHandler(req, res, () => {
      const { code } = req.params;
      const school = req.params.school.toUpperCase();

      courseController.getPopulatedCourse({ school, code }, res);
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
    const school = req.params.school.toUpperCase();
    validationHandler(req, res, () => {
      courseController.getPopulatedCourse({ school }, res);
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
