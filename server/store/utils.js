import sha256 from 'sha256';
import { validationResult } from 'express-validator';

export const generateHashedPassword = password => sha256(password);

export function generateServerErrorCode(
  res,
  code,
  fullError = '',
  msg,
  location = 'server'
) {
  const errors = {};
  errors[location] = {
    fullError,
    msg,
  };

  return res.status(code).json({
    code,
    errors,
  });
}

export function validationHandler(req, res, next) {
  const errorsAfterValidation = validationResult(req);
  if (!errorsAfterValidation.isEmpty()) {
    return res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped(),
    });
  }

  return next();
}

export function checkAllowedKeys(allowedKeys, keys) {
  if ((allowedKeys && allowedKeys.length > 0) || (keys && keys.length > 0)) {
    for (let i = 0; i < keys.length; i += 1) {
      if (!allowedKeys.includes(keys[i])) {
        return false;
      }
    }
    return true;
  }
  return false;
}

/**
 * Removes the undefined properties of an object
 * Found: https://stackoverflow.com/questions/25421233/javascript-removing-undefined-fields-from-an-object/38340374#38340374
 * @param {Object} obj
 */
export function removeUndefinedObjectProps(obj) {
  Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
  return obj;
}

export function isObjectEmpty(obj) {
  return Object.keys(obj).length === 0;
}

export const groupBy = (xs, key) => {
  return xs.reduce((rv, x) => {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};
