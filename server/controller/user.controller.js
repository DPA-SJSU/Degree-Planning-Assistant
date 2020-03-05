import express from 'express';
import passport from 'passport';

import logger from 'winston';

import {
  validateRegisterUser,
  validateLoginUser,
  validateEditProfile,
  validateFetchProfile,
  validateFetchCoursesTaken,
  checkIfCorrectGradDate,
} from './validation/user.validation';
import { validationResult } from 'express-validator';

import jwt from 'jsonwebtoken';

import {
  generateHashedPassword,
  generateServerErrorCode,
} from '../store/utils';
import { config } from '../store/config';

import {
  SOME_THING_WENT_WRONG,
  USER_EXISTS_ALREADY,
  WRONG_PASSWORD,
  USER_DOES_NOT_EXIST,
  PARAMETERS_REQUIRED,
  SERVER_ERROR,
  INVALID_GRAD_DATE,
  USER_NOT_FOUND,
} from './constant';

import { User } from '../database/models';

const userController = express.Router();

function createUser(email, password) {
  const data = {
    email,
    hashedPassword: generateHashedPassword(password),
    avatarUrl: '',
    avatarType: '',
    firstName: '',
    lastName: '',
    bio: '',
    isAdmin: false,
    coursesTaken: [],
    gradDate: { year: undefined, term: '' },
    major: '',
    minor: '',
    catalogYear: undefined,
    degreePlanId: undefined,
  };

  const user = new User(data);
  return user.save();
}

/**
 * POST/
 * Register a user
 */
userController.post('/register', validateRegisterUser, async (req, res) => {
  const errorsAfterValidation = validationResult(req);
  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped(),
    });
  } else {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        await createUser(email, password);
        // Sign token
        const newUser = await User.findOne({ email });
        const token = jwt.sign({ email }, config.passport.secret, {
          expiresIn: 10000000,
        });

        const userToReturn = { ...newUser.toJSON(), ...{ token } };

        delete userToReturn.hashedPassword;
        res.status(200).json(userToReturn);
      } else {
        generateServerErrorCode(
          res,
          403,
          'register email error',
          USER_EXISTS_ALREADY,
          'email'
        );
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
userController.post('/login', validateLoginUser, async (req, res) => {
  const errorsAfterValidation = validationResult(req);
  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped(),
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
            expiresIn: 1000000,
          });
          const userToReturn = { ...user.toJSON(), ...{ token } };
          delete userToReturn.hashedPassword;
          res.status(200).json(userToReturn);
        } else {
          generateServerErrorCode(
            res,
            403,
            'login password error',
            WRONG_PASSWORD,
            'password'
          );
        }
      } else {
        generateServerErrorCode(
          res,
          404,
          'login email error',
          USER_DOES_NOT_EXIST,
          'email'
        );
      }
    } catch (e) {
      generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
    }
  }
});

// @route   PUT /profile
// @desc    Edits a user's profile
// @access  Private
userController.put(
  '/profile/:userId',
  passport.authenticate('jwt', { session: false }),
  validateEditProfile,
  async (req, res) => {
    // Check if the validators caught any invalid inputs
    const errors = validationResult(req);
    if (errors.isEmpty() === false) {
      return res.status(400).json(errors);
    }

    const { userId } = req.params;
    const {
      avatarUrl,
      avatarType,
      firstName,
      lastName,
      bio,
      major,
      minor,
      catalogYear,
      gradDate,
    } = req.body;

    // Check if the client had included at least one data to be changed
    if (
      !avatarUrl &&
      !avatarType &&
      !firstName &&
      !lastName &&
      !bio &&
      !major &&
      !minor &&
      !catalogYear &&
      !gradDate
    ) {
      // Client did not include data to be changed so there is nothing to be updated, return error code
      return res.status(400).json({ errors: PARAMETERS_REQUIRED });
    }

    // Check if the client had inputted gradDate and check if it's a valid object input
    if (gradDate && checkIfCorrectGradDate(gradDate) === false) {
      return res.status(400).json({ errors: INVALID_GRAD_DATE });
    }

    try {
      // Create an object containing the items to be changed and their new values
      // The following code adds key:value pairs from the request into an object. It checks if the key
      // exists before adding it into the object. It is important that we don't include keys that
      // don't exist so that their values in the database aren't changed.
      const itemsToBeUpdated = {
        ...(avatarUrl && { avatarUrl: avatarUrl }),
        ...(avatarType && { avatarType: avatarType }),
        ...(firstName && { firstName: firstName }),
        ...(lastName && { lastName: lastName }),
        ...(bio && { bio }),
        ...(major && { major }),
        ...(minor && { minor }),
        ...(catalogYear && { catalogYear: catalogYear }),
        ...(gradDate && { gradDate: gradDate }),
      };

      // Query the database with the data to be changed and the id of the user to be changed
      const updatedUser = await User.updateOne(
        { _id: userId },
        itemsToBeUpdated
      );

      // If there is a value that had been modified then the update was successful.
      if (updatedUser.n > 0) {
        return res.status(200).json();
      } else {
        // Otherwise no document was changed therefore we return a 404 not found error code.
        return res.status(404).json({ errors: USER_NOT_FOUND });
      }
    } catch (databaseError) {
      // Our code caused an error, so we return error code 500 server error
      logger.info(databaseError);
      return res.status(500).json({ errors: SERVER_ERROR });
    }
  }
);

