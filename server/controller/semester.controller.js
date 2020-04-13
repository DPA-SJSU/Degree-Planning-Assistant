/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-underscore-dangle */
import express from 'express';
import passport from 'passport';
import { Semester } from '../database/models';

import {
  generateServerErrorCode,
  removeUndefinedObjectProps,
  isObjectEmpty,
  validationHandler,
} from '../store/utils';

import {
  SEMESTER_EXISTS_ALREADY,
  SEMESTER_NOT_FOUND,
  SOME_THING_WENT_WRONG,
  NO_DATA_TO_UPDATE,
} from './constant';

import {
  validateCreateOneSemester,
  validateSemesterId,
} from './validation/semester.validation';
import courseController from './course.controller';

const semesterController = express.Router();

/**
 * Get all semester based on a specific condition and populate all courses within the semester.
 * @param {*} res
 * @param {Object} option Default = {} - get all semesters
 */
semesterController.getSemesterWithPopulatedCourse = (option, res) => {
  try {
    Semester.find(option)
      .populate('courses')
      .then(fetchedSemester => res.status(200).json(fetchedSemester))
      .catch(e => {
        generateServerErrorCode(res, 403, e, SEMESTER_NOT_FOUND, 'semester');
      });
  } catch (e) {
    generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
  }
};

/**
 * Create A new Semester
 * @param {JSON Object} data
 */
semesterController.createOneSemester = async data => {
  return new Promise((resolve, reject) => {
    const newData = data;

    courseController
      .createOrGetAllCourseId({ codes: data.courses })
      .then(courses => {
        newData.courses = courses;
        if (courses.length !== 0) {
          Semester.findOne({
            courses: { $in: newData.courses },
          })
            .then(foundSemester => {
              if (!foundSemester) {
                // TO-DO: Add Pre-req check for each semester before creating/update a plan
                resolve(new Semester(newData).save());
              } else resolve(foundSemester);
            })
            .catch(e => reject(e));
        } else resolve(courses);
      })
      .catch(e => reject(e));
  });
};

/**
 * Add all semesters in db
 * return a list of semesterIds
 * @param {[JSON Object]} list of semesters with courses
 */
semesterController.createSemesterList = semesterList => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async resolve => {
    const semesterWithIds = [];
    const createOrGetOneSemester = semesterList.map(semester => {
      return semesterController.createOneSemester({
        ...semester,
        codes: semester.courses,
      });
    });

    const results = await Promise.all(createOrGetOneSemester);
    results.forEach(semester => semesterWithIds.push(semester._id));

    resolve(semesterWithIds);
  });
};

/**
 * POST/
 * Create a semester
 */
semesterController.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  validateCreateOneSemester,
  (req, res) => {
    validationHandler(req, res, async () => {
      try {
        const { term, year, courses } = req.body;
        const semester = await Semester.findOne({ term, year, courses });

        if (!semester) {
          const newSemester = await semesterController.createOneSemester(
            req.body
          );
          res.status(200).json(newSemester);
        } else
          generateServerErrorCode(
            res,
            403,
            'create semester error',
            SEMESTER_EXISTS_ALREADY,
            'semesterId'
          );
      } catch (e) {
        generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
      }
    });
  }
);

/**
 * GET/
 * Get a semester
 */
semesterController.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  validateSemesterId,
  (req, res) => {
    validationHandler(req, res, () => {
      const { _id } = req.query;
      semesterController.getSemesterWithPopulatedCourse({ _id }, res);
    });
  }
);

/**
 * GET/
 * Retrieve all the semester
 */
semesterController.get('/all', (req, res) => {
  validationHandler(req, res, () =>
    semesterController.getSemesterWithPopulatedCourse({}, res)
  );
});

/**
 * PUT/
 * Update a semester
 */
semesterController.put(
  '/',
  passport.authenticate('jwt', { session: false }),
  validateSemesterId,
  (req, res) => {
    validationHandler(req, res, async () => {
      try {
        const { _id } = req.query;
        const updateData = removeUndefinedObjectProps(req.body);

        if (isObjectEmpty(updateData)) {
          res.status(400).json({ error: NO_DATA_TO_UPDATE });
        } else {
          Semester.findByIdAndUpdate(
            { _id },
            { updateData },
            { useFindAndModify: false, new: true },
            (err, updatedSemester) => {
              if (updatedSemester) {
                res.status(200).json(updatedSemester);
              } else {
                generateServerErrorCode(
                  res,
                  403,
                  'update semester error',
                  SEMESTER_NOT_FOUND,
                  'semester'
                );
              }
            }
          );
        }
      } catch (e) {
        generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
      }
    });
  }
);

/**
 * DELETE/
 * Delete a semester
 */
semesterController.delete(
  '/',
  // passport.authenticate('jwt', { session: false }),
  validateSemesterId,
  (req, res) => {
    validationHandler(req, res, () => {
      try {
        const { _id } = req.query;
        Semester.findByIdAndDelete(
          {
            _id,
          },
          (err, deletedSemester) => {
            if (deletedSemester)
              res.status(200).json({ deleted: deletedSemester });
            else
              generateServerErrorCode(
                res,
                403,
                'delete semester error',
                SEMESTER_NOT_FOUND,
                'semester'
              );
          }
        );
      } catch (e) {
        generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
      }
    });
  }
);

/**
 * DELETE/
 * delete all the semester
 * IMPORTANT: Call this ONLY when mongodb is used as localhost
 */
semesterController.delete(
  '/all',
  // passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Semester.deleteMany({}, (err, result) => {
      if (err) generateServerErrorCode(res, 500, err, SOME_THING_WENT_WRONG);
      else res.status(200).json(result);
    });
  }
);

export default semesterController;
