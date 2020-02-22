import express, { json } from 'express';
import { Plan, Semester } from '../database/models';

import logger from 'winston';

import passport from 'passport';

import { validationResult } from 'express-validator';
import {
  validateCreatePlan,
  validateFetchPlan,
  validateUpdatePlan,
  validateSemesters,
} from './validation/plan.validation';

import {
  USER_OR_PLAN_ID_REQUIRED,
  PLAN_NOT_FOUND,
  SERVER_ERROR,
  USER_OR_PLAN_ID_REQUIRED,
  SEMESTERS_FIELD_IS_REQUIRED,
  SEMESTERS_IS_INVALID,
  PLAN_NOT_FOUND,
  USER_DOES_NOT_EXIST,
} from './constant';

const planController = express.Router();

/*
  --- SEMESTER SCHEMA ---
  term: { type: String, required: true},
  year: { type: String, required: true},
  difficulty: { type: Number },
  courses: [{ type: Schema.Types.ObjectId, ref: "Course"}]

  --- COURSE SCHEMA ---
  school: { type: String, required: true, uppercase: true },
  code: { type: String, required: true, uppercase: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  prerequisites: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      uppercase: true,
    },
  ],
  corequisites: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      uppercase: true,
    },
  ],
  difficulty: { type: Number },
  impaction: { type: Number },
  termsOffered: { type: String, required: true },
*/

/**
 * @route   POST /plan
 * @desc    Creates a new degree plan
 * @access  Private
 */
planController.post(
  '/userId',
  passport.authenticate('jwt', { session: false }),
  validateCreatePlan,
  async (req, res) => {
    if (!req.body.semesters) {
      return res.status(400).json({ errors: SEMESTERS_FIELD_IS_REQUIRED });
    } else if (validateSemesters(req.body.semesters) === false) {
      return res.status(400).json({ errors: SEMESTERS_IS_INVALID });
    }

    try {
      const { semesters } = req.body;
      // const bulkWriteResult = await Semester.insertMany(semesters);

      // TODO: Grab the array of objectIds, put them in object, then save object to DB as Plan
      return res.status(200).json();
    } catch (databaseErr) {
      logger.info(databaseErr);
      return res.status(500).json({ error: SERVER_ERROR });
    }
  }
);

/**
 * @route   PUT /plan
 * @desc    Updates degree plans
 * @access  Private
 */
planController.put(
  '/:userId',
  passport.authenticate('jwt', { session: false }),
  validateUpdatePlan,
  async (req, res) => {
    return res.status(200).json();
  }
);

/**
 * @route   GET /plan
 * @desc    Fetches degree plans
 * @access  Private
 */
planController.get(
  '/:userId',
  passport.authenticate('jwt', { session: false }),
  validateFetchPlan,
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty() === false) {
      return res.status(400).json(errors);
    }

    try {
      const { userId } = req.params;
      const { courseNamesOnly } = req.query;

      const user = await User.findById(userId, 'degree_plan_id').populate(
        'degree_plan_id'
      );

      if (user) {
        // TODO: Fetch the course names of each semester

        return res.status(200).json(user.degree_plan_id);
      } else {
        return res.status(404).json({ error: USER_DOES_NOT_EXIST });
      }
    } catch (databaseErr) {
      logger.info(databaseErr);
      return res.status(500).json({ error: SERVER_ERROR });
    }
  }
);

/**
 * @route   DELETE /plan
 * @desc    Delete degree plans by user_id or plan_id
 * @access  Private
 */
planController.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  validateDeletePlan,
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty() === false) {
      return res.status(400).json();
    }

    try {
      const deleteResult = await Plan.deleteOne({ _id: req.body.plan_id });
      // TODO: Check if a document is deleted or not then return res accordingly

      return res.status(200).json();
    } catch (databaseErr) {
      return res.status(500).json({ error: SERVER_ERROR });
    }

    return res.status(200).json();
  }
);

export default planController;
