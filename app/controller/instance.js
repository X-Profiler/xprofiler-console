'use strict';

const Controller = require('egg').Controller;

class InstanceController extends Controller {
  async getAgents() {
    const { ctx, ctx: { service: { manager } } } = this;
    const { appId } = ctx.query;

    const { clients } = await manager.getClients(appId);
    let list = [];
    if (Array.isArray(clients)) {
      list = clients.map(({ agentId }) => ({ agentId }));
    }

    ctx.body = { ok: true, data: { list } };
  }
}

module.exports = InstanceController;
