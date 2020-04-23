import { Injectable } from "@angular/core";
import { throwError } from "rxjs";
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
  handleError(err) {
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
    console.log("This is the error: ", errMsg);

    const errorsObj = {
      SOME_THING_WENT_WRONG: "Something went wrong.\n",
      USER_NAME_IS_EMPTY: "No username was entered.\n",
      ROLE_IS_EMPTY: "A role has not been assigned to this User.",
      EMAIL_IS_EMPTY: "No email was entered.\n",
      EMAIL_IS_IN_WRONG_FORMAT: "Email is not in the correct format.\n",
      PASSWORD_IS_EMPTY: "No password was entered.\n",
      PASSWORD_LENGTH_MUST_BE_MORE_THAN_8:
        "Password must be 8 characters or longer.\n",
      WRONG_PASSWORD: "Incorrect email or password. Please try again.\n",
      USER_EXISTS_ALREADY: "This email is already taken.\n",
      USER_DOES_NOT_EXIST: "Email not recognized, please sign up.\n",
      TOKEN_IS_EMPTY: "Trying to access a restricted feature.\n",
      NAME_IS_INVALID: "Name is invalid.\n",
      COURSE_SCHOOL_IS_EMPTY: "Cannot find course without school specified.\n",
      COURSE_EXISTS_ALREADY: "This course already exists.\n",
      COURSE_DOES_NOT_EXIST: "This course does not exist yet.\n",
      SCHOOL_DOES_NOT_EXIST: "This school does not exist.\n",
      COURSE_CODE_IS_EMPTY: "This course is missing a numeric code.\n",
      COURSE_TITLE_IS_EMPTY: "This course is missing a title.\n",
      COURSE_DESCRIPTION_IS_EMPTY: "This course is missing a description.\n",
      COURSE_DEPARTMENT_IS_EMPTY: "This course is missing a department.\n",
      COURSE_TERMS_OFFERED_IS_EMPTY:
        "This course is missing the terms when it is offered.\n",
      COURSE_ID_IS_EMPTY: "No course identification found.\n",
      FAILED_TO_CREATE_COURSE: "Oops, we failed to create this course.\n",
      SEMESTER_EXISTS_ALREADY: "This semester already exists.\n",
      SEMESTER_TERM_IS_EMPTY:
        "This semester is missing the term was/will be taken.\n",
      SEMESTER_YEAR_IS_EMPTY:
        "This semester is missing the year it was/will be taken.\n",
      SEMESTER_COURSES_ARE_EMPTY: "This semester is missing courses.\n",
      SEMESTER_ID_IS_EMPTY: "No semester identification found.\n",
      SEMESTER_NOT_FOUND: "No semester found.\n",
      YEAR_CONTAINS_FORBIDDEN_CHARACTERS:
        "The year input is invalid, it contains forbidden characters.\n",
      DOES_NOT_CONTAIN_A_DIGIT: "Does not contain a digit.\n",
      NO_DATA_TO_UPDATE: "No data inputed to update.\n",
      ID_IS_INVALID: "Identification is invalid.\n",
      SCHOOL_FIELD_IS_REQUIRED: "School field is required.\n",
      SCHOOL_FIELD_IS_EMPTY: "Missing the school field.\n",
      SCHOOL_FIELD_CONTAINS_FORBIDDEN_CHARACTERS:
        "School field contains forbidden characters.\n",
      MAJOR_FIELD_IS_REQUIRED: "Major field is required.\n",
      MAJOR_FIELD_IS_EMPTY: "Missing the major field.\n",
      MAJOR_FIELD_CONTAINS_FORBIDDEN_CHARACTERS:
        "Major field contains forbidden characters.\n",
      CATALOGYEAR_IS_REQUIRED: "Catalog Year field is required.\n",
      CATALOGYEAR_IS_EMPTY: "Missing the catalog year field.\n",
      CATALOGYEAR_CONTAINS_FORBIDDEN_CHARACTERS:
        "Catalog Year field contains forbidden characters.\n",
      REQUIREMENTOBJECT_IS_REQUIRED: "Requirements field is required.\n",
      REQUIREMENTOBJECT_NOT_AN_OBJECT: "Requirements field is not an object.\n",
      REQUIREMENTOBJECT_IS_EMPTY: "Missing the requirements field.\n",
      REQUIREMENTOBJECT_INCORRECT_STRUCTURE:
        "Requirements field in an incorrect structure.\n",
      ID_IS_REQUIRED: "Identification field is required.\n",
      ID_OR_ALL_THREE_OTHER_PARAMETERS_IS_REQUIRED:
        "ID_OR_ALL_THREE_OTHER_PARAMETERS_IS_REQUIRED.\n",
      ID_OR_ANY_OF_THREE_PARAMETERS_IS_REQUIRED:
        "ID_OR_ANY_OF_THREE_PARAMETERS_IS_REQUIRED.\n",
      DEGREE_PROGRAM_ALREADY_EXISTS: "DEGREE_PROGRAM_ALREADY_EXISTS.\n",
      DEGREE_PROGRAM_NOT_FOUND: "DEGREE_PROGRAM_NOT_FOUND.\n",
      USER_ID_IS_REQUIRED: "USER_ID_IS_REQUIRED.\n",
      USER_ID_IS_EMPTY: "USER_ID_IS_EMPTY.\n",
      USER_ID_IS_INVALID: "USER_ID_IS_INVALID.\n",
      AVATAR_URL_IS_EMPTY: "AVATAR_URL_IS_EMPTY.\n",
      AVATAR_URL_IS_INVALID: "AVATAR_URL_IS_INVALID.\n",
      AVATAR_TYPE_IS_EMPTY: "AVATAR_TYPE_IS_EMPTY.\n",
      AVATAR_TYPE_IS_INVALID: "AVATAR_TYPE_IS_INVALID.\n",
      FIRST_NAME_IS_EMPTY: "FIRST_NAME_IS_EMPTY.\n",
      FIRST_NAME_IS_INVALID: "FIRST_NAME_IS_INVALID.\n",
      LAST_NAME_IS_EMPTY: "LAST_NAME_IS_EMPTY.\n",
      LAST_NAME_IS_INVALID: "LAST_NAME_IS_INVALID.\n",
      BIO_IS_EMPTY: "BIO_IS_EMPTY.\n",
      BIO_IS_TOO_LONG: "BIO_IS_TOO_LONG.\n",
      MAJOR_IS_EMPTY: "MAJOR_IS_EMPTY.\n",
      MAJOR_IS_INVALID: "MAJOR_IS_INVALID.\n",
      MINOR_IS_EMPTY: "MINOR_IS_EMPTY.\n",
      MINOR_IS_INVALID: "MINOR_IS_INVALID.\n",
      CATALOG_YEAR_IS_EMPTY: "CATALOG_YEAR_IS_EMPTY.\n",
      CATALOG_YEAR_IS_INVALID: "CATALOG_YEAR_IS_INVALID.\n",
      DEGREE_PLAN_ID_IS_EMPTY: "DEGREE_PLAN_ID_IS_EMPTY.\n",
      INVALID_GRAD_DATE: "INVALID_GRAD_DATE.\n",
      UNAUTHORIZED_CHARACTER: "UNAUTHORIZED_CHARACTER.\n",
      INVALID_ID: "INVALID_ID.\n",
      PARAMETERS_REQUIRED: "PARAMETERS_REQUIRED.\n",
      USER_NOT_FOUND: "USER_NOT_FOUND.\n",
      BOOLEAN_VALUES_ONLY: "BOOLEAN_VALUES_ONLY.\n",
      PLAN_ID_IS_EMPTY: "PLAN_ID_IS_EMPTY.\n",
      COURSE_NAMES_ONLY_MUST_BE_BOOLEAN: "COURSE_NAMES_ONLY_MUST_BE_BOOLEAN.\n",
      COURSE_NAMES_ONLY_FIELD_IS_EMPTY: "COURSE_NAMES_ONLY_FIELD_IS_EMPTY.\n",
      PARAMETERS_IS_EMPTY: "PARAMETERS_IS_EMPTY.\n",
      PARAMETERS_NOT_RECOGNIZED: "PARAMETERS_NOT_RECOGNIZED.\n",
      INVALID_PARAMETERS: "INVALID_PARAMETERS.\n",
      USER_OR_PLAN_ID_REQUIRED: "USER_OR_PLAN_ID_REQUIRED.\n",
      PLAN_NOT_FOUND: "PLAN_NOT_FOUND.\n",
      SEMESTERS_FIELD_IS_REQUIRED: "SEMESTERS_FIELD_IS_REQUIRED.\n",
      SEMESTERS_IS_INVALID: "SEMESTERS_IS_INVALID.\n",
      PLAN_ID_FIELD_IS_REQUIRED: "PLAN_ID_FIELD_IS_REQUIRED.\n",
      USER_ALREADY_HAS_PLAN: "USER_ALREADY_HAS_PLAN.\n",
      FAILED_TO_CREATE_PLAN: "FAILED_TO_CREATE_PLAN.\n",
      FAILED_TO_UPDATE_USER: "FAILED_TO_UPDATE_USER.\n",
      USER_DOES_NOT_HAVE_DEGREE_PLAN: "USER_DOES_NOT_HAVE_DEGREE_PLAN.\n",
      SERVER_ERROR: "SERVER_ERROR.\n",
      KEY_IS_INVALID: "KEY_IS_INVALID.\n",
      REQUIREMENT_EXISTS_ALREADY: "REQUIREMENT_EXISTS_ALREADY.\n",
      REQUIREMENT_TYPE_IS_INVALID: "REQUIREMENT_TYPE_IS_INVALID.\n",
      REQUIREMENT_AREA_IS_INVALID: "REQUIREMENT_AREA_IS_INVALID.\n",
      REQUIREMENT_NAME_IS_INVALID: "REQUIREMENT_NAME_IS_INVALID.\n",
      REQUIREMENT_SCHOOL_IS_INVALID: "REQUIREMENT_SCHOOL_IS_INVALID.\n",
      REQUIREMENT_MAJOR_IS_INVALID: "REQUIREMENT_MAJOR_IS_INVALID.\n",
      REQUIREMENT_REQUIRED_CREDIT_IS_INVALID:
        "REQUIREMENT_REQUIRED_CREDIT_IS_INVALID.\n",
      REQUIREMENT_COURSES_IS_INVALID: "REQUIREMENT_COURSES_IS_INVALID.\n",
      FAILED_TO_UPDATE_REQUIREMENT: "FAILED_TO_UPDATE_REQUIREMENT.\n",
      FAILED_TO_DELETE_REQUIREMENT: "FAILED_TO_DELETE_REQUIREMENT.\n",
    };

    for (const entry of Object.entries(errorsObj)) {
      if (entry[0] === errMsg) {
        return entry[1];
      }
    }
    return "Oops, something went wrong.\n";
  }
}
