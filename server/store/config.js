export const config = {
  mongooseConfig: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
  passport: {
    secret: 'dpa-developers-dec-fall@2019',
    expiresIn: 1000000,
  },
  env:
    process.env.ENV === 'prod'
      ? {
          port: 8080,
          mongoHostName: 'MongoDB Atlas',
          mongoDBUri:
            'mongodb+srv://team31:w1TNAFsawdQKABWJ@dpa-jmd2c.gcp.mongodb.net/prod?retryWrites=true&w=majority',
          clientURI: 'https://localhost:3000',
          serverURI: 'https://dpa-edu-server.appspot.com',
        }
      : {
          port: 8080,
          mongoHostName: 'local',
          mongoDBUri: 'mongodb://localhost/prod',
          clientURI: 'https://localhost:3000',
          serverURI: 'http://localhost:8080',
        },
};

export const underscoreId = '_id';
