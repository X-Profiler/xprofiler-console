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
    const users = await ctx.getUserMap(list.map(item => item.userId));
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

    const res = await ctx.tryCatch('mysql', 'inviteMember', [appId, user.id], '不能重复邀请用户');
    if (!res) {
      return;
    }
    ctx.body = { ok: true };
  }

  async updateInvitation() {
    const { ctx, ctx: { service: { mysql } } } = this;
    const { appId: invitedApp, status } = ctx.request.body;
    const { userId } = ctx.user;

    if (status) {
      await mysql.confirmInvitation(invitedApp, userId);
    } else {
      await mysql.deleteMember(invitedApp, userId);
    }

    ctx.body = { ok: true };
  }
}

module.exports = TeamController;
