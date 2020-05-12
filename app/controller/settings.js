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

    await mysql.deleteApp(appId);

    ctx.body = { ok: true };
  }
}

module.exports = SettingsController;
