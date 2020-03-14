/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
import express from 'express';
import multer from 'multer';
import passport from 'passport';

import semesterController from './semester.controller';
import courseController from './course.controller';
import planController from './plan.controller';

import CloudOcr from '../store/Scanning/cloudOCR';

import { User, Course, Semester, Plan } from '../database/models';

import { generateServerErrorCode } from '../store/utils';

import { SOME_THING_WENT_WRONG } from './constant';

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
  (req, res) => {
    const { user } = req;
    const { option } = req.query;
    const { path } = req.file;

    CloudOcr.scan(path, option)
      .then(async scanResult => {
        let coursesTaken = [];
        const semesters = [];

        for (const semester of scanResult.semesterList) {
          // 1. Create semesters
          const newSemester = await semesterController.createSemester(semester);
          coursesTaken = coursesTaken.concat(newSemester.courses);
          semesters.push(newSemester._id);
        }

        // 2. TO-DO: Add the remaining classes to the semester

        // 3. Create a new DegreePlan to DB
        const degreePlan = await new Plan({ semesters }).save();

        // 4. Update User's DegreePlanId
        await User.findByIdAndUpdate(user._id, {
          coursesTaken,
          degreePlanId: degreePlan._id,
        });

        return planController.getAllSemesterAndCourses(res, degreePlan._id);
      })
      .catch(e => {
        console.log(e);
        generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
      });
  }
);

export default textScanController;
