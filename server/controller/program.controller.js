/* eslint-disable no-underscore-dangle */
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

import { generateServerErrorCode } from '../store/utils';

import {
  ID_OR_ANY_OF_THREE_PARAMETERS_IS_REQUIRED,
  DEGREE_PROGRAM_ALREADY_EXISTS,
  DEGREE_PROGRAM_NOT_FOUND,
  ID_OR_ALL_THREE_OTHER_PARAMETERS_IS_REQUIRED,
  SOME_THING_WENT_WRONG,
} from './constant';

import { Program, Course } from '../database/models';

const programController = express.Router();

/**
 * @route   POST /program/
 * @desc    Creates a new degree program
 * @access  Private
 */
programController.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  // validateCreateDegreeProgram,
  async (req, res) => {
    // const errors = validationResult(req);
    const {
      school,
      major,
      catalogYear,
      generalEducation,
      majorRequirements,
      otherRequirements,
    } = req.body;

    console.log(req.body);

    // const objStructureErrors = { errors: [] };
    // validateObjStructure(generalEducation, objStructureErrors.errors, false);
    // validateObjStructure(majorRequirements, objStructureErrors.errors, false);
    // validateObjStructure(otherRequirements, objStructureErrors.errors, false);

    // if (errors.isEmpty() === false || objStructureErrors.errors.length > 0) {
    //   return res.status(400).json({ errors, objStructureErrors });
    // }

    try {
      Program.findOne(
        { school, major, catalogYear },
        async (err, existingDegreeProgram) => {
          if (existingDegreeProgram)
            return res
              .status(403)
              .json({ error: DEGREE_PROGRAM_ALREADY_EXISTS });

          const newDegreeProgram = new Program(req.body);
          await newDegreeProgram.save();

          res.status(200).json(newDegreeProgram);
        }
      );
    } catch (e) {
      generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
    }
  }
);

/**
 * @route   GET /program/
 * @desc    Fetches degree programs using the id, school, major, or catalogYear parameters
 * @access  Private
 */
programController.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  validateFetchDegreeProgram,
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty() === false) {
      generateServerErrorCode(res, 400, errors);
    }
    if (
      !req.query.id &&
      !req.query.school &&
      !req.query.major &&
      !req.query.catalogYear
    ) {
      generateServerErrorCode(
        res,
        400,
        e,
        ID_OR_ANY_OF_THREE_PARAMETERS_IS_REQUIRED
      );
    }
    const formattedQuery = {};

    Object.keys(req.query).forEach(key => {
      if (key === 'id') {
        formattedQuery._id = req.query.id;
      } else if (key === 'school' || key === 'major' || key === 'catalogYear') {
        formattedQuery[key] = req.query[key];
      }
    });

    try {
      const queryResult = await Program.find(formattedQuery).populate({
        path: 'requirements',
        model: 'Requirement',
        populate: {
          path: 'courses',
          model: 'Course',
        },
      });
      if (queryResult.length > 0) {
        return res.status(200).json(queryResult);
      }
      generateServerErrorCode(res, 404, e, DEGREE_PROGRAM_NOT_FOUND);
    } catch (e) {
      generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
    }
  }
);

/**
 * Helper method for POST /program/updateByParameters
 * Updates degree programs in the database by paramaters while validating action
 * @param {Object} res    The HTTP response object
 * @param {Object} params The HTTP request object that contains user input
 */
const updateByParameters = async (res, params) => {
  let willDuplicate;

  const {
    newSchool,
    newMajor,
    newCatalogYear,
    school,
    major,
    catalogYear,
    generalEducation,
    majorRequirements,
    otherRequirements,
  } = params;

  if (
    (newSchool && school !== newSchool) ||
    (newMajor && major !== newMajor) ||
    (newCatalogYear && catalogYear !== newCatalogYear)
  ) {
    willDuplicate = await Program.findOne(
      {
        school: newSchool || school,
        major: newMajor || major,
        catalogYear: newCatalogYear || catalogYear,
      },
      { _id: true }
    );
  }

  if (!willDuplicate) {
    const newData = {
      school: newSchool || school,
      major: newMajor || major,
      catalogYear: newCatalogYear || catalogYear,
      generalEducation: generalEducation || {},
      majorRequirements: majorRequirements || {},
      otherRequirements: otherRequirements || {},
    };

    Program.updateOne(
      { school, major, catalogYear },
      { $set: newData },
      (err, updatedProgram) => {
        if (err)
          generateServerErrorCode(
            res,
            500,
            'degree Program not found',
            DEGREE_PROGRAM_NOT_FOUND
          );
        else res.status(200).json(updatedProgram);
      }
    );
  } else
    generateServerErrorCode(
      res,
      500,
      'degree Program already existed',
      DEGREE_PROGRAM_ALREADY_EXISTS
    );
};

