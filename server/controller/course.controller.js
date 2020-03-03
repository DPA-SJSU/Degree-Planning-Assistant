import express from 'express';
import { validationResult } from 'express-validator';
import passport from 'passport';
import { Course } from '../database/models';
import {
  generateServerErrorCode,
  removeUndefinedObjectProps,
  isObjectEmpty,
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
const ObjectId = require('mongoose').Types.ObjectId;

/**
 * Creates a new Course with correct reference to ObjectId of prerequisites and corequisites
 * @param {} data
 * @returns {Course} Course
 */
async function createCourse(data) {
  try {
    let course;
    let prereqs = data.prerequisites;
    let coreqs = data.corequisites;

    data.prerequisites = await getAllCourseId(data.school, prereqs);
    data.corequisites = await getAllCourseId(data.school, coreqs);

    course = new Course(data);
    return course.save();
  } catch (e) {
    console.log('createCourse() Error: ', e);
  }
}

/**
 * Loop though an array of Courses to get the ObjectId of each
 * @param {String} school
 * @param {[String]} codes
 * @returns {[ObjectId]} [ObjectId]
 */
async function getAllCourseId(school, codes) {
  try {
    let coursesWithIds = [];
    for (let code of codes) {
      const objId = await getObjectId(school, code);
      coursesWithIds.push(objId);
    }
    return coursesWithIds;
  } catch (e) {
    console.log('getAllCourseId() Error: ', e);
  }
}

/**
 * Get the ObjectId of a course based on school (schl) and course code
 * Or initialize a new course and retrieve the ObjectId
 * @param {String} school
 * @param {String} code
 * @returns {ObjectId} ObjectId
 */
async function getObjectId(school, code) {
  try {
    let course = await Course.findOne({
      school,
      code,
    });
    if (!course) {
      const createdCourse = await createEmptyCourse(school, code);
      return new ObjectId(createdCourse._id);
    }
    return new ObjectId(course._id);
  } catch (e) {
    console.log('getObjectId() Error: ', e);
  }
}

/**
 * Initialiazes an empty course for future use
 * @param {String} schl
 * @param {String} courseCode
 * @returns {Course} Course
 */
async function createEmptyCourse(school, code) {
  const data = {
    school,
    code,
    title: ' ',
    description: ' ',
    prerequisites: [],
    corequisites: [],
    difficulty: 0,
    impaction: 0,
    termsOffered: ' ',
  };
  let newCourse = new Course(data);
  return newCourse.save();
}

/**
 * POST/
 * Create a new course, requires authentication of user
 */
courseController.post(
  '/',
  passport.authenticate('jwt', {
    session: false,
  }),
  validateCourseCreation,
  async (req, res) => {
    const errorsAfterValidation = validationResult(req);
    if (!errorsAfterValidation.isEmpty()) {
      res.status(400).json({
        code: 400,
        errors: errorsAfterValidation.mapped(),
      });
    } else {
      try {
        const { school, code } = req.body;

        // Check if course already exists
        const course = await Course.findOne({
          school,
          code,
        });

        // Create a new course
        if (!course) {
          const createdCourse = await createCourse(req.body);
          res.status(200).json(createdCourse);
        } else {
          generateServerErrorCode(
            res,
            403,
            'course creation error',
            COURSE_EXISTS_ALREADY,
            'school, code'
          );
        }
      } catch (e) {
        generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
      }
    }
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
    const errorsAfterValidation = validationResult(req);
    if (!errorsAfterValidation.isEmpty()) {
      res.status(400).json({
        code: 400,
        errors: errorsAfterValidation.mapped(),
      });
    } else {
      try {
        // Get course ObjectId from query
        const courseId = req.query.courseId;

        const fetchedCourse = await Course.findOne({
          _id: courseId,
        }).populate('prerequisites corequisites');

        if (fetchedCourse) {
          res.status(200).json(fetchedCourse);
        } else {
          generateServerErrorCode(
            res,
            403,
            'course retrieval error',
            COURSE_DOES_NOT_EXIST,
            'courseId'
          );
        }
      } catch (e) {
        generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
      }
    }
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
    const errorsAfterValidation = validationResult(req);
    if (!errorsAfterValidation.isEmpty()) {
      res.status(400).json({
        code: 400,
        errors: errorsAfterValidation.mapped(),
      });
    } else {
      try {
        const { school, code } = req.params;

        // Get course and populate the prerequisites and corequisities data using their _id
        const course = await Course.findOne({
          school,
          code,
        }).populate('prerequisites corequisites');

        if (course) {
          res.status(200).json(course);
        } else {
          generateServerErrorCode(
            res,
            403,
            'course retrieval error',
            COURSE_DOES_NOT_EXIST,
            'school, code'
          );
        }
      } catch (e) {
        generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
      }
    }
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
  async (req, res) => {
    const errorsAfterValidation = validationResult(req);
    if (!errorsAfterValidation.isEmpty()) {
      res.status(400).json({
        code: 400,
        errors: errorsAfterValidation.mapped(),
      });
    } else {
      try {
        // Get all courses with matching school name
        // and populate the prerequisites and corequisities
        const courses = await Course.find({
          school: req.params.school,
        }).populate('prerequisites corequisites');

        if (courses) {
          res.status(200).json(courses);
        } else {
          generateServerErrorCode(
            res,
            403,
            'school courses retrieval error',
            SCHOOL_DOES_NOT_EXIST,
            'school'
          );
        }
      } catch (e) {
        generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
      }
    }
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
  async (req, res) => {
    const errorsAfterValidation = validationResult(req);
    if (!errorsAfterValidation.isEmpty()) {
      res.status(400).json({
        code: 400,
        errors: errorsAfterValidation.mapped(),
      });
    } else {
      try {
        // Get course ObjectId from query
        const courseId = req.query.courseId;

        // Remove undefined properties
        const updateData = removeUndefinedObjectProps(req.body);

        // Check if there is data to update
        if (isObjectEmpty(updateData)) {
          return res.status(400).json({ error: NO_DATA_TO_UPDATE });
        }

        const updatedCourse = await Course.findByIdAndUpdate(
          { _id: courseId },
          updateData,
          { useFindAndModify: false, new: true }
        );

        if (updatedCourse) {
          res.status(200).json(updatedCourse);
        } else {
          generateServerErrorCode(
            res,
            403,
            'update course error',
            COURSE_DOES_NOT_EXIST,
            'courseId'
          );
        }
      } catch (e) {
        generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
      }
    }
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
      // Get course ObjectId from query
      const courseId = req.query.courseId;

      const deletedCourse = await Course.findByIdAndDelete({
        _id: courseId,
      });

      if (deletedCourse) {
        return res
          .status(200)
          .json({ message: 'deleted a course', deletedCourse });
      } else {
        generateServerErrorCode(
          res,
          403,
          'delete course error',
          COURSE_DOES_NOT_EXIST,
          'courseId'
        );
      }
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
    Course.deleteMany({}, function(err, result) {
      if (err) {
        return res.status(500).json({ err });
      }
      return res.status(200).json({ message: 'deleted all courses' });
    });
  }
);

export default courseController;
