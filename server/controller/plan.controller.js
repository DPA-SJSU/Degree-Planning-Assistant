/* eslint-disable no-underscore-dangle */
import express from 'express';
import passport from 'passport';
import { validationResult } from 'express-validator';

import { Plan, User, Semester, Requirement, Course } from '../database/models';

import { validateSemesters } from './validation/plan.validation';

import {
  SEMESTERS_FIELD_IS_REQUIRED,
  SEMESTERS_IS_INVALID,
  FAILED_TO_CREATE_PLAN,
  SOME_THING_WENT_WRONG,
  PLAN_NOT_FOUND,
  FAILED_TO_UPDATE_USER,
} from './constant';

import { groupBy, generateServerErrorCode } from '../store/utils';

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

planController.getRemainingRequirement = (courses, requirementOption) => {
  // 1. Group all courses based on their type, and area
  // 2. Find Requirement that based on the found type and area.
  // 3. if RequiredCredit reach 0, ignore that requirement
  // Else return a list of courses in that requirement.
  // 4. Find all other requirement that has different type or area. Retrieve the courses

  return new Promise((resolve, reject) => {
    const coursesTaken = courses;
    // groupBy(coursesTaken, 'type')
    console.log(courses);

    //   coursesTaken.forEach(course => {
    //     Requirement.findOne({courses})
    //   })
    //   console.log(requirementOption);
    //   Requirement.find({ requirementOption }, (err, foundRequirement) => {
    //     console.log(foundRequirement);
    //     resolve(courses);
    //   });
  });
};

planController.generateSemesters = courses => {
  return new Promise((resolve, reject) => {
    resolve(courses);
  });
};

planController.preReqCheck = semesters => {
  return new Promise((resolve, reject) => {
    resolve(semesters);
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
    let { degreePlan } = req.query;

    if (req.query.year === 1) {
      // TO-DO: If Freshman, generate all fixed plans
    } else {
      semesterController
        .createSemesterList(req.body.semesters)
        .then(semesters => {
          if (!degreePlan) {
            Plan.create({ semesters }, (err, newPlan) => {
              degreePlan = newPlan._id;
            });
          }

          Plan.findOneAndUpdate(
            { _id: degreePlan },
            { semesters },
            {
              upsert: true,
              new: true,
              runValidators: true,
              setDefaultsOnInsert: true,
            },
            (planErr, _) => {
              if (planErr)
                generateServerErrorCode(
                  res,
                  500,
                  planErr,
                  FAILED_TO_CREATE_PLAN
                );
              else
                User.findByIdAndUpdate(
                  user._id,
                  { degreePlan },
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
        })
        .catch(e =>
          generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG)
        );
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

    Plan.findById(_id)
      .populate({
        path: 'semesters',
        populate: { path: 'courses', model: 'Course' },
      })
      .then((err, foundPlan) => {
        if (err) generateServerErrorCode(res, 500, err, SOME_THING_WENT_WRONG);
        else if (foundPlan) res.status(200).json(foundPlan);
        else generateServerErrorCode(res, 500, err, PLAN_NOT_FOUND);
      });
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
  Plan.deleteMany({}, (err, result) => {
    // if (err) generateServerErrorCode(res, 500, err, SOME_THING_WENT_WRONG);
    // res.status(200).json(result);
  });

  Semester.deleteMany({}, (err, result) => {
    // if (err) generateServerErrorCode(res, 500, err, SOME_THING_WENT_WRONG);
    // else res.status(200).json(result);
  });

  Course.deleteMany({}, (err, result) => {
    // if (err) generateServerErrorCode(res, 500, err, SOME_THING_WENT_WRONG);
    // else res.status(200).json(result);
  });

  Requirement.deleteMany({}, (err, result) => {
    // if (err) generateServerErrorCode(res, 500, err, SOME_THING_WENT_WRONG);
    // else res.status(200).json(result);
  });
  res.status(200).json();
});

export default planController;
