import express from 'express';
import Mailing from '../store/mailing';
import { Subscriber } from '../db/models';
import { generateServerErrorCode } from '../utils';
import { SOME_THING_WENT_WRONG } from './constant';

const mailingController = express.Router();

/**
 * POST/
 * Subscribe to receive News/Letter of DPA
 */
mailingController.post('/', async (req, res) => {
  const { email, template } = req.query;

  Subscriber.findOneAndUpdate(
    { email },
    { email, phase: 1 },
    { new: true, upsert: true },
    (err, updatedSubscriber) => {
      if (err) {
        generateServerErrorCode(res, 500, err, SOME_THING_WENT_WRONG);
      } else {
        Mailing.sendEmail({ email, template })
          .then(info => {
            res.status(200).json({
              message: 'email sent successfully',
              email,
              info,
              status: true,
            });
          })
          .catch(e => {
            console.log(`send email error`, e);
            generateServerErrorCode(res, 500, FAILED_TO_SEND_EMAIL, 'email');
          });
      }
    }
  );
});

export default mailingController;
