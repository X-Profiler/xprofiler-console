'use strict';

const qs = require('querystring');
const Controller = require('egg').Controller;

class ThirdPartyController extends Controller {
  speedscope() {
    const { ctx, ctx: { app } } = this;
    const { fileId, fileType, downloadPath } = ctx.query;

    const { storage } = ctx.file[ctx.createFileKey(fileId, fileType)];

    if (!storage) {
      return (ctx.body = { ok: false, message: '文件未转储' });
    }

    const fileName = app.modifyFileName(storage);
    const query = {
      profileURL: encodeURIComponent(`${downloadPath}?fileType=${fileType}&fileId=${fileId}`),
      title: fileName,
    };
    ctx.redirect(`/public/speedscope/flamegraph.html?#${qs.stringify(query)}`);
  }
}

module.exports = ThirdPartyController;
