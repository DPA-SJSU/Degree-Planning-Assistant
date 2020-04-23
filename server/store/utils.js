/* eslint-disable no-await-in-loop */
/* eslint-disable no-use-before-define */
/* eslint-disable no-async-promise-executor */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-syntax */
import sha256 from 'sha256';
import { validationResult } from 'express-validator';
import Mongoose from 'mongoose';
import {
  User,
  Course,
  Semester,
  Plan,
  Requirement,
  RemainingRequirement,
} from '../database/models';

import {
  SEMESTER_NOT_FOUND,
  SOME_THING_WENT_WRONG,
  SCHOOL_DOES_NOT_EXIST,
} from '../controller/constant';

const ObjectID = Mongoose.Types.ObjectId;

export const generateHashedPassword = password => sha256(password);

export const generateServerErrorCode = (
  res,
  code,
  fullError = '',
  msg,
  location = 'server'
) => {
  const errors = {};
  errors[location] = {
    fullError,
    msg,
  };

  return res.status(code).json({
    code,
    errors,
  });
};

export const validationHandler = (req, res, next) => {
  const errorsAfterValidation = validationResult(req);
  if (!errorsAfterValidation.isEmpty()) {
    return res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped(),
    });
  }

  return next();
};

export const checkAllowedKeys = (allowedKeys, keys) => {
  if ((allowedKeys && allowedKeys.length > 0) || (keys && keys.length > 0)) {
    for (let i = 0; i < keys.length; i += 1) {
      if (!allowedKeys.includes(keys[i])) {
        return false;
      }
    }
    return true;
  }
  return false;
};

/**
 * Removes the undefined properties of an object
 * Found: https://stackoverflow.com/questions/25421233/javascript-removing-undefined-fields-from-an-object/38340374#38340374
 * @param {Object} obj
 */
export const removeUndefinedObjectProps = obj => {
  Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
  return obj;
};

export const isObjectEmpty = obj => {
  return Object.keys(obj).length === 0;
};

export const groupBy = (xs, key1, key2) => {
  return xs.reduce((rv, x) => {
    (rv[`${x[key1]}-${x[key2]}`] = rv[`${x[key1]}-${x[key2]}`] || []).push(x);
    return rv;
  }, {});
};

/**
 * ============================================
 * User Helpers
 * ============================================
 */

export const createUser = (email, password) => {
  const data = {
    hashedPassword: generateHashedPassword(password),
    email,
    isAdmin: false,
    avatarType: '',
    firstName: '',
    lastName: '',
    school: '',
    bio: '',
    gradDate: '',
    major: '',
    minor: '',
    catalogYear: '',
  };

  return new User(data).save();
};

/**
 * ============================================
 * Course Helpers
 * ============================================
 */

/**
 * Creates/Get get a course
 * @param {courseInfo} data
 * @returns {Course} Course
 */
export const createOrGetOneCourse = async data => {
  return new Promise((resolve, reject) => {
    const {
      school = 'SJSU',
      code,
      type = -1,
      prerequisites = [],
      corequisites = [],
      // title = ' ',
      // credit = ' ',
    } = data;

    const splitCourseString = code.split(' ');
    const department = splitCourseString[0];
    const courseCode = splitCourseString[1].replace(/^0+/, '');

    Course.findOne({
      school,
      department,
      code: courseCode,
    })
      .then(async foundCourse => {
        [data.prerequisites, data.corequisites] = await Promise.all([
          createOrGetAllCourse(prerequisites),
          createOrGetAllCourse(corequisites),
        ]);

        if (foundCourse) {
          if (type >= 0 && !foundCourse.type.includes(type))
            foundCourse.type.push(type);
          // foundCourse.title = title || ' ';
          // foundCourse.credit = credit || ' ';
          // foundCourse.prerequisites =
          //   data.prerequisites.length > 0 ? data.prerequisites : [];
          // foundCourse.corequisites =
          //   data.corequisites.length > 0 ? data.corequisites : [];

          return resolve(foundCourse.save());
        }

        data = {
          ...data,
          department,
          // prerequisites: data.prerequisites || [],
          // corequisites: data.corequisites || [],
          code: courseCode,
          type: type >= 0 ? [type] : [],
        };

        return resolve(new Course(data).save());
      })
      .catch(e => {
        reject(e);
      });
  });
};

/**
 * Get info of all courses
 * @param {[Object]} courses Array of codes
 */
