import { describe, it, before, after } from 'mocha';
import { expect, should, assert } from 'chai';
import request from 'supertest';

import app from '../../app';

import { User } from '../../database/models';

const agent = request.agent(app);

const credentials = {
  test: {
    email: 'test@dpa.ai',
    password: 'test.password123!',
  },
  admin: {
    email: 'calvin.nvqc@gmail.com',
    password: '12345678!',
  },
  student: {
    email: 'student@dpa.ai',
    password: '12345678!',
  },
};

before(() => {
  User.deleteOne({ email: 'test@dpa.ai' }, (err, deleted) => {
    console.log(`Deleted email 'test@dpa.ai'`);
  });
});

describe('/register API', () => {
  it('Should give 400: EMAIL_IS_EMPTY', done => {
    agent
      .post('/register')
      .set('Accept', '*/*')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({ email: '', password: '12345678!' })
      .expect(400)
      .expect(res => {
        expect(res.body).to.be.an('object');
        expect(res.body).not.to.be.empty;
      })
      .end(done);
  });

  it('Should give 400: EMAIL_IS_IN_WRONG_FORMAT', done => {
    agent
      .post('/register')
      .set('Accept', '*/*')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({ email: 'test', password: '12345678!' })
      .expect(400)
      .expect(res => {
        expect(res.body).to.be.an('object');
        expect(res.body).not.to.be.empty;
      })
      .end(done);
  });

  it('Should give 400: PASSWORD_IS_EMPTY', done => {
    agent
      .post('/register')
      .set('Accept', '*/*')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({ email: 'test@dpa.ai', password: '' })
      .expect(400)
      .expect(res => {
        expect(res.body).to.be.an('object');
        expect(res.body).not.to.be.empty;
      })
      .end(done);
  });
  it('Should give 400: PASSWORD_LENGTH_MUST_BE_MORE_THAN_8', done => {
    agent
      .post('/register')
      .set('Accept', '*/*')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({ email: 'test@dpa.ai', password: '1234567' })
      .expect(400)
      .expect(res => {
        expect(res.body).to.be.an('object');
        expect(res.body).not.to.be.empty;
      })
      .end(done);
  });

  it('Should success if email and password are valid', done => {
    agent
      .post('/register')
      .set('Accept', '*/*')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send(credentials.test)
      .expect(200)
      .expect(res => {
        expect(res.body).to.be.an('object');
        expect(res.body).not.to.be.empty;
      })
      .end(done);
  });

  it('Should give 403: USER_EXISTS_ALREADY', done => {
    agent
      .post('/register')
      .set('Accept', '*/*')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send(credentials.test)
      .expect(403)
      .expect(res => {
        expect(res.body).to.be.an('object');
        expect(res.body).not.to.be.empty;
      })
      .end(done);
  });
});

describe('Login API', () => {
  it('Should give 400: EMAIL_IS_EMPTY', done => {
    agent
      .post('/login')
      .set('Accept', '*/*')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({ email: '', password: '12345678!' })
      .expect(400)
      .expect(res => {
        expect(res.body).to.be.an('object');
        expect(res.body).not.to.be.empty;
      })
      .end(done);
  });

  it('Should give 400: EMAIL_IS_IN_WRONG_FORMAT', done => {
    agent
      .post('/login')
      .set('Accept', '*/*')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({ email: 'test', password: '12345678!' })
      .expect(400)
      .expect(res => {
        expect(res.body).to.be.an('object');
        expect(res.body).not.to.be.empty;
      })
      .end(done);
  });

  it('Should give 400: PASSWORD_IS_EMPTY', done => {
    agent
      .post('/login')
      .set('Accept', '*/*')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({ email: 'test@dpa.ai', password: '' })
      .expect(400)
      .expect(res => {
        expect(res.body).to.be.an('object');
        expect(res.body).not.to.be.empty;
      })
      .end(done);
  });
  it('Should give 400: PASSWORD_LENGTH_MUST_BE_MORE_THAN_8', done => {
    agent
      .post('/login')
      .set('Accept', '*/*')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({ email: 'test@dpa.ai', password: '1234567' })
      .expect(400)
      .expect(res => {
        expect(res.body).to.be.an('object');
        expect(res.body).not.to.be.empty;
      })
      .end(done);
  });
  it('Should success if credential is valid', done => {
    agent
      .post('/login')
      .set('Accept', '*/*')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send(credentials.test)
      .expect(200)
      .expect(res => {
        expect(res.body).to.be.an('object');
        expect(res.body).not.to.be.empty;
      })
      .end(done);
  });

  it('Should give 403 wrong password', done => {
    agent
      .post('/login')
      .set('Accept', '*/*')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({ email: 'test@dpa.ai', password: '123456789' })
      .expect(403)
      .expect(res => {
        expect(res.body).to.be.an('object');
        expect(res.body).not.to.be.empty;
      })
      .end(done);
  });

  it('Should give 404 if user does not exist', done => {
    agent
      .post('/login')
      .set('Accept', '*/*')
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({ email: 'test.failed@dpa.ai', password: '123456789' })
      .expect(404)
      .expect(res => {
        expect(res.body).to.be.an('object');
        expect(res.body).not.to.be.empty;
      })
      .end(done);
  });
});
