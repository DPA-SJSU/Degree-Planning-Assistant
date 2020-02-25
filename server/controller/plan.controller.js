import express, { json } from 'express';
import { Plan, Semester, User } from '../database/models';

import logger from 'winston';

import passport from 'passport';

import { validationResult } from 'express-validator';
import {
  validateCreatePlan,
  validateFetchPlan,
  validateUpdatePlan,
  validateSemesters,
  validateDeletePlan,
} from './validation/plan.validation';

import {
  SERVER_ERROR,
  SEMESTERS_FIELD_IS_REQUIRED,
  SEMESTERS_IS_INVALID,
  USER_DOES_NOT_EXIST,
  USER_ALREADY_HAS_PLAN,
  FAILED_TO_CREATE_PLAN,
} from './constant';

const planController = express.Router();

/*
  --- SEMESTER SCHEMA ---
  term: { type: String, required: true },
  year: { type: String, required: true },
  difficulty: { type: String },
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course', required: true }],

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
 * @route   POST /plan/:userId
 * @desc    Creates a new degree plan
 * @access  Private
 */
planController.post(
  '/:userId',
  passport.authenticate('jwt', { session: false }),
  validateCreatePlan,
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty() === false) {
      return res.status(400).json(errors);
    } else if (!req.body.semesters) {
      return res.status(400).json({ errors: SEMESTERS_FIELD_IS_REQUIRED });
    } else if (validateSemesters(req.body.semesters) === false) {
      return res.status(400).json({ errors: SEMESTERS_IS_INVALID });
    }

    try {
      const { userId } = req.params;
      const { semesters } = req.body;

      // First check if the user exists and if it already has a degree plan
      const checkIfUserHasPlan = await User.findById(userId, 'degree_plan_id');
      if (!checkIfUserHasPlan) {
        return res.status(404).json({ error: USER_DOES_NOT_EXIST });
      } else if (checkIfUserHasPlan.degree_plan_id) {
        return res.status(409).json({ error: USER_ALREADY_HAS_PLAN });
      }

      // Create new Semester models using the semesters given by the request
      let newSemestersArr = [];
      for (const index in semesters) {
        const newSemester = new Semester(semesters[index]);
        newSemestersArr.push(newSemester);
      }

      // Save the new semester models in the database and then put their individual IDs in an array
      const bulkWriteSemesters = await Semester.insertMany(newSemestersArr);
      newSemestersArr = [];
      for (const index in bulkWriteSemesters) {
        newSemestersArr.push(bulkWriteSemesters[index]._id);
      }

      // Create a new degree plan model using the array of semester IDs and then save teh new degree plan in the database
      let newDegreePlan = new Plan({
        semesters: newSemestersArr,
      });
      newDegreePlan = await newDegreePlan.save();

      // Update the User's degree_plan_id field with the id of the new degree plan
      const setUserPlan = await User.updateOne(
        { _id: userId },
        { degree_plan_id: newDegreePlan._id }
      );

      if (setUserPlan.n < 1) {
        return res.status(500).json({ error: FAILED_TO_CREATE_PLAN });
      } else {
        return res.status(200).json();
      }
    } catch (databaseErr) {
      console.log(databaseErr);
      logger.info(databaseErr);
      return res.status(500).json({ error: SERVER_ERROR });
    }
  }
);

/**
 * @route   PUT /plan/:userId
 * @desc    Update degree plans by the user's ID
 * @access  Private
 */
planController.put(
  '/:userId',
  passport.authenticate('jwt', { session: false }),
  validateUpdatePlan,
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty() === false) {
      return res.status(400).json(errors);
    } else if (!req.body.semesters) {
      return res.status(400).json({ errors: SEMESTERS_FIELD_IS_REQUIRED });
    } else if (validateSemesters(req.body.semesters) === false) {
      return res.status(400).json({ errors: SEMESTERS_IS_INVALID });
    }

    try {
      const { userId } = req.params;
      const { semesters } = req.body;

      // Check if the user exists and if they already have a degree plan
      const userToUpdate = await User.findById(
        userId,
        'degree_plan_id'
      ).populate('degree_plan_id');
      if (!userToUpdate) {
        return res.status(404).json({ error: USER_DOES_NOT_EXIST });
      } else if (!userToUpdate.degree_plan_id) {
        return res.status(404).json({ error: USER_DOES_NOT_HAVE_PLAN });
      }

      // Create new Semester models using the semesters given by the request
      let newSemestersArr = [];
      for (const index in semesters) {
        const newSemester = new Semester(semesters[index]);
        newSemestersArr.push(newSemester);
      }

      // Save the new semester models in the database and then put their individual IDs in an array
      const bulkWriteSemesters = await Semester.insertMany(newSemestersArr);
      newSemestersArr = [];
      for (const index in bulkWriteSemesters) {
        newSemestersArr.push(bulkWriteSemesters[index]._id);
      }

      const updateDegreePlan = await Plan.updateOne(
        { _id: userToUpdate.degree_plan_id },
        { semesters: newSemestersArr }
      );

      if (updateDegreePlan.n < 1) {
        return res.status(500).json({ error: FAILED_TO_CREATE_PLAN });
      } else {
        return res.status(200).json();
      }
    } catch (databaseErr) {
      console.log(databaseErr);
      logger.info(databaseErr);
      return res.status(500).json({ error: SERVER_ERROR });
    }
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

      let planId = await User.findById(userId, 'degree_plan_id');

      if (!planId) {
        return res.status(404).json({ error: USER_DOES_NOT_EXIST });
      } else {
        planId = await Plan.findById(planId.degree_plan_id).populate(
          'semesters'
        );
        return res.status(200).json(planId);
      }
    } catch (databaseErr) {
      console.log(databaseErr);
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
