import { check } from "express-validator";

export const validation = [
    check('email')
      .exists()
      .withMessage(EMAIL_IS_EMPTY)
      .isEmail()
      .withMessage(EMAIL_IS_IN_WRONG_FORMAT),
    check('password')
      .exists()
      .withMessage(PASSWORD_IS_EMPTY)
      .isLength({ min: 8 })
      .withMessage(PASSWORD_LENGTH_MUST_BE_MORE_THAN_8),
];