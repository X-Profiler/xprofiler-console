'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router } = app;
  const {
    userRequired,
    appMemberRequired,
    appOwnerRequired,
  } = app.middlewares.auth({}, app);

  // home
  router.get('/', userRequired, 'home.index');

  // user
  router.get('/xapi/user', userRequired, 'user.index');

  // app
  router.get('/xapi/apps', userRequired, 'app.getApps');
  router.post('/xapi/app', userRequired, 'app.saveApp');
  router.get('/xapi/app', userRequired, appMemberRequired, 'app.getAppInfo');

  // settings
  router.get('/xapi/settings', userRequired, appOwnerRequired, 'settings.getSettingInfo');
  router.put('/xapi/settings_app_name', userRequired, appOwnerRequired, 'settings.renameApp');
  router.delete('/xapi/settings_app', userRequired, appOwnerRequired, 'settings.deleteApp');
};
