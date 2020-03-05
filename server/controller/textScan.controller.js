/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
import express from 'express';
import multer from 'multer';
import passport from 'passport';

import semesterController from './semester.controller';
import courseController from './course.controller';

import CloudOcr from '../store/Scanning/cloudOCR';

import { User, Course, Semester } from '../database/models';

import { generateServerErrorCode } from '../store/utils';

import { SOME_THING_WENT_WRONG } from './constant';

const upload = multer({ dest: 'uploads/' });
const textScanController = express.Router();

/**
 * Find course ID of all courses and return a new course List that has course id
 * @param {[JSON Object]} courses
 * return {} newCourseList
 */
const addCourseIdToNewList = async courses => {
  const newCourseList = [];
  for (const course of courses) {
    const school = course.school.toUpperCase();
    const { code } = course;
    const title = course.title || ' ';
    await Course.findOne({ school, code }).then(async foundCourse => {
      if (!foundCourse) {
        await courseController
          .createCourse({ school, code, title })
          .then(createdCourse => {
            newCourseList.push(createdCourse._id);
          });
      } else newCourseList.push(foundCourse._id);
    });
  }

  return newCourseList;
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
    const fileName = req.file.path;
    CloudOcr.scan(fileName, option)
      .then(async scanResult => {
        // 1. Create a semester, and add to the database
        for (const semester of scanResult.semesterList) {
          semester.courses = await addCourseIdToNewList(semester.courses);
          await semesterController.createSemester(semester);
        }

        // Create a Degree Plan, and add Semester ID + userID

        res.status(200).json(scanResult);
      })
      .catch(e => {
        generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
      });
  }
);

export default textScanController;
