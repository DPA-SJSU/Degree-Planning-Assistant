/* eslint-disable no-underscore-dangle */
import express from 'express';
import multer from 'multer';
import passport from 'passport';

import CloudOcr from '../store/Scanning/cloudOCR';

import { User, Plan } from '../database/models';

import {
  generateServerErrorCode,
  createOrGetAllCourse,
  createSemesterList,
  getRemainingRequirement,
} from '../store/utils';

import { PLAN_NOT_FOUND } from './constant';

// import response from '../store/Scanning/sampleData/scanResult';

const upload = multer({ dest: 'uploads/' });
const textScanController = express.Router();

/**
 * POST/
 * Scan PDF File and input into Course & Semester Schema
 */
textScanController.post(
  '/',
  upload.single('pdf'),
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { user } = req;
    const { option } = req.query;
    const { path } = req.file;

    CloudOcr.scan(path, option).then(async scanResult => {
      // const scanResult = response;
      const { takenCourseList, semesterList, major, addedInfo } = scanResult;

      const coursesTaken = await createOrGetAllCourse(takenCourseList);

      const semesters = await createSemesterList(semesterList);

      const remainingRequirement = await getRemainingRequirement(coursesTaken);

      return new Plan({
        semesters: semesters
          .filter(semester => semester._id)
          .map(semester => semester._id),
      })
        .save()
        .then(newPlan => {
          User.findByIdAndUpdate(
            user._id,
            {
              coursesTaken: coursesTaken.map(course => course._id),
              degreePlan: newPlan._id,
              user: user._id,
            },
            { new: true }
          )
            .select('-hashedPassword -__v')
            .populate({
              path: 'degreePlan',
              model: 'Plan',
              populate: {
                path: 'semesters',
                model: 'Semester',
                populate: {
                  path: 'courses',
                  model: 'Course',
                },
              },
            })
            .populate('coursesTaken')

            .then(updatedUser => {
              res.status(200).json({ updatedUser, remainingRequirement });
            });
        })
        .catch(e => {
          generateServerErrorCode(res, 500, e, PLAN_NOT_FOUND, 'Plan');
        });
    });
  }
);

export default textScanController;
