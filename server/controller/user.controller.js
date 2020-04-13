/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

import {
  validateRegisterUser,
  validateLoginUser,
  validateEditProfile,
  validateFetchProfile,
  validateToken,
  checkIfCorrectGradDate,
} from './validation/user.validation';

import {
  generateHashedPassword,
  generateServerErrorCode,
  removeUndefinedObjectProps,
  isObjectEmpty,
  validationHandler,
} from '../store/utils';

import { config } from '../store/config';

import {
  SOME_THING_WENT_WRONG,
  USER_EXISTS_ALREADY,
  WRONG_PASSWORD,
  USER_DOES_NOT_EXIST,
  PARAMETERS_REQUIRED,
  INVALID_GRAD_DATE,
  USER_NOT_FOUND,
  NO_DATA_TO_UPDATE,
} from './constant';

import { User } from '../database/models';

const userController = express.Router();

/**
 * Create a User with email, password, is_admin default = FALSE
 */
userController.createUser = (email, password) => {
  const data = {
    hashedPassword: generateHashedPassword(password),
    email,
    isAdmin: false,
    avatarType: '',
    firstName: '',
    lastName: '',
    school: '',
    bio: '',
    gradDate: {
      term: '',
      year: '',
    },
    major: '',
    minor: '',
    catalogYear: '',
  };

  return new User(data).save();
};

/**
 * POST/
 * Register a user
 */
userController.post('/register', validateRegisterUser, async (req, res) => {
  validationHandler(req, res, async () => {
    try {
      const { email, password } = req.body;
      User.findOne({ email })
        .populate('coursesTaken')
        .then(async foundUser => {
          if (!foundUser) {
            await userController.createUser(email, password);
            // Sign token
            const newUser = await User.findOne({ email });
            const token = jwt.sign({ email }, config.passport.secret, {
              expiresIn: 10000000,
            });

            const userToReturn = { ...newUser.toJSON(), ...{ token } };

            delete userToReturn.hashedPassword;
            res.status(200).json(userToReturn);
          } else
            generateServerErrorCode(
              res,
              403,
              'register email error',
              USER_EXISTS_ALREADY,
              'email'
            );
        });
    } catch (e) {
      generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
    }
  });
});

/**
 * POST/
 * Login a user
 */
userController.post('/login', validateLoginUser, (req, res) => {
  validationHandler(req, res, async () => {
    try {
      const { email, password } = req.body;
      User.findOne({ email })
        .populate({
          path: 'degreePlan',
          model: 'Plan',
          populate: {
            path: 'semesters',
            model: 'Semester',
            populate: {
              path: 'courses',
              model: 'Course',
            },
          },
        })
        .populate('coursesTaken')
        .then(user => {
          if (user && user.email) {
            const isPasswordMatched = user.comparePassword(password);
            if (isPasswordMatched) {
              // Sign token
              const token = jwt.sign({ email }, config.passport.secret, {
                expiresIn: 1000000,
              });
              const userToReturn = { ...user.toJSON(), ...{ token } };
              delete userToReturn.hashedPassword;
              delete userToReturn.__v;

              res.status(200).json(userToReturn);
            } else
              generateServerErrorCode(
                res,
                403,
                'login password error',
                WRONG_PASSWORD,
                'password'
              );
          } else
            generateServerErrorCode(
              res,
              404,
              'login email error',
              USER_DOES_NOT_EXIST,
              'email'
            );
        });
    } catch (e) {
      generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
    }
  });
});

// @route   PUT /profile
// @desc    Edits a user's profile
// @access  Private
userController.put(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  validateEditProfile,
  (req, res) => {
    validationHandler(req, res, async () => {
      const { user } = req;
      const {
        avatarUrl,
        avatarType,
        firstName,
        lastName,
        school,
        bio,
        major,
        minor,
        catalogYear,
        gradDate,
      } = req.body;

      if (
        !avatarUrl &&
        !avatarType &&
        !firstName &&
        !lastName &&
        !school &&
        !bio &&
        !major &&
        !minor &&
        !catalogYear &&
        !gradDate
      ) {
        generateServerErrorCode(
          res,
          400,
          'Parameter is missing',
          PARAMETERS_REQUIRED
        );
      } else if (gradDate && checkIfCorrectGradDate(gradDate) === false) {
        generateServerErrorCode(
          res,
          400,
          'grad date is invalid',
          INVALID_GRAD_DATE
        );
      } else
        try {
          const itemsToBeUpdated = {
            ...(avatarUrl && { avatarUrl }),
            ...(avatarType && { avatarType }),
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(school && { school }),
            ...(bio && { bio }),
            ...(major && { major }),
            ...(minor && { minor }),
            ...(catalogYear && { catalogYear }),
            ...(gradDate && { gradDate }),
          };

          User.updateOne(
            { _id: user._id },
            itemsToBeUpdated,
            (err, updatedUser) => {
              if (err) generateServerErrorCode(res, 500, err, USER_NOT_FOUND);
              else res.status(200).json(updatedUser);
            }
          );
        } catch (e) {
          generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
        }
    });
  }
);

