/* eslint-disable no-restricted-syntax */
import fs from 'fs';
import { promisify } from 'util';
import gCloudVision from '@google-cloud/vision';
import { Course } from '../../database/models';
import { createOrGetOneCourse } from '../utils';

const { ImageAnnotatorClient } = gCloudVision.v1p4beta1;
const readFileAsync = promisify(fs.readFile);

const client = new ImageAnnotatorClient();

const CloudOCR = {};
const school = 'SJSU';
const semesterSeason = ['SPRING', 'SUMMER', 'FALL'];
const creditCondition = ['1.0', '2.0', '3.0'];
const wstCondition = ['WRITING', 'SKILLS', 'TEST'];
const csCode = ['146', '149', '166', '154'];
const semesterStatus = ['IN PROGRESS', 'ENROLLED'];

let startingTermFound = false;
let currentSemIndex = -1;
let count = 0;
let startingSem = {};

const resetMap = () => {
  this.startingTermFound = false;
  this.currentSemIndex = -1;
  this.count = 0;
  this.startingSem = {};

  return {
    semesterList: [],
    otherInfo: [],
    major: '',
  };
};

let TranscriptMap;

/**
 * Checking case and Map the info to the right type
 * @param {Array} words  A list of words in a sentence
 * @param {String} sentence       A whole sentence which is scanned by OCR
 */
const transcriptParser = async paragraph => {
  const words = [];
  paragraph.words.map(word =>
    words.push(word.symbols.map(symbol => symbol.text).join(''))
  );

  const sentence = words.join(' ');

  switch (true) {
    // Check for Enrolling Semester
    case semesterStatus.some(status => sentence.includes(status)):
      TranscriptMap.semesterList[currentSemIndex].status = 1;
      break;

    // GET AP COURSES
    case words.includes('AP'):
      TranscriptMap.otherInfo.push(sentence);
      break;

    // GET SEMESTER
    case words.includes('SEMESTER') && words.length === 3: {
      // 0: Taken
      // 1: In Progress
      const semester = {
        term: words[0],
        year: parseInt(words[2], 10),
        courses: [],
        status: 0,
      };

      if (!startingTermFound) {
        startingSem = semester;
        startingTermFound = true;
      }
      semester.year = startingSem.year + count;
      if (semesterSeason.indexOf(words[0]) === 2) count += 1;
      TranscriptMap.semesterList.push(semester);
      currentSemIndex = TranscriptMap.semesterList.length - 1;
      break;
    }

    // GET MAJOR
    case words.includes('MAJOR'):
      TranscriptMap.major = `${words.slice(2).join(' ')}`;
      break;

    // GET COURSES
    case creditCondition.some(
      credit => words.includes(credit) && words[0].length <= 4
    ) ||
      ((await Course.findOne({ department: words[0] })) &&
        words[1] &&
        words[1].length <= 4 &&
        semesterSeason.every(semester => !words.includes(semester))):
      if (words[0] === 'SE') {
        if (csCode.includes(words[1])) words[0] = 'CS';
        else words[0] = 'CMPE';
      }

      await createOrGetOneCourse({
        code: `${words[0]} ${words[1]}`,
        // title: words.slice(2, words.length - 5).join(' '),
        // credit: creditCondition.includes(words[words.length - 5]) ? words[words.length - 5] : ,
      })
        .then(course => {
          if (TranscriptMap.semesterList[currentSemIndex])
            TranscriptMap.semesterList[currentSemIndex].courses.push(course);
        })
        .catch(e => {
          return e;
        });

      break;

    // Check for WST Eligible
    case wstCondition.every(el => words.includes(el)):
      if (words[words.indexOf(':') + 1] === 'ELIGIBLE') {
        TranscriptMap.otherInfo.push(
          `[WST]: Qualify for taking upper courses such as 100W Course`
        );
      } else {
        TranscriptMap.otherInfo.push(
          `[WST]: NOT Qualify for taking upper courses such as 100W Course`
        );
      }
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
  return TranscriptMap;
};

/**
 * Main function that will be called by textScannerController
 */
CloudOCR.scan = async (fileName, option) => {
  TranscriptMap = resetMap();

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
