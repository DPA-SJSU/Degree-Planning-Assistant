import express from 'express';

import passport from 'passport';

import { validationResult } from 'express-validator';
import {
  validateCreateDegreeProgram,
  validateFetchDegreeProgram,
  validateUpdateDegreeProgramByParam,
  validateUpdateDegreeProgramById,
  validateDeleteDegreeProgram,
  validateObjStructure,
} from './validation/program.validation';

import {
  ID_OR_ANY_OF_THREE_PARAMETERS_IS_REQUIRED,
  DEGREE_PROGRAM_ALREADY_EXISTS,
  DEGREE_PROGRAM_NOT_FOUND,
  SERVER_ERROR,
  ID_OR_ALL_THREE_OTHER_PARAMETERS_IS_REQUIRED,
} from './constant';

import { Program } from '../database/models';

const programController = express.Router();

/**
 * @route   POST /program/
 * @desc    Creates a new degree program
 * @access  Private
 */
programController.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  validateCreateDegreeProgram,
  async (req, res) => {
    // Validate the string inputs (school, major, catalog_year)
    let errors = validationResult(req);

    // Validate the object inputs (general_education, major_requirements, other_requirements)
    const {
      general_education,
      major_requirements,
      other_requirements,
    } = req.body;

    let objStructureErrors = { errors: [] };
    validateObjStructure(general_education, objStructureErrors.errors, false);
    validateObjStructure(major_requirements, objStructureErrors.errors, false);
    validateObjStructure(other_requirements, objStructureErrors.errors, false);

    // Check if validators detected errors in input
    if (errors.isEmpty() === false || objStructureErrors.errors.length > 0) {
      return res.status(400).json({ errors, objStructureErrors });
    }

    const { school, major, catalog_year } = req.body;

    try {
      const data = {
        school,
        major,
        catalog_year,
        general_education,
        major_requirements,
        other_requirements,
      };

      // Check if there is already an existing degree program with the given school, major, catalog_year
      const existingDegreeProgram = await Program.findOne({
        school,
        major,
        catalog_year,
      });

      if (existingDegreeProgram) {
        // The degree program already exists
        return res.status(409).json({ error: DEGREE_PROGRAM_ALREADY_EXISTS });
      }

      // Create new degree program and save it in MongoDB
      const newDegreeProgram = new Program(data);
      await newDegreeProgram.save();

      // return code 200 as resource is successfully saved
      return res.status(200).json();
    } catch {
      // return code 500 in the case of database error
      return res.status(500).json({ error: SERVER_ERROR });
    }
  }
);

/**
 * @route   GET /program/
 * @desc    Fetches degree programs using the id, school, major, or catalog_year parameters
 * @access  Private
 */
programController.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  validateFetchDegreeProgram,
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty() === false) {
      // All or some inputs are invalid
      return res.status(400).json(errors);
    } else if (
      !req.query.id &&
      !req.query.school &&
      !req.query.major &&
      !req.query.catalog_year
    ) {
      // Either the id or all three school, major, catalog_year fields are required
      return res
        .status(400)
        .json({ error: ID_OR_ANY_OF_THREE_PARAMETERS_IS_REQUIRED });
    }

    let formattedQuery = {};

    for (const key in req.query) {
      if (key === 'id') {
        formattedQuery['_id'] = req.query['id'];
      } else if (
        key === 'school' ||
        key === 'major' ||
        key === 'catalog_year'
      ) {
        formattedQuery[key] = req.query[key];
      }
    }

    try {
      const queryResult = await Program.find(formattedQuery);
      if (queryResult.length > 0) {
        return res.status(200).json(queryResult);
      }
      // No degree program that contains the parameters have been found
      return res.status(404).json({ error: DEGREE_PROGRAM_NOT_FOUND });
    } catch {
      // Database error
      return res.status(500).json({ error: SERVER_ERROR });
    }
  }
);

