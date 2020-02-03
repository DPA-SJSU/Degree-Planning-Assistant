import express from 'express';
import { Course, Semester } from '../database/models';

const textScanController = express.Router();

textScanController.post('/', (req, res) => {
  const { text } = req.body;

  // Scan for Semester
});

export default textScanController;
