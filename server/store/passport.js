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
            _id: user[underscoreId]
          });
        }
        return done(null, false);
      });
    })
  );
};
