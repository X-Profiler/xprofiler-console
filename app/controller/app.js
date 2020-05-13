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
      list = await mysql.getJoinedApps(userId);
    }
    list = list.map(({ name, id: appId }) => ({ name, appId }));

    // get invitations
    const invitations = [];

    ctx.body = { ok: true, data: { list, invitations } };
  }

  async saveApp() {
    const { ctx, ctx: { app, service: { mysql } } } = this;
    const { userId } = ctx.user;
    const { newAppName } = ctx.request.body;

    const appSecret = app.createAppSecret(userId, newAppName);

    try {
      const { insertId: appId } = await mysql.saveApp(userId, newAppName, appSecret);
      const data = {
        appName: newAppName,
        appId, appSecret,
      };
      ctx.body = { ok: true, data };
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        ctx.body = { ok: false, message: '不能创建重复应用' };
        return;
      }
      ctx.body = { ok: false, message: '服务器错误，邀请失败，请重试' };
    }
  }

  async getAppInfo() {
    const { ctx } = this;
    const { owner: currentUserIsOwner, info: { name: appName } } = ctx.appInfo;

    ctx.body = { ok: true, data: { currentUserIsOwner, appName } };
  }
}

module.exports = AppController;
