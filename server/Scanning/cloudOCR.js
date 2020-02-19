/* eslint-disable no-restricted-syntax */
import fs from 'fs';
import { promisify } from 'util';
import gCloudVision from '@google-cloud/vision';

const { ImageAnnotatorClient } = gCloudVision.v1p4beta1;
const readFileAsync = promisify(fs.readFile);

// Creates a client
const client = new ImageAnnotatorClient();

const CloudOCR = {};

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
    const [result] = await client.batchAnnotateFiles(request);
    const { responses } = result.responses[0];
    const listOfWords = [];

    for (const response of responses) {
      for (const page of response.fullTextAnnotation.pages) {
        for (const block of page.blocks) {
          for (const paragraph of block.paragraphs) {
            let wordText = '';
            let listOfWordText = [];
            for (const word of paragraph.words) {
              const listOfChar = word.symbols.map(symbol => symbol.text);
              wordText = listOfChar.join('');
              listOfWordText.push(wordText);
              // console.log(`Word text: ${wordText}`);
            }
            const sentence = listOfWordText.join(' ');
            if (listOfWordText.includes('SEMESTER')) {
              console.log(
                `[Semester]: ${listOfWordText[0]}/ ${listOfWordText[2]}`
              );
            } else if (listOfWordText.includes('MAJOR')) {
              console.log(`${listOfWordText}`);
            } else if (
              listOfWordText.includes('3.0') ||
              listOfWordText.includes('1.0')
            ) {
              console.log(
                `[Course]: ${listOfWordText[0]} ${listOfWordText[1]}`
              );
            } else console.log(`Others: ${sentence}`);
          }
        }
      }
    }
    return listOfWords;
  } catch (e) {
    console.log(e);
    return 0;
  }
};

export default CloudOCR;
