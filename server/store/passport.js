/* eslint-disable import/prefer-default-export */
import { Strategy, ExtractJwt } from 'passport-jwt';
import { config, underscoreId } from './config';
import { User } from '../database/models';

export const applyPassportStrategy = passport => {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = config.passport.secret;

  passport.use(
    new Strategy(opts, (payload, done) => {
      User.findOne({ email: payload.email }, (err, user) => {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, {
            email: user.email,
            _id: user[underscoreId],
          });
        }
        return done(null, false);
      });
    })
  );

  // Use the GoogleStrategy within Passport.
  //   Strategies in passport require a `verify` function, which accept
  //   credentials (in this case, a token, tokenSecret, and Google profile), and
  //   invoke a callback with a user object.
  passport.use(
    new GoogleStrategy(
      {
        consumerKey: GOOGLE_CONSUMER_KEY,
        consumerSecret: GOOGLE_CONSUMER_SECRET,
        callbackURL: `${serverURI}/auth/google/callback`,
      },
      (token, tokenSecret, profile, done) => {
        if (profile && profile.emails) {
          console.log(token, tokenSecretprofile);
          const email = profile.emails[0].value;
          User.findOneAndUpdate({ googleId: profile.id }, (err, user) => {
            if (err) return done(err, false);

            if (user) {
              done(null, {
                email: user.email,
                _id: user[underscoreId],
              });
            }
            return done(null, false);
          });
        }
      }
    )
  );
};