/**
 * Helper method for POST /program/updateByParameters
 * Updates degree programs in the database by paramaters while validating action
 * @param {Object} res    The HTTP response object
 * @param {Object} params The HTTP request object that contains user input
 */
const updatebyParameters = async (res, params) => {
  // Possible Duplication: There is a possibility that the resulting edit to a degree program will lead to multiple degree programs of the same major, catalog year, and school
  // To avoid this we must first check if a duplication will occur.
  let willDuplicate; // Flag used to detect duplication

  const {
    new_school,
    new_major,
    new_catalog_year,
    school,
    major,
    catalog_year,
    general_education,
    major_requirements,
    other_requirements,
  } = params;

  // If the old and new inputs for school, major, catalog_year are the same, then no need to check if there will be duplications in the database
  // Otherwise, check if the resulting degree program already exists in the database
  if (
    (new_school && school !== new_school) ||
    (new_major && major !== new_major) ||
    (new_catalog_year && catalog_year !== new_catalog_year)
  ) {
    willDuplicate = await Program.findOne(
      {
        school: new_school ? new_school : school,
        major: new_major ? new_major : major,
        catalog_year: new_catalog_year ? new_catalog_year : catalog_year,
      },
      { _id: true }
    );
  }

  if (!willDuplicate) {
    const newData = {
      school: new_school ? new_school : school,
      major: new_major ? new_major : major,
      catalog_year: new_catalog_year ? new_catalog_year : catalog_year,
    };

    if (general_education) {
      newData['general_education'] = general_education;
    }
    if (major_requirements) {
      newData['major_requirements'] = major_requirements;
    }
    if (other_requirements) {
      newData['other_requirements'] = other_requirements;
    }

    const writeResult = await Program.updateOne(
      { school, major, catalog_year },
      { $set: newData }
    );

    if (writeResult.nModified === 1) {
      // Documents were successfully edited or no edits were required
      return res.status(200).json();
    } else {
      // No documents modified as no matches were found
      return res.status(404).json({ error: DEGREE_PROGRAM_NOT_FOUND });
    }
  } else {
    // The resulting edit to the degree program will result in duplicate degree programs and must be rejected
    return res.status(409).json({ error: DEGREE_PROGRAM_ALREADY_EXISTS });
  }
};

/**
 * @route   PUT /program/updateByParameters/
 * @desc    Updates degree programs using the school, major, and catalog_year parameters
 * @access  Private
 */
programController.put(
  '/updateByParameters',
  passport.authenticate('jwt', { session: false }),
  validateUpdateDegreeProgramByParam,
  async (req, res) => {
    // Validate the string inputs (school, major, catalog_year)
    let errors = validationResult(req);

    // Validate the object inputs (general_education, major_requirements, other_requirements)
    let objStructureErrors = { errors: [] };
    validateObjStructure(
      req.body.general_education,
      objStructureErrors.errors,
      true
    );
    validateObjStructure(
      req.body.major_requirements,
      objStructureErrors.errors,
      true
    );
    validateObjStructure(
      req.body.other_requirements,
      objStructureErrors.errors,
      true
    );

    // Check if validators detected errors in input
    if (errors.isEmpty() === false || objStructureErrors.errors.length > 0) {
      return res.status(400).json({ errors, objStructureErrors });
    }

    try {
      await updatebyParameters(res, req.body);
    } catch (databaseError) {
      // return code 500 in the case of database error
      logger.info(databaseError);
      return res.status(500).json({ error: SERVER_ERROR });
    }
  }
);

/**
 * Helper function for PUT /program/updateById/
 * Updates degree programs by id while validating action
 * @param {Object} res    The HTTP response object
 * @param {Object} params The HTTP request object containing user input
 */