export const createOrGetAllCourse = courses => {
  return new Promise((resolve, reject) => {
    try {
      const tasks = courses.map(course => {
        return createOrGetOneCourse({
          ...course,
          code: course.code,
          title: course.title || ' ',
        });
      });
      resolve(Promise.all(tasks));
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * Get all Pre-req/co-req of a course
 * @param {Object} options
 */
export const getPopulatedCourse = (options, res) => {
  Course.find(options)
    .populate('prerequisites corequisites')
    .then(foundCourse => {
      if (foundCourse) res.status(200).json(foundCourse);
      else
        generateServerErrorCode(
          res,
          403,
          'school courses retrieval error',
          SCHOOL_DOES_NOT_EXIST,
          'school'
        );
    });
};

/**
 * ============================================
 * Semester Helpers
 * ============================================
 */

/**
 * Get all semester based on a specific condition and populate all courses within the semester.
 * @param {*} res
 * @param {Object} option Default = {} - get all semesters
 */
export const getSemesterWithPopulatedCourse = (option, res) => {
  Semester.find(option)
    .populate('courses')
    .then(fetchedSemester => res.status(200).json(fetchedSemester))
    .catch(e => {
      generateServerErrorCode(res, 403, e, SEMESTER_NOT_FOUND, 'semester');
    });
};

/**
 * Create A new Semester
 * @param {JSON Object} data
 */
export const createOneSemester = async data => {
  return new Promise((resolve, reject) => {
    if (data._id) {
      Semester.findById(data._id)
        .then(foundSemester => {
          resolve(foundSemester);
        })
        .catch(e => {
          reject(e);
        });
    } else {
      const newData = data;

      createOrGetAllCourse(data.courses)
        .then(courses => {
          if (courses.length > 0) {
            newData.courses = courses.map(course => course._id);

            Semester.findOne({
              courses: { $all: newData.courses },
            })
              .then(foundSemester => {
                if (!foundSemester) {
                  // TO-DO: Add Pre-req check
                  resolve(new Semester(newData).save());
                } else {
                  resolve(foundSemester);
                }
              })
              .catch(e => reject(e));
          } else resolve(courses);
        })
        .catch(e => reject(e));
    }
  });
};

export const createSemesterList = semesterList => {
  return new Promise(resolve => {
    const tasks = semesterList
      .filter(semester => semester.courses.length > 0)
      .map(semester => {
        return createOneSemester({
          ...semester,
          courses: semester.courses,
        });
      });
    resolve(Promise.all(tasks));
  });
};

/**
 * ============================================
 * Text Scanner Helpers
 * ============================================
 */

/**
 * Get the remaining Requirements
 * @param {[Array]} courses: List of taken courses
 * @param {Object} requirementOption: Requirement that the student follows
 */
export const getRemainingRequirement = (user, courses) => {
  return new Promise(async (resolve, reject) => {
    const result = [];
    const typeMap = groupBy(courses, 'type', 'area');
    const types = [...new Set(Object.keys(typeMap))];
    const remainingArea = [];

    for (const el of types) {
      const splitString = el.split('-');
      const type = splitString[0].split(',') || [];
      const area = splitString[1] === 'undefined' ? ' ' : splitString[1];
      remainingArea.push(area);

      await Requirement.find({ type: { $in: type }, area })
        .then(foundRequirementList => {
          foundRequirementList.forEach(async requirement => {
            const { requiredCredit } = requirement;
            let coursesTaken = typeMap[`${type}-${area}`];
            const creditLeft = requiredCredit - coursesTaken.length * 3;

            console.log(
              `[${coursesTaken.length} courses taken]`,
              parseInt(type, 10),
              area
            );
            if (creditLeft > 0) {
              coursesTaken = coursesTaken.map(course => String(course._id));

              const remainingCourse = requirement.courses
                .map(course => String(course))
                .filter(
                  requirementCourse => !coursesTaken.includes(requirementCourse)
                );
              const remainingRequirement = await new RemainingRequirement({
                courses: remainingCourse,
                creditLeft,
                type: parseInt(type, 10),
                area,
                user,
              }).save();

              result.push(remainingRequirement._id);
            }
          });
        })
        .catch(e => {
          reject(e);
        });
    }

    Requirement.find(
      { area: { $nin: remainingArea } },
      async (err, foundAllRequirement) => {
        if (err) reject(err);
        const tasks = foundAllRequirement.map(async requirement => {
          const { courses, requiredCredit, type, area } = requirement;
          const remainingRequirement = await new RemainingRequirement({
            courses,
            type,
            area,
            creditLeft: requiredCredit,
            user,
          }).save();
          result.push(remainingRequirement._id);
        });
        await Promise.all(tasks);
        return resolve(result);
      }
    );
  });
};

/**
 * ============================================
 * Plan Helpers
 * ============================================
 */

export const generateSemesters = courses => {
  return new Promise((resolve, reject) => {
    resolve(courses);
  });
};

/**
 *
 * @param {String} userId
 * @param {[Semesters]} semesters
 * @returns [status, error]
 */
export const courseCheck = (userId, semesters) => {
  return new Promise(async (resolve, reject) => {
    const result = [];
    const coursesTaken = await User.findById(userId).select('coursesTaken');

    // Check pre-req courses is in coursesTaken

    // 1. Pre
    semesters.map(semester => {
      return {
        id: semester._id,
        status: semester.courses.map(course => {
          let taken = false;
          if (coursesTaken.includes(course._id)) taken = true;

          return [`${course.department} ${course.code}`, taken];
        }),
      };
    });

    resolve(result);
  });
};
