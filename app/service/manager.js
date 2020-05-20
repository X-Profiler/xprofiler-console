'use strict';

const Service = require('egg').Service;

class ManagerService extends Service {
  async request(path, data, defaultValue) {
    const { ctx, ctx: { app: { sign, config: { xtransitManager, secure: { secret }, httpTimeout } } } } = this;
    const url = `${xtransitManager}${path}`;
    data.signature = sign(data, secret);
    try {
      let { data: result } = await ctx.curl(url, {
        method: 'POST',
        data,
        nestedQuerystring: true,
        timeout: data.expiredTime || httpTimeout,
        contentType: 'json',
      });
      result = JSON.parse(result);
      if (!result.ok) {
        ctx.logger.error(`request failed: ${result.message}, url: ${url}, data: ${JSON.stringify(data)}`);
        return defaultValue;
      }
      return result.data;
    } catch (err) {
      ctx.logger.error(`request failed: ${err}, url: ${url}, data: ${JSON.stringify(data)}`);
      return defaultValue;
    }
  }

  handleXtransitResponse(result) {
    const { ctx } = this;
    if (!result.ok) {
      ctx.logger.error(result.message);
      return;
    }
    const { stdout, stderr } = result.data;
    if (stderr) {
      ctx.logger.error(stderr);
      return;
    }
    try {
      return JSON.parse(stdout.trim());
    } catch (err) {
      ctx.logger.error(err);
      return;
    }
  }

  // comman manager request
  getClients(appId) {
    return this.request('/xprofiler/clients', { appId }, {});
  }

  // exec commands
  getAgentOsInfo(appId, agentId) {
    return this.request('/xprofiler/agent_osinfo', { appId, agentId });
  }

  getAgentNodeProcesses(appId, agentId) {
    return this.request('/xprofiler/agent_node_processes', { appId, agentId });
  }

  checkProcessStatus(appId, agentId, pid) {
    return this.request('/xprofiler/check_process_status', { appId, agentId, pid });
  }

  checkProcessessAvlie(appId, agentId, pids) {
    return this.request('/xprofiler/check_processes_alive', { appId, agentId, pids });
  }
}

module.exports = ManagerService;
