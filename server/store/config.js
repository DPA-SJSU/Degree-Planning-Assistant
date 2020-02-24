export const config = {
  passport: {
    secret: 'dpa-developers-dec-fall@2019',
    expiresIn: 1000000,
  },
  env: {
    port: 8080,
    mongoDBUri:
      process.env.ENV === 'prod'
        ? 'mongodb+srv://team31:w1TNAFsawdQKABWJ@dpa-jmd2c.gcp.mongodb.net/test?retryWrites=true&w=majority'
        : 'mongodb://localhost/dpa',
    mongoHostName: process.env.ENV === 'prod' ? 'mongodbAtlas' : 'localhost',
  },
};

export const underscoreId = '_id';