//  @route  PUT /coursesTaken
//  @desc   Updates a user's coursesTaken
//  @access Private
userController.put(
  '/coursesTaken',
  passport.authenticate('jwt', { session: false }),
  validateFetchCoursesTaken,
  async (req, res) => {
    const errorsAfterValidation = validationResult(req);
    if (!errorsAfterValidation.isEmpty()) {
      res.status(400).json({
        code: 400,
        errors: errorsAfterValidation.mapped(),
      });
    } else {
      try {
        // Get course ObjectId from query
        const userId = req.query.userId;
        const coursesTaken = req.body;

        // Query the database with the data to be changed and the id of the user to be changed
        const updatedUser = await User.updateOne({ _id: userId }, coursesTaken);

        // If there is a value that had been modified then the update was successful.
        if (updatedUser.n > 0) {
          res.status(200).json(updatedUser.n);
        } else {
          generateServerErrorCode(
            res,
            403,
            'courses taken update error',
            USER_NOT_FOUND,
            'userId'
          );
        }
      } catch (e) {
        generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
      }
    }
  }
);

//  @route  GET /profile
//  @desc   Fetches a user's profile
//  @access Private
userController.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  // validateFetchProfile,
  async (req, res) => {
    let errors = validationResult(req);

    if (errors.isEmpty() === false) {
      return res.status(400).json(errors);
    }

    const { user } = req;
    const {
      email,
      avatarUrl,
      avatarType,
      firstName,
      lastName,
      bio,
      coursesTaken,
      major,
      minor,
      catalogYear,
      gradDate,
    } = req.query;

    try {
      // Check if client specified which fields to fetch
      // If field is specified, add them to an object which will be used for projection
      let itemsToBeFetched = {
        ...(email && { email: true }),
        ...(avatarUrl && { avatarUrl: true }),
        ...(avatarType && { avatarType: true }),
        ...(firstName && { firstName: true }),
        ...(lastName && { lastName: true }),
        ...(bio && { bio: true }),
        ...(coursesTaken && { coursesTaken: true }),
        ...(major && { major: true }),
        ...(minor && { minor: true }),
        ...(catalogYear && { catalogYear: true }),
        ...(gradDate && { gradDate: true }),
      };

      let fetchedUser;

      // If client doesn't specify anything, fetch everything but the unnecessary fields
      if (Object.keys(itemsToBeFetched).length === 0) {
        itemsToBeFetched = {
          _id: false,
          hashedPassword: false,
          degreePlanId: false,
          isAdmin: false,
        };
        fetchedUser = await User.findOne(
          { _id: user._id },
          itemsToBeFetched
        ).populate('coursesTaken');
      } else if (itemsToBeFetched.coursesTaken) {
        fetchedUser = await User.findOne(
          { _id: user._id },
          itemsToBeFetched
        ).populate('coursesTaken');
      } else {
        // Fetch the document using the projection object
        fetchedUser = await User.findOne({ _id: user._id }, itemsToBeFetched);
      }

      // Check if document was fetched. if so, include in response
      if (fetchedUser) {
        return res.status(200).json(fetchedUser);
      } else {
        // Otherwise return a 404 not found error code
        return res.status(404).json({ errors: USER_NOT_FOUND });
      }
    } catch (databaseError) {
      console.log(databaseError);
      logger.info(databaseError);
      console.log('Thee error: ', databaseError);
      return res.status(500).json({ errors: SERVER_ERROR });
    }
  }
);

export default userController;
