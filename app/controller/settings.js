'use strict';

const pMap = require('p-map');
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
    const { ctx, ctx: { app: { storage }, service: { mysql } } } = this;
    const { appId } = ctx.request.body;

    // delete storage files
    const [files, coredumps] = await Promise.all([
      await mysql.getFiles(appId, 'all'),
      await mysql.getCoredumps(appId),
    ]);
    const storages = [
      ...files.map(file => file.storage),
      ...coredumps.map(core => core.file_storage),
      ...coredumps.map(core => core.node_storage),
    ];
    await pMap(storages, async fileName => {
      if (!fileName) {
        return;
      }
      await storage.deleteFile(fileName);
    }, { concurrency: 2 });

    // // delete app, app members, files
    const tasks = [];
    tasks.push(mysql.deleteAppByAppId(appId));
    tasks.push(mysql.deleteMembersByAppId(appId));
    tasks.push(mysql.deleteFiles(appId));
    tasks.push(mysql.deleteCoredumps(appId));
    await Promise.all(tasks);

    ctx.body = { ok: true };
  }
}

module.exports = SettingsController;
