import express from "express";
import logger from "winston";
import bodyParser from "body-parser";
import cors from "cors";
import passport from "passport";
import mysql from "mysql";

import { config } from "./store/config";
import { applyPassportStrategy } from "./store/passport";
import { userController } from "./controller";

var app = express();

// Apply strategy to passport
//applyPassportStrategy(passport);

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

// Set up CORS
app.use(cors());

app.use("/", userController);

/**
 * Get port from environment and store in Express.
 */
const { env, credential } = config;

app.listen(env.port, () => {
  logger.info(`Started successfully server at port ${env.port}`);
  // Connect MySQL
  const connection = mysql.createConnection(credential);
  connection.connect(err => {
    if (err) {
      console.log(err);
      return;
    }
    global.db = connection;
    logger.info(`Database connected successfully`);
  });
});
