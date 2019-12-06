import express from "express";
import { check, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import sha256 from "sha256";

import {
  generatehashedPassword,
  generateServerErrorCode
} from "../store/utils";

import {
  PASSWORD_IS_EMPTY,
  PASSWORD_LENGTH_MUST_BE_MORE_THAN_8,
  EMAIL_IS_EMPTY,
  SOME_THING_WENT_WRONG,
  USER_EXISTS_ALREADY,
  EMAIL_IS_IN_WRONG_FORMAT,
  WRONG_PASSWORD,
  USER_DOES_NOT_EXIST
} from "./constant";

import { config } from "../store/config";

const userController = express.Router();

const registerValidation = [
  check("email")
    .exists()
    .withMessage(EMAIL_IS_EMPTY),
  check("password")
    .exists()
    .withMessage(PASSWORD_IS_EMPTY)
    .isLength({ min: 8 })
    .withMessage(PASSWORD_LENGTH_MUST_BE_MORE_THAN_8)
];

const loginValidation = [
  check("email")
    .exists()
    .withMessage(EMAIL_IS_EMPTY)
    .isEmail()
    .withMessage(EMAIL_IS_IN_WRONG_FORMAT),
  check("password")
    .exists()
    .withMessage(PASSWORD_IS_EMPTY)
    .isLength({ min: 8 })
    .withMessage(PASSWORD_LENGTH_MUST_BE_MORE_THAN_8)
];

/**
 * GET/
 * Get all Users from the DB
 */
userController.get("/", (req, res) => {
  db.query("SELECT * from User", (err, data, fields) => {
    if (err) {
      console.log("Error while performing Query." + err);
    } else {
      const returnData = { ...data };
      res.status(200).json(returnData);
    }
  });
});

/**
 * POST/
 * Register User with email and password
 */
userController.post("/register", registerValidation, async (req, res) => {
  const errorsAfterValidation = validationResult(req);
  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped()
    });
  } else {
    try {
      const { email, password, name } = req.body;
      const getUserQuery = `SELECT * FROM User WHERE email like '${email}'`;
      const hashedPassword = generatehashedPassword(password);
      const createUserQuery = `INSERT INTO User(email, name, password) values('${email}', '${name}', '${hashedPassword}')`;

      db.query(getUserQuery, (getUserErr, rows) => {
        if (getUserErr) {
          generateServerErrorCode(res, 500, SOME_THING_WENT_WRONG);
        }
        if (rows && rows.length > 0)
          generateServerErrorCode(res, 403, USER_EXISTS_ALREADY, "email");
        else {
          db.query(createUserQuery, (createUserQueryErr, createdUser) => {
            if (createUserQueryErr) {
              generateServerErrorCode(res, 500, SOME_THING_WENT_WRONG);
            } else {
              const token = jwt.sign({ email }, config.passport.secret, {
                expiresIn: 1000000000
              });
              const userToReturn = { ...{ token } };
              delete userToReturn.hashedPassword;

              res.status(200).json(userToReturn);
            }
          });
        }
      });
    } catch (e) {
      generateServerErrorCode(res, 500, SOME_THING_WENT_WRONG);
    }
  }
});

/**
 * POST/
 * Login the user using passport
 */
userController.post("/login", loginValidation, (req, res) => {
  const errorsAfterValidation = validationResult(req);
  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped()
    });
  } else {
    try {
      const { email, password } = req.body;
      const getUserQuery = `SELECT * FROM User WHERE email like '${email}'`;

      db.query(getUserQuery, (getUserErr, rows) => {
        if (getUserErr) {
          generateServerErrorCode(res, 500, SOME_THING_WENT_WRONG);
        }
        if (rows.length == 0)
          generateServerErrorCode(res, 403, USER_DOES_NOT_EXIST, "email");
        else {
          // Compare password
          if (rows[0].password !== sha256(password)) {
            generateServerErrorCode(res, 403, WRONG_PASSWORD, "password");
          } else {
            const token = jwt.sign({ email }, config.passport.secret, {
              expiresIn: 1000000000
            });
            const userToReturn = { ...{ token } };
            delete userToReturn.hashedPassword;
            res.status(200).json(userToReturn);
          }
        }
      });
    } catch (e) {
      generateServerErrorCode(res, 500, SOME_THING_WENT_WRONG);
    }
  }
});

export default userController;
