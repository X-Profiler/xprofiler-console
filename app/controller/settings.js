'use strict';

const Controller = require('egg').Controller;

class SettingsController extends Controller {
  async getSettingInfo() {
    const { ctx } = this;
    const { info: { id: appId, name, secret } } = ctx.appInfo;

    ctx.body = { ok: true, data: { appId, name, secret } };
  }

  async renameApp() {
    const { ctx, ctx: { service: { mysql } } } = this;
    const { appId, newAppName } = ctx.request.body;

    await mysql.renameApp(appId, newAppName);

    ctx.body = { ok: true };
  }

  async deleteApp() {
    const { ctx, ctx: { service: { mysql } } } = this;
    const { appId } = ctx.request.body;

    const tasks = [];
    tasks.push(mysql.deleteAppByAppId(appId));
    tasks.push(mysql.deleteMembersByAppId(appId));
    await Promise.all(tasks);

    ctx.body = { ok: true };
  }
}

module.exports = SettingsController;
