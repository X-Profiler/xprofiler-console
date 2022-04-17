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
    if (!result) {
      return;
    }

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

  // common manager request
  getClient(appId, agentId) {
    return this.request('/xprofiler/client', { appId, agentId }, {});
  }

  getClients(appId) {
    return this.request('/xprofiler/clients', { appId }, {});
  }

  getFiles(appId, agentId, type, options) {
    const { ctx: { app: { config: { auditExpiredTime: expiredTime } } } } = this;
    const data = { appId, agentId, type, options };
    if (type === 'package') {
      data.expiredTime = expiredTime;
    }
    return this.request('/xprofiler/files', data, {});
  }

  getErrors(appId, agentId, errorFile, currentPage, pageSize) {
    return this.request('/xprofiler/errors', { appId, agentId, errorFile, currentPage, pageSize }, {});
  }

  getModules(appId, agentId, moduleFile, options) {
    return this.request('/xprofiler/modules', { appId, agentId, moduleFile, options }, {});
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

  checkFileStatus(appId, agentId, filePath) {
    return this.request('/xprofiler/check_file_status', { appId, agentId, filePath });
  }

  takeAction(appId, agentId, pid, command, options) {
    return this.request('/xprofiler/take_action', { appId, agentId, pid, command, options });
  }

  transferFile(appId, agentId, fileId, fileType, filePath, server, token) {
    const { ctx: { app: { config: { uploadFileExpiredTime: expiredTime } } } } = this;
    const data = { appId, agentId, fileId, fileType, filePath, server, token };
    data.expiredTime = expiredTime;
    return this.request('/xprofiler/transfer_file', data);
  }
}

module.exports = ManagerService;
