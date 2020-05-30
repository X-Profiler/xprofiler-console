'use strict';

const path = require('path');
const Controller = require('egg').Controller;

class ErrorController extends Controller {
  async getFiles() {
    const { ctx, ctx: { service: { manager } } } = this;
    const { appId, agentId } = ctx.query;

    let list = [];
    const { files } = await manager.getFiles(appId, agentId, 'error');
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

module.exports = ErrorController;
