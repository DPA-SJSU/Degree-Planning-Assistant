// Imports the Google Cloud client libraries
const vision = require('@google-cloud/vision').v1;

// Creates a client
const client = new vision.ImageAnnotatorClient();

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
// Bucket where the file resides
const bucketName = 'my-bucket';
// Path to PDF file within bucket
const fileName = 'path/to/document.pdf';
// The folder to store the results
const outputPrefix = 'results';

const gcsSourceUri = `gs://${bucketName}/${fileName}`;
const gcsDestinationUri = `gs://${bucketName}/${outputPrefix}/`;

const inputConfig = {
  // Supported mime_types are: 'application/pdf' and 'image/tiff'
  mimeType: 'application/pdf',
  gcsSource: {
    uri: gcsSourceUri,
  },
};
const outputConfig = {
  gcsDestination: {
    uri: gcsDestinationUri,
  },
};
const features = [{ type: 'DOCUMENT_TEXT_DETECTION' }];
const request = {
  requests: [
    {
      inputConfig: inputConfig,
      features: features,
      outputConfig: outputConfig,
    },
  ],
};

const [operation] = await client.asyncBatchAnnotateFiles(request);
const [filesResponse] = await operation.promise();
const destinationUri =
  filesResponse.responses[0].outputConfig.gcsDestination.uri;
console.log('Json saved to: ' + destinationUri);
