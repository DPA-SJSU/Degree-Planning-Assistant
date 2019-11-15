import express from 'express';
import { check, validationResult } from 'express-validator';
import passport from 'passport';
import lodash from 'lodash';

import jwt from 'jsonwebtoken';

import {
  generatehashedPassword,
  generateServerErrorCode,
  checkAllowedKeys,
  isURL
} from '../store/utils';
import { config } from '../store/config';

import {
  PASSWORD_IS_EMPTY,
  PASSWORD_LENGTH_MUST_BE_MORE_THAN_8,
  EMAIL_IS_EMPTY,
  SOME_THING_WENT_WRONG,
  USER_EXISTS_ALREADY
} from './constant';

import { User } from '../database/models.js';

const { ObjectId } = require('mongoose').Types;

const userController = express.Router();

const validationHook = [
  check('email')
    .exists()
    .withMessage(EMAIL_IS_EMPTY),
  check('password')
    .exists()
    .withMessage(PASSWORD_IS_EMPTY)
    .isLength({ min: 8 })
    .withMessage(PASSWORD_LENGTH_MUST_BE_MORE_THAN_8)
];

async function createUser(email, password, role) {
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
userController.post('/', validationHook, async (req, res) => {
  const errorsAfterValidation = validationResult(req);
  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped()
    });
  } else {
    try {
      const { email, password, role } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        await createUser(email, password, role);
        // Sign token
        const newUser = await User.findOne({ email });
        const token = jwt.sign({ email }, config.passport.secret, {
          expiresIn: 10000000
        });

        const userToReturn = { ...newUser.toJSON(), ...{ token } };
        delete userToReturn.hashedPassword;
        res.status(200).json(userToReturn);
      } else {
        generateServerErrorCode(res, 403, USER_EXISTS_ALREADY, 'email');
      }
    } catch (e) {
      generateServerErrorCode(res, 500, SOME_THING_WENT_WRONG);
    }
  }
});

export default userController;
