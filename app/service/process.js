'use strict';

const Service = require('egg').Service;

class ProcessService extends Service {
  async getDataByPeriod(appId, agentId, peroid) {
    const { ctx: { service: { metric } } } = this;
    return await metric.getDataByPeriod(appId, agentId, 'process_', peroid);
  }
}

module.exports = ProcessService;
