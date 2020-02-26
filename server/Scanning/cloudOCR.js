/* eslint-disable no-case-declarations */
/* eslint-disable no-restricted-syntax */
import fs from 'fs';
import { promisify } from 'util';
import gCloudVision from '@google-cloud/vision';

const { ImageAnnotatorClient } = gCloudVision.v1p4beta1;
const readFileAsync = promisify(fs.readFile);

// Creates a client
const client = new ImageAnnotatorClient();

function getCourseInfo(listOfWordText) {
  const school = 'sjsu';
  const code = `${listOfWordText[0]} ${listOfWordText[1]}`;
  const creditIndex = listOfWordText.length - 5;
  const title = listOfWordText.slice(2, creditIndex).join(' ');
  const credit = listOfWordText[creditIndex];
  return { school, code, title, credit };
}

/**
 * IMAGE DECTECTION
 */
// const features = [
//   { type: 'DOCUMENT_LABEL_DETECTION' },
//   { type: 'DOCUMENT_TEXT_DETECTION' },
//   { type: 'DOCUMENT_IMAGE_DETECTION' },
// ];

// const outputConfig = {
//   gcsDestination: {
//     uri: outputUri,
//   },
// };
// END OF IMAGE==========================================

const CloudOCR = {};

async function transcriptHandler(responses) {
  const result = new Map();

  result.takenCourseList = [];
  result.semesterList = [];
  result.otherInfo = [];

  const semesterSeason = ['SPRING', 'SUMMER', 'FALL'];
  const creditCondition = ['1.0', '2.0', '3.0'];
  const wstCondition = ['WRITING', 'SKILLS', 'TEST'];

  let otherInfo = '';
  let startingTermFound = false;
  let currentYear = 0;
  let count = 0;

  for (const response of responses) {
    for (const page of response.fullTextAnnotation.pages) {
      for (const block of page.blocks) {
        for (const paragraph of block.paragraphs) {
          const listOfWordText = [];
          let sentence = '';
          for (const word of paragraph.words) {
            const listOfChar = word.symbols.map(symbol => symbol.text);
            const wordText = listOfChar.join('');
            if (wordText === 'https') {
              break;
            } else listOfWordText.push(wordText);
          }
          // console.log(listOfWordText);
          sentence = listOfWordText.join(' ');

          switch (true) {
            /**
             * Case 1: ListOfWordText is not the whole sentence => Cannot all the info of the course
             * Check:
             * 1. if length = 2 (Course Name + Course Code)
             * 2. 2nd text is a number
             * 3. The course name <= 4 characters
             * TO-DO: Need to call API Get by course code to get course info
             */
            case listOfWordText.length === 2 &&
              !isNaN(listOfWordText[1]) &&
              listOfWordText[0].length <= 4:
              result.takenCourseList.push(getCourseInfo(listOfWordText));
              // console.log(
              //   `[Course 1]: ${listOfWordText[0]} ${listOfWordText[1]}`
              // );
              break;

            case listOfWordText.includes('AP'):
              result.takenCourseList.push(sentence);
              // console.log(`[AP Course]: ${sentence}`);
              break;
            case listOfWordText.includes('SEMESTER') &&
              listOfWordText.length === 3:
              const semester = {
                season: listOfWordText[0],
                year: parseInt(listOfWordText[2], 10),
                courseTaken: [],
              };

              if (!startingTermFound) {
                result.startingSem = semester;
                currentYear = semester.year;
                // console.log(`\n [Starting Semester]: ${sentence}`);
                // console.log(result.startingSem);
                startingTermFound = true;
              } else {
                // console.log(`\n [Semester] ${sentence}`);
                // console.log(result.startingSem.year);

                semester.year = currentYear + count;
                if (semesterSeason.indexOf(listOfWordText[0]) === 2) count += 1;
              }
              result.semesterList.push(semester);
              break;
            case listOfWordText.includes('MAJOR'):
              result.major = sentence;
              break;
            case creditCondition.some(el => listOfWordText.includes(el)):
              const { school, code, title, credit } = getCourseInfo(
                listOfWordText
              );
              result.takenCourseList.push({ school, code, title, credit });
              // console.log(
              //   `[Course 2]: ${school} - ${code} - ${title} - Credit: ${credit}`
              // );
              break;

            case listOfWordText.includes('-'):
              break;
            case wstCondition.every(el => listOfWordText.includes(el)):
              if (
                listOfWordText[listOfWordText.indexOf(':') + 1] === 'ELIGIBLE'
              ) {
                otherInfo = `[WST]: Qualify for taking upper courses such as 100W Course`;
              } else {
                otherInfo = `[WST]: NOT Qualify for taking upper courses such as 100W Course`;
              }
              result.otherInfo.push(otherInfo);
              break;
            default:
              break;
            // console.log(`\n Sentence: ${sentence}`);
          }
        }
      }
    }
  }
  return result;
}

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

    const result = await transcriptHandler(responses);
    return result;
  } catch (e) {
    return e;
  }
};

export default CloudOCR;
