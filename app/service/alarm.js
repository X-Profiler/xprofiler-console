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

  async getTotalContacts(appId) {
    const { ctx, ctx: { service: { mysql } } } = this;

    const tasks = [];
    tasks.push(mysql.getAppByAppId(appId));
    tasks.push(mysql.getTeamMembersByAppId(appId));
    const [{ owner }, members] = await Promise.all(tasks);
    const totalContacts = [owner].concat(members.map(({ user }) => user));
    const userMap = await ctx.getUserMap(totalContacts);

    return { totalContacts, userMap };
  }

  async checkUserInAppMembers(appId, userId) {
    const { ctx } = this;

    const { totalContacts, userMap } = await this.getTotalContacts(appId);
    if (!totalContacts.includes(userId)) {
      ctx.body = { ok: false, message: `用户 ${userMap[userId] && userMap[userId].nick || userId} 不在此应用成员列表中` };
      return false;
    }
    return true;
  }
}

module.exports = AlarmService;
