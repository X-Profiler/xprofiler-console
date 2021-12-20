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

  async getStrategyHistory() {
    const { ctx, ctx: { service: { alarm, mysql } } } = this;
    const { strategyId, currentPage, pageSize } = ctx.query;
    const { app: appInfo, context: contextType } = ctx.strategy;

    const start = (currentPage - 1) * pageSize;
    const end = currentPage * pageSize;
    const history = await alarm.getHistoryByPeriod(strategyId, 24 * 60);
    const { expression } = await mysql.getStrategyById(strategyId);
    const list = history
      .filter((...args) => args[1] >= start && args[1] < end)
      .map(log => {
        const {
          agent: agentId,
          gm_create: time,
          message: alarmContent,
          pid,
        } = log;

        let detailPath = '';
        switch (contextType) {
          case 'xprofiler_log':
            detailPath = `/app/${appInfo}/instance?tab=process&agentId=${agentId}&pid=${pid}`;
            break;
          case 'system_log':
            detailPath = `/app/${appInfo}/instance?tab=system&agentId=${agentId}`;
            break;
          case 'error_log':
            detailPath = `/app/${appInfo}/instance?tab=error_log&agentId=${agentId}`;
            break;
          case 'xtransit_notification':
            if (expression.includes('@core_count') || expression.includes('@core_count')) {
              detailPath = `/app/${appInfo}/file`;
            } else if (!pid) {
              detailPath = `/app/${appInfo}/instance?tab=module_risk&agentId=${agentId}`;
            }
            break;
          default:
            break;
        }

        return {
          appInfo, agentId, time,
          contextType, alarmContent,
          detailPath,
        };
      });
    const count = history.length;

    ctx.body = { ok: true, data: { list, count } };
  }

  async getStrategyContacts() {
    const { ctx, ctx: { service: { alarm, mysql } } } = this;
    const { strategyId } = ctx.query;
    const { app } = ctx.strategy;

    const tasks = [];
    tasks.push(mysql.getContactsByStrategyId(strategyId));
    tasks.push(alarm.getTotalContacts(app));
    const [contacts, { totalContacts, userMap }] = await Promise.all(tasks);
    const remainMembers = totalContacts.filter(user => contacts.every(({ user: contact }) => user !== contact));

    ctx.body = {
      ok: true,
      data: {
        contacts: contacts.map(({ user: userId }) => ({ userId, userInfo: userMap[userId] && userMap[userId].nick })),
        remainMembers: remainMembers.map(userId => ({ userId, userInfo: userMap[userId] && userMap[userId].nick })),
      },
    };
  }

  async addContactToStrategy() {
    const { ctx, ctx: { service: { alarm, mysql } } } = this;
    const { strategyId, userId } = ctx.request.body;
    const { app } = ctx.strategy;

    if (!await alarm.checkUserInAppMembers(app, userId)) {
      return;
    }
    await mysql.addContactToStrategy(strategyId, userId);

    ctx.body = { ok: true };
  }

  async deleteContactFromStrategy() {
    const { ctx, ctx: { service: { alarm, mysql } } } = this;
    const { strategyId, userId } = ctx.request.body;
    const { app } = ctx.strategy;

    if (!await alarm.checkUserInAppMembers(app, userId)) {
      return;
    }
    await mysql.deleteContactFromStrategy(strategyId, userId);

    ctx.body = { ok: true };
  }
}

module.exports = AlarmController;
