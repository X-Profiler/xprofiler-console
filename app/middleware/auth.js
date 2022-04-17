'use strict';

const pMap = require('p-map');

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
      if (!ctx.checkPossibleParams(['appId'])) {
        return;
      }
      const appId = ctx.query.appId || ctx.request.body.appId;
      const { userId } = ctx.user;
      const [owner, member] = await ctx.checkAppMember(appId, userId);
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

    // check the current user can be access to the agent
    async agentAccessibleRequired(ctx, next) {
      if (!ctx.checkPossibleParams(['appId', 'agentId'])) {
        return;
      }

      const { service: { manager } } = ctx;

      // check is app member
      const { userId } = ctx.user;
      const appId = ctx.query.appId || ctx.request.body.appId;
      const [owner, member] = await ctx.checkAppMember(appId, userId);
      if (!owner && !member) {
        return ctx.authFailed(403, '您没有此应用的访问权限');
      }

      // check the agent belongs to this app
      const agentId = ctx.query.agentId || ctx.request.body.agentId;
      const { client } = await manager.getClient(appId, agentId);
      if (!client.server) {
        return ctx.authFailed(403, '此实例尚未连接或者您没有此实例的访问权限');
      }

      await next();
    },

    // check the current user can be access to the file(s)
    async fileAccessibleRequired(ctx, next) {
      const { service: { mysql } } = ctx;
      if (!ctx.checkPossibleParams(['files'], false) && !ctx.checkPossibleParams(['fileId', 'fileType'], false)) {
        return ctx.authFailed(400, '缺少参数');
      }

      const query = ctx.query;
      const post = ctx.request.body;
      const files = post.files;
      const fileId = query.fileId || post.fileId;
      const fileType = query.fileType || post.fileType;

      let checks;
      if (Array.isArray(files)) {
        checks = files;
      } else {
        checks = [{ fileId, fileType }];
      }

      const coreTypes = {
        core: 'file_storage',
        executable: 'node_storage',
      };

      const filesInfo = await pMap(checks, async ({ fileId, fileType }) => {
        if (coreTypes[fileType]) {
          const file = await mysql.getCoredumpById(fileId);
          return file && Object.assign(file, { type: fileType, storageKey: coreTypes[fileType] });
        }

        const file = await mysql.getFileByIdAndType(fileId, fileType);
        return file && Object.assign(file, { storageKey: 'storage' });

      }, { concurrency: 2 });

      if (filesInfo.some(file => !file)) {
        return ctx.authFailed(404, '文件不存在');
      }

      const { userId } = ctx.user;
      ctx.file = {};
      const appMemberAuthList = await pMap(filesInfo, async file => {
        const [owner, member] = await ctx.checkAppMember(file.app, userId);
        if (owner || member) {
          ctx.file[ctx.createFileKey(file.id, file.type)] = file;
          return true;
        }
        return false;
      }, { concurrency: 2 });

      if (appMemberAuthList.some(auth => !auth)) {
        return ctx.authFailed(403, '您没有文件的访问权限');
      }

      await next();
    },

    // check the current user can be access to the strategy
    async strategyAccessibleRequired(ctx, next) {
      const { service: { mysql } } = ctx;
      if (!ctx.checkPossibleParams(['strategyId'])) {
        return;
      }

      const strategyId = ctx.query.strategyId || ctx.request.body.strategyId;
      const strategy = await mysql.getStrategyById(strategyId);
      if (!strategy) {
        return ctx.authFailed(404, '规则不存在');
      }

      const { userId } = ctx.user;
      const [owner, member] = await ctx.checkAppMember(strategy.app, userId);
      if (!owner && !member) {
        return ctx.authFailed(403, '您没有此规则的访问权限');
      }
      ctx.strategy = strategy;

      await next();
    },
  };
};
