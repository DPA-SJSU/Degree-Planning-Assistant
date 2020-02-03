import express from 'express';
import logger from 'winston';
import bodyParser from 'body-parser';
import cors from 'cors';
import passport from 'passport';
import mongoose from 'mongoose';

import { config } from './store/config';
import { applyPassportStrategy } from './store/passport';
<<<<<<< HEAD
import {
  userController,
  courseController,
  semesterController,
  programController
} from './controller';
=======
import { userController, textScanController } from './controller';
>>>>>>> code skeleton for text scanner

const app = express();

// Set up CORS
app.use(cors());

// Apply strategy to passport
applyPassportStrategy(passport);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json());

app.use('/', userController);
<<<<<<< HEAD
app.use('/course', courseController);
app.use('/semester', semesterController);
app.use('/program', programController)
=======
app.user('/scan-text', textScanController);
>>>>>>> code skeleton for text scanner

/**
 * Get port from environment and store in Express.
 */
const { port, mongoDBUri, mongoHostName } = config.env;

app.listen(port, () => {
  logger.info(`Started server successfully at port ${port}`);
  mongoose
    .connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      logger.info(`Connected to mongoDB at ${mongoHostName}`);
<<<<<<< HEAD
    })
    .catch(() => {
      logger.info(`Failed to connect to MongoDB`);
=======
>>>>>>> code skeleton for text scanner
    });
});
