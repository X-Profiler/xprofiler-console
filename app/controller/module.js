'use strict';

const path = require('path');
const Controller = require('egg').Controller;

class ModuleController extends Controller {
  async getFiles() {
    const { ctx, ctx: { service: { manager } } } = this;
    const { appId, agentId } = ctx.query;

    let list = [];
    const { files } = await manager.getFiles(appId, agentId, 'package', { fromCache: true });
    if (Array.isArray(files)) {
      list = files.map(({ filePath, risk, riskModules }) => {
        return {
          label: path.basename(filePath),
          value: filePath,
          risk, riskModules,
        };
      });
    }

    ctx.body = { ok: true, data: { list } };
  }

  async getModules() {
    const { ctx, ctx: { service: { manager } } } = this;
    const { appId, agentId, moduleFile } = ctx.query;

    const data = await manager.getModules(appId, agentId, moduleFile, { fromCache: true });

    ctx.body = { ok: true, data };
  }
}

module.exports = ModuleController;
