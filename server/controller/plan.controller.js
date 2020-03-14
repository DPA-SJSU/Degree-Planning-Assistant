/* eslint-disable no-underscore-dangle */
import express from 'express';
import passport from 'passport';
import { validationResult } from 'express-validator';

import { Plan, User } from '../database/models';

import { validateSemesters } from './validation/plan.validation';

import {
  SEMESTERS_FIELD_IS_REQUIRED,
  SEMESTERS_IS_INVALID,
  FAILED_TO_CREATE_PLAN,
  SOME_THING_WENT_WRONG,
  PLAN_NOT_FOUND,
  FAILED_TO_UPDATE_USER,
} from './constant';
import { generateServerErrorCode } from '../store/utils';
import semesterController from './semester.controller';

const planController = express.Router();

/**
 * ============================================
 * Starting helper functions for planController
 * ============================================
 */

/**
 * Errors Handling to check
 */
planController.errorHandler = (req, res, errors) => {
  if (errors.isEmpty() === false) {
    return res.status(400).json(errors);
  }
  if (!req.body.semesters) {
    return res.status(400).json({ errors: SEMESTERS_FIELD_IS_REQUIRED });
  }
  if (!validateSemesters(req.body.semesters)) {
    return res.status(400).json({ errors: SEMESTERS_IS_INVALID });
  }
};

/**
 * Get all semesters and courses for each semester given a specific Degree Plan ID
 */
planController.getAllSemesterAndCourses = (res, id) => {
  Plan.findById(id)
    .populate({
      path: 'semesters',
      populate: {
        path: 'courses',
        model: 'Course',
      },
    })
    .exec((err, foundPlan) => {
      if (err) generateServerErrorCode(res, 500, err, SOME_THING_WENT_WRONG);
      else if (foundPlan) res.status(200).json(foundPlan);
      else generateServerErrorCode(res, 500, err, PLAN_NOT_FOUND);
    });
};

/**
 * ============================================
 * Starting APIs for Plan
 * ============================================
 */

/**
 * @route   POST /plan
 * @desc    Creates a new degree plan for the given user id
 * @desc    list of Semesters ID
 * @access  Private
 */
planController.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { user } = req;
    try {
      let { degreePlanId } = req.query;

      if (req.query.year === 1) {
        // TO-DO: If Freshman, generate all fixed plans
      } else {
        const semesters = await semesterController.createSemesterList(
          req.body.semesters
        );

        // Create/ Update a plan
        if (!degreePlanId) {
          const newPlan = await new Plan({ semesters }).save();
          degreePlanId = newPlan._id;
        }

        await Plan.findByIdAndUpdate(
          { _id: degreePlanId },
          { semesters },
          {
            upsert: true,
            new: true,
            runValidators: true,
            setDefaultsOnInsert: true,
          },
          (planErr, _) => {
            if (planErr)
              generateServerErrorCode(res, 500, planErr, FAILED_TO_CREATE_PLAN);
            else
              User.findByIdAndUpdate(
                user._id,
                {
                  degreePlanId,
                },
                { new: true },
                (err, updatedUser) => {
                  if (err)
                    generateServerErrorCode(
                      res,
                      500,
                      err,
                      FAILED_TO_UPDATE_USER
                    );
                  else {
                    const userToReturn = { ...updatedUser.toJSON() };
                    delete userToReturn.hashedPassword;
                    delete userToReturn.__v;
                    res.status(200).json(userToReturn);
                  }
                }
              );
          }
        );
      }
    } catch (e) {
      generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
    }
  }
);

/**
 * @route   GET /plan
 * @desc    Fetches degree plans by PlanId
 * @access  Private
 */
planController.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { _id } = req.query;
    planController.getAllSemesterAndCourses(res, _id);
  }
);

/**
 * @route   DELETE /plan
 * @desc    Delete degree plans by planID
 * @access  Private
 */
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
 * DELETE/
 * delete all the degree Plan
 * IMPORTANT: Call this ONLY when mongodb is used as localhost
 */
planController.delete(
  '/all',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Plan.deleteMany({}, (err, result) => {
      if (err) generateServerErrorCode(res, 500, err, SOME_THING_WENT_WRONG);
      else res.status(200).json(result);
    });
  }
);

export default planController;
