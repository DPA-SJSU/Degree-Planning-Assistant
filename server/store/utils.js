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
