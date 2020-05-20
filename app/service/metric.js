'use strict';

const pMap = require('p-map');
const Service = require('egg').Service;

class MetricService extends Service {
  async getDataByPeriod(appId, agentId, tablePrefix, peroid) {
    const { ctx, ctx: { app, service: { mysql } } } = this;

    const periods = app.getPeriods(peroid);
    let list = await pMap(periods, async ({ date, start, end }) => {
      let data;
      try {
        data = await mysql.getProcessData(`${tablePrefix}${date}`, appId, agentId, start, end);
      } catch (err) {
        ctx.logger.error(`getDataByPeriod failed: ${err}`);
      }
      return data;
    }, { concurrency: 2 });

    list = list
      .filter(item => item)
      .reduce((list, item) => (list = list.concat(item)), []);

    return list;
  }
}

module.exports = MetricService;
