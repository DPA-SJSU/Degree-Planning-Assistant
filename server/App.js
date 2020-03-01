import express from 'express';
import logger from 'winston';
import bodyParser from 'body-parser';
import cors from 'cors';
import passport from 'passport';
import mongoose from 'mongoose';

import { config } from './store/config';
import { applyPassportStrategy } from './store/passport';
import {
  userController,
  courseController,
  semesterController,
  programController,
  textScanController,
} from './controller';

const app = express();
const { port, mongoDBUri, mongoHostName } = config.env;

// Apply strategy to passport
applyPassportStrategy(passport);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', userController);
app.use('/course', courseController);
app.use('/semester', semesterController);
app.use('/program', programController);
app.use('/scan', textScanController);

app.listen(port, () => {
  logger.info(`Started server successfully at port ${port}`);
  mongoose
    .connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      logger.info(`Connected to mongoDB at ${mongoHostName}`);
    })
    .catch(() => {
      logger.info(`Failed to connect to MongoDB`);
    });
});
