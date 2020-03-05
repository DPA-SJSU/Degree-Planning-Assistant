/* eslint-disable no-underscore-dangle */
import express from 'express';
import passport from 'passport';
import { validationResult } from 'express-validator';

import { Plan, Semester, User } from '../database/models';

import {
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
  SOME_THING_WENT_WRONG,
  PLAN_NOT_FOUND,
} from './constant';
import { generateServerErrorCode } from '../store/utils';
import semesterController from './semester.controller';

const planController = express.Router();

/**
 * @route   POST /plan/:userId
 * @desc    Creates a new degree plan for the given user id
 * @access  Private
 */
planController.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { user } = req;
    const userId = user._id;
    const errors = validationResult(req);
    if (errors.isEmpty() === false) {
      return res.status(400).json(errors);
    }
    if (!req.body.semesters) {
      return res.status(400).json({ errors: SEMESTERS_FIELD_IS_REQUIRED });
    }
    if (!validateSemesters(req.body.semesters)) {
      return res.status(400).json({ errors: SEMESTERS_IS_INVALID });
    }

    try {
      const { semesters } = req.body;
      const checkIfUserHasPlan = await User.findById(userId, 'degreePlanId');
      if (!checkIfUserHasPlan) {
        return res.status(404).json({ error: USER_DOES_NOT_EXIST });
      }
      if (checkIfUserHasPlan.degreePlanId) {
        return res.status(409).json({ error: USER_ALREADY_HAS_PLAN });
      }

      semesters.every(semester => semesterController.createSemester(semester));

      let newSemestersArr = [];
      for (const index in semesters) {
        const newSemester = new Semester(semesters[index]);
        newSemestersArr.push(newSemester);
      }

      const bulkWriteSemesters = await Semester.insertMany(newSemestersArr);
      newSemestersArr = [];
      for (const index in bulkWriteSemesters) {
        newSemestersArr.push(bulkWriteSemesters[index]._id);
      }

      let newDegreePlan = new Plan({
        semesters: newSemestersArr,
      });
      newDegreePlan = await newDegreePlan.save();

      const setUserPlan = await User.updateOne(
        { _id: userId },
        { degreePlanId: newDegreePlan._id }
      );

      if (setUserPlan.n < 1) {
        return res.status(500).json({ error: FAILED_TO_CREATE_PLAN });
      }
      return res.status(200).json();
    } catch (e) {
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
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { user } = req;
    const userId = user._id;
    const errors = validationResult(req);
    if (errors.isEmpty() === false) {
      return res.status(400).json(errors);
    }
    if (!req.body.semesters) {
      return res.status(400).json({ errors: SEMESTERS_FIELD_IS_REQUIRED });
    }
    if (validateSemesters(req.body.semesters) === false) {
      return res.status(400).json({ errors: SEMESTERS_IS_INVALID });
    }

    try {
      const { semesters } = req.body;

      // Check if the user exists and if they already have a degree plan
      const userToUpdate = await User.findById(userId, 'degreePlanId').populate(
        'degreePlanId'
      );
      if (!userToUpdate) {
        return res.status(404).json({ error: USER_DOES_NOT_EXIST });
      }
      if (!userToUpdate.degreePlanId) {
        return res.status(404).json({ error: USER_DOES_NOT_HAVE_DEGREE_PLAN });
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
      }
      return res.status(200).json();
    } catch (e) {
      generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
    }
  }
);

planController.getAllSemester = () => {};

/**
 * @route   GET /plan/
 * @desc    Fetches degree plans by PlanId
 * @access  Private
 */
planController.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { _id } = req.query;
    Plan.findById(_id)
      .populate({
        path: 'degreePlanId',
        populate: {
          path: 'semesters',
          model: 'Semester',
        },
      })
      .exec((err, foundPlan) => {
        if (err) generateServerErrorCode(res, 500, err, SOME_THING_WENT_WRONG);
        else if (foundPlan) res.status(200).json(foundPlan);
        else generateServerErrorCode(res, 500, err, PLAN_NOT_FOUND);
      });
  }
);

planController.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    try {
      const { planId } = req.query;
      User.findByIdAndUpdate(req.user._id, { degreePlanId: null });
      Plan.findByIdAndDelete(planId);
    } catch (e) {
      generateServerErrorCode(res, 500, 'server', SOME_THING_WENT_WRONG);
    }
  }
);

/**
 * @route   DELETE /plan
 * @desc    Delete degree plans by the user's id
 * @access  Private
 */
planController.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const userId = req.user._id;

    try {
      let user = await User.findById(userId, 'degreePlanId');

      if (!user) {
        return res.status(404).json({ error: USER_DOES_NOT_EXIST });
      }
      if (!user.degreePlanId) {
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
    } catch (e) {
      return res.status(500).json({ error: SERVER_ERROR });
    }
  }
);

export default planController;
