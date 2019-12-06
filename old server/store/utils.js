import sha256 from "sha256";
import { URL } from "url";

export const generatehashedPassword = password => sha256(password);

export function generateServerErrorCode(res, code, msg, location = "server") {
  const errors = {};
  errors[location] = {
    msg
  };

  return res.status(code).json({
    code,
    errors
  });
}

export const isURL = string => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};
