import express from 'express';
import winston from 'winston';
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
  planController,
  requirementController,
} from './controller';

const app = express();
const { port, mongoDBUri, mongoHostName } = config.env;

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
});

// Apply strategy to passport
applyPassportStrategy(passport);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use((req, res, done) => {
  logger.info(req.originalUrl);
  done();
});

app.use('/', userController);
app.use('/course', courseController);
app.use('/semester', semesterController);
app.use('/program', programController);
app.use('/requirement', requirementController);
app.use('/scan', textScanController);
app.use('/plan', planController);

app.listen(port, () => {
  logger.info(`Started server successfully at port ${port}`);
  mongoose
    .connect(mongoDBUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(() => {
      logger.info(`Connected to MongoDB at ${mongoHostName}`);
    })
    .catch(() => {
      logger.info(`Failed to connect to MongoDB`);
    });
  // mongoose.set('debug', true);
});
