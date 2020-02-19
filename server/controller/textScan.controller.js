import express from 'express';
// import { Course, Semester } from '../database/models';

import CloudOcr from '../Scanning/cloudOCR';

const textScanController = express.Router();

/**
 * SPRING SEMESTER  2018
UGD - Undergraduate Degree
MAJOR: BS Software Engineering
                                    UA     UG     UE    GR   GP   GPA
ENGR  10     Intro to Engr          3.0    3.0    3.0   A   12.0
MATH  42     Discrete Math          3.0    3.0    3.0   A   12.0
MATH  161A   Appl Prob & Stats I    3.0    3.0    3.0   B+   9.9
SE    131    Software Engr I        3.0    3.0    3.0   A-  11.1
 */

/**
 * POST/
 * Scan text and input into Course & Semester Schema
 */
textScanController.post('/ocr', (req, res) => {
  // const fileName = './pdf-testing.pdf';
  const fileName = './pdf-transcript-testing.pdf';
  CloudOcr.scan(fileName)
    .then(scanResult => {
      return res.status(200).json({ Result: scanResult });
    })
    .catch(e => {
      return res.status(500).json({ err: e });
    });
});

textScanController.post('/plain', (req, res) => {
  const { text } = req.body;

  const semester = {};
  const course = {};

  // Semester: season, year,
  // course: C

  // Scan for Semester
  res.status(200).json('Scan Plain Text POST/ API');
});

export default textScanController;
