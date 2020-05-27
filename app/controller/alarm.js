'use strict';

const pMap = require('p-map');
const Controller = require('egg').Controller;

class AlarmController extends Controller {
  async getStrategies() {
    const { ctx, ctx: { service: { mysql, alarm } } } = this;
    const { appId } = ctx.query;

    const strategies = await mysql.getStrategiesByAppId(appId);
    const list = await pMap(strategies, async strategy => {
      const {
        id: strategyId,
        context: contextType,
        push: pushType,
        expression,
        content: alarmContent,
        status,
      } = strategy;

      const history = await alarm.getHistoryByPeriod(strategyId, 24 * 60);

      return {
        strategyId, contextType, pushType,
        expression, alarmContent, status,
        alarmCount: history.length,
      };
    }, { concurrency: 2 });

    ctx.body = { ok: true, data: { list } };
  }
}

module.exports = AlarmController;
