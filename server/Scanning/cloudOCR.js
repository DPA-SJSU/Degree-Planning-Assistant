import fs from 'fs';
import { promisify } from 'util';
import gCloudVision from '@google-cloud/vision';

import { User, Course, Semester } from '../database/models';

const { ImageAnnotatorClient } = gCloudVision.v1p4beta1;
const readFileAsync = promisify(fs.readFile);

const client = new ImageAnnotatorClient();

const CloudOCR = {};

CloudOCR.TranscriptMapping = new Map();

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
 *
 * @param {*} paragraph
 */
const mergeAllLettersToWord = paragraph => {
  const listOfWordText = [];
  paragraph.words.forEach(word => {
    const wordText = word.symbols.map(symbol => symbol.text).join('');
    listOfWordText.push(wordText);
  });
  return listOfWordText;
};

/**
 * Checking case and Map the info to the right type
 * @param {Array} listOfWordText  A list of words in a sentence
 * @param {String} sentence       A whole sentence which is scanned by OCR
 */
const caseChecking = (listOfWordText, sentence) => {
  const semesterSeason = ['SPRING', 'SUMMER', 'FALL'];
  const creditCondition = ['1.0', '2.0', '3.0'];
  const wstCondition = ['WRITING', 'SKILLS', 'TEST'];

  let otherInfo;
  let currentSemester;
  let startingTermFound = false;
  let count = 0;

  switch (true) {
    case listOfWordText.length === 2 &&
      !Number.isNaN(listOfWordText[1]) &&
      listOfWordText[0].length <= 4:
      CloudOCR.TranscriptMapping.takenCourseList.push(
        getCourseInfo(listOfWordText)
      );
      break;

    case listOfWordText.includes('AP'):
      CloudOCR.TranscriptMapping.takenCourseList.push(sentence);
      break;
    case listOfWordText.includes('SEMESTER') && listOfWordText.length === 3: {
      const semester = {
        term: listOfWordText[0],
        year: parseInt(listOfWordText[2], 10),
        courseTaken: [],
      };

      if (!startingTermFound) {
        CloudOCR.TranscriptMapping.startingSem = semester;
        currentSemester = semester;
        startingTermFound = true;
      } else {
        semester.year = currentSemester.year + count;
        if (semesterSeason.indexOf(listOfWordText[0]) === 2) count += 1;
      }
      CloudOCR.TranscriptMapping.semesterList.push(semester);
      break;
    }
    case listOfWordText.includes('MAJOR'):
      CloudOCR.TranscriptMapping.major = sentence;
      break;
    case creditCondition.some(el => listOfWordText.includes(el)):
      CloudOCR.TranscriptMapping.takenCourseList.push(
        getCourseInfo(listOfWordText)
      );
      break;
    case wstCondition.every(el => listOfWordText.includes(el)):
      if (listOfWordText[listOfWordText.indexOf(':') + 1] === 'ELIGIBLE') {
        otherInfo = `[WST]: Qualify for taking upper courses such as 100W Course`;
      } else {
        otherInfo = `[WST]: NOT Qualify for taking upper courses such as 100W Course`;
      }
      CloudOCR.TranscriptMapping.otherInfo.push(otherInfo);
      break;
    default:
      // console.log(`[Other]: ${sentence}`);
      break;
  }
};

/**
 * Parse Transcript File to get course and semester and other info.
 * @param {Responses received from GCLOUD OCR} responses
 */
const transcriptHandler = responses => {
  CloudOCR.TranscriptMapping = new Map({
    takenCourseList: [],
    semesterList: [],
    otherInfo: [],
  });

  responses.forEach(response => {
    response.fullTextAnnotation.pages.forEach(page => {
      page.blocks.forEach(block => {
        block.paragraphs.forEach(paragraph => {
          const listOfWordText = mergeAllLettersToWord(paragraph);
          const sentence = listOfWordText.join(' ');

          caseChecking(listOfWordText, sentence);
        });
      });
    });
  });

  return CloudOCR.TranscriptMapping;
};

/**
 * Main function that will be called by textScannerController
 */
CloudOCR.scan = async fileName => {
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
    console.log(responses);

    const result = await transcriptHandler(responses);
    return result;
  } catch (e) {
    return e;
  }
};

export default CloudOCR;
