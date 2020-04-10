/* eslint-disable no-async-promise-executor */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
import express from 'express';
import multer from 'multer';
import passport from 'passport';

import CloudOcr from '../store/Scanning/cloudOCR';

import semesterController from './semester.controller';
import courseController from './course.controller';
import programController from './program.controller';
import planController from './plan.controller';

import { User, Course, Semester, Plan } from '../database/models';

import { generateServerErrorCode } from '../store/utils';

import { SOME_THING_WENT_WRONG, PLAN_NOT_FOUND } from './constant';

const upload = multer({ dest: 'uploads/' });
const textScanController = express.Router();

const createOrGetAllCourseId = courseObjList => {
  return new Promise(async resolve => {
    const createOrGetOneCourse = courseObjList.map(course => {
      return courseController.createOrGetOneCourse({
        ...course,
        code: course.code,
        title: course.title || ' ',
      });
    });
    resolve(Promise.all(createOrGetOneCourse));
  });
};

const createSemesterList = semesterList => {
  return new Promise(async resolve => {
    const createOrGetOneSemester = semesterList.map(semester => {
      return semesterController.createOneSemester({
        ...semester,
        courses: semester.courses.map(course => course.code),
      });
    });
    resolve(Promise.all(createOrGetOneSemester));
  });
};

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

    CloudOcr.scan(path, option).then(async scanResult => {
      // console.log(scanResult.takenCourseList);
      const {
        takenCourseList,
        semesterList,
        school,
        major,
        catalogYear,
        addedInfo,
      } = scanResult;

      // 1. Create Course + Semesters
      const [coursesTaken, semesters] = await Promise.all([
        createOrGetAllCourseId(takenCourseList),
        createSemesterList(semesterList),
      ]);
      // console.log(coursesTaken, semesterList);

      // 2. Generate semesters left
      // CS 146 CS 149 = 6 credit
      // 99 credits for major requirement
      // const credit = requirementCredit - 6 = 93 credits
      // Return a list of 93/3 = 31 courses
      // const remainingCourses = await planController.getRemainingRequirement(
      //   coursesTaken,
      //   { school, major: 'Software Engineering', catalogYear }
      // );

      // Generate Semester Fal 2020: 12 credits
      // Spring 2021: 12 Credits
      // This part is really hard. There're many cases
      // Return a list of 31 courses of major requirement
      // CLient: student can see remaining courses => input that manually into the semester on client

      // Semester => Click "update the degree plan"
      // Server => call check Pre-req

      // const randomSemesterList = await planController.generateSemesters(
      //   remainingCourses
      // );
      // semesters.push(randomSemesterList);

      // 3. Create a new DegreePlan
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
              res.status(200).json(updatedUser);
            });
        })
        .catch(e => {
          console.log(e);
          generateServerErrorCode(res, 500, e, PLAN_NOT_FOUND, 'Plan');
        });
    });
  }
);

export default textScanController;
