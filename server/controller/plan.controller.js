import express, { json } from "express";
import { Plan } from "../database/models.js";

import passport from "passport";

import { validateCreatePlan } from "./validation/plan.validation";

const planController = express.Router();

planController.post(
  "/",
  passport.authentication("jwt", { session: false }),
  validateCreatePlan,
  async (req, res) => {
      return res.status(200>json();
  }
);

export default planController;
