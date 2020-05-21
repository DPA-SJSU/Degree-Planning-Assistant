import { Strategy, ExtractJwt } from 'passport-jwt';
import { config, underscoreId } from './config';
import { User } from '../database/models';
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

export const applyPassportStrategy = passport => {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = config.passport.secret;

  // Passport session setup.
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id)
      .then(user => done(null, user))
      .catch(e => done(null, false));
  });

  // Regular Login Strategy
  passport.use(
    new Strategy(opts, (payload, done) => {
      User.findOne({ email: payload.email }, (err, user) => {
        if (err) return done(err, false);
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

  // Google Login Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID:
          '163944226446-9i6i4ahh1gcegjicnd4p8vkolnkks3vh.apps.googleusercontent.com',
        clientSecret: 'y5KtqLgalqrPGfnYVUzKYkoa',
        callbackURL: 'http://localhost:8080/auth/google/callback',
      },
      (token, tokenSecret, profile, done) => {
        if (profile && profile.emails) {
          const { id, emails, name, photos, displayName } = profile;
          const email = emails[0].value;
          const updatedUser = {
            email,
            role: 'student',
            firstName: name.givenName,
            lastName: name.familyName,
            avatarUrl: photos[0].value,
            googleId: id,
            googleObj: {
              email,
              name: displayName,
              url: 'https://plus.google.com',
            },
          };

          return User.findOneAndUpdate({ email }, updatedUser, {
            new: true,
            upsert: true,
          })
            .then(user => {
              console.log(`UpdatedUser`, user);
              return done(null, {
                email: user.email,
                _id: user[underscoreId],
              });
            })
            .catch(() => done(null, false));
        }
        return done(null, false);
      }
    )
  );
};
