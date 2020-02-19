/* eslint-disable no-async-promise-executor */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
import express from 'express';
import multer from 'multer';
import passport from 'passport';
// import { Course, Semester } from '../database/models';

import CloudOcr from '../Scanning/cloudOCR';

import semesterController from './semester.controller';
import courseController from './course.controller';
import programController from './program.controller';
import planController from './plan.controller';

import CloudOcr from '../store/Scanning/cloudOCR';

import { User, Course, Semester, Plan } from '../database/models';

import { generateServerErrorCode } from '../store/utils';

import { SOME_THING_WENT_WRONG, PLAN_NOT_FOUND } from './constant';

const upload = multer({ dest: 'uploads/' });
const textScanController = express.Router();

const createOrGetAllCourseId = courseObjList => {
  return new Promise(async resolve => {
    const coursesWithIds = [];

    const createOrGetOneCourse = courseObjList.map(course => {
      return courseController.createOrGetOneCourse({
        ...course,
        code: course.code,
        title: course.title || ' ',
      });
    });

    const results = await Promise.all(createOrGetOneCourse);
    results.forEach(course => coursesWithIds.push(course._id));
    resolve(coursesWithIds);
  });
};

const createSemesterList = semesterList => {
  return new Promise(async resolve => {
    const semesterWithIds = [];
    const createOrGetOneSemester = semesterList.map(semester => {
      return semesterController.createOneSemester({
        ...semester,
        courses: semester.courses.map(course => course.code),
      });
    });

    const results = await Promise.all(createOrGetOneSemester);
    results.forEach(semester => {
      if (semester._id) semesterWithIds.push(semester._id);
    });

    resolve(semesterWithIds);
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
      const { takenCourseList, semesterList } = scanResult;

      // 1. Create Course + Semesters
      const [coursesTaken, semesters] = await Promise.all([
        createOrGetAllCourseId(takenCourseList),
        createSemesterList(semesterList),
      ]);

      // 2. Generate semesters left
      const remainingCourses = await planController.getRemainingCourses(
        coursesTaken,
        {
          school: scanResult.school,
          major: scanResult.major,
          catalogYear: scanResult.catalogYear,
        }
      );

      // const randomSemesterList = await planController.generateRandomSemesters(
      //   remainingCourses
      // );
      // semesterController.push(randomSemesterList);

      // 3. Create a new DegreePlan
      return new Plan({ semesters })
        .save()
        .then(newPlan => {
          User.findByIdAndUpdate(
            user._id,
            {
              coursesTaken,
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
          generateServerErrorCode(res, 500, e, PLAN_NOT_FOUND, 'Plan');
        });
    });
  }
);

export default textScanController;
