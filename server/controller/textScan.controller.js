/* eslint-disable no-restricted-syntax */
import express from 'express';
// import { Course, Semester } from '../database/models';

import CloudOcr from '../Scanning/cloudOCR';

const textScanController = express.Router();

function getCourseInfo(listOfWordText) {
  const school = 'sjsu';
  const code = `${listOfWordText[0]} ${listOfWordText[1]}`;
  const creditIndex = listOfWordText.length - 5;
  const title = listOfWordText.slice(2, creditIndex).join(' ');
  const credit = listOfWordText[creditIndex];
  return { school, code, title, credit };
}

/**
 * POST/
 * Scan text and input into Course & Semester Schema
 */
textScanController.post('/ocr', (req, res) => {
  const fileName = './Scanning/test/test1.pdf';
  CloudOcr.scan(fileName)
    .then(scanResult => {
      console.log(scanResult);
      res.status(200).json(scanResult);
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
