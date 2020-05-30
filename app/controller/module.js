'use strict';

const path = require('path');
const Controller = require('egg').Controller;

class ModuleController extends Controller {
  async getFiles() {
    const { ctx, ctx: { service: { manager } } } = this;
    const { appId, agentId } = ctx.query;

    let list = [];
    const { files } = await manager.getFiles(appId, agentId, 'package');
    if (Array.isArray(files)) {
      list = files.map(filePath => {
        return {
          label: path.basename(filePath),
          value: filePath,
        };
      });
    }

    ctx.body = { ok: true, data: { list } };
  }
}

module.exports = ModuleController;
