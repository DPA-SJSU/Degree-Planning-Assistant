/* eslint-disable no-restricted-syntax */
import express from 'express';
import multer from 'multer';
import passport from 'passport';

import CloudOcr from '../Scanning/cloudOCR';
import courseController from './course.controller';

const upload = multer({ dest: 'uploads/' });
const textScanController = express.Router();

/**
 * POST/
 * Scan PDF File and input into Course & Semester Schema
 */
textScanController.post(
  '/ocr',
  // passport.authenticate('jwt', { session: false }),
  upload.single('pdf'),
  (req, res) => {
    const { user } = req;
    const fileName = req.file.path;
    CloudOcr.scan(fileName)
      .then(scanResult => {
        // Create a semester, and add to the database
        // scanResult.semesterList.forEach(semester => createSemester(semester));

        // Create a Degree Plan, and add Semester to Plan

        // Loop through the course => findId of the course based on school code and add to User's CoursesTaken Array
        scanResult.takenCourseList.forEach(course =>
          courseController.retrieveCourseWithOption(course, res)
        );

        res.status(200).json(scanResult);
      })
      .catch(e => {
        return res.status(500).json({ err: e });
      });
  }
);

export default textScanController;
