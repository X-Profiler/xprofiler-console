'use strict';

const Controller = require('egg').Controller;

class TeamController extends Controller {
  async getMembers() {
    const { ctx, ctx: { service: { mysql } } } = this;
    const { appId } = ctx.query;
    const { userId: currentUserId } = ctx.user;

    // get owner & members
    const tasks = [];
    tasks.push(mysql.getAppByAppId(appId));
    tasks.push(mysql.getTeamMembersByAppId(appId));
    const [{ owner, gm_create }, members] = await Promise.all(tasks);

    // compose total list
    const list = members.map(member => {
      const { user: userId, status, gm_create } = member;
      return {
        userId, status,
        timestamp: new Date(gm_create).getTime(),
      };
    });
    list.push({
      userId: owner,
      status: 0, // 0: admin, 1: inviting, 2: joined
      timestamp: new Date(gm_create).getTime(),
    });

    // add user name
    let users = await mysql.getUserByUserIds(list.map(item => item.userId));
    users = users.reduce((map, user) => {
      map[user.id] = user;
      return map;
    }, {});
    list.forEach(item => {
      const { name, identity } = users[item.userId];
      item.userInfo = `${name} (${identity})`;
    });

    ctx.body = { ok: true, data: { list, currentUserId } };
  }

  async inviteMember() {
    const { ctx, ctx: { service: { mysql } } } = this;
    const { appId, userId: invitedUser } = ctx.request.body;
    const { userId: currentUserId } = ctx.user;

    const user = await mysql.getUserByIdentity(invitedUser);
    if (!user) {
      ctx.body = { ok: false, message: `用户 ${invitedUser} 不存在` };
      return;
    }
    if (user.id === currentUserId) {
      ctx.body = { ok: false, message: '您已经在团队中' };
      return;
    }

    try {
      await mysql.inviteMember(appId, user.id);
      ctx.body = { ok: true };
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        ctx.body = { ok: false, message: '不能重复邀请用户' };
        return;
      }
      ctx.body = { ok: false, message: '服务器错误，邀请失败，请重试' };
    }
  }
}

module.exports = TeamController;
