'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router } = app;
  const {
    userRequired,
    appMemberRequired,
  } = app.middlewares.auth({}, app);

  // home
  router.get('/', userRequired, 'home.index');

  // user
  router.get('/xapi/user', userRequired, 'user.index');

  // app
  router.get('/xapi/apps', userRequired, 'app.getApps');
  router.post('/xapi/app', userRequired, 'app.saveApp');
  router.get('/xapi/app', userRequired, appMemberRequired, 'app.getAppInfo');
};
