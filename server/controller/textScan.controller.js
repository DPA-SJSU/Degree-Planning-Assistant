import express from 'express';
import { Course, Semester } from '../database/models';

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
textScanController.post('/', (req, res) => {
  const { text } = req.body;

  const semester = {};
  const course = {};

  // Semester: season, year,
  // course: C

  // Scan for Semester
});

export default textScanController;