const updateById = async (res, params) => {
  const { id, school, major, catalog_year } = params;

  let projectionObj = {
    _id: false,
    general_education: false,
    major_requirements: false,
    other_requirements: false,
  };

  const degreeProgramToEdit = await Program.findOne({ _id: id }, projectionObj);
  const willDuplicate = await Program.findOne(
    {
      school: school ? school : degreeProgramToEdit.school,
      major: major ? major : degreeProgramToEdit.major,
      catalog_year: catalog_year
        ? catalog_year
        : degreeProgramToEdit.catalog_year,
    },
    { _id: true }
  );

  if (!willDuplicate) {
    let newData = {};
    for (const prop in params) {
      if (
        prop !== 'id' &&
        (prop === 'school' || prop === 'major' || prop === 'catalog_year')
      ) {
        newData[prop] = params[prop];
      }
    }

    const writeResult = await Program.updateOne(
      {
        school: degreeProgramToEdit.school,
        major: degreeProgramToEdit.major,
        catalog_year: degreeProgramToEdit.catalog_year,
      },
      { $set: newData }
    );

    if (writeResult.nModified === 1 || writeResult.ok === 1) {
      // Documents were successfully edited or no edits were required
      return res.status(200).json();
    } else {
      // No documents modified as no matches were found
      return res.status(404).json({ error: DEGREE_PROGRAM_NOT_FOUND });
    }
  } else {
    // The resulting edit to the degree program will result in duplicate degree programs and must be rejected
    return res.status(409).json({ error: DEGREE_PROGRAM_ALREADY_EXISTS });
  }
};

/**
 * @route   PUT /program/updateById/
 * @desc    Updates degree programs using its _id and fields to change
 * @access  Private
 */
programController.put(
  '/updateById',
  passport.authenticate('jwt', { session: false }),
  validateUpdateDegreeProgramById,
  async (req, res) => {
    // Validate the string inputs (school, major, catalog_year)
    let errors = validationResult(req);

    // Validate the object inputs (general_education, major_requirements, other_requirements)
    let objStructureErrors = { errors: [] };
    validateObjStructure(
      req.body.general_education,
      objStructureErrors.errors,
      true
    );
    validateObjStructure(
      req.body.major_requirements,
      objStructureErrors.errors,
      true
    );
    validateObjStructure(
      req.body.other_requirements,
      objStructureErrors.errors,
      true
    );

    // Check if validators detected errors in input
    if (errors.isEmpty() === false || objStructureErrors.errors.length > 0) {
      return res.status(400).json({ errors, objStructureErrors });
    }

    const { school, major, catalog_year } = req.body;

    // Check if at least one field other than id has been entered. Otherwise there is nothing to update.
    if (!school && !major && !catalog_year) {
      // Must choose a field to update
      return res.status(400).json();
    }

    try {
      await updateById(res, req.body);
    } catch (databaseError) {
      // Database error
      logger.info(databaseError);
      return res.status(500).json({ error: SERVER_ERROR });
    }
  }
);

/**
 * @route   DELETE /program/
 * @desc    Deletes degree programs identified by it's id
 * @access  Private
 */
programController.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  validateDeleteDegreeProgram,
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty() === false) {
      // All or some inputs are invalid
      return res.status(400).json(errors);
    }

    const { id, school, major, catalog_year } = req.body;

    if (!id && (!school || !major || !catalog_year)) {
      // Either just the id or all three school, major, catalog_year fields are required
      return res
        .status(400)
        .json({ error: ID_OR_ALL_THREE_OTHER_PARAMETERS_IS_REQUIRED });
    }

    try {
      let deleteResult;
      if (id) {
        deleteResult = await Program.deleteOne({ _id: id });
      } else {
        deleteResult = await Program.deleteOne({
          school,
          major,
          catalog_year,
        });
      }

      if (deleteResult.deletedCount > 0) {
        return res.status(200).json();
      } else {
        // Document to be deleted was not found in database
        return res.status(404).json({ error: DEGREE_PROGRAM_NOT_FOUND });
      }
    } catch (databaseError) {
      logger.info(databaseError);
      return res.status(500).json({ error: SERVER_ERROR });
    }
  }
);

export default programController;
