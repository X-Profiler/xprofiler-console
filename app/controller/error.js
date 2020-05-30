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

  async getLogs() {
    const { ctx, ctx: { service: { manager } } } = this;
    const { appId, agentId, errorFile, currentPage, pageSize } = ctx.query;

    const { errors, count } = await manager.getErrors(appId, agentId, errorFile, currentPage, pageSize);

    ctx.body = {
      ok: true,
      data: {
        count,
        list: Array.isArray(errors) ? errors : [],
      },
    };
  }
}

module.exports = ErrorController;
