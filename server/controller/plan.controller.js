import express, { json } from 'express';
import { Plan } from '../database/models';

import logger from 'winston';

import passport from 'passport';

import { validationResult } from 'express-validator';
import {
  validateCreatePlan,
  validateFetchPlan,
  validateUpdatePlan,
} from './validation/plan.validation';

import {
  USER_OR_PLAN_ID_REQUIRED,
  PLAN_NOT_FOUND,
  SERVER_ERROR,
  USER_OR_PLAN_ID_REQUIRED,
  SEMESTERS_FIELD_IS_REQUIRED,
  SEMESTERS_IS_INVALID,
  PLAN_NOT_FOUND,
} from './constant';

const planController = express.Router();

/**
 * @route   POST /plan/create
 * @desc    Creates a new degree plan
 * @access  Private
 */
planController.post(
  '/create',
  passport.authenticate('jwt', { session: false }),
  validateCreatePlan,
  async (req, res) => {
    // Can't test this because there is no semester schema yet
    // But I am assuming that the client will send the user's id as well as an array of objects each containing all fields of a semester document
    // something like this:
    /*
      {
        "user_id": "a966a6a66ba6b8a698b6",
        "semesters": [
          "courses": [Courses.ID],
          ...,
          ...
        ]
      }
    */

    const errors = validationResult(req);
    if (errors.isEmpty() === false) {
      return res.status(400).json(errors);
    }

    // Temporary validation for semesters. Requires improvement upon addition of Semester schema
    if (!req.body.semesters) {
      return res.status(400).json({ error: SEMESTERS_FIELD_IS_REQUIRED });
    } else if (req.body.semesters.constructor !== Object) {
      return res.status(400).json({ error: SEMESTERS_IS_INVALID });
    }

    try {
      const { user_id, semesters } = req.body;

      // insertMany() documentation: https://docs.mongodb.com/manual/reference/method/db.collection.insertMany/
      /*
        const insertManyResult = await insertMany(semesters);
        const insertOneResult = await insertOne({ user_id, insertManyResult.ids });
      */

      return res.status(200).json();
    } catch (databaseError) {
      return res.status(500).json({ error: databaseError });
    }
  }
);

/**
 * @route   PUT /plan/update
 * @desc    Updates degree plans
 * @access  Private
 */
planController.put(
  '/update',
  passport.authenticate('jwt', { session: false }),
  validateUpdatePlan,
  async (req, res) => {
    // Can't test this because there is no semester schema yet
    // But I am assuming that the client will send the user's id as well as an array of objects each containing all fields of a semester document
    // something like this:
    /*
      {
        "user_id": "a966a6a66ba6b8a698b6",
        "semesters": [
          "courses": [Courses.ID],
          ...,
          ...
        ]
      }
    */

    const errors = validationResult(req);
    if (errors.isEmpty() === false) {
      return res.status(400).json(errors);
    }

    const { user_id, plan_id, semesters } = req.body;

    if (!user_id && !plan_id) {
      return res.status(400).json({ error: USER_OR_PLAN_ID_REQUIRED });
    } else if (!semesters) {
      // Temporary validation for semesters. Requires improvement upon addition of Semester schema
      return res.status(400).json({ error: SEMESTERS_FIELD_IS_REQUIRED });
    } else if (semesters.constructor !== Object) {
      return res.status(400).json({ error: SEMESTERS_IS_INVALID });
    }

    try {
      /*
        Either update via user_id or plan_id
        Determine which semesters in the array require updating
        update the needed semesters
      */
      return res.status(200).json();
    } catch (databaseErrors) {
      return res.status(500).json({ error: databaseErrors });
    }
  }
);

/**
 * @route   GET /plan/
 * @desc    Fetches degree plans
 * @access  Private
 */
planController.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  validateFetchPlan,
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty() === false) {
      return res.status(400).json(errors);
    } else if (!req.query.plan_id && !req.query.user_id) {
      return res.status(400).json({ error: USER_OR_PLAN_ID_REQUIRED });
    }

    try {
      const { plan_id, user_id, fetch_data } = req.query;

      const fetchedPlan = await Plan.findOne({
        _id: user_id ? user_id : plan_id,
      });

      if (fetchedPlan) {
        if (fetch_data && fetch_data === true) {
          // TODO: Fetch the data from each semester as well

          return res.status(200).json(fetchedPlan);
        } else {
          return res.status(200).json(fetchedPlan);
        }
      } else {
        return res.status(404).json({ error: PLAN_NOT_FOUND });
      }
    } catch (databaseError) {
      logger.info(databaseError);
      return res.status(500).json({ error: SERVER_ERROR });
    }
  }
);

/**
 * @route   DELETE /plan/delete
 * @desc    Delete degree plans by user_id or plan_id
 * @access  Private
 */
planController.delete(
  '/delete',
  passport.authenticate('jwt', { session: false }),
  validateDeletePlan,
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty() === false) {
      return res.status(400).json(errors);
    } else if (!req.body.user_id && !req.body.plan_id) {
      return res.status(400).json({ error: USER_OR_PLAN_ID_REQUIRED });
    }

    try {
      const deleteResult = await deleteOne({
        _id: user_id ? user_id : plan_id,
      });

      if (deleteResult.deletedCount > 0) {
        // TODO: Change the user's plan field to empty

        return res.status(200).json();
      } else {
        return res.status(404).json({ error: PLAN_NOT_FOUND });
      }
    } catch (databaseError) {
      return res.status(400).json({ error: SERVER_ERROR });
    }
  }
);

export default planController;
