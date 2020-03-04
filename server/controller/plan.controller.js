import express from 'express';
import { Plan, Semester, User } from '../database/models';

import logger from 'winston';

import passport from 'passport';

import { validationResult } from 'express-validator';
import {
  validateUserId,
  validateFetchPlan,
  validateSemesters,
} from './validation/plan.validation';

import {
  SERVER_ERROR,
  SEMESTERS_FIELD_IS_REQUIRED,
  SEMESTERS_IS_INVALID,
  USER_DOES_NOT_EXIST,
  USER_ALREADY_HAS_PLAN,
  FAILED_TO_CREATE_PLAN,
  USER_DOES_NOT_HAVE_DEGREE_PLAN,
} from './constant';

const planController = express.Router();

/**
 * @route   POST /plan/:userId
 * @desc    Creates a new degree plan for the given user id
 * @access  Private
 */
planController.post(
  '/:userId',
  passport.authenticate('jwt', { session: false }),
  validateUserId,
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
      const checkIfUserHasPlan = await User.findById(userId, 'degreePlanId');
      if (!checkIfUserHasPlan) {
        return res.status(404).json({ error: USER_DOES_NOT_EXIST });
      } else if (checkIfUserHasPlan.degreePlanId) {
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

      // Update the User's degreePlanId field with the id of the new degree plan
      const setUserPlan = await User.updateOne(
        { _id: userId },
        { degreePlanId: newDegreePlan._id }
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
 * @desc    Update degree plans by the user's id
 * @access  Private
 */
planController.put(
  '/:userId',
  passport.authenticate('jwt', { session: false }),
  validateUserId,
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
      const userToUpdate = await User.findById(userId, 'degreePlanId').populate(
        'degreePlanId'
      );
      if (!userToUpdate) {
        return res.status(404).json({ error: USER_DOES_NOT_EXIST });
      } else if (!userToUpdate.degreePlanId) {
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
        { _id: userToUpdate.degreePlanId },
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
 * @route   GET /plan/:userId
 * @desc    Fetches degree plans by by the user's id
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

      let planId = await User.findById(userId, 'degreePlanId');

      if (!planId) {
        return res.status(404).json({ error: USER_DOES_NOT_EXIST });
      } else {
        planId = await Plan.findById(planId.degreePlanId).populate('semesters');
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
 * @route   DELETE /plan/:userId
 * @desc    Delete degree plans by the user's id
 * @access  Private
 */
planController.delete(
  '/:userId',
  passport.authenticate('jwt', { session: false }),
  validateUserId,
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty() === false) {
      return res.status(400).json(errors);
    }

    try {
      const { userId } = req.params;
      let user = await User.findById(userId, 'degreePlanId');

      if (!user) {
        return res.status(404).json({ error: USER_DOES_NOT_EXIST });
      } else if (!user.degreePlanId) {
        return res.status(404).json({ error: USER_DOES_NOT_HAVE_DEGREE_PLAN });
      }

      const deletedPlan = await Plan.deleteOne({ _id: user.degreePlanId });
      if (deletedPlan.n < 1) {
        return res.status(404).json({ error: USER_DOES_NOT_HAVE_DEGREE_PLAN });
      }

      user = await User.updateOne(
        { _id: user._id },
        { degreePlanId: undefined }
      );

      if (user.n < 1) {
        return res.status(404).json({ error: USER_DOES_NOT_HAVE_DEGREE_PLAN });
      }

      return res.status(200).json();
    } catch (databaseErr) {
      console.log(databaseErr);
      logger.info(databaseErr);
      return res.status(500).json({ error: SERVER_ERROR });
    }
  }
);

export default planController;
