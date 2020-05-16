'use strict';

const Controller = require('egg').Controller;

class OverviewController extends Controller {
  async getMetrics() {
    const { ctx, ctx: { service: { manager } } } = this;
    const { appId } = ctx.query;

    const { clients } = await manager.getClients(appId);

    const data = {
      instanceCount: Array.isArray(clients) && clients.length,
    };
    ctx.body = { ok: true, data };
  }
}

module.exports = OverviewController;
