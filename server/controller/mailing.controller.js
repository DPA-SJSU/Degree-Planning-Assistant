import express from 'express';
import Mailing from '../store/mailing';
import { generateServerErrorCode, sendEmail } from '../store/utils';
import { SOME_THING_WENT_WRONG, FAILED_TO_SEND_EMAIL } from './constant';

const mailingController = express.Router();

/**
 * POST/
 * Subscribe to receive News/Letter of DPA
 */
mailingController.get('/', async (req, res) => {
  const { email, template, mode } = req.query;
  sendEmail(email, template, mode)
    .then(info => {
      const { accepted, rejected } = info;
      res.status(200).json({ accepted, rejected });
    })
    .catch(e => generateServerErrorCode(res, 500, e, FAILED_TO_SEND_EMAIL));
});

export default mailingController;
