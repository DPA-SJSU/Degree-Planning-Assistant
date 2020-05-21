/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import ejs from 'ejs';

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
  createUser,
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
  TOKEN_IS_INVALID,
  EMAIL_IS_ALREADY_VERIFIED,
} from './constant';

import { User } from '../database/models';

import Mailing from '../store/mailing';

const userController = express.Router();
const { serverURI, clientURI } = config.env;

const { serverURI, clientURI } = config.env;

/**
 * POST/
 * Register a user
 */
userController.post('/register', validateRegisterUser, async (req, res) => {
  validationHandler(req, res, () => {
    try {
      const { email, password } = req.body;
      User.findOne({ email })
        .populate('coursesTaken')
        .then(foundUser => {
          if (!foundUser) {
            const emailToken = crypto.randomBytes(20).toString('hex');
            const confirmedURL = `${serverURI}/confirm?token=${emailToken}&email=${email}`;
            const template = 'registerConfirmation';

            createUser(email, password, emailToken);

            // Send Email
            Mailing.sendEmail({ email, template, confirmedURL })
              .then(info => res.status(200).json(info))
              .catch(e => {
                generateServerErrorCode(
                  res,
                  500,
                  FAILED_TO_SEND_EMAIL,
                  'email'
                );
              });
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
 * GET/
 * confirm email
 */
userController.get('/confirm', (req, res) => {
  let { token, email } = req.query;
  User.findOneAndUpdate(
    { token },
    { emailConfirmed: true, token: '' },
    { new: true }
  )
    .then(updatedUser => {
      if (!updatedUser) {
        const error = {
          errors: {
            server: {
              msg: EMAIL_IS_ALREADY_VERIFIED,
            },
          },
          message: `Your email is already verified. Please login with ${email}`,
        };
        return res.status(403).json(error);
      }

      const filePath = `${__dirname}/../templates/confirmedEmail.ejs`;
      const url = `${clientURI}/login`;
      res.render(filePath, { email, url });
    })
    .catch(e => {
      console.log(e);
      return generateServerErrorCode(res, 403, TOKEN_IS_INVALID, 'email');
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

      // Check email confirmed
      if (user && !user.emailConfirmed) {
        generateServerErrorCode(res, 403, EMAIL_IS_NOT_CONFIRMED, 'email');
      } else if (user && user.email && user.emailConfirmed) {
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
      }
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

userController.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/plus.login',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  })
);

userController.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${clientURI}/login` }),
  (req, res) => {
    const { user } = req;
    const { email } = user;
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
        const token = jwt.sign({ email }, config.passport.secret, {
          expiresIn: 10000000,
        });
        const userToReturn = { ...user, ...{ token } };
        res.status(200).json(userToReturn);
      })
      .catch(e => generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG));
  }
);
/**
 * DELETE/
 * Remove a user
 * Used by admin only
 */
userController.delete('/', (req, res) => {
  const { email } = req.body;
  User.deleteOne({ email }, (err, status) => {
    if (err) res.status(500).json(`fail to remove user ${email}`);
    else res.status(200).json(status);
  });
});

export default userController;
