import express from 'express';
import { validationResult } from 'express-validator';
import passport from 'passport';
import { Semester } from '../database/models';
import {
  generateServerErrorCode,
  removeUndefinedObjectProps,
  isObjectEmpty,
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

function createSemester(data) {
  let semester = new Semester(data);
  return semester.save();
}

/**
 * POST/
 * Create a semester
 */
semesterController.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  validateCreateSemester,
  async (req, res) => {
    const errorsAfterValidation = validationResult(req);
    if (!errorsAfterValidation.isEmpty()) {
      res.status(400).json({
        code: 400,
        errors: errorsAfterValidation.mapped(),
      });
    } else {
      try {
        const { term, year, courses } = req.body;
        const semester = await Semester.findOne({ term, year, courses });

        if (!semester) {
          const newSemester = await createSemester(req.body);
          res.status(200).json(newSemester);
        } else {
          generateServerErrorCode(
            res,
            403,
            'create semester error',
            SEMESTER_EXISTS_ALREADY,
            'semesterId'
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
 * Get a semester
 */
semesterController.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  validateSemesterId,
  async (req, res) => {
    const errorsAfterValidation = validationResult(req);
    if (!errorsAfterValidation.isEmpty()) {
      res.status(400).json({
        code: 400,
        errors: errorsAfterValidation.mapped(),
      });
    } else {
      try {
        // Get semester ObjectId from query
        const semesterId = req.query.semesterId;

        // Get semester and populate the courses data
        const fetchedSemester = await Semester.findOne({
          _id: semesterId,
        }).populate('courses');

        if (fetchedSemester) {
          res.status(200).json(fetchedSemester);
        } else {
          generateServerErrorCode(
            res,
            403,
            'get semester error',
            SEMESTER_NOT_FOUND,
            'semesterId'
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
 * Update a semester
 */
semesterController.put(
  '/',
  passport.authenticate('jwt', { session: false }),
  validateSemesterId,
  async (req, res) => {
    const errorsAfterValidation = validationResult(req);
    if (!errorsAfterValidation.isEmpty()) {
      res.status(400).json({
        code: 400,
        errors: errorsAfterValidation.mapped(),
      });
    } else {
      try {
        // Get semester ObjectId from query
        const semesterId = req.query.semesterId;
        const updateData = removeUndefinedObjectProps(req.body);

        // Check if there is data to update
        if (isObjectEmpty(updateData)) {
          return res.status(400).json({ error: NO_DATA_TO_UPDATE });
        }

        const updatedSemester = await Semester.findByIdAndUpdate(
          { _id: semesterId },
          updateData,
          { useFindAndModify: false }
        );

        if (updatedSemester) {
          res.status(200).json(updatedSemester);
        } else {
          generateServerErrorCode(
            res,
            403,
            'update semester error',
            SEMESTER_NOT_FOUND,
            'semesterId'
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
 * Delete a semester
 */
semesterController.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  validateSemesterId,
  async (req, res) => {
    console.log('Request ', req.query);
    const errorsAfterValidation = validationResult(req);
    if (!errorsAfterValidation.isEmpty()) {
      res.status(400).json({
        code: 400,
        errors: errorsAfterValidation.mapped(),
      });
    } else {
      try {
        // Get semester ObjectId from query
        const semesterId = req.query.semesterId;
        const deletedSemester = await Semester.findByIdAndDelete({
          _id: semesterId,
        });

        if (deletedSemester) {
          return res
            .status(200)
            .json({ message: 'deleted a semester', deletedSemester });
        } else {
          generateServerErrorCode(
            res,
            403,
            'delete semester error',
            SEMESTER_NOT_FOUND,
            'semesterId'
          );
        }
      } catch (e) {
        generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
      }
    }
  }
);

export default semesterController;
