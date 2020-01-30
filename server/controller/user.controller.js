import express from 'express';
import { check, validationResult } from 'express-validator';

import jwt from 'jsonwebtoken';

import {
  generatehashedPassword,
  generateServerErrorCode
} from '../store/utils';
import { config } from '../store/config';

import {
  PASSWORD_IS_EMPTY,
  PASSWORD_LENGTH_MUST_BE_MORE_THAN_8,
  EMAIL_IS_EMPTY,
  EMAIL_IS_IN_WRONG_FORMAT,
  SOME_THING_WENT_WRONG,
  USER_EXISTS_ALREADY,
  WRONG_PASSWORD,
  USER_DOES_NOT_EXIST
} from './constant';

import { User } from '../database/models';

const userController = express.Router();

const validationHook = [
  check('email')
    .exists()
    .withMessage(EMAIL_IS_EMPTY)
    .isEmail()
    .withMessage(EMAIL_IS_IN_WRONG_FORMAT),
  check('password')
    .exists()
    .withMessage(PASSWORD_IS_EMPTY)
    .isLength({ min: 8 })
    .withMessage(PASSWORD_LENGTH_MUST_BE_MORE_THAN_8)
];

const validationLoginHook = [
  check('email')
    .exists()
    .withMessage(EMAIL_IS_EMPTY)
    .isEmail()
    .withMessage(EMAIL_IS_IN_WRONG_FORMAT),
  check('password')
    .exists()
    .withMessage(PASSWORD_IS_EMPTY)
    .isLength({ min: 8 })
    .withMessage(PASSWORD_LENGTH_MUST_BE_MORE_THAN_8)
];

function createUser(email, password) {
  let user;
  const data = {
    email,
    hashedPassword: generatehashedPassword(password)
  };
  
  user = new User(data);
  return user.save();
}

/**
 * POST/
 * Register a user
 */
userController.post('/register', validationHook, async (req, res) => {
  const errorsAfterValidation = validationResult(req);
  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped()
    });
  } else {
    try {
      const { email, password } = req.body;
      
      const user = await User.findOne({ email });
      if (!user) {
        const createdUser = await createUser(email, password);
        // Sign token
        const newUser = await User.findOne({ email });
        const token = jwt.sign({ email }, config.passport.secret, {
          expiresIn: 10000000
        });
        
        const userToReturn = { ...newUser.toJSON(), ...{ token } };

        delete userToReturn.hashedPassword;
        res.status(200).json(userToReturn);
      } else {
        generateServerErrorCode(res, 403, 'register email error', USER_EXISTS_ALREADY, 'email');
      }
    } catch (e) {
      generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
    }
  }
});

/**
 * POST/
 * Login a user
 */
userController.post('/login', validationLoginHook, async (req, res) => {
  const errorsAfterValidation = validationResult(req);
  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped()
    });
  } else {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (user && user.email) {
        const isPasswordMatched = user.comparePassword(password);
        if (isPasswordMatched) {
          // Sign token
          const token = jwt.sign({ email }, config.passport.secret, {
            expiresIn: 1000000
          });
          const userToReturn = { ...user.toJSON(), ...{ token } };
          delete userToReturn.hashedPassword;
          res.status(200).json(userToReturn);
        } else {
          generateServerErrorCode(res, 403, 'login password error', WRONG_PASSWORD, 'password');
        }
      } else {
        generateServerErrorCode(res, 404, 'login email error', USER_DOES_NOT_EXIST, 'email');
      }
    } catch (e) {
      generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
    }
  }
});

export default userController;
