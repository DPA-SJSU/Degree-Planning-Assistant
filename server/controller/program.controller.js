import express from 'express';
import { check, validationResult } from 'express-validator';

import { 
    SCHOOL_FIELD_IS_REQUIRED, 
    SCHOOL_FIELD_IS_EMPTY, 
    SCHOOL_FIELD_CONTAINS_FORBIDDEN_CHARACTERS,
    MAJOR_FIELD_IS_REQUIRED,
    MAJOR_FIELD_IS_EMPTY,
    MAJOR_FIELD_CONTAINS_FORBIDDEN_CHARACTERS,
    CATALOGYEAR_IS_REQUIRED,
    CATALOGYEAR_IS_EMPTY,
    CATALOGYEAR_CONTAINS_FORBIDDEN_CHARACTERS,
    GENERALEDUCATION_NOT_JSON,
    MAJORREQUIREMENTS_NOT_JSON,
    OTHERREQUIREMENTS_NOT_JSON
} from "./constant";

const programController = express.Router();

const createDegreeProgramValidator = [
    check("school")
        .exists()
        .withMessage(SCHOOL_FIELD_IS_REQUIRED)
        .not().isEmpty()
        .withMessage(SCHOOL_FIELD_IS_EMPTY)
        .custom(value => {
            const regExp = new RegExp(/^([a-z]|[A-Z]|\s)+$/, "g");
            if (regExp.test(value) === true) {
                return Promise.resolve();
            } else {
                return Promise.reject(SCHOOL_FIELD_CONTAINS_FORBIDDEN_CHARACTERS)
            }
        })
        .unescape()
        .ltrim()
        .rtrim(),
    check("major")
        .exists()
        .withMessage(MAJOR_FIELD_IS_REQUIRED)
        .not().isEmpty()
        .withMessage(MAJOR_FIELD_IS_EMPTY)
        .custom(value => {
            const regExp = new RegExp(/^([a-z]|[A-Z]|\s)+$/, "g");
            if (regExp.test(value) === true) {
                return Promise.resolve();
            } else {
                return Promise.reject(SCHOOL_FIELD_CONTAINS_FORBIDDEN_CHARACTERS)
            }
        })
        .unescape()
        .ltrim()
        .rtrim(),
    check("catalog_year")
        .exists()
        .withMessage(CATALOGYEAR_IS_REQUIRED)
        .not().isEmpty()
        .withMessage(CATALOGYEAR_IS_EMPTY)
        .isNumeric().isInt()
        .withMessage(CATALOGYEAR_CONTAINS_FORBIDDEN_CHARACTERS)
        .unescape()
        .ltrim()
        .rtrim(),
    check("general_education")
        .exists()
        .not().isEmpty()
        .unescape()
        .ltrim()
        .rtrim()
        .bail()
        .custom(value => {
            console.log(value.constructor);
            if (value.constructor !== Object) {
                return Promise.reject("general_education must be a JSON object");
            }
            for (prop of value) {
                if (prop.constructor === Object) {
                    for (innerProp of prop) {
                        if (innerProp.constructor !== Array) {
                            return Promise.reject("general_education does not follow specific object structure");
                        }
                    }
                } else if (prop.constructor !== Array) {
                    return Promise.reject("general_education does not follow specific object structure")
                }
            }
            return Promise.resolve();
        }),
    check("major_requirements")
        .exists()
        .not().isEmpty()
        .unescape()
        .ltrim()
        .rtrim(),
    check("other_requirements")
        .exists()
        .not().isEmpty()
        .unescape()
        .ltrim()
        .rtrim(),
];

// @route   POST /program/
// @desc    Creates a new degree program
// @access  Private
programController.post("/", createDegreeProgramValidator, async (req, res) => {
    const errors = validationResult(req);

    if (errors) {
        return res.status(400).json({errors});
    }

    return res.status(200).json({ msg: "works" });
});


// @route   GET /program/
// @desc    Testing HTTP requests
// @access  Public
programController.get("/", async (req, res) => {
    return res.status(200).json({ msg: "works" });
});

export default programController;
