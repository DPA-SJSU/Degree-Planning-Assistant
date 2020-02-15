import { body, query } from 'express-validator';

import {
  ID_IS_INVALID,
  PLAN_ID_IS_EMPTY,
  USER_ID_IS_EMPTY,
  PARAMETERS_IS_EMPTY,
  INVALID_PARAMETERS,
  USER_ID_IS_REQUIRED,
} from '../constant';

export const validateCreatePlan = [
  body('user_id')
    .exists()
    .withMessage(USER_ID_IS_REQUIRED)
    .bail()
    .unescape()
    .ltrim()
    .rtrim()
    .not()
    .isEmpty()
    .withMessage(USER_ID_IS_EMPTY)
    .bail()
    .isHexadecimal()
    .withMessage(ID_IS_INVALID)
    .bail()
    .isLength({ min: 24, max: 24 })
    .withMessage(ID_IS_INVALID),
];

export const validateUpdatePlan = [
  body('plan_id')
    .if(body('plan_id').exists())
    .not()
    .isEmpty()
    .withMessage(PLAN_ID_IS_EMPTY)
    .bail()
    .isHexadecimal()
    .withMessage(ID_IS_INVALID)
    .bail()
    .unescape()
    .ltrim()
    .rtrim()
    .isLength({ min: 24, max: 24 })
    .withMessage(ID_IS_INVALID),
  body('user_id')
    .if(body('plan_id').exists())
    .not()
    .isEmpty()
    .withMessage(USER_ID_IS_EMPTY)
    .bail()
    .isHexadecimal()
    .withMessage(ID_IS_INVALID)
    .bail()
    .unescape()
    .ltrim()
    .rtrim()
    .isLength({ min: 24, max: 24 })
    .withMessage(ID_IS_INVALID),
];

export const validateFetchPlan = [
  query('plan_id')
    .if(query('plan_id').exists())
    .not()
    .isEmpty()
    .withMessage(PLAN_ID_IS_EMPTY)
    .bail()
    .isHexadecimal()
    .withMessage(ID_IS_INVALID)
    .bail()
    .unescape()
    .ltrim()
    .rtrim()
    .isLength({ min: 24, max: 24 })
    .withMessage(ID_IS_INVALID),
  query('user_id')
    .if(query('plan_id').exists())
    .not()
    .isEmpty()
    .withMessage(USER_ID_IS_EMPTY)
    .bail()
    .isHexadecimal()
    .withMessage(ID_IS_INVALID)
    .bail()
    .unescape()
    .ltrim()
    .rtrim()
    .isLength({ min: 24, max: 24 })
    .withMessage(ID_IS_INVALID),
  query('fetch_data')
    .if(query('fetch_data').exists())
    .not()
    .isEmpty()
    .withMessage(PARAMETERS_IS_EMPTY)
    .bail()
    .unescape()
    .ltrim()
    .rtrim()
    .isBoolean()
    .withMessage(INVALID_PARAMETERS),
];

export const validateDeletePlan = [
  query('plan_id')
    .if(query('plan_id').exists())
    .not()
    .isEmpty()
    .withMessage(PLAN_ID_IS_EMPTY)
    .bail()
    .isHexadecimal()
    .withMessage(ID_IS_INVALID)
    .bail()
    .unescape()
    .ltrim()
    .rtrim()
    .isLength({ min: 24, max: 24 })
    .withMessage(ID_IS_INVALID),
  query('user_id')
    .if(query('plan_id').exists())
    .not()
    .isEmpty()
    .withMessage(USER_ID_IS_EMPTY)
    .bail()
    .isHexadecimal()
    .withMessage(ID_IS_INVALID)
    .bail()
    .unescape()
    .ltrim()
    .rtrim()
    .isLength({ min: 24, max: 24 })
    .withMessage(ID_IS_INVALID),
];
