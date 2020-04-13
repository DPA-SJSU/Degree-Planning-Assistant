/* eslint-disable no-restricted-syntax */
import fs from 'fs';
import { promisify } from 'util';
import gCloudVision from '@google-cloud/vision';
import { Course } from '../../database/models';
import courseController from '../../controller/course.controller';

const { ImageAnnotatorClient } = gCloudVision.v1p4beta1;
const readFileAsync = promisify(fs.readFile);

const client = new ImageAnnotatorClient();

const CloudOCR = {};

const setupTranscriptMapping = () => {
  CloudOCR.TranscriptMapping = new Map();
  CloudOCR.TranscriptMapping.takenCourseList = [];
  CloudOCR.TranscriptMapping.semesterList = [];
  CloudOCR.TranscriptMapping.otherInfo = [];
  CloudOCR.TranscriptMapping.currentSemester = -1;
  CloudOCR.TranscriptMapping.otherInfo = [];
  CloudOCR.TranscriptMapping.startingTermFound = false;
  CloudOCR.TranscriptMapping.count = 0;
  CloudOCR.TranscriptMapping.school = 'SJSU';
  CloudOCR.TranscriptMapping.catalogYear = '18-19';
};

/**
 * Add Course to the current Semester
 * @param {Object} course
 */
const addCourseToSemester = course => {
  CloudOCR.TranscriptMapping.takenCourseList.push(course);
  if (
    CloudOCR.TranscriptMapping.semesterList[
      CloudOCR.TranscriptMapping.currentSemester
    ]
  )
    CloudOCR.TranscriptMapping.semesterList[
      CloudOCR.TranscriptMapping.currentSemester
    ].courses.push(course);
};

/**
 * Used in transcriptHandler() to get course info
 * @param {A String: contains all info of the course} listOfWordText
 */
const getCourseInfo = listOfWordText => {
  const school = 'SJSU';
  const code = `${listOfWordText[0]} ${listOfWordText[1]}`;
  const creditIndex = listOfWordText.length - 5;
  const title = listOfWordText.slice(2, creditIndex).join(' ');
  const credit = listOfWordText[creditIndex];
  return { school, code, title, credit };
};

/**
 * Checking case and Map the info to the right type
 * @param {Array} listOfWordText  A list of words in a sentence
 * @param {String} sentence       A whole sentence which is scanned by OCR
 */
const transcriptParser = async paragraph => {
  const semesterSeason = ['SPRING', 'SUMMER', 'FALL'];
  const creditCondition = ['1.0', '2.0', '3.0'];
  const wstCondition = ['WRITING', 'SKILLS', 'TEST'];

  const listOfWordText = [];
  paragraph.words.forEach(word => {
    const wordText = word.symbols.map(symbol => symbol.text).join('');
    listOfWordText.push(wordText);
  });

  const sentence = listOfWordText.join(' ');

  switch (true) {
    // Check for AP Courses
    case listOfWordText.includes('AP'):
      CloudOCR.TranscriptMapping.otherInfo.push(sentence);
      break;

    // Check for Semester
    case listOfWordText.includes('SEMESTER') && listOfWordText.length === 3: {
      // 0: Taken
      // 1: In Progress
      const semester = {
        term: listOfWordText[0],
        year: parseInt(listOfWordText[2], 10),
        courses: [],
        status: 0,
      };

      if (!CloudOCR.TranscriptMapping.startingTermFound) {
        CloudOCR.TranscriptMapping.startingSem = semester;
        CloudOCR.TranscriptMapping.startingTermFound = true;
      } else {
        semester.year =
          CloudOCR.TranscriptMapping.startingSem.year +
          CloudOCR.TranscriptMapping.count;
        if (semesterSeason.indexOf(listOfWordText[0]) === 2)
          CloudOCR.TranscriptMapping.count += 1;
      }
      CloudOCR.TranscriptMapping.semesterList.push(semester);
      CloudOCR.TranscriptMapping.currentSemester =
        CloudOCR.TranscriptMapping.semesterList.length - 1;
      break;
    }

    // Check for Major
    case listOfWordText.includes('MAJOR'):
      CloudOCR.TranscriptMapping.major = `${listOfWordText.slice(2).join(' ')}`;
      break;

    // Check for Course
    case creditCondition.some(credit => listOfWordText.includes(credit)) ||
      (!isNaN(listOfWordText[1]) &&
        semesterSeason.every(semester => !listOfWordText.includes(semester))):
      await Course.findOne({
        department: listOfWordText[0],
        code: listOfWordText[1],
      })
        .then(foundCourse => {
          if (foundCourse) {
            const { school, department, code, title } = foundCourse;
            addCourseToSemester({
              school,
              code: `${department} ${code}`,
              title,
            });
          } else if (!foundCourse) {
            addCourseToSemester(getCourseInfo(listOfWordText));
          }
        })
        .catch(e => {
          console.log(`Db error`, e);
        });

      break;

    // Check for WST Eligible
    case wstCondition.every(el => listOfWordText.includes(el)):
      if (listOfWordText[listOfWordText.indexOf(':') + 1] === 'ELIGIBLE') {
        CloudOCR.TranscriptMapping.otherInfo.push(
          `[WST]: Qualify for taking upper courses such as 100W Course`
        );
      } else {
        CloudOCR.TranscriptMapping.otherInfo.push(
          `[WST]: NOT Qualify for taking upper courses such as 100W Course`
        );
      }
      break;

    // Check for Semester Student is enrolling
    case listOfWordText.includes('IN PROGRESS') ||
      listOfWordText.includes('ENROLLED'):
      CloudOCR.TranscriptMapping.semesterList[
        CloudOCR.TranscriptMapping.currentSemester
      ].status = 1;
      break;
    default:
      break;
  }
};

/**
 * Parse Transcript File to get course and semester and other info.
 * @param {Object} responses Responses received from GCLOUD OCR
 */
const documentHandler = async (responses, option) => {
  for (const response of responses) {
    for (const page of response.fullTextAnnotation.pages) {
      for (const block of page.blocks) {
        for (const paragraph of block.paragraphs) {
          switch (option) {
            case 'transcript':
              await transcriptParser(paragraph);
              break;
            case 'program':
              break;
            default:
              break;
          }
        }
      }
    }
  }
  return CloudOCR.TranscriptMapping;
};

/**
 * Main function that will be called by textScannerController
 */
CloudOCR.scan = async (fileName, option) => {
  setupTranscriptMapping();

  const inputConfig = {
    mimeType: 'application/pdf',
    content: await readFileAsync(fileName),
  };

  const features = [{ type: 'DOCUMENT_TEXT_DETECTION' }];

  const request = {
    requests: [
      {
        inputConfig,
        features,
        // First page starts at 1, and not 0. Last page is -1.
        pages: [1, 2, 3, 4, -1],
      },
    ],
  };

  try {
    const [resultFromOCR] = await client.batchAnnotateFiles(request);
    const { responses } = resultFromOCR.responses[0];
    const result = await documentHandler(responses, option);
    return result;
  } catch (e) {
    return e;
  }
};

export default CloudOCR;
