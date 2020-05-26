'use strict';

const qs = require('querystring');
const Controller = require('egg').Controller;

class DevtoolsController extends Controller {
  chooseDevtools(type) {
    const { ctx, ctx: { app } } = this;
    const { fileId, fileType, selectedTab } = ctx.query;
    const { storage } = ctx.file[ctx.createFileKey(fileId, fileType)];

    if (!storage) {
      return (ctx.body = { ok: false, message: '文件未转储' });
    }

    const fileName = app.modifyFileName(storage);
    const query = { fileId, fileType, fileName, selectedTab };
    ctx.redirect(`/public/devtools/${type}/devtools_app.html?${qs.stringify(query)}`);
  }

  newDevtools() {
    this.chooseDevtools('new');
  }

  oldDevtools() {
    this.chooseDevtools('old');
  }
}

module.exports = DevtoolsController;
