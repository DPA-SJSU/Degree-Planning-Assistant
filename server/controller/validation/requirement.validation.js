import lodash from 'lodash';
import { check } from 'express-validator';

import { checkAllowedKeys } from '../../store/utils';

import {
  REQUIREMENT_TYPE_IS_INVALID,
  REQUIREMENT_AREA_IS_INVALID,
  KEY_IS_INVALID,
  REQUIREMENT_NAME_IS_INVALID,
  REQUIREMENT_SCHOOL_IS_INVALID,
  REQUIREMENT_MAJOR_IS_INVALID,
  REQUIREMENT_REQUIRED_CREDIT_IS_INVALID,
  REQUIREMENT_COURSES_IS_INVALID,
} from '../constant';

const requirementValidate = [
  check('body').custom((body, { req }) => {
    const newRequirementInfo = req.body;
    const newRequirementInfoKeys = Object.keys(newRequirementInfo);
    const allowedKeys = [
      'type',
      'area',
      'name',
      'school',
      'major',
      'requiredCredit',
      'courses',
    ];
    if (!checkAllowedKeys(allowedKeys, newRequirementInfoKeys)) {
      throw new Error(KEY_IS_INVALID);
    }

    return Promise.resolve({ req });
  }),

  check('type').custom((type, { req }) => {
    if (type && !lodash.isNumber(type)) {
      throw new Error(REQUIREMENT_TYPE_IS_INVALID);
    }
    return Promise.resolve({ req });
  }),
  check('area').custom((area, { req }) => {
    if (area && !lodash.isString(area)) {
      throw new Error(REQUIREMENT_AREA_IS_INVALID);
    }
    return Promise.resolve({ req });
  }),
  check('name').custom((name, { req }) => {
    if (name && !lodash.isString(name)) {
      throw new Error(REQUIREMENT_NAME_IS_INVALID);
    }
    return Promise.resolve({ req });
  }),
  check('school').custom((school, { req }) => {
    if (school && !lodash.isString(school)) {
      throw new Error(REQUIREMENT_SCHOOL_IS_INVALID);
    }
    return Promise.resolve({ req });
  }),
  check('major').custom((major, { req }) => {
    if (major && !lodash.isString(major)) {
      throw new Error(REQUIREMENT_MAJOR_IS_INVALID);
    }
    return Promise.resolve({ req });
  }),
  check('requiredCredit').custom((requiredCredit, { req }) => {
    if (requiredCredit && !lodash.isNumber(requiredCredit)) {
      throw new Error(REQUIREMENT_REQUIRED_CREDIT_IS_INVALID);
    }
    return Promise.resolve({ req });
  }),
  check('courses').custom((courses, { req }) => {
    if (courses && !lodash.isArray(courses)) {
      throw new Error(REQUIREMENT_COURSES_IS_INVALID);
    }
    return Promise.resolve({ req });
  }),
];

export default requirementValidate;
