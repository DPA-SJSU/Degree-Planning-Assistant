import nodemailer from 'nodemailer';
import ejs from 'ejs';

const { google } = require('googleapis');

const { OAuth2 } = google.auth;
const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground';
const {
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET,
  MAILING_SERVICE_REFRESH_TOKEN,
  SENDER_EMAIL_ADDRESS,
} = process.env;
const Mailing = {};
const oauth2Client = new OAuth2(
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET,
  OAUTH_PLAYGROUND
);

const TEMPLATES = {
  subscribe: {
    fileName: 'subscribe.ejs',
    subject: '[DegreeInsight] Welcome to DegreeInsight',
  },
  forgotPassword: {
    fileName: 'forgotPassword.ejs',
    subject: '[DegreeInsight] Password reset link has arrived',
  },
  resetPassword: {
    fileName: 'resetPassword.ejs',
    subject: '[DegreeInsight] Password Reset Successfully',
  },
  registerConfirmation: {
    fileName: 'registerConfirmation.ejs',
    subject: '[DegreeInsight] Email Confirmation',
  },
};

/**
 * Send Email
 */
Mailing.sendEmail = data => {
  return new Promise((resolve, reject) => {
    try {
      oauth2Client.setCredentials({
        refresh_token: MAILING_SERVICE_REFRESH_TOKEN,
      });

      const accessToken = oauth2Client.getAccessToken();

      const smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: SENDER_EMAIL_ADDRESS,
          clientId: MAILING_SERVICE_CLIENT_ID,
          clientSecret: MAILING_SERVICE_CLIENT_SECRET,
          refreshToken: MAILING_SERVICE_REFRESH_TOKEN,
          accessToken,
        },
      });

      const filePath = `${__dirname}/../templates/email/${
        TEMPLATES[data.template].fileName
      }`;

      ejs.renderFile(filePath, data, {}, (e, content) => {
        if (e) return e;

        const mailOptions = {
          from: SENDER_EMAIL_ADDRESS,
          to: data.email,
          subject: TEMPLATES[data.template].subject,
          html: content,
        };

        smtpTransport.sendMail(mailOptions, (err, info) => {
          if (err) {
            return reject(err);
          }
          resolve(info);
        });
      });
    } catch (e) {
      console.log(`in here`, e);
      reject(e);
    }
  });
};
export default Mailing;
