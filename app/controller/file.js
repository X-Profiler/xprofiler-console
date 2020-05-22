'use strict';

const Controller = require('egg').Controller;

class FileController extends Controller {
  async getFiles() {
    const { ctx, ctx: { service: { mysql } } } = this;
    const { appId, filterType, currentPage, pageSize } = ctx.query;

    const files = await mysql.getFiles(appId, filterType);

    const start = (currentPage - 1) * pageSize;
    const end = currentPage * pageSize;
    const count = files.length;
    const list = files.filter((...args) => args[1] >= start && args[1] < end);

    ctx.body = { ok: true, data: { list, count } };
  }
}

module.exports = FileController;
