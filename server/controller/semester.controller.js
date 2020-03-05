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
  validateCreateSemester,
  validateSemesterId,
} from './validation/semester.validation';

const semesterController = express.Router();

/**
 * Get all semester based on a specific condition and populate all courses within the semester.
 * @param {*} res
 * @param {Object} option condition to get the semester. Default = {} means to get all semesters
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
 * @param {Object} data
 */
semesterController.createSemester = data => {
  return new Semester(data).save();
};

/**
 * POST/
 * Create a semester
 */
semesterController.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  validateCreateSemester,
  (req, res) => {
    validationHandler(req, res, async () => {
      try {
        const { term, year, courses } = req.body;
        const semester = await Semester.findOne({ term, year, courses });

        if (!semester) {
          const newSemester = await semesterController.createSemester(req.body);
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
            updateData,
            { useFindAndModify: false },
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
  passport.authenticate('jwt', { session: false }),
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
