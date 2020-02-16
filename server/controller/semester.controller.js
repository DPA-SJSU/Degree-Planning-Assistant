import express from 'express';
import {
    check,
    validationResult
} from 'express-validator';

import passport from 'passport';

import {
    SEMESTER_EXISTS_ALREADY,
    SEMESTER_TERM_IS_EMPTY,
    SEMESTER_YEAR_IS_EMPTY,
    SEMESTER_COURSES_ARE_EMPTY,
    SEMESTER_ID_IS_EMPTY,
    SEMESTER_NOT_FOUND,
    SOME_THING_WENT_WRONG,
    NO_DATA_TO_UPDATE
} from './constant';

import {
    Semester
} from '../database/models';
import { generateServerErrorCode } from '../store/utils';

const semesterController = express.Router();

const validateCreateSemester = [
    check('term')
      .exists()
      .withMessage(SEMESTER_TERM_IS_EMPTY),
    check('year')
      .exists()
      .withMessage(SEMESTER_YEAR_IS_EMPTY),
    check('courses')
      .exists()
      .withMessage(SEMESTER_COURSES_ARE_EMPTY)
]

const validateSemesterId = [
    check('semester_id')
      .exists()
      .withMessage(SEMESTER_ID_IS_EMPTY)
]

function createSemester(term, year, difficulty, courses) {
    let semester;
    const data = {
        term, year, difficulty, courses
    };
  
    semester = new Semester(data);
    return semester.save();
}
/**
 * Removes the undefined properties of an object
 * Found: https://stackoverflow.com/questions/25421233/javascript-removing-undefined-fields-from-an-object/38340374#38340374
 * @param {Object} obj 
 */
function removeUndefinedObjectProps(obj) {
    Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
    return obj;
}

function isObjectEmpty(obj) {
    return (Object.keys(obj).length === 0);
}

/**
 * POST/
 * Create a semester
 */
semesterController.post(
    '/create', 
    passport.authenticate('jwt', { session: false }), 
    validateCreateSemester, 
    async (req, res) => {

    const errorsAfterValidation = validationResult(req);
    if(!errorsAfterValidation.isEmpty()) {
        res.status(400).json({
            code: 400,
            errors: errorsAfterValidation.mapped(),
        })
    } else {
        try {
            const { term, year, difficulty, courses } = req.body;
            const semester = await Semester.findOne({ term, year, courses });
            if(!semester) {
                const newSemester = await createSemester(term, year, difficulty, courses);
                const semesterToReturn = { ...newSemester.toJSON() };
                res.status(200).json(semesterToReturn);
            } else {
                generateServerErrorCode(res, 403, 'create semester error', SEMESTER_EXISTS_ALREADY, 'semester_id');
            }
        } catch (e) {
            generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
        }
    }
});

/**
 * GET/
 * Get a semester
 */
semesterController.get(
    '/', 
    passport.authenticate('jwt', { session: false }), 
    validateSemesterId, 
    async (req, res) => {

    const errorsAfterValidation = validationResult(req);
    if(!errorsAfterValidation.isEmpty()) {
        res.status(400).json({
            code: 400,
            errors: errorsAfterValidation.mapped(),
        })
    } else {
        try {
            const { semester_id } = req.body;
            const fetchedSemester = await Semester.findOne({ _id: semester_id })

            if(fetchedSemester) {
                res.status(200).json(fetchedSemester);
            } else {
                generateServerErrorCode(res, 403, 'get semester error', SEMESTER_NOT_FOUND, 'semester_id');
            }
        } catch (e) {
            generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
        }
    }
});

/**
 * PUT/
 * Update a semester
 */
semesterController.put(
    '/update', 
    passport.authenticate('jwt', { session: false }), 
    validateSemesterId, 
    async (req, res) => {

    const errorsAfterValidation = validationResult(req);
    if(!errorsAfterValidation.isEmpty()) {
        res.status(400).json({
            code: 400,
            errors: errorsAfterValidation.mapped(),
        })
    } else {
        try {
            const { semester_id, term, year, difficulty, courses } = req.body;
            
            // Remove undefined properties
            let updateData = { term: term, year: year, difficulty: difficulty, courses: courses};
            updateData = removeUndefinedObjectProps(updateData);
            
            // Check if there is data to update 
            if(isObjectEmpty(updateData)) {
                return res.status(400).json({ error: NO_DATA_TO_UPDATE });
            }

            const updatedSemester = await Semester.findByIdAndUpdate(
                { _id: semester_id }, updateData, { useFindAndModify: false } );

            if(updatedSemester) {
                res.status(200).json(updatedSemester);
            } else {
                generateServerErrorCode(res, 403, 'update semester error', SEMESTER_NOT_FOUND, 'semester_id');
            }
        } catch (e) {
            generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
        }
    }
});

/**
 * DELETE/
 * Delete a semester
 */
semesterController.delete(
    '/delete', 
    passport.authenticate('jwt', { session: false }), 
    validateSemesterId, 
    async (req, res) => {

    const errorsAfterValidation = validationResult(req);
    if(!errorsAfterValidation.isEmpty()) {
        res.status(400).json({
            code: 400,
            errors: errorsAfterValidation.mapped(),
        })
    } else {
        try {
            const { semester_id } = req.body;
            const deletedSemester = await Semester.findByIdAndDelete({ _id: semester_id })

            if(deletedSemester) {
                res.status(200).json(deletedSemester);
            } else {
                generateServerErrorCode(res, 403, 'delete semester error', SEMESTER_NOT_FOUND, 'semester_id');
            }
        } catch (e) {
            generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
        }
    }
});

export default semesterController;