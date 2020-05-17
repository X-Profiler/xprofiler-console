'use strict';

const Controller = require('egg').Controller;

class ProcessController extends Controller {
  async getXprofilerProcesses() {
    const { ctx } = this;
    const { appId, agentId } = ctx.query;

    // TODO
    const list = [];

    // get node processes
    const nodes = [];
    if (!list.length) {
      const stdout = await ctx.handleXtransitResponse('getAgentNodeProcesses', appId, agentId);
      if (stdout === false) {
        return;
      }

      for (const line of stdout.split('\n')) {
        const [pid, command] = line.split('\u0000');
        if (pid && command) {
          nodes.push({ pid, command });
        }
      }
    }

    ctx.body = { ok: true, data: { list, nodes } };
  }

  async checkXprofilerStatus() {
    const { ctx } = this;
    const { appId, agentId, pid } = ctx.query;

    const stdout = await ctx.handleXtransitResponse('checkProcessStatus', appId, agentId, pid);
    if (stdout === false) {
      return;
    }

    const data = JSON.parse(stdout);

    ctx.body = { ok: true, data };
  }
}

module.exports = ProcessController;
