'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/controller/home.test.js', () => {
  it('should block anonymous user', async () => {
    const res = await app.httpRequest()
      .get('/');
    assert(res.status === 401);
    assert(res.text === 'access denied');
  });

  it('should GET /', async () => {
    await app.mockUser();
    const res = await app.httpRequest()
      .get('/');
    assert(res.status === 200);
    assert(res.text.includes('<title>Easy-Monitor</title>'));
    assert(res.headers['content-type'] === 'text/html; charset=utf-8');
  });
});