/**
 * @route   PUT /program/updateByParameters/
 * @desc    Updates degree programs using the school, major, and catalogYear parameters
 * @access  Private
 */
programController.put(
  '/updateByParameters',
  passport.authenticate('jwt', { session: false }),
  validateUpdateDegreeProgramByParam,
  async (req, res) => {
    const errors = validationResult(req);
    const objStructureErrors = { errors: [] };
    validateObjStructure(
      req.body.generalEducation,
      objStructureErrors.errors,
      true
    );
    validateObjStructure(
      req.body.majorRequirements,
      objStructureErrors.errors,
      true
    );
    validateObjStructure(
      req.body.otherRequirements,
      objStructureErrors.errors,
      true
    );

    if (errors.isEmpty() === false || objStructureErrors.errors.length > 0) {
      return res.status(400).json({ errors, objStructureErrors });
    }

    try {
      await updateByParameters(res, req.body);
    } catch (e) {
      generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
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
  const { id, school, major, catalogYear } = params;

  const projectionObj = {
    _id: false,
    generalEducation: false,
    majorRequirements: false,
    otherRequirements: false,
  };

  const degreeProgramToEdit = await Program.findOne({ _id: id }, projectionObj);
  const willDuplicate = await Program.findOne(
    {
      school: school || degreeProgramToEdit.school,
      major: major || degreeProgramToEdit.major,
      catalogYear: catalogYear || degreeProgramToEdit.catalogYear,
    },
    { _id: true }
  );

  if (!willDuplicate) {
    const newData = {};
    params.forEach(prop => {
      if (
        prop !== 'id' &&
        (prop === 'school' || prop === 'major' || prop === 'catalogYear')
      ) {
        newData[prop] = params[prop];
      }
    });

    const writeResult = await Program.updateOne(
      {
        school: degreeProgramToEdit.school,
        major: degreeProgramToEdit.major,
        catalogYear: degreeProgramToEdit.catalogYear,
      },
      { $set: newData }
    );

    if (writeResult.nModified === 1 || writeResult.ok === 1) {
      return res.status(200).json();
    }
    return res.status(404).json({ error: DEGREE_PROGRAM_NOT_FOUND });
  }
  return res.status(409).json({ error: DEGREE_PROGRAM_ALREADY_EXISTS });
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
    const errors = validationResult(req);
    const objStructureErrors = { errors: [] };
    validateObjStructure(
      req.body.generalEducation,
      objStructureErrors.errors,
      true
    );
    validateObjStructure(
      req.body.majorRequirements,
      objStructureErrors.errors,
      true
    );
    validateObjStructure(
      req.body.otherRequirements,
      objStructureErrors.errors,
      true
    );

    if (errors.isEmpty() === false || objStructureErrors.errors.length > 0) {
      return res.status(400).json({ errors, objStructureErrors });
    }

    const { school, major, catalogYear } = req.body;

    if (!school && !major && !catalogYear) {
      return res.status(400).json();
    }

    try {
      await updateById(res, req.body);
    } catch (e) {
      generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
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
      return res.status(400).json(errors);
    }

    const { id, school, major, catalogYear } = req.body;

    if (!id && (!school || !major || !catalogYear)) {
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
          catalogYear,
        });
      }

      if (deleteResult.deletedCount > 0) {
        return res.status(200).json(deleteResult);
      }
      return res.status(404).json({ error: DEGREE_PROGRAM_NOT_FOUND });
    } catch (e) {
      generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
    }
  }
);

export default programController;
