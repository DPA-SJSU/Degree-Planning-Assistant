import fs from 'fs';
import { promisify } from 'util';
import gCloudVision from '@google-cloud/vision';

const { ImageAnnotatorClient } = gCloudVision.v1p4beta1;
const readFileAsync = promisify(fs.readFile);

const client = new ImageAnnotatorClient();

const CloudOCR = {};

let DocumentMapping = new Map();
const TranscriptMapping = new Map();
TranscriptMapping.takenCourseList = [];
TranscriptMapping.semesterList = [];
TranscriptMapping.otherInfo = [];

let otherInfo = [];
let currentSemester = -1;
let startingTermFound = false;
let count = 0;

/**
 * Add Course to the current Semester
 * @param {Object} course
 */
const addCourseToSemester = course => {
  TranscriptMapping.takenCourseList.push(course);
  if (TranscriptMapping.semesterList[currentSemester])
    TranscriptMapping.semesterList[currentSemester].courses.push(course);
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

const programParser = async paragraph => {
  const listOfWordText = [];
  paragraph.words.forEach(word => {
    const wordText = word.symbols.map(symbol => symbol.text).join('');
    listOfWordText.push(wordText);
  });

  const sentence = listOfWordText.join(' ');
  switch (true) {
    default:
      break;
  }
};

/**
 * Checking case and Map the info to the right type
 * @param {Array} listOfWordText  A list of words in a sentence
 * @param {String} sentence       A whole sentence which is scanned by OCR
 */
const transcriptParser = async paragraph => {
  // Use for Transcript checking
  const semesterSeason = ['SPRING', 'SUMMER', 'FALL'];
  const creditCondition = ['1.0', '2.0', '3.0'];
  const wstCondition = ['WRITING', 'SKILLS', 'TEST'];

  const listOfWordText = [];
  paragraph.words.forEach(word => {
    const wordText = word.symbols.map(symbol => symbol.text).join('');
    listOfWordText.push(wordText);
  });

  const sentence = listOfWordText.join(' ');
  console.log(sentence);

  switch (true) {
    // Check for AP Courses
    case listOfWordText.includes('AP'):
      TranscriptMapping.otherInfo.push(sentence);
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

      if (!startingTermFound) {
        TranscriptMapping.startingSem = semester;
        startingTermFound = true;
      } else {
        semester.year = TranscriptMapping.startingSem.year + count;
        if (semesterSeason.indexOf(listOfWordText[0]) === 2) count += 1;
      }
      TranscriptMapping.semesterList.push(semester);
      currentSemester = TranscriptMapping.semesterList.length - 1;
      break;
    }

    // Check for Major
    case listOfWordText.includes('MAJOR'):
      TranscriptMapping.major = `${listOfWordText.slice(2).join(' ')}`;
      break;

    // Check for Course using creditCondition List
    case (creditCondition.some(credit => listOfWordText.includes(credit)) &&
      listOfWordText[0].length <= 4) ||
      (listOfWordText.length === 2 &&
        listOfWordText[0].length <= 4 &&
        !isNaN(listOfWordText[1])):
      await addCourseToSemester(getCourseInfo(listOfWordText));
      break;

    // Check for WST Eligible
    case wstCondition.every(el => listOfWordText.includes(el)):
      if (listOfWordText[listOfWordText.indexOf(':') + 1] === 'ELIGIBLE') {
        otherInfo = `[WST]: Qualify for taking upper courses such as 100W Course`;
      } else {
        otherInfo = `[WST]: NOT Qualify for taking upper courses such as 100W Course`;
      }
      TranscriptMapping.otherInfo.push(otherInfo);
      break;

    // Check for Semester Student is enrolling
    case listOfWordText.includes('IN PROGRESS') ||
      listOfWordText.includes('ENROLLED'):
      TranscriptMapping.semesterList[currentSemester].status = 1;
      break;
    default:
      break;
  }
};

/**
 * Parse Transcript File to get course and semester and other info.
 * @param {Object} responses Responses received from GCLOUD OCR
 */
const documentHandler = (responses, option) => {
  responses.forEach(response => {
    response.fullTextAnnotation.pages.forEach(page => {
      page.blocks.forEach(block => {
        block.paragraphs.forEach(paragraph => {
          switch (option) {
            case 'transcript':
              transcriptParser(paragraph);
              break;
            case 'program':
              programParser(paragraph);
              break;
            default:
              break;
          }
        });
      });
    });
  });
  return TranscriptMapping;
};

/**
 * Main function that will be called by textScannerController
 */
CloudOCR.scan = async (fileName, option) => {
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
