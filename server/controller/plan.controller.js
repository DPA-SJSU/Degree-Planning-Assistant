/* eslint-disable no-underscore-dangle */
import express from 'express';
import passport from 'passport';

import {
  Plan,
  User,
  Semester,
  Requirement,
  Course,
  Program,
} from '../database/models';
import { validateSemesters } from './validation/plan.validation';
import { generateServerErrorCode, createSemesterList } from '../store/utils';

import {
  SEMESTERS_FIELD_IS_REQUIRED,
  SEMESTERS_IS_INVALID,
  FAILED_TO_CREATE_PLAN,
  SOME_THING_WENT_WRONG,
  PLAN_NOT_FOUND,
  FAILED_TO_UPDATE_USER,
} from './constant';

const planController = express.Router();

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
 * @route   POST /plan
 * @desc    Creates/Update a degree plan
 * @param   {userId} userID
 * @access  Private
 */
planController.post(
  '/:planId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { user } = req;
    createSemesterList(req.body.semesters).then(semesters => {
      Plan.findOneAndUpdate(
        { user: user._id, _id: req.params.planId },
        { semesters },
        { upsert: true, new: true }
      )
        .then(degreePlan => {
          User.findByIdAndUpdate(
            user._id,
            { degreePlan: degreePlan._id },
            { new: true }
          )
            .then(updatedUser => {
              const userToReturn = { ...updatedUser.toJSON() };
              delete userToReturn.hashedPassword;
              delete userToReturn.__v;
              res.status(200).json(userToReturn);
            })
            .catch(e => {
              generateServerErrorCode(res, 500, e, FAILED_TO_UPDATE_USER);
            });
        })
        .catch(e => {
          generateServerErrorCode(res, 500, e, FAILED_TO_CREATE_PLAN);
        });
    });
  }
);

/**
 * @route   GET /plan
 * @desc    Fetches degree plans by PlanId
 * @access  Private
 */
planController.get(
  '/',
  // passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Plan.findById(req.query._id)
      .populate({
        path: 'semesters',
        populate: { path: 'courses', model: 'Course' },
      })
      .populate('remainingRequirements')
      .then(foundPlan => res.status(200).json(foundPlan))
      .catch(e => generateServerErrorCode(res, 500, e, PLAN_NOT_FOUND));
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
      User.findByIdAndUpdate(req.user._id, { degreePlan: null });
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

/**
 * DELETE/
 * delete all the degree Plan
 * IMPORTANT: Call this ONLY when mongodb is used as localhost
 */
planController.delete('/reset', (req, res) => {
  Plan.deleteMany({}, (err, result) => {});

  Semester.deleteMany({}, (err, result) => {});

  Course.deleteMany({}, (err, result) => {});

  Requirement.deleteMany({}, (err, result) => {});
  Program.deleteMany({}, (err, result) => {});
  res.status(200).json();
});

export default planController;
