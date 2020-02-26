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
 * Create A semester
 */
semesterController.createSemester = data => {
  const semester = new Semester(data);
  return semester.save();
};

/**
 * POST/
 * Create a semester
 */
semesterController.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  validateCreateSemester,
  async (req, res) => {
    validationHandler(req, res, async () => {
      try {
        const semester = await Semester.findOne(req.body);

        if (!semester) {
          const newSemester = await semesterController.createSemester(req.body);
          res.status(200).json(newSemester);
        } else
          generateServerErrorCode(
            res,
            403,
            'create semester error',
            SEMESTER_EXISTS_ALREADY,
            'semester_id'
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
      try {
        const { _id } = req.query;

        Semester.findOne({ _id })
          .populate('courses')
          .then(fetchedSemester => {
            res.status(200).json(fetchedSemester);
          })
          .catch(e => {
            generateServerErrorCode(
              res,
              403,
              e,
              SEMESTER_NOT_FOUND,
              'semesterId'
            );
          });
      } catch (e) {
        generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
      }
    });
  }
);

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
          return res.status(400).json({ error: NO_DATA_TO_UPDATE });
        }

        return Semester.findByIdAndUpdate(
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
                'semester_id'
              );
            }
          }
        );
      } catch (e) {
        return generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
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
              return res
                .status(200)
                .json({ message: 'deleted a semester: ', deletedSemester });
            return generateServerErrorCode(
              res,
              403,
              'delete semester error',
              SEMESTER_NOT_FOUND,
              'semester_id'
            );
          }
        );
      } catch (e) {
        generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
      }
    });
  }
);

export default semesterController;
