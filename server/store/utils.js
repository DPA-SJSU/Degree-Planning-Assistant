import sha256 from 'sha256';

export const generateHashedPassword = password => sha256(password);

export function generateServerErrorCode(
  res,
  code,
  fullError,
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
    fullError,
    errors,
  });
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
