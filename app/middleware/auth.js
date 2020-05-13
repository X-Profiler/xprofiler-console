'use strict';

module.exports = () => {
  return {
    // check user login
    async userRequired(ctx, next) {
      if (ctx.user) {
        return await next();
      }
      ctx.authFailed(401, '请先登录');
    },

    // check user is invited into app
    async appInvitationRequired(ctx, next) {
      const { service: { mysql } } = ctx;
      if (!ctx.checkPossibleParams(['appId'])) {
        return;
      }
      const appId = ctx.query.appId || ctx.request.body.appId;
      const { userId } = ctx.user;
      const member = await mysql.checkAppMemberByUserId(appId, userId, 1);
      if (member) {
        return await next();
      }
      ctx.authFailed(403, '您没有被邀请至此应用');
    },

    // check user is owner/member of app
    async appMemberRequired(ctx, next) {
      const { service: { mysql } } = ctx;
      if (!ctx.checkPossibleParams(['appId'])) {
        return;
      }
      const appId = ctx.query.appId || ctx.request.body.appId;
      const { userId } = ctx.user;
      const tasks = [];
      tasks.push(mysql.checkAppOwnerByUserId(appId, userId));
      tasks.push(mysql.checkAppMemberByUserId(appId, userId, 2));
      const [owner, member] = await Promise.all(tasks);
      if (owner) {
        ctx.appInfo = { owner: true, info: owner };
        return await next();
      }
      if (member) {
        ctx.appInfo = { owner: false, info: member };
        return await next();
      }
      ctx.authFailed(403, '您没有此应用的访问权限');
    },

    // check user is owner of app
    async appOwnerRequired(ctx, next) {
      const { service: { mysql } } = ctx;
      if (!ctx.checkPossibleParams(['appId'])) {
        return;
      }
      const appId = ctx.query.appId || ctx.request.body.appId;
      const { userId } = ctx.user;
      const owner = await mysql.checkAppOwnerByUserId(appId, userId);
      if (owner) {
        ctx.appInfo = { owner: true, info: owner };
        return await next();
      }
      ctx.authFailed(403, '您没有此页面的访问权限');
    },
  };
};
