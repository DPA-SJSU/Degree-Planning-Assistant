import express from 'express';
import logger from "winston";

import { checkSchema, validationResult } from 'express-validator';
import { planInputValidation, planUserIdValidationQuery, planUserIdValidationBody } from "../validation/plan.validation";

import { Plan } from "../database/models.js";

const planRouter = express.Router();

/*
planRouter.post("/create", checkSchema(createPlanValidation), (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty() === false) {
        return res.status(400).json({ errorMsg: "Invalid request", errors })
    }

    //TODO: Store to database

    return res.status(200).json({ msg: "Works!" });
});
*/

// @route   GET /plan
// @desc    Fetches a degree plan associated with the given user id (query)
// @access  Private
planRouter.get("/", checkSchema(planUserIdValidationQuery), async (req, res) => { // TODO: Middleware for authenticating HTTP request with authentication token
    const reqErrors = validationResult(req);
    if (reqErrors.isEmpty() === false) {
        return res.status(400).json({ errorMsg: "Invalid request", reqErrors});
    }

    const userId = req.query.userId;

    try {
        const degreePlans = await Plan.findOne({ userId });
        if (degreePlans === null) {
            logger.info({ msg: `404 Attempt to find degree plan for userId: ${user_id} failed`});
            return res.status(404).json({ errorMsg: "No degree plans for that user" });
        } else {
            return res.status(200).json(degreePlans);
        }
    }
    catch (fetchError) {
        logger.info(fetchError);
        return res.status(500).json({ errorMsg: "Server error", fetchError});
    }
})

// @route   DELETE /plan
// @desc    Deletes a degree plan associated with the given user id (query)
// @access  Private
planRouter.delete("/", checkSchema(planUserIdValidationBody), async (req, res) => { // TODO: Middleware for authenticating HTTP request with authentication token
    const reqErrors = validationResult(req);
    if (reqErrors.isEmpty() === false) {
        return res.status(400).json({ errorMsg: "Invalid request", reqErrors});
    }

    const userId = req.body.userId;

    try {
        await Plan.deleteOne({ userId });
        return res.status(200).json();
    } catch (deleteError) {
        logger.info(deleteError);
        return res.status(500).json({ errorMsg: "Server error", deleteError});
    }
});

export default planRouter;