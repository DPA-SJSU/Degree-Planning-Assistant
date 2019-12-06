/* eslint-disable import/prefer-default-export */
import { Strategy, ExtractJwt } from "passport-jwt";
import { config } from "./config";

export const applyPassportStrategy = passport => {
  const opts = {};

  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

  opts.secretOrKey = config.passport.secret;

  passport.use(
    new Strategy(opts, (payload, done) => {
      let getUserQuery = `SELECT * FROM User WHERE email like '${payload.email}'`;

      db.query(getUserQuery, (err, rows) => {
        if (err) return done(err, false);

        if (!rows.length) {
          return done(null, false, { message: "User Not Found" });
        } else {
          if (!bcrypt.compareSync(password, rows[0].password, () => {})) {
            return done(null, false, { message: "Wrong Password" });
          } else {
            return done(null, rows[0]);
          }
        }
      });
    })
  );
};
