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

  getClients(appId) {
    return this.request('/xprofiler/clients', { appId }, {});
  }
}

module.exports = ManagerService;
