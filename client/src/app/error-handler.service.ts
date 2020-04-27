import { Injectable } from "@angular/core";
import { throwError, Observable } from "rxjs";
import {
  EMAIL_IS_EMPTY,
  EMAIL_IS_IN_WRONG_FORMAT,
  PASSWORD_IS_EMPTY,
  PASSWORD_LENGTH_MUST_BE_MORE_THAN_8,
  WRONG_PASSWORD,
  SOME_THING_WENT_WRONG,
  USER_NAME_IS_EMPTY,
  ROLE_IS_EMPTY,
  USER_EXISTS_ALREADY,
  USER_DOES_NOT_EXIST,
  TOKEN_IS_EMPTY,
  NAME_IS_INVALID,
} from "./constant";

@Injectable({
  providedIn: "root",
})
export class ErrorHandlerService {
  constructor() {}

  /**
   * Handle server errors
   * @param err
   */
  handleError(err): Observable<never> {
    const errObj = err.error.errors;
    let errorMessage = "";

    Object.keys(errObj).forEach((prop, index) => {
      const propMsg = errObj[prop].msg;
      errorMessage += this.findErrorType(propMsg);
    });

    window.alert(errorMessage);
    return throwError(errorMessage);
  }

  /**
   * Match err to the error type and alert user
   * @param err
   */

  findErrorType(errMsg): string {
    const errorsObj = {
      SOME_THING_WENT_WRONG: "Oops, something went wrong.\n",
      SERVER_ERROR: "Oops, something went wrong.\n",
      TOKEN_IS_EMPTY: "Trying to access a restricted feature.\n",
      KEY_IS_INVALID: "Trying to access a restricted feature.\n",
      USER_EXISTS_ALREADY: "This email is already taken.\n",
      USER_DOES_NOT_EXIST: "Email not recognized, please sign up.\n",
      PASSWORD_LENGTH_MUST_BE_MORE_THAN_8:
        "Password must be more than 8 characters.\n",
      WRONG_PASSWORD: "Incorrect email or password. Please try again.\n",
      DEGREE_PROGRAM_NOT_FOUND: "The student's program could not be found",
    };

    for (const entry of Object.entries(errorsObj)) {
      if (entry[0] === errMsg) {
        return entry[1];
      }
    }

    // If no matching custom error, return the error converted to a normal sentence.
    return (
      errMsg
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\w\S*/, (txt) => {
          return txt.charAt(0).toUpperCase() + txt.substring(1);
        }) + ".\n"
    );
  }
}