//  @route  PUT /coursesTaken
//  @desc   Updates a user's coursesTaken
//  @access Private
userController.put(
  '/coursesTaken',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    validationHandler(req, res, async () => {
      try {
        const { user } = req;
        const newCoursesTaken = removeUndefinedObjectProps(req.body);

        if (isObjectEmpty(newCoursesTaken)) {
          res.status(400).json({ error: NO_DATA_TO_UPDATE });
        } else {
          User.findByIdAndUpdate(
            { _id: user._id },
            { coursesTaken: newCoursesTaken },
            { useFindAndModify: false, new: true },
            (err, updatedCourses) => {
              if (updatedCourses) {
                console.log(updatedCourses);
                res.status(200).json(updatedCourses);
              } else {
                generateServerErrorCode(
                  res,
                  403,
                  'courses taken update error',
                  USER_NOT_FOUND,
                  'user._id'
                );
              }
            }
          );
        }
      } catch (e) {
        generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
      }
    });
  }
);

//  @route  GET /profile
//  @desc   Fetches a user's profile
//  @access Private
userController.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  validateFetchProfile,
  (req, res) => {
    validationHandler(req, res, () => {
      const { user } = req;
      const {
        email,
        avatarUrl,
        avatarType,
        firstName,
        lastName,
        bio,
        major,
        minor,
        catalogYear,
        gradDate,
      } = req.query;

      try {
        let itemsToBeFetched = {
          ...(email && { email: true }),
          ...(avatarUrl && { avatarUrl: true }),
          ...(avatarType && { avatarType: true }),
          ...(firstName && { firstName: true }),
          ...(lastName && { lastName: true }),
          ...(bio && { bio: true }),
          ...(major && { major: true }),
          ...(minor && { minor: true }),
          ...(catalogYear && { catalogYear: true }),
          ...(gradDate && { gradDate: true }),
        };

        if (Object.keys(itemsToBeFetched).length === 0) {
          itemsToBeFetched = {
            _id: false,
            hashedPassword: false,
            degree_plan_id: false,
            is_admin: false,
          };
        }

        User.findOne({ _id: user._id }, itemsToBeFetched).then(
          (err, fetchedUser) => {
            if (err) generateServerErrorCode(res, 404, err, USER_NOT_FOUND);
            else res.status(200).json(fetchedUser);
          }
        );
      } catch (e) {
        generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
      }
    });
  }
);

//  @route  POST /
//  @desc   Verfiy JWT & Fetches all of a user's data except their password
//  @access Private
userController.post('/identity', validateToken, async (req, res) => {
  validationHandler(req, res, () => {
    const { token } = req.body;
    jwt.verify(token, config.passport.secret, async (err, decodedToken) => {
      if (err) {
        generateServerErrorCode(res, 403, SOME_THING_WENT_WRONG);
      } else {
        const { email } = decodedToken;
        if (!email || email === '') {
          generateServerErrorCode(res, 403, SOME_THING_WENT_WRONG);
        } else {
          User.findOne({ email }, { hashedPassword: 0 })
            .lean()
            .populate({
              path: 'degreePlan',
              model: 'Plan',
              populate: {
                path: 'semesters',
                model: 'Semester',
                populate: {
                  path: 'courses',
                  model: 'Course',
                },
              },
            })
            .populate('coursesTaken')
            .then(user => {
              const userToReturn = { ...user, ...{ token } };
              res.status(200).json(userToReturn);
            })
            .catch(() => {
              generateServerErrorCode(res, 500, SOME_THING_WENT_WRONG);
            });
        }
      }
    });
  });
});

export default userController;
