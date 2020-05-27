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
        webhook: webhookPush,
        wtype: webhookType,
        waddress: webhookAddress,
        wsign: webhookSign,
      } = strategy;

      const history = await alarm.getHistoryByPeriod(strategyId, 24 * 60);

      return {
        strategyId, contextType, pushType,
        expression, alarmContent, status,
        webhookPush: Boolean(webhookPush),
        webhookType, webhookAddress, webhookSign,
        alarmCount: history.length,
      };
    }, { concurrency: 2 });

    ctx.body = { ok: true, data: { list } };
  }

  async addStrategy() {
    const { ctx, ctx: { service: { mysql } } } = this;

    await mysql.addStrategy(ctx.request.body);

    ctx.body = { ok: true };
  }

  async updateStrategy() {
    const { ctx, ctx: { service: { mysql } } } = this;

    await mysql.updateStrategy(ctx.request.body);

    ctx.body = { ok: true };
  }

  async updateStrategyStatus() {
    const { ctx, ctx: { service: { mysql } } } = this;
    const { strategyId, status } = ctx.request.body;
    const { status: oldStatus } = ctx.strategy;

    if (Number(status) === Number(oldStatus)) {
      return (ctx.body = { ok: false, message: `此规则已经${oldStatus ? '启用' : '禁用'}` });
    }
    await mysql.updateStrategyStatus(strategyId, status);

    ctx.body = { ok: true };
  }

  async deleteStrategy() {
    const { ctx, ctx: { service: { mysql } } } = this;
    const { strategyId } = ctx.request.body;

    await mysql.deleteStrategyById(strategyId);

    ctx.body = { ok: true };
  }
}

module.exports = AlarmController;
