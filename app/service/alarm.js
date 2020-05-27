'use strict';

const pMap = require('p-map');
const Service = require('egg').Service;

class AlarmService extends Service {
  async getHistoryByPeriod(strategyId, period) {
    const { ctx, ctx: { app, service: { mysql } } } = this;

    const periods = app.getPeriods(period);
    let list = await pMap(periods, async ({ date, start, end }) => {
      let data;
      try {
        data = await mysql.getAlarmHistory(`alarm_${date}`, strategyId, start, end);
      } catch (err) {
        ctx.logger.error(`getHistoryByPeriod failed: ${err}`);
      }
      return data;
    }, { concurrency: 2 });

    list = list
      .reverse()
      .filter(item => item)
      .reduce((list, item) => (list = list.concat(item)), []);

    return list;
  }
}

module.exports = AlarmService;
