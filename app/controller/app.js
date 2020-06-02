'use strict';

const Controller = require('egg').Controller;

class AppController extends Controller {
  async getApps() {
    const { ctx, ctx: { service: { mysql } } } = this;
    const { userId } = ctx.user;
    const { type } = ctx.query;

    // get my/joined apps
    let list = [];
    if (type === 'myApps') {
      list = await mysql.getMyApps(userId);
    }
    if (type === 'joinedApps') {
      list = await mysql.getJoinedApps(userId, 2);
    }
    list = list.map(({ name, id: appId }) => ({ name, appId }));

    // get invitations
    const invitedApps = await mysql.getJoinedApps(userId, 1);
    const users = await ctx.getUserMap(invitedApps.map(item => item.owner));
    const invitations = invitedApps.map(app => {
      const { id: appId, name: appName, owner } = app;
      return {
        appId, appName,
        ownerInfo: users[owner] && users[owner].nick || 'Unknown',
      };
    });

    ctx.body = { ok: true, data: { list, invitations } };
  }

  async saveApp() {
    const { ctx, ctx: { app } } = this;
    const { userId } = ctx.user;
    const { newAppName } = ctx.request.body;

    const appSecret = app.createAppSecret(userId, newAppName);

    const res = await ctx.tryCatch('mysql', 'saveApp', [userId, newAppName, appSecret], '不能创建重复应用');
    if (!res) {
      return;
    }
    const { insertId: appId } = res;
    const data = {
      appName: newAppName,
      appId, appSecret,
    };
    ctx.body = { ok: true, data };
  }

  async getAppInfo() {
    const { ctx } = this;
    const { owner: currentUserIsOwner, info: { name: appName } } = ctx.appInfo;

    ctx.body = { ok: true, data: { currentUserIsOwner, appName } };
  }
}

module.exports = AppController;
