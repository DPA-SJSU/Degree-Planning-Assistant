import express from 'express';
import {
    check,
    validationResult
} from 'express-validator';

import {
    SEMESTER_EXISTS_ALREADY,
    SEMESTER_TERM_IS_EMPTY,
    SEMESTER_YEAR_IS_EMPTY,
    SEMESTER_COURSES_ARE_EMPTY
} from './constant';

import {
    Semester
} from '../database/models';
import { generateServerErrorCode } from '../store/utils';

const semesterController = express.Router();

const validation = [
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

function createSemester(term, year, difficulty, courses) {
    let semester;
    const data = {
        term, year, difficulty, courses
    };
  
    semester = new Semester(data);
    return semester.save();
}

/**
 * POST/
 * Create a semester
 */
semesterController.post('/create', validation, async (req, res) => {
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
                generateServerErrorCode(
                    res,
                    403,
                    'create semester error',
                    SEMESTER_EXISTS_ALREADY,
                    'term, year, courses'
                );
            }

        } catch (e) {
            generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
        }
    }
});

export default semesterController;