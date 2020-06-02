'use strict';

const pMap = require('p-map');
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
      const user = users[item.userId];
      if (!user) {
        item.userInfo = 'Unknown';
        return;
      }
      const { nick, identity } = user;
      item.userInfo = `${nick} (${identity})`;
    });

    ctx.body = { ok: true, data: { list, currentUserId } };
  }

  async inviteMember() {
    const { ctx, ctx: { service: { mysql } } } = this;
    const { appId, userId: invitedUser } = ctx.request.body;
    const { userId: currentUserId } = ctx.user;

    const [user, members] = await Promise.all([
      mysql.getUserByIdentity(invitedUser),
      mysql.getTeamMembersByAppId(appId),
    ]);
    if (!user) {
      ctx.body = { ok: false, message: `用户 ${invitedUser} 不存在` };
      return;
    }
    if (user.id === currentUserId) {
      ctx.body = { ok: false, message: '您已经在团队中' };
      return;
    }
    if (members.some(member => user.id === member.user)) {
      ctx.body = { ok: false, message: `用户 ${user.name} 已在团队中` };
      return;
    }

    const res = await ctx.tryCatch('mysql', 'inviteMember', [appId, user.id, 1], '不能重复邀请用户');
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

  async leaveTeam() {
    const { ctx, ctx: { service: { mysql } } } = this;
    const { appId } = ctx.request.body;
    const { userId } = ctx.user;

    await mysql.deleteMember(appId, userId);

    ctx.body = { ok: true };
  }

  async removeMember() {
    const { ctx, ctx: { service: { mysql } } } = this;
    const { appId, userId: invitedUser } = ctx.request.body;

    await mysql.deleteMember(appId, invitedUser);

    ctx.body = { ok: true };
  }

  async transferOwnership() {
    const { ctx, ctx: { service: { mysql } } } = this;
    const { appId, userId: transferringUser } = ctx.request.body;
    const { userId: currentUserId } = ctx.user;

    const tasks = [];
    tasks.push(mysql.updateAppOwner(appId, transferringUser));
    tasks.push(mysql.deleteMember(appId, transferringUser));
    tasks.push(mysql.inviteMember(appId, currentUserId, 2));
    await pMap(tasks, async func => {
      await func;
    }, { concurrency: 2 });

    ctx.body = { ok: true };
  }
}

module.exports = TeamController;
