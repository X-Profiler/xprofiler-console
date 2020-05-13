'use strict';

function handleAuthFailed(ctx, code, message) {
  // const { app } = ctx;
  // if (app.isAjax(ctx.headers)) {
  //   ctx.body = { ok: false, message, code };
  // } else {
  //   ctx.redirect(`/${code}`);
  // }
  ctx.body = { ok: false, message, code };
}

module.exports = () => {
  return {
    // check user login
    async userRequired(ctx, next) {
      if (ctx.user) {
        return await next();
      }
      handleAuthFailed(ctx, 401, 'login first');
    },

    // check user is invited into app
    async appInvitationRequired(ctx, next) {
      const { service: { mysql } } = ctx;
      const appId = ctx.query.appId || ctx.request.body.appId;
      if (appId) {
        const { userId } = ctx.user;
        const member = await mysql.checkMemberStatusByUserId(appId, userId, 1);
        if (member) {
          return await next();
        }
        handleAuthFailed(ctx, 403, 'you haven\'t been invited to this app');
      } else {
        handleAuthFailed(ctx, 400, 'lack of params');
      }
    },

    // check user is owner/member of app
    async appMemberRequired(ctx, next) {
      const { service: { mysql } } = ctx;
      const appId = ctx.query.appId || ctx.request.body.appId;
      if (appId) {
        const { userId } = ctx.user;
        const tasks = [];
        tasks.push(mysql.checkAppOwnerByUserId(appId, userId));
        tasks.push(mysql.checkMemberStatusByUserId(appId, userId, 2));
        const [owner, member] = await Promise.all(tasks);
        if (owner) {
          ctx.appInfo = { owner: true, info: owner };
          return await next();
        }
        if (member) {
          ctx.appInfo = { owner: false, info: member };
          return await next();
        }
        handleAuthFailed(ctx, 403, 'you don\'t have permission to access this app');
      } else {
        handleAuthFailed(ctx, 400, 'lack of params');
      }
    },

    // check user is owner of app
    async appOwnerRequired(ctx, next) {
      const { service: { mysql } } = ctx;
      const appId = ctx.query.appId || ctx.request.body.appId;
      if (appId) {
        const { userId } = ctx.user;
        const owner = await mysql.checkAppOwnerByUserId(appId, userId);
        if (owner) {
          ctx.appInfo = { owner: true, info: owner };
          return await next();
        }
        handleAuthFailed(ctx, 403, 'you don\'t have permission to access this page');
      } else {
        handleAuthFailed(ctx, 400, 'lack of params');
      }
    },
  };
};
