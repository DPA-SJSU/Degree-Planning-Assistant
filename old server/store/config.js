export const config = {
  env: {
    port: 8080
  },
  credential: {
    host: "localhost",
    user: "root",
    password: process.env.PASSWORD,
    database: "dpa" // This is refer to root db
  },
  passport: {
    secret: "dpa-developers-dec-fall@2019",
    expiresIn: 1000000000
  }
};
